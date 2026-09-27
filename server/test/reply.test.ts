/**
 * The outbound path, which exists to enforce one sentence from plan.md: nothing
 * is sent to a customer without an agent pressing send. Everything below is a
 * way of trying to get around that.
 */

import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.ts';
import { ChannelSendError, recordingClient, type RecordingClient } from '../src/channels.ts';
import type { Config } from '../src/config.ts';
import type { Database } from '../src/db.ts';
import { testDatabase, type TestDatabase } from './support/database.ts';
import { accessToken, createWorkspace, type Workspace } from './support/workspace.ts';

const config: Config = {
    port: 0,
    host: '127.0.0.1',
    databaseUrl: 'unused',
    metaAppSecret: 'app-secret',
    metaVerifyToken: 'verify-me',
    supabaseJwtSecret: 'jwt-secret',
    metaGraphUrl: null,
    logLevel: 'silent',
};

let db: TestDatabase;
let app: FastifyInstance;
let channels: RecordingClient;
let northfield: Workspace;
let rival: Workspace;
let conversationId: string;
let rivalConversationId: string;

async function openConversation(workspace: Workspace, handle: string): Promise<string> {
    const [customer] = await db.query<{ id: string }>(
        `insert into customers (workspace_id, external_handle, name) values ($1, $2, 'Dami')
         returning id`,
        [workspace.id, handle]
    );
    const [conversation] = await db.query<{ id: string }>(
        `insert into conversations (workspace_id, customer_id, channel_id, subject)
         values ($1, $2, $3, 'Where is my order?') returning id`,
        [workspace.id, customer!.id, workspace.channelId]
    );
    return conversation!.id;
}

function reply(id: string, token: string | null, text: unknown = 'On its way today.') {
    return app.inject({
        method: 'POST',
        url: `/api/conversations/${id}/reply`,
        headers: token ? { authorization: `Bearer ${token}` } : {},
        payload: { text },
    });
}

beforeAll(async () => {
    db = await testDatabase();
    northfield = await createWorkspace(db, { slug: 'northfield' });
    rival = await createWorkspace(db, { slug: 'rival' });
    conversationId = await openConversation(northfield, '447700900001');
    rivalConversationId = await openConversation(rival, '447700900002');

    channels = recordingClient();
    app = buildApp({ db, config, channels });
    await app.ready();
});

afterAll(async () => {
    await app.close();
    await db.close();
});

describe('a session the service cannot verify', () => {
    it('is refused without a token', async () => {
        expect((await reply(conversationId, null)).statusCode).toBe(401);
    });

    it('is refused with a token signed by someone else', async () => {
        const forged = accessToken(northfield.agent, 'not-the-projects-secret');
        expect((await reply(conversationId, forged)).statusCode).toBe(401);
    });

    it('is refused with an expired token', async () => {
        const stale = accessToken(northfield.agent, config.supabaseJwtSecret, {
            expiresInSeconds: -60,
        });
        expect((await reply(conversationId, stale)).statusCode).toBe(401);
    });

    it('is refused with a token that claims no algorithm', async () => {
        // `alg: none` is the classic way in, so it is worth asserting rather
        // than assuming.
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
        const payload = Buffer.from(
            JSON.stringify({ sub: northfield.agent, exp: Math.floor(Date.now() / 1000) + 600 })
        ).toString('base64url');
        expect((await reply(conversationId, `${header}.${payload}.`)).statusCode).toBe(401);
    });
});

describe('a verified session', () => {
    it('cannot reply into another workspace, and cannot tell it exists', async () => {
        const token = accessToken(northfield.agent, config.supabaseJwtSecret);
        const response = await reply(rivalConversationId, token);
        expect(response.statusCode).toBe(404);
    });

    it('cannot reply as a viewer', async () => {
        const token = accessToken(northfield.viewer, config.supabaseJwtSecret);
        const response = await reply(conversationId, token);
        expect(response.statusCode).toBe(403);
    });

    it('cannot send an empty message', async () => {
        const token = accessToken(northfield.agent, config.supabaseJwtSecret);
        expect((await reply(conversationId, token, '   ')).statusCode).toBe(400);
        expect((await reply(conversationId, token, 42)).statusCode).toBe(400);
    });

    it('cannot send from a user who is a member of nothing', async () => {
        const [stranger] = await db.query<{ id: string }>(
            `insert into auth.users (email) values ('stranger@example.test') returning id`
        );
        const token = accessToken(stranger!.id, config.supabaseJwtSecret);
        expect((await reply(conversationId, token)).statusCode).toBe(404);
    });
});

