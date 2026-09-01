import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell, ContentSections } from '../components/PageShell';
import { privacySections, termsSections, cookieSections, LAST_UPDATED } from '../content/site';

/** One page, three documents — they share a layout, so they share a component. */
const DOCS = {
    privacy: {
        title: 'Privacy Policy',
        intro: 'What we collect, why we collect it, and what you can ask us to do with it.',
        sections: privacySections,
    },
    terms: {
        title: 'Terms of Service',
        intro: 'The agreement between your organisation and OmniSync.',
        sections: termsSections,
    },
    cookies: {
        title: 'Cookie Policy',
        intro: 'The short version: session, preferences, and analytics you opt into. Nothing for advertising.',
        sections: cookieSections,
    },
};

const OTHER_LINKS = [
    { to: '/privacy', label: 'Privacy Policy', key: 'privacy' },
    { to: '/terms', label: 'Terms of Service', key: 'terms' },
    { to: '/cookies', label: 'Cookie Policy', key: 'cookies' },
];

type DocKey = keyof typeof DOCS;

export const LegalPage = ({ doc }: { doc: DocKey }) => {
    const { title, intro, sections } = DOCS[doc];

    return (
        <PageShell
            eyebrow={`Last updated ${LAST_UPDATED}`}
            title={title}
            intro={intro}
            seoDescription={intro}
        >
            <ContentSections sections={sections} />

            <p className="mt-12 border-l-2 pl-4 text-[14px] text-neutral-600 rule">
                OmniSync is a portfolio product. These documents describe how the service is designed to
                operate and are not a substitute for legal advice on your own deployment. Questions:{' '}
                <a
                    href="mailto:privacy@omnisync.app"
                    className="text-accent-700 underline-offset-2 hover:underline"
                >
                    privacy@omnisync.app
                </a>
                .
            </p>

            <nav aria-label="Other legal documents" className="mt-8 flex flex-wrap gap-5 text-[14px]">
                {OTHER_LINKS.filter((link) => link.key !== doc).map((link) => (
                    <Link
                        key={link.key}
                        to={link.to}
                        className="text-neutral-600 transition-colors hover:text-ink"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </PageShell>
    );
};
