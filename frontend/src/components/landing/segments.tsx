'use client';

import * as React from 'react';
import { useLang } from '@/i18n/context';
import { Reveal } from './reveal';

function TickIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="mt-1 shrink-0 text-coral"
    >
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.4" />
      <path
        d="M4.5 8.25l2.25 2.25L11.5 5.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Column {
  key: string;
  eyebrow: string;
  title: string;
  tagline: string;
  bullets: Array<{ title: string; body: string }>;
}

export function Segments() {
  const { t } = useLang();

  const COLUMNS: Column[] = [
    {
      key: 'b2b',
      eyebrow: t('segments.b2b_eyebrow'),
      title: t('segments.b2b_title'),
      tagline: t('segments.b2b_tagline'),
      bullets: [
        { title: t('segments.b2b_qr_title'), body: t('segments.b2b_qr_body') },
        { title: t('segments.b2b_geo_title'), body: t('segments.b2b_geo_body') },
        { title: t('segments.b2b_fines_title'), body: t('segments.b2b_fines_body') },
        { title: t('segments.b2b_sheets_title'), body: t('segments.b2b_sheets_body') },
      ],
    },
    {
      key: 'b2c',
      eyebrow: t('segments.b2c_eyebrow'),
      title: t('segments.b2c_title'),
      tagline: t('segments.b2c_tagline'),
      bullets: [
        { title: t('segments.b2c_timer_title'), body: t('segments.b2c_timer_body') },
        { title: t('segments.b2c_insights_title'), body: t('segments.b2c_insights_body') },
        { title: t('segments.b2c_rating_title'), body: t('segments.b2c_rating_body') },
        { title: t('segments.b2c_export_title'), body: t('segments.b2c_export_body') },
      ],
    },
  ];

  return (
    <section
      id="segments"
      aria-label="Segments"
      className="relative border-t border-stone/20 bg-cream"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-2">
        {COLUMNS.map((col, idx) => (
          <Reveal
            key={col.key}
            delay={idx * 0.1}
            className={idx === 0 ? 'border-b md:border-b-0 md:border-r border-stone/20' : ''}
          >
            <div className="flex h-full flex-col gap-8 px-6 py-20 md:px-12 md:py-28 lg:px-20">
              <span className="text-[10px] uppercase tracking-[0.32em] text-stone">
                {col.eyebrow}
              </span>
              <h2
                className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight text-stone"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {col.title}
              </h2>
              <p className="max-w-md text-base text-[#3d3b38]">{col.tagline}</p>
              <ul className="mt-4 flex flex-col gap-6">
                {col.bullets.map((b) => (
                  <li key={b.title} className="flex gap-3">
                    <TickIcon />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-stone">{b.title}</span>
                      <span className="text-sm text-[#6b6966]">{b.body}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
