'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button, Card, Input, cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

/**
 * Shape returned by `GET /api/companies/:slug`. The backend resolves the
 * membership and annotates `myRole` on the payload so the UI can gate owner
 * features without a second round-trip.
 */
type CompanyDetail = {
  id: string;
  slug: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusM?: number | null;
  workStartHour?: number | null;
  workEndHour?: number | null;
  timezone?: string | null;
  myRole?: 'OWNER' | 'MANAGER' | 'EMPLOYEE' | string;
};

const TIMEZONES = [
  'Asia/Almaty',
  'Asia/Aqtobe',
  'Asia/Qyzylorda',
  'Asia/Atyrau',
  'Asia/Oral',
  'Europe/Moscow',
  'UTC',
];

/** Convert integer hour (0–23) to `HH:00` for `<input type="time">`. */
function hourToTimeStr(h: number | null | undefined): string {
  if (h == null || Number.isNaN(h)) return '';
  const hh = Math.max(0, Math.min(23, Math.floor(h)));
  return `${String(hh).padStart(2, '0')}:00`;
}

/** Parse the `HH:MM` value back to an integer hour — backend wants int, not float. */
function timeStrToHour(s: string): number | null {
  if (!s) return null;
  const [hh] = s.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(hh)) return null;
  return Math.max(0, Math.min(23, hh));
}

