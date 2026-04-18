import * as React from 'react';
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
  eyebrow: string;
  title: string;
  tagline: string;
  bullets: Array<{ title: string; body: string }>;
}

const COLUMNS: Column[] = [
  {
    eyebrow: '01 — B2B',
    title: 'Для бизнеса',
    tagline: 'Смены, точки, штрафы. Прозрачный учёт для команд от 5 до 5 000 сотрудников.',
    bullets: [
      {
        title: 'Ротируемый QR',
        body: 'QR-код на точке обновляется каждые 60 секунд — фото чужого кода бесполезно.',
      },
      {
        title: 'Геозона',
        body: 'Отметка засчитывается только внутри радиуса локации. Анти-фрод из коробки.',
      },
      {
        title: 'Авто-штрафы',
        body: 'Опоздания, прогулы и ранний уход вычисляются ботом и списываются по вашим правилам.',
      },
      {
        title: 'Отчёт в Google Sheets',
        body: 'Сводка смен уезжает в таблицу — никаких экспортов руками.',
      },
    ],
  },
  {
    eyebrow: '02 — B2C',
    title: 'Для фрилансеров',
    tagline:
      'Таймер, проекты и инсайты. Считайте часы клиенту и свои фокус-блоки — без менеджеров.',
    bullets: [
      {
        title: 'Таймер по проектам',
        body: 'Старт / стоп в один тап. История смен и биллинг по часовой ставке.',
      },
      {
        title: 'Инсайты недели',
        body: 'Когда у вас пик продуктивности, какие проекты съедают больше всего времени.',
      },
      {
        title: 'Рейтинг пунктуальных',
        body: 'Держите ритм — и получайте метрики, а не ощущение «я всё успел».',
      },
      {
        title: 'Экспорт CSV / Sheets',
        body: 'Счёт клиенту из той же таблицы, что и у команд.',
      },
    ],
  },
];

export function Segments() {
  return (
    <section
      id="segments"
      aria-label="Segments"
      className="relative border-t border-stone/20 bg-cream"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-2">
        {COLUMNS.map((col, idx) => (
          <Reveal
            key={col.title}
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
              <p className="max-w-md text-base text-stone/80">{col.tagline}</p>
              <ul className="mt-4 flex flex-col gap-6">
                {col.bullets.map((b) => (
                  <li key={b.title} className="flex gap-3">
                    <TickIcon />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-stone">{b.title}</span>
                      <span className="text-sm text-stone/70">{b.body}</span>
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
