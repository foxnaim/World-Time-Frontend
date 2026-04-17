'use client';

import * as React from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';

export interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional fallback while hydrating user data. Defaults to a minimal loader. */
  fallback?: React.ReactNode;
}

interface AuthMe {
  id: string;
  email?: string;
  telegramId?: string | number;
  username?: string;
  companies?: Array<{ id: string; slug: string; name: string }>;
}

const meFetcher = async (): Promise<AuthMe> => {
  const res = await api.get<AuthMe>('/auth/me');
  return res;
};

/**
 * Client-side auth guard.
 *
 * The hard gate (cryptographic JWT verification + refresh + redirect) is
 * enforced in `src/middleware.ts` before this component ever renders. This
 * component trusts the route and only hydrates user data via `/auth/me` for
 * downstream client consumers. Public API (children, fallback) is preserved.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { data, isLoading } = useSWR<AuthMe>('/auth/me', meFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (isLoading && !data) {
    return (
      fallback ?? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-3 text-stone/60">
            <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.28em]">
              Проверяем сессию
            </span>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

AuthGuard.displayName = 'AuthGuard';
