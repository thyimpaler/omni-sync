import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSeo } from './seo';

const content = (selector: string) => document.head.querySelector(selector)?.getAttribute('content') ?? null;

afterEach(() => {
    document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((el) => el.remove());
});

describe('useSeo', () => {
    it('suffixes the site name onto a page title', () => {
        renderHook(() => useSeo({ title: 'Careers' }));
        expect(document.title).toBe('Careers | OmniSync');
    });

    it('uses the full positioning line when a page has no title of its own', () => {
        renderHook(() => useSeo());
        expect(document.title).toBe('OmniSync — Every customer message in one queue, with a clock on it');
    });

    it('creates the meta tags when the document has none', () => {
        renderHook(() => useSeo({ title: 'Contact', description: 'Talk to a person.' }));

        expect(content('meta[name="description"]')).toBe('Talk to a person.');
        expect(content('meta[property="og:title"]')).toBe('Contact | OmniSync');
        expect(content('meta[property="og:description"]')).toBe('Talk to a person.');
        expect(content('meta[name="twitter:title"]')).toBe('Contact | OmniSync');
    });

    it('updates tags that already exist rather than appending duplicates', () => {
        const existing = document.createElement('meta');
        existing.setAttribute('name', 'description');
        existing.setAttribute('content', 'stale');
        document.head.appendChild(existing);

        renderHook(() => useSeo({ description: 'fresh' }));

        expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
        expect(content('meta[name="description"]')).toBe('fresh');
    });

    it('falls back to the default description when a page does not set one', () => {
        renderHook(() => useSeo({ title: 'Blog' }));
        expect(content('meta[name="description"]')).toMatch(/one shared inbox/);
    });

    it('sets a canonical link without the query string', () => {
        renderHook(() => useSeo({ title: 'Privacy Policy' }));
        const canonical = document.head.querySelector('link[rel="canonical"]');
        expect(canonical?.getAttribute('href')).toBe(window.location.origin + window.location.pathname);
    });

    it('keeps one canonical link across re-renders', () => {
        const { rerender } = renderHook(({ title }) => useSeo({ title }), {
            initialProps: { title: 'One' },
        });
        rerender({ title: 'Two' });

        expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
        expect(document.title).toBe('Two | OmniSync');
    });
});
