import { describe, expect, it } from 'vitest';

import { matchPolicy, ruleBanner, type Policy } from '../src/sla/policies.ts';

const policy = (overrides: Partial<Policy>): Policy => ({
    id: overrides.id ?? 'policy',
    position: overrides.position ?? 1,
    name: overrides.name ?? 'Policy',
    conditions: overrides.conditions ?? null,
    first_response_target_seconds: overrides.first_response_target_seconds ?? 300,
    resolution_target_seconds: overrides.resolution_target_seconds ?? null,
    business_hours_only: overrides.business_hours_only ?? true,
    escalates_to: overrides.escalates_to ?? null,
    active: overrides.active ?? true,
});

const vip = policy({
    id: 'vip',
    position: 1,
    name: 'VIP delivery',
    conditions: { tags: ['vip'], keywords: ['delivery', 'order'] },
});
const instagram = policy({
    id: 'instagram',
    position: 2,
    name: 'Instagram',
    conditions: { channels: ['instagram'] },
});
const catchAll = policy({ id: 'catch-all', position: 3, name: 'Everything else' });

const all = [catchAll, instagram, vip];

describe('matching a conversation to a policy', () => {
    it('takes the first match by position, not by array order', () => {
        const matched = matchPolicy(all, {
            tags: ['vip'],
            channel: 'whatsapp',
            text: 'Where is my delivery?',
        });
        expect(matched?.id).toBe('vip');
    });

    it('needs every stated condition, not just one', () => {
        // A VIP asking about something else falls through to the catch-all.
        const matched = matchPolicy(all, {
            tags: ['vip'],
            channel: 'whatsapp',
            text: 'Do you have this in blue?',
        });
        expect(matched?.id).toBe('catch-all');
    });

    it('ignores case on both sides', () => {
        const matched = matchPolicy(all, {
            tags: ['VIP'],
            channel: 'WhatsApp',
            text: 'WHERE IS MY ORDER',
        });
        expect(matched?.id).toBe('vip');
    });

    it('matches on channel', () => {
        const matched = matchPolicy(all, { tags: [], channel: 'instagram', text: 'hello' });
        expect(matched?.id).toBe('instagram');
    });

    it('skips a policy that has been switched off', () => {
        const matched = matchPolicy([{ ...vip, active: false }, catchAll], {
            tags: ['vip'],
            channel: 'whatsapp',
            text: 'my delivery is late',
        });
        expect(matched?.id).toBe('catch-all');
    });

    it('returns nothing when no policy applies', () => {
        expect(matchPolicy([vip], { tags: [], channel: 'whatsapp', text: 'hello' })).toBeNull();
    });
});

describe('the banner a rule writes into the thread', () => {
    it('names the conditions that fired', () => {
        expect(ruleBanner(vip)).toBe('vip + delivery keyword + order keyword');
    });

    it('is absent for a catch-all, because nothing notable happened', () => {
        expect(ruleBanner(catchAll)).toBeNull();
    });
});
