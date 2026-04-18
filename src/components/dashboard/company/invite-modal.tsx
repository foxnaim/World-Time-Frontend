'use client';

import * as React from 'react';
import { Button, Card, Input, cn } from '@tact/ui';
import { api } from '@/lib/api';

export interface InviteModalProps {
  companyId: string;
  open: boolean;
  onClose: () => void;
  onInvited?: (result: InviteResult) => void;
}

type InviteResult = {
  inviteId: string;
  link: string;
  botUsername?: string;
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

/**
 * Minimal inline QR renderer. Renders the `text` encoded as a dense black-and-white
 * SVG grid. This is a deterministic visual placeholder that works without any
 * external QR library; for production swap with a proper encoder.
 */
function QRPreview({ text, size = 180 }: { text: string; size?: number }) {
  const cells = 29;
  const cell = size / cells;

  const grid = React.useMemo(() => {
    // Simple seeded hash → boolean grid. Recognizable as QR-ish pattern.
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const rnd = () => {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      return ((h >>> 0) % 1000) / 1000;
    };
    const g: boolean[][] = [];
    for (let y = 0; y < cells; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < cells; x++) {
        row.push(rnd() > 0.5);
      }
      g.push(row);
    }
    // Finder patterns at (0,0), (cells-7,0), (0,cells-7)
    const stamp = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const on =
            x === 0 ||
            y === 0 ||
            x === 6 ||
            y === 6 ||
            (x >= 2 && x <= 4 && y >= 2 && y <= 4);
          g[oy + y][ox + x] = on;
        }
      }
    };
    stamp(0, 0);
    stamp(cells - 7, 0);
    stamp(0, cells - 7);
    return g;
  }, [text]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="QR-код приглашения"
      className="block"
    >
      <rect width={size} height={size} fill="#EAE7DC" />
      {grid.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="#8E8D8A"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

export function InviteModal({
  companyId,
  open,
  onClose,
  onInvited,
}: InviteModalProps) {
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
      const payload: Record<string, unknown> = {
        position: form.position || undefined,
        role: form.role,
      };
      if (form.monthlySalary)
        payload.monthlySalary = Number(form.monthlySalary);
      if (form.hourlyRate) payload.hourlyRate = Number(form.hourlyRate);
      const res = await api.post<InviteResult>(
        `/api/companies/${companyId}/employees/invite`,
        payload,
      );
      setResult(res);
      onInvited?.(res);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Не удалось создать приглашение';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.link);
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
      <div
        className="absolute inset-0 bg-[#8E8D8A]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card
        className={cn(
          'relative z-10 w-full max-w-lg !p-0 overflow-hidden',
          'border border-[#8E8D8A]/25 bg-[#EAE7DC]',
        )}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#8E8D8A]/15">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/60">
              Приглашение
            </div>
            <h3
              id="invite-title"
              className="mt-1 text-2xl tracking-tight text-[#8E8D8A]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Новый сотрудник
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E8D8A] hover:text-[#E85A4F] text-2xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {!result ? (
          <form onSubmit={submit} className="px-7 py-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
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
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
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
                        : 'border-[#8E8D8A]/30 text-[#8E8D8A] hover:border-[#E98074]/50 hover:text-[#E98074]',
                    )}
                  >
                    {r === 'STAFF' ? 'Сотрудник' : 'Менеджер'}
                  </button>
                ))}
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
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
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
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

            {error && (
              <div className="text-xs text-[#E85A4F] tracking-tight">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={onClose}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Создаём…' : 'Создать приглашение'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-7 py-6 flex flex-col gap-5 items-center">
            <div className="rounded-xl border border-[#8E8D8A]/20 p-4 bg-[#EAE7DC]">
              <QRPreview text={result.link} size={200} />
            </div>
            <div
              className="text-center text-sm text-[#8E8D8A] tracking-tight"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Отсканируйте QR или перешлите ссылку
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 border border-[#8E8D8A]/25 bg-[#D8C3A5]/20 rounded-full px-4 h-10 flex items-center text-sm text-[#8E8D8A] truncate">
                {result.link}
              </div>
              <Button
                variant={copied ? 'outline' : 'primary'}
                type="button"
                onClick={copyLink}
              >
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
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
