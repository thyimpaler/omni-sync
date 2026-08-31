# OmniSync Mockups — extracted design system ("Industry")

Source: Claude Design project `0910a244-05ad-4cc5-919c-d5172035bd9f`,
file `OmniSync Mockups.dc.html`, design system
`_ds/industry-0f3c5156-f865-4360-bb0b-08f1cb9ad89b/styles.css`.

## Direction (from the design note)

> Six screens plus a new mark. The gradient/glass/dark-slop layer is gone, and so is the
> AI framing in the product copy — auto-prioritisation is now stated as what it actually is,
> keyword and VIP rules you configure. Urgency is carried by value rather than a traffic-light
> palette: a breached wait renders as a solid steel block, a warning as a pale steel tint,
> on-track as plain rule. Layout variants are 1a three-pane vs 1b two-pane.

Two changes beyond styling:
- **AI framing removed from the product, not just the visuals.** "AI-prioritised" becomes
  "Rule fired · VIP + delivery keyword", logged in the thread, configured on the settings screen.
  The landing page states outright that nothing sends without an agent pressing send.
- **Urgency reads through value, not colour.** Breached = solid dark block; warning = pale tint;
  on-track = plain type. Scannable without a traffic-light palette.

## Artboards

| id | Screen |
|----|--------|
| `brand` | New mark — two channels resolving into one line |
| `1a` | Inbox — three-pane: queue, thread, customer record (1440w) |
| `1b` | Inbox — two-pane: icon rail, queue + thread, record on demand (1240w) |
| `1c` | Queue & assignment — one table, sorted by who has waited longest (1240w) |
| `1d` | Reports — the manager's SLA view, one question per block (1240w) |
| `1e` | Onboarding — connect a channel, step 2 of 4 (1000w) |
| `1f` | Settings — response targets and routing rules (1140w) |
| `1g` | Landing page — claims tied to numbers, no gradient hero (1240w) |

## Tokens

### Core
```
--color-bg:       #f2f2f3
--color-surface:  #e9e9ea
--color-text:     #1d1f20
--color-accent:   #5980a6
--color-accent-2: #728fab
--color-divider:  color-mix(in srgb, #1d1f20 16%, transparent)
```

### Neutral ramp
```
100 #f5f5f8   200 #e7e7ea   300 #d4d4d7   400 #b7b7ba   500 #98989b
600 #7a7a7d   700 #5d5d60   800 #424244   900 #2b2b2d
```

### Accent ramp (steel blue)
```
100 #eef6ff   200 #d6ebff   300 #b5d9fd   400 #94bce3   500 #749dc4
600 #597ea3   700 #416180   800 #2c455d   900 #1d2d3d
```

### Accent-2 ramp
```
100 #eef6ff   200 #d6ebff   300 #bdd8f2   400 #9ebbd8   500 #7e9cb8
600 #627d98   700 #486077   800 #314457   900 #1f2d3a
```

### Type
```
--font-heading: "Barlow Condensed", system-ui, sans-serif   (weight 600)
--font-body:    "Barlow", system-ui, sans-serif
```

### Space / radius / elevation
```
--space-1 3.4px  --space-2 6.8px  --space-3 10.2px
--space-4 13.6px --space-6 20.4px --space-8 27.2px

--radius-sm 2px  --radius-md 4px  --radius-lg 7px

--shadow-sm 0 1px 2px  color-mix(in srgb, #2b2b2d 14%, transparent)
--shadow-md 0 3px 10px color-mix(in srgb, #2b2b2d 16%, transparent)
--shadow-lg 0 12px 32px color-mix(in srgb, #2b2b2d 22%, transparent)
```

### Component classes present in the system
`.btn` (`-primary`, `-secondary`, `-ghost`, `-icon`, `-block`), `.field`/`.input`,
`.radio`, `.seg`/`.seg-opt` (segmented control), `.card` (`-kicker`, `-title`, `-body`, `-meta`),
`.elev-sm|md|lg`, `.tag` (`-accent`, `-accent-2`, `-neutral`, `-outline`), `.nav`,
plus `.blueprint` decorative frames (corner marks, halftone/plate/duotone treatments).

