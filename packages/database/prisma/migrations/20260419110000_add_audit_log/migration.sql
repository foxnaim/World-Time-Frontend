-- CreateTable: append-only audit log. Nullable FK-ish columns are plain TEXT
-- so we don't cascade-delete audit rows when actors/companies disappear.
CREATE TABLE "AuditEntry" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditEntry_companyId_createdAt_idx" ON "AuditEntry"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_actorUserId_createdAt_idx" ON "AuditEntry"("actorUserId", "createdAt");
