'use client';

import { useLang } from '@/i18n/context';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

/**
 * Drop-in wrapper that reads the active locale from `LangContext` so callers
 * don't have to thread `activeLocale` from the server. Use this inside client
 * components that already live below `<LangProvider>`.
 */
export function LocaleSwitcherAuto({ className }: { className?: string }) {
  const { locale } = useLang();
  return <LocaleSwitcher activeLocale={locale} className={className} />;
}
