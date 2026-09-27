# OmniSync service

The things a browser must not be trusted to do: receive Meta's webhooks, run the
SLA clock, and send a message to a customer. Plan context is in
[plan.md](../plan.md), phase 2; the schema it writes to is in
[supabase/](../supabase/README.md).

## Running it

```bash
cd server && npm install
cp .env.example .env
npm run dev
```

Every variable in `.env.example` except `META_GRAPH_URL` is required, and the
process refuses to start without them. With no `META_GRAPH_URL` set, outbound
messages are **recorded rather than sent** — which is how development and
demos work while Meta app review is outstanding.

## The HTTP surface

| Route                               | What it is                                |
| ----------------------------------- | ----------------------------------------- |
| `GET /health`                       | Liveness, including a database round-trip |
| `GET /webhooks/meta`                | Meta's subscription handshake             |
| `POST /webhooks/meta`               | Inbound messages and delivery receipts    |
| `POST /api/conversations/:id/reply` | The only path to a customer's handset     |

**Webhooks.** Every delivery is verified against `X-Hub-Signature-256` using the
raw request body — parsed JSON re-serialises to different bytes and would fail a
valid signature. Anything unsigned is refused before a query runs. Once the
signature checks out the answer is always 200, because a non-2xx makes Meta
redeliver, and redelivery is handled by the unique index on
`(workspace_id, provider_message_id)` rather than by remembering what we have
seen.

**Replies.** The caller's Supabase session is verified (HS256 against the
project's JWT secret; no other algorithm is accepted), then their membership and
role are checked, then the message is written with `sender_id` set to them, and
only then does it reach the provider. A conversation in someone else's workspace
answers 404, the same as one that does not exist. The example workspace refuses
outright.

## The SLA engine

`src/sla/business-hours.ts` is the arithmetic: working time in the workspace's
own zone, so a five-minute target on a message at 19:58 on Friday is due at
08:03 on Monday, not 20:03 on Friday. It survives both daylight-saving changes,
which is asserted rather than assumed — see `test/business-hours.test.ts`.

`src/sla/engine.ts` is what uses it. `startClocks` picks the policy that matches
a new conversation and writes one `sla_state` row per target. `tick` — run every
minute by `src/worker.ts` — resumes clocks on woken conversations, pauses those
on snoozed ones, and marks and escalates whatever is past due. Snoozing moves
`due_at` on by the working time the conversation slept, so a snooze buys time
without quietly forgiving the target.

Nothing in a browser can write any of it: `sla_state` is select-only under RLS.

## Tests

```bash
npm test
```

They run against PGlite with the project's real migrations applied, so the
webhook receiver, the reply endpoint and the engine are exercised against actual
Postgres. `test/webhook.test.ts` is plan.md's own verification for this phase: a
synthetic Meta delivery, and a `due_at` asserted across a business-hours
boundary.

## Layout

```
src/app.ts            The HTTP surface
src/auth.ts           Supabase session verification and the role ladder
src/channels.ts       The Meta client, and the recording client used until review
src/config.ts         Environment, validated at boot
src/db.ts             The narrow database interface both pg and PGlite satisfy
src/inbox/ingest.ts   Webhook delivery to conversation, message and clock
src/meta/             Signature verification and payload parsing
src/sla/              Business hours, policy matching, the engine
src/worker.ts         The once-a-minute sweep
```

## Not here yet

Media downloads, the 24-hour service window and approved templates, rate limits,
retries and a dead-letter queue are all phase 4 — they need the Meta app review
that gates them. A durable queue in front of the receiver comes with them; today
a delivery is processed inline, which is a few milliseconds of database work
inside Meta's timeout.
