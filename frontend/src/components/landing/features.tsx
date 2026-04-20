'use client';
import * as React from 'react';
import { Card } from '@tact/ui';
import { useLang } from '@/i18n/context';
import { Reveal } from './reveal';

export function Features() {
  const { t } = useLang();

  const FEATURES = [
    { n: '01', title: t('features.f1_title'), body: t('features.f1_body') },
    { n: '02', title: t('features.f2_title'), body: t('features.f2_body') },
    { n: '03', title: t('features.f3_title'), body: t('features.f3_body') },
    { n: '04', title: t('features.f4_title'), body: t('features.f4_body') },
    { n: '05', title: t('features.f5_title'), body: t('features.f5_body') },
    { n: '06', title: t('features.f6_title'), body: t('features.f6_body') },
  ];

  return (
    <section
      id="features"
      aria-label="Features"
      className="relative border-t border-stone/20 bg-cream"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-14 md:mb-20">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.32em] text-stone">
                {t('features.eyebrow')}
              </span>
              <h2
                className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight text-stone"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {t('features.title')}
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[#6b6966]">
              {t('features.description')}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone/20">
          {FEATURES.map((f, idx) => (
            <Reveal key={f.n} delay={idx * 0.06}>
              <Card
                className="h-full rounded-none border-0 bg-cream shadow-none p-8 md:p-10"
                eyebrow={
                  <span
                    className="text-2xl md:text-3xl tracking-tight text-coral"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {f.n}
                  </span>
                }
                title={
                  <span
                    className="text-2xl md:text-3xl tracking-tight text-stone"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {f.title}
                  </span>
                }
              >
                <p className="text-sm leading-relaxed text-[#3d3b38]">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
