# Server caching

Three layers, picked by where the data is consumed.

## `unstable_cache` via `sCache` (server-side memoization)

`sCache(keyParts, fn, { revalidate?, tags? })` wraps `next/cache`'s
`unstable_cache`. Use it for pure server work — DB queries, derived data,
fanned-out fetches. Results are keyed by `['worktime:web', ...keyParts]`
and persisted through the active cache handler (Redis in prod, file in dev).
Default `revalidate` is 60s.

```ts
const getOrgStats = sCache(
  ['org-stats', orgId],
  async () => db.stats.forOrg(orgId),
  { revalidate: 120, tags: [`org:${orgId}`] },
);
```

## `fetch` with `next.revalidate` / `next.tags` via `getServerJSON`

`getServerJSON<T>(path, { revalidate?, tags? })` is for HTTP calls to the
backend from RSCs and route handlers. It forwards the session cookie as a
bearer token and opts fetch into Next's ISR cache. Omitting both options
means `no-store` — safer default for auth-scoped data.

## SWR (client-side)

Use SWR in client components where you need live updates, focus revalidation,
or optimistic mutations. `sCache` / `getServerJSON` are strictly server.

## Invalidation

Tag your entries and call `revalidateTag('org:123')` from a server action or
webhook handler. That flushes every `sCache` and `fetch` entry tagged with
that string across all replicas (because the handler is Redis-backed).
