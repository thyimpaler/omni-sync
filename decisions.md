# Decisions

Why the project is the way it is. Each entry records the choice, the reasoning, and
what it costs — so a decision can be revisited on its merits rather than rediscovered.
Paired with [changes.md](changes.md), which logs the edits themselves.

Status values: **active**, **superseded**, **revisit**.

---

## 18. Focusability is judged semantically, not by layout

**2026-08-31 · active**

`Modal`'s focus trap filters candidates on `hidden` and `aria-hidden` rather than
`offsetParent !== null`.

**Why.** `offsetParent` is a layout property: null for any element without a layout
box, and null inside a fixed-position container in some engines. When the filter
emptied the list the trap silently did nothing and Tab escaped the dialog. The
semantic check behaves identically in jsdom and in browsers, which is also what
made it testable.

**Cost.** An element hidden purely by CSS would now be counted. Browsers skip such
elements natively, so the practical risk is small.

---

## 17. Tests are a gate, not a suggestion

**2026-08-31 · active**

`npm run build` runs `tsc --noEmit` first, and CI runs format, lint, types, unit,
build and e2e on every pull request.

**Why.** The suite has already paid for itself: within one session it found a dead
focus trap, three unclickable buttons at 1280px, and a meta description that had
never been set. None of those were visible by looking at the screen.

**Cost.** CI minutes, and a slower local build. Both are cheaper than the defects.

---

## 16. Environment variables fail fast in production

**2026-08-31 · active**

`src/lib/env.js` throws on a missing variable in production builds, warns once and
uses a demo fallback in development.

**Why.** The previous `import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'`
meant a misconfigured deploy looked healthy until the first request failed, with an
error that pointed at Supabase rather than at the missing config. Failing at startup
names the actual problem.

**Cost.** A production build now needs real values present, including for previews.

---

## 15. The product is headed for real release, on Supabase plus a Node service

**2026-08-31 · active · user decision**

Chosen over a portfolio-grade front end or an investor demo. TypeScript migration is
in scope; the backend is Supabase Postgres with a separate Node service for webhooks
and the SLA engine. Recorded in full in [plan.md](plan.md).

**Why.** The project owner's call. It sets the bar for everything else: multi-tenant
isolation, an authoritative server-side clock, and Meta platform review.

**Cost.** Months rather than weeks, and the critical path runs through Meta app
review, which is outside our control. The licence was therefore set to proprietary
rather than MIT — an open-source licence is hard to walk back.

---

## 14. The workspace has one state, shared by every screen

**2026-08-31 · active**

`WorkspaceProvider` holds the conversations, policies and escalation switches.
The inbox, queue and sidebar all read from it, and `src/content/conversations.js`
is the only conversation list.

**Why.** The queue table and the inbox previously carried separate copies of the
same six people, already diverging in names and subjects. Assigning in one had no
effect on the other, which is exactly the confusion the product exists to remove.
One state also makes the sidebar counts real rather than hardcoded.

**Cost.** State lives in memory, so a reload restores the seed data. Persisting it
means swapping the provider's internals, not the screens.

---

## 13. Demo actions do the real thing locally, and say when they cannot

**2026-08-31 · active**

Assign, Take next, Bulk assign, Filter, Snooze, Resolve, Reopen, reply, policy
editing and both CSV exports all work against local state. The controls that have
no local meaning — Messenger's "Later", the four non-Targets settings tabs — say so
rather than doing nothing.

**Why.** A demo whose buttons are decorative teaches visitors that the product is a
mockup. Local state is enough to show the actual behaviour: claiming the
longest-waiting conversation, watching the sidebar counts move, exporting the queue.

**Cost.** Nothing is written to a server, and the numbers on Reports remain fixed
demo data rather than being computed from the live conversations.

---

## 12. Product screens follow the design's demo data verbatim

**2026-08-31 · active**

The numbers on Queue, Reports and Settings (04:12 longest wait, 94.2% compliance,
the 12:00–14:00 breach window, the three policies) are copied exactly from the
artboards into `src/content/workspace.js` rather than invented or randomised.

**Why.** The design's numbers tell a coherent story — the lunchtime dip explains the
breaches, which explains the VIP policy. Invented data breaks that. Keeping it in one
content module means the screens stay layout-only and the story can be edited in one place.

**Cost.** Data is static. Wiring real APIs means replacing this module, not editing
the screens.

---

## 11. Inbox uses the three-pane layout (1a), not two-pane (1b)

**2026-08-31 · active · user decision**

The design shipped both and asked which to keep.

**Why.** Chosen by the project owner. Queue, thread and customer record are visible
at once, which is the denser and more informative of the two.

**Cost.** Needs a wide display. Below 880px the workspace scrolls horizontally
instead of reflowing; there is no mobile layout in the mockups to build against.

---

## 10. Landing matches the mockup exactly; ROI calculator, FAQ and testimonial grid deleted

**2026-08-31 · active · user decision**

**Why.** Chosen by the project owner over re-adding them. The mockup's landing is
deliberately lean — hero, numbers, four capabilities, one quote, pricing.

**Cost.** Two conversion tools and an SEO surface are gone. The components were
deleted rather than left unused; restoring them means rebuilding in the new system.

