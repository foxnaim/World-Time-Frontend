'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Card } from '@tact/ui';
import { AuthGuard } from '@/components/shared/auth-guard';
import { FormField } from '@/components/ui/form-field';
import { NumberInput } from '@/components/ui/number-input';
import { Slider } from '@/components/ui/slider';
import { StepProgress } from '@/components/ui/step-progress';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

// ----------------------------------------------------------------------------

interface CompanyForm {
  name: string;
  slug: string;
  address: string;
  lat: number;
  lng: number;
  geofenceRadius: number; // meters
  workStart: string; // "09:00"
  workEnd: string; // "18:00"
  timezone: string;
}

interface CompanyCreateResponse {
  id: string;
  slug: string;
}

const DEFAULTS: CompanyForm = {
  name: '',
  slug: '',
  address: '',
  lat: 43.238949,
  lng: 76.889709,
  geofenceRadius: 100,
  workStart: '09:00',
  workEnd: '18:00',
  timezone: 'Asia/Almaty',
};

const TIMEZONES = [
  'Asia/Almaty',
  'Asia/Aqtobe',
  'Asia/Aqtau',
  'Europe/Moscow',
  'Europe/Kyiv',
  'Asia/Tashkent',
  'Asia/Bishkek',
  'UTC',
];

const STEPS = ['Компания', 'Адрес', 'График', 'Проверка'] as const;

function slugify(name: string): string {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  };
  return name
    .toLowerCase()
    .trim()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// ----------------------------------------------------------------------------

export default function OnboardingCompanyPage() {
  return (
    <AuthGuard>
      <OnboardingCompanyView />
    </AuthGuard>
  );
}

