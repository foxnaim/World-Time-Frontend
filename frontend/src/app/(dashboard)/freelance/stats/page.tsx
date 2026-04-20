'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Card } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { useLang } from '@/i18n/context';

interface Project {
  id: string;
  name: string;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  status: string;
}

interface RateHistoryPoint {
  month: string;
  periodStart: string;
  periodEnd: string;
  totalSeconds: number;
  totalIncome: number;
  effectiveRate: number;
  currency: string;
}

interface RealRate {
  effectiveRate: number;
  totalSeconds: number;
  totalIncome: number;
  periodStart?: string;
  periodEnd?: string;
}

type MonthKey =
  | 'monthJan'
  | 'monthFeb'
  | 'monthMar'
  | 'monthApr'
  | 'monthMay'
  | 'monthJun'
  | 'monthJul'
  | 'monthAug'
  | 'monthSep'
  | 'monthOct'
  | 'monthNov'
  | 'monthDec';

const MONTH_KEYS: MonthKey[] = [
  'monthJan',
  'monthFeb',
  'monthMar',
  'monthApr',
  'monthMay',
  'monthJun',
  'monthJul',
  'monthAug',
  'monthSep',
  'monthOct',
  'monthNov',
  'monthDec',
];

interface MonthSlot {
  key: string;
  labelKey: MonthKey;
}

function lastSixMonths(): MonthSlot[] {
  const out: MonthSlot[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ key, labelKey: MONTH_KEYS[d.getMonth()] });
  }
  return out;
}

/**
 * Batch fetches user real-hourly-rate for the last 6 months by rendering
 * a fixed set of invisible fetcher components. Each child runs exactly
 * one `useSWR` call → hook order stays stable across renders.
 */
function MonthRateFetcher({
  monthKey,
  onData,
}: {
  monthKey: string;
  onData: (key: string, data: RealRate | undefined) => void;
}) {
  const { data } = useSWR<RealRate>(
    `/api/analytics/user/real-hourly-rate?month=${monthKey}`,
    fetcher,
  );
  React.useEffect(() => {
    onData(monthKey, data);
  }, [monthKey, data, onData]);
  return null;
}


