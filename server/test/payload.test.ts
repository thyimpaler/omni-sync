/**
 * Reading a Meta delivery. The shapes below are the ones that arrive in
 * practice, including the ones nobody asked for.
 */

import { describe, expect, it } from 'vitest';

import { parseDelivery } from '../src/meta/payload.ts';

const envelope = (value: unknown) => ({
    object: 'whatsapp_business_account',
    entry: [{ id: 'business-account', changes: [{ field: 'messages', value }] }],
});

const metadata = { phone_number_id: 'phone-northfield' };

describe('inbound messages', () => {
    it('are read with their sender, text and time', () => {
        const { messages } = parseDelivery(
            envelope({
                metadata,
                contacts: [{ profile: { name: 'Dami' }, wa_id: '447700900001' }],
                messages: [
                    {
                        from: '447700900001',
                        id: 'wamid.1',
                        timestamp: '1768593480',
                        type: 'text',
                        text: { body: 'Where is my order?' },
                    },
                ],
            })
        );

        expect(messages).toEqual([
            {
                channelExternalId: 'phone-northfield',
                from: '447700900001',
                profileName: 'Dami',
                providerMessageId: 'wamid.1',
                kind: 'text',
                text: 'Where is my order?',
                sentAt: new Date('2026-01-16T19:58:00.000Z'),
            },
        ]);
    });

    it('carry a media caption, and say so when there is none', () => {
        const { messages } = parseDelivery(
            envelope({
                metadata,
                messages: [
                    {
                        from: '447700900001',
                        id: 'wamid.2',
                        type: 'image',
                        image: { id: 'media-1', caption: 'This arrived broken' },
                    },
                    { from: '447700900001', id: 'wamid.3', type: 'document', document: {} },
                ],
            })
        );

        expect(messages.map((message) => [message.kind, message.text])).toEqual([
            ['media', 'This arrived broken'],
            ['media', '[document]'],
        ]);
    });

    it('are kept even when the type means nothing to us', () => {
        // Better a placeholder in the thread than a customer message the agent
        // never learns about.
        const { messages } = parseDelivery(
            envelope({
                metadata,
                messages: [{ from: '447700900001', id: 'wamid.4', type: 'reaction' }],
            })
        );
        expect(messages[0]).toMatchObject({ kind: 'unsupported', text: '[reaction]' });
    });

    it('fall back to now when the timestamp is unusable', () => {
        const now = new Date('2026-02-01T09:00:00Z');
        const { messages } = parseDelivery(
            envelope({
                metadata,
                messages: [{ from: '447700900001', id: 'wamid.5', type: 'text', text: { body: 'hi' } }],
            }),
            now
        );
        expect(messages[0]!.sentAt).toEqual(now);
    });

    it('are dropped when they have no id or no sender', () => {
        const { messages } = parseDelivery(
            envelope({
                metadata,
                messages: [
                    { id: 'wamid.6', type: 'text', text: { body: 'no sender' } },
                    { from: '447700900001', type: 'text', text: { body: 'no id' } },
                ],
            })
        );
        expect(messages).toEqual([]);
    });
});

describe('delivery receipts', () => {
    it('are read and scoped to the channel that sent them', () => {
        const { statuses } = parseDelivery(
            envelope({
                metadata,
                statuses: [
                    { id: 'wamid.out', status: 'delivered', timestamp: '1768593480' },
                    { id: 'wamid.out', status: 'shrugged', timestamp: '1768593480' },
                ],
            })
        );

        expect(statuses).toEqual([
            {
                channelExternalId: 'phone-northfield',
                providerMessageId: 'wamid.out',
                status: 'delivered',
                at: new Date('2026-01-16T19:58:00.000Z'),
            },
        ]);
    });
});

describe('anything else', () => {
    it.each([
        ['an empty object', {}],
        ['a string', 'hello'],
        ['null', null],
        ['an entry with no changes', { entry: [{ id: 'x' }] }],
        ['a change with no metadata', { entry: [{ changes: [{ value: { messages: [] } }] }] }],
    ])('is ignored: %s', (_name, body) => {
        expect(parseDelivery(body)).toEqual({ messages: [], statuses: [] });
    });

    it('falls back to the entry id when there is no phone number id', () => {
        // Instagram deliveries are keyed on the account, not a phone number.
        const { messages } = parseDelivery({
            entry: [
                {
                    id: 'instagram-account',
                    changes: [
                        {
                            value: {
                                messages: [
                                    {
                                        from: 'igsid.1',
                                        id: 'mid.1',
                                        type: 'text',
                                        text: { body: 'hello' },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        });
        expect(messages[0]?.channelExternalId).toBe('instagram-account');
    });
});
