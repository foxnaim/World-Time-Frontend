import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from './config';

/**
 * A locale dictionary is an arbitrarily-nested object whose leaf values are
 * strings. Keeping the type loose here lets us share a single helper across
 * namespaces; the `createTranslator` helper walks dotted keys at runtime.
 */
export type Messages = { [key: string]: string | Messages };

/**
 * Dynamically import the JSON dictionary for the given locale. Falls back to
 * `DEFAULT_LOCALE` on invalid input or import failure so callers can always
 * render something sensible.
 *
 * The webpack/turbopack `request` is a template string so the bundler can
 * statically enumerate the possible imports.
 */
export async function loadMessages(locale: string): Promise<Messages> {
  const resolved: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  try {
    const mod = await import(`./messages/${resolved}.json`);
    return (mod.default ?? mod) as Messages;
  } catch {
    const fallback = await import(`./messages/${DEFAULT_LOCALE}.json`);
    return (fallback.default ?? fallback) as Messages;
  }
}
