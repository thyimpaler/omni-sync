import { defineConfig } from 'vitest/config';

// The database suite runs against PGlite (real Postgres, in WebAssembly) rather
// than jsdom, and boots a fresh instance per file, so it gets its own config
// and its own script instead of sharing the client suite's.
export default defineConfig({
    test: {
        pool: 'threads',
        environment: 'node',
        globals: true,
        include: ['supabase/tests/**/*.test.ts'],
        testTimeout: 30_000,
        hookTimeout: 120_000,
    },
});
