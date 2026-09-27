/**
 * A real Postgres for the migrations to run against.
 *
 * PGlite is Postgres compiled to WebAssembly, so roles, RLS, `set local role`
 * and `request.jwt.claims` all behave as they do on Supabase. That matters:
 * asserting a policy in prose proves nothing, and the alternative — Docker plus
 * the Supabase CLI — is not something CI or this machine has.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PGlite } from '@electric-sql/pglite';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', 'migrations');

/** Who a statement runs as. */
export type Actor = { kind: 'anon' } | { kind: 'service' } | { kind: 'user'; id: string };

export const anon: Actor = { kind: 'anon' };
export const service: Actor = { kind: 'service' };
export const asUser = (id: string): Actor => ({ kind: 'user', id });

export interface TestDatabase {
    /** Runs one statement as `actor`, in its own transaction. */
    query<Row = Record<string, unknown>>(actor: Actor, sql: string, params?: unknown[]): Promise<Row[]>;
    /** Runs several statements as `actor` inside one transaction. */
    transaction<T>(actor: Actor, body: (run: RunInTransaction) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}

export type RunInTransaction = <Row = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
) => Promise<Row[]>;

function sessionSetup(actor: Actor): { role: string; claims: string | null } {
    switch (actor.kind) {
        case 'anon':
            return { role: 'anon', claims: null };
        case 'service':
            return { role: 'service_role', claims: null };
        case 'user':
            return {
                role: 'authenticated',
                claims: JSON.stringify({ sub: actor.id, role: 'authenticated' }),
            };
    }
}

/** Every migration in `supabase/migrations`, in the order Supabase applies them. */
export function migrationFiles(): string[] {
    return readdirSync(migrationsDir)
        .filter((name) => name.endsWith('.sql'))
        .sort();
}

/**
 * A fresh in-memory database with the bootstrap and every migration applied.
 * One per test file: they are cheap, and shared state between suites is how
 * tenancy tests start lying.
 */
export async function freshDatabase(): Promise<TestDatabase> {
    const pg = new PGlite();

    await pg.exec(readFileSync(join(here, 'bootstrap.sql'), 'utf8'));
    for (const file of migrationFiles()) {
        await pg.exec(readFileSync(join(migrationsDir, file), 'utf8'));
    }

    async function transaction<T>(actor: Actor, body: (run: RunInTransaction) => Promise<T>): Promise<T> {
        const { role, claims } = sessionSetup(actor);
        const result = await pg.transaction(async (tx) => {
            await tx.exec(`set local role ${role}`);
            if (claims !== null) {
                await tx.query('select set_config($1, $2, true)', ['request.jwt.claims', claims]);
            }
            const run: RunInTransaction = async <Row>(sql: string, params: unknown[] = []) =>
                (await tx.query<Row>(sql, params)).rows;
            return body(run);
        });
        return result as T;
    }

    return {
        transaction,
        query: (actor, sql, params = []) => transaction(actor, (run) => run(sql, params)),
        close: () => pg.close(),
    };
}

/** Reads as `await expect(...).rejects` but returns the message for matching. */
export async function denied(work: Promise<unknown>): Promise<string> {
    try {
        await work;
    } catch (error) {
        return error instanceof Error ? error.message : String(error);
    }
    throw new Error('expected the statement to be refused, but it succeeded');
}
