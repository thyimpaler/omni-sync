import { env } from './env';

let clientPromise;

/**
 * Loads supabase-js on first use instead of at module load. The marketing
 * pages never touch auth, so its ~40 kB stays out of the initial bundle.
 */
export const getSupabase = () => {
    if (!clientPromise) {
        clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
            createClient(env.supabaseUrl, env.supabaseAnonKey)
        );
    }
    return clientPromise;
};
