# 1. Use Postgres as source of truth; Google Sheets only as export

- Status: Accepted
- Date: 2026-04-17
- Deciders: Core team (product, backend, founder)
- Tags: data, storage, integrations

## Context and Problem Statement

The original product pitch proposed Google Sheets as the primary database —
one sheet per company per month, with the bot appending rows. This is
attractive because it is familiar to SMB owners and "just works" without
infrastructure. However, Sheets is not a database:

- Per-user API quotas (60 read/100 write per minute) become a hard ceiling
  as soon as more than a handful of employees check in concurrently.
- No referential integrity, no transactions, no indices — joins across
  employees, companies, shifts, and payroll are painful.
- Schema drift: a single user edit in the sheet can break the bot.
- Analytics (aggregations, cohorts, period-over-period) are near-impossible
  at any meaningful scale.

We need a backing store that supports concurrent writes, relational queries,
and painless schema evolution, while still meeting the "I want my data in a
spreadsheet" expectation of non-technical buyers.

## Considered Options

1. Google Sheets as primary store (the pitch proposal).
2. Postgres + Prisma as source of truth; Sheets as an optional export.
3. Firestore / DynamoDB as source of truth.
4. SQLite on disk per tenant.

## Decision

We adopt **Option 2**: Postgres is the source of truth for all domain
entities (User, Company, Employee, Shift, TimeEntry, Payroll). Prisma is the
ORM. Google Sheets integration is an **export surface only** — generated
per company, per month, on demand or on schedule — not a read path for the
application.

Rationale:

- Postgres scales well past the known product horizon (thousands of
  companies, tens of thousands of employees) on a single mid-sized instance.
- Prisma gives us type-safe access shared between NestJS and Next.js.
- Keeping Sheets as an export preserves the "I can see it in a spreadsheet"
  selling point without coupling runtime correctness to a third party.

## Consequences

Positive:

- Fast reads, honest transactions, indexable queries.
- Normalized analytics are trivial; we can ship reports without a warehouse.
- No Google API rate-limit anxiety on the hot path.
- Backups, migrations, and audit trails are standard.

Negative / tradeoffs:

- Users lose the ability to edit raw data in the sheet and have it flow
  back into the system. This is deemed acceptable: edits of authoritative
  time data via a spreadsheet are a compliance problem, not a feature.
- We take on operational ownership of a database (backups, migrations,
  upgrades).

Neutral:

- Sheets export runs as a background job and can be rebuilt from Postgres
  at any time, so divergence is recoverable by definition.

---

_Originally authored under project codename WorkTime; product renamed to Work Tact 2026-04-18._
