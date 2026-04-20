'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Badge, Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { useLang } from '@/i18n/context';

interface Project {
  id: string;
  name: string;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency?: string | null;
  status: string;
  /** Aggregate of TimeEntry.durationSec across the project, provided by /api/projects. */
  totalSeconds?: number;
}

const STATUS_VARIANT: Record<string, 'neutral' | 'coral' | 'red' | 'sand'> = {
  ACTIVE: 'coral',
  DONE: 'neutral',
  ARCHIVED: 'neutral',
};

export default function ProjectsListPage() {
  const router = useRouter();
  const { t } = useLang();
  const { data, isLoading } = useSWR<Project[]>('/api/projects', fetcher);
  const list = Array.isArray(data) ? data : [];

  const STATUS_LABEL: Record<string, string> = {
    ACTIVE: t('projects.statusActive'),
    DONE: t('projects.statusDone'),
    ARCHIVED: t('projects.statusArchived'),
  };

  return (
    <div className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
            {t('projects.freelanceEyebrow')}
          </span>
          <h1
            className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-editorial text-stone"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            {t('projects.listTitle')}
          </h1>
        </div>
        <Link href="/freelance/projects/new">
          <Button variant="primary" size="md">
            {t('projects.newProject')}
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <ListSkeleton />
      ) : list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="hairline-b text-left text-[10px] uppercase tracking-[0.22em] text-stone/70">
                <Th>{t('projects.colName')}</Th>
                <Th className="text-right">{t('projects.colRate')}</Th>
                <Th className="text-right">{t('projects.colFixed')}</Th>
                <Th className="text-right">{t('projects.colHoursMonth')}</Th>
                <Th>{t('projects.colStatus')}</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const status = p.status || 'ACTIVE';
                const hours = (p.totalSeconds ?? 0) / 3600;
                const href = `/freelance/projects/${p.id}`;
                return (
                  <tr
                    key={p.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(href)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                    className="hairline-b cursor-pointer transition-colors hover:bg-sand/30 focus:bg-sand/30 focus:outline-none"
                  >
                    <Td>
                      <span
                        className="text-base font-medium text-stone"
                        style={{ fontFamily: 'Fraunces, serif' }}
                      >
                        {p.name}
                      </span>
                    </Td>
                    <Td className="text-right font-sans tabular-nums">
                      {p.hourlyRate != null
                        ? `${Math.round(p.hourlyRate)} ${p.currency || 'RUB'}/${t('projects.hourSuffix')}`
                        : '—'}
                    </Td>
                    <Td className="text-right font-sans tabular-nums">
                      {p.fixedPrice != null
                        ? `${Math.round(p.fixedPrice)} ${p.currency || 'RUB'}`
                        : '—'}
                    </Td>
                    <Td className="text-right font-sans tabular-nums">
                      {hours.toFixed(1)} {t('projects.hourSuffix')}
                    </Td>
                    <Td>
                      <Badge variant={STATUS_VARIANT[status] || 'neutral'}>
                        {STATUS_LABEL[status] || status}
                      </Badge>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        </div>
      )}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn('px-6 py-4 font-medium', className)}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-6 py-4 align-middle text-sm text-stone', className)}>{children}</td>;
}

function ListSkeleton() {
  return (
    <Card className="p-0">
      <div className="divide-y divide-stone/20">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-5">
            <div className="h-4 w-40 animate-pulse rounded bg-stone/20" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-stone/15" />
            <div className="h-4 w-16 animate-pulse rounded bg-stone/15" />
            <div className="h-4 w-20 animate-pulse rounded bg-stone/15" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-stone/15" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState() {
  const { t } = useLang();
  return (
    <Card className="flex flex-col items-center gap-5 py-16 text-center">
      <h3
        className="text-3xl font-medium tracking-editorial text-stone"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        {t('projects.emptyTitle')}
      </h3>
      <p className="max-w-md text-sm text-stone/80">{t('projects.emptyHint')}</p>
      <Link href="/freelance/projects/new">
        <Button variant="primary" size="md">
          {t('projects.createProject')}
        </Button>
      </Link>
    </Card>
  );
}
