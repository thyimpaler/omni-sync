import { useEffect } from 'react';

const SITE_NAME = 'OmniSync';
const DEFAULT_DESCRIPTION =
    'OmniSync pulls WhatsApp Business and Instagram Direct into one shared inbox, puts a response target on every conversation, and tells you who is about to miss theirs.';

const setMeta = (selector: string, attr: string, value: string): void => {
    let el = document.head.querySelector(selector);
    if (!el) {
        const name = selector.match(/\[(?:name|property)="([^"]+)"\]/)?.[1];
        if (!name) return;
        el = document.createElement('meta');
        el.setAttribute(selector.includes('property=') ? 'property' : 'name', name);
        document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
};

export interface SeoOptions {
    title?: string;
    description?: string;
}

/**
 * Keeps <title>, the meta description and the social cards in sync with the
 * route the visitor is actually on — the SPA would otherwise keep the shell's
 * tags on every page.
 */
export const useSeo = ({ title, description = DEFAULT_DESCRIPTION }: SeoOptions = {}): void => {
    useEffect(() => {
        const fullTitle = title
            ? `${title} | ${SITE_NAME}`
            : `${SITE_NAME} — Every customer message in one queue, with a clock on it`;
        document.title = fullTitle;
        setMeta('meta[name="description"]', 'content', description);
        setMeta('meta[property="og:title"]', 'content', fullTitle);
        setMeta('meta[property="og:description"]', 'content', description);
        setMeta('meta[name="twitter:title"]', 'content', fullTitle);
        setMeta('meta[name="twitter:description"]', 'content', description);

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', window.location.origin + window.location.pathname);
    }, [title, description]);
};
