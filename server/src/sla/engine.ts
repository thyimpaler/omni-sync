/**
 * The SLA engine: the only thing that writes `sla_state`.
 *
 * A browser cannot start, stop or move a clock — the policies in
 * `supabase/migrations/20260901000300_rls.sql` see to that — so every due_at in
 * the product is computed here, from the matched policy and the workspace's
 * business hours.
 */

import type { Database } from '../db.ts';
import {
    addWorkingSeconds,
    businessWeekFrom,
    workingSecondsBetween,
    type BusinessHoursRow,
    type BusinessWeek,
} from './business-hours.ts';
import { matchPolicy, ruleBanner, type Policy, type Subject } from './policies.ts';

export type ClockKind = 'first_response' | 'resolution';

export interface Breach {
    id: string;
    workspaceId: string;
    conversationId: string;
    kind: ClockKind;
    escalatedTo: string | null;
}

/** The workspace's opening hours, in its own time zone. */
export async function businessWeekOf(db: Database, workspaceId: string): Promise<BusinessWeek> {
    const [workspace] = await db.query<{ timezone: string }>(
        'select timezone from workspaces where id = $1',
        [workspaceId]
    );
    const rows = await db.query<BusinessHoursRow>(
        'select weekday, opens_at::text, closes_at::text from business_hours where workspace_id = $1',
        [workspaceId]
    );
    return businessWeekFrom(rows, workspace?.timezone ?? 'Europe/London');
}

export async function policiesOf(db: Database, workspaceId: string): Promise<Policy[]> {
    return db.query<Policy>(
        `select id, position, name, conditions, first_response_target_seconds,
                resolution_target_seconds, business_hours_only, escalates_to, active
         from policies
         where workspace_id = $1 and active
         order by position`,
        [workspaceId]
    );
}

/**
 * Starts the clocks for a conversation whose first inbound message just landed:
 * picks the policy, records the rule that fired, and writes one `sla_state` row
 * per target the policy sets.
 */
export async function startClocks(
    db: Database,
    input: {
        workspaceId: string;
        conversationId: string;
        subject: Subject;
        from: Date;
    }
): Promise<Policy | null> {
    const policies = await policiesOf(db, input.workspaceId);
    const policy = matchPolicy(policies, input.subject);
    if (!policy) return null;

    const week = policy.business_hours_only
        ? await businessWeekOf(db, input.workspaceId)
        : businessWeekFrom([], 'UTC');

    await db.query('update conversations set policy_id = $1 where id = $2', [
        policy.id,
        input.conversationId,
    ]);

    const targets: Array<[ClockKind, number | null]> = [
        ['first_response', policy.first_response_target_seconds],
        ['resolution', policy.resolution_target_seconds],
    ];

    for (const [kind, seconds] of targets) {
        if (seconds === null) continue;
        await db.query(
            `insert into sla_state (workspace_id, conversation_id, kind, policy_id, due_at)
             values ($1, $2, $3, $4, $5)
             on conflict (conversation_id, kind) do nothing`,
            [
                input.workspaceId,
                input.conversationId,
                kind,
                policy.id,
                addWorkingSeconds(input.from, seconds, week),
            ]
        );
    }

    const banner = ruleBanner(policy);
    if (banner) {
        await db.query(
            `insert into rule_events (workspace_id, conversation_id, rule, effect)
             values ($1, $2, $3, $4)`,
            [input.workspaceId, input.conversationId, banner, `${policy.name} applied`]
        );
    }

    return policy;
}

/**
 * Marks everything past its due time as breached, and escalates where the
 * policy says to. Idempotent: a clock is only ever breached once, so running
 * the sweep twice in the same second changes nothing the second time.
 */
