/**
 * Environment access in one place.
 *
 * A missing key used to fall through to a `placeholder_key` string, so a
 * misconfigured deploy looked healthy until the first request failed. Production
 * builds now refuse to start; development warns once and carries on with the
 * demo defaults so the app still runs without a backend.
 */

type EnvKey = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_API_BASE';

const DEV_FALLBACKS: Record<EnvKey, string> = {
    VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'placeholder_key',
    VITE_API_BASE: 'http://localhost:3001/api',
};

const warned = new Set<EnvKey>();

const read = (key: EnvKey): string => {
    const value = import.meta.env[key];
    if (value) return value;

    if (import.meta.env.PROD) {
        throw new Error(`Missing required environment variable ${key}. See .env.example for the full list.`);
    }

    if (!warned.has(key)) {
        warned.add(key);
        console.warn(`[env] ${key} is not set — using the development fallback.`);
    }
    return DEV_FALLBACKS[key];
};

export const env = {
    get supabaseUrl() {
        return read('VITE_SUPABASE_URL');
    },
    get supabaseAnonKey() {
        return read('VITE_SUPABASE_ANON_KEY');
    },
    get apiBase() {
        return read('VITE_API_BASE');
    },
};
