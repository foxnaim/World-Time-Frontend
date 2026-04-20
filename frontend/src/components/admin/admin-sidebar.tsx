'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@tact/ui';

/**
 * Sidebar for the admin shell. Client component — needs `usePathname` for
 * active-link highlighting. All access checks happen in the parent server
 * layout before this ever renders.
 */
const NAV = [
  { href: '/admin', label: 'Обзор' },
  { href: '/admin/companies', label: 'Компании' },
  { href: '/admin/users', label: 'Пользователи' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-[240px] shrink-0 border-r border-stone-300/70 bg-stone-100"
      aria-label="Admin navigation"
    >
      <div className="h-16 flex items-center px-6 border-b border-stone-300/70">
        <Link
          href="/admin"
          className="text-stone-800 hover:text-stone-600 transition-colors tracking-tight text-lg"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Work Tact
        </Link>
        <span className="ml-3 text-[10px] uppercase tracking-[0.28em] text-stone-500">admin</span>
      </div>
      <nav className="p-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-sm text-sm tracking-tight transition-colors',
                isActive
                  ? 'bg-stone-200 text-stone-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto" />
    </aside>
  );
}
