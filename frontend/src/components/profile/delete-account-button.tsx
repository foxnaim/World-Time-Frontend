'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useLang } from '@/i18n/context';

export function DeleteAccountButton() {
  const router = useRouter();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await api.delete('/api/auth/me');
      // Clear client-side auth state, then bounce to login.
      document.cookie = 'access_token=; Max-Age=0; path=/';
      document.cookie = 'refresh_token=; Max-Age=0; path=/';
      router.replace('/login');
      router.refresh();
    } catch (e) {
      const msg = (e as Error)?.message ?? t('profile.deleteAccountFailed');
      setError(msg);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-xs uppercase tracking-[0.22em] px-4 py-2 rounded-md border border-[#E85A4F]/50 text-[#E85A4F] hover:bg-[#E85A4F]/10 transition-colors"
      >
        {t('profile.deleteAccount')}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-xl bg-[#EAE7DC] border border-[#8E8D8A]/30 p-6 flex flex-col gap-4">
            <h2
              id="delete-account-title"
              className="text-xl tracking-tight text-[#3d3b38]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {t('profile.deleteAccountTitle')}
            </h2>
            <p className="text-sm text-[#3d3b38]/80 leading-relaxed">
              {t('profile.deleteAccountConfirmBody')}
            </p>
            {error && (
              <p className="text-xs text-[#E85A4F] bg-[#E85A4F]/10 rounded px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                disabled={busy}
                className="px-4 py-2 text-xs uppercase tracking-[0.22em] rounded-md border border-[#8E8D8A]/30 text-[#3d3b38] hover:bg-[#8E8D8A]/10 transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="px-4 py-2 text-xs uppercase tracking-[0.22em] rounded-md bg-[#E85A4F] text-white hover:bg-[#d44c41] transition-colors disabled:opacity-50"
              >
                {busy ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
