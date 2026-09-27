/**
 * What each role may do inside its own workspace, and — the part that matters
 * most — what nobody may do from a browser at all: touch the SLA clock, forge a
 * message, or write the audit log.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { asUser, denied, freshDatabase, service, type TestDatabase } from './harness';
import { seed, type Seed } from './fixtures';

let db: TestDatabase;
let s: Seed;

beforeAll(async () => {
    db = await freshDatabase();
    s = await seed(db);
});

afterAll(async () => {
    await db.close();
});

/** A conversation of its own, so a test that writes cannot disturb its neighbours. */
async function freshConversation(subject: string): Promise<string> {
    const rows = await db.query<{ id: string }>(
        service,
        `insert into conversations (workspace_id, customer_id, channel_id, subject, policy_id)
         values ($1, $2, $3, $4, $5) returning id`,
        [s.a.id, s.a.customerId, s.a.channelId, subject, s.a.policyId]
    );
    return rows[0]!.id;
}

describe('viewer', () => {
    it('reads the inbox', async () => {
        const rows = await db.query(asUser(s.a.viewer), 'select id from conversations');
        expect(rows.length).toBeGreaterThan(0);
    });

    it('cannot assign a conversation', async () => {
        const conversationId = await freshConversation('viewer tries to assign');
        const updated = await db.query(
            asUser(s.a.viewer),
            'update conversations set assignee_id = $1 where id = $2 returning id',
            [s.a.viewer, conversationId]
        );
        expect(updated).toEqual([]);
    });

    it('cannot reply', async () => {
        const conversationId = await freshConversation('viewer tries to reply');
        const message = await denied(
            db.query(
                asUser(s.a.viewer),
                `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
                 values ($1, $2, 'outbound', $3, 'no')`,
                [s.a.id, conversationId, s.a.viewer]
            )
        );
        expect(message).toMatch(/row-level security/i);
    });
});

describe('agent', () => {
    it('assigns, snoozes and resolves', async () => {
        const conversationId = await freshConversation('agent works the queue');
        const agent = asUser(s.a.agent);

        const assigned = await db.query(
            agent,
            'update conversations set assignee_id = $1 where id = $2 returning assignee_id',
            [s.a.agent, conversationId]
        );
        expect(assigned).toHaveLength(1);

        const snoozed = await db.query<{ status: string }>(
            agent,
            `update conversations set status = 'snoozed', snoozed_until = now() + interval '2 hours'
             where id = $1 returning status`,
            [conversationId]
        );
        expect(snoozed[0]?.status).toBe('snoozed');

        const resolved = await db.query<{ status: string }>(
            agent,
            `update conversations set status = 'resolved', snoozed_until = null, resolved_at = now()
             where id = $1 returning status`,
            [conversationId]
        );
        expect(resolved[0]?.status).toBe('resolved');
    });

    it('replies in its own name', async () => {
        const conversationId = await freshConversation('agent replies');
        const sent = await db.query<{ id: string }>(
            asUser(s.a.agent),
            `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
             values ($1, $2, 'outbound', $3, 'On its way today.') returning id`,
            [s.a.id, conversationId, s.a.agent]
        );
        expect(sent).toHaveLength(1);
    });

    it("cannot reply in a colleague's name", async () => {
        const conversationId = await freshConversation('agent forges a colleague');
        const message = await denied(
            db.query(
                asUser(s.a.agent),
                `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
                 values ($1, $2, 'outbound', $3, 'signed, someone else') returning id`,
                [s.a.id, conversationId, s.a.admin]
            )
        );
        expect(message).toMatch(/row-level security/i);
    });

    it('cannot fabricate an inbound message', async () => {
        // Inbound is what the customer said. Only the webhook receiver, running
        // as service_role, gets to write it.
        const conversationId = await freshConversation('agent fabricates the customer');
        const message = await denied(
            db.query(
                asUser(s.a.agent),
                `insert into messages (workspace_id, conversation_id, direction, body)
                 values ($1, $2, 'inbound', 'I said it was fine, honest')`,
                [s.a.id, conversationId]
            )
        );
        expect(message).toMatch(/row-level security/i);
    });

    it('cannot edit an SLA policy', async () => {
        const updated = await db.query(
            asUser(s.a.agent),
            'update policies set first_response_target_seconds = 86400 where id = $1 returning id',
            [s.a.policyId]
        );
        expect(updated).toEqual([]);
    });

    it('cannot connect a channel', async () => {
        const message = await denied(
            db.query(
                asUser(s.a.agent),
                `insert into channels (workspace_id, type, display_name) values ($1, 'instagram', 'Sneaky')`,
                [s.a.id]
            )
        );
        expect(message).toMatch(/row-level security/i);
    });

    it('cannot read the audit log', async () => {
        const rows = await db.query(asUser(s.a.agent), 'select * from audit_log');
        expect(rows).toEqual([]);
    });
});

