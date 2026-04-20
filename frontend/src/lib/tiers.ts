/**
 * Tier preset metadata (name, features, base price in RUB). Actual pricing
 * in other currencies is derived at render time by multiplying `basePriceRub`
 * by live FX rates from `/api/billing/fx` — see `lib/fx.ts`.
 *
 * Keep this file in sync with `backend/src/modules/billing/tier-config.ts`
 * for limits. Prices here are presentation-only; the backend still guards
 * all mutations against its own config.
 */

export type CompanyTierKey = 'FREE' | 'TEAM' | 'ENTERPRISE';
export type FreelancerTierKey = 'FREE' | 'SOLO' | 'PRO';

export interface TierCard<K extends string> {
  key: K;
  name: string;
  tagline: string;
  unitHint: string;
  capLine: string;
  features: string[];
  /** Price in RUB per billing unit/month. `null` => "contact sales". */
  basePriceRub: number | null;
  contactOnly?: boolean;
}

export const COMPANY_TIERS: Record<CompanyTierKey, TierCard<CompanyTierKey>> = {
  FREE: {
    key: 'FREE',
    name: 'Free',
    tagline: 'для знакомства с сервисом',
    unitHint: 'за сотрудника в месяц',
    capLine: 'до 5 сотрудников',
    features: ['QR-отметки', 'Базовые отчёты', 'Telegram-бот'],
    basePriceRub: 0,
  },
  TEAM: {
    key: 'TEAM',
    name: 'Team',
    tagline: 'для растущих компаний',
    unitHint: 'за сотрудника в месяц',
    capLine: 'до 100 сотрудников',
    features: [
      'Всё из Free',
      'Экспорт в Google Sheets',
      'Ежемесячные отчёты на почту',
    ],
    basePriceRub: 200,
  },
  ENTERPRISE: {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'индивидуальные условия',
    unitHint: 'обсуждается отдельно',
    capLine: 'от 100 сотрудников',
    features: [
      'Всё из Team',
      'Кастомный брендинг',
      'SLA и выделенная поддержка',
    ],
    basePriceRub: null,
    contactOnly: true,
  },
};

export const FREELANCER_TIERS: Record<
  FreelancerTierKey,
  TierCard<FreelancerTierKey>
> = {
  FREE: {
    key: 'FREE',
    name: 'Free',
    tagline: 'первые шаги',
    unitHint: 'в месяц',
    capLine: 'до 3 проектов',
    features: [
      'Таймер и ручные записи',
      'История за 1 месяц',
      'Telegram-бот',
    ],
    basePriceRub: 0,
  },
  SOLO: {
    key: 'SOLO',
    name: 'Solo',
    tagline: 'для постоянной практики',
    unitHint: 'в месяц',
    capLine: 'до 15 проектов',
    features: [
      'Всё из Free',
      'История за 6 месяцев',
      'Экспорт в Google Sheets',
    ],
    basePriceRub: 290,
  },
  PRO: {
    key: 'PRO',
    name: 'Pro',
    tagline: 'для команды из нескольких фрилансеров',
    unitHint: 'в месяц',
    capLine: 'без лимита проектов',
    features: [
      'Всё из Solo',
      'История за 2 года',
      'Приоритетная поддержка',
    ],
    basePriceRub: 790,
  },
};
