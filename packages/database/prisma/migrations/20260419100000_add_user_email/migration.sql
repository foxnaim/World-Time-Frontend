-- AlterTable: add optional email column on User (idempotent).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;
