/**
 * plan.md's proof for phase 2: post a synthetic Meta webhook and assert a
 * conversation, a message and an `sla_state` row appear with the right due_at
 * across a business-hours boundary.
 *
 * Everything below runs against real Postgres with the real migrations applied,
 * through the real HTTP surface.
 */

import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.ts';
import { recordingClient } from '../src/channels.ts';
import type { Config } from '../src/config.ts';
import { sign } from '../src/meta/signature.ts';
import { testDatabase, type TestDatabase } from './support/database.ts';
import { createWorkspace, inboundPayload, tagCustomer, type Workspace } from './support/workspace.ts';

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
let workspace: Workspace;

beforeAll(async () => {
    db = await testDatabase();
    workspace = await createWorkspace(db);
    app = buildApp({ db, config, channels: recordingClient() });
    await app.ready();
});

afterAll(async () => {
    await app.close();
    await db.close();
});

/** Posts a payload with the signature Meta would have put on it. */
async function deliver(payload: unknown, options: { signature?: string } = {}) {
    const raw = JSON.stringify(payload);
    return app.inject({
        method: 'POST',
        url: '/webhooks/meta',
        headers: {
            'content-type': 'application/json',
            'x-hub-signature-256': options.signature ?? sign(raw, config.metaAppSecret),
        },
        payload: raw,
    });
}

describe('the subscription handshake', () => {
    it('echoes the challenge to someone who knows the verify token', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/webhooks/meta?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=1158201444',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('1158201444');
    });

    it('refuses someone who does not', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/webhooks/meta?hub.mode=subscribe&hub.verify_token=guess&hub.challenge=1158201444',
        });
        expect(response.statusCode).toBe(403);
    });
});

describe('an unsigned delivery', () => {
    it('is refused and stores nothing', async () => {
        const before = await db.query<{ n: number }>('select count(*)::int n from messages');

        const response = await deliver(
            inboundPayload({
                phoneNumberId: workspace.phoneNumberId,
                from: '447700900123',
                text: 'let me in',
                messageId: 'wamid.forged',
                sentAt: new Date(),
            }),
            { signature: 'sha256=0000000000000000000000000000000000000000000000000000000000000000' }
        );

        expect(response.statusCode).toBe(403);
        const after = await db.query<{ n: number }>('select count(*)::int n from messages');
        expect(after[0]!.n).toBe(before[0]!.n);
    });
});

describe('a VIP writing after hours', () => {
    // Friday 16 January 2026, 19:58 London. Two minutes of the working day
    // left, and a five-minute first-response target.
    const sentAt = new Date('2026-01-16T19:58:00Z');
    const handle = '447700900001';

    beforeAll(async () => {
        await tagCustomer(db, workspace.id, handle, ['vip']);
        const response = await deliver(
            inboundPayload({
                phoneNumberId: workspace.phoneNumberId,
                from: handle,
                text: 'Where is my delivery? Order NF-4471.',
                messageId: 'wamid.first',
                sentAt,
                profileName: 'Dami',
            })
        );
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ stored: 1, duplicates: 0, unknown: 0 });
    });

    it('opens a conversation on the right channel', async () => {
        const [conversation] = await db.query<{
            subject: string;
            status: string;
            policy_id: string;
            first_inbound_at: Date;
            channel_id: string;
        }>(
            `select subject, status, policy_id, first_inbound_at, channel_id
             from conversations where workspace_id = $1 order by created_at desc limit 1`,
            [workspace.id]
        );

        expect(conversation!.status).toBe('open');
        expect(conversation!.subject).toBe('Where is my delivery? Order NF-4471.');
        expect(conversation!.channel_id).toBe(workspace.channelId);
        expect(conversation!.first_inbound_at).toEqual(sentAt);
        // The VIP delivery policy, not the catch-all.
        expect(conversation!.policy_id).toBe(workspace.vipPolicyId);
    });

    it('stores the message with the provider id it arrived under', async () => {
        const [message] = await db.query<{
            body: string;
            direction: string;
            provider_message_id: string;
            sender_id: string | null;
        }>(
            `select body, direction, provider_message_id, sender_id
             from messages where provider_message_id = 'wamid.first'`
        );

        expect(message!.direction).toBe('inbound');
        expect(message!.sender_id).toBeNull();
        expect(message!.body).toBe('Where is my delivery? Order NF-4471.');
    });

    it('names the customer from the contact profile', async () => {
        const [customer] = await db.query<{ name: string; tags: string[] }>(
            'select name, tags from customers where workspace_id = $1 and external_handle = $2',
            [workspace.id, handle]
        );
        expect(customer!.name).toBe('Dami');
        expect(customer!.tags).toEqual(['vip']);
    });

    it('starts both clocks, carrying the target over the weekend', async () => {
        const clocks = await db.query<{ kind: string; due_at: Date; policy_id: string }>(
            `select s.kind, s.due_at, s.policy_id
             from sla_state s
             join messages m on m.conversation_id = s.conversation_id
             where m.provider_message_id = 'wamid.first'
             order by s.kind`,
            []
        );

        const due = Object.fromEntries(clocks.map((clock) => [clock.kind, clock.due_at]));

        // Five minutes: two before Friday's 20:00 close, three after Monday's
        // 08:00 open. Not 20:03 on Friday.
        expect(due.first_response?.toISOString()).toBe('2026-01-19T08:03:00.000Z');
        // Four working hours from 19:58 Friday: two minutes on Friday, then
        // Monday morning until 11:58.
        expect(due.resolution?.toISOString()).toBe('2026-01-19T11:58:00.000Z');
    });

    it('writes the rule banner the thread shows', async () => {
        const [event] = await db.query<{ rule: string; effect: string }>(
            `select r.rule, r.effect
             from rule_events r
             join messages m on m.conversation_id = r.conversation_id
             where m.provider_message_id = 'wamid.first'`
        );
        expect(event!.rule).toBe('vip + delivery keyword + order keyword');
        expect(event!.effect).toBe('VIP delivery applied');
    });
});

