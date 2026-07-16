import "server-only";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * In-memory sliding-window limiter. Fine for a single Node/Edge instance or
 * local dev; on Vercel's multi-region edge this resets per-instance, so
 * swap in Upstash Redis (`@upstash/ratelimit`) for a production deployment
 * by setting UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN and
 * replacing the body of `checkRateLimit` below — the call signature can
 * stay the same.
 */
const hits = new Map<string, number[]>();

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const existing = (hits.get(identifier) ?? []).filter((t) => t > windowStart);
  existing.push(now);
  hits.set(identifier, existing);

  // Bound memory growth from one-off identifiers.
  if (hits.size > 50_000) {
    hits.clear();
  }

  const remaining = Math.max(0, MAX_REQUESTS - existing.length);

  return {
    success: existing.length <= MAX_REQUESTS,
    limit: MAX_REQUESTS,
    remaining,
    reset: Math.ceil((windowStart + WINDOW_MS) / 1000),
  };
}
