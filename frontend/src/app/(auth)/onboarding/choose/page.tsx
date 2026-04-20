'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@tact/ui';
import { useToast } from '@/components/ui/use-toast';

type AccountType = 'FREELANCER' | 'COMPANY';

export default function ChooseAccountTypePage() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = React.useState<AccountType | null>(null);

  const pick = async (type: AccountType) => {
    if (submitting) return;
    setSubmitting(type);
    try {
      await api.post<{ ok: boolean; accountType: AccountType }>('/api/auth/me/account-type', {
        type,
      });
      toast.success(type === 'FREELANCER' ? 'Аккаунт фрилансера создан' : 'Аккаунт компании создан');
      if (type === 'FREELANCER') {
        router.push('/freelance');
      } else {
        router.push('/onboarding/company');
      }
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось сохранить выбор';
      toast.error('Ошибка', { description: msg });
      setSubmitting(null);
    }
  };

  return (
    <main className="min-h-screen bg-cream text-[#3d3b38] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[#6b6966] mb-3">
            Work Tact · Добро пожаловать
          </div>
          <h1
            className="text-5xl md:text-6xl leading-[1.05] text-[#2a2927] mb-4"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500 }}
          >
            Как будешь пользоваться?
          </h1>
          <p className="text-[#6b6966] text-sm max-w-lg mx-auto">
            Можно выбрать одно — настройка занимает минуту. Позже переключить профиль нельзя без
            поддержки.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => pick('FREELANCER')}
            className="group text-left border border-stone/25 rounded-2xl p-7 hover:border-coral focus:border-coral focus:outline-none transition-colors bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-[10px] uppercase tracking-[0.32em] text-coral mb-3">Я один</div>
            <h2
              className="text-3xl text-[#2a2927] mb-3"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500 }}
            >
              Фрилансер
            </h2>
            <ul className="text-sm text-[#3d3b38] space-y-2 leading-relaxed">
              <li>— Трекер времени по проектам из Telegram</li>
              <li>— Реальная ставка ₽/час в конце месяца</li>
              <li>— Счёт-фактура PDF клиенту</li>
            </ul>
            <div className="mt-6 text-coral text-sm group-hover:underline">
              {submitting === 'FREELANCER' ? 'Создаём…' : 'Выбрать →'}
            </div>
          </button>

          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => pick('COMPANY')}
            className="group text-left border border-stone/25 rounded-2xl p-7 hover:border-coral focus:border-coral focus:outline-none transition-colors bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-[10px] uppercase tracking-[0.32em] text-coral mb-3">У меня команда</div>
            <h2
              className="text-3xl text-[#2a2927] mb-3"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500 }}
            >
              Компания
            </h2>
            <ul className="text-sm text-[#3d3b38] space-y-2 leading-relaxed">
              <li>— QR на входе + чекин через бота</li>
              <li>— Автоматика опозданий и переработок</li>
              <li>— Выгрузка в Google Sheets</li>
            </ul>
            <div className="mt-6 text-coral text-sm group-hover:underline">
              {submitting === 'COMPANY' ? 'Создаём…' : 'Выбрать →'}
            </div>
          </button>
        </div>

        <div className="mt-10 text-center">
          <Button variant="ghost" onClick={() => router.push('/')}>
            На главную
          </Button>
        </div>
      </div>
    </main>
  );
}
