/**
 * The SLA worker. One pass a minute is enough: due_at is a timestamp, so a
 * breach is late by at most the interval, and nothing depends on the worker
 * having run for the browser to show the right remaining time.
 */

import type { Database } from './db.ts';
import { tick } from './sla/engine.ts';

export interface WorkerLogger {
    info: (details: object, message: string) => void;
    error: (details: object, message: string) => void;
}

export interface WorkerOptions {
    intervalMs?: number;
    logger?: WorkerLogger;
}

export function startWorker(db: Database, options: WorkerOptions = {}) {
    const intervalMs = options.intervalMs ?? 60_000;
    let running = false;

    const pass = async () => {
        // Skips rather than queues: a slow pass must not stack up behind itself.
        if (running) return;
        running = true;
        try {
            const result = await tick(db);
            if (result.breaches.length > 0 || result.paused > 0 || result.resumed > 0) {
                options.logger?.info(
                    {
                        breaches: result.breaches.length,
                        paused: result.paused,
                        resumed: result.resumed,
                    },
                    'sla sweep'
                );
            }
        } catch (error) {
            options.logger?.error({ err: error }, 'sla sweep failed');
        } finally {
            running = false;
        }
    };

    const timer = setInterval(() => void pass(), intervalMs);
    // Never the reason a process stays alive.
    timer.unref();

    return { stop: () => clearInterval(timer), pass };
}