## Landing page (1g) copy — verbatim

Nav: OMNISYNC · Product · Pricing · Customers · Docs · Sign in · **Start free**

Eyebrow: `WHATSAPP AND INSTAGRAM · ONE INBOX`

H1: **Every customer message in one queue, with a clock on it.**

Sub: OmniSync pulls your WhatsApp Business and Instagram Direct messages into a single shared
inbox, puts a response target on each one, and tells you who is about to miss theirs.

CTAs: Start free for 14 days · Book a walkthrough
Note: No card required · connect a channel in about four minutes

Inbox preview (INBOX / sorted by wait time):
- Amanda Smith — WhatsApp · package not delivered — 04:12 (breached, solid block)
- Elena Rodriguez — WhatsApp · bulk quote — 11:30
- Michael Chen — Instagram · shipping question — 14:02

Caption: The actual inbox. Solid block means the target has already been missed.

Numbers:
- **3m 41s** — Median first response across customer workspaces, August 2026
- **2** — Channels today: WhatsApp Business and Instagram Direct. Messenger is next.
- **4 min** — Median time from signup to a first message landing in the inbox

Section: **What it does** — "Four things, all of them plumbing. Nothing writes to a customer
without an agent pressing send."

01 **One shared inbox** — Both channels in one list, with assignment, internal notes and a full
history per customer.
02 **Response targets** — Set a target per policy. Every conversation carries a visible clock,
counted in business hours.
03 **Rules you write** — Route and prioritise on tags, keywords and spend. Every rule that fires
is logged in the thread.
04 **Reports that name the hour** — Compliance by policy, channel, agent and hour of day,
exportable as CSV.

FROM A CUSTOMER:
"Two people were watching two phones and a laptop. Now there is one list, and we can see who has
been waiting longest. Average first reply went from about eleven minutes to under four."
— Dami Aluko · Operations, Northfield Supply Co. · 6 agents

PRICING:
- **Team £29** per agent, per month — Both channels · Unlimited policies · 90 days of reporting
- **Growth £49** per agent, per month — Messenger when it ships · Unlimited history · API and webhooks
- Start free · Annual billing takes two months off

Footer: OMNISYNC · Product · Pricing · Docs · Status · Privacy · Terms

## Inbox (1a) details observed

- Left rail: OMNISYNC mark; WORKSPACE (Inbox, Queue, Reports, Team, Settings);
  VIEWS (Assigned to me · 4, Unassigned · 9, Breached · 2, Snoozed · 6)
- Queue column: "Inbox" + "sorted by wait time", search field, filter chips
  (ALL · BREACHED 2 · ORDERS · RETURNS), column headers CONVERSATION / WAITING
- Rows: name, `channel · state` meta, message preview, right-aligned timer with state
  (BREACHED = solid dark block, WARNING = pale tint, ON TIME = plain, CLOSED = grey)
- Thread: customer header (WhatsApp Business · +44 7700 900412 · 4 previous conversations),
  breach chip `SLA BREACHED 04:12`, Assign / Snooze actions, day divider, timestamped messages,
  rule banner `RULE FIRED · VIP + DELIVERY KEYWORD — Priority raised to High. Target first
  response reduced to 5 minutes.`, agent reply in accent, canned-reply chips
  (`/refund — start a refund`, `/quote — bulk pricing`, `/track — delivery status`, `/note — internal`)
- Right rail: CUSTOMER (name, "Customer since Mar 2023 · 11 orders · £1,842 lifetime", tags VIP /
  Delivery), ORDER IN QUESTION (#204118, 2 items · £96.00, courier scan, DELAYED IN TRANSIT),
  SLA POLICY (Policy VIP · 5 min, First response Missed by 04:12, Resolution target 4 hours,
  Business hours 08:00–20:00 GMT), RECENT CONVERSATIONS list
