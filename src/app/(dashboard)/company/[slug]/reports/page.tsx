'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api';
import { MonthPicker } from '@/components/dashboard/company/month-picker';

type CompanyDetail = { id: string; slug: string; name: string };

type LateStatsResp = {
  items: Array<{
    employeeId: string;
    employeeName: string;
    lateCount: number;
    totalLateMinutes: number;
    avgLateMinutes: number;
  }>;
};

type OvertimeResp = {
  items: Array<{
    employeeId: string;
    employeeName: string;
    overtimeHours: number;
    nightHours?: number;
  }>;
};

type SummaryResp = {
  payouts?: Array<{
    employeeId: string;
    employeeName: string;
    baseSalary: number;
    overtimePay: number;
    deductions: number;
    total: number;
  }>;
};

type ExportResp = { url: string };

type TabKey = 'late' | 'overtime' | 'payouts';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'late', label: 'Опоздания' },
  { key: 'overtime', label: 'Переработки' },
  { key: 'payouts', label: 'Выплаты' },
];

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[#D8C3A5]/40', className)} />;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-[#E85A4F] tracking-tight">
        Не удалось загрузить. Попробуйте обновить.
      </p>
      <Button variant="ghost" size="sm" className="mt-3" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}

function Empty({ text }: { text?: string }) {
  return (
    <div className="py-14 text-center">
      <div className="text-3xl text-[#8E8D8A]/70" style={{ fontFamily: 'Fraunces, serif' }}>
        Пусто
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#8E8D8A]/50">
        {text ?? 'Нет данных за выбранный месяц'}
      </div>
    </div>
  );
}

