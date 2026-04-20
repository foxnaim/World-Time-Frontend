'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { QrCode } from '@/components/office/qr-code';
import { useLang } from '@/i18n/context';

const DISPLAY_KEY: string = process.env.NEXT_PUBLIC_DISPLAY_KEY ?? '';
const BOT_USERNAME = 'worktact_bot';
const REFRESH_INTERVAL_MS = 55_000;

function buildTelegramUrl(token: string): string {
  return `https://t.me/${BOT_USERNAME}?start=qr_${encodeURIComponent(token)}`;
}

function buildQrUrl(companyId: string): string {
  const base = `/api/checkin/qr/${encodeURIComponent(companyId)}/current`;
  return DISPLAY_KEY ? `${base}?key=${encodeURIComponent(DISPLAY_KEY)}` : base;
}

interface QrPayload {
  token: string;
  expiresAt: string;
}

function useCurrentTime(): string {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function KioskPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const { t } = useLang();

  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentTime = useCurrentTime();

  // Fetch company once by slug
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/companies/${slug}`, {
      headers: DISPLAY_KEY ? { 'x-display-key': DISPLAY_KEY } : {},
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { id: string; name: string }) => {
        setCompanyId(data.id);
        setCompanyName(data.name);
      })
      .catch(() => {
        setLoadError(true);
        setIsLoading(false);
      });
  }, [slug]);

  // Fetch current QR token
  const fetchQr = useCallback(async (id: string) => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(buildQrUrl(id), {
        headers: DISPLAY_KEY ? { 'x-display-key': DISPLAY_KEY } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as QrPayload;
      setQrValue(buildTelegramUrl(payload.token));
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 55 s
  useEffect(() => {
    if (!companyId) return;
    void fetchQr(companyId);
    const id = setInterval(() => void fetchQr(companyId), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [companyId, fetchQr]);

  return (
    <main
      className="min-h-screen bg-[#2a2927] flex flex-col items-center justify-between px-6 py-10 select-none"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* Company name — top */}
      <header className="w-full flex justify-center">
        <span className="text-[11px] uppercase tracking-[0.32em] text-[#a09b96]">
          {companyName ?? '\u00a0'}
        </span>
      </header>

      {/* QR code — center */}
      <section className="flex flex-col items-center gap-8">
        {loadError ? (
          <div className="flex flex-col items-center gap-5">
            <p className="text-sm text-[#E85A4F] tracking-wide text-center">
              {t('qr.kioskLoadError')}
            </p>
            <button
              onClick={() => companyId && void fetchQr(companyId)}
              className="px-6 py-2 rounded border border-[#a09b96]/40 text-[#a09b96] text-xs uppercase tracking-[0.22em] hover:border-[#E98074] hover:text-[#E98074] transition-colors"
            >
              {t('qr.kioskRetry')}
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#EAE7DC', lineHeight: 0 }}
            aria-label={isLoading ? t('qr.kioskLoadingAria') : t('qr.kioskQrAria')}
            role="img"
          >
            <QrCode
              value={qrValue || 'worktime:bootstrap'}
              size={300}
              bgColor="#EAE7DC"
              fgColor="#1a1a1a"
            />
          </div>
        )}

        {/* Instruction */}
        <p className="text-[13px] uppercase tracking-[0.28em] text-[#a09b96] text-center">
          {t('qr.kioskInstruction')}
        </p>
      </section>

      {/* Current time — bottom */}
      <footer className="flex flex-col items-center gap-1">
        <span
          className="text-4xl tabular-nums text-[#e8e4de] tracking-tight"
          style={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontWeight: 400,
          }}
          aria-live="off"
        >
          {currentTime}
        </span>
        <span className="text-[9px] uppercase tracking-[0.4em] text-[#6b6966]">
          Work Tact
        </span>
      </footer>
    </main>
  );
}
