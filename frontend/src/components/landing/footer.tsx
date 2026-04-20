'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLang } from '@/i18n/context';

interface LinkGroup {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export function Footer() {
  const { t } = useLang();

  const GROUPS: LinkGroup[] = [
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.lnk_features'), href: '#features' },
        { label: t('footer.lnk_pricing'), href: '#pricing' },
        { label: t('footer.lnk_how'), href: '#how' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.lnk_privacy'), href: '/privacy' },
        { label: t('footer.lnk_terms'), href: '/terms' },
        { label: t('footer.lnk_cookies'), href: '/cookies' },
        { label: t('footer.lnk_security'), href: '/security' },
      ],
    },
  ];

  return (
    <footer
      id="contacts"
      className="relative border-t border-stone/20 bg-cream"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 pb-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-12 md:gap-10">
          <div className="flex flex-col gap-4">
            <span
              className="text-3xl tracking-tight text-stone"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Work Tact
            </span>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              {t('footer.copyright')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            {GROUPS.map((g) => (
              <div key={g.title} className="flex flex-col gap-5">
                <span className="text-[10px] uppercase tracking-[0.32em] text-[#6b6966]">
                  {g.title}
                </span>
                <ul className="flex flex-col gap-3">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-stone hover:text-coral transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-stone/20 pt-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-[10px] uppercase tracking-[0.32em] text-[#6b6966]">
          <span>{t('footer.copyright')}</span>
          <span>{t('footer.tagline')}</span>
        </div>
      </div>
    </footer>
  );
}
