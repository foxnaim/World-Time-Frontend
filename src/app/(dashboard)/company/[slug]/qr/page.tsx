'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card } from '@worktime/ui';
import { fetcher } from '@/lib/fetcher';

type CompanyDetail = { id: string; slug: string; name: string };

export default function QrPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const { data: company, error } = useSWR<CompanyDetail>(
    slug ? `/api/companies/${slug}` : null,
    fetcher,
  );

  const id = company?.id;
  const officeUrl = id ? `/office/${id}/qr` : '#';

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
          Откройте страницу на экране, установленном при входе. QR обновляется
          автоматически каждые 60 секунд. Сотрудники сканируют его из
          Telegram-бота.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] items-start">
        <Card
          eyebrow="Превью 400×400"
          className="!p-5 flex flex-col gap-4"
        >
          <div className="w-[400px] h-[400px] border border-[#8E8D8A]/25 rounded-xl overflow-hidden bg-[#EAE7DC] relative">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <p className="text-sm text-[#E85A4F]">
                  Не удалось загрузить. Попробуйте обновить.
                </p>
              </div>
            ) : !id ? (
              <div className="absolute inset-0 animate-pulse bg-[#D8C3A5]/40" />
            ) : (
              <iframe
                src={officeUrl}
                title="QR preview"
                className="w-full h-full bg-[#EAE7DC]"
              />
            )}
          </div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/60">
            Открыть на экране офиса
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
              <li
                key={i}
                className="grid grid-cols-[auto_1fr] gap-4 items-start"
              >
                <span
                  className="text-2xl text-[#E98074] tabular-nums leading-none"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-[#8E8D8A] leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                if (typeof window !== 'undefined' && id)
                  window.open(officeUrl, '_blank', 'noopener,noreferrer');
              }}
              disabled={!id}
            >
              Открыть в новой вкладке
            </Button>
            <a
              href={officeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.22em] text-[#8E8D8A] hover:text-[#E98074] transition-colors"
            >
              {officeUrl}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
