'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { api, ApiError } from '@/lib/api';
import { MonthPicker } from '@/components/dashboard/company/month-picker';
import { useLang } from '@/i18n/context';

type CompanyDetail = { id: string; slug: string; name: string };

// Backend returns arrays (CompanyLateStats[], OvertimeReport[],
// CompanyPayoutRow[]) and uses `name` for the full-name field. Don't wrap in
// `{ items: [] }` — that was the previous shape, and an incorrect one.
type LateStatsRow = {
  employeeId: string;
  name: string;
  lateCount: number;
  totalLateMinutes: number;
  avgLateMinutes: number;
};

type OvertimeRow = {
  employeeId: string;
  name: string;
  overtimeHours: number;
  nightHours?: number;
};

type PayoutRow = {
  employeeId: string;
  name: string;
  baseSalary: number;
  overtimePay: number;
  deductions: number;
  total: number;
};

// Sheets export result: backend returns `spreadsheetUrl`, but we accept a
// plain `url` too for forward-compatibility with older builds.
type ExportResp = { spreadsheetUrl?: string; url?: string };

type TabKey = 'late' | 'overtime' | 'payouts';

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[#D8C3A5]/40', className)} />;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useLang();
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-[#E85A4F] tracking-tight">
        {t('reports.loadError')}
      </p>
      <Button variant="ghost" size="sm" className="mt-3" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  );
}

