#!/usr/bin/env bash
#
# db-backup.sh — pg_dump the Work Tact database to ./backups/worktime_<ts>.sql.gz
#
# Reads DATABASE_URL (and anything else) from .env at the repo root if present.
# Exits non-zero if pg_dump fails or DATABASE_URL is missing.

set -euo pipefail

# Resolve repo root (script lives in scripts/).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

# Load .env if it exists. Use `set -a` so every variable is exported.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
else
  echo "warn: .env not found at ${REPO_ROOT}/.env — relying on existing environment" >&2
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "error: DATABASE_URL is not set (check .env or shell environment)" >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "error: pg_dump not found in PATH — install postgresql-client" >&2
  exit 1
fi

if ! command -v gzip >/dev/null 2>&1; then
  echo "error: gzip not found in PATH" >&2
  exit 1
fi

BACKUP_DIR="${REPO_ROOT}/backups"
mkdir -p "${BACKUP_DIR}"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="${BACKUP_DIR}/worktime_${TIMESTAMP}.sql.gz"

echo "==> dumping database to ${OUT_FILE}"
# --no-owner / --no-privileges keeps dumps portable between environments.
pg_dump --no-owner --no-privileges "${DATABASE_URL}" | gzip -9 > "${OUT_FILE}"

# Portable size logging (macOS `stat -f%z`, GNU `stat -c%s`).
if size_bytes=$(stat -f%z "${OUT_FILE}" 2>/dev/null); then
  :
else
  size_bytes=$(stat -c%s "${OUT_FILE}")
fi

# Human-readable size.
awk_human='BEGIN { s="B K M G T"; split(s,u," "); i=1; while (b>=1024 && i<5) { b/=1024; i++ }; printf "%.1f%s\n", b, u[i] }'
human=$(awk -v b="${size_bytes}" "${awk_human}")

echo "==> done: ${OUT_FILE} (${size_bytes} bytes, ~${human})"
