import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useSeo } from '../lib/seo';
import type { ReactNode } from 'react';

interface PageShellProps {
    title: string;
    eyebrow?: string;
    intro?: string;
    seoTitle?: string;
    seoDescription?: string;
    width?: string;
    children: ReactNode;
}

export interface ContentSection {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
}

/** Shared chrome for every non-landing marketing page. */
export const PageShell = ({
    title,
    eyebrow,
    intro,
    seoTitle,
    seoDescription,
    width = 'max-w-[860px]',
    children,
}: PageShellProps) => {
    useSeo({ title: seoTitle ?? title, description: seoDescription });

    return (
        <div className="min-h-screen bg-ground text-ink">
            <Navbar />

            <main id="main" className={`mx-auto px-6 pb-20 pt-14 ${width}`}>
                <header className="border-b pb-10 rule">
                    {eyebrow && <p className="label">{eyebrow}</p>}
                    <h1 className="mt-4 text-[40px] leading-[1.08] md:text-[48px]">{title}</h1>
                    {intro && <p className="mt-5 max-w-[620px] text-[17px] leading-relaxed text-neutral-700">{intro}</p>}
                </header>

                <div className="pt-10">{children}</div>
            </main>

            <Footer />
        </div>
    );
};

/** Renders the {heading, paragraphs, bullets} shape used by the content module. */
export const ContentSections = ({ sections }: { sections: ContentSection[] }) => (
    <div className="space-y-10">
        {sections.map((section) => (
            <section key={section.heading}>
                <h2 className="border-b pb-2 text-[24px] rule-soft">{section.heading}</h2>
                {section.paragraphs?.map((p) => (
                    <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-neutral-700">
                        {p}
                    </p>
                ))}
                {section.bullets && (
                    <ul className="mt-4 space-y-2">
                        {section.bullets.map((b) => (
                            <li key={b.slice(0, 40)} className="flex gap-3 leading-relaxed text-neutral-700">
                                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-accent-600" aria-hidden="true" />
                                {b}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        ))}
    </div>
);
