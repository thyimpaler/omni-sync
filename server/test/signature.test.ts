import { describe, expect, it } from 'vitest';

import { sign, verifySignature } from '../src/meta/signature.ts';

const secret = 'an-app-secret';
const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

describe('webhook signatures', () => {
    it('accept a body signed with the app secret', () => {
        expect(verifySignature(body, sign(body, secret), secret)).toBe(true);
    });

    it('reject a body that changed after signing', () => {
        const signature = sign(body, secret);
        expect(verifySignature(`${body} `, signature, secret)).toBe(false);
    });

    it('reject a signature made with a different secret', () => {
        expect(verifySignature(body, sign(body, 'someone-elses-secret'), secret)).toBe(false);
    });

    it('reject a missing signature', () => {
        expect(verifySignature(body, undefined, secret)).toBe(false);
    });

    it('reject a signature of the wrong length without throwing', () => {
        // timingSafeEqual throws on mismatched lengths, which would turn a
        // malformed header into a 500 instead of a 403.
        expect(verifySignature(body, 'sha256=short', secret)).toBe(false);
    });

    it('sign in the format Meta sends', () => {
        expect(sign(body, secret)).toMatch(/^sha256=[0-9a-f]{64}$/);
    });
});
