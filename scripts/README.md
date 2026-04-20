# scripts/

Helper shell scripts used by the root `Makefile` and by humans.

> **First-time setup:** after cloning, make the scripts executable once with
> `chmod +x scripts/*.sh` — git does preserve the +x bit, but fresh zips / some
> checkouts drop it. If you'd rather not chmod, invoke them through `sh`, e.g.
> `sh scripts/db-backup.sh`. The Makefile already calls them via `sh …` so
> `make db-backup` works either way.

## Scripts

- **`dev-bootstrap.sh`** — one-shot local setup. Verifies Node ≥ 22, pnpm ≥ 10
  and Docker are installed, copies `.env.example` → `.env` if missing, runs
  `pnpm install`, boots the dev docker compose stack, applies the Prisma schema
  (`pnpm db:push`), seeds it (`pnpm db:seed`), and prints the local URLs. Safe
  to re-run.
- **`db-backup.sh`** — dumps the database pointed at by `DATABASE_URL` (read
  from `.env`) into `./backups/worktime_<YYYYMMDD_HHMMSS>.sql.gz`. Creates the
  `backups/` directory on demand and logs the resulting file size. Invoked by
  `make db-backup`.
- **`db-restore.sh <file.sql.gz>`** — restores a gzipped dump into the database
  pointed at by `DATABASE_URL`. Prompts for confirmation (destructive!); pass
  `--yes` to skip the prompt in CI. Invoked by `make db-restore FILE=…`.

Run `make help` in the repo root for the full list of wrapper targets.
