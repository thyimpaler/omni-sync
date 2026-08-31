import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useWorkspace, waitingSeconds } from '../state/workspace-context';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'breached', label: 'Breached' },
    { key: 'orders', label: 'Orders' },
    { key: 'returns', label: 'Returns' },
];

export const ConversationList = () => {
    const { conversations, activeId, setActiveId } = useWorkspace();
    const chats = useMemo(
        () => [...conversations].sort((a, b) => waitingSeconds(b.waiting) - waitingSeconds(a.waiting)),
        [conversations]
    );
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');

    const breachedCount = useMemo(() => chats.filter((c) => c.state === 'breached').length, [chats]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return chats.filter((chat) => {
            if (q && !`${chat.name} ${chat.subject} ${chat.preview}`.toLowerCase().includes(q)) return false;
            if (filter === 'all') return true;
            if (filter === 'breached') return chat.state === 'breached';
            return chat.filters.includes(filter);
        });
    }, [chats, filter, query]);

    return (
        <div className="flex h-full w-[336px] shrink-0 flex-col border-r bg-ground rule">
            <div className="border-b px-4 py-4 rule">
                <div className="mb-3 flex items-baseline justify-between">
                    <h1 className="text-[24px]">Inbox</h1>
                    <span className="text-[12px] text-neutral-600">sorted by wait time</span>
                </div>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search conversations"
                        aria-label="Search conversations"
                        className="input pl-9"
                    />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    {FILTERS.map((f) => {
                        const active = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setFilter(f.key)}
                                aria-pressed={active}
                                className={`px-2 py-1 font-heading text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                                    active ? 'bg-ink text-neutral-100' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                                }`}
                            >
                                {f.label}
                                {f.key === 'breached' && ` ${breachedCount}`}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between border-b px-4 py-1.5 rule-soft">
                <span className="label">Conversation</span>
                <span className="label">Waiting</span>
            </div>

            <ul className="flex-1 overflow-y-auto">
                {visible.map((chat) => {
                    const active = chat.id === activeId;
                    return (
                        <li key={chat.id}>
                            <button
                                type="button"
                                onClick={() => setActiveId(chat.id)}
                                aria-current={active ? 'true' : undefined}
                                className={`flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left transition-colors rule-soft ${
                                    active ? 'border-l-2 border-l-ink bg-neutral-200/70' : 'hover:bg-neutral-200/40'
                                }`}
                            >
                                <span className="min-w-0">
                                    <span className="block truncate font-heading text-[16px] font-semibold text-ink">
                                        {chat.name}
                                    </span>
                                    <span className="block truncate text-[12px] text-neutral-600">
                                        {chat.channel} · {chat.status === 'resolved' ? 'resolved' : chat.assignee ?? 'unassigned'}
                                    </span>
                                    <span className="mt-1 block truncate text-[13px] text-neutral-700">{chat.preview}</span>
                                </span>
                                <span className={`sla sla-${chat.state} shrink-0`}>
                                    <span>{chat.waiting}</span>
                                    {chat.state === 'breached' && <span className="sla-state">Breached</span>}
                                    {chat.state === 'warning' && <span className="sla-state">Warning</span>}
                                    {chat.state === 'ontime' && <span className="sla-state">On time</span>}
                                    {chat.state === 'closed' && <span className="sla-state">Closed</span>}
                                </span>
                            </button>
                        </li>
                    );
                })}

                {visible.length === 0 && (
                    <li className="px-4 py-10 text-center text-[14px] text-neutral-600">
                        Nothing matches that filter.
                    </li>
                )}
            </ul>
        </div>
    );
};
