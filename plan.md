# OmniSync — from demo to shippable SaaS

The route from where this project is today to something a team could pay for and
rely on. Paired with [changes.md](changes.md) (what has been done) and
[decisions.md](decisions.md) (why it is the way it is).

## Context

OmniSync currently looks like a product and behaves like one for about ninety seconds.
The front end is complete and faithful to the design file: eight screens, a shared
`WorkspaceProvider`, working assign / snooze / resolve / reply / export, a real design
system. Underneath it there is nothing — no database, no auth, no channels, no server,
and no version control.

The decision (2026-08-31) is to make this a **real shippable SaaS**: TypeScript, a
Supabase Postgres backing it, and a Node service for webhooks and the SLA engine. That
is months of work, and the long pole is not code — it is Meta app review.

**Where we actually are:**

|                 | Status                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| Version control | **None.** Not a git repository                                             |
| Tests           | **None.** No runner, no test files                                         |
| CI              | A CodeQL workflow targeting a `main` branch that does not exist            |
| Types           | Plain JSX, no checking                                                     |
| Backend         | None. `useConversations.js` points at `localhost:3001` — nothing serves it |
| Auth            | `ProtectedRoute.jsx` hardcodes `isAuthenticated = true`                    |
| Data            | In-memory seed; a reload resets everything                                 |
| README          | Still the Vite template                                                    |
| Dead deps       | `socket.io-client`, `date-fns` — zero imports                              |

**Intended outcome:** a multi-tenant support inbox real teams can pay for, where the
SLA clock is authoritative, workspaces cannot see each other's data, and nothing is
sent to a customer without an agent pressing send.

---

## Guiding constraints

1. **The SLA clock is server-side.** It is the product. A timer computed in the browser
   is wrong the moment two agents disagree, a tab sleeps, or business hours matter.
2. **Screens should not change when data becomes real.** `WorkspaceProvider` already
   exposes the right action surface — `assign`, `takeNext`, `snooze`, `resolve`,
   `reopen`, `sendReply`, `savePolicies`. Swap its internals, not its consumers.
3. **Nothing writes to a customer without an agent action** — enforced server-side, not
   just stated in the UI copy.
4. **Every phase ends shippable.** No phase leaves the app broken between milestones.

---

## Phase 0 — Foundations (blocking, ~1 day)

Nothing else is safe until this exists.

- `git init`, `main` + short-lived branches, conventional commits, protected `main`.
  Verify `dist/` is ignored (it is in `.gitignore`; the directory is currently on disk).
- `.env.example` documenting `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_API_BASE` + the server's own vars. Fail fast on missing vars in a new
  `src/lib/env.ts` rather than the current silent `|| 'placeholder_key'` fallback in
  `src/lib/supabase.js`.
- Rewrite `README.md`: what it is, architecture, how to run, how to deploy.
- Remove `socket.io-client` and `date-fns`; check `autoprefixer`/`postcss` are still
  needed under Tailwind v4's Vite plugin.
- Add `LICENSE` and `CONTRIBUTING.md`.

---

## Phase 1 — Quality gates (~1 week)

**TypeScript migration**, incrementally, in dependency order:

1. `tsconfig.json` with `strict`, `allowJs` on at first.
2. Types first: `src/types/` for `Conversation`, `Message`, `Policy`, `Workspace`,
   `Agent` — derived from the shapes already in `src/content/conversations.js`.
3. Then `src/lib/*` (`csv`, `seo`, `supabase`), `src/state/*`, `src/contexts/*`.
4. Then components and pages, leaves first.
5. Turn `allowJs` off; `tsc --noEmit` becomes a CI gate.

**Testing** — Vitest + React Testing Library for units, Playwright for flows:

| Layer     | Covers                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| Unit      | `waitingSeconds` sorting, `toCsv` escaping, SLA state derivation, policy matching                             |
| Component | `ConversationList` filters, `Modal` focus trap + Escape, `Field` error wiring, `SettingsPage` dirty state     |
| E2E       | signup → onboarding → connect channel → inbox reply; queue Take next → thread; policy edit → save; CSV export |

