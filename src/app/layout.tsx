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
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'WorkTime — учёт рабочего времени',
    template: '%s — WorkTime',
  },
  description:
    'WorkTime — современный сервис учёта рабочего времени для команд. Telegram-бот, офисный терминал и аналитика в едином редакционном интерфейсе.',
  keywords: [
    'учёт рабочего времени',
    'тайм-трекинг',
    'WorkTime',
    'Telegram бот',
    'HR',
    'аналитика команд',
  ],
  authors: [{ name: 'WorkTime' }],
  creator: 'WorkTime',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    title: 'WorkTime — учёт рабочего времени',
    description:
      'Современный сервис учёта рабочего времени для команд: Telegram-бот, офисный терминал и редакционная аналитика.',
    siteName: 'WorkTime',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkTime — учёт рабочего времени',
    description:
      'Современный сервис учёта рабочего времени для команд. Telegram-бот, офисный терминал и аналитика.',
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
