import * as React from 'react';
import { Card } from '@worktime/ui';
import { Reveal } from './reveal';

interface Feature {
  n: string;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    n: '01',
    title: 'Rotating QR',
    body: 'QR обновляется раз в минуту — скриншот или пересылка чужому не работают.',
  },
  {
    n: '02',
    title: 'Geofence',
    body: 'Отметка валидна только в радиусе точки. Координаты проверяются на сервере.',
  },
  {
    n: '03',
    title: 'Анти-фрод',
    body: 'Детекция подмены GPS, эмуляторов и повторных сканов. Чистые смены в отчёте.',
  },
  {
    n: '04',
    title: 'Авто-штрафы',
    body: 'Опоздания и прогулы считаются по вашим правилам и автоматически уходят в расчёт.',
  },
  {
    n: '05',
    title: 'Рейтинг пунктуальных',
    body: 'Лидерборд по пунктуальности и переработкам — мотивация без ручных премий.',
  },
  {
    n: '06',
    title: 'Sheets экспорт',
    body: 'Двусторонняя синхронизация с Google Sheets — любые отчёты и сводки под рукой.',
  },
];

export function Features() {
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
                04 — Features
              </span>
              <h2
                className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight text-stone"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                Шесть опор системы
              </h2>
            </div>
            <p className="max-w-sm text-sm text-stone/70">
              Каждая функция закрывает конкретную боль учёта — и ни одной лишней.
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
                <p className="text-sm leading-relaxed text-stone/80">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
