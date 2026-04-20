'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';

/**
 * Inline email editor on the /profile page.
 *
 * Why it exists: Google Sheets export (for company owners/managers) needs an
 * email address to share the generated spreadsheet with. Freelancers may set
 * one optionally. The form keeps a single input + Save button and surfaces
 * both client-side format validation and server-side errors inline — no
 * modal, no toast, consistent with the page's quiet tone.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailForm({ initialEmail }: { initialEmail: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initialEmail ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const trimmed = value.trim();
  const normalized = trimmed === '' ? null : trimmed;
  const dirty = (initialEmail ?? '') !== trimmed;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (normalized !== null && !EMAIL_REGEX.test(normalized)) {
      setError('Неверный формат email');
      return;
    }
    setBusy(true);
    try {
      await api.patch('/api/auth/me', { email: normalized });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError((err as Error)?.message ?? 'Не удалось сохранить email');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <p className="text-sm text-[#3d3b38]/80 leading-relaxed">
        Укажите email, на который Google отправит доступ к таблице при экспорте.
        Для владельцев и менеджеров компаний — обязательно, фрилансерам — по желанию.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
            setSaved(false);
          }}
          disabled={busy}
          className="flex-1 px-3 py-2 text-sm rounded-md border border-[#8E8D8A]/30 bg-[#EAE7DC] text-[#3d3b38] placeholder:text-[#8E8D8A] focus:outline-none focus:border-[#E98074] transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !dirty}
          className="shrink-0 px-4 py-2 text-xs uppercase tracking-[0.22em] rounded-md bg-[#3d3b38] text-[#EAE7DC] hover:bg-[#E98074] transition-colors disabled:opacity-40 disabled:hover:bg-[#3d3b38]"
        >
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-[#E85A4F] bg-[#E85A4F]/10 rounded px-3 py-2">{error}</p>
      )}
      {saved && !error && (
        <p className="text-xs text-[#6b6966]">Email сохранён.</p>
      )}
    </form>
  );
}
