'use client';

import * as React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { Timer } from '@/components/dashboard/freelance/timer';
import { ProjectCard } from '@/components/dashboard/freelance/project-card';
import { InsightCard } from '@/components/dashboard/freelance/insight-card';

interface Project {
  id: string;
  name: string;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency?: string | null;
  status: string;
  monthHours?: number;
}

interface RealRate {
  effectiveRate: number;
  totalSeconds: number;
  totalIncome: number;
  insight?: string;
  periodStart?: string;
  periodEnd?: string;
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function FreelanceOverviewPage() {
  const month = currentYearMonth();

  const { data: projects, isLoading: projectsLoading } = useSWR<Project[]>(
    '/api/projects',
    fetcher,
  );
  const { data: realRate } = useSWR<RealRate>(
    `/api/analytics/user/real-hourly-rate?month=${month}`,
    fetcher,
  );

  const list = Array.isArray(projects) ? projects : [];
  const activeProjects = list.filter((p) => p.status === 'ACTIVE');
  const monthHoursTotal = list.reduce((sum, p) => sum + (p.monthHours || 0), 0);
  const monthSeconds = realRate?.totalSeconds ?? 0;
  const hoursFromRate = monthSeconds / 3600;
  const hours = monthHoursTotal > 0 ? monthHoursTotal : hoursFromRate;

  return (
    <div className="flex flex-col gap-10 py-8 md:py-12">
      <header>
        <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
          Фриланс
        </span>
        <h1
          className="mt-2 text-4xl font-medium tracking-editorial text-stone md:text-5xl"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Ваш месяц
        </h1>
      </header>

      <Timer projects={list} />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Kpi
          eyebrow="Часов за месяц"
          value={hours.toFixed(1)}
          unit="ч"
        />
        <Kpi
          eyebrow="Активные проекты"
          value={String(activeProjects.length)}
          unit={activeProjects.length === 1 ? 'проект' : 'проектов'}
        />
        <Kpi
          eyebrow="Реальная ставка"
          value={
            realRate?.effectiveRate != null
              ? Math.round(realRate.effectiveRate).toLocaleString('ru-RU')
              : '—'
          }
          unit="₽/час"
        />
      </section>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h2
            className="text-2xl font-medium tracking-editorial text-stone md:text-3xl"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Проекты
          </h2>
          <Link
            href="/freelance/projects"
            className="text-xs uppercase tracking-[0.22em] text-stone/70 hover:text-coral"
          >
            Все проекты →
          </Link>
        </div>
        {projectsLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="h-48 animate-pulse">
                <div className="h-4 w-32 rounded bg-stone/20" />
                <div className="mt-4 h-3 w-24 rounded bg-stone/15" />
              </Card>
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyProjects />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {list.slice(0, 6).map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                monthHours={p.monthHours || 0}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <InsightCard
          insight={
            realRate?.insight ||
            'Записывайте время и получайте ежемесячные инсайты: реальная ставка, недозаработок и где деньги утекают.'
          }
          rate={realRate?.effectiveRate ?? null}
        />
      </section>
    </div>
  );
}

function Kpi({
  eyebrow,
  value,
  unit,
  className,
}: {
  eyebrow: string;
  value: string;
  unit?: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
        {eyebrow}
      </span>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className="text-5xl font-medium tracking-editorial text-stone md:text-6xl"
          style={{
            fontFamily: 'Fraunces, serif',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs uppercase tracking-[0.22em] text-stone/70">
            {unit}
          </span>
        )}
      </div>
    </Card>
  );
}

function EmptyProjects() {
  return (
    <Card className="flex flex-col items-center gap-5 py-14 text-center">
      <h3
        className="text-3xl font-medium tracking-editorial text-stone"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        Пока нет проектов
      </h3>
      <p className="max-w-md text-sm text-stone/80">
        Создайте первый проект, чтобы начать учёт времени и видеть реальную
        часовую ставку в конце месяца.
      </p>
      <Link href="/freelance/projects/new">
        <Button variant="primary" size="md">
          Создать проект
        </Button>
      </Link>
    </Card>
  );
}
