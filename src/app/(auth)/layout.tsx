import * as React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-cream text-stone overflow-hidden">
      {/* Background concentric rings echoing the Dial */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          width="1200"
          height="1200"
          viewBox="0 0 1200 1200"
          className="opacity-60"
          fill="none"
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const r = 80 + i * 55;
            return (
              <circle
                key={i}
                cx="600"
                cy="600"
                r={r}
                stroke="#8E8D8A"
                strokeOpacity={0.08 + (9 - i) * 0.005}
                strokeWidth={1}
              />
            );
          })}
          {/* Tick hints at cardinal angles */}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i / 48) * Math.PI * 2 - Math.PI / 2;
            const r1 = 570;
            const r2 = i % 4 === 0 ? 550 : 560;
            const x1 = 600 + Math.cos(angle) * r1;
            const y1 = 600 + Math.sin(angle) * r1;
            const x2 = 600 + Math.cos(angle) * r2;
            const y2 = 600 + Math.sin(angle) * r2;
            return (
              <line
                key={`t-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#8E8D8A"
                strokeOpacity={i % 4 === 0 ? 0.25 : 0.1}
                strokeWidth={1}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>

      {/* Top-left wordmark */}
      <header className="relative z-10 px-6 py-6 md:px-10 md:py-8">
        <Link
          href="/"
          className="inline-flex items-baseline gap-2 text-stone hover:text-coral transition-colors"
        >
          <span
            className="text-xl font-medium tracking-tight"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            WorkTime
          </span>
          <span className="text-[10px] uppercase tracking-[0.28em] text-stone/60">
            / учёт времени
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-10">
        {children}
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.28em] text-stone/50">
          © {new Date().getFullYear()} WorkTime
        </p>
      </footer>
    </div>
  );
}
