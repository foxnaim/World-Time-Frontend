import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { Providers } from '@/providers';
import { SkipLink } from '@/components/shared/skip-link';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  applicationName: 'Tact',
  title: {
    default: 'Tact — учёт рабочего времени',
    template: '%s · Tact',
  },
  description:
    'Tact — экосистема учёта рабочего времени через Telegram и QR-коды. Ритм рабочего дня для B2B офисов и фрилансеров.',
  keywords: [
    'учёт рабочего времени',
    'тайм-трекинг',
    'Tact',
    'Telegram бот',
    'HR',
    'аналитика команд',
  ],
  authors: [{ name: 'Tact' }],
  creator: 'AOne Agency',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    title: 'Tact — учёт рабочего времени',
    description:
      'Tact — экосистема учёта рабочего времени через Telegram и QR-коды. Ритм рабочего дня для B2B офисов и фрилансеров.',
    siteName: 'Tact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tact — учёт рабочего времени',
    description:
      'Tact — экосистема учёта рабочего времени через Telegram и QR-коды. Ритм рабочего дня для B2B офисов и фрилансеров.',
  },
  appleWebApp: {
    title: 'Tact',
    capable: true,
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/logo.svg',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#E85A4F',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-cream text-stone font-sans antialiased min-h-screen">
        <SkipLink />
        <Providers>
          {/*
            Skip-link target. We do not render a <main> here because nested
            route-group layouts already declare their own <main> landmark
            (admin, dashboard, auth, marketing, office). Using a div with
            tabIndex={-1} lets keyboard users jump past the header without
            introducing duplicate main landmarks.
          */}
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
