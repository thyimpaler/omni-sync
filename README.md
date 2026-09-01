# OmniSync

A shared support inbox for WhatsApp Business and Instagram Direct, where every
conversation carries a response target and the queue is sorted by who has waited
longest.

The core idea is small: put wait time on the screen, sort by it, and make it
uncomfortable to ignore. Urgency is carried by value rather than colour — a breached
target renders as a solid block, a warning as a pale tint, on track as plain type — so
it survives greyscale, print and colour blindness.

> **Status: front end complete, backend not built.** Every screen works against
> in-memory demo data; a reload resets it. There is no database, no auth and no channel
> integration yet. [plan.md](plan.md) is the route from here to something shippable.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. No configuration is needed for the demo — copy
`.env.example` to `.env.local` when you have a Supabase project to point at.

| Script            | Does                               |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Vite dev server with HMR           |
| `npm run build`   | Production build to `dist/`        |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | ESLint across the repo             |

## What is where

```
src/
  components/   Shared UI — Modal, Field, PageShell, AuthShell, Logo, and the
                three inbox panes (Sidebar, ConversationList, ChatWindow)
  pages/        One file per route, marketing and product
  state/        WorkspaceProvider — the conversations, policies and actions that
                the inbox, queue and sidebar all share
  content/      Copy and demo data, kept out of the components
  lib/          env, supabase (lazily loaded), seo, csv
  index.css     The design system: tokens, .btn / .input / .tag / .sla utilities
design/         The design system extracted from the source mockups
```

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
