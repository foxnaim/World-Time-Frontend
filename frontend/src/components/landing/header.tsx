'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, cn } from '@tact/ui';
import { useLang } from '@/i18n/context';
import type { Locale } from '@/i18n/config';

const NAV_LINKS: Array<{ href: string; label: string }> = [];

const DISPLAY_LOCALES: Array<{ label: 'RU' | 'KZ' | 'EN'; value: Locale }> = [
  { label: 'RU', value: 'ru' },
  { label: 'KZ', value: 'kz' },
  { label: 'EN', value: 'en' },
];

export interface HeaderProps {
  authenticated?: boolean;
}

export function Header({ authenticated = false }: HeaderProps = {}) {
  const { locale, setLocale, t } = useLang();
  const ctaHref = authenticated ? '/dashboard' : '/login';
  const ctaLabel = authenticated ? t('header.cta_dashboard') : t('header.cta_login');

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-cream/80 backdrop-blur-md border-b border-stone/20"
      role="banner"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-stone text-2xl md:text-3xl tracking-tight rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          style={{ fontFamily: 'Fraunces, serif' }}
          aria-label="Work Tact — на главную"
        >
          Work Tact
        </Link>

        <nav className="hidden md:flex items-center gap-10" aria-label="Основная навигация">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] uppercase tracking-[0.28em] text-stone hover:text-coral rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <div
            className="hidden sm:flex items-center text-[10px] uppercase tracking-[0.28em] text-stone"
            role="group"
            aria-label="Язык интерфейса"
          >
            {DISPLAY_LOCALES.map(({ label, value }, i) => (
              <React.Fragment key={value}>
                {i > 0 && <span className="mx-1.5 text-stone/40" aria-hidden="true">/</span>}
                <button
                  type="button"
                  onClick={() => setLocale(value)}
                  className={cn(
                    'rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors',
                    locale === value ? 'text-coral' : 'text-[#6b6966] hover:text-[#3d3b38]',
                  )}
                  aria-pressed={locale === value}
                >
                  {label}
                </button>
              </React.Fragment>
            ))}
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
