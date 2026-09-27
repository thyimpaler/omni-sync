/**
 * The SLA clock's arithmetic. plan.md calls correctness across time zones,
 * business hours and DST the product's entire claim and the third-highest risk,
 * so the cases below are deliberately the awkward ones.
 */

import { describe, expect, it } from 'vitest';

import {
    addWorkingSeconds,
    businessWeekFrom,
    isOpen,
    nextOpening,
    workingSecondsBetween,
    type BusinessWeek,
} from '../src/sla/business-hours.ts';

/** 08:00–20:00, Monday to Friday, London: what the product's copy promises. */
const london: BusinessWeek = businessWeekFrom(
    [1, 2, 3, 4, 5].map((weekday) => ({
        weekday,
        opens_at: '08:00:00',
        closes_at: '20:00:00',
    })),
    'Europe/London'
);

const newYork: BusinessWeek = businessWeekFrom(
    [1, 2, 3, 4, 5].map((weekday) => ({
        weekday,
        opens_at: '09:00:00',
        closes_at: '17:00:00',
    })),
    'America/New_York'
);

const alwaysOpen: BusinessWeek = businessWeekFrom([], 'Europe/London');

const minutes = (count: number) => count * 60;

describe('inside and outside opening hours', () => {
    it.each([
        ['Wednesday at 11:05 GMT', '2026-01-14T11:05:00Z', true],
        ['Wednesday at 07:59 GMT', '2026-01-14T07:59:00Z', false],
        ['Wednesday at 20:00 GMT, on the dot', '2026-01-14T20:00:00Z', false],
        ['Saturday at 11:05 GMT', '2026-01-17T11:05:00Z', false],
        // 12:00 BST is 11:00 UTC — an instant an hour outside the window if the
        // zone is ignored.
        ['Wednesday at 07:30 BST', '2026-07-15T06:30:00Z', false],
        ['Wednesday at 08:30 BST', '2026-07-15T07:30:00Z', true],
    ])('%s', (_name, iso, expected) => {
        expect(isOpen(new Date(iso), london)).toBe(expected);
    });

    it('is always open when no hours are configured', () => {
        expect(isOpen(new Date('2026-01-17T03:00:00Z'), alwaysOpen)).toBe(true);
    });
});

describe('a target that fits inside the working day', () => {
    it('is simply added on', () => {
        const due = addWorkingSeconds(new Date('2026-01-14T11:05:00Z'), minutes(5), london);
        expect(due.toISOString()).toBe('2026-01-14T11:10:00.000Z');
    });
});

describe('a target that runs past closing', () => {
    it('resumes the next working morning', () => {
        // 19:58 Thursday, five minutes to answer: two before the doors close,
        // three after they open again.
        const due = addWorkingSeconds(new Date('2026-01-15T19:58:00Z'), minutes(5), london);
        expect(due.toISOString()).toBe('2026-01-16T08:03:00.000Z');
    });

    it('carries a Friday evening over the weekend', () => {
        const due = addWorkingSeconds(new Date('2026-01-16T19:58:00Z'), minutes(5), london);
        expect(due.toISOString()).toBe('2026-01-19T08:03:00.000Z');
    });

    it('starts the clock at opening for a message that arrived overnight', () => {
        // 03:00 Saturday. Nothing is owed until Monday morning.
        const due = addWorkingSeconds(new Date('2026-01-17T03:00:00Z'), minutes(30), london);
        expect(due.toISOString()).toBe('2026-01-19T08:30:00.000Z');
    });

    it('spans several closed days when the target is long', () => {
        // A four-hour resolution target starting at 18:00 Friday: two hours on
        // Friday, two on Monday morning.
        const due = addWorkingSeconds(new Date('2026-01-16T18:00:00Z'), minutes(240), london);
        expect(due.toISOString()).toBe('2026-01-19T10:00:00.000Z');
    });
});

describe('daylight saving', () => {
    it('holds the working day at 08:00 local when the clocks go forward', () => {
        // Friday 27 March 2026 19:58 GMT. The UK springs forward on 29 March,
        // so Monday's 08:00 is 07:00 UTC, not 08:00.
        const due = addWorkingSeconds(new Date('2026-03-27T19:58:00Z'), minutes(5), london);
        expect(due.toISOString()).toBe('2026-03-30T07:03:00.000Z');
    });

    it('holds it when the clocks go back', () => {
        // Friday 23 October 2026 18:58 BST (17:58 UTC); the UK falls back on
        // 25 October, so Monday's 08:00 is 08:00 UTC again.
        const due = addWorkingSeconds(new Date('2026-10-23T18:58:00Z'), minutes(5), london);
        expect(due.toISOString()).toBe('2026-10-26T08:03:00.000Z');
    });

    it('measures a working week across the spring change as unchanged', () => {
        // Monday 08:00 to Friday 20:00 is five twelve-hour days, whatever the
        // clocks did in between.
        const from = new Date('2026-03-23T08:00:00Z');
        const to = new Date('2026-03-27T20:00:00Z');
        expect(workingSecondsBetween(from, to, london)).toBe(5 * 12 * 3600);
    });

    it("is computed in the workspace's zone, not the server's", () => {
        // 21:30 UTC on a Tuesday is 16:30 in New York: half an hour of working
        // time left that day, so a one-hour target lands at 09:30 Wednesday.
        const due = addWorkingSeconds(new Date('2026-01-13T21:30:00Z'), minutes(60), newYork);
        expect(due.toISOString()).toBe('2026-01-14T14:30:00.000Z');
    });
});

describe('elapsed working time', () => {
    it('ignores the hours nobody was working', () => {
        // 19:00 Friday to 09:00 Monday: one hour on Friday, one on Monday.
        const elapsed = workingSecondsBetween(
            new Date('2026-01-16T19:00:00Z'),
            new Date('2026-01-19T09:00:00Z'),
            london
        );
        expect(elapsed).toBe(2 * 3600);
    });

    it('is zero when the range runs backwards', () => {
        expect(
            workingSecondsBetween(new Date('2026-01-19T09:00:00Z'), new Date('2026-01-16T19:00:00Z'), london)
        ).toBe(0);
    });

    it('counts every second when there are no business hours', () => {
        const elapsed = workingSecondsBetween(
            new Date('2026-01-17T00:00:00Z'),
            new Date('2026-01-17T01:00:00Z'),
            alwaysOpen
        );
        expect(elapsed).toBe(3600);
    });
});

describe('the next opening', () => {
    it('is Monday morning for a message that arrives on Saturday', () => {
        expect(nextOpening(new Date('2026-01-17T12:00:00Z'), london)?.toISOString()).toBe(
            '2026-01-19T08:00:00.000Z'
        );
    });

    it('is this morning for a message that arrives before opening', () => {
        expect(nextOpening(new Date('2026-01-14T06:00:00Z'), london)?.toISOString()).toBe(
            '2026-01-14T08:00:00.000Z'
        );
    });

    it('is null while the doors are open', () => {
        expect(nextOpening(new Date('2026-01-14T11:00:00Z'), london)).toBeNull();
    });
});
