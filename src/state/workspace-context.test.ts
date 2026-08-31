import { describe, expect, it } from 'vitest';
import { waitingSeconds } from './workspace-context';

describe('waitingSeconds', () => {
    it('converts mm:ss to seconds', () => {
        expect(waitingSeconds('04:12')).toBe(252);
        expect(waitingSeconds('00:00')).toBe(0);
    });

    it('handles waits past an hour, which the queue shows as minutes', () => {
        expect(waitingSeconds('90:30')).toBe(5430);
    });

    it('sorts longest-waiting first — the whole point of the queue', () => {
        const waits = ['04:12', '31:05', '02:47', '11:30', '—'];
        const sorted = [...waits].sort((a, b) => waitingSeconds(b) - waitingSeconds(a));
        expect(sorted).toEqual(['31:05', '11:30', '04:12', '02:47', '—']);
    });

    it('ranks a stopped clock below every live one, not above', () => {
        // An em dash sorted as 0 would place resolved conversations mid-queue.
        expect(waitingSeconds('—')).toBeLessThan(waitingSeconds('00:00'));
    });

    it('treats missing values as a stopped clock rather than throwing', () => {
        expect(waitingSeconds(null)).toBe(-1);
        expect(waitingSeconds(undefined)).toBe(-1);
        expect(waitingSeconds('')).toBe(-1);
    });

    it('does not produce NaN for malformed input', () => {
        expect(waitingSeconds('not a time')).toBe(-1);
        expect(waitingSeconds('12')).toBe(720);
    });
});
