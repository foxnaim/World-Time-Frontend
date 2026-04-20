import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api';

// Helper to build a minimal fetch Response mock.
function jsonResponse(
  body: unknown,
  init: Partial<ResponseInit> & { ok?: boolean; status?: number } = {},
) {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    statusText: init.statusText ?? 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe('api', () => {
  const originalFetch = globalThis.fetch;
  const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

  beforeEach(() => {
    // Default cookie: includes wt_access token so Bearer header is attached.
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => 'wt_access=test-token-abc; other=value',
      set: () => undefined,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalCookie) {
      Object.defineProperty(Document.prototype, 'cookie', originalCookie);
    }
    vi.restoreAllMocks();
  });

  it('GET: attaches Bearer header from wt_access cookie and returns parsed JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ hello: 'world' }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const data = await api.get<{ hello: string }>('/ping');

    expect(data).toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token-abc');
    expect(init.method).toBe('GET');
  });

  it('POST: sends JSON body with Content-Type and Bearer header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }, { status: 201 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await api.post('/things', { name: 'foo' });

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Authorization')).toBe('Bearer test-token-abc');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'foo' }));
  });

  it('throws ApiError on non-ok responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ message: 'nope' }, { ok: false, status: 400, statusText: 'Bad Request' }),
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(api.get('/bad')).rejects.toBeInstanceOf(ApiError);
    await expect(api.get('/bad')).rejects.toMatchObject({
      status: 400,
      message: 'nope',
    });
  });
});
