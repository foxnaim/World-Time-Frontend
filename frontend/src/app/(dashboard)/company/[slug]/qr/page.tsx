'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { useLang } from '@/i18n/context';

type CompanyDetail = { id: string; slug: string; name: string };

/**
 * Display key for the office terminal.
 *
 * The `/office/<companyId>/qr` endpoints are exempt from session auth
 * (see `src/middleware.ts`), but the QR JSON + SSE stream require either
 * an `X-Display-Key` header or a `?key=...` query param. Because an
 * `<iframe>` and `EventSource` cannot attach custom headers, we pass the
 * key via query string. Ops pre-seeds it at build time by setting
 * `NEXT_PUBLIC_DISPLAY_KEY`; if unset, the preview/open-link will not
 * carry a key and the office display will show an auth error — in which
 * case we render a visible hint for the operator.
 */
const DISPLAY_KEY: string = process.env.NEXT_PUBLIC_DISPLAY_KEY ?? '';

function buildOfficeUrl(id: string): string {
  const base = `/office/${id}/qr`;
  return DISPLAY_KEY ? `${base}?key=${encodeURIComponent(DISPLAY_KEY)}` : base;
}

export default function QrPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { t } = useLang();

  const { data: company, error } = useSWR<CompanyDetail>(
    slug ? `/api/companies/${slug}` : null,
    fetcher,
  );

  const id = company?.id;
  const officeUrl = id ? buildOfficeUrl(id) : '#';
  const officeUrlDisplay = id ? `/office/${id}/qr` : '—';
  const hasDisplayKey = DISPLAY_KEY.length > 0;

  const steps = [
    t('qr.step1'),
    t('qr.step2'),
    t('qr.step3'),
    t('qr.step4'),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
          {t('qr.eyebrow')}
        </div>
        <h1
          className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#3d3b38]"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
        >
          {t('qr.title')}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[#6b6966] leading-relaxed">
          {t('qr.description')}
        </p>
        {!hasDisplayKey && (
          <div
            role="status"
            className="mt-4 max-w-xl rounded-md border border-[#E85A4F]/40 bg-[#E85A4F]/5 px-4 py-3 text-xs text-[#E85A4F] leading-relaxed"
          >
            <span className="uppercase tracking-[0.22em]">{t('qr.opsNotePrefix')}</span>
            {t('qr.opsNoteBody', {
              envVar: 'NEXT_PUBLIC_DISPLAY_KEY',
              backendVar: 'DISPLAY_KEY',
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-start">
        <div className="flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            {t('qr.previewLabel')}
          </div>
          <div className="w-full max-w-[400px] aspect-square border border-[#8E8D8A]/25 rounded-xl overflow-hidden bg-[#EAE7DC] relative">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <p className="text-sm text-[#E85A4F]">{t('qr.loadError')}</p>
              </div>
            ) : !id ? (
              <div className="absolute inset-0 animate-pulse bg-[#D8C3A5]/40" />
            ) : (
              // Render the kiosk page at full 1280×1280 then scale to fit the
              // 400px preview. Avoids the "block on block" overflow when the
              // layout, tuned for wall-mounted tablets, is forced into a
              // small iframe.
              <iframe
                src={officeUrl}
                title="QR preview"
                width={1280}
                height={1280}
                className="bg-[#EAE7DC] border-0 absolute top-0 left-0"
                style={{
                  width: 1280,
                  height: 1280,
                  transform: 'scale(0.3125)',
                  transformOrigin: 'top left',
                }}
              />
            )}
          </div>
        </div>

        <Card eyebrow={t('qr.instructionsEyebrow')} title={t('qr.instructionsTitle')}>
          <ol className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] gap-4 items-start">
                <span
                  className="text-2xl text-[#E98074] tabular-nums leading-none"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-[#3d3b38] leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Button
              variant="primary"
              onClick={() => {
                if (typeof window !== 'undefined' && id)
                  window.open(officeUrl, '_blank', 'noopener,noreferrer');
              }}
              disabled={!id}
            >
              {t('qr.openButton')}
            </Button>
            <a
              href={officeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.22em] text-[#3d3b38] hover:text-[#E98074] transition-colors"
              title={hasDisplayKey ? t('qr.linkTitleWithKey') : t('qr.linkTitleWithoutKey')}
            >
              {officeUrlDisplay}
              {hasDisplayKey ? ' · key ✓' : ' · key ✗'}
            </a>
            <a
              href={slug ? `/kiosk/${slug}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.22em] text-[#3d3b38] hover:text-[#E98074] transition-colors border border-[#8E8D8A]/30 rounded px-3 py-1.5"
              aria-disabled={!slug}
            >
              {t('qr.kioskModeButton')}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
