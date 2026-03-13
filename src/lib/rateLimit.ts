type LimitConfig = {
  windowMs: number;
  maxAttempts: number;
  blockMs: number;
};

type Entry = {
  count: number;
  resetAt: number;
  blockedUntil?: number;
};

const buckets = new Map<string, Entry>();
const MAX_BUCKETS = 20000;

function cleanup(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, entry] of buckets.entries()) {
    const expired = entry.resetAt <= now && (!entry.blockedUntil || entry.blockedUntil <= now);
    if (expired) {
      buckets.delete(key);
    }
    if (buckets.size <= MAX_BUCKETS) {
      break;
    }
  }
}

export function checkRateLimit(key: string, config: LimitConfig) {
  const now = Date.now();
  cleanup(now);

  const existing = buckets.get(key);
  if (!existing) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (existing.blockedUntil && existing.blockedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((existing.blockedUntil - now) / 1000) };
  }

  if (existing.resetAt <= now) {
    existing.count = 0;
    existing.resetAt = now + config.windowMs;
    existing.blockedUntil = undefined;
  }

  existing.count += 1;
  if (existing.count > config.maxAttempts) {
    existing.blockedUntil = now + config.blockMs;
    return { ok: false, retryAfterSec: Math.ceil(config.blockMs / 1000) };
  }

  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export function applyRateLimit(input: { key: string; limit: number; windowMs: number }) {
  const result = checkRateLimit(input.key, {
    windowMs: input.windowMs,
    maxAttempts: input.limit,
    blockMs: input.windowMs
  });
  return {
    allowed: result.ok,
    retryAfterSec: result.retryAfterSec
  };
}
