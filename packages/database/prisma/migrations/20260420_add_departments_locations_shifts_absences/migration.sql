-- Run: pnpm db:migrate or prisma migrate dev

-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('VACATION', 'SICK_LEAVE', 'DAY_OFF', 'BUSINESS_TRIP');

-- CreateTable: Department
CREATE TABLE "Department" (
    "id"        TEXT         NOT NULL,
    "companyId" TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Department_companyId_idx" ON "Department"("companyId");

-- AddForeignKey
ALTER TABLE "Department"
    ADD CONSTRAINT "Department_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Location
CREATE TABLE "Location" (
    "id"              TEXT         NOT NULL,
    "companyId"       TEXT         NOT NULL,
    "name"            TEXT         NOT NULL,
    "address"         TEXT,
    "latitude"        DOUBLE PRECISION NOT NULL,
    "longitude"       DOUBLE PRECISION NOT NULL,
    "geofenceRadiusM" INTEGER      NOT NULL DEFAULT 150,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_companyId_idx" ON "Location"("companyId");

-- AddForeignKey
ALTER TABLE "Location"
    ADD CONSTRAINT "Location_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Shift
CREATE TABLE "Shift" (
    "id"        TEXT         NOT NULL,
    "companyId" TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "startHour" INTEGER      NOT NULL,
    "endHour"   INTEGER      NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Shift_companyId_idx" ON "Shift"("companyId");

-- AddForeignKey
ALTER TABLE "Shift"
    ADD CONSTRAINT "Shift_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Absence
CREATE TABLE "Absence" (
    "id"           TEXT         NOT NULL,
    "employeeId"   TEXT         NOT NULL,
    "type"         "AbsenceType" NOT NULL,
    "startDate"    TIMESTAMP(3) NOT NULL,
    "endDate"      TIMESTAMP(3) NOT NULL,
    "note"         TEXT,
    "approvedById" TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Absence_employeeId_idx" ON "Absence"("employeeId");

-- CreateIndex
CREATE INDEX "Absence_employeeId_startDate_idx" ON "Absence"("employeeId", "startDate");

-- AddForeignKey
ALTER TABLE "Absence"
    ADD CONSTRAINT "Absence_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Employee — add departmentId and shiftId columns
ALTER TABLE "Employee"
    ADD COLUMN "departmentId" TEXT,
    ADD COLUMN "shiftId"      TEXT;

-- AddForeignKey: Employee -> Department
ALTER TABLE "Employee"
    ADD CONSTRAINT "Employee_departmentId_fkey"
    FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Employee -> Shift
ALTER TABLE "Employee"
    ADD CONSTRAINT "Employee_shiftId_fkey"
    FOREIGN KEY ("shiftId") REFERENCES "Shift"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
