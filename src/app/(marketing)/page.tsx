import type { Metadata } from 'next';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Segments } from '@/components/landing/segments';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Features } from '@/components/landing/features';
import { Pricing } from '@/components/landing/pricing';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { getServerUser } from '@/lib/auth-server';

export const metadata: Metadata = {
  title: 'Work Tact — Учёт времени для бизнеса и фрилансеров',
  description: 'QR-сканер, геозоны, анти-фрод и отчёты в Google Sheets. Начните за 5 минут.',
  alternates: {
    canonical: '/',
  },
};

export default async function MarketingPage() {
  // Even though `(marketing)/layout.tsx` redirects authenticated users to
  // `/dashboard`, we still compute the auth flag here so the Header CTA is
  // correct in any edge case where the redirect is disabled (e.g. preview
  // builds, a/b tests, or future UX where auth users can browse the landing).
  const user = await getServerUser();
  const authenticated = Boolean(user);

  return (
    <main className="min-h-screen bg-cream text-stone antialiased">
      <Header authenticated={authenticated} />
      <Hero />
      <Segments />
      <HowItWorks />
      <Features />
      <Pricing />
      <Cta />
      <Footer />
    </main>
  );
}
