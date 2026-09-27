import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Same reason as the client's config: the forks pool does not start
        // reliably on this machine.
        pool: 'threads',
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        testTimeout: 30_000,
        hookTimeout: 120_000,
    },
});
