import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';

/**
 * /dashboard — landing entry after login. The actual dashboard pages live
 * in the `(dashboard)` route group (no URL prefix) as `/freelance` and
 * `/company/[slug]`. This server component picks the right landing based
 * on the user's real data:
 *   - owns/is employed in a company  → /company/<slug>
 *   - otherwise                      → /freelance (B2C timer view)
 *
 * Middleware protects `/dashboard` so unauth'd users are redirected to
 * /login before reaching this file.
 */
export default async function DashboardIndex() {
  const user = await getServerUser();
  if (!user) redirect('/login?next=/dashboard');

  const u = user as typeof user & {
    employees?: Array<{ company?: { slug?: string | null } | null }>;
  };
  const firstCompanySlug = u.employees?.[0]?.company?.slug;
  if (firstCompanySlug) redirect(`/company/${firstCompanySlug}`);
  redirect('/freelance');
}
