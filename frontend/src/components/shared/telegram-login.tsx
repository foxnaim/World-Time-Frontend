'use client';

import * as React from 'react';
import Script from 'next/script';
import { cn } from '@tact/ui';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramLoginProps {
  botUsername?: string;
  onAuth?: (user: TelegramUser) => void;
  requestAccess?: 'write' | false;
  size?: 'small' | 'medium' | 'large';
  radius?: number;
  cornerRadius?: number;
  showUserPhoto?: boolean;
  lang?: string;
  className?: string;
  /**
   * If provided, Telegram will redirect the browser to this URL with auth data
   * in query params instead of invoking the onAuth callback. Useful for
   * server-side verification via /auth/telegram/verify.
   */
  dataAuthUrl?: string;
}

const CALLBACK_NAME = '__wtTelegramAuth';

declare global {
  interface Window {
    [CALLBACK_NAME]?: (user: TelegramUser) => void;
    Telegram?: unknown;
  }
}

/**
 * Renders the official Telegram Login Widget.
 *
 * Requires NEXT_PUBLIC_BOT_USERNAME at build time (or pass `botUsername`).
 * If `dataAuthUrl` is provided, the widget performs a redirect flow — otherwise
 * it invokes the `onAuth` callback via a global function attached to `window`.
 */
export const TelegramLogin: React.FC<TelegramLoginProps> = ({
  botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME,
  onAuth,
  requestAccess = 'write',
  size = 'large',
  cornerRadius,
  showUserPhoto = true,
  lang = 'ru',
  className,
  dataAuthUrl,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLocalhost, setIsLocalhost] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = window.location.hostname;
    setIsLocalhost(
      h === 'localhost' ||
        h === '127.0.0.1' ||
        h === '0.0.0.0' ||
        h.endsWith('.local'),
    );
  }, []);

  // Attach callback to window so Telegram script can find it.
  React.useEffect(() => {
    if (dataAuthUrl) return; // redirect flow, no callback
    window[CALLBACK_NAME] = (user: TelegramUser) => {
      onAuth?.(user);
    };
    return () => {
      delete window[CALLBACK_NAME];
    };
  }, [onAuth, dataAuthUrl]);

  // Inject the Telegram widget script with proper data-attrs.
  React.useEffect(() => {
    if (!botUsername) return;
    if (isLocalhost) return; // Telegram widget rejects localhost as data-auth domain
    const el = containerRef.current;
    if (!el) return;
    // Clear previous injections
    el.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', size);
    if (typeof cornerRadius === 'number') {
      script.setAttribute('data-radius', String(cornerRadius));
    }
    if (requestAccess) {
      script.setAttribute('data-request-access', requestAccess);
    }
    script.setAttribute('data-userpic', String(showUserPhoto));
    script.setAttribute('data-lang', lang);
    if (dataAuthUrl) {
      script.setAttribute('data-auth-url', dataAuthUrl);
    } else {
      script.setAttribute('data-onauth', `${CALLBACK_NAME}(user)`);
    }
    el.appendChild(script);

    return () => {
      el.innerHTML = '';
    };
  }, [botUsername, size, cornerRadius, requestAccess, showUserPhoto, lang, dataAuthUrl, isLocalhost]);

  if (isLocalhost) {
    return (
      <div
        className={cn(
          'text-xs text-stone/70 text-center px-4 py-3 rounded-md border border-dashed border-stone/30 leading-relaxed',
          className,
        )}
      >
        Telegram Login Widget не работает на <code className="mx-1 text-coral">localhost</code>
        (Telegram принимает только публичный домен через <code className="mx-1">/setdomain</code> в BotFather).
        <br />
        Используй 6-значный код из бота — это основной способ входа.
      </div>
    );
  }

  if (!botUsername) {
    return (
      <div
        className={cn(
          'text-xs text-stone/60 text-center px-4 py-3 rounded-md border border-dashed border-stone/30',
          className,
        )}
      >
        Telegram Login Widget недоступен — переменная окружения
        <code className="mx-1 text-coral">NEXT_PUBLIC_BOT_USERNAME</code>
        не задана.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('flex items-center justify-center min-h-[44px]', className)}
      aria-label="Telegram Login Widget"
    />
  );
};

TelegramLogin.displayName = 'TelegramLogin';

/**
 * Exported marker component for callers that need to ensure the widget script
 * is loaded without rendering the button (rare). Kept as a convenience.
 */
export const TelegramWidgetScriptPreload: React.FC = () => (
  <Script src="https://telegram.org/js/telegram-widget.js?22" strategy="lazyOnload" />
);
