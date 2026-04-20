/**
 * Vanilla request-time i18n resolver.
 *
 * Previously this file wired up `next-intl`'s `getRequestConfig`. The
 * lightweight approach drops that dependency — use `getLocale()` and
 * `loadMessages()` directly from your Server Components.
 *
 * This module is kept as a thin compatibility layer so older call sites can
 * still `import { getRequestConfig } from '@/i18n/request'` and get back
 * `{ locale, messages }` for the current request.
 */

import { getLocale } from './get-locale';
import { loadMessages, type Messages } from './messages';
import { DEFAULT_LOCALE, LOCALES, defaultLocale, locales, type Locale } from './config';

export type RequestI18n = { locale: Locale; messages: Messages };

export async function getRequestI18n(): Promise<RequestI18n> {
  const locale = await getLocale();
  const messages = await loadMessages(locale);
  return { locale, messages };
}

// Back-compat name for older imports.
export const getRequestConfig = getRequestI18n;

export { LOCALES, DEFAULT_LOCALE, locales, defaultLocale };
