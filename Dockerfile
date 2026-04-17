# syntax=docker/dockerfile:1.7
# Production Dockerfile for @worktime/web (Next.js 15, app router)
#
# This image relies on Next.js standalone output. `frontend/next.config.ts`
# must have `output: 'standalone'` enabled — without it, `.next/standalone`
# and `server.js` will NOT be produced and the runtime stage copies will fail.
#
# Build context: repository root (so the pnpm workspace is reachable):
#   docker build -f frontend/Dockerfile -t worktime-web .

############################
# Stage 1: base
############################
FROM node:22-alpine AS base

# Alpine needs libc6-compat for some Node native modules
RUN apk add --no-cache libc6-compat

# Pin pnpm via corepack
RUN corepack enable \
 && corepack prepare pnpm@10.33.0 --activate

WORKDIR /repo

ENV NEXT_TELEMETRY_DISABLED=1

############################
# Stage 2: deps
############################
FROM base AS deps

# Copy workspace metadata and package manifests for a deterministic install
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

ENV NODE_ENV=production

# Bring in installed workspace node_modules trees from deps
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/frontend/node_modules ./frontend/node_modules
COPY --from=deps /repo/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /repo/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /repo/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /repo/packages/database/node_modules ./packages/database/node_modules

# Copy sources for frontend and workspace packages
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY frontend ./frontend
COPY packages ./packages

# Next.js standalone output is emitted to frontend/.next/standalone
RUN pnpm --filter @worktime/web build

############################
# Stage 4: runtime
############################
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Unprivileged user for the Node process
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Next.js standalone bundle (ships its own minimal node_modules + server.js).
# Because we build inside a pnpm workspace, Next emits the tree rooted at
# `frontend/` — preserve that layout so server.js lives at ./frontend/server.js.
COPY --from=build --chown=nextjs:nodejs /repo/frontend/.next/standalone/ ./
COPY --from=build --chown=nextjs:nodejs /repo/frontend/.next/static ./frontend/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/frontend/public ./frontend/public

USER nextjs

EXPOSE 3000

CMD ["node", "frontend/server.js"]
