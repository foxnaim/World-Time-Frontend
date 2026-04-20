# Dev Tools Stack

Opt-in developer tooling that augments the base `docker-compose.yml` with
database/queue/email inspection UIs. None of these services are required to
run WorkTime — they exist to speed up local development and debugging.

## Usage

Start the tools stack alongside the base dev stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.tools.yml up -d
```

Stop only the tools (leave app containers running):

```bash
docker compose -f docker-compose.yml -f docker-compose.tools.yml stop \
  pgadmin redis-insight mailhog bullboard
```

Tear everything down (including named tool volumes):

```bash
docker compose -f docker-compose.yml -f docker-compose.tools.yml down -v
```

Start a subset — e.g. only MailHog + pgAdmin:

```bash
docker compose -f docker-compose.yml -f docker-compose.tools.yml up -d \
  pgadmin mailhog
```

## Services

| Service        | URL                        | Purpose                                  |
| -------------- | -------------------------- | ---------------------------------------- |
| pgAdmin        | http://localhost:5050      | Postgres admin UI                        |
| RedisInsight   | http://localhost:5540      | Redis keyspace / stream / stream viewer  |
| MailHog (Web)  | http://localhost:8025      | Captured SMTP message viewer             |
| MailHog (SMTP) | smtp://localhost:1025      | Dev SMTP sink for NotificationService    |
| Bull Board     | http://localhost:3002      | BullMQ queue/job inspector (opt-in)      |

## Credentials

| Service      | Username / Email           | Password | Notes                                         |
| ------------ | -------------------------- | -------- | --------------------------------------------- |
| pgAdmin      | `admin@worktime.local`     | `admin`  | Auto-connects to `postgres` via servers.json  |
| Postgres     | `worktime`                 | `worktime` | Used inside pgAdmin; prompted on first connect |
| RedisInsight | n/a                        | n/a      | Preloaded connection to `redis:6379`          |
| MailHog      | n/a                        | n/a      | No auth; any SMTP creds accepted              |
| Bull Board   | n/a                        | n/a      | No auth; reads `redis:6379`                   |

## Auto-wired connections

- **pgAdmin** — `./docker/pgadmin/servers.json` is mounted at
  `/pgadmin4/servers.json` and imported on first boot. The server appears as
  "WorkTime Postgres" in the sidebar. The Postgres password (`worktime`) is
  entered on first connect and cached in the `pgadmin_data` volume.
- **RedisInsight** — `./docker/redisinsight/connections.json` is mounted at
  `/data/connections.json` read-only and loaded on first boot. The connection
  appears as "WorkTime Redis".
- **Bull Board** — reads BullMQ queues from `redis:6379` via `REDIS_HOST` /
  `REDIS_PORT` env. Requires backend workers to be using BullMQ; safe to
  ignore (or omit from the `up` command) otherwise.
- **MailHog** — exposes SMTP on `1025` and a web UI on `8025`. Point the
  backend at it with `SMTP_HOST=mailhog` / `SMTP_PORT=1025` (see
  `.env.example`).

## Data persistence

Named volumes:

- `pgadmin_data` — pgAdmin session / saved-query / cached-password storage.
- `redisinsight_data` — RedisInsight workspace.

MailHog and Bull Board are stateless. The base `worktime_postgres` and
`worktime_redis` volumes from `docker-compose.yml` carry the actual data the
tools inspect.

## Adding more tools

Append new services to `docker-compose.tools.yml` under the same `services:`
block. Conventions:

1. Bind host ports in the 5000–5999 / 8000–8999 range so they don't collide
   with app ports (`3000`, `4000`).
2. Mount any declarative config from `./docker/<tool>/` (read-only where
   possible) so the stack is reproducible.
3. Use `depends_on: { <svc>: { condition: service_healthy } }` against
   `postgres` / `redis` when the tool only makes sense once the target is up.
4. Add a row to the *Services* and (if applicable) *Credentials* tables above.
5. Keep it opt-in — no dev tool should be required to run the app stack.
