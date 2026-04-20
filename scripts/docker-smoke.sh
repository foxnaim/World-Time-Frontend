#!/usr/bin/env bash
#
# docker-smoke.sh
# ---------------
# Smoke test for the Docker Compose stack: brings everything up with
# healthchecks, waits for Postgres and Redis to become healthy, pokes the
# backend and frontend HTTP endpoints (if they exist in the compose project)
# and tears the stack down on exit.
#
# Usage: bash scripts/docker-smoke.sh
# Exit:  0 on success, 1 otherwise.

set -euo pipefail

# ---- Colors -----------------------------------------------------------------
if [[ -t 1 ]]; then
    RED=$'\033[0;31m'
    GREEN=$'\033[0;32m'
    YELLOW=$'\033[0;33m'
    BLUE=$'\033[0;34m'
    BOLD=$'\033[1m'
    RESET=$'\033[0m'
else
    RED=""; GREEN=""; YELLOW=""; BLUE=""; BOLD=""; RESET=""
fi

log()   { printf '%s[smoke]%s %s\n' "$BLUE" "$RESET" "$*"; }
warn()  { printf '%s[warn]%s  %s\n' "$YELLOW" "$RESET" "$*" >&2; }
fail()  { printf '%s[FAIL]%s  %s\n' "$RED" "$RESET" "$*" >&2; }
ok()    { printf '%s[ok]%s    %s\n' "$GREEN" "$RESET" "$*"; }

pass_banner() {
    printf '\n%s%sPASS%s  docker smoke test succeeded\n' "$BOLD" "$GREEN" "$RESET"
}

fail_banner() {
    printf '\n%s%sFAIL%s  docker smoke test failed\n' "$BOLD" "$RED" "$RESET"
}

# ---- Preconditions ----------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
    fail "docker is not installed or not on PATH"
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    fail "'docker compose' is not available (need Docker Compose v2)"
    exit 1
fi

# Change into the repo root (one directory above this script) so compose files
# resolve consistently regardless of where the script is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

# ---- Cleanup trap -----------------------------------------------------------
SMOKE_STATUS=1
cleanup() {
    local exit_code=$?
    log "tearing down compose stack (preserving volumes)"
    docker compose down --remove-orphans >/dev/null 2>&1 || true

    if [[ "${SMOKE_STATUS}" -eq 0 && "${exit_code}" -eq 0 ]]; then
        pass_banner
        exit 0
    else
        fail_banner
        exit 1
    fi
}
trap cleanup EXIT

# ---- Bring the stack up -----------------------------------------------------
log "starting compose stack with healthchecks (docker compose up -d --wait)"
if ! docker compose up -d --wait; then
    fail "docker compose up --wait failed"
    dump_logs
    exit 1
fi

# ---- Helpers ----------------------------------------------------------------
service_exists() {
    # returns 0 if the named service is defined in the compose project
    docker compose config --services 2>/dev/null | grep -qx "$1"
}

container_id() {
    docker compose ps -q "$1" 2>/dev/null
}

container_health() {
    local cid
    cid="$(container_id "$1")"
    if [[ -z "${cid}" ]]; then
        echo "missing"
        return
    fi
    # Services without healthchecks report empty; treat running as healthy.
    local health status
    health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "${cid}" 2>/dev/null || true)"
    status="$(docker inspect -f '{{.State.Status}}' "${cid}" 2>/dev/null || true)"
    if [[ -n "${health}" ]]; then
        echo "${health}"
    else
        echo "${status}"
    fi
}

wait_for_health() {
    local svc="$1"
    local timeout="${2:-60}"
    local start now state
    start=$(date +%s)
    log "waiting up to ${timeout}s for '${svc}' to be healthy"
    while true; do
        state="$(container_health "${svc}")"
        case "${state}" in
            healthy|running)
                ok "${svc} is ${state}"
                return 0
                ;;
            missing)
                warn "${svc} has no container yet"
                ;;
            unhealthy)
                fail "${svc} is unhealthy"
                return 1
                ;;
        esac
        now=$(date +%s)
        if (( now - start >= timeout )); then
            fail "${svc} did not become healthy within ${timeout}s (last state: ${state})"
            return 1
        fi
        sleep 2
    done
}

dump_logs() {
    warn "collecting last 50 lines of logs for every service"
    local services
    services="$(docker compose ps --services 2>/dev/null || true)"
    if [[ -z "${services}" ]]; then
        return
    fi
    while IFS= read -r svc; do
        [[ -z "${svc}" ]] && continue
        printf '\n%s--- logs: %s ---%s\n' "$YELLOW" "${svc}" "$RESET"
        docker compose logs --tail=50 "${svc}" 2>&1 || true
    done <<< "${services}"
}

assert_http_200() {
    local label="$1"
    local url="$2"
    log "checking ${label} at ${url}"
    # -f fails on non-2xx, -s silent, -S show errors, -o discard body, -w write code
    local code
    if ! code="$(curl -fsS -o /dev/null -w '%{http_code}' "${url}")"; then
        fail "${label} request to ${url} failed"
        return 1
    fi
    if [[ "${code}" != "200" ]]; then
        fail "${label} returned HTTP ${code} (expected 200)"
        return 1
    fi
    ok "${label} returned HTTP 200"
}

# ---- Wait for core infra ----------------------------------------------------
if service_exists "postgres"; then
    wait_for_health "postgres" 60 || { dump_logs; exit 1; }
else
    warn "service 'postgres' not defined; skipping"
fi

if service_exists "redis"; then
    wait_for_health "redis" 60 || { dump_logs; exit 1; }
else
    warn "service 'redis' not defined; skipping"
fi

# ---- HTTP smoke checks ------------------------------------------------------
if service_exists "backend"; then
    if ! assert_http_200 "backend /api/health" "http://localhost:4000/api/health"; then
        dump_logs
        exit 1
    fi
else
    warn "service 'backend' not in compose project; skipping backend HTTP check"
fi

if service_exists "frontend"; then
    if ! assert_http_200 "frontend /" "http://localhost:3000/"; then
        dump_logs
        exit 1
    fi
else
    warn "service 'frontend' not in compose project; skipping frontend HTTP check"
fi

# ---- Success ----------------------------------------------------------------
SMOKE_STATUS=0
exit 0