**Tooling:** Prettier; `eslint-plugin-jsx-a11y`; `vitest --coverage`; Husky + lint-staged.

**CI** (`.github/workflows/ci.yml`): lint → typecheck → unit → build → e2e on PR.
Keep the existing CodeQL workflow. Add Dependabot.

---

## Phase 2 — Data model and backend (~3 weeks)

**Supabase Postgres.** Every table carries `workspace_id`; RLS on all of them.

```
workspaces, memberships (user↔workspace, role)
channels          (type, external_id, credentials_ref, status)
customers         (external_handle, name, tags, lifetime_value)
conversations     (customer_id, channel_id, subject, status, assignee_id,
                   policy_id, first_inbound_at, first_response_at, resolved_at)
messages          (conversation_id, direction, sender_id, body, media, sent_at,
                   provider_message_id, delivery_status)
policies          (name, conditions jsonb, first_response_target, resolution_target,
                   escalates_to, applies_to)
rule_events       (conversation_id, rule, effect, fired_at)   ← the thread's rule banner
sla_state         (conversation_id, due_at, breached_at, paused_at)
business_hours, saved_replies, audit_log
```

**RLS is the security boundary.** Deny by default; policy per table keyed on
membership. Write pgTAP tests that assert workspace A cannot read workspace B — this is
the one place a bug is a breach.

**Node service** (`server/`, TypeScript, Fastify) — the things a browser must not do:

- **Meta webhook receiver:** signature verification, dedupe on `provider_message_id`,
  fast ack then queue.
- **SLA engine:** a worker that computes `due_at` from the matched policy and business
  hours, marks breaches, fires escalations. Business-hours aware (the UI already
  promises 08:00–20:00 GMT).
- **Outbound send:** the only path to Meta. Rejects anything not originating from an
  agent action, enforcing the product's core promise.
- **Exports** for anything larger than the browser should build; `src/lib/csv.ts` stays
  for the small in-page exports it already handles.

**Realtime:** Supabase Realtime, extending the `postgres_changes` subscription already
in `src/hooks/useConversations.js`. `socket.io-client` is not needed — delete it.

**Auth:** real Supabase Auth. `AuthProvider` already exposes `loading` without blocking
paint; give `ProtectedRoute.jsx` an actual session check plus a role gate, replacing its
`isAuthenticated = true` stub.

---

## Phase 3 — Swap demo state for real data (~1 week)

The point of this phase is that the screens barely change.

- `WorkspaceProvider` keeps its exported action names; internals become react-query
  queries and mutations with optimistic updates and rollback (assign, snooze and resolve
  should feel instant).
- `CURRENT_AGENT` in `src/state/workspace-context.ts` becomes the session user.
- `src/content/conversations.js` and `workspace.js` become **seed fixtures and test
  factories**, not runtime data.
- Wire the unused `EmptyState.jsx` and `SkeletonLoader.jsx` into real loading, empty and
  error states — every list needs all three.
- `/example` becomes a read-only sandbox workspace seeded per visitor, so the public
  demo survives.

---

## Phase 4 — Channel integrations (~3 weeks + review time)

**Start the Meta app review in Phase 0 — it gates launch, not development.**

- Meta app, WhatsApp Cloud API and Instagram Messaging permissions, Business
  verification.
- Embedded signup for connecting a customer's own WhatsApp number, replacing the
  onboarding screen's simulated Connect.
- 24-hour service window handling; approved template messages outside it.
- Media (images, documents), delivery receipts, read state.
- Rate limits, retries with backoff, dead-letter queue, replay tooling.

---

## Phase 5 — Product completeness (~2 weeks)

- **Onboarding steps 1, 3 and 4** — never drawn; needs design before build.
- **Team screen** — has no artboard; currently invented. Design it, then add invites,
  roles and seat management.
