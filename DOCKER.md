# Docker Deployment Guide

This guide walks an engineer who just cloned the repo through everything needed to run, develop, and deploy **WorkTime** with Docker. Russian engineers welcome — сохраняем English technical terms for portability, comments inline where helpful.

---

## 1. Overview

WorkTime ships as a multi-service stack. In production all public traffic enters through `nginx`, which reverse-proxies to the frontend (Next.js) and backend (NestJS). Postgres and Redis are internal-only. Observability and tooling stacks are optional side-cars composed in on demand.

```
                       ┌───────────────────────────────────┐
                       │             Internet              │
                       └───────────────────┬───────────────┘
                                           │ :80 / :443 (TLS)
                                 ┌─────────▼─────────┐
                                 │       nginx       │  (reverse proxy + TLS)
                                 └───┬───────────┬───┘
                       /api, /ws     │           │    /, /_next/*
                       ┌─────────────▼─┐       ┌─▼──────────────┐
                       │    backend    │       │   frontend     │
                       │ NestJS :4000  │       │ Next.js :3000  │
                       └─┬───────────┬─┘       └────────────────┘
                 :5432   │           │   :6379
                ┌────────▼──┐   ┌────▼──────┐
                │ postgres  │   │   redis   │
                │ (pg_data) │   │(redis_data)│
                └───────────┘   └───────────┘

  ┌────────────────────────────┐     ┌────────────────────────────┐
  │ observability (side-car)   │     │  tools (side-car, dev)     │
  │ prometheus + grafana       │     │  pgadmin + redisinsight    │
  │ loki + promtail            │     │  mailhog + bullboard       │
  └────────────────────────────┘     └────────────────────────────┘
```

---

## 2. Quick start (local dev)

```bash
git clone git@github.com:aoneagency/worktime.git
cd worktime
cp .env.example .env                       # fill in secrets if прод-like
make dev                                   # OR: docker compose --profile dev up -d
pnpm db:push && pnpm db:seed               # schema + fixtures
```

After containers are healthy:

| Service       | URL                            | Notes                     |
| ------------- | ------------------------------ | ------------------------- |
| Web (Next.js) | http://localhost:3000          | Hot reload enabled        |
| API (NestJS)  | http://localhost:4000/api      | REST + WebSocket          |
| API docs      | http://localhost:4000/api/docs | Swagger UI                |
| pgAdmin       | http://localhost:5050          | `--profile tools`         |
| RedisInsight  | http://localhost:5540          | `--profile tools`         |
| Grafana       | http://localhost:3001          | `--profile observability` |
| Mailhog       | http://localhost:8025          | Captured outgoing emails  |
| BullBoard     | http://localhost:3030          | Queues dashboard          |

Stop everything: `make down` or `docker compose down`.

---

## 3. Compose files explained

The stack is split into purpose-scoped files. Compose **merges** them left-to-right; `docker-compose.override.yml` is auto-loaded.

| File                               | Purpose                                           | Auto-loaded |
| ---------------------------------- | ------------------------------------------------- | ----------- |
| `docker-compose.yml`               | Base: `postgres` + `redis` + shared networks      | yes         |
| `docker-compose.override.yml`      | Dev: `backend-dev`, `frontend-dev`, hot reload    | yes (dev)   |
| `docker-compose.prod.yml`          | Prod: full stack + `nginx` + hardened images      | no          |
| `docker-compose.observability.yml` | `prometheus`, `grafana`, `loki`, `promtail`       | no          |
| `docker-compose.tools.yml`         | `pgadmin`, `redisinsight`, `mailhog`, `bullboard` | no          |

### Typical combos

```bash
# Plain dev (auto-merge)
docker compose up -d

# Dev + tools
docker compose -f docker-compose.yml -f docker-compose.override.yml \
               -f docker-compose.tools.yml up -d

# Dev + full observability
docker compose -f docker-compose.yml -f docker-compose.override.yml \
               -f docker-compose.observability.yml up -d

# Production (no override)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Prod + observability
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
               -f docker-compose.observability.yml up -d
```

The `Makefile` wraps the common combos: `make dev`, `make dev-tools`, `make prod`, `make obs`.

---

## 4. Dev workflow

The `*-dev` services run the source tree directly via bind mounts — no image rebuild on code change.

- Bind mounts: `./backend:/app/backend:cached`, `./frontend:/app/frontend:cached`.
- `node_modules` is a **named volume** (`backend_node_modules`, `frontend_node_modules`) to avoid host/container arch mismatch on macOS.
- Backend: `pnpm start:dev` (nest CLI watch). Frontend: `pnpm dev` (Next.js turbopack).
- Debugger: backend exposes `--inspect=0.0.0.0:9229`. Port `9229` is published in `override.yml`.

### VS Code debugger (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to backend (Docker)",
      "type": "node",
      "request": "attach",
      "address": "localhost",
      "port": 9229,
      "localRoot": "${workspaceFolder}/backend",
      "remoteRoot": "/app/backend",
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
      "restart": true
    }
  ]
}
```

Chrome DevTools also works: navigate to `chrome://inspect` and click **inspect** on the `localhost:9229` target.

