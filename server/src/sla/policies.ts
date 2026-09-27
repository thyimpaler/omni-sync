/**
 * Which policy governs a conversation. Policies match top to bottom and the
 * first hit wins, which is what the Settings screen's numbered list means.
 */

export interface PolicyConditions {
    tags?: string[];
    keywords?: string[];
    channels?: string[];
}

export interface Policy {
    id: string;
    position: number;
    name: string;
    conditions: PolicyConditions | null;
    first_response_target_seconds: number | null;
    resolution_target_seconds: number | null;
    business_hours_only: boolean;
    escalates_to: string | null;
    active: boolean;
}

export interface Subject {
    tags: string[];
    /** `channels.type`: whatsapp, instagram, messenger. */
    channel: string;
    text: string;
}

const lower = (values: string[]) => values.map((value) => value.toLowerCase());

function matches(conditions: PolicyConditions | null, subject: Subject): boolean {
    if (!conditions) return true;

    const { tags, keywords, channels } = conditions;

    // Every stated condition has to hold. A policy that states none is a
    // catch-all, which is how the last row in the list behaves.
    if (tags?.length) {
        const wanted = new Set(lower(tags));
        if (!lower(subject.tags).some((tag) => wanted.has(tag))) return false;
    }

    if (channels?.length && !lower(channels).includes(subject.channel.toLowerCase())) {
        return false;
    }

    if (keywords?.length) {
        const haystack = subject.text.toLowerCase();
        if (!lower(keywords).some((keyword) => haystack.includes(keyword))) return false;
    }

    return true;
}

export function matchPolicy(policies: Policy[], subject: Subject): Policy | null {
    return (
        policies
            .filter((policy) => policy.active)
            .sort((left, right) => left.position - right.position)
            .find((policy) => matches(policy.conditions, subject)) ?? null
    );
}

/**
 * What the thread's rule banner says when a policy with real conditions picked
 * a conversation up. A catch-all does not get a banner: nothing notable fired.
 */
export function ruleBanner(policy: Policy): string | null {
    const conditions = policy.conditions;
    if (!conditions) return null;

    const parts = [
        ...(conditions.tags ?? []),
        ...(conditions.channels ?? []),
        ...(conditions.keywords ?? []).map((keyword) => `${keyword} keyword`),
    ];

    return parts.length > 0 ? parts.join(' + ') : null;
}
