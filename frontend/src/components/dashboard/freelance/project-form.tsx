'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, cn } from '@tact/ui';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export type RateMode = 'hourly' | 'fixed';

export interface ProjectFormValues {
  name: string;
  description?: string | null;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency: string;
  status: 'ACTIVE' | 'DONE' | 'ARCHIVED';
}

/**
 * Canonical props for the shared create/edit form.
 *
 * The component is driven by `submitUrl` + `method` so the same form is reused
 * for `POST /api/projects` (create) and `PATCH /api/projects/:id` (edit).
 *
 * Legacy props (`mode`, `projectId`, `initial`, `onSaved`) are kept as aliases
 * so existing call sites continue to work while they migrate.
 */
export interface ProjectFormProps {
  /** Prefill values (used for edit). */
  initialValues?: Partial<ProjectFormValues>;
  /** Called with the saved project id on success. */
  onSuccess?: (id: string) => void;
  /** API path to submit to, e.g. `/api/projects` or `/api/projects/:id`. */
  submitUrl?: string;
  /** HTTP method. Defaults based on `mode` (POST for create, PATCH for edit). */
  method?: 'POST' | 'PATCH';

  // --- Legacy / compat props ---
  /** @deprecated use `submitUrl` + `method` instead. */
  mode?: 'create' | 'edit';
  /** @deprecated used to build the default submitUrl when `mode` is provided. */
  projectId?: string;
  /** @deprecated renamed to `initialValues`. */
  initial?: Partial<ProjectFormValues>;
  /** @deprecated renamed to `onSuccess`. */
  onSaved?: (id: string) => void;

  className?: string;
}

const STATUS_OPTIONS: { value: ProjectFormValues['status']; label: string }[] = [
  { value: 'ACTIVE', label: 'Активен' },
  { value: 'DONE', label: 'Завершён' },
  { value: 'ARCHIVED', label: 'В архиве' },
];

const CURRENCY_OPTIONS = ['RUB', 'USD', 'EUR', 'KZT'] as const;

/**
 * Shared create/edit form for freelance projects.
 *
 * Switches rate between `hourly` and `fixed` — only one of the two is
 * submitted, and the unused side is cleared on switch so stale input doesn't
 * leak into the payload.
 */
