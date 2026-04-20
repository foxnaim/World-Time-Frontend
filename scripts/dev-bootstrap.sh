#!/usr/bin/env bash
#
# dev-bootstrap.sh — one-shot setup for a fresh clone of Work Tact.
#
# Checks tool versions, materializes .env, installs deps, starts docker compose,
# applies the Prisma schema, seeds, and prints the local URLs. Safe to re-run.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

MIN_NODE_MAJOR=22
MIN_PNPM_MAJOR=10

log()  { printf "\033[1;36m==>\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m!! \033[0m %s\n" "$*" >&2; }
die()  { printf "\033[1;31mxx \033[0m %s\n" "$*" >&2; exit 1; }

# --- version helpers ---------------------------------------------------------

major_of() {
  # Extract the leading integer from a version string: "v22.4.1" -> "22".
  printf '%s' "$1" | sed -E 's/^[^0-9]*([0-9]+).*/\1/'
}

require_cmd() {
  local name="$1"; shift
  command -v "${name}" >/dev/null 2>&1 || die "${name} is not installed. $*"
}

# --- 1. tool checks ----------------------------------------------------------

log "checking required tooling"

require_cmd node "Install Node.js >= ${MIN_NODE_MAJOR} (see .nvmrc)."
node_major="$(major_of "$(node --version)")"
if [ "${node_major}" -lt "${MIN_NODE_MAJOR}" ]; then
  die "Node ${node_major} found; need >= ${MIN_NODE_MAJOR}. Try: nvm use"
fi
log "  node $(node --version) ok"

require_cmd pnpm "Install pnpm >= ${MIN_PNPM_MAJOR} (e.g. 'corepack enable')."
pnpm_major="$(major_of "$(pnpm --version)")"
if [ "${pnpm_major}" -lt "${MIN_PNPM_MAJOR}" ]; then
  die "pnpm ${pnpm_major} found; need >= ${MIN_PNPM_MAJOR}."
fi
log "  pnpm $(pnpm --version) ok"

require_cmd docker "Install Docker Desktop / engine."
if ! docker compose version >/dev/null 2>&1; then
  die "'docker compose' subcommand not available. Upgrade Docker."
fi
log "  docker $(docker --version | awk '{print $3}' | tr -d ',') ok"

# --- 2. .env -----------------------------------------------------------------

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    log "created .env from .env.example (fill in secrets before running dev)"
  else
    warn ".env and .env.example both missing — you will need to create .env manually"
  fi
else
  log ".env already present — leaving untouched"
fi

# --- 3. install deps ---------------------------------------------------------

log "installing workspace dependencies (pnpm install)"
pnpm install

# --- 4. start infra ----------------------------------------------------------

log "starting docker compose services (Postgres, Redis, ...)"
docker compose up -d

# Give Postgres a moment to accept connections.
log "waiting for Postgres to become ready"
sleep 5

# --- 5. db schema + seed -----------------------------------------------------

log "applying Prisma schema (pnpm db:push)"
pnpm db:push

log "seeding database (pnpm db:seed)"
pnpm db:seed

# --- 6. done -----------------------------------------------------------------

cat <<'EOF'

=============================================================
  Work Tact is bootstrapped. Start the dev stack with:

      make dev           # turbo dev (API + web)
      make dev-backend   # API only
      make dev-frontend  # web only

  Local URLs once `make dev` is running:
      Web      http://localhost:3000
      API      http://localhost:4000
      Swagger  http://localhost:4000/docs
      Prisma   make db-studio   (http://localhost:5555)

  Run `make help` for every available target.
=============================================================
EOF
