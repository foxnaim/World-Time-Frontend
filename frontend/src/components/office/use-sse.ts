'use client';

import { useEffect, useRef, useState } from 'react';

export type SseConnectionState = 'connecting' | 'sse' | 'polling' | 'error';

export interface UseSseOptions<T> {
  /** SSE endpoint URL. When null, the hook stays idle. */
  url: string | null;
  /** Optional fallback poll URL. If omitted, defaults to `url` with `/stream` stripped. */
  pollUrl?: string | null;
  /** Polling interval (ms) when falling back from SSE. */
  pollIntervalMs?: number;
  /** Parse raw event data (string) to typed payload. Defaults to JSON.parse. */
  parse?: (raw: string) => T;
  /** Additional headers to attach to the polling fetch. EventSource cannot carry headers. */
  fetchInit?: RequestInit;
}

export interface UseSseResult<T> {
  data: T | null;
  state: SseConnectionState;
  /** Timestamp (ms) of last successful update. */
  updatedAt: number | null;
}

/**
 * Opens an EventSource and surfaces typed payloads. If the stream errors,
 * transparently falls back to polling the provided (or derived) REST endpoint.
 *
 * Designed for the office QR display: must remain resilient across network
 * hiccups, reverse-proxy timeouts, and Android tablet sleep/wake cycles.
 */
export function useSse<T>({
  url,
  pollUrl,
  pollIntervalMs = 15_000,
  parse = (raw) => JSON.parse(raw) as T,
  fetchInit,
}: UseSseOptions<T>): UseSseResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<SseConnectionState>('connecting');
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  // Keep the latest parse fn in a ref so stream handlers don't re-subscribe
  // every render (callers may pass a new inline function each time).
  const parseRef = useRef(parse);
  parseRef.current = parse;

  useEffect(() => {
    if (!url) {
      setState('connecting');
      return;
    }

    let cancelled = false;
    let eventSource: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const apply = (raw: string) => {
      if (cancelled) return;
      try {
        const parsed = parseRef.current(raw);
        setData(parsed);
        setUpdatedAt(Date.now());
      } catch {
        // Ignore malformed payloads; keep prior data.
      }
    };

    const derivedPollUrl =
      pollUrl ?? (url.endsWith('/stream') ? url.replace(/\/stream$/, '/current') : url);

    const startPolling = () => {
      if (pollTimer || cancelled) return;
      setState('polling');
      const tick = async () => {
        try {
          const res = await fetch(derivedPollUrl, {
            cache: 'no-store',
            ...fetchInit,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const raw = await res.text();
          apply(raw);
          if (!cancelled) setState('polling');
        } catch {
          if (!cancelled) setState('error');
        }
      };
      void tick();
      pollTimer = setInterval(tick, pollIntervalMs);
    };

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const openStream = () => {
      try {
        eventSource = new EventSource(url, { withCredentials: false });
      } catch {
        startPolling();
        return;
      }

      eventSource.onopen = () => {
        if (cancelled) return;
        stopPolling();
        setState('sse');
      };

      eventSource.onmessage = (event) => {
        apply(event.data);
        if (!cancelled) setState('sse');
      };

      eventSource.onerror = () => {
        // EventSource auto-reconnects on its own, but we can't trust that the
        // server is reachable — downgrade to polling until onopen fires again.
        if (cancelled) return;
        startPolling();
      };
    };

    openStream();

    return () => {
      cancelled = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      stopPolling();
    };
  }, [url, pollUrl, pollIntervalMs, fetchInit]);

  return { data, state, updatedAt };
}
