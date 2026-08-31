import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { settingsTabs, policyEffect, recentChanges } from '../content/workspace';
import { useWorkspace } from '../state/workspace-context';

const blankPolicy = (index) => ({
    n: String(index + 1).padStart(2, '0'),
    name: 'New policy',
    condition: 'Describe when this policy applies',
    target: '15 min',
    resolution: '8 hours',
    escalates: 'Support lead',
    applies: 'both channels',
});

/* 1f — response targets and routing rules. */
export const SettingsPage = () => {
    const { policies, savePolicies, missedActions, toggleMissedAction } = useWorkspace();
    const [tab, setTab] = useState('Targets');
    const [draft, setDraft] = useState(policies);
    const [saved, setSaved] = useState(policies);
    const [editing, setEditing] = useState(null);

    // Reset the draft when the saved policies change, adjusting state during
    // render rather than in an effect (no second render pass).
    if (saved !== policies) {
        setSaved(policies);
        setDraft(policies);
    }

    const dirty = JSON.stringify(draft) !== JSON.stringify(policies);

    const updatePolicy = (n, patch) =>
        setDraft((prev) => prev.map((p) => (p.n === n ? { ...p, ...patch } : p)));

    const addPolicy = () => {
        setDraft((prev) => {
            const next = [...prev];
            next.splice(next.length - 1, 0, blankPolicy(next.length - 1));
            return next.map((p, i) => ({ ...p, n: String(i + 1).padStart(2, '0') }));
        });
        toast('Policy added — save to keep it');
    };

    const save = () => {
        savePolicies(draft);
        setEditing(null);
        toast('Response targets saved');
    };

    const discard = () => {
        setDraft(policies);
        setEditing(null);
        toast('Changes discarded');
    };

    return (
        <div className="w-full flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1040px] px-8 py-8">
                <header>
                    <p className="label">Settings</p>
                    <h1 className="mt-2 text-[32px]">Response targets</h1>
                </header>

                <div className="mt-6 flex gap-6 border-b rule" role="tablist" aria-label="Settings sections">
                    {settingsTabs.map((name) => (
                        <button
                            key={name}
                            type="button"
                            role="tab"
                            aria-selected={tab === name}
                            onClick={() => setTab(name)}
                            className={`-mb-px border-b-2 pb-2 font-heading text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                                tab === name ? 'border-ink text-ink' : 'border-transparent text-neutral-600 hover:text-ink'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {tab !== 'Targets' ? (
                    <p className="py-16 text-center text-[15px] text-neutral-600">
                        {tab} settings are not part of this demo workspace.
                    </p>
                ) : (
                    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
                        <div>
                            <section aria-labelledby="policies-heading">
                                <h2 id="policies-heading" className="text-[24px]">Policies</h2>
                                <p className="mt-2 max-w-[540px] text-[14px] leading-relaxed text-neutral-700">
                                    A conversation takes the first policy whose conditions match, read top to bottom.
                                </p>

                                <ul className="mt-6">
                                    {draft.map((policy) => {
                                        const isEditing = editing === policy.n;
                                        return (
                                            <li key={policy.n} className="border-b py-5 rule-soft">
                                                <div className="flex items-start justify-between gap-6">
                                                    <div className="flex min-w-0 gap-4">
                                                        <span className="font-mono text-[13px] text-accent-600">{policy.n}</span>
                                                        <div className="min-w-0">
                                                            {isEditing ? (
                                                                <div className="space-y-2">
                                                                    <label className="label block" htmlFor={`name-${policy.n}`}>
                                                                        Policy name
                                                                    </label>
                                                                    <input
                                                                        id={`name-${policy.n}`}
                                                                        className="input"
                                                                        value={policy.name}
                                                                        onChange={(e) => updatePolicy(policy.n, { name: e.target.value })}
                                                                    />
                                                                    <label className="label block" htmlFor={`cond-${policy.n}`}>
                                                                        Applies when
                                                                    </label>
                                                                    <input
                                                                        id={`cond-${policy.n}`}
                                                                        className="input"
                                                                        value={policy.condition}
                                                                        onChange={(e) => updatePolicy(policy.n, { condition: e.target.value })}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <h3 className="text-[19px]">{policy.name}</h3>
                                                                    <p className="mt-1 max-w-[420px] text-[13px] text-neutral-600">
                                                                        {policy.condition}
                                                                    </p>
                                                                    {(policy.resolution || policy.escalates) && (
                                                                        <p className="mt-3 text-[12px] text-neutral-600">
                                                                            {policy.resolution && <>Resolution target · {policy.resolution}</>}
                                                                            {policy.escalates && <> · Escalates to · {policy.escalates}</>}
                                                                            {policy.applies && <> · Applies to · {policy.applies}</>}
                                                                        </p>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        {isEditing ? (
                                                            <>
                                                                <label className="label block text-right" htmlFor={`target-${policy.n}`}>
                                                                    First response
                                                                </label>
                                                                <input
                                                                    id={`target-${policy.n}`}
                                                                    className="input mt-1 w-28 text-right font-mono"
                                                                    value={policy.target}
                                                                    onChange={(e) => updatePolicy(policy.n, { target: e.target.value })}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditing(null)}
                                                                    className="btn btn-secondary mt-3 px-3 py-1 text-[13px]"
                                                                >
                                                                    Done
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="font-mono text-[22px] leading-none tabular-nums text-ink">
                                                                    {policy.target}
                                                                </p>
                                                                <p className="label mt-1">first response</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditing(policy.n)}
                                                                    className="btn btn-secondary mt-3 px-3 py-1 text-[13px]"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <button type="button" onClick={addPolicy} className="btn btn-secondary mt-5">
                                    Add a policy
                                </button>
                            </section>

                            <section className="mt-12" aria-labelledby="missed-heading">
                                <h2 id="missed-heading" className="text-[24px]">When a target is missed</h2>
                                <ul className="mt-5 space-y-3">
                                    {missedActions.map((action) => (
                                        <li key={action.title} className="flex items-start justify-between gap-6 border p-4 rule-soft">
                                            <div>
                                                <p className="text-[15px] text-ink">{action.title}</p>
                                                <p className="mt-1 text-[13px] text-neutral-600">{action.note}</p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={action.on}
                                                aria-label={action.title}
                                                onClick={() => toggleMissedAction(action.title)}
                                                className={`mt-1 h-5 w-9 shrink-0 border transition-colors rule ${
                                                    action.on ? 'bg-ink' : 'bg-neutral-200'
                                                }`}
                                            >
                                                <span
                                                    className={`block h-4 w-4 bg-white transition-transform ${
                                                        action.on ? 'translate-x-4' : 'translate-x-0'
                                                    }`}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="mt-10 flex items-center gap-3">
                                <button type="button" onClick={save} disabled={!dirty} className="btn btn-primary">
                                    Save changes
                                </button>
                                <button type="button" onClick={discard} disabled={!dirty} className="btn btn-secondary">
                                    Discard
                                </button>
                                {dirty && <p className="text-[13px] text-neutral-600">Unsaved changes</p>}
                            </div>
                        </div>

                        <aside className="space-y-8">
                            <section aria-labelledby="effect-heading">
                                <h2 id="effect-heading" className="label mb-3">Effect on last 30 days</h2>
                                <p className="text-[13px] leading-relaxed text-neutral-700">{policyEffect.headline}</p>
                                <ul className="mt-4 space-y-3">
                                    {policyEffect.rows.map((row) => (
                                        <li key={row.name}>
                                            <p className="flex justify-between text-[13px]">
                                                <span className="text-ink">{row.name}</span>
                                                <span className="font-mono tabular-nums text-neutral-600">
                                                    {row.volume} · {row.compliance}%
                                                </span>
                                            </p>
                                            <span className="mt-1 block h-2 bg-neutral-200">
                                                <span className="block h-2 bg-accent-400" style={{ width: `${row.compliance}%` }} />
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section aria-labelledby="changes-heading">
                                <h2 id="changes-heading" className="label mb-3">Recent changes</h2>
                                <ul className="space-y-3">
                                    {recentChanges.map((item) => (
                                        <li key={item.change}>
                                            <p className="text-[13px] text-ink">{item.change}</p>
                                            <p className="text-[12px] text-neutral-600">{item.who}</p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};
