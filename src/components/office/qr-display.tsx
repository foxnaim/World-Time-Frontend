'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dial } from '@worktime/ui';
import { Clock } from './clock';
import { QrCode } from './qr-code';
import { useSse, type SseConnectionState } from './use-sse';

interface QrPayload {
  token: string;
  expiresAt: string; // ISO timestamp
  rotationInSec: number;
}

export interface QrDisplayProps {
  companyId: string;
  /** Optional display name to show top-left. Falls back to companyId. */
  companyName?: string;
}

const BOT_USERNAME = 'worktime_bot';

function buildTelegramUrl(token: string): string {
  return `https://t.me/${BOT_USERNAME}?start=qr_${encodeURIComponent(token)}`;
}

function connectionCopy(state: SseConnectionState): string | null {
  if (state === 'error') {
    return 'Соединение с сервером потеряно. Попытка переподключения...';
  }
  return null;
}

/**
 * Full-screen QR display for a permanently-mounted office tablet.
 *
 * - Opens an SSE stream; on error transparently falls back to 15s polling.
 * - Shows a rotating countdown dial (drains counterclockwise) until the
 *   next token rotation (every 30s, 45s TTL).
 * - Renders a deterministic *placeholder* QR (see `pseudo-qr.tsx`).
 */
export function QrDisplay({ companyId, companyName }: QrDisplayProps) {
  const displayKey =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('key')
      : null;

  const sseUrl = useMemo(() => {
    const base = `/api/checkin/qr/${encodeURIComponent(companyId)}/stream`;
    return displayKey ? `${base}?key=${encodeURIComponent(displayKey)}` : base;
  }, [companyId, displayKey]);

  const pollUrl = useMemo(() => {
    const base = `/api/checkin/qr/${encodeURIComponent(companyId)}/current`;
    return displayKey ? `${base}?key=${encodeURIComponent(displayKey)}` : base;
  }, [companyId, displayKey]);

  const { data, state } = useSse<QrPayload>({
    url: sseUrl,
    pollUrl,
    pollIntervalMs: 15_000,
    // Note: EventSource cannot carry custom headers; the server supports
    // `?key=` as a fallback, and polling reuses the same query form. The
    // header path (X-Display-Key via NEXT_PUBLIC_DISPLAY_KEY) only exists
    // for same-origin fetches that need it — wire here if policy tightens.
  });

  // Live countdown tick: 10Hz is smooth enough for the dial without burning CPU.
  const [tickNow, setTickNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTickNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  const expiresMs = data?.expiresAt ? Date.parse(data.expiresAt) : null;
  const rotationSec = data?.rotationInSec ?? 30;
  const rotationMs = rotationSec * 1000;

  const remainingMs =
    expiresMs !== null
      ? Math.max(0, Math.min(rotationMs, expiresMs - tickNow))
      : rotationMs;

  const remainingSec = Math.ceil(remainingMs / 1000);
  // Dial fills with coral and drains counterclockwise → progress represents
  // how much of the current window *remains*.
  const progress = rotationMs > 0 ? remainingMs / rotationMs : 0;

  const qrValue = data?.token ? buildTelegramUrl(data.token) : '';
  const banner = connectionCopy(state);

  const stateLabel =
    state === 'sse'
      ? 'Live'
      : state === 'polling'
        ? 'Poll'
        : state === 'error'
          ? 'Offline'
          : 'Init';

  const qrAriaLabel = data?.token
    ? `QR-код для отметки прихода и ухода. Обновится через ${remainingSec} секунд.`
    : 'Ожидание QR-кода для отметки прихода и ухода.';

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-cream text-[#2a2927]"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* Top bar: company (left) / clock (right) */}
      <header className="absolute inset-x-0 top-0 flex items-start justify-between px-10 pt-10">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.32em] text-stone/70">
            Компания
          </span>
          <span
            className="mt-1 text-sm font-medium text-[#2a2927]"
            style={{ letterSpacing: '0.02em' }}
          >
            {companyName ?? companyId}
          </span>
        </div>
        <Clock />
      </header>

      {/* Main stage: heading → QR → dial */}
      <section className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <span className="editorial-eyebrow text-stone/70">
            WorkTime · Checkpoint
          </span>
          <h1
            className="mt-3 text-center text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-[#2a2927]"
            style={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              fontVariationSettings: "'opsz' 144",
            }}
          >
            Отсканируй
          </h1>
          <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-stone/80">
            для отметки прихода / ухода
          </p>
        </div>

        <div
          className="mt-8 flex items-center justify-center rounded-[2px] bg-white/40 p-5 hairline"
          style={{ boxShadow: '0 1px 0 rgba(142,141,138,0.08)' }}
          role="img"
          aria-label={qrAriaLabel}
        >
          <div className="relative">
            <QrCode
              value={qrValue || `worktime:${companyId}:bootstrap`}
              size={520}
            />
            {!data && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span
                  className="rounded-sm bg-cream/90 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-stone"
                  style={{ letterSpacing: '0.3em' }}
                >
                  Ожидание кода...
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <Dial
            size={132}
            progress={progress}
            ticks={30}
            indicatorColor="coral"
          />
          <div className="mt-3 flex items-baseline gap-2 tabular-nums">
            <span
              className="text-3xl text-[#2a2927]"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              {String(remainingSec).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone/80">
              сек до обновления
            </span>
          </div>
        </div>
      </section>

      {/* Connection banner — announced politely to assistive tech */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={
          banner
            ? 'absolute inset-x-0 top-24 mx-auto w-fit max-w-[80%] border border-red/50 bg-red/5 px-4 py-2'
            : 'sr-only'
        }
      >
        {banner ? (
          <span className="text-[11px] uppercase tracking-[0.24em] text-red">
            {banner}
          </span>
        ) : (
          <span>{`Состояние соединения: ${stateLabel}`}</span>
        )}
      </div>

      {/* Bottom: tick ruler + wordmark */}
      <footer className="absolute inset-x-0 bottom-0 px-10 pb-8">
        <div className="flex items-end justify-between">
          <TickRuler />
          <div className="flex items-baseline gap-3">
            <span
              className="text-[10px] uppercase tracking-[0.32em] text-stone/70"
              aria-hidden="true"
            >
              {stateLabel}
            </span>
            <span
              className="text-xs uppercase tracking-[0.45em] text-[#2a2927]"
              style={{ fontWeight: 500 }}
            >
              Worktime
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

/** Slim 40-tick ruler for the bottom-left, matches editorial chrome. */
function TickRuler() {
  const ticks = Array.from({ length: 48 });
  return (
    <div
      className="flex items-end gap-[4px]"
      aria-hidden="true"
      style={{ height: 14 }}
    >
      {ticks.map((_, i) => {
        const isMajor = i % 6 === 0;
        return (
          <span
            key={i}
            className="block bg-stone"
            style={{
              width: 1,
              height: isMajor ? 14 : 7,
              opacity: isMajor ? 0.55 : 0.25,
            }}
          />
        );
      })}
    </div>
  );
}
