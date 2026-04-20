# 4. Ship B2B and B2C together, with B2B as the priority path

- Status: Accepted
- Date: 2026-04-17
- Deciders: Founder, product, backend lead
- Tags: product, strategy, scope

## Context and Problem Statement

Work Tact addresses two distinct audiences:

- **B2B**: small and mid-size employers who need to track when their
  staff actually show up, compute payroll, and export reports.
- **B2C**: individual workers (freelancers, shift workers, students) who
  want to log their own hours, track income, and see what a month of work
  actually looked like.

The tempting move is to split: ship B2B first as the revenue engine, then
possibly build B2C later as a separate product. The risk is that we end up
with two codebases, two onboarding flows, and two bots — doubling the
surface area we need to maintain against a small team.

## Considered Options

1. B2B only at launch; B2C as a future separate product.
2. B2C only at launch; B2B later.
3. **Ship both together: one platform, one bot, two dashboards; B2B is
   the prioritized go-to-market path.**
4. Two separate products sharing a backend.

## Decision

We adopt **Option 3**. One platform, one Telegram bot, two dashboards
(employer-facing and employee/self-tracking), unified backend and data
model. **B2B is the priority path**: LTV is materially higher, decision
cycles are structured, and usage is repeat-contractual.

The observation that justifies this:

- B2C ("I, an individual, want to log my hours") is a natural subset of
  the B2B primitives: User, Company (self-employed = company of one),
  Shift, TimeEntry, Payroll. We do not need a second schema, just a
  different onboarding and different dashboard views.
- Shipping B2C alongside B2B gives employees of B2B customers a reason to
  keep the app on their phone even after changing jobs — a retention moat
  that a pure-B2B product does not have.

## Consequences

Positive:

- One codebase, one bot, one data model — half the maintenance we would
  otherwise accrue.
- Employees churned from a B2B customer remain as B2C users; they are
  already onboarded, already bound to Telegram.
- Cross-sell path: a B2C user who starts a small business becomes a B2B
  customer without changing tools.

Negative / tradeoffs:

- Wider product surface area at launch. Mitigated by shared primitives
  and a single dashboard framework with role-based routes.
- Marketing has to speak to two audiences; we address this by leading
  with B2B messaging (the revenue story) and positioning B2C as "the
  same tool your employer uses, for you" where relevant.
- Feature priorities can conflict. Rule: **B2B wins ties**. B2C features
  that do not also benefit B2B (or do not ship cheaply on top of B2B
  primitives) are deprioritized.

Neutral:

- If operational load from B2C becomes a distraction we reserve the right
  to paywall or quietly sunset the B2C dashboard. The data model survives
  either way.

---

_Originally authored under project codename WorkTime; product renamed to Work Tact 2026-04-18._
