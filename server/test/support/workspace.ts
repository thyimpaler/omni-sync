/**
 * A workspace to receive webhooks into: one connected WhatsApp number, the SLA
 * policies from the Settings screen, and 08:00–20:00 Monday to Friday.
 */

import { createHmac } from 'node:crypto';

import type { Database } from '../../src/db.ts';

export interface Workspace {
    id: string;
    channelId: string;
    /** What Meta calls the receiving number: `metadata.phone_number_id`. */
    phoneNumberId: string;
    vipPolicyId: string;
    standardPolicyId: string;
    agent: string;
    viewer: string;
    lead: string;
}

export async function createWorkspace(
    db: Database,
    options: { slug?: string; isDemo?: boolean; timezone?: string } = {}
): Promise<Workspace> {
    const slug = options.slug ?? 'northfield';

    const [workspace] = await db.query<{ id: string }>(
        `insert into workspaces (name, slug, timezone, is_demo)
         values ($1, $2, $3, $4) returning id`,
        ['Northfield Supply Co.', slug, options.timezone ?? 'Europe/London', options.isDemo ?? false]
    );
    const workspaceId = workspace!.id;

    const people: Record<string, string> = {};
    for (const [key, role] of [
        ['agent', 'agent'],
        ['viewer', 'viewer'],
        ['lead', 'admin'],
    ] as const) {
        const [user] = await db.query<{ id: string }>(
            'insert into auth.users (email) values ($1) returning id',
            [`${key}@${slug}.test`]
        );
        await db.query(
            `insert into memberships (workspace_id, user_id, role, display_name)
             values ($1, $2, $3::membership_role, $4)`,
            [workspaceId, user!.id, role, key]
        );
        people[key] = user!.id;
    }

    const [channel] = await db.query<{ id: string }>(
        `insert into channels (workspace_id, type, display_name, external_id, credentials_ref,
                               status, connected_at)
         values ($1, 'whatsapp', 'Northfield WhatsApp', $2, $3, 'connected', now())
         returning id`,
        [workspaceId, `phone-${slug}`, `secret://channels/${slug}`]
    );

    await db.query(
        `insert into business_hours (workspace_id, weekday, opens_at, closes_at)
         select $1, weekday, time '08:00', time '20:00' from generate_series(1, 5) as weekday`,
        [workspaceId]
    );

    // Two policies, matched top to bottom: the VIP delivery rule, then a
    // catch-all — the shape the Settings screen shows.
    const [vip] = await db.query<{ id: string }>(
        `insert into policies (workspace_id, position, name, conditions,
                               first_response_target_seconds, resolution_target_seconds,
                               escalates_to)
         values ($1, 1, 'VIP delivery', '{"tags":["vip"],"keywords":["delivery","order"]}'::jsonb,
                 300, 14400, $2)
         returning id`,
        [workspaceId, people.lead]
    );

    const [standard] = await db.query<{ id: string }>(
        `insert into policies (workspace_id, position, name, first_response_target_seconds,
                               resolution_target_seconds)
         values ($1, 2, 'Everything else', 1800, 86400)
         returning id`,
        [workspaceId]
    );

    return {
        id: workspaceId,
        channelId: channel!.id,
        phoneNumberId: `phone-${slug}`,
        vipPolicyId: vip!.id,
        standardPolicyId: standard!.id,
        agent: people.agent!,
        viewer: people.viewer!,
        lead: people.lead!,
    };
}

/** Marks a customer as a VIP, so the first policy matches them. */
export async function tagCustomer(
    db: Database,
    workspaceId: string,
    handle: string,
    tags: string[]
): Promise<void> {
    await db.query(
        `insert into customers (workspace_id, external_handle, tags)
         values ($1, $2, $3)
         on conflict (workspace_id, external_handle) do update set tags = excluded.tags`,
        [workspaceId, handle, tags]
    );
}

/** A Supabase-shaped session token, signed the way Supabase signs them. */
export function accessToken(
    userId: string,
    secret: string,
    options: { expiresInSeconds?: number } = {}
): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
        JSON.stringify({
            sub: userId,
            role: 'authenticated',
            exp: Math.floor(Date.now() / 1000) + (options.expiresInSeconds ?? 3600),
        })
    ).toString('base64url');
    const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${signature}`;
}

/** A WhatsApp Cloud API inbound-message delivery. */
export function inboundPayload(options: {
    phoneNumberId: string;
    from: string;
    text: string;
    messageId: string;
    sentAt: Date;
    profileName?: string;
}): unknown {
    return {
        object: 'whatsapp_business_account',
        entry: [
            {
                id: 'business-account-id',
                changes: [
                    {
                        field: 'messages',
                        value: {
                            messaging_product: 'whatsapp',
                            metadata: {
                                display_phone_number: '447700900000',
                                phone_number_id: options.phoneNumberId,
                            },
                            contacts: [
                                {
                                    profile: { name: options.profileName ?? 'Dami' },
                                    wa_id: options.from,
                                },
                            ],
                            messages: [
                                {
                                    from: options.from,
                                    id: options.messageId,
                                    timestamp: String(Math.floor(options.sentAt.getTime() / 1000)),
                                    type: 'text',
                                    text: { body: options.text },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    };
}