export async function sweepBreaches(db: Database, now: Date = new Date()): Promise<Breach[]> {
    return db.transaction(async (tx) => {
        // Not joined to policies: a clock whose policy has since been deleted
        // still breaches, it just has nobody to escalate to.
        const breached = await tx.query<{
            id: string;
            workspace_id: string;
            conversation_id: string;
            kind: ClockKind;
            policy_id: string | null;
        }>(
            `update sla_state s
             set breached_at = $1
             where s.due_at <= $1
               and s.breached_at is null
               and s.satisfied_at is null
               and s.paused_at is null
             returning s.id, s.workspace_id, s.conversation_id, s.kind, s.policy_id`,
            [now]
        );

        const results: Breach[] = [];

        for (const breachedRow of breached) {
            const [policy] = breachedRow.policy_id
                ? await tx.query<{ escalates_to: string | null }>(
                      'select escalates_to from policies where id = $1',
                      [breachedRow.policy_id]
                  )
                : [];
            const row = { ...breachedRow, escalates_to: policy?.escalates_to ?? null };
            const label = row.kind === 'first_response' ? 'First response target' : 'Resolution target';

            await tx.query(
                `insert into rule_events (workspace_id, conversation_id, rule, effect, fired_at)
                 values ($1, $2, $3, $4, $5)`,
                [
                    row.workspace_id,
                    row.conversation_id,
                    `${label} missed`,
                    row.escalates_to ? 'Escalated' : 'Flagged in the queue',
                    now,
                ]
            );

            if (row.escalates_to) {
                // Escalation assigns the thread to whoever the policy names,
                // but never takes it off an agent already working it.
                await tx.query(
                    `update conversations
                     set assignee_id = $1
                     where id = $2 and assignee_id is null`,
                    [row.escalates_to, row.conversation_id]
                );
                await tx.query('update sla_state set escalated_at = $1 where id = $2', [now, row.id]);
            }

            await tx.query(
                `insert into audit_log (workspace_id, action, entity_type, entity_id, detail)
                 values ($1, 'sla.breached', 'conversation', $2, $3)`,
                [row.workspace_id, row.conversation_id, JSON.stringify({ kind: row.kind })]
            );

            results.push({
                id: row.id,
                workspaceId: row.workspace_id,
                conversationId: row.conversation_id,
                kind: row.kind,
                escalatedTo: row.escalates_to,
            });
        }

        return results;
    });
}

/** Stops the clocks on conversations an agent has snoozed. */
export async function pauseSnoozedClocks(db: Database, now: Date = new Date()): Promise<number> {
    const paused = await db.query<{ id: string }>(
        `update sla_state s
         set paused_at = $1
         from conversations c
         where c.id = s.conversation_id
           and c.status = 'snoozed'
           and s.paused_at is null
           and s.breached_at is null
           and s.satisfied_at is null
         returning s.id`,
        [now]
    );
    return paused.length;
}

/**
 * Restarts the clocks on conversations that have woken up, moving due_at on by
 * the working time that passed while they slept — so a snooze buys the team
 * time on the wall clock without quietly forgiving the target.
 */
export async function resumeWokenClocks(db: Database, now: Date = new Date()): Promise<number> {
    const sleeping = await db.query<{
        id: string;
        workspace_id: string;
        due_at: Date;
        paused_at: Date;
        business_hours_only: boolean;
    }>(
        `select s.id, s.workspace_id, s.due_at, s.paused_at,
                coalesce(p.business_hours_only, true) as business_hours_only
         from sla_state s
         join conversations c on c.id = s.conversation_id
         left join policies p on p.id = s.policy_id
         where s.paused_at is not null
           and (c.status <> 'snoozed' or c.snoozed_until <= $1)`,
        [now]
    );

    const weeks = new Map<string, BusinessWeek>();

    for (const clock of sleeping) {
        let week = weeks.get(clock.workspace_id);
        if (!week) {
            week = await businessWeekOf(db, clock.workspace_id);
            weeks.set(clock.workspace_id, week);
        }

        const asleep = workingSecondsBetween(
            clock.paused_at,
            now,
            clock.business_hours_only ? week : businessWeekFrom([], 'UTC')
        );

        await db.query('update sla_state set paused_at = null, due_at = $1 where id = $2', [
            addWorkingSeconds(
                clock.due_at,
                asleep,
                clock.business_hours_only ? week : businessWeekFrom([], 'UTC')
            ),
            clock.id,
        ]);
    }

    return sleeping.length;
}

/** One pass of everything the worker does. */
export async function tick(db: Database, now: Date = new Date()) {
    const resumed = await resumeWokenClocks(db, now);
    const paused = await pauseSnoozedClocks(db, now);
    const breaches = await sweepBreaches(db, now);
    return { resumed, paused, breaches };
}
