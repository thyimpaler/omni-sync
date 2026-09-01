import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { reportRanges, hourly, byChannel, agentPerformance, topSubjects } from '../content/workspace';
import { toCsv, downloadCsv } from '../lib/csv';
import type { HourState } from '../types';

type RangeKey = keyof typeof reportRanges;

const RANGES = Object.keys(reportRanges) as RangeKey[];

/* Fill carries the meaning, as in the design: solid dark = past target,
   accent = within a minute of it, tint = comfortable. */
const BAR: Record<HourState, string> = {
    past: 'bg-accent-900',
    near: 'bg-accent-600',
    comfortable: 'bg-[color-mix(in_srgb,#1d1f20_22%,transparent)]',
};

const LEGEND: { state: HourState; label: string }[] = [
    { state: 'past', label: 'Past target' },
    { state: 'near', label: 'Within 1 min of target' },
    { state: 'comfortable', label: 'Comfortable' },
];

/* 1d — the manager's SLA view, one question per block. */
export const AnalyticsPage = () => {
    const [range, setRange] = useState<RangeKey>('30 days');
    const { caption, metrics } = reportRanges[range];

    const exportCsv = () => {
        const csv = toCsv<(typeof metrics)[number]>(
            [
                { header: 'Metric', value: (r) => r.label },
                { header: 'Value', value: (r) => r.value },
                { header: 'Note', value: (r) => r.note },
            ],
            metrics
        );
        downloadCsv(`omnisync-reports-${range.replace(/\s+/g, '-').toLowerCase()}.csv`, csv);
        toast('Report exported');
    };

    return (
        <div className="w-full flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1000px] px-8 py-8">
                <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-6 rule">
                    <div>
                        <h1 className="text-[32px]">Reports</h1>
                        <p className="mt-1 text-[14px] text-neutral-700">{caption}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex border rule" role="group" aria-label="Date range">
                            {RANGES.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRange(r)}
                                    aria-pressed={range === r}
                                    className={`px-3 py-1.5 font-heading text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                                        range === r
                                            ? 'bg-ink text-neutral-100'
                                            : 'text-neutral-700 hover:bg-neutral-200'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <button type="button" onClick={exportCsv} className="btn btn-secondary py-1.5">
                            Export CSV
                        </button>
                    </div>
                </header>

                <dl className="mt-6 grid gap-px bg-[color-mix(in_srgb,#1d1f20_16%,transparent)] sm:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((m) => (
                        <div key={m.label} className="bg-ground p-5">
                            <dt className="label">{m.label}</dt>
                            <dd>
                                <span className="mt-2 block font-heading text-[32px] font-semibold leading-none text-ink">
                                    {m.value}
                                </span>
                                <span className="mt-2 block text-[13px] text-neutral-600">{m.note}</span>
                            </dd>
                        </div>
                    ))}
                </dl>

                <section className="mt-10" aria-labelledby="hours-heading">
                    <h2 id="hours-heading" className="text-[24px]">
                        Where does the time go?
                    </h2>
                    <p className="label mt-1">median first response, by hour</p>
                    <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-neutral-700">
                        Every breach this month landed between 12:00 and 14:00, when two of five agents are at
                        lunch.
                    </p>

                    <div className="mt-6 flex h-[180px] items-end gap-2 border-b pb-0 rule-soft">
                        {hourly.map((bar) => (
                            <div key={bar.hour} className="flex h-full flex-1 flex-col justify-end">
                                <div
                                    className={`w-full ${BAR[bar.state]}`}
                                    style={{ height: `${bar.height}%` }}
                                    role="img"
                                    aria-label={`${bar.hour}:00 — ${LEGEND.find((l) => l.state === bar.state)?.label ?? ''}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {hourly.map((bar) => (
                            <span
                                key={bar.hour}
                                className="flex-1 pt-1.5 text-center font-mono text-[11px] text-neutral-600"
                            >
                                {bar.hour}
                            </span>
                        ))}
                    </div>

                    <ul className="mt-4 flex flex-wrap gap-5">
                        {LEGEND.map((item) => (
                            <li
                                key={item.state}
                                className="flex items-center gap-2 text-[12px] text-neutral-600"
                            >
                                <span className={`h-3 w-3 ${BAR[item.state]}`} aria-hidden="true" />
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="mt-12 grid gap-10 md:grid-cols-3">
                    <section aria-labelledby="channel-heading">
                        <h2 id="channel-heading" className="label mb-3">
                            By channel
                        </h2>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b rule-soft">
                                    <th scope="col" className="sr-only">
                                        Channel
                                    </th>
                                    <th scope="col" className="label pb-1 text-right">
                                        Volume
                                    </th>
                                    <th scope="col" className="label pb-1 text-right">
                                        Median
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {byChannel.map((row) => (
                                    <tr key={row.channel} className="border-b rule-soft">
                                        <th
                                            scope="row"
                                            className="py-2 text-left text-[14px] font-normal text-ink"
                                        >
                                            {row.channel}
                                        </th>
                                        <td className="py-2 text-right font-mono text-[13px] tabular-nums text-neutral-700">
                                            {row.volume}
                                        </td>
                                        <td className="py-2 text-right font-mono text-[13px] tabular-nums text-ink">
                                            {row.median}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section aria-labelledby="agents-heading">
                        <h2 id="agents-heading" className="label mb-3">
                            Agents
                        </h2>
                        <ul className="space-y-2">
                            {agentPerformance.map((agent) => (
                                <li key={agent.name} className="border-b pb-2 rule-soft">
                                    <p className="text-[14px] text-ink">{agent.name}</p>
                                    <p className="font-mono text-[12px] tabular-nums text-neutral-600">
                                        {agent.handled} · {agent.compliance}%
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section aria-labelledby="subjects-heading">
                        <h2 id="subjects-heading" className="label mb-3">
                            Top subjects
                        </h2>
                        <ul className="space-y-2">
                            {topSubjects.map((item) => (
                                <li
                                    key={item.subject}
                                    className="flex justify-between gap-3 border-b pb-2 rule-soft"
                                >
                                    <span className="text-[14px] text-ink">{item.subject}</span>
                                    <span className="font-mono text-[13px] tabular-nums text-neutral-600">
                                        {item.count}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};
