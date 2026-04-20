/**
 * Next.js custom cache handler backed by Redis.
 *
 * When REDIS_URL is set we wire @neshca/cache-handler to a Redis strings
 * client so the ISR / fetch cache is shared across replicas. Without it we
 * fall back to Next's default file-system handler — fine for single-replica
 * dev, but don't ship that to a multi-replica deployment.
 */
import { CacheHandler } from '@neshca/cache-handler';
import createLruHandler from '@neshca/cache-handler/local-lru';
import createRedisHandler from '@neshca/cache-handler/redis-strings';
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  CacheHandler.onCreation(async () => {
    const client = createClient({ url: redisUrl });

    // Surface connection errors so a dead Redis doesn't silently disable
    // caching for the whole app. The handler itself is resilient — a failed
    // `get` just behaves like a miss — but we still want to see it.
    client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[cache-handler] redis error:', err);
    });

    try {
      await client.connect();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[cache-handler] redis connect failed:', err);
    }

    const redisHandler = await createRedisHandler({
      client,
      keyPrefix: 'worktime:next:',
      // Timeout per op — if Redis hiccups we'd rather miss than hang the
      // render.
      timeoutMs: 1000,
    });

    // Local LRU acts as an L1 in front of Redis to absorb hot keys.
    const localHandler = await createLruHandler();

    return {
      handlers: [localHandler, redisHandler],
    };
  });
}

export default CacheHandler;
