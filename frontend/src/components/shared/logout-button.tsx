'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, type ButtonProps } from '@tact/ui';
import { clearAuthCookies } from '@/lib/auth-cookie';

export interface LogoutButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  children?: React.ReactNode;
  /** Where to redirect after logout. Defaults to "/". */
  redirectTo?: string;
  /** Call POST /api/auth/logout before clearing cookies (best-effort). */
  callServer?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  children = 'Выйти',
  redirectTo = '/',
  callServer = true,
  variant = 'ghost',
  size = 'sm',
  ...props
}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      if (callServer) {
        // best-effort: don't block logout on server failure
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch {
          /* ignore */
        }
      }
      clearAuthCookies();
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={onLogout} disabled={loading} {...props}>
      {loading ? 'Выход…' : children}
    </Button>
  );
};

LogoutButton.displayName = 'LogoutButton';
