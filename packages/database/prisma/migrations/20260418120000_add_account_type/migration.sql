-- Ensure the enum exists (idempotent for shadow DB + re-runs).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserAccountType') THEN
    CREATE TYPE "UserAccountType" AS ENUM ('FREELANCER', 'COMPANY');
  END IF;
END$$;

-- AlterTable: add accountType column.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountType" "UserAccountType";
