/**
 * i18n configuration — single source of truth for supported locales.
 *
 * Lightweight / cookie-based approach: the active locale is stored in the
 * `NEXT_LOCALE` cookie. There is no URL prefix (`/[locale]/...`) for the MVP —
 * see `README.md` in this directory.
 */

export const LOCALES = ['ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Human-readable short labels for the switcher UI. */
export const localeNames: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

// --- Backwards-compatible aliases ----------------------------------------
// Older modules imported `locales` / `defaultLocale` (lowercase). Keep them
// exported so we don't have to touch every call site in this agent's scope.
export const locales = LOCALES;
export const defaultLocale = DEFAULT_LOCALE;
