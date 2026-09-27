/**
 * The HTTP surface: three things a browser must not be trusted to do.
 *
 *   GET  /health                             is the service up
 *   GET  /webhooks/meta                      Meta's subscription handshake
 *   POST /webhooks/meta                      inbound messages and receipts
 *   POST /api/conversations/:id/reply        the only path to a customer
 */

import Fastify, { type FastifyInstance } from 'fastify';

import { atLeast, bearerToken, verifyAccessToken } from './auth.ts';
import { ChannelSendError, type ChannelClient } from './channels.ts';
import type { Config } from './config.ts';
import type { Database } from './db.ts';
import { applyDeliveryStatus, ingestInbound } from './inbox/ingest.ts';
import { parseDelivery } from './meta/payload.ts';
import { verifySignature } from './meta/signature.ts';

declare module 'fastify' {
    interface FastifyRequest {
        /** The bytes Meta signed. Parsed JSON cannot stand in for them. */
        rawBody?: Buffer;
    }
}

export interface AppOptions {
    db: Database;
    config: Config;
    channels: ChannelClient;
}

interface ReplyTarget {
    workspace_id: string;
    status: string;
    is_demo: boolean;
    role: string | null;
    channel_type: string;
    channel_external_id: string | null;
    credentials_ref: string | null;
    external_handle: string;
}

export function buildApp({ db, config, channels }: AppOptions): FastifyInstance {
    const app = Fastify({ logger: { level: config.logLevel } });

    // Keeps the raw body alongside the parsed one: re-serialising JSON changes
    // the bytes, and the signature is over the bytes.
    app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (request, body, done) => {
        const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
        request.rawBody = buffer;
        if (buffer.length === 0) return done(null, {});
        try {
            done(null, JSON.parse(buffer.toString('utf8')) as unknown);
        } catch (error) {
            done(error as Error, undefined);
        }
    });

    app.get('/health', async () => {
        await db.query('select 1');
        return { status: 'ok' };
    });

    // Meta's subscription handshake: echo the challenge, but only to someone
    // who knows the verify token.
    app.get('/webhooks/meta', async (request, reply) => {
        const query = request.query as Record<string, string | undefined>;
        if (
            query['hub.mode'] === 'subscribe' &&
            query['hub.verify_token'] === config.metaVerifyToken &&
            query['hub.challenge']
        ) {
            return reply.type('text/plain').send(query['hub.challenge']);
        }
        return reply.code(403).send({ error: 'verification failed' });
    });

    app.post('/webhooks/meta', async (request, reply) => {
        const signature = request.headers['x-hub-signature-256'];
        const valid = verifySignature(
            request.rawBody ?? Buffer.alloc(0),
            typeof signature === 'string' ? signature : undefined,
            config.metaAppSecret
        );

        // Unsigned or wrongly signed: not from Meta, and never reaches the
        // database. 403 rather than 401 — there is no credential to retry with.
        if (!valid) {
            request.log.warn('rejected a webhook delivery with an invalid signature');
            return reply.code(403).send({ error: 'invalid signature' });
        }

        const { messages, statuses } = parseDelivery(request.body);
        let stored = 0;
        let duplicates = 0;
        let unknown = 0;

        for (const message of messages) {
            const result = await ingestInbound(db, message);
            if (result.status === 'stored') stored += 1;
            else if (result.status === 'duplicate') duplicates += 1;
            else unknown += 1;
        }

        for (const status of statuses) {
            await applyDeliveryStatus(db, status);
        }

        request.log.info(
            { stored, duplicates, unknown, receipts: statuses.length },
            'processed a webhook delivery'
        );

        // Always 200 once the signature checks out: a non-2xx makes Meta
        // redeliver, and the dedupe index means a redelivery of something we
        // already stored is pointless work.
        return reply.code(200).send({ stored, duplicates, unknown });
    });

    app.post<{ Params: { id: string }; Body: { text?: unknown } }>(
        '/api/conversations/:id/reply',
        async (request, reply) => {
            const session = verifyAccessToken(
                bearerToken(request.headers.authorization),
                config.supabaseJwtSecret
            );
            if (!session) return reply.code(401).send({ error: 'sign in again' });

            const text = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
            if (text.length === 0) return reply.code(400).send({ error: 'a reply needs words' });

            const [target] = await db.query<ReplyTarget>(
                `select c.workspace_id, c.status, w.is_demo, m.role,
                        ch.type as channel_type, ch.external_id as channel_external_id,
                        ch.credentials_ref, cu.external_handle
                 from conversations c
                 join workspaces w on w.id = c.workspace_id
                 join channels ch on ch.id = c.channel_id
                 join customers cu on cu.id = c.customer_id
                 left join memberships m
                     on m.workspace_id = c.workspace_id and m.user_id = $2
                 where c.id = $1`,
                [request.params.id, session.userId]
            );

            // A conversation in someone else's workspace is indistinguishable
            // from one that does not exist.
            if (!target || !target.role) return reply.code(404).send({ error: 'not found' });

            if (!atLeast(target.role, 'agent')) {
                return reply.code(403).send({ error: 'your role cannot send replies' });
            }

            if (target.is_demo) {
                return reply.code(403).send({ error: 'the example workspace does not send real messages' });
            }

            // Recorded before the send, so an attempt that fails at the
            // provider still leaves a trace with a delivery status to match.
            const [message] = await db.query<{ id: string }>(
                `insert into messages (workspace_id, conversation_id, direction, sender_id,
                                       body, delivery_status)
                 values ($1, $2, 'outbound', $3, $4, 'queued')
                 returning id`,
                [target.workspace_id, request.params.id, session.userId, text]
            );

            await db.query(
                `insert into audit_log (workspace_id, actor_id, action, entity_type, entity_id, detail)
                 values ($1, $2, 'message.sent', 'conversation', $3, $4)`,
                [
                    target.workspace_id,
                    session.userId,
                    request.params.id,
                    JSON.stringify({ messageId: message!.id, characters: text.length }),
                ]
            );

            try {
                const sent = await channels.sendText({
                    channelType: target.channel_type,
                    channelExternalId: target.channel_external_id ?? '',
                    credentialsRef: target.credentials_ref,
                    to: target.external_handle,
                    text,
                });

                await db.query(
                    `update messages set delivery_status = 'sent', provider_message_id = $1
                     where id = $2`,
                    [sent.providerMessageId, message!.id]
                );

                return reply.code(202).send({ id: message!.id, status: 'sent' });
            } catch (error) {
                await db.query(`update messages set delivery_status = 'failed' where id = $1`, [message!.id]);
                request.log.error({ err: error }, 'outbound send failed');

                const status = error instanceof ChannelSendError ? error.status : 502;
                return reply.code(status >= 500 ? status : 502).send({ id: message!.id, status: 'failed' });
            }
        }
    );

    return app;
}
