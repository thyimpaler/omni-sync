/**
 * The narrowest database interface the service needs. Production runs it over a
 * `pg` pool; the tests run the identical code over PGlite, so the webhook
 * receiver and the SLA engine are exercised against real Postgres with the real
 * migrations applied rather than against a mock that agrees with itself.
 */

import pg from 'pg';

export interface Database {
    query<Row = Record<string, unknown>>(text: string, params?: unknown[]): Promise<Row[]>;
    transaction<T>(body: (tx: Database) => Promise<T>): Promise<T>;
}

// node-postgres hands back bigints and numerics as strings to avoid silent
// precision loss. `lifetime_value_minor` is the only one we read, and it is
// pence, so int8 is safe to narrow here.
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

export function connect(connectionString: string): Database & { end: () => Promise<void> } {
    const pool = new pg.Pool({ connectionString, max: 10 });

    const wrap = (executor: pg.Pool | pg.PoolClient): Database => ({
        async query<Row>(text: string, params: unknown[] = []) {
            const result = await executor.query(text, params);
            return result.rows as Row[];
        },
        async transaction<T>(body: (tx: Database) => Promise<T>) {
            // Nested calls join the transaction already in flight rather than
            // opening a second one.
            if (executor !== pool) return body(wrap(executor));

            const client = await pool.connect();
            try {
                await client.query('begin');
                const result = await body(wrap(client));
                await client.query('commit');
                return result;
            } catch (error) {
                await client.query('rollback');
                throw error;
            } finally {
                client.release();
            }
        },
    });

    return { ...wrap(pool), end: () => pool.end() };
}
