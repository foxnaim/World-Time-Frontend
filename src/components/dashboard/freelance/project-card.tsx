'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Badge, Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api';
import type { ActiveEntry } from './timer';

export interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    hourlyRate?: number | null;
    fixedPrice?: number | null;
    currency?: string | null;
    status?: string;
  };
  /** Hours tracked on this project for the current month. */
  monthHours?: number;
  /** Target hours this month (for bar fill). Defaults to 40h/week ~ 160h/month. */
  monthTarget?: number;
  className?: string;
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

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  monthHours = 0,
  monthTarget = 160,
  className,
}) => {
  const { data: active, mutate } = useSWR<ActiveEntry | null>('/api/time-entries/active', fetcher);
  const [busy, setBusy] = React.useState(false);
  const [warn, setWarn] = React.useState(false);

  const activeOnThis = active?.projectId === project.id;
  const activeElsewhere = !!active && !activeOnThis;
  const pct = Math.max(0, Math.min(1, monthHours / Math.max(1, monthTarget)));

  const rateLine =
    project.hourlyRate != null
      ? `${Math.round(project.hourlyRate)} ${project.currency || 'RUB'}/час`
      : project.fixedPrice != null
        ? `Фикс. ${Math.round(project.fixedPrice)} ${project.currency || 'RUB'}`
        : 'Без ставки';

  const onStart = async (force = false) => {
    if (activeElsewhere && !force) {
      setWarn(true);
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/time-entries/start', { projectId: project.id });
      await mutate();
      setWarn(false);
    } finally {
      setBusy(false);
    }
  };

  const status = project.status || 'ACTIVE';
  const variant = STATUS_VARIANT[status] || 'neutral';
  const label = STATUS_LABEL[status] || status;

  return (
    <Card className={cn('flex h-full flex-col justify-between gap-5', className)}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link href={`/freelance/projects/${project.id}`} className="flex-1 no-underline">
            <h4
              className="text-xl font-medium tracking-editorial text-stone"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {project.name}
            </h4>
          </Link>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone/70">{rateLine}</p>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-stone/70">
              Часов в этом месяце
            </span>
            <span
              className="text-lg text-stone"
              style={{
                fontFamily: 'Fraunces, serif',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {monthHours.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-stone/15">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                activeOnThis ? 'bg-coral' : 'bg-stone/60',
              )}
              style={{ width: `${Math.max(4, pct * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {warn && activeElsewhere && (
          <div className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-xs text-stone">
            <p>
              У тебя уже идёт таймер на{' '}
              <span className="font-medium">{active?.project?.name || 'другом проекте'}</span>.
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="primary" onClick={() => onStart(true)} disabled={busy}>
                Переключить
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setWarn(false)} disabled={busy}>
                Отмена
              </Button>
            </div>
          </div>
        )}
        {activeOnThis ? (
          <Button variant="ghost" size="md" disabled>
            Сейчас идёт
          </Button>
        ) : (
          <Button
            variant={activeElsewhere ? 'ghost' : 'primary'}
            size="md"
            onClick={() => onStart(false)}
            disabled={busy}
          >
            {monthHours > 0 ? 'Продолжить' : 'Старт'}
          </Button>
        )}
      </div>
    </Card>
  );
};

ProjectCard.displayName = 'ProjectCard';
