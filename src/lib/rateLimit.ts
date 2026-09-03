import 'server-only';

/**
 * Best-effort per-IP rate limit for the lead endpoint.
 *
 * In-memory and therefore per-instance: on Vercel a burst spread across several
 * lambdas can exceed the nominal limit. That is a deliberate trade — it costs
 * nothing, adds no service dependency, and stops the case this actually needs to
 * stop, which is one script hammering the form. Turnstile and the honeypot are
 * the real bot controls; this is the backstop.
 *
 * If abuse ever gets past it, swap the two functions below for a shared store
 * (Upstash Redis) without touching the route.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;
/** Stop the map growing without bound on a long-lived instance. */
const MAX_TRACKED = 5000;

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size > MAX_TRACKED) buckets.clear();
}

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_PER_WINDOW - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
  return {
    ok: bucket.count <= MAX_PER_WINDOW,
    remaining: Math.max(0, MAX_PER_WINDOW - bucket.count),
    retryAfterSeconds,
  };
}

/**
 * Caller identity for rate limiting.
 *
 * Hashed, never stored: an IP address is personal data under the Privacy
 * Protection Law, and the lead row deliberately has no column for it. This
 * value lives only in memory, only for the length of the window.
 */
export async function callerKey(request: Request): Promise<string> {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const data = new TextEncoder().encode(`brandlify:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest).slice(0, 12))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
