import React from 'react';

const numbers = [
    { value: '3m 41s', note: 'Median first response across customer workspaces, August 2026' },
    { value: '2', note: 'Channels today: WhatsApp Business and Instagram Direct. Messenger is next.' },
    { value: '4 min', note: 'Median time from signup to a first message landing in the inbox' },
];

export const Numbers = () => (
    <section className="border-b rule" aria-label="Where the claims come from">
        <dl className="mx-auto grid max-w-[1240px] px-6 md:grid-cols-3">
            {numbers.map((n) => (
                <div key={n.value} className="border-b py-8 last:border-b-0 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0 rule-soft">
                    <dt className="font-heading text-[40px] font-semibold leading-none text-ink">{n.value}</dt>
                    <dd className="mt-3 max-w-[324px] text-[14px] leading-snug text-neutral-600">{n.note}</dd>
                </div>
            ))}
        </dl>
    </section>
);
