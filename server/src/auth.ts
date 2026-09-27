/**
 * Who is asking. Supabase issues the session; this verifies it rather than
 * trusting a user id in the request body, which is the whole difference between
 * an agent action and anyone with the endpoint's URL.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface Session {
    userId: string;
    expiresAt: Date;
}

function decodeSegment(segment: string): unknown {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as unknown;
}

/**
 * HS256 only. Supabase's own tokens are HS256 against the project's JWT secret,
 * and accepting any other algorithm is how `alg: none` gets in.
 */
export function verifyAccessToken(
    token: string | undefined,
    secret: string,
    now: Date = new Date()
): Session | null {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerSegment, payloadSegment, signatureSegment] = parts as [string, string, string];

    let header: unknown;
    let payload: unknown;
    try {
        header = decodeSegment(headerSegment);
        payload = decodeSegment(payloadSegment);
    } catch {
        return null;
    }

    if (typeof header !== 'object' || header === null || (header as { alg?: unknown }).alg !== 'HS256') {
        return null;
    }

    const expected = createHmac('sha256', secret).update(`${headerSegment}.${payloadSegment}`).digest();
    const received = Buffer.from(signatureSegment, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    if (typeof payload !== 'object' || payload === null) return null;
    const claims = payload as { sub?: unknown; exp?: unknown };
    if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') return null;

    const expiresAt = new Date(claims.exp * 1000);
    if (expiresAt <= now) return null;

    return { userId: claims.sub, expiresAt };
}

/** `Authorization: Bearer <token>`, or nothing. */
export function bearerToken(header: string | undefined): string | undefined {
    if (!header) return undefined;
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : undefined;
}

const rank: Record<string, number> = { owner: 40, admin: 30, agent: 20, viewer: 10 };

/** Mirrors `app.role_rank` in the database. Both sides have to agree. */
export function atLeast(role: string | null | undefined, minimum: string): boolean {
    if (!role) return false;
    return (rank[role] ?? 0) >= (rank[minimum] ?? 0);
}
