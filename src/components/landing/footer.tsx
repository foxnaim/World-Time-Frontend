import * as React from 'react';
import Link from 'next/link';
import { COLORS } from '@tact/ui';

interface LinkGroup {
  title: string;
  links: Array<{ label: string; href: string }>;
}

const GROUPS: LinkGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Возможности', href: '#features' },
      { label: 'Тарифы', href: '#pricing' },
      { label: 'Как работает', href: '#how' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'AOne Agency', href: 'https://aoneagency.kz' },
      { label: 'Контакты', href: 'mailto:info@aoneagency.kz' },
      { label: 'Политика', href: '/privacy' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Условия', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Безопасность', href: '/security' },
    ],
  },
];

const SWATCHES: Array<{ name: string; hex: string; className: string }> = [
  { name: 'Cream', hex: COLORS.cream, className: 'bg-cream' },
  { name: 'Sand', hex: COLORS.sand, className: 'bg-sand' },
  { name: 'Stone', hex: COLORS.stone, className: 'bg-[#8E8D8A]' },
  { name: 'Coral', hex: COLORS.coral, className: 'bg-coral' },
  { name: 'Red', hex: COLORS.red, className: 'bg-red' },
];

export function Footer() {
  return (
    <footer
      id="contacts"
      className="relative border-t border-stone/20 bg-cream"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10">
          {/* Wordmark */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <span
              className="text-3xl tracking-tight text-stone"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Work Tact
            </span>
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
              © 2026 AOne Agency
            </p>
            <a
              href="mailto:info@aoneagency.kz"
              className="text-[10px] uppercase tracking-[0.28em] text-stone hover:text-coral transition-colors"
            >
              info@aoneagency.kz
            </a>
          </div>

          {GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col gap-5">
              <span className="text-[10px] uppercase tracking-[0.32em] text-stone/70">
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

        {/* palette swatches */}
        <div className="mt-20 border-t border-stone/20 pt-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <span className="text-[10px] uppercase tracking-[0.32em] text-stone/70">
              Palette / editorial · swiss
            </span>
            <ul className="flex flex-wrap gap-4 md:gap-6">
              {SWATCHES.map((s) => (
                <li key={s.name} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={'inline-block h-6 w-6 border border-stone/30 ' + s.className}
                  />
                  <span className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-stone">
                      {s.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-stone/60">
                      {s.hex}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-[10px] uppercase tracking-[0.32em] text-stone/60">
          <span>No.01 / 2026</span>
          <span>Built with care in Almaty</span>
        </div>
      </div>
    </footer>
  );
}
