'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Tact] route error:', error);
  }, [error]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        <p className="editorial-eyebrow mb-4">Ошибка</p>
        <h1 className="editorial-heading text-4xl md:text-5xl mb-4 text-balance">
          Что-то пошло не так.
        </h1>
        <p className="editorial-body mb-8 text-pretty">
          Мы уже получили уведомление. Попробуйте повторить действие — если проблема сохранится,
          напишите нам.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-stone/70 mb-8">ref: {error.digest}</p>
        ) : null}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-3 bg-coral text-cream text-sm font-medium rounded-sm transition-colors hover:bg-red focus-visible:outline-none"
          >
            Повторить
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 hairline text-sm font-medium text-stone hover:text-red transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
