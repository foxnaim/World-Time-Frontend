'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, cn } from '@tact/ui';
import { api } from '@/lib/api';

export type RateMode = 'hourly' | 'fixed';

export interface ProjectFormValues {
  name: string;
  description?: string | null;
  hourlyRate?: number | null;
  fixedPrice?: number | null;
  currency: string;
  status: 'ACTIVE' | 'DONE' | 'ARCHIVED';
}

export interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initial?: Partial<ProjectFormValues>;
  onSaved?: (id: string) => void;
  className?: string;
}

const STATUS_OPTIONS: { value: ProjectFormValues['status']; label: string }[] = [
  { value: 'ACTIVE', label: 'Активен' },
  { value: 'DONE', label: 'Завершён' },
  { value: 'ARCHIVED', label: 'В архиве' },
];

/**
 * Shared create/edit form for freelance projects.
 *
 * Switches rate between `hourly` and `fixed` — only one of the two is
 * submitted, matching the backend `CreateProjectDto` schema.
 */
export const ProjectForm: React.FC<ProjectFormProps> = ({
  mode,
  projectId,
  initial,
  onSaved,
  className,
}) => {
  const router = useRouter();

  const initialMode: RateMode =
    initial?.fixedPrice != null && initial?.hourlyRate == null ? 'fixed' : 'hourly';

  const [rateMode, setRateMode] = React.useState<RateMode>(initialMode);
  const [name, setName] = React.useState(initial?.name || '');
  const [description, setDescription] = React.useState(initial?.description || '');
  const [hourlyRate, setHourlyRate] = React.useState<string>(
    initial?.hourlyRate != null ? String(initial.hourlyRate) : '',
  );
  const [fixedPrice, setFixedPrice] = React.useState<string>(
    initial?.fixedPrice != null ? String(initial.fixedPrice) : '',
  );
  const [currency, setCurrency] = React.useState(initial?.currency || 'RUB');
  const [status, setStatus] = React.useState<ProjectFormValues['status']>(
    initial?.status || 'ACTIVE',
  );

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Введите название проекта');
      return;
    }
    setBusy(true);
    setError(null);

    const payload: Record<string, unknown> = {
      name: name.trim(),
      currency: currency.toUpperCase(),
    };
    if (description.trim()) payload.description = description.trim();
    if (rateMode === 'hourly') {
      const h = Number(hourlyRate);
      if (hourlyRate && !Number.isNaN(h)) payload.hourlyRate = h;
    } else {
      const f = Number(fixedPrice);
      if (fixedPrice && !Number.isNaN(f)) payload.fixedPrice = f;
    }
    if (mode === 'edit') payload.status = status;

    try {
      let id = projectId;
      if (mode === 'create') {
        const res = await api.post<{ id: string }>('/api/projects', payload);
        id = res?.id;
      } else if (projectId) {
        await api.patch(`/api/projects/${projectId}`, payload);
      }
      if (onSaved && id) {
        onSaved(id);
      } else if (id) {
        router.push(`/freelance/projects/${id}`);
      } else {
        router.push('/freelance/projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
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
            className="text-[10px] uppercase tracking-[0.22em] text-stone/70"
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
            className="text-[10px] uppercase tracking-[0.22em] text-stone/70"
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
              'text-sm text-stone placeholder:text-stone/50',
              'focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40',
            )}
            placeholder="Короткое описание, скоуп, сроки."
          />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-stone/70">
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
              onClick={() => setRateMode('hourly')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                rateMode === 'hourly'
                  ? 'bg-coral text-cream'
                  : 'text-stone hover:text-coral',
              )}
            >
              Почасовой
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rateMode === 'fixed'}
              onClick={() => setRateMode('fixed')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                rateMode === 'fixed'
                  ? 'bg-coral text-cream'
                  : 'text-stone hover:text-coral',
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
                className="text-[10px] uppercase tracking-[0.22em] text-stone/70"
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
                className="text-[10px] uppercase tracking-[0.22em] text-stone/70"
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
              className="text-[10px] uppercase tracking-[0.22em] text-stone/70"
            >
              Валюта
            </label>
            <select
              id="pf-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={cn(
                'mt-2 h-10 w-full rounded-full border border-stone/30 bg-cream px-4',
                'text-sm text-stone focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40',
              )}
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="KZT">KZT</option>
            </select>
          </div>
        </div>

        {mode === 'edit' && (
          <div>
            <label
              htmlFor="pf-status"
              className="text-[10px] uppercase tracking-[0.22em] text-stone/70"
            >
              Статус
            </label>
            <select
              id="pf-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectFormValues['status'])}
              className={cn(
                'mt-2 h-10 w-full rounded-full border border-stone/30 bg-cream px-4',
                'text-sm text-stone focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40',
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
            {mode === 'create' ? 'Создать проект' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

ProjectForm.displayName = 'ProjectForm';
