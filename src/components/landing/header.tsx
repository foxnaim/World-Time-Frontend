'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, cn } from '@tact/ui';

const NAV_LINKS = [
  { href: '#about', label: 'ABOUT US' },
  { href: '#contacts', label: 'CONTACTS' },
];

export function Header() {
  const [lang, setLang] = React.useState<'EN' | 'RU'>('RU');

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
          aria-label="Tact — на главную"
        >
          Tact
        </Link>

        <nav
          className="hidden md:flex items-center gap-10"
          aria-label="Основная навигация"
        >
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
            <button
              type="button"
              onClick={() => setLang('EN')}
              className={cn(
                'rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors',
                lang === 'EN' ? 'text-coral' : 'text-stone/60 hover:text-stone',
              )}
              aria-pressed={lang === 'EN'}
              aria-label="Английский язык"
            >
              EN
            </button>
            <span className="mx-1.5 text-stone/40" aria-hidden="true">
              /
            </span>
            <button
              type="button"
              onClick={() => setLang('RU')}
              className={cn(
                'rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors',
                lang === 'RU' ? 'text-coral' : 'text-stone/60 hover:text-stone',
              )}
              aria-pressed={lang === 'RU'}
              aria-label="Русский язык"
            >
              RU
            </button>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Войти</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