function OnboardingCompanyView() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<CompanyForm>(DEFAULTS);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof CompanyForm, string>>>({});
  const [slugTouched, setSlugTouched] = React.useState(false);

  const update = <K extends keyof CompanyForm>(key: K, val: CompanyForm[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Auto-sync slug from name until user manually edits it
  React.useEffect(() => {
    if (!slugTouched) {
      const s = slugify(form.name);
      setForm((f) => (f.slug === s ? f : { ...f, slug: s }));
    }
  }, [form.name, slugTouched]);

  const validateStep = (s: number): boolean => {
    const next: typeof errors = {};
    if (s === 0) {
      if (form.name.trim().length < 2) next.name = 'Укажите название';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug) || form.slug.length < 2 || form.slug.length > 40)
        next.slug = 'Только латиница, цифры, дефис (kebab-case, 2–40 симв.)';
    }
    if (s === 1) {
      if (form.address.trim().length < 3) next.address = 'Укажите адрес';
      if (!Number.isFinite(form.lat) || form.lat < -90 || form.lat > 90) next.lat = 'Широта −90…90';
      if (!Number.isFinite(form.lng) || form.lng < -180 || form.lng > 180)
        next.lng = 'Долгота −180…180';
    }
    if (s === 2) {
      if (!/^\d{2}:\d{2}$/.test(form.workStart)) next.workStart = 'Формат чч:мм';
      if (!/^\d{2}:\d{2}$/.test(form.workEnd)) next.workEnd = 'Формат чч:мм';
      if (
        /^\d{2}:\d{2}$/.test(form.workStart) &&
        /^\d{2}:\d{2}$/.test(form.workEnd) &&
        form.workStart >= form.workEnd
      ) {
        next.workEnd = 'Конец должен быть после начала';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;
    setSubmitting(true);
    try {
      const res = await api.post<CompanyCreateResponse>('/companies', {
        name: form.name.trim(),
        slug: form.slug,
        address: form.address.trim(),
        latitude: form.lat,
        longitude: form.lng,
        geofenceRadiusM: form.geofenceRadius,
        workStartHour: Number.parseInt(form.workStart.slice(0, 2), 10),
        workEndHour: Number.parseInt(form.workEnd.slice(0, 2), 10),
        timezone: form.timezone,
      });
      toast.success('Компания создана', { description: res.slug });
      router.push(`/company/${res.slug}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось создать компанию';
      toast.error('Ошибка', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-xl"
    >
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.28em] text-stone/60 mb-3">
          Онбординг · Компания
        </p>
        <h1
          className="text-3xl md:text-4xl font-medium tracking-tight text-stone"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Создадим вашу компанию
        </h1>
        <p className="mt-2 text-sm text-stone/70">
          Четыре шага, одна минута — и сотрудники смогут отмечаться.
        </p>
      </div>

      <div className="mb-8">
        <StepProgress steps={STEPS as unknown as string[]} current={step} />
      </div>

      <Card className="!p-6 md:!p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {step === 0 && (
              <div className="space-y-5">
                <FormField
                  label="Название компании"
                  placeholder="AOne Agency"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  error={errors.name}
                  autoFocus
                />
                <FormField
                  label="URL-идентификатор"
                  prefix="worktime.app/"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update('slug', e.target.value.toLowerCase());
                  }}
                  hint="Используется в адресе дашборда и отчётах"
                  error={errors.slug}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <FormField
                  label="Адрес офиса"
                  placeholder="пр. Абая, 150, Алматы"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  error={errors.address}
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Широта (lat)"
                    value={form.lat}
                    onChange={(v) => update('lat', v)}
                    step={0.000001}
                    min={-90}
                    max={90}
                  />
                  <NumberInput
                    label="Долгота (lng)"
                    value={form.lng}
                    onChange={(v) => update('lng', v)}
                    step={0.000001}
                    min={-180}
                    max={180}
                  />
                </div>
                {(errors.lat || errors.lng) && (
                  <p className="text-xs text-red" role="alert">
                    {errors.lat ?? errors.lng}
                  </p>
                )}
                <Slider
                  label="Радиус геозоны"
                  suffix="м"
                  value={form.geofenceRadius}
                  onChange={(v) => update('geofenceRadius', v)}
                  min={25}
                  max={1000}
                  step={25}
                />
                <p className="text-xs text-stone/60">
                  Сотрудники смогут отмечаться, находясь в пределах указанного радиуса от офиса.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Начало дня"
                    type="time"
                    value={form.workStart}
                    onChange={(e) => update('workStart', e.target.value)}
                    error={errors.workStart}
                  />
                  <FormField
                    label="Конец дня"
                    type="time"
                    value={form.workEnd}
                    onChange={(e) => update('workEnd', e.target.value)}
                    error={errors.workEnd}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="tz"
                    className="text-[10px] uppercase tracking-[0.22em] text-stone"
                  >
                    Часовой пояс
                  </label>
                  <select
                    id="tz"
                    value={form.timezone}
                    onChange={(e) => update('timezone', e.target.value)}
                    className="h-10 w-full bg-transparent border-0 border-b border-stone/40 px-0 py-2 text-stone focus:outline-none focus:border-coral transition-colors duration-200 rounded-none"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone/60 mb-3">
                    Проверьте данные
                  </p>
                  <dl className="divide-y divide-stone/20">
                    <ReviewRow label="Компания" value={form.name} />
                    <ReviewRow label="URL" value={`worktime.app/${form.slug}`} />
                    <ReviewRow label="Адрес" value={form.address} />
                    <ReviewRow
                      label="Координаты"
                      value={`${form.lat.toFixed(6)}, ${form.lng.toFixed(6)}`}
                    />
                    <ReviewRow label="Геозона" value={`${form.geofenceRadius} м`} />
                    <ReviewRow label="График" value={`${form.workStart} – ${form.workEnd}`} />
                    <ReviewRow label="Часовой пояс" value={form.timezone} />
                  </dl>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-stone/20 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={goPrev}
            disabled={step === 0 || submitting}
          >
            ← Назад
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={goNext}
              disabled={submitting}
            >
              Далее →
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? 'Создаём…' : 'Создать компанию'}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

const ReviewRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5">
    <dt className="text-[10px] uppercase tracking-[0.22em] text-stone/60 whitespace-nowrap">
      {label}
    </dt>
    <dd
      className="text-sm text-stone font-medium text-right"
      style={{ fontFamily: 'Fraunces, serif' }}
    >
      {value}
    </dd>
  </div>
);
