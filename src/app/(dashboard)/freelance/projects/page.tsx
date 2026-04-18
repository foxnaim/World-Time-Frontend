'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Badge, Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';

interface Project {
  id: string;
  name: string;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency?: string | null;
  status: string;
  monthHours?: number;
}

const STATUS_VARIANT: Record<string, 'neutral' | 'coral' | 'red' | 'sand'> = {
  ACTIVE: 'coral',
  DONE: 'neutral',
  ARCHIVED: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Активен',
  DONE: 'Завершён',
  ARCHIVED: 'В архиве',
};

export default function ProjectsListPage() {
  const { data, isLoading } = useSWR<Project[]>('/api/projects', fetcher);
  const list = Array.isArray(data) ? data : [];

  return (
    <div className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">Фриланс</span>
          <h1
            className="mt-2 text-4xl font-medium tracking-editorial text-stone md:text-5xl"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Проекты
          </h1>
        </div>
        <Link href="/freelance/projects/new">
          <Button variant="primary" size="md">
            Новый проект
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <ListSkeleton />
      ) : list.length === 0 ? (
        <EmptyState />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="hairline-b text-left text-[10px] uppercase tracking-[0.22em] text-stone/70">
                <Th>Название</Th>
                <Th className="text-right">Ставка</Th>
                <Th className="text-right">Фикс</Th>
                <Th className="text-right">Часов / месяц</Th>
                <Th>Статус</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const status = p.status || 'ACTIVE';
                return (
                  <tr key={p.id} className="hairline-b transition-colors hover:bg-sand/30">
                    <Td>
                      <Link href={`/freelance/projects/${p.id}`} className="no-underline">
                        <span
                          className="text-base font-medium text-stone hover:text-coral"
                          style={{ fontFamily: 'Fraunces, serif' }}
                        >
                          {p.name}
                        </span>
                      </Link>
                    </Td>
                    <Td className="text-right font-sans tabular-nums">
                      {p.hourlyRate != null
                        ? `${Math.round(p.hourlyRate)} ${p.currency || 'RUB'}/ч`
                        : '—'}
                    </Td>
                    <Td className="text-right font-sans tabular-nums">
                      {p.fixedPrice != null
                        ? `${Math.round(p.fixedPrice)} ${p.currency || 'RUB'}`
                        : '—'}
                    </Td>
                    <Td className="text-right font-sans tabular-nums">
                      {(p.monthHours ?? 0).toFixed(1)} ч
                    </Td>
                    <Td>
                      <Badge variant={STATUS_VARIANT[status] || 'neutral'}>
                        {STATUS_LABEL[status] || status}
                      </Badge>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn('px-6 py-4 font-medium', className)}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-6 py-4 align-middle text-sm text-stone', className)}>{children}</td>;
}

function ListSkeleton() {
  return (
    <Card className="p-0">
      <div className="divide-y divide-stone/20">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-5">
            <div className="h-4 w-40 animate-pulse rounded bg-stone/20" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-stone/15" />
            <div className="h-4 w-16 animate-pulse rounded bg-stone/15" />
            <div className="h-4 w-20 animate-pulse rounded bg-stone/15" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-stone/15" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-5 py-16 text-center">
      <h3
        className="text-3xl font-medium tracking-editorial text-stone"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        Пока нет проектов
      </h3>
      <p className="max-w-md text-sm text-stone/80">
        Создайте первый проект, чтобы начать учёт времени.
      </p>
      <Link href="/freelance/projects/new">
        <Button variant="primary" size="md">
          Создать проект
        </Button>
      </Link>
    </Card>
  );
}
