import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * /dashboard — post-login landing entry.
 *
 * Decision tree:
 *   1. No wt_access cookie         → /login
 *   2. No accountType              → /onboarding/choose (first-time freelancer vs company pick)
 *   3. accountType=FREELANCER      → /freelance
 *   4. accountType=COMPANY:
 *        - owns ≥1 company slug    → /company/<slug>
 *        - otherwise               → /onboarding/company (wizard to create one)
 *
 * Route group `(dashboard)` has no /dashboard URL of its own; this file owns
 * the redirect logic so the login page can safely push('/dashboard') without
 * caring about the user's stage.
 */
export default async function DashboardIndex() {
  const store = await cookies();
  const token = store.get('wt_access')?.value;
  if (!token) redirect('/login?next=/dashboard');

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
  let me: {
    accountType?: 'FREELANCER' | 'COMPANY' | null;
    employees?: Array<{ role: string; company?: { slug?: string | null } | null }>;
  } | null = null;
  try {
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) me = await res.json();
  } catch {
    // network/API down — fall through to login
  }

  if (!me) redirect('/login?next=/dashboard');

  if (!me.accountType) redirect('/onboarding/choose');

  if (me.accountType === 'FREELANCER') redirect('/freelance');

  // COMPANY flow
  const firstCompanySlug = me.employees?.find((e) => e.company?.slug)?.company?.slug;
  if (firstCompanySlug) redirect(`/company/${firstCompanySlug}`);
  redirect('/onboarding/company');
}