function Table<T>({
  columns,
  rows,
  empty,
}: {
  columns: Array<{
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    render: (row: T) => React.ReactNode;
    width?: string;
  }>;
  rows: T[];
  empty?: string;
}) {
  if (rows.length === 0) return <Empty text={empty} />;
  const gridStyle = {
    gridTemplateColumns: columns.map((c) => c.width ?? '1fr').join(' '),
  };
  return (
    <div>
      <div
        className="grid items-center gap-4 px-4 py-3 border-b border-[#8E8D8A]/25 text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70"
        style={gridStyle}
      >
        {columns.map((c) => (
          <div
            key={c.key}
            className={cn(
              c.align === 'right' && 'text-right',
              c.align === 'center' && 'text-center',
            )}
          >
            {c.label}
          </div>
        ))}
      </div>
      <ul>
        {rows.map((row, i) => (
          <li
            key={i}
            className="grid items-center gap-4 px-4 py-3.5 border-b border-[#8E8D8A]/10 hover:bg-[#D8C3A5]/15 transition-colors"
            style={gridStyle}
          >
            {columns.map((c) => (
              <div
                key={c.key}
                className={cn(
                  c.align === 'right' && 'text-right',
                  c.align === 'center' && 'text-center',
                  'text-sm text-[#8E8D8A] truncate',
                )}
              >
                {c.render(row)}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [month, setMonth] = React.useState<string>(() => currentYearMonth());
  const [tab, setTab] = React.useState<TabKey>('late');
  const [exporting, setExporting] = React.useState(false);
  const [exportUrl, setExportUrl] = React.useState<string | null>(null);
  const [exportErr, setExportErr] = React.useState<string | null>(null);

  const { data: company } = useSWR<CompanyDetail>(slug ? `/api/companies/${slug}` : null, fetcher);
  const id = company?.id;

  const lateKey =
    id && tab === 'late' ? `/api/analytics/company/${id}/late-stats?month=${month}` : null;
  const overtimeKey =
    id && tab === 'overtime' ? `/api/analytics/company/${id}/overtime?month=${month}` : null;
  const summaryKey =
    id && tab === 'payouts' ? `/api/analytics/company/${id}/summary?month=${month}` : null;

  const lateQ = useSWR<LateStatsResp>(lateKey, fetcher);
  const overtimeQ = useSWR<OvertimeResp>(overtimeKey, fetcher);
  const summaryQ = useSWR<SummaryResp>(summaryKey, fetcher);

  const runExport = async () => {
    if (!id) return;
    setExporting(true);
    setExportErr(null);
    setExportUrl(null);
    try {
      const res = await api.post<ExportResp>(`/api/sheets/export/company/${id}/monthly`, { month });
      setExportUrl(res.url);
    } catch (err: unknown) {
      setExportErr(err instanceof Error ? err.message : 'Не удалось экспортировать');
    } finally {
      setExporting(false);
    }
  };

  const nf = new Intl.NumberFormat('ru-RU');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70">Отчёты</div>
          <h1
            className="mt-2 text-5xl md:text-6xl tracking-tight text-[#8E8D8A]"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            Сводка
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthPicker value={month} onChange={setMonth} />
          <Button variant="primary" onClick={runExport} disabled={exporting || !id}>
            {exporting ? 'Экспорт…' : 'Экспортировать в Google Sheets'}
          </Button>
        </div>
      </div>

      {(exportUrl || exportErr) && (
        <Card
          className="!py-4 !px-5 flex items-center justify-between gap-3"
          eyebrow={exportUrl ? 'Готово' : 'Ошибка'}
        >
          {exportUrl ? (
            <>
              <span className="text-sm text-[#8E8D8A] truncate">Таблица создана</span>
              <a
                href={exportUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#E98074] hover:text-[#E85A4F] underline underline-offset-4"
              >
                Открыть →
              </a>
            </>
          ) : (
            <span className="text-sm text-[#E85A4F]">{exportErr}</span>
          )}
        </Card>
      )}

      {/* Tabs */}
      <div className="inline-flex items-center gap-0 border border-[#8E8D8A]/25 rounded-full p-1 self-start bg-[#EAE7DC]">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-5 h-9 rounded-full text-[11px] uppercase tracking-[0.22em] transition-colors',
                active ? 'bg-[#E98074] text-[#EAE7DC]' : 'text-[#8E8D8A] hover:text-[#E98074]',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <Card className="!p-0 overflow-hidden">
        {tab === 'late' &&
          (lateQ.error ? (
            <ErrorState onRetry={() => lateQ.mutate()} />
          ) : !lateQ.data ? (
            <div className="p-6 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table
              columns={[
                {
                  key: 'name',
                  label: 'Сотрудник',
                  width: '1.6fr',
                  render: (r) => (
                    <span
                      className="text-base tracking-tight"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.employeeName}
                    </span>
                  ),
                },
                {
                  key: 'count',
                  label: 'Кол-во',
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-lg"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.lateCount}
                    </span>
                  ),
                },
                {
                  key: 'total',
                  label: 'Всего мин.',
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-lg text-[#E85A4F]"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.totalLateMinutes}
                    </span>
                  ),
                },
                {
                  key: 'avg',
                  label: 'Средн. мин.',
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-[#8E8D8A]"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.avgLateMinutes.toFixed(1)}
                    </span>
                  ),
                },
              ]}
              rows={lateQ.data.items ?? []}
            />
          ))}

        {tab === 'overtime' &&
          (overtimeQ.error ? (
            <ErrorState onRetry={() => overtimeQ.mutate()} />
          ) : !overtimeQ.data ? (
            <div className="p-6 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table
              columns={[
                {
                  key: 'name',
                  label: 'Сотрудник',
                  width: '1.6fr',
                  render: (r) => (
                    <span
                      className="text-base tracking-tight"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.employeeName}
                    </span>
                  ),
                },
                {
                  key: 'overtime',
                  label: 'Переработка, ч',
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-lg text-[#E98074]"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.overtimeHours.toFixed(1)}
                    </span>
                  ),
                },
                {
                  key: 'night',
                  label: 'Ночные, ч',
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-[#8E8D8A]"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {(r.nightHours ?? 0).toFixed(1)}
                    </span>
                  ),
                },
              ]}
              rows={overtimeQ.data.items ?? []}
            />
          ))}

        {tab === 'payouts' &&
          (summaryQ.error ? (
            <ErrorState onRetry={() => summaryQ.mutate()} />
          ) : !summaryQ.data ? (
            <div className="p-6 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table
              columns={[
                {
                  key: 'name',
                  label: 'Сотрудник',
                  width: '1.4fr',
                  render: (r) => (
                    <span
                      className="text-base tracking-tight"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.employeeName}
                    </span>
                  ),
                },
                {
                  key: 'base',
                  label: 'Оклад',
                  align: 'right',
                  render: (r) => <span className="tabular-nums">{nf.format(r.baseSalary)}</span>,
                },
                {
                  key: 'overtime',
                  label: 'Переработки',
                  align: 'right',
                  render: (r) => (
                    <span className="tabular-nums text-[#E98074]">+{nf.format(r.overtimePay)}</span>
                  ),
                },
                {
                  key: 'deductions',
                  label: 'Удержания',
                  align: 'right',
                  render: (r) => (
                    <span className="tabular-nums text-[#E85A4F]">−{nf.format(r.deductions)}</span>
                  ),
                },
                {
                  key: 'total',
                  label: 'Итого',
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-xl"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {nf.format(r.total)}
                    </span>
                  ),
                },
              ]}
              rows={summaryQ.data.payouts ?? []}
              empty="Нет данных по выплатам"
            />
          ))}
      </Card>
    </div>
  );
}
