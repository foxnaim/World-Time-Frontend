'use client';

import * as React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { StatTile } from '@/components/admin/stat-tile';

type AdminStats = {
  users: number;
  companies: number;
  employees: number;
  activeEmployees: number;
  checkinsToday: number;
  activeProjects: number;
};

function fmt(n: number | undefined): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('ru-RU').format(n);
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useSWR<AdminStats>('/admin/stats', fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
          Обзор
        </div>
        <h1
          className="mt-2 text-4xl md:text-5xl text-stone-800 tracking-tight"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
        >
          Платформа целиком
        </h1>
        <p className="mt-2 text-sm text-stone-500 max-w-xl">
          Кросс-компанейские метрики. Обновляются при каждой загрузке страницы
          — это операторская панель, не аналитика.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile
          label="Пользователи"
          value={fmt(data?.users)}
          loading={isLoading}
          hint="всего"
        />
        <StatTile
          label="Компании"
          value={fmt(data?.companies)}
          loading={isLoading}
          hint="всего"
        />
        <StatTile
          label="Сотрудники"
          value={fmt(data?.employees)}
          loading={isLoading}
          hint={
            data
              ? `${fmt(data.activeEmployees)} активных`
              : 'всего'
          }
        />
        <StatTile
          label="Чек-ины сегодня"
          value={fmt(data?.checkinsToday)}
          loading={isLoading}
          hint="с 00:00"
        />
        <StatTile
          label="Активные проекты"
          value={fmt(data?.activeProjects)}
          loading={isLoading}
          hint="фриланс"
        />
      </div>
    </div>
  );
}
