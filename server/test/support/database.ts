/**
 * The service's `Database` interface backed by PGlite, with the project's real
 * migrations applied. The routes, the ingest path and the SLA engine run
 * against actual Postgres in these tests — the same files `npm run test:db`
 * checks the RLS policies with.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PGlite } from '@electric-sql/pglite';

import type { Database } from '../../src/db.ts';

const here = dirname(fileURLToPath(import.meta.url));
const supabaseDir = join(here, '..', '..', '..', 'supabase');

export interface TestDatabase extends Database {
    close(): Promise<void>;
}

interface Queryable {
    query<Row>(sql: string, params?: unknown[]): Promise<{ rows: Row[] }>;
}

function adapt(executor: Queryable, inTransaction: boolean, pg: PGlite): Database {
    return {
        async query<Row>(text: string, params: unknown[] = []) {
            const result = await executor.query<Row>(text, params);
            return result.rows;
        },
        async transaction<T>(body: (tx: Database) => Promise<T>) {
            // Matches the pg implementation: a nested call joins the
            // transaction in flight instead of opening a second one.
            if (inTransaction) return body(adapt(executor, true, pg));
            return (await pg.transaction((tx) => body(adapt(tx as Queryable, true, pg)))) as T;
        },
    };
}

/**
 * The service connects as `service_role`, which has BYPASSRLS, so these tests
 * run as the PGlite superuser rather than switching roles. The tenancy rules
 * are proven in `supabase/tests`; what is under test here is the service's own
 * guards.
 */
export async function testDatabase(): Promise<TestDatabase> {
    const pg = new PGlite();

    await pg.exec(readFileSync(join(supabaseDir, 'tests', 'bootstrap.sql'), 'utf8'));
    const migrations = join(supabaseDir, 'migrations');
    for (const file of readdirSync(migrations)
        .filter((name) => name.endsWith('.sql'))
        .sort()) {
        await pg.exec(readFileSync(join(migrations, file), 'utf8'));
    }

    const database = adapt(pg as Queryable, false, pg);
    return {
        query: database.query.bind(database),
        transaction: database.transaction.bind(database),
        close: () => pg.close(),
    };
}
