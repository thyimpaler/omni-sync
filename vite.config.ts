/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // The default `forks` pool times out waiting for workers on this machine;
    // threads start reliably and run the same suite.
    pool: 'threads',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**', 'src/types/**', 'src/content/**'],
      // A ratchet, not a target. The global floor sits just under today's
      // numbers so coverage cannot regress; the logic layers are held much
      // higher because that is where behaviour lives. Presentational pages sit
      // below the global figure on purpose — Playwright walks those.
      thresholds: {
        statements: 30,
        branches: 40,
        functions: 22,
        lines: 30,
        'src/lib/**': { statements: 75, branches: 85, functions: 78, lines: 75 },
        'src/state/**': { statements: 65, branches: 55, functions: 40, lines: 65 },
      },
    },
  },
});
