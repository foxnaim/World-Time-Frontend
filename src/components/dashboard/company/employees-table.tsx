'use client';

import * as React from 'react';
import { Badge, cn } from '@tact/ui';

export type Employee = {
  id: string;
  name: string;
  position?: string | null;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE';
  monthlySalary?: number | null;
  hourlyRate?: number | null;
  checkedInToday?: boolean;
  lateCountMonth?: number;
  avatarUrl?: string | null;
};

export interface EmployeesTableProps {
  rows: Employee[];
  onMenu?: (e: Employee, action: 'edit' | 'suspend' | 'remove') => void;
  className?: string;
}

const GRID_COLS =
  'grid grid-cols-[1.6fr_1.2fr_1fr_0.9fr_0.7fr_0.9fr_0.4fr]';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

function formatCurrency(v?: number | null, perHour = false) {
  if (v == null) return '—';
  const nf = new Intl.NumberFormat('ru-RU');
  return `${nf.format(v)}${perHour ? ' / ч' : ' ₸'}`;
}

function StatusBadge({ status }: { status: Employee['status'] }) {
  if (status === 'ACTIVE')
    return <Badge variant="coral">активен</Badge>;
  return <Badge variant="red">неактивен</Badge>;
}

function RowMenu({
  row,
  onMenu,
}: {
  row: Employee;
  onMenu?: EmployeesTableProps['onMenu'];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="h-8 w-8 rounded-full border border-transparent hover:border-[#8E8D8A]/30 hover:text-[#E98074] text-[#8E8D8A] focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Действия для ${row.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden="true">…</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-10 w-44 border border-[#8E8D8A]/20 bg-[#EAE7DC] shadow-xl rounded-lg py-1 text-sm"
        >
          <button
            role="menuitem"
            className="w-full text-left px-3 py-2 text-[#8E8D8A] hover:text-[#E98074] focus:outline-none focus-visible:bg-[#D8C3A5]/40"
            onClick={() => {
              setOpen(false);
              onMenu?.(row, 'edit');
            }}
          >
            Изменить
          </button>
          <button
            role="menuitem"
            className="w-full text-left px-3 py-2 text-[#8E8D8A] hover:text-[#E98074] focus:outline-none focus-visible:bg-[#D8C3A5]/40"
            onClick={() => {
              setOpen(false);
              onMenu?.(row, 'suspend');
            }}
          >
            Приостановить
          </button>
          <button
            role="menuitem"
            className="w-full text-left px-3 py-2 text-[#E85A4F] focus:outline-none focus-visible:bg-[#D8C3A5]/40"
            onClick={() => {
              setOpen(false);
              onMenu?.(row, 'remove');
            }}
          >
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}

export function EmployeesTable({ rows, onMenu, className }: EmployeesTableProps) {
  if (rows.length === 0) {
    return (
      <div
        className={cn('py-16 text-center', className)}
        role="region"
        aria-label="Сотрудники"
      >
        <div
          className="text-4xl text-[#8E8D8A]/70"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Пусто
        </div>
        <div className="mt-2 text-xs uppercase tracking-[0.24em] text-[#8E8D8A]/60">
          Пригласите первого сотрудника
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Сотрудники"
      className={cn('w-full', className)}
    >
      <table className="w-full border-collapse" aria-label="Сотрудники">
        <thead>
          <tr
            className={cn(
              GRID_COLS,
              'px-4 py-3 border-b border-[#8E8D8A]/25 text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70',
            )}
          >
            <th scope="col" className="text-left font-normal">
              Имя
            </th>
            <th scope="col" className="text-left font-normal">
              Должность
            </th>
            <th scope="col" className="text-left font-normal">
              Ставка
            </th>
            <th scope="col" className="text-left font-normal">
              Статус
            </th>
            <th scope="col" className="text-center font-normal">
              Сегодня
            </th>
            <th scope="col" className="text-right font-normal">
              Опоздания мес.
            </th>
            <th scope="col" aria-label="Действия" className="font-normal" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className={cn(
                GRID_COLS,
                'items-center px-4 py-4 border-b border-[#8E8D8A]/10 hover:bg-[#D8C3A5]/15 transition-colors',
              )}
            >
              <th scope="row" className="flex items-center gap-3 min-w-0 font-normal text-left">
                <span
                  className="w-9 h-9 rounded-full bg-[#D8C3A5] text-[#8E8D8A] flex items-center justify-center text-xs uppercase tracking-[0.22em] shrink-0"
                  aria-hidden={r.avatarUrl ? undefined : 'true'}
                >
                  {r.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    initials(r.name)
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className="block text-base tracking-tight text-[#8E8D8A] truncate"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {r.name}
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]/50">
                    {r.role.toLowerCase()}
                  </span>
                </span>
              </th>
              <td className="text-sm text-[#8E8D8A]/90 truncate">
                {r.position || '—'}
              </td>
              <td className="text-sm tabular-nums text-[#8E8D8A]">
                {r.monthlySalary
                  ? formatCurrency(r.monthlySalary)
                  : formatCurrency(r.hourlyRate, true)}
              </td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td className="text-center">
                {r.checkedInToday ? (
                  <>
                    <span
                      className="text-[#E98074] text-lg leading-none"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="sr-only">Отметился сегодня</span>
                  </>
                ) : (
                  <>
                    <span
                      className="text-[#E85A4F] text-lg leading-none"
                      aria-hidden="true"
                    >
                      ×
                    </span>
                    <span className="sr-only">Не отметился сегодня</span>
                  </>
                )}
              </td>
              <td
                className="text-right tabular-nums"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {r.lateCountMonth != null ? (
                  <span
                    className={cn(
                      'text-xl',
                      (r.lateCountMonth ?? 0) > 0
                        ? 'text-[#E85A4F]'
                        : 'text-[#8E8D8A]/70',
                    )}
                  >
                    {r.lateCountMonth}
                  </span>
                ) : (
                  <span className="text-[#8E8D8A]/50">—</span>
                )}
              </td>
              <td className="flex justify-end">
                <RowMenu row={r} onMenu={onMenu} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeesTable;
