'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import { cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { ApiError } from '@/lib/api';

type AdminStats = {
  users: number;
  companies: number;
  employees: number;
  activeEmployees: number;
  checkinsToday: number;
  activeProjects: number;
};

const NAV = [
  { href: '/admin', label: 'Обзор' },
  { href: '/admin/companies', label: 'Компании' },
  { href: '/admin/users', label: 'Пользователи' },
] as const;

function NoAccess() {
  return (
    <div className="min-h-screen bg-stone-200 text-stone-700 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500">403</div>
        <h1
          className="mt-4 text-4xl md:text-5xl text-stone-800 tracking-tight"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
        >
          Нет доступа
        </h1>
        <p className="mt-4 text-sm text-stone-600">
          Этот раздел доступен только операторам платформы. Если вы ожидаете увидеть его —
          проверьте, добавлен ли ваш Telegram ID в
          <code className="mx-1 px-1.5 py-0.5 bg-stone-100 rounded border border-stone-300 text-xs">
            SUPER_ADMIN_TELEGRAM_IDS
          </code>
          .
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-xs uppercase tracking-[0.28em] text-stone-500 hover:text-stone-800 transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-[240px] shrink-0 border-r border-stone-300/70 bg-stone-100"
      aria-label="Admin navigation"
    >
      <div className="h-16 flex items-center px-6 border-b border-stone-300/70">
        <Link
          href="/admin"
          className="text-stone-800 hover:text-stone-600 transition-colors tracking-tight text-lg"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Work Tact
        </Link>
        <span className="ml-3 text-[10px] uppercase tracking-[0.28em] text-stone-500">admin</span>
      </div>
      <nav className="p-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-sm text-sm tracking-tight transition-colors',
                isActive
                  ? 'bg-stone-200 text-stone-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto" />
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Probe the admin API — a 403 means "not a super-admin". We use this as the
  // single source of truth for whether to render the admin chrome or the
  // no-access screen.
  const { data, error, isLoading } = useSWR<AdminStats>('/admin/stats', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-stone-200 text-stone-500 flex items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.3em]">Загрузка…</div>
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 403) {
    return <NoAccess />;
  }
  // Treat 401/other auth failures the same as no-access from this layout's
  // perspective — the middleware will redirect if the session is actually
  // missing; if we got here we're logged in but not authorized.
  if (error && !data) {
    return <NoAccess />;
  }

  return (
    <div className="min-h-screen bg-stone-200 text-stone-700 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-stone-300/70 bg-stone-100/80 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
          <div
            className="text-sm tracking-tight text-stone-800"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Платформа
          </div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-stone-500">super-admin</div>
        </header>
        <main className="flex-1 px-8 py-10 md:px-12 md:py-12 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
