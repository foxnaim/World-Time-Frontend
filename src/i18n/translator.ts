import type { Messages } from './messages';

export type TranslateParams = Record<string, string | number>;

export type Translator = (key: string, params?: TranslateParams) => string;

/** Walk a dotted key path through a dictionary; return `undefined` on miss. */
function resolveKey(messages: Messages, key: string): unknown {
  const segments = key.split('.');
  let node: unknown = messages;
  for (const segment of segments) {
    if (node && typeof node === 'object' && segment in (node as object)) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return node;
}

/**
 * Replace `{name}` placeholders in a template with values from `params`.
 * Missing keys are left untouched — makes debugging obvious.
 */
function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * Build a `t(key, params?)` function bound to a dictionary.
 *
 * - Supports dotted keys for nested access: `t('nav.about')`.
 * - Supports `{var}` placeholder interpolation.
 * - On miss (or when the resolved value isn't a string) returns the raw key,
 *   which makes gaps obvious in-product without throwing.
 *
 * Intentionally zero-dependency — no `next-intl` / `intl-messageformat`.
 */
export function createTranslator(messages: Messages): Translator {
  return function t(key, params) {
    const value = resolveKey(messages, key);
    if (typeof value !== 'string') return key;
    return interpolate(value, params);
  };
}
