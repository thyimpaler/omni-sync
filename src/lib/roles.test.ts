import { describe, expect, it } from 'vitest';

import { atLeast } from './roles';

describe('the role ladder', () => {
    it.each([
        ['owner', 'admin', true],
        ['admin', 'admin', true],
        ['agent', 'admin', false],
        ['agent', 'agent', true],
        ['viewer', 'agent', false],
        ['viewer', 'viewer', true],
        ['owner', 'viewer', true],
    ] as const)('%s meeting a %s bar is %s', (role, minimum, expected) => {
        expect(atLeast(role, minimum)).toBe(expected);
    });

    it('treats no membership as no permission', () => {
        // A user who belongs to no workspace must not clear the lowest bar.
        expect(atLeast(null, 'viewer')).toBe(false);
        expect(atLeast(undefined, 'viewer')).toBe(false);
    });
});
