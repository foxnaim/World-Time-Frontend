import { QrDisplay } from '@/components/office/qr-display';

interface OfficeQrPageProps {
  params: Promise<{ companyId: string }>;
}

/**
 * Office QR display (RSC shell).
 *
 * The page itself is a server component so the dynamic companyId can be
 * read from the route without sending unused data to the client. The
 * actual interactive display (SSE, polling, dial, clock) lives inside
 * <QrDisplay />, which is marked 'use client'.
 *
 * Auth note: the QR endpoints require either an `X-Display-Key` header or
 * `?key=` query param. Because `<EventSource>` cannot attach headers, the
 * display falls back to the query-param form when a `key` is present in
 * the URL. Set `NEXT_PUBLIC_DISPLAY_KEY` in the tablet's env to pre-seed.
 */
export default async function OfficeQrPage({ params }: OfficeQrPageProps) {
  const { companyId } = await params;

  return <QrDisplay companyId={companyId} />;
}

export const dynamic = 'force-dynamic';
