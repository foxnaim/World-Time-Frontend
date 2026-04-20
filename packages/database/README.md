# @worktime/database

Prisma schema, generated client, migrations, and seed for the WorkTime monorepo.

## Contents

- `prisma/schema.prisma` — data model (User, Company, Employee, CheckIn, QRToken, InviteToken, Project, TimeEntry) and enums (EmployeeStatus, EmployeeRole, CheckInType, ProjectStatus).
- `prisma/migrations/` — hand-authored SQL migrations (Postgres).
- `src/index.ts` — shared `PrismaClient` singleton exported as `prisma`.
- `src/seed.ts` — idempotent seed script for local development.

## Configuration

Set `DATABASE_URL` in the repo-root `.env` to a Postgres connection string before running any command.

## Commands

Run from the repo root (delegated via Turborepo) or from this package:

- `pnpm db:generate` — regenerate the Prisma Client into `node_modules/.prisma/client`.
- `pnpm db:push` — push the schema to the database without creating a migration (fast iteration).
- `pnpm db:migrate` — create and apply a new migration in development (`prisma migrate dev`).
- `pnpm db:seed` — run `src/seed.ts` via `tsx` to populate demo data.
- `pnpm db:studio` — open Prisma Studio at http://localhost:5555.

## Seeding

The seed script lives at `src/seed.ts`. It upserts a demo owner user, a sample company, a staff employee, and a couple of projects. Run it with:

```
pnpm db:seed
```

Re-runs are safe — every insert uses `upsert` keyed by a stable field.

## Migrations

The initial migration is `prisma/migrations/20260417120000_init`. On a fresh database, apply it with `pnpm db:migrate` (dev) or `prisma migrate deploy` (prod). On an existing database already at this schema, mark it applied with `prisma migrate resolve --applied 20260417120000_init`.
