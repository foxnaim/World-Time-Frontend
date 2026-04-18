'use client';

import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { LenisProvider } from '@/lib/lenis';
import { ToastProvider } from '@/components/ui/toast';

/**
 * Runs once on mount to evict any stale service worker left over from a
 * previous production build on the same origin. In dev we purge SWs + their
 * caches so that JS bundles aren't served from a frozen cache-first SW after
 * env or code changes. No-op in production (where the office SW is the
 * intentional caching layer).
 */
function useDevServiceWorkerCleanup(): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    void navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => {});

    if (typeof caches !== 'undefined') {
      void caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((k) => k.startsWith('tact-sw-') || k.startsWith('worktime-sw-'))
              .map((k) => caches.delete(k)),
          ),
        )
        .catch(() => {});
    }
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useDevServiceWorkerCleanup();
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: (err: unknown) => {
          // Don't retry on 4xx
          if (
            err &&
            typeof err === 'object' &&
            'status' in err &&
            typeof (err as { status: number }).status === 'number'
          ) {
            const s = (err as { status: number }).status;
            if (s >= 400 && s < 500) return false;
          }
          return true;
        },
        errorRetryCount: 3,
        dedupingInterval: 2000,
      }}
    >
      <LenisProvider>
        <ToastProvider>{children}</ToastProvider>
      </LenisProvider>
    </SWRConfig>
  );
}
