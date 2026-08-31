import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { Logo } from '../components/Logo';
import { onboardingSteps, onboardingChannels } from '../content/workspace';
import { useSeo } from '../lib/seo';
import type { OnboardingChannel } from '../types';

/* 1e — connect a channel, step 2 of 4. */
export const OnboardingPage = () => {
    useSeo({
        title: 'Set up your workspace',
        description: 'Connect WhatsApp Business and Instagram Direct to your OmniSync workspace.',
    });

    const [channels, setChannels] = useState<OnboardingChannel[]>(onboardingChannels);
    const connectedCount = channels.filter((c) => c.status === 'Connected').length;

    const connect = (name: string) => {
        setChannels((prev) =>
            prev.map((c) =>
                c.name === name
                    ? { ...c, status: 'Connected', action: 'Manage', primary: false, note: `${c.name} · connected just now` }
                    : c
            )
        );
        toast(`${name} connected`);
    };

    const steps = useMemo(
        () =>
            onboardingSteps.map((step) =>
                step.title === 'Connect channels'
                    ? { ...step, note: `${connectedCount} of 2 connected` }
                    : step
            ),
        [connectedCount]
    );

    return (
        <div className="min-h-screen bg-ground text-ink">
            <header className="border-b rule">
                <div className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-4">
                    <Link to="/" aria-label="OmniSync home">
                        <Logo size={22} />
                    </Link>
                    <p className="text-[13px] text-neutral-600">Setup · about 6 minutes left</p>
                </div>
            </header>

            <main id="main" className="mx-auto grid max-w-[1000px] gap-10 px-6 py-12 md:grid-cols-[220px_1fr]">
                <nav aria-label="Setup steps">
                    <p className="label mb-4">Four steps</p>
                    <ol className="space-y-4">
                        {steps.map((step) => (
                            <li key={step.title} className="flex gap-3">
                                <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-[12px] rule ${
                                        step.done ? 'bg-ink text-neutral-100' : step.current ? 'bg-accent-200 text-accent-900' : 'text-neutral-600'
                                    }`}
                                    aria-hidden="true"
                                >
                                    {step.done ? <Check className="h-3.5 w-3.5" /> : step.n}
                                </span>
                                <span>
                                    <span
                                        className={`block font-heading text-[15px] font-semibold ${
                                            step.current || step.done ? 'text-ink' : 'text-neutral-600'
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                    {step.note && <span className="block text-[12px] text-neutral-600">{step.note}</span>}
                                </span>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div>
                    <h1 className="text-[32px]">Connect your channels</h1>
                    <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-neutral-700">
                        Messages start arriving the moment a channel is connected. Nothing is sent on your behalf.
                    </p>

                    <ul className="mt-8">
                        {channels.map((channel) => (
                            <li
                                key={channel.name}
                                className="flex flex-wrap items-center justify-between gap-4 border-b py-5 rule-soft"
                            >
                                <div className={channel.muted ? 'opacity-60' : undefined}>
                                    <h2 className="text-[19px]">{channel.name}</h2>
                                    <p className="mt-1 max-w-[420px] text-[13px] text-neutral-600">{channel.note}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {channel.status && <span className="tag tag-accent">{channel.status}</span>}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            channel.action === 'Connect'
                                                ? connect(channel.name)
                                                : toast(`${channel.name} — not part of this demo`)
                                        }
                                        className={`btn py-1.5 ${channel.primary ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {channel.action}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-5 text-[13px] text-neutral-600">
                        You can add or remove channels at any time from Settings.
                    </p>

                    <div className="mt-10 flex gap-3">
                        <Link to="/signup" className="btn btn-secondary px-6">Back</Link>
                        <Link to="/example" className="btn btn-primary px-6">Continue</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};
