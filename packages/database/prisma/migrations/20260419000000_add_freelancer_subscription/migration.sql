-- CreateEnum
CREATE TYPE "FreelancerTier" AS ENUM ('FREE', 'SOLO', 'PRO');

-- CreateTable
CREATE TABLE "FreelancerSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "FreelancerTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "projectLimit" INTEGER NOT NULL DEFAULT 3,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerSubscription_userId_key" ON "FreelancerSubscription"("userId");

-- AddForeignKey
ALTER TABLE "FreelancerSubscription" ADD CONSTRAINT "FreelancerSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
