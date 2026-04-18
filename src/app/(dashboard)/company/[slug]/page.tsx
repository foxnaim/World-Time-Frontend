'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { KpiCard } from '@/components/dashboard/company/kpi-card';
import { RankingList, type RankingEntry } from '@/components/dashboard/company/ranking-list';

// ---------------------------------------------------------------------------
// Backend response shapes
//
// Kept in sync with `AnalyticsController` + `CompanyController`:
//   GET /companies/:slug                        -> CompanyDetail
//   GET /analytics/company/:id/summary?month=   -> CompanySummary (aggregate)
//   GET /analytics/company/:id/ranking?month=   -> CompanyRanking[]
//   GET /analytics/company/:id/late-stats?month -> CompanyLateStats[]
//
// The page adapts these raw shapes into the view-model the UI components
// expect (KpiCard, RankingList, recent-lates feed).
// ---------------------------------------------------------------------------

type CompanyDetail = {
  id: string;
  slug: string;
  name: string;
  address?: string;
};

type CompanySummary = {
  totalEmployees: number;
  avgLateMinutes: number;
  totalLateCount: number;
  totalOvertimeHours: number;
  punctualityScore: number;
};

type CompanyRankingRow = {
  rank: number;
  employeeId: string;
  name: string;
  punctualityScore: number;
};

type CompanyLateStatsRow = {
  employeeId: string;
  name: string;
  lateCount: number;
  avgLateMinutes: number;
  totalLateMinutes: number;
};

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Shift a YYYY-MM key by N months (negative = into the past). Used to
 * fetch the previous month so KPI cards can show month-over-month deltas.
 */
function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map((x) => Number(x));
  if (!y || !m) return ym;
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function diff(curr?: number, prev?: number) {
  if (curr == null || prev == null) return null;
  return Number((curr - prev).toFixed(1));
}

function ErrorState({ onRetry, label }: { onRetry: () => void; label?: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-[#E85A4F] tracking-tight">
        {label ?? 'Не удалось загрузить. Попробуйте обновить.'}
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

export default function CompanyOverviewPage() {
  const params = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const month = sp?.get('month') ?? currentYearMonth();
  const prevMonth = shiftMonth(month, -1);
  const slug = params?.slug;

  // 1) Resolve slug -> company (id is needed for every analytics endpoint).
  const {
    data: company,
    error: companyErr,
    mutate: refreshCompany,
  } = useSWR<CompanyDetail>(slug ? `/api/companies/${slug}` : null, fetcher);

  const id = company?.id;

  // 2) Current-month aggregate summary.
  const {
    data: summary,
    error: summaryErr,
    mutate: refreshSummary,
  } = useSWR<CompanySummary>(
    id ? `/api/analytics/company/${id}/summary?month=${month}` : null,
    fetcher,
  );

  // 2b) Previous-month summary (delta source). Fetched in parallel; if it
  // fails we just render cards without arrows — never block the page.
  const { data: summaryPrev } = useSWR<CompanySummary>(
    id ? `/api/analytics/company/${id}/summary?month=${prevMonth}` : null,
    fetcher,
    { shouldRetryOnError: false },
  );

  // 3) Ranking — backend returns a raw array.
  const {
    data: ranking,
    error: rankingErr,
    mutate: refreshRanking,
  } = useSWR<CompanyRankingRow[]>(
    id ? `/api/analytics/company/${id}/ranking?month=${month}&limit=5` : null,
    fetcher,
  );

  // 4) Late stats — backend returns per-employee aggregates (not a
  // chronological feed of check-ins). We present it as "most-late employees
  // this month" which is still a useful, real-data feed.
  const {
    data: late,
    error: lateErr,
    mutate: refreshLate,
  } = useSWR<CompanyLateStatsRow[]>(
    id ? `/api/analytics/company/${id}/late-stats?month=${month}` : null,
    fetcher,
  );

  // ------- Derived view models -------
  const rankingItems: RankingEntry[] = React.useMemo(() => {
    if (!ranking) return [];
    return ranking.map((r) => ({
      employeeId: r.employeeId,
      name: r.name,
      score: r.punctualityScore,
    }));
  }, [ranking]);

  const lateFeed = React.useMemo(() => {
    if (!late) return [];
    return [...late]
      .filter((r) => r.lateCount > 0)
      .sort((a, b) => b.totalLateMinutes - a.totalLateMinutes);
  }, [late]);

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
              <ErrorState
                onRetry={() => refreshCompany()}
                label="Компания не найдена или нет доступа."
              />
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
          value={summary?.totalEmployees ?? 0}
          delta={diff(summary?.totalEmployees, summaryPrev?.totalEmployees)}
          loading={!summary && !summaryErr}
          caption="в штате"
        />
        <KpiCard
          eyebrow="Среднее опоздание"
          value={(summary?.avgLateMinutes ?? 0).toFixed(0)}
          suffix="мин"
          delta={diff(summary?.avgLateMinutes, summaryPrev?.avgLateMinutes)}
          invertSemantic
          loading={!summary && !summaryErr}
          caption="за месяц"
        />
        <KpiCard
          eyebrow="Переработки"
          value={(summary?.totalOvertimeHours ?? 0).toFixed(1)}
          suffix="ч"
          delta={diff(summary?.totalOvertimeHours, summaryPrev?.totalOvertimeHours)}
          loading={!summary && !summaryErr}
          caption="за месяц"
        />
        <KpiCard
          eyebrow="Punctuality"
          value={(summary?.punctualityScore ?? 0).toFixed(0)}
          suffix="score"
          delta={diff(summary?.punctualityScore, summaryPrev?.punctualityScore)}
          loading={!summary && !summaryErr}
          caption="0 – 100"
        />
      </section>

      {summaryErr && (
        <ErrorState
          onRetry={() => refreshSummary()}
          label="Не удалось загрузить сводку за месяц."
        />
      )}

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
            <RankingList items={rankingItems} max={5} />
          )}
        </Card>

        <Card eyebrow="Опоздания за месяц" title="Лента">
          {lateErr ? (
            <ErrorState onRetry={() => refreshLate()} />
          ) : !late ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : lateFeed.length === 0 ? (
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
              {lateFeed.map((r, i) => (
                <li
                  key={r.employeeId}
                  className={cn(
                    'grid grid-cols-[auto_1fr_auto] items-center gap-5 py-3.5',
                    i !== lateFeed.length - 1 && 'border-b border-[#8E8D8A]/15',
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span
                      className="text-lg text-[#8E8D8A] tabular-nums"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.lateCount}×
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]/50">
                      опозданий
                    </span>
                  </div>
                  <div
                    className="text-base text-[#8E8D8A] truncate"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {r.name}
                  </div>
                  <div
                    className="text-xl tabular-nums text-[#E85A4F]"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    +{Math.round(r.avgLateMinutes)}
                    <span className="ml-1 text-[10px] uppercase tracking-[0.22em] text-[#E85A4F]/70">
                      мин/раз
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
