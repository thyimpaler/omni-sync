import { createContext, useContext } from 'react';

export const WorkspaceContext = createContext(null);

export const useWorkspace = () => {
    const value = useContext(WorkspaceContext);
    if (!value) throw new Error('useWorkspace must be used inside a WorkspaceProvider');
    return value;
};

/** "04:12" → 252. Waiting times sort by seconds, not by string. */
export const waitingSeconds = (waiting) => {
    if (!waiting || waiting === '—') return -1;
    const [minutes, seconds] = waiting.split(':').map(Number);
    return minutes * 60 + (seconds || 0);
};

/** The demo's own agent, used wherever "assign to me" is meant. */
export const CURRENT_AGENT = 'Alex A.';
