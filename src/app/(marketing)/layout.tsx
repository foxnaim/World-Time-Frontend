import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Tact — Экосистема учёта времени',
  description:
    'Tact by AOne Agency — учёт рабочего времени для бизнеса и фрилансеров. QR, геозоны, анти-фрод, отчёты в Google Sheets.',
  openGraph: {
    title: 'Tact — Экосистема учёта времени',
    description:
      'QR-сканер, геозоны, отчёты. Для команд и фрилансеров.',
    type: 'website',
    siteName: 'Tact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tact — Экосистема учёта времени',
    description: 'QR-сканер, геозоны, отчёты. Для команд и фрилансеров.',
  },
};

export const viewport: Viewport = {
  themeColor: '#EAE7DC',
  width: 'device-width',
  initialScale: 1,
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
