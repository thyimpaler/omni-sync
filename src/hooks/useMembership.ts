import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/auth-context';
import { getSupabase } from '../lib/supabase';
import type { Membership, MembershipRole } from '../types';

interface MembershipRow {
    id: string;
    role: MembershipRole;
    workspace_id: string;
    workspaces: { name: string; slug: string } | null;
}

export interface MembershipState {
    memberships: Membership[];
    /** The workspace being worked in. The first one, until Phase 5 adds a switcher. */
    current: Membership | null;
    loading: boolean;
    error: Error | null;
}

/** What came back, and for whom — so a stale result cannot be read as a fresh one. */
interface Settled {
    userId: string;
    memberships: Membership[];
    error: Error | null;
}

/**
 * Which workspaces the signed-in user belongs to, and in what role.
 *
 * Reads through RLS as the user, so it can only ever return their own rows —
 * the query has no workspace filter because it does not need one.
 */
export const useMembership = (): MembershipState => {
    const auth = useAuth();
    const userId = auth?.user?.id ?? null;

    const [settled, setSettled] = useState<Settled | null>(null);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        void (async () => {
            try {
                const supabase = await getSupabase();
                const { data, error } = await supabase
                    .from('memberships')
                    .select('id, role, workspace_id, workspaces (name, slug)')
                    .order('created_at', { ascending: true });

                if (error) throw new Error(error.message);
                if (cancelled) return;

                setSettled({
                    userId,
                    memberships: ((data ?? []) as unknown as MembershipRow[]).map((row) => ({
                        id: row.id,
                        workspaceId: row.workspace_id,
                        workspaceName: row.workspaces?.name ?? 'Workspace',
                        workspaceSlug: row.workspaces?.slug ?? '',
                        role: row.role,
                    })),
                    error: null,
                });
            } catch (error: unknown) {
                if (cancelled) return;
                setSettled({
                    userId,
                    memberships: [],
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    // Derived rather than stored: a result belonging to a previous user reads as
    // "still loading" for the current one, without an effect to reset it.
    const current = settled?.userId === userId ? settled : null;
    const memberships = current?.memberships ?? [];

    return {
        memberships,
        current: memberships[0] ?? null,
        loading: userId !== null && current === null,
        error: current?.error ?? null,
    };
};
