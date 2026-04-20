# syntax=docker/dockerfile:1.7
# Production Dockerfile for @tact/web (Next.js 15, app router)
#
# This image relies on Next.js standalone output. `frontend/next.config.ts`
# must have `output: 'standalone'` enabled — without it, `.next/standalone`
# and `server.js` will NOT be produced and the runtime stage copies will fail.
#
# Build context: repository root (so the pnpm workspace is reachable):
#   docker build -f frontend/Dockerfile -t worktime-web .
#
# Multi-platform build example (amd64 + arm64):
#   docker buildx build --platform linux/amd64,linux/arm64 \
#       -f frontend/Dockerfile -t foxnaim/worktime-frontend:latest --push .

# Consumers may override these at build time.
ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.33.0

############################
# Stage 1: base
############################
FROM node:${NODE_VERSION} AS base

ARG PNPM_VERSION

# Alpine needs libc6-compat for some Node native modules.
RUN apk add --no-cache libc6-compat

# Pin pnpm via corepack.
RUN corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /repo

ENV NEXT_TELEMETRY_DISABLED=1

############################
# Stage 1b: dev
#
# Hot-reload development image for Next.js. Source is expected to be
# bind-mounted at /repo so fast-refresh picks up host edits. Only workspace
# manifests are baked in here to keep the install layer cacheable across
# source-only changes.
############################
FROM base AS dev

COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY frontend/package.json           ./frontend/package.json
COPY packages/config/package.json    ./packages/config/package.json
COPY packages/database/package.json  ./packages/database/package.json
COPY packages/types/package.json     ./packages/types/package.json
COPY packages/ui/package.json        ./packages/ui/package.json

# Non-frozen install tolerates manifest drift and pre-lockfile bootstrapping.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install

ENV NODE_ENV=development

EXPOSE 3000

CMD ["pnpm","--filter","@tact/web","dev"]

############################
# Stage 2: deps
############################
FROM base AS deps

# Copy workspace metadata and package manifests for a deterministic install.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

############################
# Stage 3: build
############################
FROM base AS build

# Disable Next.js telemetry during the build layer as well so the network
# probe does not slow or fail builds in sandboxed CI runners.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Bring in installed workspace node_modules trees from deps.
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/frontend/node_modules ./frontend/node_modules
COPY --from=deps /repo/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /repo/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /repo/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /repo/packages/database/node_modules ./packages/database/node_modules

# Copy sources for frontend and workspace packages.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY frontend ./frontend
COPY packages ./packages

# Next.js standalone output is emitted to frontend/.next/standalone.
RUN pnpm --filter @tact/web build

############################
# Stage 4: runtime
############################
FROM node:${NODE_VERSION} AS runtime

ARG GIT_COMMIT=unknown

# OCI image metadata — populated at build time via --build-arg GIT_COMMIT=$(git rev-parse HEAD).
LABEL org.opencontainers.image.title="Tact Frontend" \
      org.opencontainers.image.description="Tact — Next.js editorial UI" \
      org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/foxnaim/World-Time-front-End" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# curl for HEALTHCHECK; tini for PID 1 signal handling.
RUN apk add --no-cache curl tini libc6-compat

# Unprivileged user for the Node process (explicit uid/gid 1001 for parity
# with k8s pod securityContext.runAsUser/fsGroup manifests).
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nextjs

# Next.js standalone bundle (ships its own minimal node_modules + server.js).
# Because we build inside a pnpm workspace, Next emits the tree rooted at
# `frontend/` — preserve that layout so server.js lives at ./frontend/server.js.
COPY --from=build --chown=nextjs:nodejs /repo/frontend/.next/standalone/ ./
COPY --from=build --chown=nextjs:nodejs /repo/frontend/.next/static ./frontend/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/frontend/public ./frontend/public

# Belt-and-braces: ensure the standalone tree is owned by nextjs even if the
# pnpm workspace emitted nested symlinks with different ownership.
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "frontend/server.js"]
