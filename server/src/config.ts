/**
 * Configuration, read once and validated at boot. Same stance as the client's
 * `src/lib/env.ts`: fail loudly at startup rather than quietly at 3am with a
 * placeholder credential.
 */

export interface Config {
    port: number;
    host: string;
    databaseUrl: string;
    /** Verifies the X-Hub-Signature-256 on every Meta delivery. */
    metaAppSecret: string;
    /** Echoed back during Meta's webhook subscription handshake. */
    metaVerifyToken: string;
    /** Supabase's JWT signing secret: how an agent's session is authenticated. */
    supabaseJwtSecret: string;
    /** Where outbound messages go. `null` records them instead of sending. */
    metaGraphUrl: string | null;
    logLevel: string;
}

const required = ['DATABASE_URL', 'META_APP_SECRET', 'META_VERIFY_TOKEN', 'SUPABASE_JWT_SECRET'] as const;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): Config {
    const missing = required.filter((name) => !source[name]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}. ` + 'See server/.env.example.'
        );
    }

    return {
        port: Number(source.PORT ?? 3001),
        host: source.HOST ?? '0.0.0.0',
        databaseUrl: source.DATABASE_URL!,
        metaAppSecret: source.META_APP_SECRET!,
        metaVerifyToken: source.META_VERIFY_TOKEN!,
        supabaseJwtSecret: source.SUPABASE_JWT_SECRET!,
        // Absent in development, which is how the simulated channel path in
        // plan.md stays working while Meta app review is outstanding.
        metaGraphUrl: source.META_GRAPH_URL ?? null,
        logLevel: source.LOG_LEVEL ?? 'info',
    };
}
