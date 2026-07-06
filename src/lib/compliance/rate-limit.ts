/**
 * In-memory rate limiter for auth endpoints (5 req / min / IP).
 * For multi-instance production, replace with Redis-backed limiter.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  clientKey: string,
  namespace: string,
  maxRequests = 5,
  windowMs = 60_000
): {
  allowed: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const bucketKey = `${namespace}:${clientKey}`;
  let bucket = buckets.get(bucketKey);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(bucketKey, bucket);
  }

  bucket.count += 1;

  if (bucket.count > maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { allowed: true };
}

export function checkAuthRateLimit(clientKey: string) {
  return checkRateLimit(clientKey, "auth");
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
