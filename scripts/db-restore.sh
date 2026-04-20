#!/usr/bin/env bash
#
# db-restore.sh — restore a gzipped pg_dump into the Work Tact database.
#
# Usage:
#   scripts/db-restore.sh <file.sql.gz>          # prompts before clobbering
#   scripts/db-restore.sh --yes <file.sql.gz>    # skip the prompt
#   scripts/db-restore.sh <file.sql.gz> --yes    # same, flag position-free
#
# Reads DATABASE_URL from .env at the repo root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

ASSUME_YES=0
FILE=""

for arg in "$@"; do
  case "${arg}" in
    --yes|-y)
      ASSUME_YES=1
      ;;
    -h|--help)
      sed -n '3,11p' "$0"
      exit 0
      ;;
    -*)
      echo "error: unknown flag ${arg}" >&2
      exit 2
      ;;
    *)
      if [ -z "${FILE}" ]; then
        FILE="${arg}"
      else
        echo "error: multiple file arguments given" >&2
        exit 2
      fi
      ;;
  esac
done

if [ -z "${FILE}" ]; then
  echo "usage: $0 [--yes] <backup.sql.gz>" >&2
  exit 2
fi

if [ ! -f "${FILE}" ]; then
  echo "error: backup file not found: ${FILE}" >&2
  exit 1
fi

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "error: DATABASE_URL is not set (check .env)" >&2
  exit 1
fi

for bin in psql gunzip; do
  if ! command -v "${bin}" >/dev/null 2>&1; then
    echo "error: ${bin} not found in PATH" >&2
    exit 1
  fi
done

echo "==> target DATABASE_URL: ${DATABASE_URL}"
echo "==> restoring from:      ${FILE}"
echo "    This will OVERWRITE existing data in the target database."

if [ "${ASSUME_YES}" -ne 1 ]; then
  # Read from the controlling tty so this still prompts when piped.
  if [ -t 0 ]; then
    printf "Proceed? [y/N] "
    read -r reply
  elif [ -r /dev/tty ]; then
    printf "Proceed? [y/N] " > /dev/tty
    read -r reply < /dev/tty
  else
    echo "error: no TTY available; re-run with --yes to confirm" >&2
    exit 1
  fi
  case "${reply}" in
    y|Y|yes|YES) ;;
    *) echo "aborted."; exit 1 ;;
  esac
fi

echo "==> restoring..."
gunzip -c "${FILE}" | psql "${DATABASE_URL}"
echo "==> restore complete"
