import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

// Stub landing sub-components so this stays a pure smoke test of the page shell.
vi.mock('@/components/landing/header', () => ({
  Header: () => <div data-testid="stub-header" />,
}));
vi.mock('@/components/landing/hero', () => ({
  Hero: () => (
    <section data-testid="stub-hero">
      <h1>TIME</h1>
    </section>
  ),
}));
vi.mock('@/components/landing/segments', () => ({
  Segments: () => <div data-testid="stub-segments" />,
}));
vi.mock('@/components/landing/how-it-works', () => ({
  HowItWorks: () => <div data-testid="stub-how" />,
}));
vi.mock('@/components/landing/features', () => ({
  Features: () => <div data-testid="stub-features" />,
}));
vi.mock('@/components/landing/pricing', () => ({
  Pricing: () => <div data-testid="stub-pricing" />,
}));
vi.mock('@/components/landing/cta', () => ({
  Cta: () => <div data-testid="stub-cta" />,
}));
vi.mock('@/components/landing/footer', () => ({
  Footer: () => <div data-testid="stub-footer" />,
}));

import MarketingPage from './page';

describe('Marketing home page', () => {
  it('renders the main landing shell with all sections', () => {
    const { getByTestId, container } = render(<MarketingPage />);

    expect(container.querySelector('main')).toBeInTheDocument();
    expect(getByTestId('stub-header')).toBeInTheDocument();
    expect(getByTestId('stub-hero')).toBeInTheDocument();
    expect(getByTestId('stub-segments')).toBeInTheDocument();
    expect(getByTestId('stub-how')).toBeInTheDocument();
    expect(getByTestId('stub-features')).toBeInTheDocument();
    expect(getByTestId('stub-pricing')).toBeInTheDocument();
    expect(getByTestId('stub-cta')).toBeInTheDocument();
    expect(getByTestId('stub-footer')).toBeInTheDocument();
  });
});
