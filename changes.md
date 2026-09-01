# Changes

A running log of what changed in this project and why it mattered. Newest first.
Paired with [decisions.md](decisions.md), which records the reasoning behind the
choices rather than the edits themselves.

---

## 2026-08-31 — Phase 1 closed, except the one step that needs a remote

**Added**

- Coverage is a gate, not a script. Thresholds are a ratchet: the global floor
  sits just under today's numbers so coverage cannot regress, while `src/lib`
  (75%+) and `src/state` (65%+) are held higher because that is where behaviour
  lives. Presentational pages sit below the global figure on purpose — Playwright
  walks those. CI runs `npm run coverage` in place of `npm run test`.
- `.nvmrc` pinning Node 22, with both CI jobs reading `node-version-file`, so the
  local and CI versions cannot drift. They had already drifted: this machine runs
  Node 24 while CI pinned 22.
- husky + lint-staged (earlier this session): eslint and prettier run over staged
  files on every commit.
- `env.test.ts`: the production throw and development fallback had never been run.

**Fixed**

- `main.tsx` imported `./App.jsx` after the migration. It resolved only because
  bundler resolution maps `.jsx` onto `.tsx`, so the build stayed green while the
  path named a file that does not exist. Found by a pre-flight sweep for
  Linux-only CI failures; the rest of that sweep was clean.

**Verified**
Format, lint, types, 52 unit tests with coverage thresholds, build, and 15
end-to-end specs all green. The coverage gate was itself tested: an impossible
threshold exits 1, the real ones exit 0.

**Still outstanding**
Phase 1's own exit criterion is "green in CI on a pull request". There is no git
remote, so `ci.yml` has never executed. No `gh` CLI, no token, no SSH key and no
browser session are available to create one, so this needs the repository owner.

## 2026-08-31 — Tests for the two untested pieces that had already hidden bugs

Coverage from the unit suite was 23%. Most of the gap is presentational pages that
the Playwright suite already walks, but three logic-bearing files had no unit tests at
all — including `useSeo`, where a silent `seoDescription`/`description` mismatch had
gone unnoticed until the TypeScript migration.

**Added**

- `src/lib/seo.test.ts` — title composition, creating meta tags versus updating
  existing ones, the description fallback, and a single canonical link across
  re-renders. `seo.ts` goes from 0% to 96%.
- `src/components/Field.test.tsx` — the accessibility contract: label-to-control
  association, `aria-invalid` and `aria-describedby` wiring, error taking precedence
  over hint, unique ids per instance, and the polymorphic input/textarea/select
  branches.

One assertion is worth noting: the required-field marker is verified through the
accessible name rather than the label's text content, which proves the `aria-hidden`
asterisk is excluded from what a screen reader announces.

47 unit tests now, all green, alongside the 15 end-to-end specs.

## 2026-08-31 — Phase 1: TypeScript, tests and CI

The whole of `plan.md` phase 1. Every gate — format, lint, types, unit, e2e, build —
now runs on a pull request.

**TypeScript**

- All 50 files under `src/` migrated; `allowJs` is off, so the compiler checks the
  whole tree. `src/types/index.ts` holds the domain models the Supabase schema will
  have to match. ESLint reads `.ts`/`.tsx` through typescript-eslint.
- Real defects found by strict mode: `WorkspaceProvider` indexed `seedConversations[0]`
  unguarded; `AuthContext` took implicitly-any credentials; `main.tsx` assumed `#root`
  exists; `OnboardingPage` passed `seoDescription` to `useSeo`, which takes
  `description` — that page's meta description had never been set.

**Tests** — 30 unit and component tests (Vitest, Testing Library) and 15 end-to-end
specs (Playwright), covering `waitingSeconds` ordering, `toCsv` escaping, queue
filtering and search, the Modal dialog contract, the settings dirty/save/discard cycle,
signup → onboarding → connect → inbox, Take next, replying, resolving, the reports
range toggle, and a real CSV download whose contents are asserted.

**Bugs the tests found**

- `Modal`'s focus trap filtered candidates on `offsetParent`, a layout property that is
  null without a layout box — the trap could silently do nothing. It now filters on
  `hidden` and `aria-hidden`.
- `InboxView` used `w-full` beside the fixed-width sidebar, pushing the customer record
  off the edge; now `flex-1`.
- The thread header could not fit its actions on one line at 1280px, so **Assign,
  Snooze and Resolve were unclickable** — the customer record sat over them. The header
  wraps now.
- `jsx-a11y` caught the mobile menu closing via a click handler on its `<ul>`, which
  keyboard users never trigger. Each link closes it now.

