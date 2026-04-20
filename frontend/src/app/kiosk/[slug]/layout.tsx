import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

/**
 * Minimal layout for the kiosk QR check-in display.
 *
 * Intentionally outside the (dashboard) route group so it inherits the
 * root layout (fonts, globals.css) but gets NO sidebar, navbar, or any
 * dashboard chrome. The page takes over the full viewport.
 */

export const metadata: Metadata = {
  title: 'Work Tact — Kiosk',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#2a2927',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function KioskLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
