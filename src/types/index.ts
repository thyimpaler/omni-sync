/**
 * The workspace domain, derived from the shapes the screens already use.
 * These are the models the Supabase schema in plan.md phase 2 has to match.
 */

export type ChannelName = 'WhatsApp' | 'Instagram';

/** How a conversation's wait time reads: value, never colour. */
export type SlaState = 'breached' | 'warning' | 'ontime' | 'closed';

export type ConversationStatus = 'open' | 'snoozed' | 'resolved';

/** `rule` is a product event written into the thread, not a participant. */
export type MessageSender = 'customer' | 'agent' | 'rule';

export interface Message {
    id: number;
    sender: MessageSender;
    /** Wall-clock time as shown in the thread gutter, e.g. "11:05". */
    time: string;
    text: string;
    /** Present only on rule events: which rule fired. */
    rule?: string;
}

export interface CustomerRecord {
    since: string;
    orders: number;
    lifetime: string;
    tags: string[];
}

export interface OrderRecord {
    ref: string;
    placed: string;
    items: string;
    courier: string;
    status: string;
}

export interface SlaSummary {
    policy: string;
    firstResponse: string;
    resolution: string;
    hours: string;
}

export interface RecentConversation {
    subject: string;
    meta: string;
}

export interface Conversation {
    id: number;
    name: string;
    /** Secondary line in the queue, e.g. "VIP · 11 orders". */
    note: string | null;
    channel: ChannelName;
    subject: string;
    preview: string;
    policy: string;
    /** "mm:ss", or "—" once the clock has stopped. */
    waiting: string;
    state: SlaState;
    status: ConversationStatus;
    assignee: string | null;
    /** Queue filter chips this conversation answers to. */
    filters: string[];
    phone: string;
    previousConversations: number;
    messages: Message[];
    customer: CustomerRecord;
    order: OrderRecord | null;
    sla: SlaSummary;
    recent: RecentConversation[];
}

export interface Policy {
    /** Display order, zero-padded — policies match top to bottom. */
    n: string;
    name: string;
    condition: string;
    target: string;
    resolution: string | null;
    escalates: string | null;
    applies: string | null;
}

export interface MissedAction {
    title: string;
    note: string;
    on: boolean;
}

export interface CannedReply {
    command: string;
    label: string;
}

/** What `WorkspaceProvider` exposes. Phase 3 swaps the implementation, not this. */
export interface WorkspaceValue {
    conversations: Conversation[];
    activeId: number;
    setActiveId: (id: number) => void;
    assign: (id: number, agent: string | null) => void;
    snooze: (id: number) => void;
    resolve: (id: number) => void;
    reopen: (id: number) => void;
    takeNext: () => Conversation | null;
    nextUnassigned: Conversation | null;
    assignAllUnassigned: () => void;
    sendReply: (id: number, text: string) => void;
    policies: Policy[];
    savePolicies: (next: Policy[]) => void;
    missedActions: MissedAction[];
    toggleMissedAction: (title: string) => void;
}