- Settings tabs that currently say "not part of this demo": business hours, saved
  replies, notifications, team.
- **Responsive workspace.** Below 880px it scrolls horizontally today. The three-pane
  layout needs a real narrow-screen behaviour — queue and thread as stacked views.
- Search across conversations and messages; keyboard shortcuts for triage.

---

## Phase 6 — Production readiness (~2 weeks)

| Area          | Work                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| Errors        | Error boundary per route + Sentry, source maps uploaded                             |
| Logging       | Structured logs with workspace/conversation correlation ids                         |
| Security      | CSP and security headers, secret management, dependency scanning, pen test          |
| Accessibility | axe in CI plus a manual screen-reader pass; target WCAG 2.2 AA                      |
| Performance   | Lighthouse CI budget; entry bundle currently 137 kB gzip — hold it under 150        |
| Data          | Automated backups, tested restore, documented retention matching the privacy policy |
| Ops           | Uptime monitoring, SLOs, alerting, runbooks, on-call                                |

---

## Phase 7 — Commercial (~2 weeks)

- Stripe: Team £29 / Growth £49 per agent per month, 14-day trial without a card,
  annual billing at two months off, seat proration, invoices, tax.
- The pricing page and signup plan selector read real plan data instead of hardcoded copy.
- **Legal review of `src/content/site.js`** — the privacy, terms and cookie text is
  currently marked as illustrative and must not ship as-is.
- DPA, sub-processor list, GDPR request handling, cookie consent gate for analytics.
- Status page, support inbox (run on OmniSync itself), privacy-friendly analytics.

---

## Phase 8 — Launch

Staging mirroring production, migration discipline (forward-only, reversible),
blue/green deploys, a documented rollback, and a soft launch with a handful of design
partners before public availability.

---

## Verification

Each phase carries its own proof, run before it is called done:

- **Phase 1:** `npm run lint`, `tsc --noEmit`, `npm test`, `npx playwright test` all
  green in CI on a pull request.
- **Phase 2:** pgTAP suite proves cross-workspace reads fail. Integration test posts a
  synthetic Meta webhook and asserts a conversation, a message and an `sla_state` row
  appear with the correct `due_at` across a business-hours boundary.
- **Phase 3:** the Playwright flows from Phase 1 pass unchanged against real data — the
  strongest signal that the state swap did not leak into the screens.
- **Phase 4:** end-to-end against a Meta test number: inbound message lands in the
  inbox, agent reply arrives on the handset, delivery receipt updates the thread.
- **Phase 6:** Lighthouse and axe budgets enforced in CI; a restore drill from backup;
  a load test at 10× expected peak webhook volume.
- **Throughout:** the dev server plus browser tools, as used for every change so far —
  screenshot the screen, read the DOM, confirm the behaviour rather than assuming it.

---

## Sequencing and risks

```
Phase 0 ─┬─ Phase 1 ──┬─ Phase 3 ── Phase 5 ─┬─ Phase 6 ── Phase 7 ── Phase 8
         └─ Phase 2 ──┘                      │
         └─ Meta review (start now) ── Phase 4
```

Roughly **3–4 months** to a defensible launch with one engineer; Phases 1 and 2 can run
in parallel with two.

**Risks, highest first:**

1. **Meta app review** can take weeks and can be refused. Start in Phase 0; keep the
   simulated channel path working so development never blocks on it.
2. **RLS mistakes are breaches, not bugs.** Tested explicitly, reviewed by a second pair
   of eyes, never inferred from "it looked right in the UI".
3. **SLA correctness across time zones, business hours and DST** is subtle and is the
   product's entire claim. It gets its own test suite.
4. **TypeScript migration stalling half-done** — do it in one focused push in Phase 1,
   not opportunistically.
5. **Scope drift into features before the foundation is real.** Phases 0–2 are not
   optional and are not interesting; they are the whole job.
