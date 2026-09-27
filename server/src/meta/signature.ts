/**
 * Meta signs every webhook delivery with the app secret. Anything that fails
 * this check is not from Meta and never reaches the database.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export function sign(body: Buffer | string, appSecret: string): string {
    const digest = createHmac('sha256', appSecret).update(body).digest('hex');
    return `sha256=${digest}`;
}

/**
 * Compares against the raw request body: re-serialising parsed JSON changes
 * the bytes (key order, whitespace, unicode escapes) and the signature with it.
 */
export function verifySignature(
    rawBody: Buffer | string,
    header: string | undefined,
    appSecret: string
): boolean {
    if (!header) return false;

    const expected = Buffer.from(sign(rawBody, appSecret));
    const received = Buffer.from(header);

    // timingSafeEqual throws on a length mismatch, which would itself leak the
    // comparison; a wrong-length header is simply wrong.
    if (expected.length !== received.length) return false;
    return timingSafeEqual(expected, received);
}
