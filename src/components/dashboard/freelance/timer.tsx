'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api';
import { useElapsed, formatElapsed } from '@/hooks/use-elapsed';

export interface TimerProject {
  id: string;
  name: string;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency?: string | null;
  status?: string;
}

export interface ActiveEntry {
  id: string;
  projectId: string;
  startedAt: string;
  project?: TimerProject | null;
}

export interface TimerProps {
  /** All projects, used to populate the "start" dropdown when no timer is active. */
  projects?: TimerProject[];
  className?: string;
  /** Preselected project id when starting a new timer. */
  defaultProjectId?: string;
}

/**
 * Core timer UI for the freelance dashboard. Reads `/time-entries/active`
 * via SWR, renders HH:MM:SS elapsed live, and exposes start/stop mutations.
 *
 * UX:
 *  - Stop confirms if duration < 60s (anti-accident).
 *  - Start warns if another timer is already active; "Переключить" calls
 *    start — the backend auto-stops the previous entry.
 */
export const Timer: React.FC<TimerProps> = ({
  projects = [],
  className,
  defaultProjectId,
}) => {
  const { data: active, mutate, isLoading } = useSWR<ActiveEntry | null>(
    '/api/time-entries/active',
    fetcher,
  );

  const [selectedId, setSelectedId] = React.useState<string>(
    defaultProjectId || projects[0]?.id || '',
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedId && projects.length > 0) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const elapsed = useElapsed(active?.startedAt);

  const handleStart = async (projectId: string) => {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    try {
      await api.post('/api/time-entries/start', { projectId });
      await mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось запустить таймер');
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    if (!active) return;
    if (elapsed < 60) {
      const ok = window.confirm(
        'Таймер идёт меньше минуты. Всё равно остановить?',
      );
      if (!ok) return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/time-entries/${active.id}/stop`, {});
      await mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось остановить таймер');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('min-h-[180px] animate-pulse bg-cream/40', className)}>
        <div className="h-4 w-24 rounded bg-stone/20" />
        <div className="mt-6 h-16 w-64 rounded bg-stone/20" />
      </Card>
    );
  }

  if (active) {
    const projectName =
      active.project?.name ||
      projects.find((p) => p.id === active.projectId)?.name ||
      'Проект';

    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
              Идёт работа
            </span>
            <h3
              className="mt-1 text-xl font-medium tracking-editorial text-stone md:text-2xl"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {projectName}
            </h3>
            <div
              className="mt-4 text-5xl font-medium tracking-editorial text-stone md:text-6xl"
              style={{
                fontFamily: 'Fraunces, serif',
                fontVariantNumeric: 'tabular-nums',
              }}
              aria-live="polite"
            >
              {formatElapsed(elapsed)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStop}
              disabled={busy}
              className="bg-red hover:bg-red/90"
            >
              Остановить
            </Button>
          </div>
        </div>
        {error && (
          <p className="mt-4 text-xs text-red" role="alert">
            {error}
          </p>
        )}
      </Card>
    );
  }

  // No active entry
  const hasProjects = projects.length > 0;

  return (
    <Card className={cn(className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
            Таймер
          </span>
          <h3
            className="mt-1 text-xl font-medium tracking-editorial text-stone md:text-2xl"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Начать работу
          </h3>
          {hasProjects ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="timer-project">
                Проект
              </label>
              <select
                id="timer-project"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className={cn(
                  'h-10 min-w-[220px] rounded-full border border-stone/30 bg-cream px-4',
                  'text-sm text-stone focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40',
                )}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStart(selectedId)}
                disabled={busy || !selectedId}
              >
                Старт
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone/80">
              Создайте проект, чтобы начать учёт времени.
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-4 text-xs text-red" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
};

Timer.displayName = 'Timer';
