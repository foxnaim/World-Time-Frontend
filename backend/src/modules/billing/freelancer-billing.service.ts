import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FreelancerSubscription, FreelancerTier } from '@prisma/client';

import { PrismaService } from '@/common/prisma.service';
import { FREELANCER_TIERS, FreelancerTierFeatures } from './tier-config';

/**
 * Freelancer-side billing.
 *
 * Freelancers pay flat per-account, not per seat — so this is a smaller
 * feature matrix than `BillingService` (no `checkSeatAvailable`, no
 * headcount gating). Mirrors the same auto-provision-on-first-read
 * pattern so new users don't see an empty billing page.
 */
@Injectable()
export class FreelancerBillingService {
  private readonly logger = new Logger(FreelancerBillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(userId: string): Promise<FreelancerSubscription | null> {
    return this.prisma.freelancerSubscription.findUnique({ where: { userId } });
  }

  getEffectiveLimits(tier: FreelancerTier): FreelancerTierFeatures {
    return FREELANCER_TIERS[tier];
  }

  /**
   * Ensure the caller has a row — create a FREE one if missing. Called
   * from the "read my subscription" endpoint so the UI never has to
   * special-case "no subscription yet".
   */
  async ensureDefault(userId: string): Promise<FreelancerSubscription> {
    const existing = await this.getSubscription(userId);
    if (existing) return existing;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return this.prisma.freelancerSubscription.create({
      data: {
        userId,
        tier: 'FREE',
        status: 'ACTIVE',
        projectLimit: FREELANCER_TIERS.FREE.projectLimit,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  /**
   * Switch the user to a different freelancer tier.
   *
   * Downgrade guard: if the user currently has more non-archived projects
   * than the new tier's `projectLimit`, refuse with a clear message so
   * they can clean up first. ARCHIVED projects don't count — they're
   * effectively historical.
   */
  async changeTier(
    userId: string,
    newTier: FreelancerTier,
  ): Promise<FreelancerSubscription> {
    if (!(newTier in FREELANCER_TIERS)) {
      throw new BadRequestException(`Unknown freelancer tier: ${newTier}`);
    }

    const limits = FREELANCER_TIERS[newTier];
    const activeProjects = await this.prisma.project.count({
      where: { userId, status: { not: 'ARCHIVED' } },
    });
    if (activeProjects > limits.projectLimit) {
      throw new BadRequestException(
        `Нельзя перейти на тариф ${newTier}: сейчас ${activeProjects} активных проектов, лимит ${limits.projectLimit}. Архивируйте лишние.`,
      );
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const result = await this.prisma.freelancerSubscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: newTier,
        status: 'ACTIVE',
        projectLimit: limits.projectLimit,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        tier: newTier,
        status: 'ACTIVE',
        projectLimit: limits.projectLimit,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    this.logger.log(`freelancer tier changed userId=${userId} -> ${newTier}`);
    return result;
  }
}
