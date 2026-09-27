/**
 * The only code that talks to a customer's handset.
 *
 * Two implementations: the Meta Graph client, and a recording client that keeps
 * what it was asked to send. The recording client is what runs in development
 * and in tests, which is how the simulated channel path in plan.md keeps
 * working while Meta app review is outstanding.
 */

export interface OutboundText {
    channelType: string;
    /** The connected number or account the message goes out from. */
    channelExternalId: string;
    /** Where `channels.credentials_ref` points; resolved by the secret store. */
    credentialsRef: string | null;
    to: string;
    text: string;
}

export interface SendResult {
    providerMessageId: string | null;
}

export interface ChannelClient {
    sendText(message: OutboundText): Promise<SendResult>;
}

export class ChannelSendError extends Error {
    constructor(
        message: string,
        readonly status: number
    ) {
        super(message);
        this.name = 'ChannelSendError';
    }
}

export interface RecordingClient extends ChannelClient {
    readonly sent: OutboundText[];
}

export function recordingClient(): RecordingClient {
    const sent: OutboundText[] = [];
    return {
        sent,
        async sendText(message) {
            sent.push(message);
            return { providerMessageId: `recorded.${sent.length}` };
        },
    };
}

/** Resolves `credentials_ref` to an access token. Phase 4 gives this a real store. */
export type ResolveToken = (credentialsRef: string | null) => Promise<string | null>;

export function metaClient(graphUrl: string, resolveToken: ResolveToken): ChannelClient {
    return {
        async sendText(message) {
            const token = await resolveToken(message.credentialsRef);
            if (!token) {
                throw new ChannelSendError('channel has no usable credentials', 503);
            }

            const response = await fetch(
                `${graphUrl}/${encodeURIComponent(message.channelExternalId)}/messages`,
                {
                    method: 'POST',
                    headers: {
                        authorization: `Bearer ${token}`,
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        recipient_type: 'individual',
                        to: message.to,
                        type: 'text',
                        text: { body: message.text },
                    }),
                }
            );

            if (!response.ok) {
                throw new ChannelSendError(
                    `provider refused the message (${response.status})`,
                    response.status
                );
            }

            const body = (await response.json()) as { messages?: Array<{ id?: string }> };
            return { providerMessageId: body.messages?.[0]?.id ?? null };
        },
    };
}