export default function StatsPage() {
  const { t } = useLang();
  const months = React.useMemo<MonthSlot[]>(() => lastSixMonths(), []);
  const [rates, setRates] = React.useState<Record<string, RealRate | undefined>>({});
  const onRate = React.useCallback((key: string, data: RealRate | undefined) => {
    setRates((prev) => (prev[key] === data ? prev : { ...prev, [key]: data }));
  }, []);

  const { data: projects } = useSWR<Project[]>('/api/projects', fetcher);
  const projectList = Array.isArray(projects)
    ? projects.filter((p) => p.status !== 'ARCHIVED')
    : [];

  const hoursByMonth = months.map((m) => {
    const r = rates[m.key];
    return {
      key: m.key,
      label: t(`freelanceStats.${m.labelKey}`),
      hours: (r?.totalSeconds ?? 0) / 3600,
      rate: r?.effectiveRate ?? 0,
    };
  });
  const maxHours = Math.max(1, ...hoursByMonth.map((h) => h.hours));
  const maxRate = Math.max(1, ...hoursByMonth.map((h) => h.rate));

  return (
    <div className="flex flex-col gap-10 py-8 md:py-12">
      {months.map((m) => (
        <MonthRateFetcher key={m.key} monthKey={m.key} onData={onRate} />
      ))}

      <header>
        <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
          {t('freelanceStats.eyebrow')}
        </span>
        <h1
          className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-editorial text-stone"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {t('freelanceStats.pageTitle')}
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title={t('freelanceStats.hoursCardTitle')} eyebrow={t('freelanceStats.hoursCardEyebrow')}>
          <BarChart
            data={hoursByMonth.map((h) => ({
              label: h.label,
              value: h.hours,
              display: h.hours.toFixed(1),
            }))}
            max={maxHours}
            color="#E98074"
          />
        </Card>

        <Card title={t('freelanceStats.rateCardTitle')} eyebrow={t('freelanceStats.rateCardEyebrow')}>
          <BarChart
            data={hoursByMonth.map((h) => ({
              label: h.label,
              value: h.rate,
              display: h.rate > 0 ? Math.round(h.rate).toLocaleString('ru-RU') : '—',
            }))}
            max={maxRate}
            color="#8E8D8A"
          />
        </Card>
      </div>

      <section>
        <h2
          className="mb-4 text-2xl font-medium tracking-editorial text-stone md:text-3xl"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {t('freelanceStats.projectRateSectionTitle')}
        </h2>
        {projectList.length === 0 ? (
          <Card className="py-12 text-center text-sm text-stone/70">
            {t('freelanceStats.noActiveProjects')}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {projectList.map((p) => (
              <ProjectRateHistory key={p.id} project={p} months={months} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Per-project 6-month rate history. One SWR call per project (the backend
 * does the bucketing) instead of six per-month fetches — cuts request volume
 * from 6N → N and keeps us well under the per-user rate limiter.
 */
function ProjectRateHistory({ project, months }: { project: Project; months: MonthSlot[] }) {
  const { t } = useLang();
  const { data, error } = useSWR<RateHistoryPoint[]>(
    `/api/analytics/user/project/${project.id}/rate-history?months=${months.length}`,
    fetcher,
  );

  const byMonth = React.useMemo(() => {
    const m = new Map<string, RateHistoryPoint>();
    if (Array.isArray(data)) {
      for (const p of data) m.set(p.month, p);
    }
    return m;
  }, [data]);

  const series = months.map((m) => {
    const s = byMonth.get(m.key);
    // A point with seconds > 0 but effectiveRate = 0 happens for
    // un-priced projects (no hourlyRate, not yet DONE) — show "—" so the
    // user sees "untracked income" rather than a misleading 0 ₽/ч.
    const hasRate = s != null && s.totalSeconds > 0 && s.effectiveRate > 0;
    return {
      label: t(`freelanceStats.${m.labelKey}`),
      value: hasRate ? s!.effectiveRate : 0,
      display: hasRate ? Math.round(s!.effectiveRate).toLocaleString('ru-RU') : '—',
    };
  });
  const max = Math.max(1, project.hourlyRate || 0, ...series.map((s) => s.value));

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h4 className="text-lg font-medium text-stone" style={{ fontFamily: 'Fraunces, serif' }}>
          {project.name}
        </h4>
        {project.hourlyRate != null && (
          <span className="text-[10px] uppercase tracking-[0.22em] text-stone/70">
            {t('freelanceStats.rateGoalLabel', { rate: Math.round(project.hourlyRate) })}
          </span>
        )}
      </div>
      <div className="mt-4">
        {error ? (
          <p className="py-6 text-center text-xs text-stone/60">
            {t('freelanceStats.loadHistoryError')}
          </p>
        ) : (
          <BarChart
            data={series}
            max={max}
            color="#E98074"
            refLine={project.hourlyRate || undefined}
          />
        )}
      </div>
    </Card>
  );
}

interface BarChartProps {
  data: { label: string; value: number; display: string }[];
  max: number;
  color: string;
  refLine?: number;
}

/**
 * Minimal inline SVG bar chart — no chart lib. Renders bars with labels
 * below and numeric values on top; optional `refLine` draws a dashed
 * target line (used for per-project declared rate).
 */
function BarChart({ data, max, color, refLine }: BarChartProps) {
  const w = 560;
  const h = 180;
  const padL = 8;
  const padR = 8;
  const padT = 24;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const barGap = 8;
  const n = data.length;
  const barW = (innerW - barGap * (n - 1)) / Math.max(1, n);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="bar chart">
      <line
        x1={padL}
        x2={w - padR}
        y1={h - padB}
        y2={h - padB}
        stroke="#8E8D8A"
        strokeOpacity={0.25}
        strokeWidth={1}
      />
      {refLine != null && refLine > 0 && (
        <line
          x1={padL}
          x2={w - padR}
          y1={h - padB - (Math.min(refLine, max) / max) * innerH}
          y2={h - padB - (Math.min(refLine, max) / max) * innerH}
          stroke="#8E8D8A"
          strokeOpacity={0.4}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}
      {data.map((d, i) => {
        const x = padL + i * (barW + barGap);
        const bh = max > 0 ? (d.value / max) * innerH : 0;
        const y = h - padB - bh;
        return (
          <g key={d.label + i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(0, bh)}
              rx={4}
              fill={color}
              fillOpacity={d.value > 0 ? 0.9 : 0.15}
            />
            <text
              x={x + barW / 2}
              y={Math.max(y - 6, padT - 4)}
              textAnchor="middle"
              fontFamily="Fraunces, serif"
              fontSize="11"
              fill="#8E8D8A"
            >
              {d.display}
            </text>
            <text
              x={x + barW / 2}
              y={h - padB + 16}
              textAnchor="middle"
              fontSize="10"
              letterSpacing="0.12em"
              fill="#8E8D8A"
              fillOpacity={0.8}
            >
              {d.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
