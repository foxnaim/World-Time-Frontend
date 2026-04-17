'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  employeeCount: number;
};

type Page = {
  items: CompanyRow[];
  nextCursor: string | null;
};

const PAGE_SIZE = 25;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AdminCompaniesPage() {
  const [q, setQ] = React.useState('');
  const [debouncedQ, setDebouncedQ] = React.useState('');
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [stack, setStack] = React.useState<string[]>([]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQ(q.trim());
      setCursor(undefined);
      setStack([]);
    }, 300);
    return () => window.clearTimeout(id);
  }, [q]);

  const swrKey: [string, Record<string, unknown>] = [
    '/admin/companies',
    {
      limit: PAGE_SIZE,
      cursor,
      q: debouncedQ || undefined,
    },
  ];
  const { data, isLoading, error } = useSWR<Page>(swrKey, fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
            Каталог
          </div>
          <h1
            className="mt-2 text-4xl md:text-5xl text-stone-800 tracking-tight"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            Компании
          </h1>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию или slug…"
          className="w-72 h-10 px-3 text-sm border border-stone-300 bg-stone-100 rounded-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-500"
        />
      </div>

      <div className="border border-stone-300/70 bg-stone-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-stone-300/70">
              <th className="px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-stone-500 font-normal">
                Название
              </th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-stone-500 font-normal">
                Slug
              </th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-stone-500 font-normal text-right">
                Сотрудников
              </th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-stone-500 font-normal">
                Создана
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && !data && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-500 text-xs uppercase tracking-[0.22em]">
                  Загрузка…
                </td>
              </tr>
            )}
            {error && !data && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-600 text-xs uppercase tracking-[0.22em]">
                  Ошибка загрузки
                </td>
              </tr>
            )}
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-500 text-xs uppercase tracking-[0.22em]">
                  Ничего не найдено
                </td>
              </tr>
            )}
            {data?.items.map((c) => (
              <tr
                key={c.id}
                className="border-b border-stone-200 last:border-b-0 hover:bg-stone-200/50"
              >
                <td className="px-4 py-3 text-stone-800 tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
                  {c.name}
                </td>
                <td className="px-4 py-3 text-stone-500 font-mono text-xs">
                  /{c.slug}
                </td>
                <td className="px-4 py-3 text-stone-700 tabular-nums text-right">
                  {c.employeeCount}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/companies/${c.id}`}
                    className="text-xs uppercase tracking-[0.22em] text-stone-500 hover:text-stone-900"
                  >
                    Открыть →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            const prev = [...stack];
            const last = prev.pop();
            setStack(prev);
            setCursor(last);
          }}
          disabled={stack.length === 0}
          className="text-xs uppercase tracking-[0.22em] text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Назад
        </button>
        <div className="text-[10px] uppercase tracking-[0.22em] text-stone-400">
          {data ? `${data.items.length} шт.` : ''}
        </div>
        <button
          onClick={() => {
            if (!data?.nextCursor) return;
            setStack((s) => [...s, cursor ?? '']);
            setCursor(data.nextCursor);
          }}
          disabled={!data?.nextCursor}
          className="text-xs uppercase tracking-[0.22em] text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Дальше →
        </button>
      </div>
    </div>
  );
}
