# WorkTime Documentation

This is the documentation entry point for the WorkTime project — a
Telegram-native time tracking and payroll platform for SMB employers
(B2B) and individual workers (B2C).

For the why-behind-the-what, start with the Architecture Decision Records.

## Architecture Decision Records

ADRs capture the significant, hard-to-reverse decisions that shape the
system. We use [MADR 4.0](https://adr.github.io/madr/). See
[`adr/README.md`](./adr/README.md) for the process, and
[`adr/template.md`](./adr/template.md) for the template.

| #    | Title                                                                                                         | Status   | Date       |
| ---- | ------------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| 0001 | [Use Postgres as source of truth; Google Sheets only as export](./adr/0001-postgres-as-source-of-truth.md)    | Accepted | 2026-04-17 |
| 0002 | [Rotate QR every 30s, geofence, and bind identity to Telegram](./adr/0002-rotating-qr-anti-fraud.md)          | Accepted | 2026-04-17 |
| 0003 | [Monorepo with pnpm workspaces + Turborepo; backend/ and frontend/ at root](./adr/0003-monorepo-structure.md) | Accepted | 2026-04-17 |
| 0004 | [Ship B2B and B2C together, with B2B as the priority path](./adr/0004-b2b-and-b2c-in-one-product.md)          | Accepted | 2026-04-17 |
| 0005 | [Telegram is the primary authentication channel](./adr/0005-telegram-as-primary-auth.md)                      | Accepted | 2026-04-17 |
| 0006 | [Editorial / Swiss design over generic SaaS shine](./adr/0006-editorial-design-system.md)                     | Accepted | 2026-04-17 |

## How to read this

- If you are new to the project, read the ADRs in order. They are
  deliberately written to be read front-to-back; later ADRs assume the
  earlier decisions.
- If you are proposing a change that contradicts an existing ADR, do not
  just ignore it — write a new ADR that supersedes it, referencing the
  old one. That is how we keep history honest.

## Adding documentation

- **Decisions** — new ADR under `adr/` using `adr/template.md`.
- **Guides / runbooks / reference** — add a new section to this file and
  link to a new document under `docs/`.

Do not let this file become stale. When you add an ADR, add the row.