**Tooling** — Prettier (110 columns, 4-space, single quotes, matching the existing
style), `eslint-plugin-jsx-a11y`, `.github/workflows/ci.yml` (verify + e2e jobs) and
Dependabot. New scripts: `typecheck`, `test`, `test:watch`, `coverage`, `e2e`, `e2e:ui`,
`format`, `format:check`.

**Environment notes** — Vitest runs on the threads pool because the default forks pool
times out here; test setup sets `MotionGlobalConfig.skipAnimations` because
AnimatePresence exits never complete under jsdom. Playwright uses port 5174 so a dev
server on 5173 is untouched.

## 2026-08-31 — Phase 0 foundations, and a plan

Added [plan.md](plan.md): the route from demo to shippable SaaS, agreed as a real
product on Supabase plus a Node service, in TypeScript. Then executed its Phase 0.

**Added**

- `plan.md` — eight phases, verification per phase, sequencing and risks.
- **Version control.** The project was not a git repository at all. Initialised on
  `main` with one commit capturing the current state; `dist/` and `node_modules` are
  correctly ignored, and `.gitattributes` normalises line endings.
- `.env.example` and `src/lib/env.js` — production builds now throw on a missing
  variable instead of silently using `placeholder_key`; development warns once and
  carries on so the demo still runs without a backend.
- `LICENSE` (proprietary placeholder — the copyright holder still needs setting) and
  `CONTRIBUTING.md`.

**Changed**

- `README.md` rewritten from the Vite template: what the product is, how to run it,
  where things live, and an explicit note that the backend does not exist yet.
- `src/lib/supabase.js` and `src/hooks/useConversations.js` read through `env` rather
  than touching `import.meta.env` directly.

**Removed**

- `socket.io-client`, `date-fns`, `autoprefixer`, `postcss` — four dependencies with
  zero imports between them. Tailwind 4's Vite plugin needs no PostCSS config.

**Verified**
Lint and build clean after the dependency removal; the workspace still loads with all
seven conversations and no console errors after the env refactor.

## 2026-08-31 — The product screens actually work

Closed the "action buttons are inert" and "two copies of the queue" items from
[decisions.md](decisions.md).

**Added**

- `src/state/WorkspaceProvider.jsx` and `src/state/workspace-context.js` — one
  workspace state shared by the inbox, queue and sidebar: assign, take next, bulk
  assign, snooze, resolve, reopen, send reply, edit policies, toggle escalation.
- `src/content/conversations.js` — the single conversation list both the inbox and
  the queue read from, replacing `src/components/initialChats.js` and the separate
  `queueRows` copy.
- `src/lib/csv.js` — CSV builder and download used by the queue and reports exports.

**Changed**

- Queue: Take next claims the longest-waiting unassigned conversation and opens it,
  Bulk assign takes everything unassigned, Filter narrows to unassigned, Assign works
  per row, customer names open the thread, Export CSV downloads the visible rows.
  Header counts and load-per-agent bars are computed from live state.
- Inbox: Assign to me / Unassign, Snooze, Resolve and Reopen all work; sending a reply
  appends the message, resets the timer, claims the conversation and updates the queue.
- Sidebar: Inbox, Queue and the four view counts derive from live state instead of
  hardcoded numbers.
- Settings: policies are editable (name, condition, target), Add a policy inserts one,
  Save/Discard are gated on a real dirty check, escalation switches persist.
- Reports: the range toggle switches between 7-day, 30-day and quarter datasets and
  changes the caption; Export CSV downloads the current range.
- Onboarding: Connect marks a channel connected and updates the "1 of 2 connected"
  step note.

**Verified in the browser**
Take next claimed Tomas Berg (31:05, the longest wait) and opened him in the inbox; a
reply moved him to Alex A. at 00:00 / on time; Snooze moved him from "Assigned to me"
to "Snoozed" in the sidebar; a policy target edit showed "Unsaved changes", saved, and
cleared; all three report ranges swap their numbers and captions.

**Still open**

- Team screen has no artboard.
- Onboarding covers step 2 only.
- No mobile layout for the workspace; below 880px it scrolls.
- State is in memory — a reload restores the seed data.

---

## 2026-08-31 — Product screens built to the mockups (1c–1f)

Implemented the four remaining artboards from `OmniSync Mockups.dc.html`.

**Added**

- `src/pages/QueuePage.jsx` — 1c Queue & assignment: one table sorted by longest
  wait, four summary stats, per-row policy/assignee, load-per-agent bars.
- `src/pages/OnboardingPage.jsx` — 1e Onboarding, step 2 of 4: four-step rail and
  the three channel rows (WhatsApp connected, Instagram to connect, Messenger gated).
- `src/content/workspace.js` — all demo data for 1c–1f, copy and numbers taken
  verbatim from the design file.
- Routes `/example/queue` and `/setup`; sidebar Queue entry restored.

**Changed**

