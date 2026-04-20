'use client';

import * as React from 'react';
import useSWR from 'swr';
import { cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { FREELANCER_TIERS, type FreelancerTierKey } from '@/lib/tiers';
import {
  type Currency,
  CURRENCY_META,
  detectBrowserCurrency,
} from '@/lib/currency';
import { useFxRates, formatFromRub } from '@/lib/fx';
import { useLang } from '@/i18n/context';

type MySubscription = {
  subscription: {
    tier: FreelancerTierKey;
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
    projectLimit: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  limits: {
    projectLimit: number;
    statsHistoryMonths: number;
    sheetsExport: boolean;
    prioritySupport: boolean;
  };
};

type ChangeTierResp = { ok: boolean; subscription: MySubscription['subscription'] };

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function FreelancerBillingPage() {
  const { t } = useLang();
  const toast = useToast();
  const [pending, setPending] = React.useState<FreelancerTierKey | null>(null);
  const [currency, setCurrency] = React.useState<Currency>('RUB');

  React.useEffect(() => {
    setCurrency(detectBrowserCurrency());
  }, []);

  const { data: billing, mutate } = useSWR<MySubscription>(
    '/api/billing/freelancer/my',
    fetcher,
  );
  const rates = useFxRates();

  function statusCopy(status: MySubscription['subscription']['status']): {
    label: string;
    tone: 'ok' | 'warn' | 'bad';
  } {
    switch (status) {
      case 'ACTIVE':
        return { label: t('freelanceBilling.statusActive'), tone: 'ok' };
      case 'TRIALING':
        return { label: t('freelanceBilling.statusTrialing'), tone: 'ok' };
      case 'PAST_DUE':
        return { label: t('freelanceBilling.statusPastDue'), tone: 'warn' };
      case 'CANCELED':
        return { label: t('freelanceBilling.statusCanceled'), tone: 'bad' };
      default:
        return { label: status, tone: 'warn' };
    }
  }

  async function handleSelect(tier: FreelancerTierKey) {
    if (tier === billing?.subscription.tier) return;
    setPending(tier);
    try {
      const res = await api.post<ChangeTierResp>(
        '/api/billing/freelancer/change-tier',
        { tier },
      );
      toast.success(t('freelanceBilling.toastChangedTitle'), {
        description: t('freelanceBilling.toastChangedDesc', { tier: res.subscription.tier }),
      });
      await mutate();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('freelanceBilling.toastErrorDesc');
      toast.error(t('freelanceBilling.toastErrorTitle'), { description: msg });
    } finally {
      setPending(null);
    }
  }

  const current = billing?.subscription.tier;
  const status = billing ? statusCopy(billing.subscription.status) : null;
  const presets = Object.values(FREELANCER_TIERS);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            {t('freelanceBilling.eyebrow')}
          </div>
          <h1
            className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#3d3b38]"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            {t('freelanceBilling.title')}
          </h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            {t('freelanceBilling.currencyEyebrow')}
          </div>
          <div className="mt-1 text-sm text-[#3d3b38]" title={t('freelanceBilling.currencyTitle')}>
            {CURRENCY_META[currency].flag} {currency} · {CURRENCY_META[currency].symbol}
          </div>
        </div>
      </div>

      {billing && (
        <div className="rounded-xl border border-[#8E8D8A]/25 bg-[#EAE7DC] p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              {t('freelanceBilling.currentPlanEyebrow')}
            </div>
            <div
              className="text-2xl text-[#3d3b38]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {billing.subscription.tier}
            </div>
            <div className="text-xs text-[#6b6966]">
              {t('freelanceBilling.projectLimit', { limit: billing.subscription.projectLimit })}
              {' · '}
              {t('freelanceBilling.validUntil', { date: formatDate(billing.subscription.currentPeriodEnd) })}
            </div>
          </div>
          {status && (
            <span
              className={cn(
                'self-start text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border',
                status.tone === 'ok' &&
                  'border-[#7ea87e]/50 text-[#4a7a4a] bg-[#7ea87e]/10',
                status.tone === 'warn' &&
                  'border-[#E98074]/50 text-[#E98074] bg-[#E98074]/10',
                status.tone === 'bad' &&
                  'border-[#E85A4F]/50 text-[#E85A4F] bg-[#E85A4F]/10',
              )}
            >
              {status.label}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((p) => {
          const isCurrent = p.key === current;
          const isBusy = pending === p.key;
          const priceRub = p.basePriceRub;
          return (
            <div
              key={p.key}
              className={cn(
                'rounded-xl border p-6 flex flex-col gap-4 transition-colors',
                isCurrent
                  ? 'border-[#E98074] bg-[#E98074]/5'
                  : 'border-[#8E8D8A]/25 bg-[#EAE7DC]',
              )}
            >
              <div className="flex items-start justify-between">
                <h2
                  className="text-3xl text-[#3d3b38]"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {p.name}
                </h2>
                {isCurrent && (
                  <span className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border border-[#E98074]/50 text-[#E98074]">
                    {t('freelanceBilling.yourBadge')}
                  </span>
                )}
              </div>
              <div>
                <div
                  className="text-3xl text-[#3d3b38]"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {priceRub === null
                    ? t('freelanceBilling.priceOnRequest')
                    : formatFromRub(priceRub, currency, rates)}
                </div>
                <div className="text-xs text-[#6b6966] mt-1">{p.unitHint}</div>
              </div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#6b6966]">
                {p.capLine}
              </div>
              <ul className="flex flex-col gap-2 text-sm text-[#3d3b38]">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[#E98074] mt-[1px]">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSelect(p.key)}
                disabled={isCurrent || isBusy}
                className={cn(
                  'mt-auto w-full rounded-md px-4 py-2.5 text-xs uppercase tracking-[0.22em] transition-colors',
                  isCurrent
                    ? 'border border-[#8E8D8A]/30 text-[#6b6966] cursor-default'
                    : 'bg-[#E98074] text-white hover:bg-[#d46e62]',
                  isBusy && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isCurrent
                  ? t('freelanceBilling.btnCurrent')
                  : isBusy
                  ? t('freelanceBilling.btnChanging')
                  : t('freelanceBilling.btnSelect')}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6b6966] leading-relaxed max-w-2xl">
        {t('freelanceBilling.disclaimer')}
      </p>
    </div>
  );
}
