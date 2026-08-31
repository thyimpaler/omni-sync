import { createContext, useContext } from 'react';
import type { WorkspaceValue } from '../types';

export const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export const useWorkspace = (): WorkspaceValue => {
    const value = useContext(WorkspaceContext);
    if (!value) throw new Error('useWorkspace must be used inside a WorkspaceProvider');
    return value;
};

/** "04:12" → 252. Waiting times sort by seconds, not by string. */
export const waitingSeconds = (waiting: string | null | undefined): number => {
    if (!waiting || waiting === '—') return -1;
    const [minutes, seconds] = waiting.split(':').map(Number);
    if (minutes === undefined || Number.isNaN(minutes)) return -1;
    return minutes * 60 + (Number.isNaN(seconds ?? NaN) ? 0 : (seconds ?? 0));
};

/** The demo's own agent, used wherever "assign to me" is meant. */
export const CURRENT_AGENT = 'Alex A.';
