-- OmniSync core schema. Every tenant-owned row carries workspace_id; row-level
-- security in 20260901000300_rls.sql is what enforces it. See plan.md phase 2.
--
-- Assumes Supabase's managed `auth` schema (auth.users, auth.uid()). The test
-- harness creates a minimal stand-in for it; production already has it.

-- ---------------------------------------------------------------- enumerations

create type public.channel_type as enum ('whatsapp', 'instagram', 'messenger');

create type public.channel_status as enum ('pending', 'connected', 'disconnected', 'error');

create type public.membership_role as enum ('owner', 'admin', 'agent', 'viewer');

create type public.conversation_status as enum ('open', 'snoozed', 'resolved');

-- 'system' covers rule banners and other product events written into the thread.
create type public.message_direction as enum ('inbound', 'outbound', 'system');

create type public.delivery_status as enum ('queued', 'sent', 'delivered', 'read', 'failed');

-- The two clocks a policy sets. Kept separate rather than one due_at per
-- conversation so a thread can breach first response and still meet resolution.
create type public.sla_kind as enum ('first_response', 'resolution');

-- ---------------------------------------------------------------------- tables

create table public.workspaces (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(btrim(name)) between 1 and 120),
    slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
    -- Business hours and every SLA clock are evaluated in this zone.
    timezone text not null default 'Europe/London',
    -- /example is a read-only sandbox; the server refuses outbound sends on it.
    is_demo boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.memberships (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    role public.membership_role not null default 'agent',
    display_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (workspace_id, user_id)
);

create index memberships_user_idx on public.memberships (user_id);

create table public.channels (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    type public.channel_type not null,
    display_name text not null,
    -- The provider's own id for the number or account (e.g. a WhatsApp phone
    -- number id). Not a secret.
    external_id text,
    -- A pointer into the secret store, never the credential itself: nothing
    -- reachable from Postgres should be able to send as the customer.
    credentials_ref text,
    status public.channel_status not null default 'pending',
    connected_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (workspace_id, type, external_id),
    unique (workspace_id, id)
);

create table public.customers (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    -- Phone number, Instagram handle, page-scoped id: whatever the channel keys on.
    external_handle text not null,
    name text,
    tags text[] not null default '{}',
    -- Minor units (pence), never a float.
    lifetime_value_minor bigint not null default 0 check (lifetime_value_minor >= 0),
    orders_count integer not null default 0 check (orders_count >= 0),
    first_seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (workspace_id, external_handle),
    -- Lets children reference (workspace_id, id) so a conversation can never
    -- point at a customer in another workspace.
    unique (workspace_id, id)
);

create table public.policies (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    -- Policies match top to bottom; the first hit wins.
    position integer not null check (position > 0),
    name text not null,
    -- { tags: [], keywords: [], channels: [] } — matched by the server,
    -- deliberately not by a database trigger.
    conditions jsonb not null default '{}'::jsonb,
    first_response_target_seconds integer check (first_response_target_seconds > 0),
    resolution_target_seconds integer check (resolution_target_seconds > 0),
    escalates_to uuid references auth.users (id) on delete set null,
    applies_to text,
    -- When true the clock only runs inside the workspace's business hours.
    business_hours_only boolean not null default true,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (workspace_id, position) deferrable initially deferred,
    unique (workspace_id, id),
    constraint policies_has_a_target check (
        first_response_target_seconds is not null or resolution_target_seconds is not null
    )
);

create table public.conversations (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    customer_id uuid not null,
    channel_id uuid not null,
    subject text,
    status public.conversation_status not null default 'open',
    assignee_id uuid references auth.users (id) on delete set null,
    policy_id uuid,
    -- The three timestamps every SLA clock is derived from.
    first_inbound_at timestamptz,
    first_response_at timestamptz,
    resolved_at timestamptz,
    snoozed_until timestamptz,
    last_message_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint conversations_snooze_needs_a_time check (
        (status = 'snoozed') = (snoozed_until is not null)
    ),
    constraint conversations_resolved_needs_a_time check (
        (status = 'resolved') = (resolved_at is not null)
    ),
    unique (workspace_id, id),
    -- Composite references: the workspace has to match on both sides.
    foreign key (workspace_id, customer_id)
        references public.customers (workspace_id, id) on delete cascade,
    foreign key (workspace_id, channel_id)
        references public.channels (workspace_id, id) on delete restrict,
    foreign key (workspace_id, policy_id)
        references public.policies (workspace_id, id) on delete set null (policy_id)
);

