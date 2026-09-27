/**
 * Turns a Meta webhook body into the handful of facts the inbox cares about.
 *
 * Deliberately forgiving: Meta sends notification types nobody subscribed to,
 * fields that only exist for some message kinds, and shapes that change without
 * a version bump. Anything unrecognised is dropped rather than rejected — a 4xx
 * to Meta means redelivery, and redelivering something we will never understand
 * is a queue that never drains.
 */

export type InboundKind = 'text' | 'media' | 'unsupported';

export interface InboundMessage {
    /** Meta's id for the receiving number or account: `channels.external_id`. */
    channelExternalId: string;
    /** The customer's handle: a phone number, or an Instagram-scoped id. */
    from: string;
    profileName: string | null;
    providerMessageId: string;
    kind: InboundKind;
    text: string;
    sentAt: Date;
}

export interface DeliveryUpdate {
    /** Scopes the update to one channel, and so to one workspace. */
    channelExternalId: string;
    providerMessageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    at: Date;
}

export interface ParsedDelivery {
    messages: InboundMessage[];
    statuses: DeliveryUpdate[];
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const asArray = (value: unknown): Json[] =>
    Array.isArray(value) ? value.filter((entry): entry is Json => isObject(entry)) : [];

const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

/** Meta sends unix seconds as a string. */
function timestampToDate(value: unknown, fallback: Date): Date {
    const seconds = Number(asString(value) ?? value);
    if (!Number.isFinite(seconds) || seconds <= 0) return fallback;
    return new Date(seconds * 1000);
}

const deliveryStatuses = new Set(['sent', 'delivered', 'read', 'failed']);

function textOf(message: Json): { kind: InboundKind; text: string } {
    const type = asString(message.type) ?? 'unknown';

    if (type === 'text' && isObject(message.text)) {
        return { kind: 'text', text: asString(message.text.body) ?? '' };
    }

    // Media arrives as an id to fetch separately, which Phase 4 does. The
    // caption, when there is one, is what the agent needs to read now.
    for (const mediaType of ['image', 'video', 'audio', 'document', 'sticker']) {
        if (type === mediaType && isObject(message[mediaType])) {
            const media = message[mediaType] as Json;
            return { kind: 'media', text: asString(media.caption) ?? `[${mediaType}]` };
        }
    }

    return { kind: 'unsupported', text: `[${type}]` };
}

export function parseDelivery(body: unknown, now: Date = new Date()): ParsedDelivery {
    const messages: InboundMessage[] = [];
    const statuses: DeliveryUpdate[] = [];

    if (!isObject(body)) return { messages, statuses };

    for (const entry of asArray(body.entry)) {
        for (const change of asArray(entry.changes)) {
            const value = isObject(change.value) ? change.value : null;
            if (!value) continue;

            const metadata = isObject(value.metadata) ? value.metadata : {};
            const channelExternalId = asString(metadata.phone_number_id) ?? asString(entry.id) ?? null;
            if (!channelExternalId) continue;

            const names = new Map<string, string>();
            for (const contact of asArray(value.contacts)) {
                const waId = asString(contact.wa_id);
                const profile = isObject(contact.profile) ? contact.profile : {};
                const name = asString(profile.name);
                if (waId && name) names.set(waId, name);
            }

            for (const message of asArray(value.messages)) {
                const providerMessageId = asString(message.id);
                const from = asString(message.from);
                if (!providerMessageId || !from) continue;

                const { kind, text } = textOf(message);
                messages.push({
                    channelExternalId,
                    from,
                    profileName: names.get(from) ?? null,
                    providerMessageId,
                    kind,
                    text,
                    sentAt: timestampToDate(message.timestamp, now),
                });
            }

            for (const status of asArray(value.statuses)) {
                const providerMessageId = asString(status.id);
                const name = asString(status.status);
                if (!providerMessageId || !name || !deliveryStatuses.has(name)) continue;
                statuses.push({
                    channelExternalId,
                    providerMessageId,
                    status: name as DeliveryUpdate['status'],
                    at: timestampToDate(status.timestamp, now),
                });
            }
        }
    }

    return { messages, statuses };
}
