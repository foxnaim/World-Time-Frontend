'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@tact/ui';
import { Reveal } from './reveal';
import { useLang } from '@/i18n/context';

interface Tier {
  eyebrow: string;
  name: string;
  price: React.ReactNode;
  priceNote: string;
  features: string[];
  cta: { label: string; href: string };
  accent?: boolean;
}

export function Pricing() {
  const { t } = useLang();

  const TIERS: Tier[] = [
    {
      eyebrow: '01',
      name: 'Free',
      price: t('pricing.t1_price'),
      priceNote: t('pricing.t1_note'),
      features: [t('pricing.t1_f1'), t('pricing.t1_f2'), t('pricing.t1_f3'), t('pricing.t1_f4')],
      cta: { label: t('pricing.t1_cta'), href: '/register' },
    },
    {
      eyebrow: '02',
      name: 'Team',
      price: t('pricing.t2_price'),
      priceNote: t('pricing.t2_note'),
      features: [t('pricing.t2_f1'), t('pricing.t2_f2'), t('pricing.t2_f3'), t('pricing.t2_f4')],
      cta: { label: t('pricing.t2_cta'), href: '/register?plan=team' },
      accent: true,
    },
    {
      eyebrow: '03',
      name: 'Enterprise',
      price: t('pricing.t3_price'),
      priceNote: t('pricing.t3_note'),
      features: [t('pricing.t3_f1'), t('pricing.t3_f2'), t('pricing.t3_f3'), t('pricing.t3_f4')],
      cta: { label: t('pricing.t3_cta'), href: '/contacts' },
    },
  ];

  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className="relative border-t border-stone/20 bg-cream"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-14 md:mb-20">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.32em] text-stone">
                {t('pricing.eyebrow')}
              </span>
              <h2
                className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight text-stone"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {t('pricing.title')}
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[#6b6966]">
              {t('pricing.description')}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-stone/20">
          {TIERS.map((tier, idx) => (
            <Reveal
              key={tier.name}
              delay={idx * 0.08}
              className={
                idx !== TIERS.length - 1 ? 'border-b md:border-b-0 md:border-r border-stone/20' : ''
              }
            >
              <div className="flex h-full flex-col gap-8 px-6 md:px-10 py-12 md:py-16">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.32em] text-stone">
                    {tier.eyebrow}
                  </span>
                  {tier.accent && (
                    <span className="text-[10px] uppercase tracking-[0.32em] text-coral">
                      {t('pricing.popular')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <h3
                    className="text-4xl md:text-5xl font-medium tracking-tight text-stone"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={
                        'text-3xl md:text-4xl tracking-tight ' +
                        (tier.accent ? 'text-coral' : 'text-stone')
                      }
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {tier.price}
                    </span>
                    <span className="text-xs uppercase tracking-[0.22em] text-[#6b6966]">
                      {tier.priceNote}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-3 text-sm text-[#3d3b38]">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-3 border-t border-stone/15 pt-3 first:border-t-0 first:pt-0"
                    >
                      <span
                        aria-hidden
                        className="mt-1 inline-block h-[1px] w-4 shrink-0 bg-stone/40"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4">
                  <Button variant={tier.accent ? 'primary' : 'ghost'} size="md" asChild>
                    <Link href={tier.cta.href}>{tier.cta.label}</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
