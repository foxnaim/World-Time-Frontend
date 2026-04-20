import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerUser } from '@/lib/auth-server';

export const metadata: Metadata = {
  title: 'Work Tact — Экосистема учёта времени',
  description:
    'Work Tact — учёт рабочего времени для бизнеса и фрилансеров. QR, геозоны, анти-фрод, отчёты в Google Sheets.',
  openGraph: {
    title: 'Work Tact — Экосистема учёта времени',
    description: 'QR-сканер, геозоны, отчёты. Для команд и фрилансеров.',
    type: 'website',
    siteName: 'Work Tact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work Tact — Экосистема учёта времени',
    description: 'QR-сканер, геозоны, отчёты. Для команд и фрилансеров.',
  },
};

export const viewport: Viewport = {
  themeColor: '#EAE7DC',
  width: 'device-width',
  initialScale: 1,
};

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();
  if (user) {
    redirect('/dashboard');
  }
  return <>{children}</>;
}
