import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ActiveEntry } from '../timer';
import { Timer } from '../timer';

// Mock the fetcher so SWR never hits the real API.
const mockFetcher = vi.fn();
vi.mock('@/lib/fetcher', () => ({
  fetcher: (key: unknown) => mockFetcher(key),
}));

// Stable elapsed hook result — avoid rAF + real clocks in tests.
vi.mock('@/hooks/use-elapsed', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/use-elapsed')>('@/hooks/use-elapsed');
  return {
    ...actual,
    useElapsed: () => 125,
  };
});

function renderWithSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{ui}</SWRConfig>,
  );
}

describe('Timer', () => {
  beforeEach(() => {
    mockFetcher.mockReset();
  });

  it('renders the idle state when no timer is active', async () => {
    mockFetcher.mockResolvedValueOnce(null);

    renderWithSWR(
      <Timer
        projects={[
          { id: 'p1', name: 'Project Alpha' },
          { id: 'p2', name: 'Project Beta' },
        ]}
      />,
    );

    // Wait for SWR to resolve.
    expect(await screen.findByText('Начать работу')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Старт/i })).toBeInTheDocument();
  });

  it('renders the running state with the active project name and elapsed HH:MM:SS', async () => {
    const active: ActiveEntry = {
      id: 'entry-1',
      projectId: 'p1',
      startedAt: new Date(Date.now() - 125_000).toISOString(),
      project: { id: 'p1', name: 'Project Alpha' },
    };
    mockFetcher.mockResolvedValueOnce(active);

    renderWithSWR(<Timer projects={[{ id: 'p1', name: 'Project Alpha' }]} />);

    expect(await screen.findByText('Идёт работа')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    // useElapsed mocked to 125s → 00:02:05.
    expect(screen.getByText('00:02:05')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Остановить/i })).toBeInTheDocument();
  });
});
