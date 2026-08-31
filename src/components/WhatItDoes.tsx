import React from 'react';

const items = [
    {
        n: '01',
        title: 'One shared inbox',
        body: 'Both channels in one list, with assignment, internal notes and a full history per customer.',
    },
    {
        n: '02',
        title: 'Response targets',
        body: 'Set a target per policy. Every conversation carries a visible clock, counted in business hours.',
    },
    {
        n: '03',
        title: 'Rules you write',
        body: 'Route and prioritise on tags, keywords and spend. Every rule that fires is logged in the thread.',
    },
    {
        n: '04',
        title: 'Reports that name the hour',
        body: 'Compliance by policy, channel, agent and hour of day, exportable as CSV.',
    },
];

export const WhatItDoes = () => (
    <section id="product" className="border-b rule" aria-labelledby="product-heading">
        <div className="mx-auto max-w-[1240px] px-6 py-16">
            <h2 id="product-heading" className="text-[34px] md:text-[38px]">What it does</h2>
            <p className="mt-4 max-w-[540px] text-[16px] leading-relaxed text-neutral-700">
                Four things, all of them plumbing. Nothing writes to a customer without an agent pressing send.
            </p>

            <ol className="mt-12 grid gap-px bg-[color-mix(in_srgb,#1d1f20_9%,transparent)] md:grid-cols-4">
                {items.map((item) => (
                    <li key={item.n} className="bg-ground md:px-6 md:first:pl-0">
                        <span className="font-mono text-[13px] text-accent-600">{item.n}</span>
                        <h3 className="mt-3 text-[21px]">{item.title}</h3>
                        <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">{item.body}</p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);
