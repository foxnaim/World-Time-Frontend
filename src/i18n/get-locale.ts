import 'server-only';

import { cookies, headers } from 'next/headers';

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config';

/**
 * Parse an `Accept-Language` header and return the first supported locale.
 * Returns `undefined` when no supported locale is found.
 */
function pickFromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const parts = header
    .split(',')
    .map((chunk) => {
      const [tag, qPart] = chunk.trim().split(';');
      const q = qPart?.startsWith('q=') ? Number.parseFloat(qPart.slice(2)) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of parts) {
    const primary = tag.split('-')[0];
    if (isLocale(primary)) return primary;
  }
  return undefined;
}

/**
 * Resolve the active locale for the current request (Server Components,
 * route handlers, etc.). Reads `NEXT_LOCALE` cookie first, then falls back
 * to the `Accept-Language` header, then to `DEFAULT_LOCALE`.
 *
 * Server-only — the cookie is only readable on the server.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const fromHeader = pickFromAcceptLanguage(headerStore.get('accept-language'));
  if (fromHeader) return fromHeader;

  return DEFAULT_LOCALE;
}
