import { SubscriptionTier, FreelancerTier } from '@prisma/client';

/**
 * Supported billing currencies. Tied to locales on the frontend
 * (see `lib/currency.ts`). Adding a new currency here means every tier's
 * `prices` map below MUST supply a value (or null for "contact sales").
 *
 * Rates are frozen at build time — we don't fetch live FX because the real
 * payment provider (YooKassa/Stripe) will localize the receipt anyway.
 */
export const CURRENCIES = ['RUB', 'USD', 'EUR', 'KZT'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KZT: '₸',
};

export interface TierFeatures {
  seatsLimit: number;
  monthlyReports: boolean;
  sheetsExport: boolean;
  customBranding: boolean;
  /**
   * Price per billing unit, per currency. `null` means "contact sales" —
   * the checkout flow should route to a contact form.
   *
   * For company tiers the unit is one seat per month.
   * For freelancer tiers the unit is the whole account per month.
   */
  prices: Record<Currency, number | null>;
}

export const TIERS: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    seatsLimit: 5,
    monthlyReports: true,
    sheetsExport: false,
    customBranding: false,
    prices: { RUB: 0, USD: 0, EUR: 0, KZT: 0 },
  },
  TEAM: {
    seatsLimit: 100,
    monthlyReports: true,
    sheetsExport: true,
    customBranding: false,
    prices: { RUB: 200, USD: 2, EUR: 2, KZT: 1000 },
  },
  ENTERPRISE: {
    seatsLimit: 10_000,
    monthlyReports: true,
    sheetsExport: true,
    customBranding: true,
    prices: { RUB: null, USD: null, EUR: null, KZT: null },
  },
};

export interface FreelancerTierFeatures {
  projectLimit: number;
  statsHistoryMonths: number;
  sheetsExport: boolean;
  prioritySupport: boolean;
  /** Flat price per account per month, per currency. */
  prices: Record<Currency, number | null>;
}

export const FREELANCER_TIERS: Record<FreelancerTier, FreelancerTierFeatures> = {
  FREE: {
    projectLimit: 3,
    statsHistoryMonths: 1,
    sheetsExport: false,
    prioritySupport: false,
    prices: { RUB: 0, USD: 0, EUR: 0, KZT: 0 },
  },
  SOLO: {
    projectLimit: 15,
    statsHistoryMonths: 6,
    sheetsExport: true,
    prioritySupport: false,
    prices: { RUB: 290, USD: 3, EUR: 3, KZT: 1500 },
  },
  PRO: {
    projectLimit: 999,
    statsHistoryMonths: 24,
    sheetsExport: true,
    prioritySupport: true,
    prices: { RUB: 790, USD: 9, EUR: 8, KZT: 4000 },
  },
};
