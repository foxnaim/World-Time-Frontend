'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Dial } from '@tact/ui';

/**
 * Simple 5x5 QR-like mark, rendered as coral squares on cream.
 * Decorative — not a real QR.
 */
function QrMark({ size = 88 }: { size?: number }) {
  const cells = 5;
  const cell = size / cells;
  const pattern: number[][] = [
    [1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1],
    [1, 1, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 1, 1],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="QR illustration"
      className="block"
    >
      <rect
        x={0.5}
        y={0.5}
        width={size - 1}
        height={size - 1}
        fill="none"
        stroke="#8E8D8A"
        strokeOpacity={0.3}
      />
      {pattern.map((row, r) =>
        row.map((v, c) =>
          v ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell + 2}
              y={r * cell + 2}
              width={cell - 4}
              height={cell - 4}
              fill="#E98074"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = React.useState(0);
  const [dialSize, setDialSize] = React.useState(640);

  React.useEffect(() => {
    function resize() {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
      if (w < 640) setDialSize(320);
      else if (w < 1024) setDialSize(480);
      else setDialSize(640);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(0.72);
      return;
    }
    const timeout = window.setTimeout(() => setProgress(0.72), 250);
    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion]);

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-cream pt-20"
      aria-label="Hero"
    >
      <motion.div
        className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1400px] flex-col items-center justify-center px-6 py-16 md:px-10"
        variants={prefersReducedMotion ? undefined : container}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="show"
      >
        {/* eyebrow year */}
        <motion.span
          variants={item}
          className="mb-4 text-[10px] uppercase tracking-[0.4em] text-stone"
        >
          NO. 01 · 2026 · TACT
        </motion.span>

        {/* dial + overlaid heading */}
        <div className="relative flex items-center justify-center">
          <motion.div variants={item} className="relative">
            <Dial
              size={dialSize}
              progress={progress}
              ticks={60}
              highlightStart={9 / 24}
              highlightEnd={18 / 24}
              indicatorColor="coral"
            />
          </motion.div>

          {/* overlay heading */}
          <motion.h1
            variants={item}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-stone/80">
              Time, in rhythm
            </span>
            <span className="text-7xl sm:text-8xl md:text-9xl font-medium leading-[0.9] tracking-tight text-stone">
              TACT
            </span>
            <span className="mt-2 text-[10px] uppercase tracking-[0.4em] text-coral">
              2026
            </span>
          </motion.h1>
        </div>

        {/* subtitle */}
        <motion.p
          variants={item}
          className="mt-10 max-w-xl text-center text-[11px] uppercase tracking-[0.32em] text-stone"
        >
          Ритм рабочего дня
          <span className="mx-2 text-stone/40">·</span>
          by AOne Agency
        </motion.p>

        {/* scroll hint */}
        <motion.div
          variants={item}
          className="mt-12 flex flex-col items-center gap-2 text-stone/70"
          aria-hidden
        >
          <span className="text-[10px] uppercase tracking-[0.32em]">
            scroll
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="animate-[pulse_2.4s_ease-in-out_infinite]"
          >
            <path
              d="M2 7h10m0 0L8 3m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* left-bottom QR decoration */}
        <motion.div
          variants={item}
          className="pointer-events-none absolute bottom-10 left-6 hidden md:flex flex-col gap-2 md:left-10"
          aria-hidden
        >
          <QrMark size={88} />
          <span className="text-[10px] uppercase tracking-[0.28em] text-stone">
            QR / GEO
          </span>
        </motion.div>

        {/* right-bottom meta */}
        <motion.div
          variants={item}
          className="pointer-events-none absolute bottom-10 right-6 hidden md:block md:right-10 text-right"
          aria-hidden
        >
          <span className="block text-[10px] uppercase tracking-[0.28em] text-stone">
            No.01
          </span>
          <span className="block text-[10px] uppercase tracking-[0.28em] text-stone/60">
            Editorial · Swiss
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
