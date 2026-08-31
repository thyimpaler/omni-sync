import React from 'react';
import { MapPin, Briefcase, Users } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { jobs, values } from '../content/site';

const perks = [
    'Fully remote, with a four-day week in August',
    'Equity for everyone, vesting from month one',
    'Real budget for hardware, learning and a desk that suits you',
    'Support rotation for every role — one day a month in the inbox',
];

export const CareersPage = () => (
    <PageShell
        eyebrow="Careers"
        title="Build the inbox you would want to work in."
        intro="We hire slowly, pay at the top of our band, and expect you to own your work end to end. Every role below is open and answered by a human within a week."
        seoTitle="Careers"
        seoDescription="Open roles at OmniSync — engineering, design and customer success. Remote-first, equity for everyone, no take-home tests longer than three hours."
    >
        <section aria-labelledby="open-roles">
            <h2 id="open-roles" className="mb-6 border-b pb-2 text-[24px] rule-soft">
                Open roles
            </h2>
            <ul className="space-y-4">
                {jobs.map((job) => (
                    <li key={job.title}>
                        <article className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between rule-soft">
                            <div>
                                <h3 className="text-[20px]">{job.title}</h3>
                                <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-neutral-700">{job.blurb}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-neutral-600">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                        {job.team}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                        {job.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                                        {job.type}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={`mailto:jobs@omnisync.app?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                                className="btn btn-secondary shrink-0 px-6 py-2.5"
                            >
                                Apply
                            </a>
                        </article>
                    </li>
                ))}
            </ul>
        </section>

        <section aria-labelledby="hiring" className="mt-14 grid gap-8 md:grid-cols-2">
            <div>
                <h2 id="hiring" className="mb-4 text-[21px]">
                    How hiring works
                </h2>
                <ol className="space-y-3 text-[14px] leading-relaxed text-neutral-700">
                    <li><span className="font-semibold text-ink">1.</span> A 30-minute call about what you have built.</li>
                    <li><span className="font-semibold text-ink">2.</span> A paid, three-hour exercise on a real problem from our backlog.</li>
                    <li><span className="font-semibold text-ink">3.</span> A session with the team you would join, plus a conversation with a customer.</li>
                    <li><span className="font-semibold text-ink">4.</span> Offer, within two working days of the last call.</li>
                </ol>
            </div>
            <div>
                <h2 className="mb-4 text-[21px]">What you get</h2>
                <ul className="space-y-3 text-[14px] leading-relaxed text-neutral-700">
                    {perks.map((perk) => (
                        <li key={perk} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent-600" aria-hidden="true" />
                            {perk}
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        <section className="mt-14">
            <h2 className="mb-6 border-b pb-2 text-[24px] rule-soft">
                How we think
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
                {values.map((value) => (
                    <div key={value.title} className="border-l pl-5 rule-soft">
                        <h3 className="mb-2 text-[19px]">{value.title}</h3>
                        <p className="text-[14px] leading-relaxed text-neutral-600">{value.body}</p>
                    </div>
                ))}
            </div>
        </section>

        <p className="mt-12 text-[14px] text-neutral-600">
            Nothing fits but you still want in? Send what you have built to{' '}
            <a href="mailto:jobs@omnisync.app" className="text-accent-700 underline-offset-2 hover:underline">
                jobs@omnisync.app
            </a>
            .
        </p>
    </PageShell>
);
