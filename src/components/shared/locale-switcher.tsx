'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import {
  LOCALES,
  LOCALE_COOKIE,
  localeNames,
  type Locale,
} from '@/i18n/config';

type Props = {
  /** Active locale from the server render. */
  activeLocale: Locale;
  /** Optional wrapper className. */
  className?: string;
};

/**
 * Editorial pill-style RU/EN switcher.
 *
 * Writes the `NEXT_LOCALE` cookie and calls `router.refresh()` so RSCs
 * re-render with the new dictionary. The parent page must pass the active
 * locale resolved on the server (via `getLocale()`); the component does not
 * read `document.cookie` to avoid hydration drift.
 *
 * NOTE: this component is exported but intentionally NOT wired into the
 * marketing header yet. To integrate, import it in
 * `src/components/landing/marketing-header.tsx` (or wherever agent 16 puts
 * the header) and pass `activeLocale={await getLocale()}` from the server
 * page that renders the header.
 */
export function LocaleSwitcher({ activeLocale, className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState<Locale>(activeLocale);

  const items = useMemo(() => LOCALES, []);

  function choose(locale: Locale) {
    if (locale === current) return;
    // 1 year, site-wide, readable by RSC via the cookies() helper.
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setCurrent(locale);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Language"
      data-pending={pending ? 'true' : 'false'}
      className={
        className ??
        'inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white/80 p-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-600 shadow-sm backdrop-blur'
      }
    >
      {items.map((locale) => {
        const isActive = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => choose(locale)}
            aria-pressed={isActive}
            disabled={pending}
            className={
              'rounded-full px-2.5 py-1 transition-colors ' +
              (isActive
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900')
            }
          >
            {localeNames[locale]}
          </button>
        );
      })}
    </div>
  );
}

export default LocaleSwitcher;
