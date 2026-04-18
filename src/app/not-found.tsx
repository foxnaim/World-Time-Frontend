import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Страница не найдена — 404',
};

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-2xl w-full grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-5">
          <p className="editorial-eyebrow mb-3">404 — Not found</p>
          <div
            className="editorial-heading text-display text-red leading-none select-none"
            aria-hidden="true"
          >
            404
          </div>
        </div>
        <div className="col-span-12 md:col-span-7 md:pb-4">
          <h1 className="editorial-heading text-3xl md:text-4xl mb-4 text-balance">
            Этой страницы здесь нет.
          </h1>
          <p className="editorial-body mb-8 text-pretty">
            Адрес мог измениться, или страница была убрана. Вернитесь на главную и продолжите с
            нужного раздела.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 bg-coral text-cream text-sm font-medium rounded-sm transition-colors hover:bg-red"
            >
              На главную
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-5 py-3 hairline text-sm font-medium text-stone hover:text-red transition-colors"
            >
              Возможности
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
