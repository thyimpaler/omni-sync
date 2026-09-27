-- Test-only. Stands in for the parts of Supabase's managed platform that the
-- migrations depend on but do not own: the `auth` schema and the three API
-- roles. Never applied to a real project — a Supabase database already has all
-- of this, and the definitions below are deliberately the minimum the
-- migrations touch rather than a copy of Supabase's own.

create schema if not exists auth;

create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    created_at timestamptz not null default now()
);

-- Supabase reads the caller's identity out of the JWT that PostgREST puts into
-- the `request.jwt.claims` setting. The test harness sets the same key, so the
-- policies run against exactly the expression they will run against in
-- production.
create function auth.uid() returns uuid
    language sql
    stable
as $$
    select nullif(
        nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
        ''
    )::uuid
$$;

create role anon nologin noinherit;

create role authenticated nologin noinherit;

-- The Node service. BYPASSRLS is what Supabase gives the service role, and it
-- is why every guard on the server side has to be written out rather than
-- assumed from the database.
create role service_role nologin noinherit bypassrls;

grant usage on schema public to anon, authenticated, service_role;

grant usage on schema auth to anon, authenticated, service_role;

grant select on auth.users to authenticated, service_role;

-- Test-only: on Supabase, users are created by GoTrue, not by inserting rows.
-- The fixtures need some way to mint one.
grant insert on auth.users to service_role;
