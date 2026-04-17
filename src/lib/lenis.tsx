'use client';

import Lenis from 'lenis';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type LenisContextValue = {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
  start: () => void;
  stop: () => void;
};

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
  start: () => {},
  stop: () => {},
});

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const [instance, setInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    if (prefersReducedMotion.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });

    lenisRef.current = lenis;
    setInstance(lenis);

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      setInstance(null);
    };
  }, []);

  const value = useMemo<LenisContextValue>(
    () => ({
      lenis: instance,
      scrollTo: (target, options) => {
        instance?.scrollTo(target as never, options);
      },
      start: () => instance?.start(),
      stop: () => instance?.stop(),
    }),
    [instance],
  );

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
