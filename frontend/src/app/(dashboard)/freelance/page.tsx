'use client';

import * as React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { Timer } from '@/components/dashboard/freelance/timer';
import { ProjectCard } from '@/components/dashboard/freelance/project-card';
import { InsightCard } from '@/components/dashboard/freelance/insight-card';
import { useLang } from '@/i18n/context';

interface Project {
  id: string;
  name: string;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency?: string | null;
  status: string;
  totalSeconds?: number;
}

interface RealRateProjectRow {
  projectId: string;
  seconds: number;
  excluded?: boolean;
}

interface RealRate {
  effectiveRate: number;
  totalSeconds: number;
  totalIncome: number;
  periodStart?: string;
  periodEnd?: string;
  perProject?: RealRateProjectRow[];
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Derive a localised insight from the user's effective rate.
 *
 * The `/api/analytics/user/real-hourly-rate` endpoint returns the numeric
 * `effectiveRate` but no pre-built message, so we mirror the RUB rate bands
 * used by backend `ProjectService.buildInsight` (<500 / 500-1500 /
 * 1500-3000 / >3000) to stay consistent with per-project summaries.
 */
function deriveInsightKey(
  rate: number | null | undefined,
  totalSeconds: number,
): 'insightEmpty' | 'insightLow' | 'insightMid' | 'insightGood' | 'insightTop' {
  if (totalSeconds <= 0 || rate == null) return 'insightEmpty';
  if (rate < 500) return 'insightLow';
  if (rate < 1500) return 'insightMid';
  if (rate < 3000) return 'insightGood';
  return 'insightTop';
}

export default function FreelanceOverviewPage() {
  const { t } = useLang();
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
  // `/api/analytics/user/real-hourly-rate` is the only endpoint that scopes
  // totals to the current month — `/api/projects` exposes lifetime totals.
  const monthSeconds = realRate?.totalSeconds ?? 0;
  const hours = monthSeconds / 3600;
  const monthHoursByProject = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const row of realRate?.perProject ?? []) {
      map.set(row.projectId, (row.seconds ?? 0) / 3600);
    }
    return map;
  }, [realRate]);

  const insightKey = deriveInsightKey(realRate?.effectiveRate ?? null, monthSeconds);

  return (
    <div className="flex flex-col gap-10 py-8 md:py-12">
      <header>
        <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
          {t('freelanceTimer.eyebrow')}
        </span>
        <h1
          className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-editorial text-stone"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {t('freelanceTimer.pageTitle')}
        </h1>
      </header>

      <Timer projects={list} />

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <Kpi
          eyebrow={t('freelanceTimer.kpiHoursEyebrow')}
          value={hours.toFixed(1)}
          unit={t('freelanceTimer.kpiHoursUnit')}
        />
        <Kpi
          eyebrow={t('freelanceTimer.kpiProjectsEyebrow')}
          value={String(activeProjects.length)}
          unit={
            activeProjects.length === 1
              ? t('freelanceTimer.kpiProjectsSingular')
              : t('freelanceTimer.kpiProjectsPlural')
          }
        />
        <Kpi
          eyebrow={t('freelanceTimer.kpiRateEyebrow')}
          value={
            realRate?.effectiveRate != null
              ? Math.round(realRate.effectiveRate).toLocaleString('ru-RU')
              : '—'
          }
          unit={t('freelanceTimer.kpiRateUnit')}
        />
      </section>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h2
            className="text-2xl font-medium tracking-editorial text-stone md:text-3xl"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            {t('freelanceTimer.projectsTitle')}
          </h2>
          <Link
            href="/freelance/projects"
            className="text-xs uppercase tracking-[0.22em] text-stone/70 hover:text-coral"
          >
            {t('freelanceTimer.projectsAll')}
          </Link>
        </div>
        {projectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {list.slice(0, 6).map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                monthHours={monthHoursByProject.get(p.id) ?? 0}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <InsightCard
          insight={t(`freelanceTimer.${insightKey}`)}
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
      <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">{eyebrow}</span>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-editorial text-stone"
          style={{
            fontFamily: 'Fraunces, serif',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && <span className="text-xs uppercase tracking-[0.22em] text-stone/70">{unit}</span>}
      </div>
    </Card>
  );
}

function EmptyProjects() {
  const { t } = useLang();
  return (
    <Card className="flex flex-col items-center gap-5 py-14 text-center">
      <h3
        className="text-3xl font-medium tracking-editorial text-stone"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        {t('freelanceTimer.emptyTitle')}
      </h3>
      <p className="max-w-md text-sm text-stone/80">{t('freelanceTimer.emptyHint')}</p>
      <Link href="/freelance/projects/new">
        <Button variant="primary" size="md">
          {t('freelanceTimer.emptyCreate')}
        </Button>
      </Link>
    </Card>
  );
}
