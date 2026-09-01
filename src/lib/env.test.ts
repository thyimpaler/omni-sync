import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * env caches which keys it has already warned about, so each test needs a fresh
 * module instance rather than a shared one.
 */
const loadEnv = async () => {
    vi.resetModules();
    return (await import('./env')).env;
};

describe('env', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('returns the configured value when one is set', async () => {
        vi.stubEnv('VITE_SUPABASE_URL', 'https://real-project.supabase.co');
        const env = await loadEnv();
        expect(env.supabaseUrl).toBe('https://real-project.supabase.co');
    });

    it('throws in production rather than falling back to a placeholder', async () => {
        vi.stubEnv('PROD', true);
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

        const env = await loadEnv();
        expect(() => env.supabaseAnonKey).toThrow(/VITE_SUPABASE_ANON_KEY/);
        // The message has to point at the fix, not just the symptom.
        expect(() => env.supabaseAnonKey).toThrow(/\.env\.example/);
    });

    it('falls back with a warning in development, so the demo still runs', async () => {
        vi.stubEnv('PROD', false);
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const env = await loadEnv();
        expect(env.supabaseAnonKey).toBe('placeholder_key');
        expect(warn).toHaveBeenCalledOnce();
    });

    it('warns once per key, not on every read', async () => {
        vi.stubEnv('PROD', false);
        vi.stubEnv('VITE_API_BASE', '');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const env = await loadEnv();
        void env.apiBase;
        void env.apiBase;
        void env.apiBase;

        expect(warn).toHaveBeenCalledOnce();
    });

    it('reports each missing key separately', async () => {
        vi.stubEnv('PROD', false);
        vi.stubEnv('VITE_SUPABASE_URL', '');
        vi.stubEnv('VITE_API_BASE', '');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const env = await loadEnv();
        void env.supabaseUrl;
        void env.apiBase;

        expect(warn).toHaveBeenCalledTimes(2);
    });
});
