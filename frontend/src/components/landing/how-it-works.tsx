'use client';
import * as React from 'react';
import { ScrollTick } from '@tact/ui';
import { useLang } from '@/i18n/context';
import { Reveal } from './reveal';

export function HowItWorks() {
  const { t } = useLang();

  const STEPS = [
    { n: '01', title: t('howItWorks.s1_title'), body: t('howItWorks.s1_body') },
    { n: '02', title: t('howItWorks.s2_title'), body: t('howItWorks.s2_body') },
    { n: '03', title: t('howItWorks.s3_title'), body: t('howItWorks.s3_body') },
    { n: '04', title: t('howItWorks.s4_title'), body: t('howItWorks.s4_body') },
  ];

  return (
    <section
      id="how"
      aria-label="How it works"
      className="relative border-t border-stone/20 bg-cream"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 md:pt-28 pb-8">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.32em] text-stone">
                {t('howItWorks.eyebrow')}
              </span>
              <h2
                className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight text-stone"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {t('howItWorks.title')}
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#6b6966]">
              {t('howItWorks.description')}
            </p>
          </div>
        </Reveal>
      </div>

      <div
        className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        aria-label="Process steps"
      >
        <ol className="mx-auto flex max-w-[1400px] min-w-full gap-0 px-6 md:px-10 pb-8">
          {STEPS.map((s, idx) => (
            <li
              key={s.n}
              className={
                'snap-start shrink-0 w-[80vw] sm:w-[48vw] md:w-[28vw] lg:w-[24vw] flex flex-col gap-4 py-10 pr-6 md:pr-10 ' +
                (idx === 0 ? 'pl-0' : 'pl-6 md:pl-10') +
                (idx !== STEPS.length - 1 ? ' border-r border-stone/20' : '')
              }
            >
              <Reveal delay={idx * 0.08}>
                <span
                  className="text-4xl md:text-5xl font-medium tracking-tight text-coral"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 text-xl md:text-2xl font-medium text-stone">{s.title}</h3>
                <p className="mt-3 text-sm text-[#6b6966]">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pb-20 md:pb-28">
        <ScrollTick
          count={48}
          majorEvery={12}
          height={40}
          labels={[
            { at: 0.02, text: '01' },
            { at: 0.27, text: '02' },
            { at: 0.52, text: '03' },
            { at: 0.77, text: '04' },
          ]}
        />
      </div>
    </section>
  );
}
