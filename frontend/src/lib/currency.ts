/**
 * Currency presets shared between company and freelancer billing pages.
 * Stays in sync with `backend/src/modules/billing/tier-config.ts` — the
 * backend is the source of truth for the actual numbers but the UI
 * config (labels, flags, locale detection) lives here because it's a
 * pure presentation concern.
 */

export const CURRENCIES = ['RUB', 'USD', 'EUR', 'KZT'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_META: Record<
  Currency,
  { label: string; symbol: string; flag: string }
> = {
  RUB: { label: 'RUB · рубли', symbol: '₽', flag: '🇷🇺' },
  USD: { label: 'USD · доллары', symbol: '$', flag: '🇺🇸' },
  EUR: { label: 'EUR · евро', symbol: '€', flag: '🇪🇺' },
  KZT: { label: 'KZT · тенге', symbol: '₸', flag: '🇰🇿' },
};

/**
 * Map a BCP-47 language tag or plain country code to a currency we
 * support. Falls back to USD for anything we don't recognise — safer
 * international default than RUB for users outside CIS.
 */
export function currencyFromLocale(locale?: string | null): Currency {
  if (!locale) return 'USD';
  const lower = locale.toLowerCase();
  const region = lower.split('-')[1] ?? lower; // "ru-ru" → "ru"; "kz" → "kz"

  if (['ru', 'by'].includes(region)) return 'RUB';
  if (['kz'].includes(region)) return 'KZT';
  if (
    ['de', 'fr', 'es', 'it', 'nl', 'pt', 'fi', 'at', 'be', 'ie', 'gr'].includes(
      region,
    )
  ) {
    return 'EUR';
  }
  return 'USD';
}

/**
 * Map an IANA timezone (what a company is asked to pick on creation) to a
 * currency we support. A timezone carries region hint cheaply — no extra
 * field in the schema required. Anything unknown falls back to USD so a
 * brand-new market shows a neutral currency, not an off-region one.
 */
export function currencyFromTimezone(tz?: string | null): Currency {
  if (!tz) return 'USD';
  // Russia + Belarus
  if (
    /^Europe\/(Moscow|Kaliningrad|Samara|Volgograd|Saratov|Kirov|Ulyanovsk|Astrakhan|Simferopol|Minsk)$/.test(
      tz,
    ) ||
    tz.startsWith('Asia/Anadyr') ||
    tz.startsWith('Asia/Barnaul') ||
    tz.startsWith('Asia/Chita') ||
    tz.startsWith('Asia/Irkutsk') ||
    tz.startsWith('Asia/Kamchatka') ||
    tz.startsWith('Asia/Khandyga') ||
    tz.startsWith('Asia/Krasnoyarsk') ||
    tz.startsWith('Asia/Magadan') ||
    tz.startsWith('Asia/Novokuznetsk') ||
    tz.startsWith('Asia/Novosibirsk') ||
    tz.startsWith('Asia/Omsk') ||
    tz.startsWith('Asia/Sakhalin') ||
    tz.startsWith('Asia/Srednekolymsk') ||
    tz.startsWith('Asia/Tomsk') ||
    tz.startsWith('Asia/Ust-Nera') ||
    tz.startsWith('Asia/Vladivostok') ||
    tz.startsWith('Asia/Yakutsk') ||
    tz.startsWith('Asia/Yekaterinburg')
  ) {
    return 'RUB';
  }
  // Kazakhstan
  if (/^Asia\/(Almaty|Aqtobe|Aqtau|Atyrau|Oral|Qostanai|Qyzylorda)$/.test(tz)) {
    return 'KZT';
  }
  // Eurozone — Europe/* minus Russia/Belarus, plus UK/CH/CZ (GBP/CHF not
  // supported, route to EUR as the closest supported proxy).
  if (tz.startsWith('Europe/')) return 'EUR';
  return 'USD';
}

/** Detect currency from the browser on first mount. Safe to call during SSR (returns fallback). */
export function detectBrowserCurrency(): Currency {
  if (typeof navigator === 'undefined') return 'USD';
  return currencyFromLocale(navigator.language);
}

