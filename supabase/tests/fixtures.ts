/**
 * Two workspaces that must never be able to see one another, each with one user
 * per role. Seeded as service_role, which is how the Node service provisions a
 * workspace: nothing here is reachable from a browser session.
 */

import type { TestDatabase, RunInTransaction } from './harness';
import { service } from './harness';

export interface SeededWorkspace {
    id: string;
    slug: string;
    owner: string;
    admin: string;
    agent: string;
    viewer: string;
    channelId: string;
    customerId: string;
    policyId: string;
    conversationId: string;
    inboundMessageId: string;
}

export interface Seed {
    /** Northfield Supply Co. — the workspace under test. */
    a: SeededWorkspace;
    /** A second tenant on the same database, and the one A must never reach. */
    b: SeededWorkspace;
    /** Signed in, but a member of neither workspace. */
    outsider: string;
}

async function id(run: RunInTransaction, sql: string, params: unknown[] = []): Promise<string> {
    const rows = await run<{ id: string }>(sql, params);
    const first = rows[0];
    if (!first) throw new Error(`seed statement returned no id: ${sql}`);
    return first.id;
}

async function seedWorkspace(run: RunInTransaction, slug: string, name: string): Promise<SeededWorkspace> {
    const workspaceId = await id(run, 'insert into workspaces (name, slug) values ($1, $2) returning id', [
        name,
        slug,
    ]);

    const users: Record<string, string> = {};
    for (const role of ['owner', 'admin', 'agent', 'viewer']) {
        const userId = await id(run, 'insert into auth.users (email) values ($1) returning id', [
            `${role}@${slug}.test`,
        ]);
        await run(
            'insert into memberships (workspace_id, user_id, role, display_name) values ($1, $2, $3::membership_role, $4)',
            [workspaceId, userId, role, `${slug} ${role}`]
        );
        users[role] = userId;
    }

    const channelId = await id(
        run,
        `insert into channels (workspace_id, type, display_name, external_id, status, connected_at)
         values ($1, 'whatsapp', $2, $3, 'connected', now()) returning id`,
        [workspaceId, `${name} WhatsApp`, `phone-${slug}`]
    );

    const customerId = await id(
        run,
        `insert into customers (workspace_id, external_handle, name, tags, orders_count)
         values ($1, $2, $3, array['vip'], 11) returning id`,
        [workspaceId, `+4470000${slug.length}`, `${name} customer`]
    );

    const policyId = await id(
        run,
        `insert into policies (workspace_id, position, name, conditions,
                               first_response_target_seconds, resolution_target_seconds)
         values ($1, 1, 'VIP delivery', '{"tags":["vip"],"keywords":["delivery"]}'::jsonb, 300, 14400)
         returning id`,
        [workspaceId]
    );

    const conversationId = await id(
        run,
        `insert into conversations (workspace_id, customer_id, channel_id, subject, policy_id)
         values ($1, $2, $3, $4, $5) returning id`,
        [workspaceId, customerId, channelId, `Where is my order (${slug})`, policyId]
    );

    const inboundMessageId = await id(
        run,
        `insert into messages (workspace_id, conversation_id, direction, body, provider_message_id, sent_at)
         values ($1, $2, 'inbound', 'Order still not here', $3, now() - interval '10 minutes')
         returning id`,
        [workspaceId, conversationId, `wamid.${slug}.1`]
    );

    await run(
        `insert into sla_state (workspace_id, conversation_id, kind, policy_id, due_at)
         values ($1, $2, 'first_response', $3, now() + interval '5 minutes')`,
        [workspaceId, conversationId, policyId]
    );

    await run(
        `insert into rule_events (workspace_id, conversation_id, rule, effect)
         values ($1, $2, 'VIP + delivery keyword', 'Moved to the top of the queue')`,
        [workspaceId, conversationId]
    );

    // 08:00-20:00, Monday to Friday: what the product's copy promises.
    await run(
        `insert into business_hours (workspace_id, weekday, opens_at, closes_at)
         select $1, weekday, time '08:00', time '20:00' from generate_series(1, 5) as weekday`,
        [workspaceId]
    );

    await run(
        `insert into saved_replies (workspace_id, command, label, body, created_by)
         values ($1, 'delay', 'Delivery delay', 'Sorry — your order is running late.', $2)`,
        [workspaceId, users.agent]
    );

    await run(
        `insert into audit_log (workspace_id, actor_id, action, entity_type, entity_id)
         values ($1, $2, 'workspace.created', 'workspace', $1)`,
        [workspaceId, users.owner]
    );

    return {
        id: workspaceId,
        slug,
        owner: users.owner!,
        admin: users.admin!,
        agent: users.agent!,
        viewer: users.viewer!,
        channelId,
        customerId,
        policyId,
        conversationId,
        inboundMessageId,
    };
}

export async function seed(db: TestDatabase): Promise<Seed> {
    return db.transaction(service, async (run) => {
        const a = await seedWorkspace(run, 'northfield', 'Northfield Supply Co.');
        const b = await seedWorkspace(run, 'rival', 'Rival Trading Ltd.');
        const outsider = await id(run, 'insert into auth.users (email) values ($1) returning id', [
            'nobody@example.test',
        ]);
        return { a, b, outsider };
    });
}