---

## 9. AI framing removed from product copy, not just the visuals

**2026-08-31 · active**

"AI-prioritised" became "Rule fired · VIP + delivery keyword", logged in the thread
and configured on the settings screen. The landing says outright that nothing writes
to a customer without an agent pressing send.

**Why.** Carried over from the design's own direction. The feature was always
keyword and VIP rules; describing it as AI oversold it and made the behaviour harder
to predict. Saying what it does is both more honest and more useful.

**Cost.** Loses a marketing term some buyers scan for.

---

## 8. Urgency reads through value, never colour

**2026-08-31 · active**

Breached renders as a solid dark block, warning as a pale tint, on-track as plain
type. The `.sla-*` utilities in `src/index.css` are the single source of this.

**Why.** From the design. A traffic-light palette fails for colour-blind users and
turns into noise when a queue is mostly red. Value survives greyscale and print.

**Cost.** Needs the label text ("Breached") alongside, since hue no longer carries
the meaning on its own.

---

## 7. Light-only theme, declared as such

**2026-08-31 · active**

`color-scheme: only light` in CSS and in the meta tag. No dark variants.

**Why.** The Industry system is a light design; a half-derived dark mode would drift
from it. Declaring the scheme stops browsers from auto-darkening a page that has no
dark palette.

**Note.** This was first added in response to a page rendering black in a test
browser. That turned out to be a Dark Reader extension, not a browser behaviour —
the declaration is still correct, but it was not the fix it appeared to be. Users
running Dark Reader will see an inverted site regardless.

---

## 6. Design assets are extracted to the repo, not fetched on demand

**2026-08-31 · active**

`design/industry-tokens.md` holds the tokens, artboard inventory and copy.

**Why.** Reading the Claude Design project needs either `/design-login` (unavailable
in non-interactive sessions) or a connected Chrome extension. Neither is guaranteed.
Committing the extracted system means the build never blocks on browser access.

**Cost.** The file drifts if the design changes. It names its source project and
file so it can be refreshed.

---

## 5. One `LegalPage` component serves privacy, terms and cookies

**2026-08-31 · active**

Same for `PageShell` (all content pages), `AuthShell` (three auth screens),
`Modal` and `ContactForm` (previously duplicated in CTA and Pricing).

**Why.** The originals were near-identical copies that had already drifted apart.
One implementation means an accessibility or styling fix lands everywhere at once.

**Cost.** Slightly more indirection when a single page needs to diverge.

---

## 4. Supabase is lazy-loaded; react-query lives in the dashboard chunk

**2026-08-31 · active**

`src/lib/supabase.js` exports `getSupabase()`, which imports the client on first use.
`QueryClientProvider` moved from `App.jsx` into `DashboardPage.jsx`.

**Why.** Marketing visitors never touch auth or data fetching, but were downloading
both. This took the entry bundle from 199 kB to 135 kB gzip.

**Cost.** Auth methods are async. Real login flows must await the client.

---

## 3. `AuthProvider` never blocks the first paint

**2026-08-31 · active**

It renders `{children}` unconditionally and exposes `loading` through context.

**Why.** It previously rendered `{!loading && children}`, so every marketing page
waited on a Supabase session call — a slow or unreachable backend meant a blank site.

**Cost.** Consumers that need a resolved session must read `loading` themselves.
`ProtectedRoute` will need this when auth becomes real.

---

## 2. `eslint-plugin-react` added for `jsx-uses-vars` only

**2026-08-31 · active**

**Why.** Core ESLint cannot see identifiers used only in JSX, so `no-unused-vars`
flagged every lowercase JSX import — `motion` in particular. Lint failed on every
file in the repo and was therefore being ignored. The plugin's recommended set was
deliberately not enabled, only the one rule.

**Cost.** One more devDependency.

---

## 1. Placeholder and dead code is deleted, not left in place

**2026-08-31 · active**

`DocumentPage.jsx` (one product dump served on seven routes), `App.css`, unused SVG
assets and the superseded landing components were removed rather than kept around.

**Why.** The dump actively misled visitors — About, Careers and Privacy all showed
the same text. Unused files invite accidental reuse and hide what is live.

**Cost.** Recovering deleted work means rewriting it. Retained deliberately:
`ProtectedRoute.jsx`, `EmptyState.jsx`, `SkeletonLoader.jsx` and
`useConversations.js` — currently unused, but scaffolding the product phase needs.

---

## Open questions

- **Team screen has no design.** The current one is invented. Either draw it or
  decide it does not ship.
- **Onboarding is one screen of four.** Steps 1, 3 and 4 were never drawn.
- **Reports numbers are static.** Every other screen is live; the report metrics are
  still fixed demo data rather than derived from the conversations.
- **Nothing persists.** A reload resets the workspace to seed data.
- **No mobile layout for the workspace.** Horizontal scroll is a stopgap.
- **`og-image.svg` is an SVG.** Most social scrapers want PNG or JPEG.
- **The LICENSE copyright holder is a placeholder.** Set the real legal entity.
- **Reports numbers are static.** Every other screen is live.
- **No coverage threshold yet.** The suite is meaningful but not enforced at a level.
