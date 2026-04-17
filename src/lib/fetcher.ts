import { api } from '@/lib/api';

/**
 * SWR fetcher.
 *
 * Accepts either a string path or a tuple `[path, query]` so components can
 * key on parameters without building the URL by hand.
 */
export const fetcher = <T>(
  key: string | readonly [string, Record<string, unknown>?],
): Promise<T> => {
  if (typeof key === 'string') {
    return api.get<T>(key);
  }
  const [path, query] = key;
  return api.get<T>(path, {
    query: query as Record<string, string | number | boolean | null | undefined> | undefined,
  });
};
