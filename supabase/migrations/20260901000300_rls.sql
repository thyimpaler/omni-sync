-- Row-level security. This file is the tenancy boundary: a mistake here is a
-- breach, not a bug, which is why supabase/tests exercises every rule in it.
--
-- Shape of the rules:
--   * anon has no access to anything. Not one table.
--   * authenticated reads only workspaces it is a member of.
--   * writes need a role: viewer reads, agent works the inbox, admin changes
--     settings and people, owner owns billing and the workspace itself.
--   * sla_state and rule_events are readable but never writable from a browser.
--     The SLA clock is the server's, which is the whole product claim.
--   * service_role (the Node service) has BYPASSRLS and is not constrained
--     here. Its own guards live in server/.
--
-- Note on FORCE: deliberately not used. Table owners run the SECURITY DEFINER
-- helpers and triggers, and under FORCE those become silent no-ops rather than
-- errors. Clients never connect as the owner.

alter table public.workspaces enable row level security;

alter table public.memberships enable row level security;

alter table public.channels enable row level security;

alter table public.customers enable row level security;

alter table public.policies enable row level security;

alter table public.conversations enable row level security;

alter table public.messages enable row level security;

alter table public.rule_events enable row level security;

alter table public.sla_state enable row level security;

alter table public.business_hours enable row level security;

alter table public.saved_replies enable row level security;

alter table public.audit_log enable row level security;

-- ------------------------------------------------------------------- grants
-- Supabase grants the API roles broad table privileges by default, so the
-- absence of a grant is not a boundary — RLS is. These statements make the
-- intent explicit anyway, and take anon out of the picture entirely.

revoke all on all tables in schema public from anon;

revoke all on all tables in schema public from authenticated;

grant select on
    public.workspaces,
    public.memberships,
    public.channels,
    public.customers,
    public.policies,
    public.conversations,
    public.messages,
    public.rule_events,
    public.sla_state,
    public.business_hours,
    public.saved_replies,
    public.audit_log
to authenticated;

grant insert, update on
    public.memberships,
    public.channels,
    public.customers,
    public.policies,
    public.conversations,
    public.business_hours,
    public.saved_replies
to authenticated;

grant insert on public.messages to authenticated;

grant update on public.workspaces to authenticated;

grant delete on
    public.memberships,
    public.channels,
    public.policies,
    public.business_hours,
    public.saved_replies
to authenticated;

-- --------------------------------------------------------------- workspaces
-- Creating and deleting a workspace runs through the server, which also has to
-- create the owner membership; there is no client-side path.

create policy workspaces_select on public.workspaces
    for select to authenticated
    using (app.is_member(id));

create policy workspaces_update on public.workspaces
    for update to authenticated
    using (app.has_role(id, 'admin'))
    with check (app.has_role(id, 'admin'));

-- -------------------------------------------------------------- memberships
-- `has_role(workspace_id, role)` in the write rules reads as "the caller ranks
-- at least as high as the role being handed out" — an admin cannot mint an
-- owner, and cannot remove one.

create policy memberships_select on public.memberships
    for select to authenticated
    using (app.is_member(workspace_id));

create policy memberships_insert on public.memberships
    for insert to authenticated
    with check (app.has_role(workspace_id, 'admin') and app.has_role(workspace_id, role));

create policy memberships_update on public.memberships
    for update to authenticated
    using (app.has_role(workspace_id, 'admin') and app.has_role(workspace_id, role))
    with check (app.has_role(workspace_id, 'admin') and app.has_role(workspace_id, role));

create policy memberships_delete on public.memberships
    for delete to authenticated
    using (app.has_role(workspace_id, 'admin') and app.has_role(workspace_id, role));

-- ----------------------------------------------------------------- channels

create policy channels_select on public.channels
    for select to authenticated
    using (app.is_member(workspace_id));

create policy channels_insert on public.channels
    for insert to authenticated
    with check (app.has_role(workspace_id, 'admin'));

create policy channels_update on public.channels
    for update to authenticated
    using (app.has_role(workspace_id, 'admin'))
    with check (app.has_role(workspace_id, 'admin'));

create policy channels_delete on public.channels
    for delete to authenticated
    using (app.has_role(workspace_id, 'admin'));

