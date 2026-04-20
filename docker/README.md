# `docker/` — Work Tact data-layer stack

Everything in this directory is mounted into the infrastructure containers
started by the root `docker-compose.yml`.

```
docker/
├── postgres/init/        # SQL files run once on first postgres boot
│   └── 01-init.sql       # extensions + read-only role
├── redis/
│   └── redis.conf        # dev-tuned: AOF + 256mb LRU cache
├── pgadmin/              # pre-wired server list for pgAdmin
│   └── servers.json
├── redisinsight/         # legacy RedisInsight connections (kept for reference)
│   └── connections.json
└── README.md             # you are here
```

Application images (backend / frontend / bot / migrator) are not covered
here — see the top-level [`DOCKER.md`](../DOCKER.md) and
[`docker-compose.prod.yml`](../docker-compose.prod.yml).

## Start the stack

```bash
docker compose up -d                      # postgres + redis
docker compose --profile tools up -d      # + pgAdmin + redis-commander
docker compose ps                         # show health
```

Both containers expose a `healthcheck`; `depends_on: condition: service_healthy`
gates the pgAdmin / app services until Postgres reports `pg_isready` and
Redis replies to `PING`.

## Connection info

| Service         | URL / DSN                                                | Notes                        |
| --------------- | -------------------------------------------------------- | ---------------------------- |
| Postgres        | `postgres://worktime:worktime@localhost:5432/worktime`   | defaults from `.env.example` |
| Redis           | `redis://localhost:6379`                                 | no password in dev           |
| pgAdmin         | <http://localhost:5050> — `admin@worktime.local` / `admin` | `--profile tools`            |
| redis-commander | <http://localhost:8081>                                  | `--profile tools`            |

Override via `.env` — see `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`PGADMIN_EMAIL`, `PGADMIN_PASSWORD`, `REDIS_PASSWORD`.

## Init scripts

`docker/postgres/init/*.sql` runs **once**, when the `pg_data` volume is
empty. It installs `pg_trgm`, `uuid-ossp`, and `pgcrypto`, and creates a
disabled `worktime_readonly` role with `SELECT` on current and future
tables. Prisma migrations handle the rest of the schema.

To re-run the init scripts (drops all data):

```bash
docker compose down -v     # removes named volumes
docker compose up -d       # fresh boot, scripts run again
```

## Persistence

- **Postgres**: `worktime_pg_data` named volume — survives `docker compose down`
  (without `-v`) and container recreation.
- **Redis**: `worktime_redis_data` named volume, AOF enabled (`appendfsync
  everysec`) + RDB snapshots at `900s/300s/60s`. Restarts replay the AOF.
- **pgAdmin**: `worktime_pgadmin_data` named volume for saved server/query
  state.

Inspect:

```bash
docker volume ls | grep worktime_
docker volume inspect worktime_pg_data
```

## Troubleshooting

- **Port already allocated (5432 / 6379 / 5050 / 8081)**: another Postgres,
  Redis, pgAdmin or redis-commander is already running.
  Find it with `lsof -nP -iTCP:5432 -sTCP:LISTEN`, stop it, or remap the
  host-side port in `docker-compose.override.yml`.
- **`psql: could not connect`**: check `docker compose ps` — Postgres may
  still be in the `start_period` window (10s). Watch with
  `docker compose logs -f postgres`.
- **Init scripts didn't run**: they only execute on an empty data directory.
  `docker compose down -v` wipes the volume so the next `up` re-runs them.
- **Redis evictions**: the 256 MB cap with `allkeys-lru` is expected — check
  `INFO memory` for `evicted_keys`.
- **pgAdmin can't reach Postgres**: it must use hostname `postgres` (the
  service name), not `localhost`. The pre-wired `docker/pgadmin/servers.json`
  uses the right host.

## Production

Do **not** use this stack as-is in production. `redis.conf` has
`protected-mode no` and no password; the Postgres defaults ship with a
trivial dev password. Use
[`docker-compose.prod.yml`](../docker-compose.prod.yml) instead, which pulls
credentials from secrets and layers on TLS/Nginx.
