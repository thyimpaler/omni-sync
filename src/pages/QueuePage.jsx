import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { agentLoad, queueContext } from '../content/workspace';
import { useWorkspace, waitingSeconds, CURRENT_AGENT } from '../state/workspace-context';
import { toCsv, downloadCsv } from '../lib/csv';

const COLUMNS = [
    { header: 'Customer', value: (r) => r.name },
    { header: 'Channel', value: (r) => r.channel },
    { header: 'Subject', value: (r) => r.subject },
    { header: 'Policy', value: (r) => r.policy },
    { header: 'Waiting', value: (r) => r.waiting },
    { header: 'Assignee', value: (r) => r.assignee ?? 'Unassigned' },
];

/* 1c — one table, sorted by who has waited longest. */
export const QueuePage = () => {
    const { conversations, assign, takeNext, assignAllUnassigned, nextUnassigned, setActiveId } = useWorkspace();
    const [unassignedOnly, setUnassignedOnly] = useState(false);
    const navigate = useNavigate();

    const open = useMemo(
        () =>
            conversations
                .filter((c) => c.status === 'open')
                .sort((a, b) => waitingSeconds(b.waiting) - waitingSeconds(a.waiting)),
        [conversations]
    );

    const rows = unassignedOnly ? open.filter((c) => !c.assignee) : open;
    const unassignedCount = open.filter((c) => !c.assignee).length;
    const breachedCount = open.filter((c) => c.state === 'breached').length;
    const longestWait = open[0];

    const stats = [
        { label: 'Longest wait', value: longestWait?.waiting ?? '—', state: longestWait?.state },
        { label: 'Unassigned', value: String(unassignedCount) },
        { label: 'Agents online', value: String(queueContext.agentsOnline) },
        { label: 'Compliance today', value: queueContext.complianceToday },
    ];

    const openConversation = (id) => {
        setActiveId(id);
        navigate('/example');
    };

    const handleTakeNext = () => {
        const claimed = takeNext();
        if (!claimed) {
            toast('Nothing unassigned — the queue is covered.');
            return;
        }
        toast(`${claimed.name} assigned to you`);
        navigate('/example');
    };

    const handleBulkAssign = () => {
        if (unassignedCount === 0) {
            toast('Nothing unassigned.');
            return;
        }
        assignAllUnassigned();
        toast(`${unassignedCount} conversation${unassignedCount === 1 ? '' : 's'} assigned to you`);
    };

    const handleExport = () => {
        downloadCsv('omnisync-queue.csv', toCsv(COLUMNS, rows));
        toast('Queue exported');
    };

    return (
        <div className="w-full flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1000px] px-8 py-8">
                <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-6 rule">
                    <div>
                        <h1 className="text-[32px]">Queue</h1>
                        <p className="mt-1 text-[14px] text-neutral-700">
                            {open.length} open across two channels · {unassignedCount} unassigned · {breachedCount} past target
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={handleBulkAssign} className="btn btn-secondary py-1.5">
                            Bulk assign
                        </button>
                        <button
                            type="button"
                            onClick={() => setUnassignedOnly((v) => !v)}
                            aria-pressed={unassignedOnly}
                            className={`btn py-1.5 ${unassignedOnly ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {unassignedOnly ? 'Unassigned only' : 'Filter'}
                        </button>
                        <button type="button" onClick={handleExport} className="btn btn-secondary py-1.5">
                            Export CSV
                        </button>
                        <button
                            type="button"
                            onClick={handleTakeNext}
                            disabled={!nextUnassigned}
                            className="btn btn-primary py-1.5"
                        >
                            Take next
                        </button>
                    </div>
                </header>

                <dl className="mt-6 grid gap-px bg-[color-mix(in_srgb,#1d1f20_16%,transparent)] sm:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-ground p-4">
                            <dt className="label">{stat.label}</dt>
                            <dd
                                className={`mt-2 font-mono text-[26px] leading-none tabular-nums ${
                                    stat.state === 'breached' ? 'text-accent-900' : 'text-ink'
                                }`}
                            >
                                {stat.value}
                            </dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_200px]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left">
                            <thead>
                                <tr className="border-b rule">
                                    <th scope="col" className="label pb-2">Customer</th>
                                    <th scope="col" className="label pb-2">Channel</th>
                                    <th scope="col" className="label pb-2">Subject</th>
                                    <th scope="col" className="label pb-2">Policy</th>
                                    <th scope="col" className="label pb-2 text-right">Waiting</th>
                                    <th scope="col" className="label pb-2 text-right">Assignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className="border-b align-top transition-colors hover:bg-neutral-200/40 rule-soft">
                                        <th scope="row" className="py-3 pr-4 text-left font-normal">
                                            <button
                                                type="button"
                                                onClick={() => openConversation(row.id)}
                                                className="text-left underline-offset-2 hover:underline"
                                            >
                                                <span className="block font-heading text-[16px] font-semibold text-ink">
                                                    {row.name}
                                                </span>
                                                {row.note && <span className="block text-[12px] text-neutral-600">{row.note}</span>}
                                            </button>
                                        </th>
                                        <td className="py-3 pr-4 text-[14px] text-neutral-700">{row.channel}</td>
                                        <td className="py-3 pr-4 text-[14px] text-ink">{row.subject}</td>
                                        <td className="py-3 pr-4 text-[13px] text-neutral-600">{row.policy}</td>
                                        <td className="py-3 pr-4 text-right">
                                            <span className={`sla sla-${row.state}`}>
                                                <span>{row.waiting}</span>
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            {row.assignee ? (
                                                <span className="text-[14px] text-neutral-700">{row.assignee}</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        assign(row.id, CURRENT_AGENT);
                                                        toast(`${row.name} assigned to you`);
                                                    }}
                                                    className="btn btn-secondary px-3 py-1 text-[13px]"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="mt-4 text-[13px] text-neutral-600">
                            Showing {rows.length} of {open.length}
                            {unassignedOnly && ' · unassigned only'}
                        </p>
                    </div>

                    <aside aria-labelledby="load-heading">
                        <h2 id="load-heading" className="label mb-3">Load per agent</h2>
                        <ul className="space-y-2">
                            {agentLoad.map((agent) => {
                                const live = agent.open + open.filter((c) => c.assignee === agent.name).length;
                                return (
                                    <li key={agent.name} className="flex items-center gap-2 text-[13px]">
                                        <span className="w-20 shrink-0 text-neutral-700">{agent.name}</span>
                                        <span className="h-3 flex-1 bg-neutral-200">
                                            <span
                                                className="block h-3 bg-accent-400"
                                                style={{ width: `${Math.min(100, (live / 12) * 100)}%` }}
                                            />
                                        </span>
                                        <span className="w-4 text-right font-mono tabular-nums text-ink">{live}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                </div>
            </div>
        </div>
    );
};