describe('redelivery', () => {
    it('is acknowledged without storing the message twice', async () => {
        const payload = inboundPayload({
            phoneNumberId: workspace.phoneNumberId,
            from: '447700900001',
            text: 'Where is my delivery? Order NF-4471.',
            messageId: 'wamid.first',
            sentAt: new Date('2026-01-16T19:58:00Z'),
        });

        const response = await deliver(payload);

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ stored: 0, duplicates: 1, unknown: 0 });

        const [count] = await db.query<{ n: number }>(
            `select count(*)::int n from messages where provider_message_id = 'wamid.first'`
        );
        expect(count!.n).toBe(1);
    });
});

describe('a follow-up message', () => {
    it('joins the open thread rather than starting a second one', async () => {
        const [before] = await db.query<{ n: number }>(
            'select count(*)::int n from conversations where workspace_id = $1',
            [workspace.id]
        );

        await deliver(
            inboundPayload({
                phoneNumberId: workspace.phoneNumberId,
                from: '447700900001',
                text: 'Still waiting.',
                messageId: 'wamid.second',
                sentAt: new Date('2026-01-16T19:59:00Z'),
            })
        );

        const [after] = await db.query<{ n: number }>(
            'select count(*)::int n from conversations where workspace_id = $1',
            [workspace.id]
        );
        expect(after!.n).toBe(before!.n);
    });

    it('does not restart a clock that is already running', async () => {
        const clocks = await db.query<{ due_at: Date }>(
            `select s.due_at from sla_state s
             join messages m on m.conversation_id = s.conversation_id
             where m.provider_message_id = 'wamid.second' and s.kind = 'first_response'`
        );
        expect(clocks[0]!.due_at.toISOString()).toBe('2026-01-19T08:03:00.000Z');
    });
});

describe('a delivery for a number nobody connected', () => {
    it('is acknowledged and dropped', async () => {
        const response = await deliver(
            inboundPayload({
                phoneNumberId: 'phone-belonging-to-nobody',
                from: '447700900999',
                text: 'hello?',
                messageId: 'wamid.orphan',
                sentAt: new Date(),
            })
        );

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ stored: 0, duplicates: 0, unknown: 1 });
    });
});

describe('a customer with no VIP tag', () => {
    it('gets the catch-all policy and its half-hour target', async () => {
        await deliver(
            inboundPayload({
                phoneNumberId: workspace.phoneNumberId,
                from: '447700900777',
                text: 'Do you ship to Jersey?',
                messageId: 'wamid.standard',
                sentAt: new Date('2026-01-14T11:00:00Z'),
            })
        );

        const [clock] = await db.query<{ due_at: Date; policy_id: string }>(
            `select s.due_at, s.policy_id from sla_state s
             join messages m on m.conversation_id = s.conversation_id
             where m.provider_message_id = 'wamid.standard' and s.kind = 'first_response'`
        );

        expect(clock!.policy_id).toBe(workspace.standardPolicyId);
        expect(clock!.due_at.toISOString()).toBe('2026-01-14T11:30:00.000Z');
    });
});
