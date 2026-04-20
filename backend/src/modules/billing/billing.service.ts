import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma, Subscription, SubscriptionTier } from '@prisma/client';

import { PrismaService } from '@/common/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { TIERS, TierFeatures } from './tier-config';

/**
 * Either the full PrismaService or a transaction client obtained via
 * `prisma.$transaction(async (tx) => ...)`. Accepted by seat-check helpers
 * so the caller can run count + create in one atomic step.
 */
type PrismaLike = PrismaService | Prisma.TransactionClient;

/**
 * BillingService
 *
 * Owns the Subscription row per Company and the read-side of the feature
 * matrix. Payment provider integration (Stripe / YooKassa) is deliberately
 * absent — the controller exposes stub endpoints and this service just
 * tracks the tier/status/seatsLimit locally. Swap the stubs for real
 * providers once commercial terms are signed.
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Fetches the subscription for a company, or null if none has been provisioned yet. */
  async getSubscription(companyId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { companyId } });
  }

  /** Returns the feature matrix for a given tier. */
  getEffectiveLimits(tier: SubscriptionTier): TierFeatures {
    return TIERS[tier];
  }

  /**
   * Throws ForbiddenException if the company is at or over its seat cap.
   * Called by SeatLimitGuard before allowing a new employee invite.
   *
   * Accepts an optional Prisma transaction client so the caller can count
   * seats in the same tx that creates the employee — use together with
   * {@link reserveSeatOrThrow} to close the TOCTOU window where two parallel
   * invites can both pass this check.
   */
  async checkSeatAvailable(companyId: string, client: PrismaLike = this.prisma): Promise<void> {
    const sub = await client.subscription.findUnique({ where: { companyId } });
    // If no subscription yet, fall back to FREE defaults rather than blocking
    // entirely — new companies may race the subscription provisioning step.
    const seatsLimit = sub?.seatsLimit ?? TIERS.FREE.seatsLimit;

    const current = await client.employee.count({
      where: { companyId, status: 'ACTIVE' },
    });

    if (current >= seatsLimit) {
      throw new ForbiddenException('Достигнут лимит сотрудников на текущем тарифе');
    }
  }

  /**
   * Atomically check the seat cap and create the employee in a single
   * transaction. Prevents the race where two parallel invite accepts both
   * see `count < seatsLimit` and then both write, pushing the company over
   * cap. The provided `create` callback receives the same transaction client
   * used for the count and MUST use it for the employee insert.
   *
   * Pass an existing tx to participate in a larger transaction; otherwise a
   * fresh one is opened here.
   */
  async reserveSeatOrThrow<T>(
    companyId: string,
    create: (tx: Prisma.TransactionClient) => Promise<T>,
    existingTx?: Prisma.TransactionClient,
  ): Promise<T> {
    const run = async (tx: Prisma.TransactionClient): Promise<T> => {
      await this.checkSeatAvailable(companyId, tx);
      return create(tx);
    };

    if (existingTx) return run(existingTx);
    return this.prisma.$transaction(run);
  }

  /**
   * Creates a default FREE-tier subscription for a freshly created company.
   *
   * TODO: invoke from CompanyService.create. Per module scope this agent
   * does not edit CompanyService — see billing/README.md for the integration
   * point.
   */
  async createDefaultFreeSubscription(companyId: string): Promise<Subscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return this.prisma.subscription.create({
      data: {
        companyId,
        tier: 'FREE',
        status: 'ACTIVE',
        seatsLimit: TIERS.FREE.seatsLimit,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  /**
   * Switch the company's subscription to a different tier.
   *
   * Demo-grade: no payment flow yet, we just flip the tier and renew the
   * period so the UI can exercise upgrade/downgrade end-to-end. Blocks
   * downgrades that would leave the company over the new seat cap — that's
   * a data-integrity rule, not a billing rule, and should stay even after
   * real checkout is wired in.
   */
  async changeTier(
    companyId: string,
    newTier: SubscriptionTier,
  ): Promise<Subscription> {
    if (!(newTier in TIERS)) {
      throw new BadRequestException(`Unknown tier: ${newTier}`);
    }

    const nextLimits = TIERS[newTier];
    // Snapshot the prior tier for the audit trail. Done here (not after the
    // upsert) because the upsert overwrites it.
    const priorSub = await this.prisma.subscription.findUnique({
      where: { companyId },
      select: { tier: true },
    });
    const currentSeats = await this.prisma.employee.count({
      where: { companyId, status: 'ACTIVE' },
    });
    if (currentSeats > nextLimits.seatsLimit) {
      throw new BadRequestException(
        `Нельзя перейти на тариф ${newTier}: сейчас ${currentSeats} сотрудников, лимит тарифа ${nextLimits.seatsLimit}. Сначала уменьшите состав.`,
      );
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Upsert: brand-new companies may reach this path before FREE has been
    // auto-provisioned — create the row on the fly rather than 404.
    const result = await this.prisma.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        tier: newTier,
        status: 'ACTIVE',
        seatsLimit: nextLimits.seatsLimit,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        tier: newTier,
        status: 'ACTIVE',
        seatsLimit: nextLimits.seatsLimit,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    this.logger.log(`tier changed company=${companyId} -> ${newTier}`);
    await this.audit.record({
      companyId,
      action: 'company.tier_changed',
      targetType: 'Subscription',
      targetId: result.id,
      metadata: { from: priorSub?.tier ?? null, to: newTier },
    });
    return result;
  }
}