describe('an agent pressing send', () => {
    it('reaches the customer, in their own name', async () => {
        const token = accessToken(northfield.agent, config.supabaseJwtSecret);
        const response = await reply(conversationId, token, 'With the courier now.');

        expect(response.statusCode).toBe(202);
        expect(response.json()).toMatchObject({ status: 'sent' });

        const [message] = await db.query<{
            direction: string;
            sender_id: string;
            body: string;
            delivery_status: string;
            provider_message_id: string | null;
        }>(
            `select direction, sender_id, body, delivery_status, provider_message_id
             from messages where id = $1`,
            [response.json().id]
        );

        expect(message!.direction).toBe('outbound');
        expect(message!.sender_id).toBe(northfield.agent);
        expect(message!.delivery_status).toBe('sent');
        expect(message!.provider_message_id).not.toBeNull();

        const sent = channels.sent.at(-1);
        expect(sent?.text).toBe('With the courier now.');
        expect(sent?.to).toBe('447700900001');
        expect(sent?.channelExternalId).toBe(northfield.phoneNumberId);
    });

    it('leaves an audit entry naming the agent', async () => {
        const [entry] = await db.query<{ action: string; actor_id: string }>(
            `select action, actor_id from audit_log
             where workspace_id = $1 and action = 'message.sent'
             order by created_at desc limit 1`,
            [northfield.id]
        );
        expect(entry!.actor_id).toBe(northfield.agent);
    });

    it('stops the first-response clock', async () => {
        // Set up a thread with a customer message and a running clock, then
        // reply through the endpoint.
        const [inbound] = await db.query<{ id: string }>(
            `insert into messages (workspace_id, conversation_id, direction, body, sent_at)
             values ($1, $2, 'inbound', 'Hello?', now() - interval '2 minutes') returning id`,
            [northfield.id, conversationId]
        );
        expect(inbound).toBeDefined();

        await db.query(
            `insert into sla_state (workspace_id, conversation_id, kind, policy_id, due_at)
             values ($1, $2, 'first_response', $3, now() + interval '5 minutes')
             on conflict (conversation_id, kind) do nothing`,
            [northfield.id, conversationId, northfield.vipPolicyId]
        );

        const token = accessToken(northfield.agent, config.supabaseJwtSecret);
        await reply(conversationId, token, 'Looking into it now.');

        const [clock] = await db.query<{ satisfied_at: Date | null }>(
            `select satisfied_at from sla_state
             where conversation_id = $1 and kind = 'first_response'`,
            [conversationId]
        );
        expect(clock!.satisfied_at).not.toBeNull();
    });
});

describe('the example workspace', () => {
    it('records nothing to a real handset', async () => {
        const demo = await createWorkspace(db, { slug: 'example', isDemo: true });
        const demoConversation = await openConversation(demo, '447700900003');
        const token = accessToken(demo.agent, config.supabaseJwtSecret);

        const response = await reply(demoConversation, token);

        expect(response.statusCode).toBe(403);
        expect(response.json().error).toMatch(/example workspace/i);
    });
});

describe('when the provider refuses the message', () => {
    it('keeps the attempt and marks it failed', async () => {
        const failing: Database = db;
        const brokenApp = buildApp({
            db: failing,
            config,
            channels: {
                sendText: async () => {
                    throw new ChannelSendError('provider is down', 503);
                },
            },
        });
        await brokenApp.ready();

        const token = accessToken(northfield.agent, config.supabaseJwtSecret);
        const response = await brokenApp.inject({
            method: 'POST',
            url: `/api/conversations/${conversationId}/reply`,
            headers: { authorization: `Bearer ${token}` },
            payload: { text: 'This one will not land.' },
        });

        expect(response.statusCode).toBe(503);
        expect(response.json().status).toBe('failed');

        const [message] = await db.query<{ delivery_status: string }>(
            'select delivery_status from messages where id = $1',
            [response.json().id]
        );
        // The agent's attempt is still on the record: a failed send is not a
        // send that never happened.
        expect(message!.delivery_status).toBe('failed');

        await brokenApp.close();
    });
});
