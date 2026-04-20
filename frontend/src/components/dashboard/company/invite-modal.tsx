'use client';

import * as React from 'react';
import { Button, Card, Input, cn } from '@tact/ui';
import { api } from '@/lib/api';
import { QrCode } from '@/components/office/qr-code';

export interface InviteModalProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
  onInvited?: (result: InviteResult) => void;
}

/**
 * Shape returned by `POST /api/companies/:id/employees/invite`.
 * Mirrors backend `CompanyService.inviteEmployee`: the service issues a
 * signed Telegram deep-link and we render it as-is (no client-side concat).
 */
type InviteResult = {
  inviteLink: string;
  token: string;
  expiresAt: string;
};

type FormState = {
  position: string;
  role: 'STAFF' | 'MANAGER';
  monthlySalary: string;
  hourlyRate: string;
};

const initial: FormState = {
  position: '',
  role: 'STAFF',
  monthlySalary: '',
  hourlyRate: '',
};

export function InviteModal({ companyId, open, onClose, onInvited }: InviteModalProps) {
  const [form, setForm] = React.useState<FormState>(initial);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<InviteResult | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setForm(initial);
      setSubmitting(false);
      setError(null);
      setResult(null);
      setCopied(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      // `userTelegramId: '0'` satisfies a stale `InviteEmployeeDtoSchema.refine`
      // that requires either `phone` or `userTelegramId`, even though the
      // service never reads them — the invite is a one-time deep-link that
      // binds to whoever consumes it. Remove once the backend schema drops
      // the phone/telegramId refinement.
      const payload: Record<string, unknown> = {
        position: form.position || undefined,
        role: form.role,
        userTelegramId: '0',
      };
      if (form.monthlySalary) payload.monthlySalary = Number(form.monthlySalary);
      if (form.hourlyRate) payload.hourlyRate = Number(form.hourlyRate);
      const res = await api.post<InviteResult>(
        `/api/companies/${companyId}/employees/invite`,
        payload,
      );
      setResult(res);
      onInvited?.(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось создать приглашение';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
    >
      <div className="absolute inset-0 bg-[#8E8D8A]/40 backdrop-blur-sm" onClick={onClose} />
      <Card
        className={cn(
          'relative z-10 w-full max-w-lg !p-0 overflow-hidden',
          'border border-[#8E8D8A]/25 bg-[#EAE7DC]',
        )}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#8E8D8A]/15">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              Приглашение
            </div>
            <h3
              id="invite-title"
              className="mt-1 text-2xl tracking-tight text-[#3d3b38]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Новый сотрудник
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#3d3b38] hover:text-[#E85A4F] text-2xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {!result ? (
          <form onSubmit={submit} className="px-7 py-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#6b6966]">
                Должность
              </span>
              <Input
                type="text"
                value={form.position}
                onChange={(e) => update('position', e.target.value)}
                placeholder="Например, Бариста"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#6b6966]">
                Роль
              </span>
              <div className="flex gap-2">
                {(['STAFF', 'MANAGER'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => update('role', r)}
                    className={cn(
                      'flex-1 h-10 rounded-full border text-xs uppercase tracking-[0.22em] transition-colors',
                      form.role === r
                        ? 'bg-[#E98074] text-[#EAE7DC] border-[#E98074]'
                        : 'border-[#8E8D8A]/30 text-[#3d3b38] hover:border-[#E98074]/50 hover:text-[#E98074]',
                    )}
                  >
                    {r === 'STAFF' ? 'Сотрудник' : 'Менеджер'}
                  </button>
                ))}
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#6b6966]">
                  Месячный оклад, ₸
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.monthlySalary}
                  onChange={(e) => update('monthlySalary', e.target.value)}
                  placeholder="300 000"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#6b6966]">
                  Ставка в час, ₸
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.hourlyRate}
                  onChange={(e) => update('hourlyRate', e.target.value)}
                  placeholder="2 500"
                />
              </label>
            </div>

            {error && <div className="text-xs text-[#E85A4F] tracking-tight">{error}</div>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Создаём…' : 'Создать приглашение'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-7 py-6 flex flex-col gap-5 items-center">
            <div className="rounded-xl border border-[#8E8D8A]/20 p-3 bg-[#EAE7DC]">
              <QrCode value={result.inviteLink} size={200} fgColor="#8E8D8A" bgColor="#EAE7DC" />
            </div>
            <div
              className="text-center text-sm text-[#3d3b38] tracking-tight"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Отсканируйте QR или перешлите ссылку
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 border border-[#8E8D8A]/25 bg-[#D8C3A5]/20 rounded-full px-4 h-10 flex items-center text-sm text-[#3d3b38] truncate">
                {result.inviteLink}
              </div>
              <Button variant={copied ? 'outline' : 'primary'} type="button" onClick={copyLink}>
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]">
              Действительна до {new Date(result.expiresAt).toLocaleString('ru-RU')}
            </div>
            <div className="flex items-center justify-end w-full pt-2">
              <Button variant="ghost" type="button" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default InviteModal;
