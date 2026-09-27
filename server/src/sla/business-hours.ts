/**
 * Working-time arithmetic in a workspace's own time zone.
 *
 * The SLA clock is the product, and it is measured in the hours a team actually
 * works: a message at 19:58 on Friday with a five-minute target is not late at
 * 20:03, it is due three minutes into Monday. Time zones and daylight saving
 * make that harder than it reads, so every conversion between wall-clock time
 * and an instant goes through `instantAt` below rather than through the local
 * clock of whichever machine happens to be running the worker.
 */

/** Minutes from midnight, in the workspace's zone. */
export interface BusinessDay {
    opens: number;
    closes: number;
}

export interface BusinessWeek {
    timeZone: string;
    /** Seven entries, index 0 = Sunday, matching Postgres's `extract(dow)`. */
    days: ReadonlyArray<BusinessDay | null>;
}

export interface BusinessHoursRow {
    weekday: number;
    opens_at: string;
    closes_at: string;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
    let formatter = formatters.get(timeZone);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone,
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        formatters.set(timeZone, formatter);
    }
    return formatter;
}

interface WallClock {
    year: number;
    month: number;
    day: number;
    minuteOfDay: number;
    /** 0 = Sunday. */
    weekday: number;
}

/** What a wall clock in `timeZone` reads at this instant. */
export function wallClock(instant: Date, timeZone: string): WallClock {
    const parts = formatterFor(timeZone).formatToParts(instant);
    const value = (type: Intl.DateTimeFormatPartTypes): number => {
        const part = parts.find((candidate) => candidate.type === type);
        return part ? Number(part.value) : 0;
    };

    const year = value('year');
    const month = value('month');
    const day = value('day');
    // 24:00:00 is how some locales render midnight; it means the next day has
    // just started, not that a 25th hour exists.
    const hour = value('hour') % 24;

    return {
        year,
        month,
        day,
        minuteOfDay: hour * 60 + value('minute'),
        weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    };
}

function asUtcMillis(clock: WallClock, secondsOfDay = clock.minuteOfDay * 60): number {
    return Date.UTC(clock.year, clock.month - 1, clock.day) + secondsOfDay * 1000;
}

/** How far ahead of UTC `timeZone` is at this instant, in milliseconds. */
function offsetAt(instant: Date, timeZone: string): number {
    const clock = wallClock(instant, timeZone);
    const parts = formatterFor(timeZone).formatToParts(instant);
    const seconds = Number(parts.find((part) => part.type === 'second')?.value ?? 0);
    return asUtcMillis(clock, clock.minuteOfDay * 60 + seconds) - instant.getTime();
}

/**
 * The instant at which the wall clock in `timeZone` reads this date and minute.
 * Applied twice because the first correction uses the offset in force at the
 * wrong moment — which is exactly what goes wrong on the two days a year the
 * offset changes.
 */
export function instantAt(
    year: number,
    month: number,
    day: number,
    minuteOfDay: number,
    timeZone: string
): Date {
    const naive = Date.UTC(year, month - 1, day) + minuteOfDay * 60_000;
    const firstGuess = naive - offsetAt(new Date(naive), timeZone);
    return new Date(naive - offsetAt(new Date(firstGuess), timeZone));
}

function startOfNextDay(clock: WallClock, timeZone: string): Date {
    const tomorrow = new Date(Date.UTC(clock.year, clock.month - 1, clock.day) + 86_400_000);
    return instantAt(
        tomorrow.getUTCFullYear(),
        tomorrow.getUTCMonth() + 1,
        tomorrow.getUTCDate(),
        0,
        timeZone
    );
}

/** The open window on the day `instant` falls in, or null if it is a closed day. */
function windowFor(instant: Date, week: BusinessWeek): { open: Date; close: Date } | null {
    const clock = wallClock(instant, week.timeZone);
    const day = week.days[clock.weekday];
    if (!day) return null;
    return {
        open: instantAt(clock.year, clock.month, clock.day, day.opens, week.timeZone),
        close: instantAt(clock.year, clock.month, clock.day, day.closes, week.timeZone),
    };
}

export function hasOpenDays(week: BusinessWeek): boolean {
    return week.days.some((day) => day !== null);
}

export function isOpen(instant: Date, week: BusinessWeek): boolean {
    // A workspace that has configured no hours is never closed — the same rule
    // the other two functions here follow.
    if (!hasOpenDays(week)) return true;
    const window = windowFor(instant, week);
    if (!window) return false;
    return instant >= window.open && instant < window.close;
}

/** How long until the doors open again, or null if they already are. */
export function nextOpening(instant: Date, week: BusinessWeek): Date | null {
    if (!hasOpenDays(week) || isOpen(instant, week)) return null;

    let cursor = instant;
    for (let guard = 0; guard < 400; guard += 1) {
        const window = windowFor(cursor, week);
        if (window && cursor < window.open) return window.open;
        cursor = startOfNextDay(wallClock(cursor, week.timeZone), week.timeZone);
    }
    return null;
}

/**
 * `start` plus `seconds` of working time. A workspace with no business hours
 * configured is treated as always open, which is also what a policy with
 * `business_hours_only = false` gets.
 */
export function addWorkingSeconds(start: Date, seconds: number, week: BusinessWeek): Date {
    if (!hasOpenDays(week)) return new Date(start.getTime() + seconds * 1000);

    let remaining = seconds;
    let cursor = start;

    for (let guard = 0; guard < 400; guard += 1) {
        const window = windowFor(cursor, week);
        if (window && cursor < window.close) {
            const from = cursor > window.open ? cursor : window.open;
            const availableSeconds = (window.close.getTime() - from.getTime()) / 1000;
            if (availableSeconds >= remaining) {
                return new Date(from.getTime() + remaining * 1000);
            }
            remaining -= availableSeconds;
        }
        cursor = startOfNextDay(wallClock(cursor, week.timeZone), week.timeZone);
    }

    throw new Error(`could not place ${seconds}s of working time within a year of ${start.toISOString()}`);
}

/** Working seconds elapsed between two instants. Negative ranges count as zero. */
export function workingSecondsBetween(from: Date, to: Date, week: BusinessWeek): number {
    if (to <= from) return 0;
    if (!hasOpenDays(week)) return (to.getTime() - from.getTime()) / 1000;

    let total = 0;
    let cursor = from;

    for (let guard = 0; guard < 400 && cursor < to; guard += 1) {
        const window = windowFor(cursor, week);
        if (window) {
            const start = cursor > window.open ? cursor : window.open;
            const end = to < window.close ? to : window.close;
            if (end > start) total += (end.getTime() - start.getTime()) / 1000;
        }
        cursor = startOfNextDay(wallClock(cursor, week.timeZone), week.timeZone);
    }

    return total;
}

/** Rows as `business_hours` stores them, in the workspace's zone. */
export function businessWeekFrom(rows: BusinessHoursRow[], timeZone: string): BusinessWeek {
    const days: Array<BusinessDay | null> = [null, null, null, null, null, null, null];

    for (const row of rows) {
        const opens = minutesFromTime(row.opens_at);
        const closes = minutesFromTime(row.closes_at);
        if (opens !== null && closes !== null && closes > opens) {
            days[row.weekday] = { opens, closes };
        }
    }

    return { timeZone, days };
}

function minutesFromTime(value: string): number | null {
    const match = /^(\d{2}):(\d{2})/.exec(value);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
}
