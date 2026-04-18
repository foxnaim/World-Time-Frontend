'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

type Company = {
  id: string;
  slug: string;
  name: string;
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function MonthBadge({
  month,
  onChange,
}: {
  month: string;
  onChange: (m: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const items = React.useMemo(() => {
    const now = new Date();
    const arr: { value: string; label: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      });
      arr.push({ value: v, label });
    }
    return arr;
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 border border-[#8E8D8A]/30 bg-transparent px-3 h-9 rounded-full text-xs uppercase tracking-[0.22em] text-[#8E8D8A] hover:text-[#E98074] hover:border-[#E98074]/50 transition-colors"
      >
        <span
          aria-hidden
          className="w-1 h-1 rounded-full bg-[#E98074]"
        />
        {month}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-56 border border-[#8E8D8A]/20 bg-[#EAE7DC] shadow-xl rounded-xl py-2">
          {items.map((it) => (
            <button
              key={it.value}
              onClick={() => {
                onChange(it.value);
                setOpen(false);
              }}
              className={classNames(
                'w-full flex items-center justify-between px-4 py-2 text-sm text-left',
                it.value === month
                  ? 'text-[#E98074]'
                  : 'text-[#8E8D8A] hover:text-[#E98074]',
              )}
            >
              <span className="capitalize">{it.label}</span>
              <span className="text-[10px] tracking-[0.2em]">{it.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanySwitcher({
  companies,
  activeSlug,
}: {
  companies: Company[];
  activeSlug?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const active =
    companies.find((c) => c.slug === activeSlug) ?? companies[0] ?? null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-3 border border-[#8E8D8A]/30 bg-transparent pl-3 pr-4 h-9 rounded-full text-sm text-[#8E8D8A] hover:text-[#E98074] hover:border-[#E98074]/50 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-[#E98074]/70" />
        <span
          className="tracking-tight"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {active?.name ?? 'Компания'}
        </span>
        <span aria-hidden className="text-[#8E8D8A]/50 text-xs">
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-30 w-72 border border-[#8E8D8A]/20 bg-[#EAE7DC] shadow-xl rounded-xl py-2">
          {companies.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#8E8D8A]/70">
              Нет компаний
            </div>
          ) : (
            companies.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setOpen(false);
                  router.push(`/company/${c.slug}`);
                }}
                className={classNames(
                  'w-full text-left px-4 py-2 text-sm flex items-center justify-between',
                  c.slug === activeSlug
                    ? 'text-[#E98074]'
                    : 'text-[#8E8D8A] hover:text-[#E98074]',
                )}
              >
                <span
                  className="tracking-tight"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {c.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8E8D8A]/50">
                  /{c.slug}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-[#8E8D8A]/30 hover:border-[#E98074]/50 hover:text-[#E98074] text-[#8E8D8A] transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-[#D8C3A5] flex items-center justify-center text-[11px] tracking-wider text-[#8E8D8A]">
          AO
        </span>
        <span className="text-xs uppercase tracking-[0.22em]">Аккаунт</span>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-60 border border-[#8E8D8A]/20 bg-[#EAE7DC] shadow-xl rounded-xl py-2 text-sm text-[#8E8D8A]">
          <div className="px-4 py-3 border-b border-[#8E8D8A]/15">
            <div
              className="text-base tracking-tight"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Владелец
            </div>
            <div className="text-xs text-[#8E8D8A]/70 mt-0.5">
              info@aoneagency.kz
            </div>
          </div>
          <button className="w-full text-left px-4 py-2 hover:text-[#E98074]">
            Профиль
          </button>
          <button className="w-full text-left px-4 py-2 hover:text-[#E85A4F]">
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

const COMPANY_NAV = [
  { href: '', label: 'Обзор' },
  { href: '/employees', label: 'Сотрудники' },
  { href: '/reports', label: 'Отчёты' },
  { href: '/qr', label: 'QR' },
  { href: '/settings', label: 'Настройки' },
];

const FREELANCE_NAV = [
  { href: '/freelance', label: 'Таймер' },
  { href: '/freelance/projects', label: 'Проекты' },
  { href: '/freelance/stats', label: 'Статистика' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ slug?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const slug = params?.slug;

  const { data: companies } = useSWR<Company[]>('/api/companies/my', fetcher);

  const [month, setMonth] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('month') || currentYearMonth();
    }
    return currentYearMonth();
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('month', month);
    window.history.replaceState({}, '', url);
  }, [month]);

  const activeSlug = slug ?? companies?.[0]?.slug;
  const isFreelance = pathname?.startsWith('/freelance') ?? false;

  return (
    <div className="min-h-screen bg-[#EAE7DC] text-[#8E8D8A] flex">
      <aside
        className="w-[240px] shrink-0 border-r border-[#8E8D8A]/20 bg-[#EAE7DC]"
        aria-label="Navigation"
      >
        <div className="h-16 flex items-center px-6 border-b border-[#8E8D8A]/15">
          <Link
            href="/"
            className="text-[#8E8D8A] hover:text-[#E98074] transition-colors tracking-tight text-lg"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Work Tact
          </Link>
        </div>
        <nav className="p-4 flex flex-col gap-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/60">
            Компания
          </div>
          {COMPANY_NAV.map((item) => {
            const href = activeSlug
              ? `/company/${activeSlug}${item.href}`
              : '#';
            const isActive =
              !isFreelance &&
              (pathname === href ||
                (item.href === '' &&
                  pathname === `/company/${activeSlug}`) ||
                (item.href !== '' && pathname?.startsWith(href)));
            return (
              <Link
                key={item.label}
                href={href}
                className={classNames(
                  'px-3 py-2 rounded-md text-sm tracking-tight flex items-center justify-between',
                  'transition-colors',
                  isActive
                    ? 'text-[#E98074] bg-[#E98074]/10'
                    : 'text-[#8E8D8A] hover:text-[#E98074]',
                )}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#E98074]" />
                )}
              </Link>
            );
          })}
          <div className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/60">
            Фриланс
          </div>
          {FREELANCE_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/freelance' && pathname?.startsWith(item.href)) ||
              (item.href === '/freelance' && pathname === '/freelance');
            return (
              <Link
                key={item.label}
                href={item.href}
                className={classNames(
                  'px-3 py-2 rounded-md text-sm tracking-tight flex items-center justify-between',
                  'transition-colors',
                  isActive
                    ? 'text-[#E98074] bg-[#E98074]/10'
                    : 'text-[#8E8D8A] hover:text-[#E98074]',
                )}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#E98074]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-6 py-5 border-t border-[#8E8D8A]/15 text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/40">
          v0.1 · editorial
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#8E8D8A]/15 px-8 flex items-center justify-between gap-6 sticky top-0 z-20 bg-[#EAE7DC]/90 backdrop-blur">
          <div className="flex items-center gap-4">
            {!isFreelance && (
              <CompanySwitcher
                companies={companies ?? []}
                activeSlug={activeSlug}
              />
            )}
            {isFreelance && (
              <div
                className="text-sm tracking-tight text-[#8E8D8A]"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                Фриланс
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isFreelance && (
              <MonthBadge month={month} onChange={setMonth} />
            )}
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-8 py-10 md:px-12 md:py-12 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
