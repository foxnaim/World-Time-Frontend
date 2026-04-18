'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { LenisProvider } from '@/lib/lenis';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
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
