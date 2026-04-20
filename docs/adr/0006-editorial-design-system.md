# 6. Editorial / Swiss design over generic SaaS shine

- Status: Accepted
- Date: 2026-04-17
- Deciders: Founder, design, frontend
- Tags: design, brand, frontend

## Context and Problem Statement

The B2B SaaS category — time tracking especially — is visually saturated.
Nearly every competitor uses the same Tailwind-default aesthetic: indigo
primary, rounded-lg cards, gradient CTAs, oversized hero illustration.
Against that backdrop, any entrant that also ships that aesthetic is
invisible.

We are selling to SMB owners and operations managers who look at a lot of
tools. The front door needs to feel distinct enough that a prospect
remembers it a week later. The dashboard needs to feel confident and
unambiguous — we are in charge of someone's payroll data.

## Considered Options

1. Default Tailwind / shadcn look (fast, but indistinguishable).
2. Vendor-template look (HeroUI, NextUI, Material).
3. **Editorial / Swiss-inspired design system: serif display, sans UI,
   warm neutral palette, hairline borders, generous whitespace,
   restrained motion.**
4. Full custom illustrated / hand-drawn brand.

## Decision

We adopt **Option 3**.

Design language:

- **Typography**: Fraunces (variable serif) for display and numerals;
  Inter for UI text. Numerals are tabular so time values line up.
- **Palette**: cream, sand, stone, coral, red. No electric blue, no
  purple gradients. Coral and red are used sparingly for status and
  emphasis.
- **Surfaces**: flat. **Hairline borders** over drop-shadows. Radii are
  small and consistent; no "pill" buttons.
- **Motion**: framer-motion, subtle. Easing curves favor the gentle end;
  no bounce, no spring overshoot on utility interactions.
- **Layout**: generous whitespace, editorial grid (12-col with wide
  gutters). Content density is earned, not defaulted.
- **Brand element**: the **Dial** component — a circular time selector
  that appears on the landing page, in the check-in screen, and in the
  shift editor. It is the single most recognizable surface of the product.
- **Reference**: exteta.com for the overall feel (editorial, confident,
  typographic — not decorative).

Alternatives rejected:

- **Default Tailwind / shadcn**: we would ship faster, but indistinguish-
  able from every competitor. The speed gain is not worth the invisibility.
- **Vendor templates**: lock us into another team's evolution schedule and
  visual vocabulary.
- **Fully illustrated brand**: expensive to maintain, and illustration as
  a category is trending down in B2B.

## Consequences

Positive:

- A prospect can identify a Work Tact screenshot in a lineup of
  competitors. That is the goal.
- Serif + warm neutrals signal seriousness + craft — appropriate for
  "this tool handles my payroll" positioning.
- The Dial becomes a marketing asset: a visual shorthand for the product.

Negative / tradeoffs:

- Some users expect familiar SaaS affordances (blue primary button, card
  with shadow, rounded-xl). We will lose a small number of prospects who
  read "different" as "unreliable". Acceptable.
- Custom typography and palette mean we cannot lean entirely on a
  component library; `packages/ui` carries more weight.
- Framer-motion adds bundle weight; we mitigate by importing per-component
  and by keeping motion optional at the route boundary.

Neutral:

- The system is encoded in `packages/ui` and `packages/config`; if a
  future pivot demands a more conventional look we can retheme centrally.

---

_Originally authored under project codename WorkTime; product renamed to Work Tact 2026-04-18._
