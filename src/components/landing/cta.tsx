import * as React from 'react';
import Link from 'next/link';
import { Button, Dial } from '@tact/ui';
import { Reveal } from './reveal';

export function Cta() {
  return (
    <section
      id="cta"
      aria-label="Call to action"
      className="relative border-t border-stone/20 bg-sand/60 overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-36">
        <div className="relative flex flex-col items-center text-center gap-10">
          {/* decorative dial on the left */}
          <div
            className="pointer-events-none absolute -left-32 top-1/2 hidden md:block -translate-y-1/2 opacity-50"
            aria-hidden
          >
            <Dial size={360} progress={0.72} ticks={60} indicatorColor="coral" />
          </div>

          {/* decorative dial on the right */}
          <div
            className="pointer-events-none absolute -right-40 bottom-0 hidden lg:block opacity-40"
            aria-hidden
          >
            <Dial size={280} progress={0.33} ticks={60} indicatorColor="red" />
          </div>

          <Reveal>
            <span className="text-[10px] uppercase tracking-[0.4em] text-stone">
              06 — Start
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h2
              className="max-w-4xl text-6xl sm:text-7xl md:text-8xl leading-[0.92] tracking-tight text-stone"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Начать за <span className="text-coral">5 минут</span>
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="max-w-xl text-sm md:text-base text-stone/80">
              Подключите первую точку, распечатайте QR и откройте отчёт —
              без внедренцев и договоров на 40 страниц.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <Button variant="primary" size="lg" asChild>
              <Link href="/register">Создать аккаунт →</Link>
            </Button>
          </Reveal>

          <Reveal delay={0.4}>
            <span className="mt-2 text-[10px] uppercase tracking-[0.32em] text-stone/60">
              Без карты · Free до 5 сотрудников
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
