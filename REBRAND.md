# Rebrand: WorkTime → Work Tact

**Date:** 2026-04-18
**Reason:** The project codename "WorkTime" was the working title during initial scaffolding. The product is now formally named **Tact** (Такт in Russian) — short, bilingual, musical, and resonant with the core idea: _the rhythm of a working day_.

## Scope of the rename

### Renamed

- Product name in all UI copy (landing, dashboards, auth, emails, bot, PDFs)
- Package names: `@worktime/*` → `@tact/*`
- Swagger / OpenAPI spec title: "Work Tact API"
- PWA manifest name + short_name
- OG images + favicons (W → T glyph)
- Documentation prose (ADRs, architecture, troubleshooting, deployment)
- Image labels: `LABEL org.opencontainers.image.title="Work Tact Backend"` etc.

### NOT renamed (intentional)

- **Local disk path**: `/Users/who/Desktop/WorkTime/` — staying put to avoid disrupting in-flight git state
- **GitHub repo names**: `foxnaim/World-Time-Frontend`, `foxnaim/World-Time-back-End` — rename via `gh repo rename` when convenient; auto-redirects keep existing clones working
- **Docker resources**: `worktime-postgres`, `worktime-redis`, `pg_data`, `redis_data`, compose project name — renaming would orphan seeded volumes. Next fresh `docker compose down -v && up -d` is a clean opportunity if desired.
- **Prisma database name**: `POSTGRES_DB=worktime` — technical identifier, not user-facing
- **Env var keys**: `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, etc. — unchanged

## Tagline

- **RU:** Ритм рабочего дня
- **EN:** Keep the rhythm of your workday

## Palette (unchanged)

| Token | Hex       |
| ----- | --------- |
| cream | `#EAE7DC` |
| sand  | `#D8C3A5` |
| stone | `#8E8D8A` |
| coral | `#E98074` |
| red   | `#E85A4F` |

## Dial component (unchanged)

The editorial SVG Dial remains the product's brand element — hero, office QR countdown, KPI gauges.

## Still-to-do checklist (manual, requires user decision)

- [ ] `gh repo rename foxnaim/World-Time-Frontend foxnaim/tact-frontend` (or keep for SEO)
- [ ] `gh repo rename foxnaim/World-Time-back-End foxnaim/tact-backend`
- [ ] Register Telegram bot username under new brand (e.g. `@tact_bot`)
- [ ] Buy domain `tact.app` / `tact.kz` / `tactwork.app`
- [ ] Update social presence, Instagram, Product Hunt listing
- [ ] Press release / announcement post

## Migration notes for developers

If you pulled the repo before 2026-04-18:

1. `git pull` latest main
2. `pnpm install` — workspace deps re-symlink under `@tact/*`
3. If you had a bound Telegram bot locally, no env changes needed (keys are name-agnostic)
4. Delete `node_modules` and reinstall if imports break

## Files with historical "WorkTime" references preserved

- ADR footer notes (for historical record)
- Git history (unchanged)
- REBRAND.md itself
