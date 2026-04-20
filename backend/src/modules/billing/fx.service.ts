import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RedisService } from '@/common/redis/redis.service';

/**
 * Foreign-exchange rates vs RUB.
 *
 * Source: https://www.cbr-xml-daily.ru/latest.js (free, unauthenticated,
 * sourced from the Central Bank of Russia). Refreshed once a day via cron
 * plus on boot. Cached in Redis with a 25-hour TTL so a transient upstream
 * failure never leaves us without rates — the cron retries silently.
 *
 * Base currency: RUB. All tier prices in `tier-config.ts` are stored in
 * RUB and converted here on the way out, so there's a single source of
 * truth for pricing.
 */

export type RatesVsRub = Record<string, number>;

export interface RatesPayload {
  base: 'RUB';
  rates: RatesVsRub;
  updatedAt: string; // ISO
}

const CACHE_KEY = 'fx:rates:rub';
const CACHE_TTL_SEC = 25 * 60 * 60;

// Rough fallback so the app never shows "N/A" — updated roughly April 2026
// FX snapshot. Replaced on first successful upstream fetch.
const FALLBACK: RatesPayload = {
  base: 'RUB',
  rates: { USD: 0.011, EUR: 0.010, KZT: 5.1, RUB: 1 },
  updatedAt: new Date(0).toISOString(),
};

@Injectable()
export class FxService implements OnModuleInit {
  private readonly logger = new Logger(FxService.name);
  private memory: RatesPayload = FALLBACK;

  constructor(private readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {
    // Prefer Redis cache over an immediate upstream call at boot — many
    // instances booting at once shouldn't hammer cbr-xml-daily.
    const cached = await this.loadFromCache();
    if (cached) {
      this.memory = cached;
      this.logger.log(`FX: loaded from cache (updated ${cached.updatedAt})`);
      return;
    }
    await this.refreshFromUpstream();
  }

  /** Current rates (memory copy; refreshed by cron). Always returns something. */
  current(): RatesPayload {
    return this.memory;
  }

  /** Convert a RUB amount to the target currency using current rates. */
  convertFromRub(amountRub: number, target: string): number {
    if (target === 'RUB') return amountRub;
    const rate = this.memory.rates[target];
    if (typeof rate !== 'number' || rate <= 0) return amountRub;
    return amountRub * rate;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async refreshFromUpstream(): Promise<void> {
    try {
      const res = await fetch('https://www.cbr-xml-daily.ru/latest.js', {
        // 5s is plenty; the endpoint is <10KB.
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as {
        base?: string;
        rates?: Record<string, number>;
      };
      if (body.base !== 'RUB' || !body.rates) {
        throw new Error('Unexpected payload shape');
      }
      // Always include RUB=1 so callers can treat the map uniformly.
      const rates: RatesVsRub = { RUB: 1, ...body.rates };
      const payload: RatesPayload = {
        base: 'RUB',
        rates,
        updatedAt: new Date().toISOString(),
      };
      this.memory = payload;
      try {
        await this.redis.setEx(CACHE_KEY, JSON.stringify(payload), CACHE_TTL_SEC);
      } catch (cacheErr) {
        this.logger.warn(
          `FX: cache write failed: ${cacheErr instanceof Error ? cacheErr.message : String(cacheErr)}`,
        );
      }
      this.logger.log(
        `FX: refreshed USD=${rates.USD?.toFixed(4)} EUR=${rates.EUR?.toFixed(4)} KZT=${rates.KZT?.toFixed(4)}`,
      );
    } catch (err) {
      this.logger.warn(
        `FX: upstream refresh failed, keeping prior rates: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async loadFromCache(): Promise<RatesPayload | null> {
    try {
      const raw = await this.redis.get(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as RatesPayload;
      if (parsed.base !== 'RUB' || !parsed.rates) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}