export default function SettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const toast = useToast();

  const swrKey = slug ? `/api/companies/${slug}` : null;
  const { data, mutate, error, isLoading } = useSWR<CompanyDetail>(swrKey, fetcher);

  const [form, setForm] = React.useState<CompanyDetail | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveErr, setSaveErr] = React.useState<string | null>(null);

  // Populate the form once the server response lands. We intentionally only
  // hydrate when the user hasn't started editing (form === null) so in-flight
  // edits survive background revalidation.
  React.useEffect(() => {
    if (data && !form) {
      setForm(data);
    }
  }, [data, form]);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[#E85A4F] tracking-tight">
          Не удалось загрузить. Попробуйте обновить.
        </p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => mutate()}>
          Повторить
        </Button>
      </div>
    );
  }

  if (isLoading || !data || !form) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-16 w-64 rounded-md bg-[#D8C3A5]/40 animate-pulse" />
        <div className="h-96 w-full rounded-2xl bg-[#D8C3A5]/30 animate-pulse" />
      </div>
    );
  }

  // Role gate — only OWNER sees the settings form. MANAGER / EMPLOYEE get a
  // "Нет доступа" screen even though the PATCH endpoint also admits MANAGER,
  // because the product surface here is owner-only.
  if (data.myRole !== 'OWNER') {
    return (
      <div className="py-24 text-center">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70">Доступ</div>
        <h1
          className="mt-3 text-4xl tracking-tight text-[#8E8D8A]"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
        >
          Нет доступа
        </h1>
        <p className="mt-3 text-sm text-[#8E8D8A]/70">
          Настройки компании доступны только владельцу.
        </p>
      </div>
    );
  }

  const update = <K extends keyof CompanyDetail>(k: K, v: CompanyDetail[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setSaveErr(null);
    try {
      // Only send keys the UpdateCompanyDto schema accepts. Note backend uses
      // `latitude`/`longitude` (not `lat`/`lng`) and integer `workStartHour` /
      // `workEndHour` in 0–23.
      const payload: Record<string, unknown> = {
        name: form.name,
      };
      if (form.address != null) payload.address = form.address;
      if (form.latitude != null) payload.latitude = form.latitude;
      if (form.longitude != null) payload.longitude = form.longitude;
      if (form.geofenceRadiusM != null) payload.geofenceRadiusM = form.geofenceRadiusM;
      if (form.workStartHour != null) payload.workStartHour = Math.floor(form.workStartHour);
      if (form.workEndHour != null) payload.workEndHour = Math.floor(form.workEndHour);
      if (form.timezone != null) payload.timezone = form.timezone;

      const updated = await api.patch<CompanyDetail>(`/api/companies/${form.id}`, payload);
      // Optimistically write the server response, then revalidate so the SWR
      // cache reflects the authoritative state (including any fields the
      // server normalized).
      setForm((prev) => ({ ...(prev ?? updated), ...updated }));
      await mutate(
        (cur) => ({ ...(cur ?? updated), ...updated }),
        { revalidate: true },
      );
      toast.success('Сохранено', { description: 'Настройки компании обновлены.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось сохранить';
      setSaveErr(msg);
      toast.error('Ошибка сохранения', { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const radius = form.geofenceRadiusM ?? 150;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/70">Настройки</div>
          <h1
            className="mt-2 text-5xl md:text-6xl tracking-tight text-[#8E8D8A]"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            Компания
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saveErr && <span className="text-[11px] text-[#E85A4F]">{saveErr}</span>}
          <Button onClick={save} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </div>
      </div>

      <Card eyebrow="Общее" title="Название и адрес">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
              Название
            </span>
            <Input value={form.name ?? ''} onChange={(e) => update('name', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">Адрес</span>
            <Input
              value={form.address ?? ''}
              onChange={(e) => update('address', e.target.value || null)}
            />
          </label>
        </div>
      </Card>

      <Card eyebrow="Геолокация" title="Точка чек-ина">
        <div className="grid gap-5 md:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
              Широта
            </span>
            <Input
              type="number"
              step="0.000001"
              value={form.latitude ?? ''}
              onChange={(e) =>
                update('latitude', e.target.value === '' ? null : Number(e.target.value))
              }
              placeholder="43.238949"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
              Долгота
            </span>
            <Input
              type="number"
              step="0.000001"
              value={form.longitude ?? ''}
              onChange={(e) =>
                update('longitude', e.target.value === '' ? null : Number(e.target.value))
              }
              placeholder="76.889709"
            />
          </label>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#8E8D8A]/50 self-end pb-3">
            Карта — во второй итерации
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
              Радиус геозоны
            </span>
            <span
              className="tabular-nums text-2xl text-[#8E8D8A]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {radius}
              <span className="ml-1 text-[11px] uppercase tracking-[0.22em] text-[#8E8D8A]/60">
                м
              </span>
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={2000}
            step={10}
            value={radius}
            onChange={(e) => update('geofenceRadiusM', Number(e.target.value))}
            className={cn(
              'mt-3 w-full appearance-none bg-transparent',
              '[&::-webkit-slider-runnable-track]:h-[2px]',
              '[&::-webkit-slider-runnable-track]:bg-[#8E8D8A]/30',
              '[&::-webkit-slider-runnable-track]:rounded-full',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
              '[&::-webkit-slider-thumb]:bg-[#E98074]',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:-mt-[9px]',
              '[&::-webkit-slider-thumb]:shadow',
            )}
          />
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]/50">
            <span>20 м</span>
            <span>2000 м</span>
          </div>
        </div>
      </Card>

      <Card eyebrow="Рабочий день" title="График">
        <div className="grid gap-5 md:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
              Начало
            </span>
            <Input
              type="time"
              step={3600}
              value={hourToTimeStr(form.workStartHour)}
              onChange={(e) => update('workStartHour', timeStrToHour(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">Конец</span>
            <Input
              type="time"
              step={3600}
              value={hourToTimeStr(form.workEndHour)}
              onChange={(e) => update('workEndHour', timeStrToHour(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/70">
              Таймзона
            </span>
            <select
              value={form.timezone ?? 'Asia/Almaty'}
              onChange={(e) => update('timezone', e.target.value)}
              className="h-10 rounded-full border border-[#8E8D8A]/30 bg-transparent px-4 text-sm text-[#8E8D8A] focus:outline-none focus:border-[#E98074]/60"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>
    </div>
  );
}
