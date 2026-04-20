# 3. Monorepo with pnpm workspaces + Turborepo; backend/ and frontend/ at root

- Status: Accepted
- Date: 2026-04-17
- Deciders: Core team (platform, backend, frontend)
- Tags: repo, tooling, dx

## Context and Problem Statement

We build two first-class applications — a NestJS API/bot (`backend`) and a
Next.js dashboard (`frontend`) — plus a Telegram bot that shares logic with
the backend. These apps need to share:

- Prisma schema and generated client (`database`).
- Domain types and DTOs (`types`).
- UI primitives and design tokens (`ui`).
- Shared lint/tsconfig/eslint presets (`config`).

If we split into multiple repos, every shared-type change turns into a
publish-and-bump dance across at least two repos. If we dump everything
into a single app, we lose the mental separation between the server-side
world and the browser world.

## Considered Options

1. Multi-repo (one repo per app, shared code as published npm packages).
2. **Monorepo with pnpm workspaces + Turborepo; apps live at `backend/`
   and `frontend/` at the top level (not under `apps/`).**
3. Monorepo with Nx.
4. Monorepo with Lerna + Yarn workspaces.

## Decision

We adopt **Option 2**.

Layout:

```
/
  backend/            NestJS API + Telegram bot
  frontend/           Next.js dashboard
  packages/
    database/         Prisma schema + client
    types/            Shared DTOs and domain types
    ui/               React components + design tokens
    config/           tsconfig, eslint, prettier presets
  docs/
    adr/              This directory
  turbo.json
  pnpm-workspace.yaml
```

Rationale:

- **pnpm workspaces**: fast, content-addressable, strict about phantom
  dependencies. Disk usage is friendly across many small packages.
- **Turborepo**: declarative task graph + remote caching. We do not need
  Nx's generators; we do need `turbo run build --filter=...` and cache.
- **Top-level `backend/` and `frontend/`** (rather than `apps/backend` and
  `apps/frontend`): a contributor opening the repo sees the two apps
  immediately without having to learn a conventional layout. This is the
  one place we deliberately diverge from the Turborepo default.

Alternatives rejected:

- **Multi-repo** multiplies PRs and CI setups, and slows every cross-cutting
  change. Our team is small; the coordination cost is too high.
- **Nx** is powerful but opinionated; its generator-first workflow is
  overkill for four shared packages.
- **Lerna** is effectively in maintenance mode; Turborepo covers our task
  orchestration needs.

## Consequences

Positive:

- Single `pnpm install` at the root sets up everything.
- Shared types are imported as `@worktime/types`, not fetched from a
  registry — refactors are atomic.
- Turborepo caches typecheck, lint, build, and test outputs per package.
- Clear separation: server work happens in `backend/`, UI work in
  `frontend/`, cross-cutting code in `packages/`.

Negative / tradeoffs:

- Contributors must learn one extra tool (pnpm) if they are used to npm
  or yarn. Tradeoff accepted; `pnpm install` is the only command most
  contributors run.
- Our top-level layout (`backend/`, `frontend/`) differs from the
  Turborepo docs, which consistently show `apps/`. New contributors need
  to internalize this once.

Neutral:

- If we later add more apps (e.g. a marketing site), we will re-evaluate
  whether to introduce `apps/`. Until then, two apps at the top level is
  clearer than one-app-plus-a-folder-of-one.

---

_Originally authored under project codename WorkTime; product renamed to Work Tact 2026-04-18._
