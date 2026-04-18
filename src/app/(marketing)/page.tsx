import type { Metadata } from 'next';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Segments } from '@/components/landing/segments';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Features } from '@/components/landing/features';
import { Pricing } from '@/components/landing/pricing';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Work Tact — Учёт времени для бизнеса и фрилансеров',
  description:
    'QR-сканер, геозоны, анти-фрод и отчёты в Google Sheets. Начните за 5 минут.',
  alternates: {
    canonical: '/',
  },
};

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-cream text-stone antialiased">
      <Header />
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
