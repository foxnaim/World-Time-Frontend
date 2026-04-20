import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Next.js navigation mocks — app router hooks are not available in jsdom.
vi.mock('next/navigation', () => {
  const push = vi.fn();
  const replace = vi.fn();
  const back = vi.fn();
  const forward = vi.fn();
  const refresh = vi.fn();
  const prefetch = vi.fn();
  return {
    useRouter: () => ({ push, replace, back, forward, refresh, prefetch }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
});

// next/font/google is a build-time loader; stub to a no-op className provider.
vi.mock('next/font/google', () => {
  const font = () => ({
    className: 'mock-font',
    style: { fontFamily: 'mock-font' },
    variable: '--font-mock',
  });
  return new Proxy(
    {},
    {
      get: () => font,
    },
  );
});