-- ---------------------------------------------------------------- customers

create policy customers_select on public.customers
    for select to authenticated
    using (app.is_member(workspace_id));

create policy customers_insert on public.customers
    for insert to authenticated
    with check (app.has_role(workspace_id, 'agent'));

create policy customers_update on public.customers
    for update to authenticated
    using (app.has_role(workspace_id, 'agent'))
    with check (app.has_role(workspace_id, 'agent'));

-- ----------------------------------------------------------------- policies
-- Editing an SLA policy changes what the product promises, so it is an admin
-- action even though agents work under it all day.

create policy policies_select on public.policies
    for select to authenticated
    using (app.is_member(workspace_id));

create policy policies_insert on public.policies
    for insert to authenticated
    with check (app.has_role(workspace_id, 'admin'));

create policy policies_update on public.policies
    for update to authenticated
    using (app.has_role(workspace_id, 'admin'))
    with check (app.has_role(workspace_id, 'admin'));

create policy policies_delete on public.policies
    for delete to authenticated
    using (app.has_role(workspace_id, 'admin'));

-- ------------------------------------------------------------ conversations
-- Assign, snooze, resolve and reopen are all updates here. Deleting a
-- conversation is not a product action at all, so no delete policy exists.

create policy conversations_select on public.conversations
    for select to authenticated
    using (app.is_member(workspace_id));

create policy conversations_insert on public.conversations
    for insert to authenticated
    with check (app.has_role(workspace_id, 'agent'));

create policy conversations_update on public.conversations
    for update to authenticated
    using (app.has_role(workspace_id, 'agent'))
    with check (app.has_role(workspace_id, 'agent'));

-- ----------------------------------------------------------------- messages
-- The product's core promise, written as a rule rather than as copy: from a
-- browser you may only add an outbound message, only in your own name. Inbound
-- messages arrive from the webhook receiver as service_role; delivery status
-- updates come from the same place, so authenticated has no update policy.

create policy messages_select on public.messages
    for select to authenticated
    using (app.is_member(workspace_id));

create policy messages_insert on public.messages
    for insert to authenticated
    with check (
        app.has_role(workspace_id, 'agent')
        and direction = 'outbound'
        and sender_id = (select auth.uid())
    );

-- --------------------------------------------------- rule_events, sla_state
-- Read-only to every browser session. Both are written by the SLA engine.

create policy rule_events_select on public.rule_events
    for select to authenticated
    using (app.is_member(workspace_id));

create policy sla_state_select on public.sla_state
    for select to authenticated
    using (app.is_member(workspace_id));

-- ----------------------------------------------- business hours and replies

create policy business_hours_select on public.business_hours
    for select to authenticated
    using (app.is_member(workspace_id));

create policy business_hours_insert on public.business_hours
    for insert to authenticated
    with check (app.has_role(workspace_id, 'admin'));

create policy business_hours_update on public.business_hours
    for update to authenticated
    using (app.has_role(workspace_id, 'admin'))
    with check (app.has_role(workspace_id, 'admin'));

create policy business_hours_delete on public.business_hours
    for delete to authenticated
    using (app.has_role(workspace_id, 'admin'));

create policy saved_replies_select on public.saved_replies
    for select to authenticated
    using (app.is_member(workspace_id));

create policy saved_replies_insert on public.saved_replies
    for insert to authenticated
    with check (app.has_role(workspace_id, 'agent') and created_by = (select auth.uid()));

create policy saved_replies_update on public.saved_replies
    for update to authenticated
    using (app.has_role(workspace_id, 'agent'))
    with check (app.has_role(workspace_id, 'agent'));

create policy saved_replies_delete on public.saved_replies
    for delete to authenticated
    using (app.has_role(workspace_id, 'admin'));

-- ---------------------------------------------------------------- audit log
-- Admins read it; nobody writes it from a browser, and there is no update or
-- delete policy for anyone, which is what append-only means here.

create policy audit_log_select on public.audit_log
    for select to authenticated
    using (app.has_role(workspace_id, 'admin'));

-- The Node service connects as service_role. BYPASSRLS means none of the above
-- constrains it, but it still needs table privileges. Supabase grants these by
-- default; stating them keeps a from-scratch database honest.

grant all on all tables in schema public to service_role;
