import * as React from 'react';
import Link from 'next/link';
import { Button } from '@tact/ui';
import { Reveal } from './reveal';

interface Tier {
  eyebrow: string;
  name: string;
  price: React.ReactNode;
  priceNote: string;
  features: string[];
  cta: { label: string; href: string };
  accent?: boolean;
}

const TIERS: Tier[] = [
  {
    eyebrow: '01',
    name: 'Free',
    price: '0 ₽',
    priceNote: 'до 5 сотрудников',
    features: ['Одна точка с QR', 'Базовый геофенс', 'Отчёт в CSV', 'Email-поддержка'],
    cta: { label: 'Начать бесплатно', href: '/register' },
  },
  {
    eyebrow: '02',
    name: 'Team',
    price: '200 ₽',
    priceNote: '/ сотр / мес',
    features: [
      'Неограниченно точек',
      'Анти-фрод и геозоны',
      'Авто-штрафы и рейтинг',
      'Синхронизация с Google Sheets',
    ],
    cta: { label: 'Оформить Team', href: '/register?plan=team' },
    accent: true,
  },
  {
    eyebrow: '03',
    name: 'Enterprise',
    price: 'По запросу',
    priceNote: 'от 500 сотрудников',
    features: [
      'SSO и SCIM',
      'SLA и приоритетная поддержка',
      'Онбординг под команду',
      'Кастомные интеграции',
    ],
    cta: { label: 'Связаться', href: 'mailto:info@aoneagency.kz' },
  },
];

export function Pricing() {
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
                05 — Pricing
              </span>
              <h2
                className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight text-stone"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                Тарифы
              </h2>
            </div>
            <p className="max-w-sm text-sm text-stone/70">
              Без скрытых строк. Пересмотрите план в любой момент — мы пересчитаем только ту
              разницу, которую вы реально прожили.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-stone/20">
          {TIERS.map((t, idx) => (
            <Reveal
              key={t.name}
              delay={idx * 0.08}
              className={
                idx !== TIERS.length - 1 ? 'border-b md:border-b-0 md:border-r border-stone/20' : ''
              }
            >
              <div className="flex h-full flex-col gap-8 px-6 md:px-10 py-12 md:py-16">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.32em] text-stone">
                    {t.eyebrow}
                  </span>
                  {t.accent && (
                    <span className="text-[10px] uppercase tracking-[0.32em] text-coral">
                      Популярно
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <h3
                    className="text-4xl md:text-5xl font-medium tracking-tight text-stone"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {t.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={
                        'text-3xl md:text-4xl tracking-tight ' +
                        (t.accent ? 'text-coral' : 'text-stone')
                      }
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {t.price}
                    </span>
                    <span className="text-xs uppercase tracking-[0.22em] text-stone/70">
                      {t.priceNote}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-3 text-sm text-stone/80">
                  {t.features.map((f) => (
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
                  <Button variant={t.accent ? 'primary' : 'ghost'} size="md" asChild>
                    <Link href={t.cta.href}>{t.cta.label}</Link>
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
