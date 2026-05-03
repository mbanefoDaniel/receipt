type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

type GlobalWithRateLimitStore = typeof globalThis & {
  __receiptRateLimitStore?: Map<string, RateLimitEntry>;
};

const globalStore = globalThis as GlobalWithRateLimitStore;
const store = globalStore.__receiptRateLimitStore ?? new Map<string, RateLimitEntry>();
globalStore.__receiptRateLimitStore = store;

export function consumeRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const existing = store.get(input.key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + input.windowMs;
    store.set(input.key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(input.limit - 1, 0),
      retryAfterMs: input.windowMs
    };
  }

  existing.count += 1;
  store.set(input.key, existing);

  const allowed = existing.count <= input.limit;
  return {
    allowed,
    remaining: Math.max(input.limit - existing.count, 0),
    retryAfterMs: Math.max(existing.resetAt - now, 0)
  };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}
