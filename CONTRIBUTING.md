# Contributing

## Before you start

Read [plan.md](plan.md) for where the project is heading and [decisions.md](decisions.md)
for why things are the way they are. If your change contradicts a decision, that is
fine — mark the old entry superseded and add a new one explaining why.

## Working agreement

- Branch off `main`, keep branches short-lived, open a pull request.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
- `npm run lint` and `npm run build` must pass before review.
- Update `changes.md` as part of the work, not afterwards. Record new decisions in
  `decisions.md` with what the choice costs, not just what it is.

## House style

- Match the surrounding code — the codebase is deliberately consistent about naming,
  comment density and component shape.
- Reach for what already exists: `Modal`, `Field`, `PageShell`, `AuthShell` and the
  `.btn` / `.input` / `.tag` / `.sla` utilities in `src/index.css`. Do not introduce a
  second way to do something that already has one.
- Copy and demo data live in `src/content/`, never inline in components.
- Comments explain *why*, not *what*.

## Design

`design/industry-tokens.md` is the source of truth for tokens, spacing and the artboard
inventory. Urgency is expressed through value — solid block, pale tint, plain type —
never through a traffic-light palette.

## Accessibility

Every interactive control needs a name, a visible focus state and keyboard operation.
Labels are wired with `htmlFor`, dialogs trap focus and close on Escape, and motion
respects `prefers-reduced-motion`. These are requirements, not preferences.
