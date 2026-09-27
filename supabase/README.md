# Database

The Postgres side of OmniSync: schema, row-level security, and the tests that
prove the tenancy rules hold. Plan context is in [plan.md](../plan.md), phase 2.

## Layout

```
migrations/   Applied in filename order, forward-only. What Supabase runs.
tests/        Vitest suites that run the migrations against a real Postgres.
```

## Migrations

| File                           | What it does                                       |
| ------------------------------ | -------------------------------------------------- |
| `20260901000100_core.sql`      | Enums, tables, indexes, composite foreign keys     |
| `20260901000200_functions.sql` | `app` helpers, membership guards, message triggers |
| `20260901000300_rls.sql`       | Grants and every row-level security policy         |

They assume Supabase's managed `auth` schema — `auth.users` and `auth.uid()` —
and the `anon`, `authenticated` and `service_role` roles. Nothing in
`migrations/` creates those; `tests/bootstrap.sql` provides a minimal stand-in
so the same files can run outside a Supabase project.

Applying them to a project, once one exists:

```bash
supabase link --project-ref <ref> && supabase db push
```

Forward-only. A mistake is corrected by a new migration, never by editing one
that has already been applied.

## The rules, in short

- **anon reads nothing.** Not one table.
- **A member reads only their own workspace.** Every tenant table is scoped by
  `workspace_id`, and cross-workspace references are impossible by construction:
  children reference `(workspace_id, id)`, not `id`.
- **Roles are a ladder** — `viewer < agent < admin < owner`. Agents work the
  inbox; admins change settings and people; an admin cannot mint or remove an
  owner.
- **The SLA clock is not writable from a browser.** `sla_state` and
  `rule_events` are readable and nothing more. So is a message once sent: no
  update, no delete, by anyone.
- **Outbound messages carry their sender.** A browser may insert a message only
  when `direction = 'outbound'` and `sender_id = auth.uid()`. Inbound arrives
  from the webhook receiver as `service_role`.
- `service_role` has `BYPASSRLS`, so none of the above constrains the Node
  service. Its own guards live in `server/`.

## Tests

```bash
npm run test:db
```

They run against [PGlite](https://pglite.dev) — Postgres 18 compiled to
WebAssembly — so roles, `set local role`, `request.jwt.claims` and RLS behave as
they do on Supabase. Each file boots its own database, applies `bootstrap.sql`
and then every migration in order, which means the suite also proves the
migrations apply cleanly from empty.

| Suite                 | Covers                                                       |
| --------------------- | ------------------------------------------------------------ |
| `tenancy.test.ts`     | Workspace isolation, table by table, in both directions      |
| `permissions.test.ts` | The role ladder, and what no browser session may do at all   |
| `schema.test.ts`      | Constraints, webhook dedupe, the conversation clock triggers |
| `smoke.test.ts`       | The migrations apply to an empty database                    |

Two of them are worth reading before changing a policy: `tenancy.test.ts` asks
"can workspace A see workspace B?" of every table, and then asks the mirror
question, so a passing zero cannot be a fixture that never inserted anything.
