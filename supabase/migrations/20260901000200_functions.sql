-- Helpers and triggers. Everything here lives in the private `app` schema:
-- PostgREST only exposes `public`, so none of it is callable from the browser.

create schema if not exists app;

revoke all on schema app from public;

grant usage on schema app to authenticated, service_role;

-- --------------------------------------------------------------- membership

-- Roles are a ladder, so policies can ask for "admin or better" rather than
-- listing every role that qualifies.
create function app.role_rank(role public.membership_role) returns integer
    language sql
    immutable
    parallel safe
    set search_path = ''
as $$
    select case role
        when 'owner' then 40
        when 'admin' then 30
        when 'agent' then 20
        when 'viewer' then 10
    end
$$;

-- security definer: called from the policies on memberships itself, so it must
-- not be subject to those policies or it recurses.
create function app.is_member(target_workspace uuid) returns boolean
    language sql
    stable
    security definer
    set search_path = ''
as $$
    select exists (
        select 1
        from public.memberships m
        where m.workspace_id = target_workspace
          and m.user_id = (select auth.uid())
    )
$$;

create function app.has_role(target_workspace uuid, minimum public.membership_role)
    returns boolean
    language sql
    stable
    security definer
    set search_path = ''
as $$
    select exists (
        select 1
        from public.memberships m
        where m.workspace_id = target_workspace
          and m.user_id = (select auth.uid())
          and app.role_rank(m.role) >= app.role_rank(minimum)
    )
$$;

revoke all on function app.role_rank(public.membership_role) from public;

revoke all on function app.is_member(uuid) from public;

revoke all on function app.has_role(uuid, public.membership_role) from public;

grant execute on function app.role_rank(public.membership_role) to authenticated, service_role;

grant execute on function app.is_member(uuid) to authenticated, service_role;

grant execute on function app.has_role(uuid, public.membership_role) to authenticated, service_role;

-- ------------------------------------------------------------------ triggers

create function app.touch_updated_at() returns trigger
    language plpgsql
    set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- An assignee has to be a member of the conversation's own workspace. The
-- composite foreign keys cover every other cross-workspace reference; this one
-- points at auth.users, which carries no workspace_id to match on.
create function app.assert_user_belongs_to_workspace() returns trigger
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    -- Reached through to_jsonb rather than new.<column> so one function can
    -- serve conversations, messages and policies, which name the column
    -- differently and would each need their own copy otherwise.
    row_json jsonb := to_jsonb(new);
    candidate uuid := nullif(row_json ->> tg_argv[0], '')::uuid;
    target_workspace uuid := (row_json ->> 'workspace_id')::uuid;
begin
    if candidate is null then
        return new;
    end if;

    if not exists (
        select 1
        from public.memberships m
        where m.workspace_id = target_workspace
          and m.user_id = candidate
    ) then
        raise exception '% % is not a member of workspace %',
            tg_argv[0], candidate, target_workspace
            using errcode = 'foreign_key_violation';
    end if;

    return new;
end;
$$;

-- Message arrival is what moves a conversation's clock timestamps, so it is
-- maintained here rather than in whichever writer happened to insert the row.
-- Only the timestamps: due_at and breaches stay the SLA engine's business.
create function app.apply_message_to_conversation() returns trigger
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    conversation public.conversations%rowtype;
begin
    select * into conversation
    from public.conversations c
    where c.id = new.conversation_id
    for update;

    update public.conversations c
    set last_message_at = greatest(coalesce(c.last_message_at, new.sent_at), new.sent_at),
        first_inbound_at = case
            when new.direction = 'inbound' then least(coalesce(c.first_inbound_at, new.sent_at), new.sent_at)
            else c.first_inbound_at
        end,
        first_response_at = case
            when new.direction = 'outbound'
                and c.first_response_at is null
                and c.first_inbound_at is not null
            then new.sent_at
            else c.first_response_at
        end
    where c.id = new.conversation_id;

    -- The first agent reply stops the first-response clock the moment it lands,
    -- without waiting for the worker's next sweep.
    if new.direction = 'outbound'
        and conversation.first_response_at is null
        and conversation.first_inbound_at is not null
    then
        update public.sla_state s
        set satisfied_at = coalesce(s.satisfied_at, new.sent_at),
            updated_at = now()
        where s.conversation_id = new.conversation_id
          and s.kind = 'first_response'
          and s.satisfied_at is null;
    end if;

    return new;
end;
$$;

create trigger workspaces_touch before update on public.workspaces
    for each row execute function app.touch_updated_at();

create trigger memberships_touch before update on public.memberships
    for each row execute function app.touch_updated_at();

create trigger channels_touch before update on public.channels
    for each row execute function app.touch_updated_at();

create trigger customers_touch before update on public.customers
    for each row execute function app.touch_updated_at();

create trigger policies_touch before update on public.policies
    for each row execute function app.touch_updated_at();

create trigger conversations_touch before update on public.conversations
    for each row execute function app.touch_updated_at();

create trigger sla_state_touch before update on public.sla_state
    for each row execute function app.touch_updated_at();

create trigger business_hours_touch before update on public.business_hours
    for each row execute function app.touch_updated_at();

create trigger saved_replies_touch before update on public.saved_replies
    for each row execute function app.touch_updated_at();

create trigger conversations_assignee_is_member
    before insert or update of assignee_id on public.conversations
    for each row execute function app.assert_user_belongs_to_workspace('assignee_id');

create trigger messages_sender_is_member
    before insert or update of sender_id on public.messages
    for each row execute function app.assert_user_belongs_to_workspace('sender_id');

create trigger policies_escalates_to_is_member
    before insert or update of escalates_to on public.policies
    for each row execute function app.assert_user_belongs_to_workspace('escalates_to');

create trigger messages_apply_to_conversation
    after insert on public.messages
    for each row execute function app.apply_message_to_conversation();

-- A row cannot be moved between workspaces. Policies are evaluated per
-- statement and cannot see the old row, so this is a trigger.
create function app.freeze_workspace_id() returns trigger
    language plpgsql
    set search_path = ''
as $$
begin
    if new.workspace_id is distinct from old.workspace_id then
        raise exception 'workspace_id is immutable'
            using errcode = 'check_violation';
    end if;
    return new;
end;
$$;

create trigger memberships_freeze_workspace before update on public.memberships
    for each row execute function app.freeze_workspace_id();

create trigger channels_freeze_workspace before update on public.channels
    for each row execute function app.freeze_workspace_id();

create trigger customers_freeze_workspace before update on public.customers
    for each row execute function app.freeze_workspace_id();

create trigger policies_freeze_workspace before update on public.policies
    for each row execute function app.freeze_workspace_id();

create trigger conversations_freeze_workspace before update on public.conversations
    for each row execute function app.freeze_workspace_id();

create trigger messages_freeze_workspace before update on public.messages
    for each row execute function app.freeze_workspace_id();

create trigger sla_state_freeze_workspace before update on public.sla_state
    for each row execute function app.freeze_workspace_id();

create trigger business_hours_freeze_workspace before update on public.business_hours
    for each row execute function app.freeze_workspace_id();

create trigger saved_replies_freeze_workspace before update on public.saved_replies
    for each row execute function app.freeze_workspace_id();
