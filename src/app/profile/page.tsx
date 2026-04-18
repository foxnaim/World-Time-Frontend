import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { ACCESS_COOKIE } from '@/lib/auth-server';

/**
 * /profile — minimal server-rendered account page.
 *
 * Data source: `GET /api/auth/me`, which the backend extended to include the
 * user's active employee memberships and any owned-company subscriptions.
 * That covers everything this page renders (identity, companies, tier) in a
 * single round-trip, so we don't need to fan out to `/billing/my/:companyId`
 * for the common case. If a company is displayed but has no owner
 * subscription, we fall back to "FREE" — matching the billing controller's
 * default tier for rows without a subscription.
 *
 * Middleware (`PROTECTED_PREFIXES`) guarantees an authenticated request by
 * the time this renders, but we still handle missing/expired cookies and a
 * non-2xx `/me` response defensively to avoid crashing the RSC tree.
 */

const API_BASE =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Employee = {
  role: string;
  company: { id: string; name: string; slug: string };
};

type SubscriptionSummary = {
  companyId: string;
  tier: 'FREE' | 'SOLO' | 'TEAM' | 'BUSINESS' | string;
  status: string;
  seatsLimit: number | null;
  currentPeriodEnd: string | null;
};

type Me = {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  employees: Employee[];
  subscriptions: SubscriptionSummary[];
};

/** Mask a Telegram numeric id so the UI only reveals the last 4 digits. */
function maskTelegramId(tgId: string): string {
  const digits = tgId.replace(/\D/g, '');
  if (digits.length <= 4) return digits.padStart(4, '•');
  return `••••${digits.slice(-4)}`;
}

function displayName(me: Me): string {
  const full = [me.firstName, me.lastName].filter(Boolean).join(' ').trim();
  return full || me.username || 'Аккаунт';
}

async function fetchMe(token: string): Promise<Me | null> {
  const url = `${API_BASE.replace(/\/+$/, '')}/api/auth/me`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as Me;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) redirect('/login?next=/profile');

  const me = await fetchMe(token);
  if (!me) redirect('/login?next=/profile');

  const tierByCompany = new Map<string, SubscriptionSummary['tier']>();
  for (const sub of me.subscriptions) tierByCompany.set(sub.companyId, sub.tier);

  return (
    <div className="min-h-screen bg-[#EAE7DC] text-[#8E8D8A] px-8 py-12 md:px-16 md:py-16">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        <header className="flex items-center justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/60 mb-2">
              Профиль
            </div>
            <h1
              className="text-3xl tracking-tight text-[#8E8D8A]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {displayName(me)}
            </h1>
            {me.username && (
              <div className="text-sm text-[#8E8D8A]/70 mt-1">@{me.username}</div>
            )}
          </div>
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.22em] text-[#8E8D8A] hover:text-[#E98074] transition-colors"
          >
            ← Назад
          </Link>
        </header>

        <section className="border border-[#8E8D8A]/20 rounded-xl p-6 flex flex-col gap-3 bg-[#EAE7DC]">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/60">
            Идентификация
          </div>
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
            <dt className="text-[#8E8D8A]/70">Имя</dt>
            <dd>{displayName(me)}</dd>
            <dt className="text-[#8E8D8A]/70">Username</dt>
            <dd>{me.username ? `@${me.username}` : '—'}</dd>
            <dt className="text-[#8E8D8A]/70">Telegram ID</dt>
            <dd className="font-mono">{maskTelegramId(me.telegramId)}</dd>
          </dl>
        </section>

        <section className="border border-[#8E8D8A]/20 rounded-xl p-6 flex flex-col gap-3 bg-[#EAE7DC]">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/60">
            Компании и тариф
          </div>
          {me.employees.length === 0 ? (
            <p className="text-sm text-[#8E8D8A]/70">У вас нет компаний.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[#8E8D8A]/15">
              {me.employees.map((emp) => {
                const tier = tierByCompany.get(emp.company.id) ?? 'FREE';
                return (
                  <li
                    key={emp.company.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/company/${emp.company.slug}`}
                        className="text-sm tracking-tight text-[#8E8D8A] hover:text-[#E98074] transition-colors truncate block"
                        style={{ fontFamily: 'Fraunces, serif' }}
                      >
                        {emp.company.name}
                      </Link>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]/50 mt-0.5">
                        /{emp.company.slug} · {emp.role.toLowerCase()}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border border-[#E98074]/40 text-[#E98074]">
                      {tier}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
