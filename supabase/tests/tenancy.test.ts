/**
 * The tenancy boundary. Everything here is the same question asked twelve ways:
 * can a signed-in member of one workspace reach another workspace's rows? A
 * failure in this file is a breach, not a bug.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { anon, asUser, denied, freshDatabase, service, type TestDatabase } from './harness';
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

/** Every tenant-owned table, and the column that scopes it to a workspace. */
const tenantTables: Array<[table: string, scope: string]> = [
    ['workspaces', 'id'],
    ['memberships', 'workspace_id'],
    ['channels', 'workspace_id'],
    ['customers', 'workspace_id'],
    ['policies', 'workspace_id'],
    ['conversations', 'workspace_id'],
    ['messages', 'workspace_id'],
    ['rule_events', 'workspace_id'],
    ['sla_state', 'workspace_id'],
    ['business_hours', 'workspace_id'],
    ['saved_replies', 'workspace_id'],
    ['audit_log', 'workspace_id'],
];

describe('row-level security is switched on', () => {
    it('covers every table in the public schema', async () => {
        const unprotected = await db.query<{ relname: string }>(
            service,
            `select c.relname
             from pg_class c
             join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`
        );
        expect(unprotected.map((row) => row.relname)).toEqual([]);
    });

    it('leaves no table without a policy', async () => {
        const policyless = await db.query<{ relname: string }>(
            service,
            `select c.relname
             from pg_class c
             join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = 'public'
               and c.relkind = 'r'
               and not exists (select 1 from pg_policy p where p.polrelid = c.oid)`
        );
        expect(policyless.map((row) => row.relname)).toEqual([]);
    });
});

describe('anonymous callers', () => {
    it.each(tenantTables)('cannot read %s at all', async (table) => {
        const message = await denied(db.query(anon, `select * from ${table}`));
        expect(message).toMatch(/permission denied/i);
    });

    it('cannot write either', async () => {
        const message = await denied(
            db.query(anon, `insert into workspaces (name, slug) values ('Squatter', 'squatter')`)
        );
        expect(message).toMatch(/permission denied/i);
    });
});

describe('a member of one workspace', () => {
    it.each(tenantTables)("reads none of the other workspace's %s", async (table, scope) => {
        const rows = await db.query<{ n: number }>(
            asUser(s.a.owner),
            `select count(*)::int n from ${table} where ${scope} = $1`,
            [s.b.id]
        );
        expect(rows[0]?.n).toBe(0);
    });

    it.each(tenantTables)('still reads its own %s', async (table, scope) => {
        // The mirror of the test above: proves the zeroes mean "filtered out",
        // not "the fixture never inserted anything".
        const rows = await db.query<{ n: number }>(
            asUser(s.a.owner),
            `select count(*)::int n from ${table} where ${scope} = $1`,
            [s.a.id]
        );
        expect(rows[0]?.n).toBeGreaterThan(0);
    });

    it('cannot see the other workspace even by listing everything', async () => {
        const rows = await db.query<{ id: string }>(asUser(s.a.agent), 'select id from workspaces');
        expect(rows.map((row) => row.id)).toEqual([s.a.id]);
    });

    it("cannot see the other workspace's people", async () => {
        const rows = await db.query<{ user_id: string }>(
            asUser(s.a.admin),
            'select user_id from memberships'
        );
        expect(rows).toHaveLength(4);
        expect(rows.map((row) => row.user_id)).not.toContain(s.b.agent);
    });

    it('cannot read a foreign conversation by guessing its id', async () => {
        const rows = await db.query(asUser(s.a.agent), 'select id from conversations where id = $1', [
            s.b.conversationId,
        ]);
        expect(rows).toEqual([]);
    });

    it('cannot assign a foreign conversation to itself', async () => {
        const updated = await db.query(
            asUser(s.a.agent),
            'update conversations set assignee_id = $1 where id = $2 returning id',
            [s.a.agent, s.b.conversationId]
        );
        // RLS filters the row out of the update's scope, so nothing changes and
        // no error is raised. The absence of an error is the point: a caller
        // cannot use failure messages to probe another tenant either.
        expect(updated).toEqual([]);

        const [still] = await db.query<{ assignee_id: string | null }>(
            service,
            'select assignee_id from conversations where id = $1',
            [s.b.conversationId]
        );
        expect(still?.assignee_id).toBeNull();
    });

    it('cannot insert a conversation into a foreign workspace', async () => {
        const message = await denied(
            db.query(
                asUser(s.a.agent),
                `insert into conversations (workspace_id, customer_id, channel_id, subject)
                 values ($1, $2, $3, 'planted')`,
                [s.b.id, s.b.customerId, s.b.channelId]
            )
        );
        expect(message).toMatch(/row-level security/i);
    });

    it('cannot reply into a foreign conversation', async () => {
        const message = await denied(
            db.query(
                asUser(s.a.agent),
                `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
                 values ($1, $2, 'outbound', $3, 'hello from the other side')`,
                [s.b.id, s.b.conversationId, s.a.agent]
            )
        );
        // The membership trigger rejects it before RLS gets a say: the sender is
        // not a member of that workspace. Either refusal is correct.
        expect(message).toMatch(/not a member|row-level security/i);
    });

    it('cannot move one of its own rows into another workspace', async () => {
        const message = await denied(
            db.query(asUser(s.a.admin), 'update customers set workspace_id = $1 where id = $2', [
                s.b.id,
                s.a.customerId,
            ])
        );
        expect(message).toMatch(/workspace_id is immutable/i);
    });
});

describe('a signed-in user who is a member of nothing', () => {
    it.each(tenantTables)('sees an empty %s', async (table) => {
        const rows = await db.query(asUser(s.outsider), `select * from ${table}`);
        expect(rows).toEqual([]);
    });
});

describe('cross-workspace references', () => {
    it('are refused even to the service role', async () => {
        const message = await denied(
            db.query(
                service,
                `insert into conversations (workspace_id, customer_id, channel_id, subject)
                 values ($1, $2, $3, 'stitched across tenants')`,
                [s.a.id, s.b.customerId, s.a.channelId]
            )
        );
        // The composite foreign key, not a policy: this one is wrong regardless
        // of who is asking.
        expect(message).toMatch(/foreign key/i);
    });

    it('refuse an assignee from another workspace', async () => {
        const message = await denied(
            db.query(service, 'update conversations set assignee_id = $1 where id = $2', [
                s.b.agent,
                s.a.conversationId,
            ])
        );
        expect(message).toMatch(/not a member of workspace/i);
    });
});
