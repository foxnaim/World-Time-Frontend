'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';

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

  const { data: company, error } = useSWR<CompanyDetail>(
    slug ? `/api/companies/${slug}` : null,
    fetcher,
  );

  const id = company?.id;
  const officeUrl = id ? buildOfficeUrl(id) : '#';
  const officeUrlDisplay = id ? `/office/${id}/qr` : '—';
  const hasDisplayKey = DISPLAY_KEY.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70">
          QR для офиса
        </div>
        <h1
          className="mt-2 text-5xl md:text-6xl tracking-tight text-[#8E8D8A]"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
        >
          Чек-ин
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[#8E8D8A]/80 leading-relaxed">
          Откройте страницу на экране, установленном при входе. QR обновляется автоматически каждые
          60 секунд. Сотрудники сканируют его из Telegram-бота.
        </p>
        {!hasDisplayKey && (
          <div
            role="status"
            className="mt-4 max-w-xl rounded-md border border-[#E85A4F]/40 bg-[#E85A4F]/5 px-4 py-3 text-xs text-[#E85A4F] leading-relaxed"
          >
            <span className="uppercase tracking-[0.22em]">Ops note · </span>
            переменная <code className="font-mono">NEXT_PUBLIC_DISPLAY_KEY</code> не задана —
            превью и новая вкладка откроются без ключа и страница офиса покажет ошибку
            авторизации. Задайте её в окружении фронтенда (тот же секрет, что на бэкенде как{' '}
            <code className="font-mono">DISPLAY_KEY</code>) и пересоберите.
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] items-start">
        <Card eyebrow="Превью 400×400" className="!p-5 flex flex-col gap-4">
          <div className="w-[400px] h-[400px] border border-[#8E8D8A]/25 rounded-xl overflow-hidden bg-[#EAE7DC] relative">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <p className="text-sm text-[#E85A4F]">Не удалось загрузить. Попробуйте обновить.</p>
              </div>
            ) : !id ? (
              <div className="absolute inset-0 animate-pulse bg-[#D8C3A5]/40" />
            ) : (
              <iframe
                src={officeUrl}
                title="QR preview"
                width={400}
                height={400}
                className="w-full h-full bg-[#EAE7DC] border-0"
              />
            )}
          </div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/60">
            Превью экрана офиса
          </div>
        </Card>

        <Card eyebrow="Инструкции" title="Как подключить экран">
          <ol className="flex flex-col gap-4">
            {[
              'Откройте страницу на отдельном планшете или ноутбуке у входа.',
              'Выберите режим «Fullscreen» в браузере (F11 / Cmd+Ctrl+F).',
              'Сотрудник сканирует QR из Telegram-бота и получает отметку.',
              'Код обновляется каждые 60 секунд, подделать скрин не получится.',
            ].map((step, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] gap-4 items-start">
                <span
                  className="text-2xl text-[#E98074] tabular-nums leading-none"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-[#8E8D8A] leading-relaxed">{step}</span>
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
              Открыть на экране офиса
            </Button>
            <a
              href={officeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.22em] text-[#8E8D8A] hover:text-[#E98074] transition-colors"
              title={hasDisplayKey ? 'Ссылка содержит display-key' : 'Без display-key'}
            >
              {officeUrlDisplay}
              {hasDisplayKey ? ' · key ✓' : ' · key ✗'}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
