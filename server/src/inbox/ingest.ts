/**
 * What happens to an inbound message between Meta and the inbox: find the
 * channel, find or open a conversation, store the message once, and start the
 * clocks if this is the first time the customer has written.
 */

import type { Database } from '../db.ts';
import type { DeliveryUpdate, InboundMessage } from '../meta/payload.ts';
import { startClocks } from '../sla/engine.ts';

export type IngestResult =
    | { status: 'stored'; workspaceId: string; conversationId: string; clocksStarted: boolean }
    | { status: 'duplicate'; workspaceId: string; conversationId: string }
    | { status: 'unknown-channel' };

interface ChannelRow {
    id: string;
    workspace_id: string;
    type: string;
}

/** A subject line the queue can show before anyone has read the thread. */
function subjectFrom(text: string): string {
    const firstLine = text.split('\n')[0]?.trim() ?? '';
    if (firstLine.length === 0) return 'New conversation';
    return firstLine.length > 70 ? `${firstLine.slice(0, 69)}…` : firstLine;
}

export async function ingestInbound(db: Database, message: InboundMessage): Promise<IngestResult> {
    return db.transaction(async (tx) => {
        const [channel] = await tx.query<ChannelRow>(
            `select id, workspace_id, type from channels
             where external_id = $1 and status <> 'disconnected'`,
            [message.channelExternalId]
        );

        // A delivery for a number nobody has connected. Acknowledged and
        // dropped: retrying it would never succeed.
        if (!channel) return { status: 'unknown-channel' as const };

        const [customer] = await tx.query<{ id: string; tags: string[] }>(
            `insert into customers (workspace_id, external_handle, name, first_seen_at)
             values ($1, $2, $3, $4)
             on conflict (workspace_id, external_handle) do update
                 set name = coalesce(excluded.name, customers.name)
             returning id, tags`,
            [channel.workspace_id, message.from, message.profileName, message.sentAt]
        );

        // One open thread per customer per channel: a follow-up joins the
        // conversation already in front of an agent rather than starting a
        // second one behind it.
        const [existing] = await tx.query<{ id: string; first_inbound_at: Date | null }>(
            `select id, first_inbound_at from conversations
             where workspace_id = $1 and customer_id = $2 and channel_id = $3
               and status <> 'resolved'
             order by created_at desc
             limit 1`,
            [channel.workspace_id, customer!.id, channel.id]
        );

        const conversation =
            existing ??
            (
                await tx.query<{ id: string; first_inbound_at: Date | null }>(
                    `insert into conversations (workspace_id, customer_id, channel_id, subject)
                     values ($1, $2, $3, $4)
                     returning id, first_inbound_at`,
                    [channel.workspace_id, customer!.id, channel.id, subjectFrom(message.text)]
                )
            )[0]!;

        const stored = await tx.query<{ id: string }>(
            `insert into messages (workspace_id, conversation_id, direction, body,
                                   provider_message_id, sent_at)
             values ($1, $2, 'inbound', $3, $4, $5)
             -- The dedupe index is partial, so the predicate has to be
             -- repeated here for Postgres to infer it.
             on conflict (workspace_id, provider_message_id)
                 where provider_message_id is not null
             do nothing
             returning id`,
            [channel.workspace_id, conversation.id, message.text, message.providerMessageId, message.sentAt]
        );

        // Meta redelivers anything it did not get a 2xx for, so this is the
        // normal path for a retry, not an error.
        if (stored.length === 0) {
            return {
                status: 'duplicate' as const,
                workspaceId: channel.workspace_id,
                conversationId: conversation.id,
            };
        }

        // Only the first inbound message starts a clock; the trigger in
        // 20260901000200_functions.sql has already set first_inbound_at by now,
        // so the decision is made on what it read before the insert.
        const clocksStarted = conversation.first_inbound_at === null;
        if (clocksStarted) {
            await startClocks(tx, {
                workspaceId: channel.workspace_id,
                conversationId: conversation.id,
                subject: {
                    tags: customer!.tags,
                    channel: channel.type,
                    text: message.text,
                },
                from: message.sentAt,
            });
        }

        return {
            status: 'stored' as const,
            workspaceId: channel.workspace_id,
            conversationId: conversation.id,
            clocksStarted,
        };
    });
}

/** Delivery receipts for messages this workspace sent. */
export async function applyDeliveryStatus(db: Database, update: DeliveryUpdate): Promise<boolean> {
    const updated = await db.query<{ id: string }>(
        `update messages m
         set delivery_status = $1
         from channels ch, conversations c
         where m.provider_message_id = $2
           and c.id = m.conversation_id
           and ch.id = c.channel_id
           and ch.external_id = $3
           and m.direction = 'outbound'
         returning m.id`,
        [update.status, update.providerMessageId, update.channelExternalId]
    );
    return updated.length > 0;
}
