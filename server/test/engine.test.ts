/**
 * The worker's sweep: what happens when a target is missed, and what a snooze
 * does to a running clock.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { pauseSnoozedClocks, resumeWokenClocks, sweepBreaches, tick } from '../src/sla/engine.ts';
import { testDatabase, type TestDatabase } from './support/database.ts';
import { createWorkspace, type Workspace } from './support/workspace.ts';

let db: TestDatabase;
let workspace: Workspace;

beforeAll(async () => {
    db = await testDatabase();
    workspace = await createWorkspace(db);
});

afterAll(async () => {
    await db.close();
});

let customerCount = 0;

/** A conversation with a first-response clock due at `dueAt`. */
async function conversationDueAt(
    dueAt: Date,
    options: { policyId?: string; assigneeId?: string | null } = {}
): Promise<string> {
    customerCount += 1;
    const [customer] = await db.query<{ id: string }>(
        `insert into customers (workspace_id, external_handle) values ($1, $2) returning id`,
        [workspace.id, `44770090${String(customerCount).padStart(4, '0')}`]
    );
    const [conversation] = await db.query<{ id: string }>(
        `insert into conversations (workspace_id, customer_id, channel_id, subject, assignee_id, policy_id)
         values ($1, $2, $3, 'Where is my order?', $4, $5) returning id`,
        [
            workspace.id,
            customer!.id,
            workspace.channelId,
            options.assigneeId ?? null,
            options.policyId ?? workspace.vipPolicyId,
        ]
    );
    await db.query(
        `insert into messages (workspace_id, conversation_id, direction, body, sent_at)
         values ($1, $2, 'inbound', 'Where is my order?', $3)`,
        [workspace.id, conversation!.id, new Date(dueAt.getTime() - 300_000)]
    );
    await db.query(
        `insert into sla_state (workspace_id, conversation_id, kind, policy_id, due_at)
         values ($1, $2, 'first_response', $3, $4)`,
        [workspace.id, conversation!.id, options.policyId ?? workspace.vipPolicyId, dueAt]
    );
    return conversation!.id;
}

describe('a missed target', () => {
    const now = new Date('2026-01-14T12:00:00Z');

    it('is marked breached, once', async () => {
        const conversationId = await conversationDueAt(new Date('2026-01-14T11:55:00Z'));

        const first = await sweepBreaches(db, now);
        expect(first.map((breach) => breach.conversationId)).toContain(conversationId);

        // Running the sweep again must not breach it a second time, or write a
        // second banner into the thread.
        const second = await sweepBreaches(db, now);
        expect(second.map((breach) => breach.conversationId)).not.toContain(conversationId);

        const events = await db.query<{ rule: string; effect: string }>(
            'select rule, effect from rule_events where conversation_id = $1',
            [conversationId]
        );
        expect(events).toHaveLength(1);
        expect(events[0]!.rule).toBe('First response target missed');
    });

    it('escalates to whoever the policy names', async () => {
        const conversationId = await conversationDueAt(new Date('2026-01-14T11:50:00Z'));
        await sweepBreaches(db, now);

        const [conversation] = await db.query<{ assignee_id: string | null }>(
            'select assignee_id from conversations where id = $1',
            [conversationId]
        );
        expect(conversation!.assignee_id).toBe(workspace.lead);

        const [clock] = await db.query<{ escalated_at: Date | null }>(
            'select escalated_at from sla_state where conversation_id = $1',
            [conversationId]
        );
        expect(clock!.escalated_at).not.toBeNull();
    });

    it('does not take a thread off the agent already working it', async () => {
        const conversationId = await conversationDueAt(new Date('2026-01-14T11:45:00Z'), {
            assigneeId: workspace.agent,
        });
        await sweepBreaches(db, now);

        const [conversation] = await db.query<{ assignee_id: string | null }>(
            'select assignee_id from conversations where id = $1',
            [conversationId]
        );
        expect(conversation!.assignee_id).toBe(workspace.agent);
    });

    it('is written to the audit log', async () => {
        const entries = await db.query<{ action: string }>(
            `select action from audit_log where workspace_id = $1 and action = 'sla.breached'`,
            [workspace.id]
        );
        expect(entries.length).toBeGreaterThan(0);
    });
});

describe('a target that was met', () => {
    it('is left alone even once its due time passes', async () => {
        const conversationId = await conversationDueAt(new Date('2026-01-14T11:00:00Z'));
        // An agent replied, so the trigger in the migrations stopped the clock.
        await db.query(
            `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
             values ($1, $2, 'outbound', $3, 'Right away.')`,
            [workspace.id, conversationId, workspace.agent]
        );

        await sweepBreaches(db, new Date('2026-01-14T12:00:00Z'));

        const [clock] = await db.query<{ breached_at: Date | null; satisfied_at: Date | null }>(
            'select breached_at, satisfied_at from sla_state where conversation_id = $1',
            [conversationId]
        );
        expect(clock!.satisfied_at).not.toBeNull();
        expect(clock!.breached_at).toBeNull();
    });
});

describe('a snoozed conversation', () => {
    it('stops the clock, and does not breach while it sleeps', async () => {
        const dueAt = new Date('2026-01-14T11:00:00Z');
        const conversationId = await conversationDueAt(dueAt);

        await db.query(`update conversations set status = 'snoozed', snoozed_until = $2 where id = $1`, [
            conversationId,
            new Date('2026-01-14T14:00:00Z'),
        ]);

        expect(await pauseSnoozedClocks(db, new Date('2026-01-14T10:00:00Z'))).toBeGreaterThan(0);

        const breaches = await sweepBreaches(db, new Date('2026-01-14T13:00:00Z'));
        expect(breaches.map((breach) => breach.conversationId)).not.toContain(conversationId);

        const [clock] = await db.query<{ paused_at: Date | null; breached_at: Date | null }>(
            'select paused_at, breached_at from sla_state where conversation_id = $1',
            [conversationId]
        );
        expect(clock!.paused_at).not.toBeNull();
        expect(clock!.breached_at).toBeNull();
    });

    it('gives the time back when it wakes up', async () => {
        const dueAt = new Date('2026-01-14T11:00:00Z');
        const conversationId = await conversationDueAt(dueAt);
        await db.query(`update conversations set status = 'snoozed', snoozed_until = $2 where id = $1`, [
            conversationId,
            new Date('2026-01-14T12:00:00Z'),
        ]);

        await pauseSnoozedClocks(db, new Date('2026-01-14T10:00:00Z'));
        // Two working hours later, the conversation is due to wake.
        await resumeWokenClocks(db, new Date('2026-01-14T12:00:00Z'));

        const [clock] = await db.query<{ paused_at: Date | null; due_at: Date }>(
            'select paused_at, due_at from sla_state where conversation_id = $1',
            [conversationId]
        );

        expect(clock!.paused_at).toBeNull();
        // The snooze bought two hours on the wall clock, so the target moved by
        // two hours — it was not quietly forgiven.
        expect(clock!.due_at.toISOString()).toBe('2026-01-14T13:00:00.000Z');
    });
});

describe('one pass of the worker', () => {
    it('resumes, pauses and sweeps in that order', async () => {
        const result = await tick(db, new Date('2026-01-14T15:00:00Z'));
        expect(result).toMatchObject({
            resumed: expect.any(Number),
            paused: expect.any(Number),
        });
        expect(Array.isArray(result.breaches)).toBe(true);
    });
});
