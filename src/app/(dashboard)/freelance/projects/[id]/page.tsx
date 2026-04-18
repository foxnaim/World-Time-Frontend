'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Badge, Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { ProjectForm } from '@/components/dashboard/freelance/project-form';
import { InsightCard } from '@/components/dashboard/freelance/insight-card';

interface Project {
  id: string;
  name: string;
  description?: string | null;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency?: string | null;
  status: 'ACTIVE' | 'DONE' | 'ARCHIVED';
}

interface TimeEntry {
  id: string;
  projectId: string;
  startedAt: string;
  stoppedAt?: string | null;
  durationSec?: number | null;
  note?: string | null;
}

interface MonthlySummary {
  projectId: string;
  totalSeconds: number;
  declaredRate?: number | null;
  realHourlyRate?: number | null;
  insight: string;
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

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(ym: string): { from: string; to: string } {
  const [y, m] = ym.split('-').map(Number);
  const from = new Date(Date.UTC(y, m - 1, 1)).toISOString();
  const to = new Date(Date.UTC(y, m, 1)).toISOString();
  return { from, to };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatDuration(sec?: number | null): string {
  if (sec == null) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m} мин`;
  return `${h} ч ${String(m).padStart(2, '0')} мин`;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [edit, setEdit] = React.useState(false);
  const month = currentYearMonth();
  const { from, to } = React.useMemo(() => monthRange(month), [month]);

  const { data: project, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null,
    fetcher,
  );
  const { data: summary } = useSWR<MonthlySummary>(
    id ? `/api/projects/${id}/monthly-summary?month=${month}` : null,
    fetcher,
  );
  const { data: entries } = useSWR<TimeEntry[]>(
    id ? `/api/time-entries?projectId=${id}&from=${from}&to=${to}` : null,
    fetcher,
  );

  if (isLoading || !project) {
    return (
      <div className="py-8 md:py-12">
        <Card className="h-64 animate-pulse">
          <div className="h-4 w-32 rounded bg-stone/20" />
          <div className="mt-6 h-10 w-64 rounded bg-stone/20" />
        </Card>
      </div>
    );
  }

  const status = project.status || 'ACTIVE';
  const list = Array.isArray(entries) ? entries : [];

  return (
    <div className="flex flex-col gap-10 py-8 md:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/freelance/projects"
            className="text-xs uppercase tracking-[0.22em] text-stone/70 hover:text-coral"
          >
            ← К проектам
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <h1
              className="text-4xl font-medium tracking-editorial text-stone md:text-5xl"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {project.name}
            </h1>
            <Badge variant={STATUS_VARIANT[status] || 'neutral'}>
              {STATUS_LABEL[status] || status}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-3 max-w-2xl text-sm text-stone/80">
              {project.description}
            </p>
          )}
        </div>
        <Button
          variant={edit ? 'ghost' : 'outline'}
          size="md"
          onClick={() => setEdit((v) => !v)}
        >
          {edit ? 'Закрыть' : 'Редактировать'}
        </Button>
      </header>

      {edit ? (
        <ProjectForm
          mode="edit"
          projectId={project.id}
          initial={{
            name: project.name,
            description: project.description,
            hourlyRate: project.hourlyRate,
            fixedPrice: project.fixedPrice,
            currency: project.currency || 'RUB',
            status: project.status,
          }}
          onSaved={() => {
            setEdit(false);
            mutate();
          }}
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Card>
              <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
                Ставка заявлена
              </span>
              <div
                className="mt-3 text-4xl font-medium tracking-editorial text-stone md:text-5xl"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {project.hourlyRate != null
                  ? Math.round(project.hourlyRate).toLocaleString('ru-RU')
                  : project.fixedPrice != null
                    ? Math.round(project.fixedPrice).toLocaleString('ru-RU')
                    : '—'}
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone/70">
                {project.hourlyRate != null
                  ? `${project.currency || 'RUB'}/час`
                  : project.fixedPrice != null
                    ? `${project.currency || 'RUB'} фикс.`
                    : 'не указана'}
              </p>
            </Card>
            <Card>
              <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
                Часов в этом месяце
              </span>
              <div
                className="mt-3 text-4xl font-medium tracking-editorial text-stone md:text-5xl"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {summary ? (summary.totalSeconds / 3600).toFixed(1) : '0.0'}
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone/70">
                часов
              </p>
            </Card>
            <Card className="border-coral/40">
              <span className="text-[10px] uppercase tracking-[0.28em] text-coral">
                Реальная ставка
              </span>
              <div
                className="mt-3 text-4xl font-medium tracking-editorial text-stone md:text-5xl"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {summary?.realHourlyRate != null
                  ? Math.round(summary.realHourlyRate).toLocaleString('ru-RU')
                  : '—'}
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone/70">
                ₽/час фактически
              </p>
            </Card>
          </section>

          {summary?.insight && (
            <InsightCard
              insight={summary.insight}
              rate={summary.realHourlyRate ?? null}
            />
          )}

          <section>
            <h2
              className="mb-4 text-2xl font-medium tracking-editorial text-stone md:text-3xl"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Записи времени
            </h2>
            {list.length === 0 ? (
              <Card className="py-12 text-center">
                <p
                  className="text-2xl font-medium text-stone"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  Записей пока нет
                </p>
                <p className="mt-2 text-sm text-stone/70">
                  Запустите таймер, чтобы начать учёт.
                </p>
              </Card>
            ) : (
              <Card className="overflow-x-auto p-0">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="hairline-b text-left text-[10px] uppercase tracking-[0.22em] text-stone/70">
                      <th className="px-6 py-4 font-medium">Дата</th>
                      <th className="px-6 py-4 font-medium">Начало</th>
                      <th className="px-6 py-4 font-medium">Окончание</th>
                      <th className="px-6 py-4 text-right font-medium">
                        Длительность
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((e) => (
                      <tr
                        key={e.id}
                        className={cn(
                          'hairline-b transition-colors hover:bg-sand/30',
                          !e.stoppedAt && 'bg-coral/5',
                        )}
                      >
                        <td className="px-6 py-4 text-sm text-stone">
                          {formatDate(e.startedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-stone tabular-nums">
                          {formatTime(e.startedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-stone tabular-nums">
                          {e.stoppedAt ? formatTime(e.stoppedAt) : (
                            <span className="text-coral">идёт</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-stone tabular-nums">
                          {formatDuration(e.durationSec)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
