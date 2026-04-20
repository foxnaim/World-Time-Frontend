# Troubleshooting

Practical FAQ for common issues running, developing, and deploying Work Tact. If your problem is not listed here, see [Still stuck?](#still-stuck) at the bottom.

Before you dig in, grab the basics:

```sh
node -v        # should be >= 20
pnpm -v        # should be >= 9
docker -v
docker compose version
```

Most problems fall into one of four buckets: wrong env var, stale cache/build, port collision, or clock skew. Check those first.

---

## Getting Started

### `pnpm install` fails with "workspace:\* not found"

Happens when cloning only `backend/` or `frontend/` mirror repos. Those mirrors reference shared packages via `workspace:*` but the shared packages live in the monorepo root under `packages/`.

Fix:

- Clone the full monorepo: `git clone https://github.com/foxnaim/WorkTime.git`
- Or inline `packages/*` into the mirror before installing (copy the packages directory next to `backend/` or `frontend/` and adjust `pnpm-workspace.yaml`)

### `docker compose up -d` — "Cannot connect to the Docker daemon"

Docker Desktop (or the Docker daemon on Linux) is not running.

- On macOS: open the Docker Desktop app from Applications. Wait for the whale icon in the menu bar to go solid.
- On Linux: `sudo systemctl start docker` and optionally `sudo systemctl enable docker` so it starts on boot.
- On Windows (WSL2): start Docker Desktop, make sure WSL2 integration is enabled for your distro.

### Port 5432 / 6379 / 3000 / 4000 already in use

Another Postgres/Redis/Next/Nest instance is bound to the port. Find and kill it:

```sh
lsof -i :5432
kill -9 <PID>
```

Or change the port in `docker-compose.yml`. If you remap Postgres or Redis, remember to update `DATABASE_URL` and `REDIS_URL` in your `.env` — the mapped host-side port must match what your app connects to.

### `pnpm db:push` — "Environment variable not found: DATABASE_URL"

No `.env` loaded. Copy the template:

```sh
cp .env.example .env
```

Then edit it and fill in real values. Prisma reads `DATABASE_URL` from `.env` by default; if your shell uses a different loader (direnv, dotenv-cli), make sure it runs before Prisma.

---

## Auth

### "Invalid initData" on `/auth/telegram/verify`

The HMAC signature check against Telegram's initData failed. Common causes:

- `TELEGRAM_BOT_TOKEN` mismatch — verify it matches @BotFather's token exactly. Even a trailing newline breaks HMAC.
- `auth_date` is older than 5 minutes — clock drift on the user's device, or they left the WebApp open too long. Ask them to close and reopen.
- Running the Telegram WebApp inside a non-Telegram browser (e.g. the user opened the URL directly in Chrome). There is no `initData` outside the Telegram client.

### "Unauthorized" after login

JWT verification failed somewhere. Walk the chain:

- `wt_access` cookie missing — open devtools Application tab. If absent, check `SameSite` and `Secure` flags. In dev over http, `Secure=true` will prevent the cookie from being set.
- `JWT_PUBLIC_SECRET` (frontend) must equal `JWT_SECRET` (backend). For HS256 both sides share the same secret; for RS256 the frontend gets the public key.
- Clock skew between frontend middleware and backend — if they disagree by more than the JWT leeway, `exp` or `nbf` checks fail. NTP both machines.

### 6-digit code says "invalid"

- Code expired — codes live for 2 minutes. Ask the bot for a fresh one.
- Redis unavailable, or the backend is running multiple instances without shared Redis. In scale-out, the code is stored in the instance that issued it; if verification hits a different instance with its own in-memory cache, it 404s. Fix: ensure `REDIS_URL` is set on every replica and the in-memory fallback is disabled in prod.

---

## Check-in

### "Vne ofisnoy zony" (Out of geofence)

The user's reported coordinates are outside the company's geofence circle.

- `Company.latitude` / `Company.longitude` not set — check in admin settings. If null, the check fails by default.
- User's GPS is inaccurate — multi-floor buildings, basements, or weak signal can push reported location hundreds of meters.
- Try: increase `geofenceRadiusM` in company settings. 50m is tight; 100-150m is usually safe for an office block.

### "Token expired" on every scan

The QR token rotated between display and scan, or the device thinks it did.

- Device clock wrong — set to network/automatic time.
- QR rotation cron not running — look in backend logs for `rotateAll` messages. If absent, the scheduler module isn't loaded or crashed silently.
- Backend drifted from reality — restart the backend service (`docker compose restart backend`).

### QR doesn't rotate on office display

The display is an SSE stream from `/api/checkin/qr/:companyId/stream`. If it stops updating:

- SSE disconnected — check nginx has `proxy_buffering off` on the stream route. Buffered SSE appears to hang.
- Display key wrong — verify the `?key=<value>` in the URL matches an entry in the `DISPLAY_KEYS` env map. A wrong key silently 403s.
- Browser throttling background tabs — most browsers pause timers and network in hidden tabs. Keep the QR page foregrounded, use a dedicated display PC, or add a wake-lock.

---

## Telegram Bot

### Bot doesn't respond

- `TELEGRAM_BOT_TOKEN` wrong — double-check via `curl https://api.telegram.org/bot<TOKEN>/getMe`.
- Not running in polling mode but webhook not set: either run `npx telegraf set-webhook <url>` pointed at your backend, or switch to polling in dev by setting `TELEGRAM_MODE=polling`.
- Corporate firewall blocks `api.telegram.org` — test from the server: `curl https://api.telegram.org`. If it hangs, you need a proxy or to whitelist the CIDR.

### "Method not found" errors in bot logs

- `nestjs-telegraf` version mismatch with `telegraf` — pin them together in `package.json`. Major bumps on telegraf break the decorator API.
- Handler not registered in `telegram.module.ts` providers list. Every `@Update()` class must be in `providers`.

### `/projects` shows nothing for freelancer

- No `Project` rows seeded for this user. Check `pnpm db:seed` actually included them and the seed ran against the current DB.
- `Project.status = ARCHIVED` — the bot filters archived projects out of the default list. Add `--all` or toggle in settings to see them.

---

## Database

### Prisma `P2002: unique constraint failed`

Duplicate insert on a unique column. The error body names the field — often `telegramId`, `email`, or `slug`.

Two fixes depending on intent:

- Convert the `create` to an `upsert` if idempotency is desired.
- Catch the `P2002` and return HTTP 409 Conflict with a friendly message.

### Migrations drift from schema

Local schema and DB history diverged. Inspect and resolve:

```sh
pnpm --filter @worktime/database exec prisma migrate status
pnpm --filter @worktime/database exec prisma migrate resolve --applied 20260417120000_init
```

Only mark as applied after confirming the schema actually matches. When in doubt, `prisma db pull` to see what the DB currently looks like.

### `binaryTargets` mismatch in Docker

Prisma's native engine is compiled for your host OS; Alpine-based images need a different target. You'll see an error like `Prisma Client could not locate the Query Engine for runtime linux-musl`.

Add to `schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

Then re-run `pnpm db:generate`. Rebuild the Docker image — the engine is baked in at client generation time.

---

## Frontend

### Middleware infinite redirect

Symptom: browser address bar flickers between `/login` and the target route.

Common cause chain:

- `JWT_PUBLIC_SECRET` wrong or empty → verify fails → middleware tries refresh → refresh also fails (same wrong secret, or expired refresh) → back to `/login` → client auto-redirects → loop.

Fixes:

- Clear cookies in devtools Application tab, re-login.
- Verify backend `/api/auth/refresh` actually works with the refresh cookie via curl.
- Confirm the frontend and backend share the same secret and algorithm.

### "Hydration failed" on some pages

Next.js render mismatch between server HTML and client tree.

- Server-only code leaking into a client component — e.g. `new Date()` in the initial render. Move into `useEffect` and store in state.
- Timezone mismatch between server and client — format via a shared util that accepts a fixed locale and timezone, e.g. `formatInTimeZone(date, 'Asia/Almaty', 'yyyy-MM-dd HH:mm')`.
- Conditional rendering on `typeof window` — use `next/dynamic` with `ssr: false` for anything that can only render on the client.

### Styles look wrong / palette missing

- Tailwind content globs not catching `@worktime/ui` — check `tailwind.config.ts` `content` includes `../../packages/ui/src/**/*.{ts,tsx}`. Without this, Tailwind purges classes used in shared components.
- Old build cache — nuke it: `rm -rf .next && pnpm dev`.
- Missing CSS variable — some palette tokens are defined in `packages/ui/styles/globals.css`; make sure the app's root layout imports it.

### SSE disconnects every 30s

- Nginx default `proxy_read_timeout` is 60s. For SSE routes, raise it:

  ```nginx
  location /api/checkin/qr/ {
    proxy_buffering off;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }
  ```

- Cloud load balancer has its own idle timeout (AWS ALB default 60s, Cloudflare 100s). Either raise it or disable for `/api/*/stream`.

---

## Docker

### Build is slow

- Enable BuildKit: `DOCKER_BUILDKIT=1 docker build ...`. BuildKit parallelizes stages and caches aggressively.
- Use buildx cache: `--cache-to type=local,dest=.buildx-cache --cache-from type=local,src=.buildx-cache`.
- Check `.dockerignore` — `node_modules`, `.git`, `.next`, `dist` should all be excluded. Without this, the build context balloons to gigabytes and every build re-uploads it.

### "no space left on device"

Docker's layer cache and dangling volumes grow without bound.

```sh
docker system prune -a --volumes
```

Warning: this removes all stopped containers, unused networks, unused images, and unused volumes. Back up anything important first.

### Image runs locally but fails on Railway / Fly

- Missing env vars — check the service dashboard. Local `.env` is not copied up.
- Binary target mismatch (Prisma) — see the `binaryTargets` section under Database.
- Port binding: bind to `0.0.0.0`, not `localhost`. Set `HOSTNAME=0.0.0.0 PORT=4000` in the service env. Apps that bind to `127.0.0.1` are unreachable from outside the container.

---

## Observability

### No logs in Sentry

- `SENTRY_DSN` not set, or pointing at the wrong project. The DSN encodes the project key.
- `instrument.ts` not imported first in `main.ts` — it must be the very first line. Sentry patches `require` at init time; anything imported before it is untraced.
- Free tier rate limit hit — check the Sentry project's quota page. New events drop silently once the cap is reached.

### Logs not JSON in prod

Pino switches between pretty and JSON output based on `NODE_ENV`.

- `NODE_ENV=production` triggers JSON. If pretty is still showing, check for whitespace: `NODE_ENV="production "` (with trailing space) won't match, nor will `NODE_ENV=dev`.
- Some PaaS providers strip quotes and preserve spaces. `printenv NODE_ENV | cat -A` exposes trailing characters.

---

## Security

### Suspicious activity alert

- Check `/admin/companies` activity logs (TODO: dedicated audit log endpoint).
- Reset all JWT secrets — existing tokens invalidate immediately.
- Force re-login for all users by rotating `JWT_SECRET`. Warn users in-app beforehand if the breach isn't urgent.

### Leaked `.env` on GitHub

Treat as fully compromised. Don't just delete the file from the latest commit — git history still has it.

1. Rotate every secret:
   - Postgres password
   - JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
   - `TELEGRAM_BOT_TOKEN` — regenerate via BotFather's `/revoke` command and redeploy
   - SMTP password
   - Any third-party API keys
2. Purge from history:

   ```sh
   git filter-repo --path .env --invert-paths
   git push --force-with-lease
   ```

   This is destructive and rewrites every commit hash. Coordinate with the whole team — everyone must re-clone.

3. Add `.env` to `.gitignore` if not already. Also add `.env.*` to catch `.env.local`, `.env.production`.
4. Enable GitHub's secret scanning and push protection at the org level so it cannot happen again.

---

## Production

### High memory

- Check pino sampling — verbose logs eat RAM when shipping to external collectors.
- Prisma connection pool too large: `?connection_limit=10` in the `DATABASE_URL`. The default scales with CPU and can exhaust Postgres's `max_connections` on small instances.
- Sentry traces at 100% — drop `tracesSampleRate` to 0.1 (10%) in prod. Full tracing captures huge spans in memory before flushing.

### High CPU

- Missing DB indexes — grab a slow query from logs and run `EXPLAIN ANALYZE`. Look for `Seq Scan` on large tables.
- JSON serialization bottleneck on wide endpoints — pagination helps; so does `select`ing only the fields you return.
- Hot loop in a scheduled job — look at `top` inside the container and see which process is burning.

### "502 Bad Gateway"

- Backend crashed or not yet ready — `docker compose logs backend`. A recent crash leaves the gateway pointing at nothing.
- Timeouts: nginx `proxy_connect_timeout` needs to be greater than the backend's startup time. Default 60s is fine for a warm backend; cold starts on slow hosts may need 120s.
- Backend bound to wrong interface — if `HOSTNAME=127.0.0.1`, nginx in another container can't reach it. Use `0.0.0.0`.

### Telegram webhook returns 403

- Signed request secret mismatch — rotate via `setWebhook` again with the right `secret_token`.
- Nginx not forwarding the signature header — ensure:

  ```nginx
  proxy_set_header X-Telegram-Bot-Api-Secret-Token $http_x_telegram_bot_api_secret_token;
  ```

  Without this, the backend sees no header and rejects the request.

---

## Still stuck?

Open an issue with:

- OS + Node + pnpm version (`node -v`, `pnpm -v`, `uname -a`)
- Full error log (redact secrets)
- Steps to reproduce (minimal, if possible)
- What you've already tried

Repos:

- Backend: https://github.com/foxnaim/World-Time-back-End/issues
- Frontend: https://github.com/foxnaim/World-Time-Frontend/issues

The more detail you provide upfront, the faster someone can help. Screenshots of network and console tabs are often worth more than a paragraph of prose.
