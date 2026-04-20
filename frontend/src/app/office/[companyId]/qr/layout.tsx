import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { RegisterSw } from '@/components/office/register-sw';

/**
 * Minimal layout for the permanently-mounted office QR display.
 *
 * Intentionally strips all marketing/dashboard chrome: the screen should
 * show only the QR, countdown, clock and wordmark — no header, nav, or
 * scrollbars. `overflow: hidden` on the wrapper is enforced inline so the
 * page works on 1080p and 720p without chrome bleed.
 */

export const metadata: Metadata = {
  title: 'Work Tact — Check-in',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#EAE7DC',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function OfficeQrLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 overflow-hidden bg-cream"
      style={{ height: '100vh', width: '100vw' }}
    >
      <RegisterSw />
      {children}
    </div>
  );
}
