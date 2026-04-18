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
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // In dev, forcibly unregister any previously-registered SW and clear its
    // caches. Otherwise an old SW from a production build on the same origin
    // keeps serving stale JS bundles forever (browser prefers SW cache over
    // network even across next dev restarts).
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {});
      if (typeof caches !== 'undefined') {
        caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys.filter((k) => k.startsWith('tact-sw-') || k.startsWith('worktime-sw-')).map((k) => caches.delete(k)),
            ),
          )
          .catch(() => {});
      }
      return;
    }

    let cancelled = false;

    const register = () => {
      if (cancelled) return;
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        // Swallow — a failed SW registration must never break the
        // office terminal. Log for diagnostics only.
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