---

## 5. Production deployment

### 5.1 Build & push images

`docker-bake.hcl` declares multi-platform targets. Use `buildx bake` for parallelism and layer caching.

```bash
export REGISTRY=ghcr.io/aoneagency
export TAG=v1.4.0
docker buildx bake --push \
  --set "*.tags=${REGISTRY}/worktime-backend:${TAG}" \
  --set "*.platform=linux/amd64,linux/arm64"
```

### 5.2 Deploy on host

```bash
ssh deploy@worktime.aoneagency.kz
cd /srv/worktime
git pull
cp .env.prod.example .env && vim .env       # secrets, DATABASE_URL, JWT_SECRET ...
docker compose --env-file .env \
  -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose --env-file .env \
  -f docker-compose.yml -f docker-compose.prod.yml up -d --wait
```

### 5.3 Migrator profile

Migrations run as a **one-shot service** under `profiles: [migrate]` so they never linger:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --profile migrate run --rm migrator
```

### 5.4 nginx TLS via Let's Encrypt (certbot side-car)

`docker-compose.prod.yml` mounts `./deploy/nginx/certs` and a `certbot` side-car. First issue:

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d worktime.aoneagency.kz -d www.worktime.aoneagency.kz \
  --email info@aoneagency.kz --agree-tos --no-eff-email
docker compose exec nginx nginx -s reload
```

A cron-like sleep-loop inside the `certbot` container renews every 12h; nginx reloads via a shared named pipe at `/var/run/nginx.sock`.

### 5.5 Zero-downtime rollout

Rebuild and recreate app containers only — Postgres/Redis/nginx stay up:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  up -d --no-deps --build backend frontend
```

nginx keeps existing keep-alive connections on the old container until Compose swaps it (healthcheck must pass before traffic shifts).

---

## 6. Env vars per stack

Minimum required. Fuller list in `.env.example` / `.env.prod.example`.

| Variable                 | Dev default                                           | Prod                     | Used by             |
| ------------------------ | ----------------------------------------------------- | ------------------------ | ------------------- |
| `NODE_ENV`               | `development`                                         | `production`             | all node services   |
| `DATABASE_URL`           | `postgres://worktime:worktime@postgres:5432/worktime` | **required**             | backend, migrator   |
| `REDIS_URL`              | `redis://redis:6379`                                  | **required**             | backend, bullboard  |
| `JWT_SECRET`             | `dev-only-change-me`                                  | **required**             | backend             |
| `JWT_REFRESH_SECRET`     | `dev-only-change-me-refresh`                          | **required**             | backend             |
| `NEXT_PUBLIC_API_URL`    | `http://localhost:4000/api`                           | `https://.../api`        | frontend build-time |
| `SMTP_URL`               | `smtp://mailhog:1025`                                 | **required**             | backend (mail)      |
| `S3_ENDPOINT` / `S3_KEY` | optional                                              | **required**             | backend (uploads)   |
| `GRAFANA_ADMIN_PASSWORD` | `admin`                                               | **required**             | observability       |
| `PGADMIN_DEFAULT_EMAIL`  | `info@aoneagency.kz`                                  | n/a                      | tools               |
| `DOMAIN`                 | `localhost`                                           | `worktime.aoneagency.kz` | nginx               |

Never commit `.env` — it's in `.gitignore`. Prod secrets live in the deploy host (or Vault/SOPS).

---

## 7. Health checks & readiness

Backend exposes:

- `GET /api/health` — overall aggregate (DB + Redis + queue)
- `GET /api/healthz/live` — liveness, process responsive
- `GET /api/healthz/ready` — readiness, dependencies reachable

Compose healthchecks (excerpt):

```yaml
backend:
  healthcheck:
    test: ['CMD', 'wget', '-qO-', 'http://localhost:4000/api/healthz/ready']
    interval: 10s
    timeout: 3s
    retries: 10
    start_period: 20s

postgres:
  healthcheck:
    test: ['CMD-SHELL', 'pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}']
    interval: 5s
    timeout: 3s
    retries: 20
```

Use `docker compose up -d --wait` in CI/CD — Compose blocks until every service reports `healthy`, failing fast on startup regressions.

---

## 8. Volumes & persistence

