import React, { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Conversation, MissedAction, Policy } from '../types';
import { WorkspaceContext, CURRENT_AGENT, waitingSeconds } from './workspace-context';
import { conversations as seedConversations } from '../content/conversations';
import { policies as seedPolicies, missedActions as seedMissedActions } from '../content/workspace';

const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/**
 * Holds the workspace the demo screens share. The inbox and the queue are two
 * views of the same conversations, so assigning from one shows up in the other.
 */
export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
    const [conversations, setConversations] = useState(seedConversations);
    const [policies, setPolicies] = useState(seedPolicies);
    const [missedActions, setMissedActions] = useState(seedMissedActions);
    // -1 when the workspace is empty; ChatWindow renders its own empty state.
    const [activeId, setActiveId] = useState<number>(seedConversations[0]?.id ?? -1);

    const update = useCallback((id: number, patch: Partial<Conversation>) => {
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    }, []);

    const assign = useCallback(
        (id: number, agent: string | null) => update(id, { assignee: agent }),
        [update]
    );

    const snooze = useCallback(
        (id: number) => update(id, { status: 'snoozed', state: 'closed', waiting: '—' }),
        [update]
    );

    const resolve = useCallback(
        (id: number) => update(id, { status: 'resolved', state: 'closed', waiting: '—' }),
        [update]
    );

    const reopen = useCallback(
        (id: number) => update(id, { status: 'open', state: 'ontime', waiting: '00:00' }),
        [update]
    );

    /** The longest-waiting unassigned conversation, which "Take next" claims. */
    const nextUnassigned = useMemo(() => {
        const open = conversations.filter((c) => c.status === 'open' && !c.assignee);
        return open.sort((a, b) => waitingSeconds(b.waiting) - waitingSeconds(a.waiting))[0] ?? null;
    }, [conversations]);

    const takeNext = useCallback(() => {
        if (!nextUnassigned) return null;
        assign(nextUnassigned.id, CURRENT_AGENT);
        setActiveId(nextUnassigned.id);
        return nextUnassigned;
    }, [nextUnassigned, assign]);

    const assignAllUnassigned = useCallback(() => {
        setConversations((prev) =>
            prev.map((c) => (c.status === 'open' && !c.assignee ? { ...c, assignee: CURRENT_AGENT } : c))
        );
    }, []);

    const sendReply = useCallback((id: number, text: string) => {
        setConversations((prev) =>
            prev.map((c) =>
                c.id === id
                    ? {
                          ...c,
                          preview: text,
                          state: 'ontime',
                          waiting: '00:00',
                          status: 'open',
                          assignee: c.assignee ?? CURRENT_AGENT,
                          messages: [
                              ...c.messages,
                              { id: c.messages.length + 1, sender: 'agent', time: now(), text },
                          ],
                      }
                    : c
            )
        );
    }, []);

    const savePolicies = useCallback((next: Policy[]) => setPolicies(next), []);

    const toggleMissedAction = useCallback((title: string) => {
        setMissedActions((prev: MissedAction[]) =>
            prev.map((a) => (a.title === title ? { ...a, on: !a.on } : a))
        );
    }, []);

    const value = useMemo(
        () => ({
            conversations,
            activeId,
            setActiveId,
            assign,
            snooze,
            resolve,
            reopen,
            takeNext,
            nextUnassigned,
            assignAllUnassigned,
            sendReply,
            policies,
            savePolicies,
            missedActions,
            toggleMissedAction,
        }),
        [
            conversations,
            activeId,
            assign,
            snooze,
            resolve,
            reopen,
            takeNext,
            nextUnassigned,
            assignAllUnassigned,
            sendReply,
            policies,
            savePolicies,
            missedActions,
            toggleMissedAction,
        ]
    );

    return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};
