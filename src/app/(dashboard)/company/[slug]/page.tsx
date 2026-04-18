'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { KpiCard } from '@/components/dashboard/company/kpi-card';
import { RankingList, type RankingEntry } from '@/components/dashboard/company/ranking-list';

type CompanyDetail = {
  id: string;
  slug: string;
  name: string;
  address?: string;
};

type SummaryResp = {
  employees: number;
  avgLateMinutes: number;
  overtimeHours: number;
  punctualityScore: number;
  prev?: {
    employees?: number;
    avgLateMinutes?: number;
    overtimeHours?: number;
    punctualityScore?: number;
  };
};

type LateStatsResp = {
  recent: Array<{
    id: string;
    employeeName: string;
    at: string; // ISO
    lateMinutes: number;
  }>;
};

type RankingResp = { items: RankingEntry[] };

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function delta(curr?: number, prev?: number) {
  if (curr == null || prev == null) return null;
  return Number((curr - prev).toFixed(1));
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-[#E85A4F] tracking-tight">
        Не удалось загрузить. Попробуйте обновить.
      </p>
      <Button variant="ghost" size="sm" className="mt-3" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[#D8C3A5]/40', className)} />;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export default function CompanyOverviewPage() {
  const params = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const month = sp?.get('month') ?? currentYearMonth();
  const slug = params?.slug;

  const {
    data: company,
    error: companyErr,
    mutate: refreshCompany,
  } = useSWR<CompanyDetail>(slug ? `/api/companies/${slug}` : null, fetcher);

  const id = company?.id;

  const {
    data: summary,
    error: summaryErr,
    mutate: refreshSummary,
  } = useSWR<SummaryResp>(
    id ? `/api/analytics/company/${id}/summary?month=${month}` : null,
    fetcher,
  );

  const {
    data: ranking,
    error: rankingErr,
    mutate: refreshRanking,
  } = useSWR<RankingResp>(
    id ? `/api/analytics/company/${id}/ranking?month=${month}` : null,
    fetcher,
  );

  const {
    data: late,
    error: lateErr,
    mutate: refreshLate,
  } = useSWR<LateStatsResp>(
    id ? `/api/analytics/company/${id}/late-stats?month=${month}` : null,
    fetcher,
  );

  const headerTitle = company?.name ?? '—';

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70">
            Обзор · {month}
          </div>
          {companyErr ? (
            <div className="mt-3">
              <ErrorState onRetry={() => refreshCompany()} />
            </div>
          ) : !company ? (
            <Skeleton className="mt-4 h-12 w-72" />
          ) : (
            <h1
              className="mt-2 text-5xl md:text-6xl tracking-tight text-[#8E8D8A]"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
            >
              {headerTitle}
            </h1>
          )}
          {company?.address && (
            <div className="mt-2 text-sm text-[#8E8D8A]/80">{company.address}</div>
          )}
        </div>
      </div>

      {/* KPI row */}
      <section
        className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Показатели"
      >
        <KpiCard
          eyebrow="Сотрудников"
          value={summary?.employees ?? 0}
          delta={delta(summary?.employees, summary?.prev?.employees)}
          loading={!summary && !summaryErr}
          caption="в штате"
        />
        <KpiCard
          eyebrow="Среднее опоздание"
          value={(summary?.avgLateMinutes ?? 0).toFixed(0)}
          suffix="мин"
          delta={delta(summary?.avgLateMinutes, summary?.prev?.avgLateMinutes)}
          invertSemantic
          loading={!summary && !summaryErr}
          caption="за месяц"
        />
        <KpiCard
          eyebrow="Переработки"
          value={(summary?.overtimeHours ?? 0).toFixed(1)}
          suffix="ч"
          delta={delta(summary?.overtimeHours, summary?.prev?.overtimeHours)}
          loading={!summary && !summaryErr}
          caption="за месяц"
        />
        <KpiCard
          eyebrow="Punctuality"
          value={(summary?.punctualityScore ?? 0).toFixed(0)}
          suffix="score"
          delta={delta(summary?.punctualityScore, summary?.prev?.punctualityScore)}
          loading={!summary && !summaryErr}
          caption="0 – 100"
        />
      </section>

      {summaryErr && <ErrorState onRetry={() => refreshSummary()} />}

      {/* Two column */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card eyebrow="Топ-5 самых пунктуальных" title="Люди месяца">
          {rankingErr ? (
            <ErrorState onRetry={() => refreshRanking()} />
          ) : !ranking ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-5 py-3">
                  <Skeleton className="h-8 w-10" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <RankingList items={ranking.items ?? []} max={5} />
          )}
        </Card>

        <Card eyebrow="Последние опоздания" title="Лента">
          {lateErr ? (
            <ErrorState onRetry={() => refreshLate()} />
          ) : !late ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (late.recent?.length ?? 0) === 0 ? (
            <div className="py-10 text-center">
              <div className="text-3xl text-[#8E8D8A]/70" style={{ fontFamily: 'Fraunces, serif' }}>
                Пусто
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#8E8D8A]/50">
                За этот месяц опозданий не было
              </div>
            </div>
          ) : (
            <ul className="flex flex-col">
              {late.recent.map((r, i) => (
                <li
                  key={r.id}
                  className={cn(
                    'grid grid-cols-[auto_1fr_auto] items-center gap-5 py-3.5',
                    i !== late.recent.length - 1 && 'border-b border-[#8E8D8A]/15',
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span
                      className="text-lg text-[#8E8D8A] tabular-nums"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {formatTime(r.at)}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]/50">
                      {formatDateShort(r.at)}
                    </span>
                  </div>
                  <div
                    className="text-base text-[#8E8D8A] truncate"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {r.employeeName}
                  </div>
                  <div
                    className="text-xl tabular-nums text-[#E85A4F]"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    +{r.lateMinutes}
                    <span className="ml-1 text-[10px] uppercase tracking-[0.22em] text-[#E85A4F]/70">
                      мин
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
