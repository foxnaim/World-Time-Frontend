import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FreelancerTier } from '@prisma/client';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { FreelancerBillingService } from './freelancer-billing.service';
import { FREELANCER_TIERS } from './tier-config';

/**
 * Freelancer billing — one row per user, flat monthly pricing.
 *
 * Mirrors the company billing controller but keyed off the authenticated
 * user id rather than a companyId path param. Project-limit gating lives
 * on the service so the tier-change endpoint reuses the same guard.
 */
@Controller('billing/freelancer')
@UseGuards(AuthGuard('jwt'))
export class FreelancerBillingController {
  constructor(private readonly billing: FreelancerBillingService) {}

  @Get('my')
  async mySubscription(@CurrentUser() user: { id: string }) {
    const subscription = await this.billing.ensureDefault(user.id);
    const limits = this.billing.getEffectiveLimits(subscription.tier);
    return {
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        projectLimit: subscription.projectLimit,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      limits,
    };
  }

  @Post('change-tier')
  @HttpCode(HttpStatus.OK)
  async changeTier(
    @Body() body: { tier?: FreelancerTier },
    @CurrentUser() user: { id: string },
  ) {
    if (!body?.tier || !(body.tier in FREELANCER_TIERS)) {
      throw new NotFoundException('Valid tier is required');
    }
    const subscription = await this.billing.changeTier(user.id, body.tier);
    return {
      ok: true,
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        projectLimit: subscription.projectLimit,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    };
  }
}
