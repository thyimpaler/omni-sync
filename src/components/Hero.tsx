import React from 'react';
import { Link } from 'react-router-dom';

/* The preview is the real queue shape: name, channel + subject, wait time.
   State reads through value — solid block for breached, pale tint for warning,
   plain type for on track. */
const previewRows = [
    { name: 'Amanda Smith', meta: 'WhatsApp · package not delivered', time: '04:12', state: 'breached' },
    { name: 'Elena Rodriguez', meta: 'WhatsApp · bulk quote', time: '11:30', state: 'warning' },
    { name: 'Michael Chen', meta: 'Instagram · shipping question', time: '14:02', state: 'ontime' },
];

const InboxPreview = () => (
    <div>
        <div className="panel">
            <div className="flex items-baseline justify-between border-b px-4 py-3 rule">
                <span className="label-ink">Inbox</span>
                <span className="text-[12px] text-neutral-600">sorted by wait time</span>
            </div>
            <ul>
                {previewRows.map((row) => (
                    <li
                        key={row.name}
                        className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0 rule-soft"
                    >
                        <span className="min-w-0">
                            <span className="block truncate font-heading text-[16px] font-semibold text-ink">
                                {row.name}
                            </span>
                            <span className="block truncate text-[13px] text-neutral-600">{row.meta}</span>
                        </span>
                        <span className={`sla sla-${row.state}`}>
                            <span>{row.time}</span>
                            {row.state === 'breached' && <span className="sla-state">Breached</span>}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
        <p className="mt-3 text-[13px] text-neutral-600">
            The actual inbox. Solid block means the target has already been missed.
        </p>
    </div>
);

export const Hero = () => (
    <section className="border-b rule">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-6 py-16 md:py-20 lg:grid-cols-2 lg:items-center">
            <div>
                <p className="label">WhatsApp and Instagram · one inbox</p>
                <h1 className="mt-6 text-[44px] leading-[1.05] md:text-[60px] lg:text-[64px]">
                    Every customer message in one queue, with a clock on it.
                </h1>
                <p className="mt-6 max-w-[470px] text-[17px] leading-relaxed text-neutral-700">
                    OmniSync pulls your WhatsApp Business and Instagram Direct messages into a single shared
                    inbox, puts a response target on each one, and tells you who is about to miss theirs.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/signup" className="btn btn-primary px-6 py-3">
                        Start free for 14 days
                    </Link>
                    <Link to="/contact" className="btn btn-secondary px-6 py-3">
                        Book a walkthrough
                    </Link>
                </div>
                <p className="mt-5 text-[13px] text-neutral-600">
                    No card required · connect a channel in about four minutes
                </p>
            </div>

            <InboxPreview />
        </div>
    </section>
);
