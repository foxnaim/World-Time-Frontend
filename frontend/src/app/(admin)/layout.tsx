import * as React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

/**
 * Admin shell — server component.
 *
 * Gating strategy: probe the backend's `/admin/stats` endpoint with the
 * caller's session cookie. The backend is the single source of truth for
 * SUPER_ADMIN_TELEGRAM_IDS membership (via SuperAdminGuard), so we mirror
 * its verdict:
 *
 *   - 2xx → user is a super-admin; render the admin chrome.
 *   - 403 → authenticated but not in SUPER_ADMIN_TELEGRAM_IDS. Show a
 *           polite «Нет доступа» page rather than a redirect — the user
 *           arrived on purpose and deserves an explanation.
 *   - 401 / missing session → middleware will already have redirected,
 *           but we guard defensively by bouncing to /dashboard.
 *   - network / 5xx → bounce to /dashboard; the admin UI is useless
 *           without data and we'd rather not render a broken shell.
 */
const ACCESS_COOKIE = 'wt_access';

function resolveApiBase(): string {
  // Server-to-server call: prefer an internal URL when provided, falling
  // back to the public one. The public URL may be a relative `/api` in
  // dev — that won't work from the Node runtime, so we also accept an
  // absolute fallback.
  const internal = process.env.API_URL;
  if (internal && internal.length > 0) return internal.replace(/\/$/, '');
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl && /^https?:\/\//i.test(publicUrl)) return publicUrl.replace(/\/$/, '');
  return 'http://localhost:8000';
}

async function probeAdminAccess(): Promise<'ok' | 'forbidden' | 'unauthorized' | 'error'> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return 'unauthorized';

  const base = resolveApiBase();
  const url = `${base.endsWith('/api') ? base : `${base}/api`}/admin/stats`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    if (res.ok) return 'ok';
    if (res.status === 403) return 'forbidden';
    if (res.status === 401) return 'unauthorized';
    return 'error';
  } catch {
    return 'error';
  }
}

function NoAccess() {
  return (
    <div className="min-h-screen bg-stone-200 text-stone-700 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500">403</div>
        <h1
          className="mt-4 text-4xl md:text-5xl text-stone-800 tracking-tight"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
        >
          Нет доступа
        </h1>
        <p className="mt-4 text-sm text-stone-600">
          Этот раздел доступен только операторам платформы. Если вы ожидаете увидеть его —
          проверьте, добавлен ли ваш Telegram ID в
          <code className="mx-1 px-1.5 py-0.5 bg-stone-100 rounded border border-stone-300 text-xs">
            SUPER_ADMIN_TELEGRAM_IDS
          </code>
          .
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-block text-xs uppercase tracking-[0.28em] text-stone-500 hover:text-stone-800 transition-colors"
        >
          На дашборд
        </Link>
      </div>
    </div>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const verdict = await probeAdminAccess();

  if (verdict === 'unauthorized' || verdict === 'error') {
    redirect('/dashboard');
  }

  if (verdict === 'forbidden') {
    return <NoAccess />;
  }

  return (
    <div className="min-h-screen bg-stone-200 text-stone-700 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-stone-300/70 bg-stone-100/80 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
          <div
            className="text-sm tracking-tight text-stone-800"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Платформа
          </div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-stone-500">super-admin</div>
        </header>
        <main className="flex-1 px-8 py-10 md:px-12 md:py-12 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
