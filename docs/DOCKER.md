# Docker Guide

This document describes how the Work Tact monorepo is containerized, how to
build images for multiple CPU architectures, and how to run the stack in
both local development and production.

> There is also a shorter, top-level `DOCKER.md` at the repo root. The file
> you are reading is the long-form reference; prefer this one for anything
> beyond the happy path.

## 1. Overview

The repo ships three compose files, each with a narrow purpose:

| File                          | Purpose                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.yml`          | Base topology for local development (Postgres, Redis, API, Web).                                                     |
| `docker-compose.override.yml` | Auto-loaded by `docker compose`; applies developer-only overrides (bind mounts, `dev` target, debug ports).          |
| `docker-compose.prod.yml`     | Production topology: `runtime` targets, nginx reverse proxy, TLS termination, read-only filesystem, resource limits. |

Additional optional files:

- `docker-compose.observability.yml` — Prometheus / Grafana / Loki stack.
- `docker-compose.tools.yml` — one-off helpers (psql, redis-cli, prisma studio).

To run dev locally:

```bash
docker compose up --build
```

To run production locally (simulated):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 2. Dockerfile Stages

Both the backend and the frontend are multi-stage Dockerfiles. The stages
share a common pattern so they can be reasoned about together.

### Backend (`backend/Dockerfile`)

1. **base** — pinned `node:${NODE_VERSION}` + corepack-activated pnpm. Adds
   `libc6-compat` and `openssl` for Prisma engines.
2. **dev** — bakes in only workspace manifests and runs `pnpm install`. The
   source tree is bind-mounted by compose at `/repo`. `CMD` runs NestJS in
   watch mode.
3. **deps** — copies manifests + lockfile and runs `pnpm install --frozen-lockfile`
   with a `--mount=type=cache` store. This layer is cached across builds as
   long as the lockfile does not change.
4. **build** — copies sources, runs `prisma generate`, compiles NestJS to
   `backend/dist`, then prunes dev-dependencies with `pnpm install --prod`.
5. **runtime** — minimal Alpine image. Installs `curl` (for `HEALTHCHECK`),
   `tini` (for PID 1 signal handling), and `openssl` (for Prisma). Copies
   only the compiled artifacts + pruned `node_modules`. Runs as the
   non-root `node` user. `ENTRYPOINT ["/sbin/tini", "--", ...]`.

### Frontend (`frontend/Dockerfile`)

1. **base** — pinned `node:${NODE_VERSION}` + corepack-activated pnpm.
   `NEXT_TELEMETRY_DISABLED=1` is set globally.
2. **dev** — bakes in manifests, runs `pnpm install`, starts `next dev`.
3. **deps** — frozen-lockfile install with cache mount.
4. **build** — runs `pnpm --filter @worktime/web build`. Produces Next.js
   standalone output at `frontend/.next/standalone`. Requires
   `output: 'standalone'` in `frontend/next.config.ts`.
5. **runtime** — Alpine + `curl` + `tini`. Creates an explicit `nextjs`
   user with `uid 1001`, chowns the standalone tree, and runs
   `node frontend/server.js` under tini.

## 3. Build Context

The build context is **the monorepo root**, not the subfolder containing
the Dockerfile. This is mandatory because pnpm workspaces require
`pnpm-workspace.yaml`, the root `package.json`, `pnpm-lock.yaml`, and all
`packages/*/package.json` manifests to be visible during install.

```bash
# Correct — run from repo root with -f pointing at the Dockerfile.
docker build -f backend/Dockerfile -t worktime-backend:dev .

# Wrong — loses access to pnpm-workspace.yaml and the packages/* tree.
cd backend && docker build .
```

A `.dockerignore` at the repo root excludes `node_modules`, `.next`,
`dist`, `.git`, and local `.env*` files so they are not shipped into the
build context.

## 4. Multi-platform Builds with Buildx

Use `docker buildx` to emit images for both `linux/amd64` (Intel/AMD
servers, most CI runners) and `linux/arm64` (Apple Silicon, Graviton,
Ampere) from a single invocation.

```bash
# One-time: create a builder that supports multi-arch.
docker buildx create --name worktime --use
docker buildx inspect --bootstrap
```

### Backend

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg GIT_COMMIT=$(git rev-parse HEAD) \
  -f backend/Dockerfile \
  -t foxnaim/worktime-backend:latest \
  --push .
```

### Frontend

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg GIT_COMMIT=$(git rev-parse HEAD) \
  -f frontend/Dockerfile \
  -t foxnaim/worktime-frontend:latest \
  --push .
```

Multi-arch builds require `--push` (or `--output=type=oci,...`); they
cannot be loaded into the local Docker daemon because the daemon only
holds images for a single platform at a time.

### Local single-platform build

When you only care about your workstation's architecture:

```bash
docker build -f backend/Dockerfile  -t worktime-backend:dev  .
docker build -f frontend/Dockerfile -t worktime-frontend:dev .
```

## 5. Image Size Optimizations

- **Multi-stage** — the `deps` and `build` stages are discarded; only the
  `runtime` stage layers end up in the final image. Typical final image
  size: backend ~180 MB, frontend ~140 MB (both Alpine-based).
- **`pnpm install --prod --ignore-scripts`** in the build stage prunes
  dev-dependencies before anything is copied into `runtime`.
- **BuildKit cache mounts** — `RUN --mount=type=cache,id=pnpm-store,...`
  preserves the pnpm content-addressed store between builds, so repeat
  builds on the same host skip the network-heavy install step.
- **Next.js `output: 'standalone'`** ships only the minimal subset of
  `node_modules` actually traced by the compiler.
- **`alpine` base** — smaller than `slim`, but requires `libc6-compat` for
  glibc-linked native modules.

## 6. Publishing Images

### Docker Hub

```bash
docker login
docker buildx build --platform linux/amd64,linux/arm64 \
  -f backend/Dockerfile -t foxnaim/worktime-backend:latest --push .
```

### GitHub Container Registry (GHCR)

```bash
echo "$GHCR_PAT" | docker login ghcr.io -u foxnaim --password-stdin

docker tag foxnaim/worktime-backend:latest \
  ghcr.io/foxnaim/worktime-backend:latest
docker push ghcr.io/foxnaim/worktime-backend:latest
```

Or push directly with buildx:

```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -f backend/Dockerfile \
  -t ghcr.io/foxnaim/worktime-backend:$(git rev-parse --short HEAD) \
  -t ghcr.io/foxnaim/worktime-backend:latest \
  --push .
```

## 7. Running in Production

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d
```

The prod compose file:

- Uses the pre-built `runtime` stage for every service.
- Mounts `nginx/` as the reverse proxy on `:80` / `:443`.
- Sets `read_only: true` on service filesystems with a writable
  `/tmp` `tmpfs` mount.
- Enforces `restart: unless-stopped`.
- Applies resource limits (see section 10).

## 8. Env Injection Strategies

Several tiers, in increasing order of operational strictness:

1. **`.env` + `env_file:`** — fine for local dev. Never for prod.
2. **Docker secrets** (`docker stack deploy`) — secrets are exposed as
   files under `/run/secrets/<name>`. The entrypoint scripts load
   `*_FILE` env vars and inline them into the process environment.
   Example:
   ```yaml
   secrets:
     jwt_access_secret:
       external: true
   services:
     api:
       secrets: [jwt_access_secret]
       environment:
         JWT_ACCESS_SECRET_FILE: /run/secrets/jwt_access_secret
   ```
3. **Kubernetes `ConfigMap` + `Secret`** — non-sensitive config goes into
   a `ConfigMap`, sensitive values into a `Secret`. Both are mounted as
   env vars on the pod:
   ```yaml
   envFrom:
     - configMapRef: { name: worktime-backend-config }
     - secretRef: { name: worktime-backend-secrets }
   ```
4. **Bind-mounted `.env`** — for single-host deployments where secret
   management is owned by the host (e.g. `chmod 600` + systemd
   `EnvironmentFile=`). The container bind-mounts the file read-only:
   ```yaml
   volumes:
     - /etc/worktime/backend.env:/repo/.env:ro
   ```

## 9. Signal Handling via tini

Node's default PID-1 behavior does not reap zombie child processes and
can mishandle `SIGTERM`, causing `docker stop` to wait the full 10-second
grace period before a `SIGKILL`. Both images launch the app under
[`tini`](https://github.com/krallin/tini):

```dockerfile
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "backend/dist/main.js"]
```

`tini` installs proper signal handlers, forwards `SIGTERM`/`SIGINT` to
the child process, and reaps orphans. Combined with NestJS's
`enableShutdownHooks()` + Next.js's built-in graceful shutdown, this
gives fast, clean container stops (typically < 2 s).

## 10. Zero-downtime & Resource Limits

### Blue/green with nginx upstream switching

`nginx/nginx.conf` declares two upstreams per service:

```nginx
upstream api_blue  { server api_blue:4000;  }
upstream api_green { server api_green:4000; }
upstream api_active { server api_blue:4000; }   # rewritten at cutover
```

A deploy flow:

1. `docker compose up -d api_green` with the new image tag.
2. Wait for `GET /api/healthz/ready` to return `200` on `api_green`.
3. Rewrite `api_active` to `api_green` and `nginx -s reload`.
4. `docker compose stop api_blue` once in-flight requests drain.

Because nginx reload is graceful, existing connections keep talking to
the old upstream until they close naturally.

### Resource limits (compose v3 deploy or v2 top-level)

```yaml
services:
  api:
    image: ghcr.io/foxnaim/worktime-backend:latest
    cpus: '1.0'
    mem_limit: 512m
    mem_reservation: 256m
    pids_limit: 256
    ulimits:
      nofile:
        soft: 8192
        hard: 16384
```

Under Swarm / Kubernetes, the equivalent is `resources.limits.cpu` /
`resources.limits.memory` plus `resources.requests.*` for scheduler hints.

## 11. Troubleshooting

### `pnpm install failed: ERR_PNPM_OUTDATED_LOCKFILE`

The lockfile does not match the manifests. Causes:

- A manifest was edited without running `pnpm install` locally.
- The lockfile was committed from a different pnpm major version.

Fixes:

- Rebuild after running `pnpm install` on the host and committing the
  updated `pnpm-lock.yaml`.
- Temporarily build without `--frozen-lockfile` (the `deps` stage already
  falls back when the lockfile is missing; to force the mutable path,
  delete `pnpm-lock.yaml` from the build context).

### `Cannot find module '@worktime/database'` at runtime

The runtime stage is missing a workspace symlink. Verify that:

- `pnpm-workspace.yaml` is copied into the runtime stage.
- The pruned `node_modules` at the repo root still contains the symlink
  `.pnpm/@worktime+database@...` and the top-level
  `node_modules/@worktime/database` link.
- The package's `src/` directory (not just `dist/`) is present when the
  package uses TypeScript sources at runtime.

If you ship a compiled package, ensure the consuming `package.json`
points `"main"` / `"exports"` at the compiled output — otherwise Node's
resolver looks for sources that aren't in the image.

### `Prisma: binaryTargets mismatch` in runtime

Prisma ships platform-specific query engines. A mismatch means the
generator produced binaries for the build host but the runtime is a
different OS/libc. Fix by declaring every target explicitly in
`packages/database/prisma/schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

For multi-arch images, also add `linux-musl-arm64-openssl-3.0.x` and
`linux-arm64-openssl-3.0.x` so arm64 hosts find a matching engine.
Rebuild the image after changing the schema.

### Healthcheck keeps flipping `unhealthy`

- `curl` missing from the runtime stage — should be installed by
  `apk add --no-cache curl`.
- The app binds to `127.0.0.1` instead of `0.0.0.0`. Inside a container,
  `HEALTHCHECK` runs against `localhost` which resolves to `127.0.0.1`,
  but your service must still be listening on all interfaces for
  cross-container traffic. Set `HOSTNAME=0.0.0.0` (Next.js) / bind to
  `0.0.0.0` (NestJS) and keep the healthcheck pointed at `localhost`.
- `start-period` too short — increase it if the app performs Prisma
  migrations on boot.

## 12. Build Arguments Reference

| Arg            | Default     | Purpose                                                                                    |
| -------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `NODE_VERSION` | `22-alpine` | Base Node image tag. Override to test older/newer runtimes.                                |
| `PNPM_VERSION` | `10.33.0`   | pnpm version activated via corepack. Must match `"packageManager"` in root `package.json`. |
| `GIT_COMMIT`   | `unknown`   | Written to `org.opencontainers.image.revision` LABEL for traceability.                     |

Example overriding both:

```bash
docker build \
  --build-arg NODE_VERSION=20-alpine \
  --build-arg PNPM_VERSION=9.15.0 \
  --build-arg GIT_COMMIT=$(git rev-parse HEAD) \
  -f backend/Dockerfile -t worktime-backend:node20 .
```
