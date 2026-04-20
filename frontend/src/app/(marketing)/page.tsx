import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Segments } from '@/components/landing/segments';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Features } from '@/components/landing/features';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';
import { getServerUser } from '@/lib/auth-server';
import { LangProvider } from '@/i18n/context';
import { LOCALE_COOKIE, isLocale, DEFAULT_LOCALE } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'Work Tact — Учёт времени для бизнеса и фрилансеров',
  description: 'QR-сканер, геозоны, анти-фрод и отчёты в Google Sheets. Начните за 5 минут.',
  alternates: { canonical: '/' },
};

export default async function MarketingPage() {
  const jar = await cookies();
  const rawLocale = jar.get(LOCALE_COOKIE)?.value;
  const initialLocale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const user = await getServerUser();
  const authenticated = Boolean(user);

  return (
    <LangProvider initialLocale={initialLocale}>
      <main className="min-h-screen bg-cream text-stone antialiased">
        <Header authenticated={authenticated} />
        <Hero />
        <Segments />
        <HowItWorks />
        <Features />
        <Pricing />
        <Footer />
      </main>
    </LangProvider>
  );
}
