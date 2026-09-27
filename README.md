# OmniSync

A shared support inbox for WhatsApp Business and Instagram Direct, where every
conversation carries a response target and the queue is sorted by who has waited
longest.

The core idea is small: put wait time on the screen, sort by it, and make it
uncomfortable to ignore. Urgency is carried by value rather than colour — a breached
target renders as a solid block, a warning as a pale tint, on track as plain type — so
it survives greyscale, print and colour blindness.

> **Status: screens run on demo data; the backend exists but is not wired to them
> yet.** The schema, its row-level security and the Node service are built and
> tested ([plan.md](plan.md) phase 2). What the screens read is still the
> in-memory seed, and a reload still resets it — connecting the two is phase 3.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. No configuration is needed for the demo — copy
`.env.example` to `.env.local` when you have a Supabase project to point at.

| Script            | Does                                                 |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR                             |
| `npm run build`   | Production build to `dist/`                          |
| `npm run preview` | Serve the production build locally                   |
| `npm run lint`    | ESLint across the repo                               |
| `npm run test`    | Unit and component tests                             |
| `npm run test:db` | Schema and row-level security, against real Postgres |
| `npm run e2e`     | Playwright flows                                     |

The Node service is a separate package with its own dependencies:

```bash
cd server && npm install && npm run dev
```

## What is where

```
src/
  components/   Shared UI — Modal, Field, PageShell, AuthShell, Logo, and the
                three inbox panes (Sidebar, ConversationList, ChatWindow)
  pages/        One file per route, marketing and product
  state/        WorkspaceProvider — the conversations, policies and actions that
                the inbox, queue and sidebar all share
  hooks/        useConversations, useMembership
  content/      Copy and demo data, kept out of the components
  lib/          env, supabase (lazily loaded), seo, csv, roles
  index.css     The design system: tokens, .btn / .input / .tag / .sla utilities
supabase/       Migrations, and the tests that prove the tenancy rules
server/         The Node service: webhooks, the SLA engine, outbound sending
design/         The design system extracted from the source mockups
```

## Architecture

Three pieces, and a rule about each:

- **The client** renders and acts. It never computes an SLA clock and never
  reaches a customer directly.
- **Postgres** is the tenancy boundary. Every tenant row carries a
  `workspace_id`, row-level security scopes it to your memberships, and
  `sla_state` is readable but not writable from a browser.
  [supabase/README.md](supabase/README.md).
- **The Node service** does what a browser must not be trusted to do: verify
  Meta's webhook signatures, run the SLA clock against the workspace's business
  hours, and be the only path to a customer's handset.
  [server/README.md](server/README.md).

**Routes.** `/` landing, `/about` `/blog` `/careers` `/contact`, `/privacy` `/terms`
`/cookies`, `/login` `/signup` `/forgot-password`, `/setup` onboarding, and the
workspace under `/example` — inbox, queue, reports, team, settings.

## Design system

Light ground `#f2f2f3`, ink `#1d1f20`, steel-blue accent `#5980a6`, Barlow Condensed
headings over Barlow body, 2px radii, hairline rules. The tokens live in
`src/index.css`; the reasoning and the source artboards are in
[design/industry-tokens.md](design/industry-tokens.md).

The theme is light-only and declares `color-scheme: only light`.

## Project documents

- [plan.md](plan.md) — the path to production, phase by phase
- [changes.md](changes.md) — what changed and when
- [decisions.md](decisions.md) — why things are the way they are, and what each choice cost

## Stack

React 19 · Vite 7 · Tailwind 4 · React Router 7 · TanStack Query · Supabase (client
only, so far) · Framer Motion · Lucide.