Named volumes survive `docker compose down` (they're removed only with `-v`):

| Volume                  | Mounted at                   | Owner service  |
| ----------------------- | ---------------------------- | -------------- |
| `pg_data`               | `/var/lib/postgresql/data`   | postgres       |
| `redis_data`            | `/data`                      | redis          |
| `grafana_data`          | `/var/lib/grafana`           | grafana        |
| `prometheus_data`       | `/prometheus`                | prometheus     |
| `loki_data`             | `/loki`                      | loki           |
| `pgadmin_data`          | `/var/lib/pgadmin`           | pgadmin        |
| `backend_node_modules`  | `/app/backend/node_modules`  | backend-dev    |
| `frontend_node_modules` | `/app/frontend/node_modules` | frontend-dev   |
| `nginx_certs`           | `/etc/letsencrypt`           | nginx, certbot |

### Backup

Use `scripts/db-backup.sh` — runs `pg_dump` inside the postgres container, encrypts with `age`, uploads to S3. Schedule via cron on the host:

```cron
0 3 * * *   /srv/worktime/scripts/db-backup.sh >> /var/log/worktime-backup.log 2>&1
```

Restore: `scripts/db-restore.sh <backup-id>` — stops backend, drops DB, pipes dump into `psql`, re-runs migrations, restarts backend.

---

## 9. Troubleshooting

**`Cannot connect to the Docker daemon`** — Docker Desktop is not running. On macOS: `open -a Docker`. Wait for the whale icon to stop animating.

**Port conflicts (`bind: address already in use`)** — something else is on 3000/4000/5432. Override in `.env`:

```
WEB_PORT=3010
API_PORT=4010
POSTGRES_PORT=55432
```

Compose reads `${WEB_PORT:-3000}` etc.

**Postgres init race** — backend starts before `postgres` accepts connections. Always use `docker compose up -d --wait`; the healthcheck gates dependents via `depends_on.condition: service_healthy`.

**Volume permissions on macOS** — files owned by `root` inside the container appear as uid 0 on the host. Rebind to your user in `override.yml`:

```yaml
backend-dev:
  user: '${UID:-1000}:${GID:-1000}'
```

Export `UID` and `GID` in your shell (`export UID GID` in `~/.zshrc`).

**Stale `node_modules` after `package.json` change** — named volume caches the old tree:

```bash
docker compose build --no-cache backend
docker compose up -d --force-recreate backend
# or nuke the volume:
docker volume rm worktime_backend_node_modules
```

**Playwright fails on Apple Silicon (M1/M2/M3/M4)** — Chromium bundled is linux/amd64. Enable Rosetta emulation:

Docker Desktop → Settings → General → **Use Rosetta for x86/amd64 emulation on Apple Silicon** → Apply & Restart.

**Next.js hot reload not triggering on macOS** — FSEvents don't propagate cleanly across the VM boundary. Ensure the mount is `:cached` and that `WATCHPACK_POLLING=true` is set on the `frontend-dev` service as a fallback.

**Prisma client stale after `schema.prisma` change** — regenerate and restart:

```bash
docker compose exec backend-dev pnpm db:generate
docker compose restart backend-dev
```

If the container was built from a release image, rebuild: `docker compose build backend`.

---

## 10. Registry & CI

Images are published to **GHCR** (`ghcr.io/aoneagency/worktime-<service>`).

### Manual auth

```bash
echo "$GHCR_PAT" | docker login ghcr.io -u <username> --password-stdin
```

### Automated publish

`.github/workflows/docker.yml` triggers on pushes to `main` and on tag push `v*`. Steps:

1. Checkout + setup buildx + QEMU
2. Login to GHCR via `secrets.GITHUB_TOKEN`
3. `docker buildx bake --push` with tags from step below

### Tag strategy

| Trigger        | Tags pushed                                      |
| -------------- | ------------------------------------------------ |
| push to `main` | `main`, `sha-<shortsha>`                         |
| tag `v1.2.3`   | `v1.2.3`, `1.2`, `1`, `latest`, `sha-<shortsha>` |
| PR             | `pr-<number>` (not pushed to `latest`)           |

Prod deploys pin to `v<semver>` — never `latest`. `sha-*` tags give byte-exact provenance for rollbacks.

---

## 11. Security notes

- **Never commit `.env` / `.env.prod`.** Both git-ignored; pre-commit hook scans for `AKIA`, `PRIVATE KEY`, high-entropy strings.
- **Rotate secrets quarterly** — JWT secrets, DB password, S3 keys, SMTP, registry PAT. Runbook in `SECURITY.md`.
- **Non-root at runtime.** Every app Dockerfile ends with `USER node` (uid 1000). `migrator` runs as `node` too.
- **Read-only root FS** where possible: `read_only: true` + `tmpfs: /tmp` in `docker-compose.prod.yml`.
- **Helmet + strict CSP** at the nginx layer (`deploy/nginx/security.conf`): HSTS preload, `X-Frame-Options: DENY`, `default-src 'self'`.
- **Postgres never exposed** in prod — no `ports:` mapping. Access via `docker compose exec postgres psql` or SSH tunnel.
- **Redis password-protected** in prod (`REDIS_PASSWORD`); `requirepass` enforced via `redis.conf`.
- **Image scanning:** `trivy` runs in CI — job fails on HIGH/CRITICAL vulns unless allow-listed in `.trivyignore`.
- **Supply chain:** base images pinned by digest (`node:20-alpine@sha256:...`) and renovated weekly.

Issues → https://github.com/aoneagency/worktime/issues or info@aoneagency.kz.
