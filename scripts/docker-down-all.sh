#!/usr/bin/env bash
#
# docker-down-all.sh
# ------------------
# Tear down every known docker compose stack in this repository:
#   * base          -> docker-compose.yml
#   * override      -> docker-compose.override.yml
#   * prod          -> docker-compose.prod.yml
#   * observability -> docker-compose.observability.yml
#   * tools         -> docker-compose.tools.yml
#
# Usage:
#   scripts/docker-down-all.sh          # lists stacks and prompts before removing
#   scripts/docker-down-all.sh --yes    # skip the confirmation prompt
#
# Volumes are NOT removed (no -v flag) so databases survive. Add it manually
# if you really want a clean slate.

set -eu

# ---- Colors -----------------------------------------------------------------
if [ -t 1 ]; then
    RED=$'\033[0;31m'
    GREEN=$'\033[0;32m'
    YELLOW=$'\033[0;33m'
    BLUE=$'\033[0;34m'
    BOLD=$'\033[1m'
    RESET=$'\033[0m'
else
    RED=""; GREEN=""; YELLOW=""; BLUE=""; BOLD=""; RESET=""
fi

log()  { printf '%s[down-all]%s %s\n' "$BLUE" "$RESET" "$*"; }
warn() { printf '%s[warn]%s     %s\n' "$YELLOW" "$RESET" "$*" >&2; }
ok()   { printf '%s[ok]%s       %s\n' "$GREEN" "$RESET" "$*"; }
err()  { printf '%s[err]%s      %s\n' "$RED" "$RESET" "$*" >&2; }

# ---- Args -------------------------------------------------------------------
ASSUME_YES=0
for arg in "$@"; do
    case "$arg" in
        -y|--yes)
            ASSUME_YES=1
            ;;
        -h|--help)
            printf 'Usage: %s [--yes]\n' "$0"
            exit 0
            ;;
        *)
            err "unknown argument: ${arg}"
            exit 2
            ;;
    esac
done

# ---- Preconditions ----------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
    err "docker is not installed or not on PATH"
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    err "'docker compose' is not available (need Docker Compose v2)"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

# ---- Known stacks -----------------------------------------------------------
# Parallel arrays: label | compose file
STACK_LABELS="base override prod observability tools"
stack_file() {
    case "$1" in
        base)          echo "docker-compose.yml" ;;
        override)      echo "docker-compose.override.yml" ;;
        prod)          echo "docker-compose.prod.yml" ;;
        observability) echo "docker-compose.observability.yml" ;;
        tools)         echo "docker-compose.tools.yml" ;;
        *)             echo "" ;;
    esac
}

# ---- List stacks ------------------------------------------------------------
log "${BOLD}Known compose stacks in ${REPO_ROOT}:${RESET}"
PRESENT_STACKS=""
for label in $STACK_LABELS; do
    f="$(stack_file "$label")"
    if [ -f "${REPO_ROOT}/${f}" ]; then
        printf '  %s[present]%s %-14s -> %s\n' "$GREEN" "$RESET" "$label" "$f"
        PRESENT_STACKS="${PRESENT_STACKS} ${label}"
    else
        printf '  %s[missing]%s %-14s -> %s\n' "$YELLOW" "$RESET" "$label" "$f"
    fi
done

if [ -z "$(printf '%s' "${PRESENT_STACKS}" | tr -d ' ')" ]; then
    warn "no compose files found; nothing to do"
    exit 0
fi

# ---- Confirm ----------------------------------------------------------------
if [ "${ASSUME_YES}" -ne 1 ]; then
    printf '\n%sAbout to run "docker compose down" on every present stack above.%s\n' "$BOLD" "$RESET"
    printf 'Volumes will be kept. Continue? [y/N] '
    read -r REPLY || REPLY=""
    case "${REPLY}" in
        y|Y|yes|YES) ;;
        *)
            warn "aborted by user"
            exit 1
            ;;
    esac
fi

# ---- Tear down --------------------------------------------------------------
FAILED=""
for label in ${PRESENT_STACKS}; do
    f="$(stack_file "$label")"
    log "docker compose -f ${f} down --remove-orphans"
    if docker compose -f "${f}" down --remove-orphans; then
        ok "${label} stack down"
    else
        err "${label} stack failed to come down"
        FAILED="${FAILED} ${label}"
    fi
done

if [ -n "$(printf '%s' "${FAILED}" | tr -d ' ')" ]; then
    err "one or more stacks failed to come down:${FAILED}"
    exit 1
fi

ok "all present stacks are down (volumes preserved)"
