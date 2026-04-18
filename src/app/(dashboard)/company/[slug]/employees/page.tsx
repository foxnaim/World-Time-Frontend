'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import {
  EmployeesTable,
  type Employee,
} from '@/components/dashboard/company/employees-table';
import { InviteModal } from '@/components/dashboard/company/invite-modal';

type CompanyDetail = {
  id: string;
  slug: string;
  name: string;
};

type EmployeesResp = { items: Employee[] };

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#D8C3A5]/40',
        className,
      )}
    />
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-[#E85A4F] tracking-tight">
        Не удалось загрузить. Попробуйте обновить.
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={onRetry}
      >
        Повторить
      </Button>
    </div>
  );
}

export default function EmployeesPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const { data: company, error: companyErr } = useSWR<CompanyDetail>(
    slug ? `/api/companies/${slug}` : null,
    fetcher,
  );
  const id = company?.id;

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<EmployeesResp>(
    id ? `/api/companies/${id}/employees` : null,
    fetcher,
  );

  const rows = React.useMemo(() => {
    const items = data?.items ?? [];
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.position ?? '').toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70">
            Сотрудники
          </div>
          <h1
            className="mt-2 text-5xl md:text-6xl tracking-tight text-[#8E8D8A]"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            Штат
          </h1>
          <div className="mt-1 text-sm text-[#8E8D8A]/70">
            {data ? `${data.items.length} человек` : '—'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск"
              className="h-10 w-56 rounded-full border border-[#8E8D8A]/25 bg-transparent px-4 text-sm text-[#8E8D8A] placeholder:text-[#8E8D8A]/40 focus:outline-none focus:border-[#E98074]/60 transition-colors"
            />
          </div>
          <Button variant="primary" onClick={() => setInviteOpen(true)}>
            Пригласить сотрудника
          </Button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        {companyErr || error ? (
          <ErrorState onRetry={() => mutate()} />
        ) : isLoading || !data ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <EmployeesTable
            rows={rows}
            onMenu={(e, action) => {
              // Hook up later; mutate for optimistic flows
              console.info('[employees] action', action, e.id);
            }}
          />
        )}
      </Card>

      {id && (
        <InviteModal
          companyId={id}
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onInvited={() => {
            mutate();
          }}
        />
      )}
    </div>
  );
}
