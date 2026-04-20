'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { cn } from '@tact/ui';
import { fetcher } from '@/lib/fetcher';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
  COMPANY_TIERS,
  type CompanyTierKey,
  type TierCard,
} from '@/lib/tiers';
import { CURRENCY_META, currencyFromTimezone } from '@/lib/currency';
import { useFxRates, formatFromRub } from '@/lib/fx';
import { useLang } from '@/i18n/context';

type CompanyDetail = {
  id: string;
  slug: string;
  name: string;
  timezone?: string | null;
};

type MySubscription = {
  subscription: {
    tier: CompanyTierKey;
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
    seatsLimit: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  limits: {
    seatsLimit: number;
    sheetsExport: boolean;
    monthlyReports: boolean;
  };
  currentSeats: number;
};

type ChangeTierResp = {
  ok: boolean;
  subscription: MySubscription['subscription'];
};

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

export default function BillingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const toast = useToast();
  const { t } = useLang();
  const [pending, setPending] = React.useState<CompanyTierKey | null>(null);

  const { data: company } = useSWR<CompanyDetail>(
    slug ? `/api/companies/${slug}` : null,
    fetcher,
  );
  const companyId = company?.id;
  // Currency is derived from the company's timezone (set when the company
  // was created). The user doesn't switch it — it reflects their region.
  const currency = currencyFromTimezone(company?.timezone);
  const rates = useFxRates();

  const { data: billing, mutate } = useSWR<MySubscription>(
    companyId ? `/api/billing/my/${companyId}` : null,
    fetcher,
  );

  function statusCopy(status: MySubscription['subscription']['status']): {
    label: string;
    tone: 'ok' | 'warn' | 'bad';
  } {
    switch (status) {
      case 'ACTIVE':
        return { label: t('billing.statusActive'), tone: 'ok' };
      case 'TRIALING':
        return { label: t('billing.statusTrialing'), tone: 'ok' };
      case 'PAST_DUE':
        return { label: t('billing.statusPastDue'), tone: 'warn' };
      case 'CANCELED':
        return { label: t('billing.statusCanceled'), tone: 'bad' };
      default:
        return { label: status, tone: 'warn' };
    }
  }

  async function handleSelect(tier: CompanyTierKey) {
    if (!companyId) return;
    if (tier === billing?.subscription.tier) return;
    if (COMPANY_TIERS[tier].contactOnly) {
      toast.toast(t('billing.contactToastTitle', { name: COMPANY_TIERS[tier].name }), {
        description: t('billing.contactToastDesc'),
      });
      return;
    }
    setPending(tier);
    try {
      const res = await api.post<ChangeTierResp>(
        `/api/billing/${companyId}/change-tier`,
        { tier },
      );
      toast.success(t('billing.changeSuccessTitle'), {
        description: t('billing.changeSuccessDesc', { tier: res.subscription.tier }),
      });
      await mutate();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('billing.changeErrorFallback');
      toast.error(t('billing.changeErrorTitle'), { description: msg });
    } finally {
      setPending(null);
    }
  }

  const current = billing?.subscription.tier;
  const status = billing ? statusCopy(billing.subscription.status) : null;
  const presets: TierCard<CompanyTierKey>[] = Object.values(COMPANY_TIERS);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            {t('billing.eyebrow')}
          </div>
          <h1
            className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#3d3b38]"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            {t('billing.heading')}
          </h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            {t('billing.currencyLabel')}
          </div>
          <div
            className="mt-1 text-sm text-[#3d3b38]"
            title={company?.timezone ? t('billing.timezoneTitle', { timezone: company.timezone }) : undefined}
          >
            {CURRENCY_META[currency].flag} {currency} · {CURRENCY_META[currency].symbol}
          </div>
        </div>
      </div>

      {billing && (
        <div className="rounded-xl border border-[#8E8D8A]/25 bg-[#EAE7DC] p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              {t('billing.currentTierLabel')}
            </div>
            <div
              className="text-2xl text-[#3d3b38]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {billing.subscription.tier}
            </div>
            <div className="text-xs text-[#6b6966]">
              {t('billing.seatsAndPeriod', {
                seats: String(billing.currentSeats),
                limit: String(billing.subscription.seatsLimit),
                date: formatDate(billing.subscription.currentPeriodEnd),
              })}
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
                    {t('billing.yourBadge')}
                  </span>
                )}
              </div>
              <div>
                <div
                  className="text-2xl sm:text-3xl text-[#3d3b38]"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {priceRub === null
                    ? t('billing.priceOnRequest')
                    : formatFromRub(priceRub, currency, rates)}
                </div>
                <div className="text-xs text-[#6b6966] mt-1">
                  {priceRub === null ? t('billing.unitHintOnRequest') : p.unitHint}
                </div>
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
                disabled={isCurrent || isBusy || !companyId}
                className={cn(
                  'mt-auto w-full rounded-md px-4 py-2.5 text-xs uppercase tracking-[0.22em] transition-colors',
                  isCurrent
                    ? 'border border-[#8E8D8A]/30 text-[#6b6966] cursor-default'
                    : 'bg-[#E98074] text-white hover:bg-[#d46e62]',
                  (isBusy || !companyId) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isCurrent
                  ? t('billing.btnCurrent')
                  : isBusy
                    ? t('billing.btnChanging')
                    : p.contactOnly
                      ? t('billing.btnContact')
                      : t('billing.btnSelect')}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6b6966] leading-relaxed max-w-2xl">
        {t('billing.demoNote')}
      </p>
    </div>
  );
}
