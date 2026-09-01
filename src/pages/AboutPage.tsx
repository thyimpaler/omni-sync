import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageShell, ContentSections } from '../components/PageShell';
import { Link } from 'react-router-dom';
import { aboutSections, values } from '../content/site';

export const AboutPage = () => (
    <PageShell
        eyebrow="About us"
        title="We are here so nobody waits."
        intro="OmniSync is a small remote team building one thing well: a support inbox where the customer who has waited longest is impossible to miss."
        seoTitle="About"
        seoDescription="Why we built OmniSync, how the team works, and what we optimise for: the time between a customer asking and a human answering."
    >
        <ContentSections sections={aboutSections} />

        <h2 className="mb-6 mt-14 border-b pb-2 text-[24px] rule-soft">What we hold to</h2>
        <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
                <div key={value.title} className="border-l pl-5 rule-soft">
                    <h3 className="mb-2 text-[19px]">{value.title}</h3>
                    <p className="text-[14px] leading-relaxed text-neutral-600">{value.body}</p>
                </div>
            ))}
        </div>

        <div className="panel mt-14 flex flex-col items-center gap-6 p-8 text-center md:flex-row md:justify-between md:text-left">
            <div>
                <h2 className="text-[21px]">Want to see it on your own queue?</h2>
                <p className="mt-1 text-neutral-700">Fourteen days, no card, your real channels.</p>
            </div>
            <Link to="/signup" className="btn btn-primary shrink-0 px-6 py-3">
                Start free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
        </div>
    </PageShell>
);
