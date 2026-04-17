'use client';

import { useEffect } from 'react';

/**
 * Registers the minimal `/sw.js` service worker.
 *
 * Only runs in production on browsers that support the Service Worker API.
 * Mounted inside the office QR layout because that screen is the only
 * long-lived, always-on surface where offline/cache resilience matters.
 */
export function RegisterSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    let cancelled = false;

    const register = () => {
      if (cancelled) return;
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => {
          // Swallow — a failed SW registration must never break the
          // office terminal. Log for diagnostics only.
          // eslint-disable-next-line no-console
          console.warn('[worktime] service worker registration failed', err);
        });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', register);
    };
  }, []);

  return null;
}

export default RegisterSw;
