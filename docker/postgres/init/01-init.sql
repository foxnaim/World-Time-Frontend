-- ============================================================================
-- Tact initial extensions -- Prisma migrations handle the rest.
-- ----------------------------------------------------------------------------
-- This script runs ONCE, on first boot of the postgres container, when the
-- data directory (/var/lib/postgresql/data) is empty. To re-run it, destroy
-- the volume:  docker compose down -v && docker compose up -d
--
-- Everything below should be idempotent (IF NOT EXISTS) so if an operator
-- ever drops a fresh init file into a pre-populated volume (e.g. by running
-- `psql -f`), nothing explodes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- pg_trgm  -- trigram matching for fast ILIKE / fuzzy search on text columns
-- uuid-ossp -- uuid_generate_v4(), kept for legacy callers; prefer gen_random_uuid()
-- pgcrypto -- gen_random_uuid(), digest(), HMAC, bcrypt-compatible crypt()
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Read-only role
-- ---------------------------------------------------------------------------
-- Pattern used for BI tools, analytics, or a replica-style user that should
-- never mutate data. Login is intentionally DISABLED -- an operator enables
-- it (and sets a password) when the role is actually needed:
--
--   ALTER ROLE worktime_readonly WITH LOGIN PASSWORD '...';
--
-- GRANT ... ON ALL TABLES covers current objects; ALTER DEFAULT PRIVILEGES
-- covers tables that Prisma creates in the future.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'worktime_readonly') THEN
    CREATE ROLE worktime_readonly NOLOGIN;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE worktime TO worktime_readonly;
GRANT USAGE ON SCHEMA public TO worktime_readonly;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO worktime_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO worktime_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO worktime_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO worktime_readonly;