create index conversations_queue_idx
    on public.conversations (workspace_id, status, first_inbound_at)
    where status <> 'resolved';

create index conversations_assignee_idx on public.conversations (workspace_id, assignee_id);

create table public.messages (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    conversation_id uuid not null,
    direction public.message_direction not null,
    -- The agent who sent it. Required on outbound: nothing reaches a customer
    -- without an agent behind it.
    sender_id uuid references auth.users (id) on delete set null,
    body text not null default '',
    media jsonb not null default '[]'::jsonb,
    sent_at timestamptz not null default now(),
    -- The provider's message id, which is what makes webhook delivery idempotent.
    provider_message_id text,
    delivery_status public.delivery_status,
    created_at timestamptz not null default now(),
    constraint messages_outbound_has_a_sender check (
        direction <> 'outbound' or sender_id is not null
    ),
    constraint messages_inbound_has_no_sender check (
        direction <> 'inbound' or sender_id is null
    ),
    foreign key (workspace_id, conversation_id)
        references public.conversations (workspace_id, id) on delete cascade
);

-- Webhook dedupe. Meta redelivers on any non-2xx, so the receiver relies on this
-- index rather than on remembering what it has already seen.
create unique index messages_provider_dedupe_idx
    on public.messages (workspace_id, provider_message_id)
    where provider_message_id is not null;

create index messages_thread_idx on public.messages (conversation_id, sent_at);

create table public.rule_events (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    conversation_id uuid not null,
    -- What the thread's rule banner reads: which rule fired, and what it did.
    rule text not null,
    effect text not null,
    fired_at timestamptz not null default now(),
    foreign key (workspace_id, conversation_id)
        references public.conversations (workspace_id, id) on delete cascade
);

create index rule_events_thread_idx on public.rule_events (conversation_id, fired_at);

create table public.sla_state (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    conversation_id uuid not null references public.conversations (id) on delete cascade,
    kind public.sla_kind not null,
    policy_id uuid,
    -- Server-computed and business-hours aware. The browser reads this; it
    -- never derives it.
    due_at timestamptz not null,
    breached_at timestamptz,
    -- Set while the clock is stopped, which today means the conversation is
    -- snoozed. Resuming shifts due_at by the working time that passed, so there
    -- is no separate bank of elapsed seconds to keep in step with it.
    paused_at timestamptz,
    satisfied_at timestamptz,
    escalated_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (conversation_id, kind),
    foreign key (workspace_id, conversation_id)
        references public.conversations (workspace_id, id) on delete cascade,
    foreign key (workspace_id, policy_id)
        references public.policies (workspace_id, id) on delete set null (policy_id)
);

-- The worker's sweep: every clock still running and already due.
create index sla_state_due_idx on public.sla_state (due_at)
    where breached_at is null and satisfied_at is null and paused_at is null;

create table public.business_hours (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    -- 0 = Sunday, matching extract(dow).
    weekday smallint not null check (weekday between 0 and 6),
    opens_at time not null,
    closes_at time not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint business_hours_open_before_close check (opens_at < closes_at),
    unique (workspace_id, weekday)
);

create table public.saved_replies (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    -- The slash command an agent types, without the slash.
    command text not null check (command ~ '^[a-z0-9-]{1,32}$'),
    label text not null,
    body text not null,
    created_by uuid references auth.users (id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (workspace_id, command)
);

-- Append-only. RLS grants insert and select and nothing else.
create table public.audit_log (
    id bigint generated always as identity primary key,
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    actor_id uuid references auth.users (id) on delete set null,
    action text not null,
    entity_type text not null,
    entity_id uuid,
    detail jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index audit_log_workspace_idx on public.audit_log (workspace_id, created_at desc);
