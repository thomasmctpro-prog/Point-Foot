type CacheEntry<T> = { data: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) return undefined;
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMinutes: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMinutes * 60_000 });
}

/** Returns the last cached value even if expired — used as a fallback when a scrape fails. */
export function getStale<T>(key: string): T | undefined {
  return store.get(key)?.data as T | undefined;
}
