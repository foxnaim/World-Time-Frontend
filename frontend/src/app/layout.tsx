import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { Providers } from '@/providers';
import { SkipLink } from '@/components/shared/skip-link';
import { LangProvider } from '@/i18n/context';
import { getLocale } from '@/i18n/get-locale';
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
  applicationName: 'Work Tact',
  title: {
    default: 'Work Tact — учёт рабочего времени',
    template: '%s · Work Tact',
  },
  description:
    'Work Tact — экосистема учёта рабочего времени через Telegram и QR-коды. Ритм рабочего дня для B2B офисов и фрилансеров.',
  keywords: [
    'учёт рабочего времени',
    'тайм-трекинг',
    'Work Tact',
    'Telegram бот',
    'HR',
    'аналитика команд',
  ],
  authors: [{ name: 'Work Tact' }],
  creator: 'Work Tact',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    title: 'Work Tact — учёт рабочего времени',
    description:
      'Work Tact — экосистема учёта рабочего времени через Telegram и QR-коды. Ритм рабочего дня для B2B офисов и фрилансеров.',
    siteName: 'Work Tact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work Tact — учёт рабочего времени',
    description:
      'Work Tact — экосистема учёта рабочего времени через Telegram и QR-коды. Ритм рабочего дня для B2B офисов и фрилансеров.',
  },
  appleWebApp: {
    title: 'Work Tact',
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="bg-cream text-stone font-sans antialiased min-h-screen">
        <SkipLink />
        <LangProvider initialLocale={locale}>
          <Providers>
            <div id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </div>
          </Providers>
        </LangProvider>
      </body>
    </html>
  );
}