describe('admin', () => {
    it('edits policies and business hours', async () => {
        const policy = await db.query<{ first_response_target_seconds: number }>(
            asUser(s.a.admin),
            `update policies set first_response_target_seconds = 600 where id = $1
             returning first_response_target_seconds`,
            [s.a.policyId]
        );
        expect(policy[0]?.first_response_target_seconds).toBe(600);

        const hours = await db.query(
            asUser(s.a.admin),
            `update business_hours set closes_at = time '18:00' where workspace_id = $1 returning id`,
            [s.a.id]
        );
        expect(hours.length).toBeGreaterThan(0);
    });

    it('reads the audit log', async () => {
        const rows = await db.query(asUser(s.a.admin), 'select * from audit_log');
        expect(rows.length).toBeGreaterThan(0);
    });

    it('invites an agent', async () => {
        const invited = await db.transaction(service, (run) =>
            run<{ id: string }>('insert into auth.users (email) values ($1) returning id', [
                'newcomer@northfield.test',
            ])
        );
        const created = await db.query(
            asUser(s.a.admin),
            `insert into memberships (workspace_id, user_id, role) values ($1, $2, 'agent') returning id`,
            [s.a.id, invited[0]!.id]
        );
        expect(created).toHaveLength(1);
    });

    it('cannot mint an owner', async () => {
        const candidate = await db.transaction(service, (run) =>
            run<{ id: string }>('insert into auth.users (email) values ($1) returning id', [
                'pretender@northfield.test',
            ])
        );
        const message = await denied(
            db.query(
                asUser(s.a.admin),
                `insert into memberships (workspace_id, user_id, role) values ($1, $2, 'owner')`,
                [s.a.id, candidate[0]!.id]
            )
        );
        expect(message).toMatch(/row-level security/i);
    });

    it('cannot demote or remove the owner', async () => {
        const demoted = await db.query(
            asUser(s.a.admin),
            `update memberships set role = 'viewer' where workspace_id = $1 and user_id = $2 returning id`,
            [s.a.id, s.a.owner]
        );
        expect(demoted).toEqual([]);

        const removed = await db.query(
            asUser(s.a.admin),
            'delete from memberships where workspace_id = $1 and user_id = $2 returning id',
            [s.a.id, s.a.owner]
        );
        expect(removed).toEqual([]);
    });
});

describe('nobody in a browser', () => {
    const forbidden: Array<[name: string, sql: string, params: (seed: Seed) => unknown[]]> = [
        [
            'starts an SLA clock',
            `insert into sla_state (workspace_id, conversation_id, kind, due_at)
             values ($1, $2, 'resolution', now() + interval '1 day')`,
            (seed) => [seed.a.id, seed.a.conversationId],
        ],
        [
            'stops one',
            `update sla_state set due_at = now() + interval '10 days' where workspace_id = $1`,
            (seed) => [seed.a.id],
        ],
        [
            'writes a rule event',
            `insert into rule_events (workspace_id, conversation_id, rule, effect)
             values ($1, $2, 'made up', 'made up')`,
            (seed) => [seed.a.id, seed.a.conversationId],
        ],
        [
            'writes the audit log',
            `insert into audit_log (workspace_id, action, entity_type)
             values ($1, 'forged', 'workspace')`,
            (seed) => [seed.a.id],
        ],
        [
            'edits a message after sending',
            `update messages set body = 'I never said that' where workspace_id = $1`,
            (seed) => [seed.a.id],
        ],
        ['deletes a message', 'delete from messages where workspace_id = $1', (seed) => [seed.a.id]],
        [
            'deletes a conversation',
            'delete from conversations where workspace_id = $1',
            (seed) => [seed.a.id],
        ],
    ];

    // Asked as the owner: the most privileged role there is still cannot do any
    // of it, because there is no grant to fall back on.
    it.each(forbidden)('%s', async (_name, sql, params) => {
        const message = await denied(db.query(asUser(s.a.owner), sql, params(s)));
        expect(message).toMatch(/permission denied/i);
    });
});