- `src/pages/AnalyticsPage.jsx` — replaced the interim version with 1d Reports:
  four metrics, the "Where does the time go?" hour chart, by-channel, agents and
  top subjects.
- `src/pages/SettingsPage.jsx` — replaced the interim version with 1f: three
  policies, "When a target is missed" switches, effect-on-last-30-days panel and
  recent changes.
- `src/pages/SignupPage.jsx` — successful signup now enters `/setup` instead of
  dropping straight into the workspace.
- `src/pages/DashboardPage.jsx` — workspace scrolls horizontally below 880px
  rather than crushing the three-pane layout.

**Fixed**

- Reports hour chart rendered empty: bars used percentage heights inside
  auto-height flex wrappers, so they resolved to zero. Wrappers are now `h-full`.

**Known gaps**

- Team screen has no artboard; it remains an interim design.
- Onboarding is a single screen because only step 2 was drawn.
- Settings tabs other than Targets state that they are not part of the demo.
- Action buttons (Assign, Take next, Export CSV, Edit, Add a policy, Connect) are
  presentation only.

---

## 2026-08-31 — Design import and redesign onto the Industry system

Read `OmniSync Mockups.dc.html`, the Industry stylesheet and `support.js` from the
Claude Design project, and rebuilt the site's visual language against them.

**Added**

- `design/industry-tokens.md` — extracted tokens, artboard inventory, landing copy
  and inbox detail, so the build no longer depends on browser access.
- `src/components/Logo.jsx` — the new mark (two channels resolving into one line)
  and wordmark lockup.
- `src/components/Numbers.jsx`, `WhatItDoes.jsx`, `CustomerQuote.jsx` — landing
  sections from artboard 1g.

**Changed**

- `src/index.css` — whole token system replaced: light ground `#f2f2f3`, ink
  `#1d1f20`, steel-blue accent, Barlow Condensed over Barlow, 2px radii, hairline
  rules. Added `.btn`, `.input`, `.tag`, `.panel`, `.label` and the `.sla` states.
- `index.html` — Barlow fonts, light `theme-color`, new title and description.
- `public/og-image.svg` — redrawn in the new system with the new headline.
- Landing, navbar, footer, auth shell, content pages and modals all migrated off
  the glass/gradient styling.
- Inbox rebuilt as the three-pane 1a layout: `Sidebar.jsx`, `ConversationList.jsx`,
  `ChatWindow.jsx`, `initialChats.js`.
- Product copy dropped its AI framing — "AI-prioritised" is now "Rule fired · VIP +
  delivery keyword", logged in the thread and configured in Settings.

**Removed**

- `GlassCard.jsx`, `GradientButton.jsx`, `BackgroundBlobs.jsx`, `HowItWorks.jsx`,
  `CTA.jsx`, `Features.jsx`, `Testimonials.jsx`, `FAQ.jsx`, `ROICalculator.jsx`,
  and the `testimonials`/`faqs` exports — superseded by the mockup's landing.

**Fixed**

- Declared `color-scheme: only light`, correct for a light-only design.

---

## 2026-08-31 — Marketing site overhaul

**Added**

- Real pages replacing a shared placeholder: `AboutPage`, `BlogPage`, `CareersPage`,
  `ContactPage`, `LegalPage` (privacy/terms/cookies), `NotFoundPage`.
- `src/content/site.js` for page copy; `src/lib/seo.js` for per-route title,
  description and canonical; `ScrollToTop.jsx` for route and hash scrolling.
- Shared primitives replacing duplicated markup: `Modal.jsx` (focus trap, Escape,
  scroll lock, focus restore), `ContactForm.jsx`, `Field.jsx`, `PageShell.jsx`,
  `AuthShell.jsx`.
- Catch-all 404 route; skip link; `prefers-reduced-motion` handling.

**Removed**

- `DocumentPage.jsx` — 241 lines that rendered the same product dump on all seven
  company and legal routes.
- Dead `App.css`, unused `vite.svg` and `react.svg`.

**Fixed**

- Fonts referenced by the design system were never loaded; everything fell back to
  system sans.
- `index.html` title was `client`; no meta description, OG tags or favicon.
- Signup inputs were uncontrolled while `formData` state sat unused — nothing typed
  was captured.
- `AuthProvider` rendered `{!loading && children}`, so a slow Supabase call blanked
  the whole marketing site.
- In-page anchors (`#pricing`) were broken from every non-home page.
- Login's "Continue with Google" used a GitHub icon.
- Buttons nested inside anchors throughout.
- `npm run lint` failed on every file: core ESLint cannot see JSX-only identifiers.

**Performance**

- Entry bundle 199 kB → 135 kB gzip: Supabase lazy-loaded, react-query moved into
  the dashboard chunk, dashboard route split out.
