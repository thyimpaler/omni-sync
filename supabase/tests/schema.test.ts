/**
 * The rules the schema enforces on its own: what a row may say, and what
 * happens to a conversation's clock timestamps when a message lands.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { denied, freshDatabase, service, type TestDatabase } from './harness';
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

async function newConversation(subject: string): Promise<string> {
    const rows = await db.query<{ id: string }>(
        service,
        `insert into conversations (workspace_id, customer_id, channel_id, subject, policy_id)
         values ($1, $2, $3, $4, $5) returning id`,
        [s.a.id, s.a.customerId, s.a.channelId, subject, s.a.policyId]
    );
    return rows[0]!.id;
}

async function readConversation(id: string) {
    // The driver hands timestamps back as Date objects, so comparisons here are
    // deep rather than identity.
    const rows = await db.query<{
        first_inbound_at: Date | null;
        first_response_at: Date | null;
        last_message_at: Date | null;
    }>(
        service,
        'select first_inbound_at, first_response_at, last_message_at from conversations where id = $1',
        [id]
    );
    return rows[0]!;
}

describe('a conversation cannot describe itself dishonestly', () => {
    it.each([
        ['snoozed with no time to wake up', `update conversations set status = 'snoozed' where id = $1`],
        ['resolved with no time of resolution', `update conversations set status = 'resolved' where id = $1`],
        [
            'carrying a wake-up time while open',
            `update conversations set snoozed_until = now() + interval '1 hour' where id = $1`,
        ],
    ])('%s', async (_name, sql) => {
        const conversationId = await newConversation('constraint check');
        const message = await denied(db.query(service, sql, [conversationId]));
        expect(message).toMatch(/violates check constraint/i);
    });
});

describe('constraints on the rest of the schema', () => {
    it('refuse a policy that promises nothing', async () => {
        const message = await denied(
            db.query(
                service,
                `insert into policies (workspace_id, position, name) values ($1, 99, 'Empty')`,
                [s.a.id]
            )
        );
        expect(message).toMatch(/policies_has_a_target/i);
    });

    it('refuse a business day that closes before it opens', async () => {
        const message = await denied(
            db.query(
                service,
                `insert into business_hours (workspace_id, weekday, opens_at, closes_at)
                 values ($1, 6, time '18:00', time '09:00')`,
                [s.a.id]
            )
        );
        expect(message).toMatch(/business_hours_open_before_close/i);
    });

    it('refuse an outbound message with no agent behind it', async () => {
        const conversationId = await newConversation('unsigned outbound');
        const message = await denied(
            db.query(
                service,
                `insert into messages (workspace_id, conversation_id, direction, body)
                 values ($1, $2, 'outbound', 'sent by nobody')`,
                [s.a.id, conversationId]
            )
        );
        expect(message).toMatch(/messages_outbound_has_a_sender/i);
    });

    it('refuse an inbound message attributed to an agent', async () => {
        const conversationId = await newConversation('attributed inbound');
        const message = await denied(
            db.query(
                service,
                `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
                 values ($1, $2, 'inbound', $3, 'the customer, allegedly')`,
                [s.a.id, conversationId, s.a.agent]
            )
        );
        expect(message).toMatch(/messages_inbound_has_no_sender/i);
    });

    it('refuse a workspace slug that could not be a URL', async () => {
        const message = await denied(
            db.query(service, `insert into workspaces (name, slug) values ('Bad', 'Not A Slug')`)
        );
        expect(message).toMatch(/violates check constraint/i);
    });
});

describe('webhook dedupe', () => {
    it('refuses the same provider message twice in one workspace', async () => {
        const conversationId = await newConversation('redelivered');
        const insert = `insert into messages (workspace_id, conversation_id, direction, body, provider_message_id)
                        values ($1, $2, 'inbound', 'Hello?', 'wamid.duplicate')`;

        await db.query(service, insert, [s.a.id, conversationId]);
        const message = await denied(db.query(service, insert, [s.a.id, conversationId]));

        expect(message).toMatch(/messages_provider_dedupe_idx|duplicate key/i);
    });

    it('lets two workspaces hold the same provider id', async () => {
        // Ids are unique per provider account, and dedupe must not leak the
        // fact that another tenant saw a message.
        const inserted = await db.query<{ id: string }>(
            service,
            `insert into messages (workspace_id, conversation_id, direction, body, provider_message_id)
             values ($1, $2, 'inbound', 'Hello?', 'wamid.duplicate') returning id`,
            [s.b.id, s.b.conversationId]
        );
        expect(inserted).toHaveLength(1);
    });
});

describe('a message moves the conversation clock', () => {
    it('the first inbound starts it', async () => {
        const conversationId = await newConversation('customer writes first');
        await db.query(
            service,
            `insert into messages (workspace_id, conversation_id, direction, body, sent_at)
             values ($1, $2, 'inbound', 'Where is my order?', now() - interval '5 minutes')`,
            [s.a.id, conversationId]
        );

        const conversation = await readConversation(conversationId);
        expect(conversation.first_inbound_at).not.toBeNull();
        expect(conversation.first_response_at).toBeNull();
        expect(conversation.last_message_at).toEqual(conversation.first_inbound_at);
    });

    it('the first agent reply stops it, and later replies do not move it', async () => {
        const conversationId = await newConversation('agent answers');
        await db.query(
            service,
            `insert into messages (workspace_id, conversation_id, direction, body, sent_at)
             values ($1, $2, 'inbound', 'Where is my order?', now() - interval '5 minutes')`,
            [s.a.id, conversationId]
        );
        await db.query(
            service,
            `insert into sla_state (workspace_id, conversation_id, kind, due_at)
             values ($1, $2, 'first_response', now() + interval '5 minutes')`,
            [s.a.id, conversationId]
        );

        await db.query(
            service,
            `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
             values ($1, $2, 'outbound', $3, 'With the courier now.')`,
            [s.a.id, conversationId, s.a.agent]
        );

        const answered = await readConversation(conversationId);
        expect(answered.first_response_at).not.toBeNull();

        const [clock] = await db.query<{ satisfied_at: Date | null }>(
            service,
            `select satisfied_at from sla_state where conversation_id = $1 and kind = 'first_response'`,
            [conversationId]
        );
        expect(clock?.satisfied_at).toEqual(answered.first_response_at);

        await db.query(
            service,
            `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
             values ($1, $2, 'outbound', $3, 'Anything else?')`,
            [s.a.id, conversationId, s.a.agent]
        );

        const afterSecondReply = await readConversation(conversationId);
        expect(afterSecondReply.first_response_at).toEqual(answered.first_response_at);
        expect(afterSecondReply.last_message_at).not.toEqual(answered.last_message_at);
    });

    it('an agent-opened thread has no first response to measure', async () => {
        // Nobody waited, so there is nothing to be late for.
        const conversationId = await newConversation('agent reaches out');
        await db.query(
            service,
            `insert into messages (workspace_id, conversation_id, direction, sender_id, body)
             values ($1, $2, 'outbound', $3, 'Following up on your order.')`,
            [s.a.id, conversationId, s.a.agent]
        );

        const conversation = await readConversation(conversationId);
        expect(conversation.first_inbound_at).toBeNull();
        expect(conversation.first_response_at).toBeNull();
        expect(conversation.last_message_at).not.toBeNull();
    });
});

describe('updated_at', () => {
    it('moves on its own when a row changes', async () => {
        const [before] = await db.query<{ updated_at: Date }>(
            service,
            'select updated_at from customers where id = $1',
            [s.a.customerId]
        );
        const [after] = await db.query<{ updated_at: Date }>(
            service,
            'update customers set orders_count = orders_count + 1 where id = $1 returning updated_at',
            [s.a.customerId]
        );
        expect(after!.updated_at.getTime()).toBeGreaterThan(before!.updated_at.getTime());
    });
});