function Empty({ text }: { text?: string }) {
  const { t } = useLang();
  return (
    <div className="py-14 text-center">
      <div className="text-3xl text-[#6b6966]" style={{ fontFamily: 'Fraunces, serif' }}>
        {t('common.empty')}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#6b6966]">
        {text ?? t('common.noDataHint')}
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
        className="grid items-center gap-4 px-4 py-3 border-b border-[#8E8D8A]/25 text-[10px] uppercase tracking-[0.28em] text-[#6b6966]"
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
                  'text-sm text-[#3d3b38] truncate',
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
  const { t } = useLang();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const TABS: { key: TabKey; label: string }[] = [
    { key: 'late', label: t('reports.tabLate') },
    { key: 'overtime', label: t('reports.tabOvertime') },
    { key: 'payouts', label: t('reports.tabPayouts') },
  ];
  const [month, setMonth] = React.useState<string>(() => currentYearMonth());
  const [tab, setTab] = React.useState<TabKey>('late');
  const [exporting, setExporting] = React.useState(false);
  const [exportUrl, setExportUrl] = React.useState<string | null>(null);
  const [exportErr, setExportErr] = React.useState<string | null>(null);
  const [showLink, setShowLink] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linking, setLinking] = React.useState(false);
  const { data: svcAccount } = useSWR<{ email: string | null }>('/api/sheets/service-account', fetcher);

  const { data: company } = useSWR<CompanyDetail>(slug ? `/api/companies/${slug}` : null, fetcher);
  const id = company?.id;

  const lateKey =
    id && tab === 'late' ? `/api/analytics/company/${id}/late-stats?month=${month}` : null;
  const overtimeKey =
    id && tab === 'overtime' ? `/api/analytics/company/${id}/overtime?month=${month}` : null;
  const payoutsKey =
    id && tab === 'payouts' ? `/api/analytics/company/${id}/payouts?month=${month}` : null;

  const lateQ = useSWR<LateStatsRow[]>(lateKey, fetcher);
  const overtimeQ = useSWR<OvertimeRow[]>(overtimeKey, fetcher);
  const payoutsQ = useSWR<PayoutRow[]>(payoutsKey, fetcher);

  const runExport = async () => {
    if (!id) return;
    setExporting(true);
    setExportErr(null);
    setExportUrl(null);
    try {
      const res = await api.post<ExportResp>(`/api/sheets/export/company/${id}/monthly`, { month });
      const url = res.spreadsheetUrl ?? res.url ?? null;
      if (!url) throw new Error(t('reports.exportError'));
      setExportUrl(url);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 501) {
        setExportErr(t('reports.exportNotConfigured'));
      } else {
        const msg = err instanceof Error ? err.message : t('reports.exportError');
        setExportErr(msg);
        if (/Создайте Google Таблицу|каллер|caller does not have permission/i.test(msg)) {
          setShowLink(true);
        }
      }
    } finally {
      setExporting(false);
    }
  };

  const linkManual = async () => {
    if (!id || !linkUrl.trim()) return;
    setLinking(true);
    setExportErr(null);
    try {
      await api.post(`/api/sheets/company/${id}/link`, { url: linkUrl.trim() });
      setShowLink(false);
      setLinkUrl('');
      await runExport();
    } catch (err: unknown) {
      setExportErr(err instanceof Error ? err.message : t('reports.linkManualError'));
    } finally {
      setLinking(false);
    }
  };

  const nf = new Intl.NumberFormat('ru-RU');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">{t('reports.eyebrow')}</div>
          <h1
            className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#3d3b38]"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            {t('reports.title')}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthPicker value={month} onChange={setMonth} />
          <Button variant="primary" onClick={runExport} disabled={exporting || !id}>
            {exporting ? t('reports.exporting') : t('reports.export')}
          </Button>
        </div>
      </div>

      {(exportUrl || exportErr) && (
        <Card
          className="!py-4 !px-5"
          eyebrow={exportUrl ? t('common.done') : t('common.error')}
        >
          {exportUrl ? (
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <span className="text-sm text-[#3d3b38]">{t('reports.exportDone')}</span>
              <a
                href={exportUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#E98074] hover:text-[#E85A4F] underline underline-offset-4"
              >
                {t('reports.exportOpen')}
              </a>
            </div>
          ) : (
            <span className="text-sm text-[#E85A4F]">{exportErr}</span>
          )}
        </Card>
      )}

      {showLink && svcAccount?.email && (
        <Card className="!py-5 !px-5 flex flex-col gap-3" eyebrow={t('reports.linkManualTitle')}>
          <div className="text-sm text-[#3d3b38] leading-relaxed">
            {t('reports.linkManualStep1')}{' '}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="text-[#E98074] hover:text-[#E85A4F] underline underline-offset-4"
            >
              sheets.new
            </a>
            <br />
            {t('reports.linkManualStep2')}
            <br />
            <code className="mt-1 inline-block bg-[#D8C3A5]/30 px-2 py-1 rounded text-[#3d3b38] text-xs select-all">
              {svcAccount.email}
            </code>
            <br />
            {t('reports.linkManualStep3')}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={t('reports.linkManualUrlPlaceholder')}
              className="flex-1 px-3 py-2 rounded border border-[#8E8D8A]/30 bg-[#EAE7DC] text-sm text-[#3d3b38]"
            />
            <Button
              variant="primary"
              onClick={linkManual}
              disabled={linking || !linkUrl.trim()}
            >
              {linking ? t('reports.linkingManual') : t('reports.linkManualButton')}
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="inline-flex items-center gap-0 border border-[#8E8D8A]/25 rounded-full p-1 self-start bg-[#EAE7DC]">
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={cn(
                'px-5 h-9 rounded-full text-[11px] uppercase tracking-[0.22em] transition-colors',
                active ? 'bg-[#E98074] text-[#EAE7DC]' : 'text-[#3d3b38] hover:text-[#E98074]',
              )}
            >
              {tb.label}
            </button>
          );
        })}
      </div>

      <Card className="!p-0 overflow-hidden overflow-x-auto">
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
                  label: t('reports.colEmployee'),
                  width: '1.6fr',
                  render: (r) => (
                    <span
                      className="text-base tracking-tight"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.name}
                    </span>
                  ),
                },
                {
                  key: 'count',
                  label: t('reports.colLateCount'),
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
                  label: t('reports.colLateTotal'),
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
                  label: t('reports.colLateAvg'),
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-[#3d3b38]"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.avgLateMinutes.toFixed(1)}
                    </span>
                  ),
                },
              ]}
              rows={lateQ.data ?? []}
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
                  label: t('reports.colEmployee'),
                  width: '1.6fr',
                  render: (r) => (
                    <span
                      className="text-base tracking-tight"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.name}
                    </span>
                  ),
                },
                {
                  key: 'overtime',
                  label: t('reports.colOvertimeHours'),
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
                  label: t('reports.colNightHours'),
                  align: 'right',
                  render: (r) => (
                    <span
                      className="tabular-nums text-[#3d3b38]"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {(r.nightHours ?? 0).toFixed(1)}
                    </span>
                  ),
                },
              ]}
              rows={overtimeQ.data ?? []}
            />
          ))}

        {tab === 'payouts' &&
          (payoutsQ.error ? (
            <ErrorState onRetry={() => payoutsQ.mutate()} />
          ) : !payoutsQ.data ? (
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
                  label: t('reports.colEmployee'),
                  width: '1.4fr',
                  render: (r) => (
                    <span
                      className="text-base tracking-tight"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {r.name}
                    </span>
                  ),
                },
                {
                  key: 'base',
                  label: t('reports.colBaseSalary'),
                  align: 'right',
                  render: (r) => <span className="tabular-nums">{nf.format(r.baseSalary)}</span>,
                },
                {
                  key: 'overtime',
                  label: t('reports.colOvertimePay'),
                  align: 'right',
                  render: (r) => (
                    <span className="tabular-nums text-[#E98074]">+{nf.format(r.overtimePay)}</span>
                  ),
                },
                {
                  key: 'deductions',
                  label: t('reports.colDeductions'),
                  align: 'right',
                  render: (r) => (
                    <span className="tabular-nums text-[#E85A4F]">−{nf.format(r.deductions)}</span>
                  ),
                },
                {
                  key: 'total',
                  label: t('reports.colTotal'),
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
              rows={payoutsQ.data ?? []}
              empty={t('reports.emptyPayouts')}
            />
          ))}
      </Card>
    </div>
  );
}
