'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import { api } from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { useLang } from '@/i18n/context';

/**
 * Google OAuth connection widget for the /profile page.
 *
 * Lets owners link their own Google account so Sheets export can create
 * spreadsheets in their Drive (avoiding the "service account cannot
 * create files" Workspace limitation). Status is fetched from the
 * backend; the button hands off to the Google consent screen via
 * /api/auth/google/start.
 */

type Status = { connected: boolean; email: string | null };

export function GoogleConnect() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLang();
  const { data, mutate, isLoading } = useSWR<Status>('/api/auth/google/status', fetcher);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justConnected, setJustConnected] = useState(false);

  useEffect(() => {
    const err = params?.get('google_error');
    const ok = params?.get('google_connected');
    if (err) setError(decodeURIComponent(err));
    if (ok) {
      setJustConnected(true);
      void mutate();
    }
  }, [params, mutate]);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.get<{ url: string }>('/api/auth/google/start');
      window.location.href = url;
    } catch (e) {
      setError((e as Error)?.message ?? t('profile.googleFailedToStart'));
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!confirm(t('profile.googleDisconnectConfirm'))) return;
    setBusy(true);
    try {
      await api.delete('/api/auth/google/disconnect');
      await mutate();
      setJustConnected(false);
    } catch (e) {
      setError((e as Error)?.message ?? t('profile.googleFailedToDisconnect'));
    } finally {
      setBusy(false);
    }
  };

  const connected = data?.connected;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#3d3b38]/80 leading-relaxed">
        {t('profile.googleIntro')}
      </p>

      {isLoading ? (
        <div className="text-xs text-[#6b6966]">{t('profile.googleChecking')}</div>
      ) : connected ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="text-sm text-[#3d3b38]">
              {t('profile.googleConnected', {
                email: data?.email ?? t('profile.googleAccountSection'),
              })}
            </div>
            {justConnected && (
              <div className="text-xs text-[#6b6966] mt-1">
                {t('profile.googleJustConnected')}
              </div>
            )}
          </div>
          <button
            onClick={disconnect}
            disabled={busy}
            className="shrink-0 px-4 py-2 text-xs uppercase tracking-[0.22em] rounded-md border border-[#8E8D8A]/40 text-[#3d3b38] hover:border-[#E85A4F] hover:text-[#E85A4F] transition-colors disabled:opacity-40"
          >
            {busy ? '…' : t('common.disconnect')}
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={busy}
          className="self-start px-4 py-2 text-xs uppercase tracking-[0.22em] rounded-md bg-[#3d3b38] text-[#EAE7DC] hover:bg-[#E98074] transition-colors disabled:opacity-40"
        >
          {busy ? t('profile.googleConnectOpening') : t('profile.googleConnect')}
        </button>
      )}

      {error && (
        <p className="text-xs text-[#E85A4F] bg-[#E85A4F]/10 rounded px-3 py-2">{error}</p>
      )}

      <button
        onClick={() => router.refresh()}
        className="hidden"
        aria-hidden
      />
    </div>
  );
}