export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialValues,
  onSuccess,
  submitUrl,
  method,
  mode,
  projectId,
  initial,
  onSaved,
  className,
}) => {
  const router = useRouter();
  const toast = useToast();

  // Resolve canonical props with legacy fallbacks.
  const values = initialValues ?? initial;
  const effectiveMethod: 'POST' | 'PATCH' =
    method ?? (mode === 'edit' ? 'PATCH' : 'POST');
  const effectiveUrl: string =
    submitUrl ?? (projectId ? `/api/projects/${projectId}` : '/api/projects');
  const isEdit = effectiveMethod === 'PATCH';
  const done = onSuccess ?? onSaved;

  const initialMode: RateMode =
    values?.fixedPrice != null && values?.hourlyRate == null ? 'fixed' : 'hourly';

  const [rateMode, setRateMode] = React.useState<RateMode>(initialMode);
  const [name, setName] = React.useState(values?.name || '');
  const [description, setDescription] = React.useState(values?.description || '');
  const [hourlyRate, setHourlyRate] = React.useState<string>(
    values?.hourlyRate != null ? String(values.hourlyRate) : '',
  );
  const [fixedPrice, setFixedPrice] = React.useState<string>(
    values?.fixedPrice != null ? String(values.fixedPrice) : '',
  );
  const [currency, setCurrency] = React.useState(values?.currency || 'RUB');
  const [status, setStatus] = React.useState<ProjectFormValues['status']>(
    values?.status || 'ACTIVE',
  );

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const switchRateMode = (next: RateMode) => {
    if (next === rateMode) return;
    // Clear the side that's being hidden so stale input never ships.
    if (next === 'hourly') setFixedPrice('');
    else setHourlyRate('');
    setRateMode(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- Validation ---
    if (!name.trim()) {
      const msg = 'Введите название проекта';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (rateMode === 'hourly' && hourlyRate !== '') {
      const h = Number(hourlyRate);
      if (Number.isNaN(h) || h < 0) {
        const msg = 'Ставка должна быть неотрицательным числом';
        setError(msg);
        toast.error(msg);
        return;
      }
    }
    if (rateMode === 'fixed' && fixedPrice !== '') {
      const f = Number(fixedPrice);
      if (Number.isNaN(f) || f < 0) {
        const msg = 'Фикс. стоимость должна быть неотрицательным числом';
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setBusy(true);
    setError(null);

    const payload: Record<string, unknown> = {
      name: name.trim(),
      currency: currency.toUpperCase(),
    };
    if (description.trim()) payload.description = description.trim();

    if (rateMode === 'hourly' && hourlyRate !== '') {
      payload.hourlyRate = Number(hourlyRate);
      if (isEdit) payload.fixedPrice = null;
    } else if (rateMode === 'fixed' && fixedPrice !== '') {
      payload.fixedPrice = Number(fixedPrice);
      if (isEdit) payload.hourlyRate = null;
    } else if (isEdit) {
      // Both empty on edit — explicitly clear both so backend drops old value.
      payload.hourlyRate = null;
      payload.fixedPrice = null;
    }

    if (isEdit) payload.status = status;

    try {
      let id = projectId;
      if (effectiveMethod === 'POST') {
        const res = await api.post<{ id: string }>(effectiveUrl, payload);
        id = res?.id;
      } else {
        await api.patch(effectiveUrl, payload);
      }

      toast.success(isEdit ? 'Проект сохранён' : 'Проект создан');

      if (done && id) {
        done(id);
      } else if (id) {
        router.push(`/freelance/projects/${id}`);
      } else {
        router.push('/freelance/projects');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить';
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={cn(className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="pf-name"
            className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]"
          >
            Название
          </label>
          <Input
            id="pf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Лендинг для кофейни"
            className="mt-2"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label
            htmlFor="pf-desc"
            className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]"
          >
            Описание
          </label>
          <textarea
            id="pf-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={5000}
            className={cn(
              'mt-2 w-full rounded-2xl border border-stone/30 bg-cream px-4 py-3',
              'text-sm text-[#3d3b38] placeholder:text-stone/50',
              'focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40',
            )}
            placeholder="Короткое описание, скоуп, сроки."
          />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]">
            Режим оплаты
          </span>
          <div
            role="tablist"
            aria-label="Режим оплаты"
            className="mt-2 inline-flex rounded-full border border-stone/30 bg-cream p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={rateMode === 'hourly'}
              onClick={() => switchRateMode('hourly')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                rateMode === 'hourly' ? 'bg-coral text-cream' : 'text-[#3d3b38] hover:text-coral',
              )}
            >
              Почасовой
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rateMode === 'fixed'}
              onClick={() => switchRateMode('fixed')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                rateMode === 'fixed' ? 'bg-coral text-cream' : 'text-[#3d3b38] hover:text-coral',
              )}
            >
              Фиксированный
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {rateMode === 'hourly' ? (
            <div>
              <label
                htmlFor="pf-rate"
                className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]"
              >
                Ставка (₽/час)
              </label>
              <Input
                id="pf-rate"
                type="number"
                min={0}
                step="1"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="2500"
                className="mt-2"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="pf-fixed"
                className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]"
              >
                Фикс. стоимость
              </label>
              <Input
                id="pf-fixed"
                type="number"
                min={0}
                step="1"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
                placeholder="80000"
                className="mt-2"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="pf-currency"
              className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]"
            >
              Валюта
            </label>
            <select
              id="pf-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={cn(
                'mt-2 h-10 w-full rounded-full border border-stone/30 bg-cream px-4',
                'text-sm text-[#3d3b38] focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40',
              )}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && (
          <div>
            <label
              htmlFor="pf-status"
              className="text-[10px] uppercase tracking-[0.22em] text-[#6b6966]"
            >
              Статус
            </label>
            <select
              id="pf-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectFormValues['status'])}
              className={cn(
                'mt-2 h-10 w-full rounded-full border border-stone/30 bg-cream px-4',
                'text-sm text-[#3d3b38] focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40',
              )}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="text-xs text-red" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => router.back()}
            disabled={busy}
          >
            Отмена
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={busy}>
            {isEdit ? 'Сохранить' : 'Создать проект'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

ProjectForm.displayName = 'ProjectForm';
