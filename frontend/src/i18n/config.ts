export const LOCALES = ['ru', 'en', 'kz'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeNames: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  kz: 'KZ',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export const locales = LOCALES;
export const defaultLocale = DEFAULT_LOCALE;
