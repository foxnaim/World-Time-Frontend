'use client';

import { useMemo } from 'react';

import type { Messages } from './messages';
import { createTranslator, type Translator } from './translator';

/**
 * Client-side `t(key, params)` helper.
 *
 * The server must pass the already-loaded `messages` dictionary down as a
 * prop (e.g. via a context provider). Passing keeps this module free of
 * `next-intl` and avoids re-fetching the JSON on the client.
 *
 * On miss (`undefined` messages or unknown key) the key itself is returned.
 */
export function useT(messages: Messages | undefined): Translator {
  return useMemo<Translator>(() => {
    if (!messages) return (key: string) => key;
    return createTranslator(messages);
  }, [messages]);
}

export default useT;
