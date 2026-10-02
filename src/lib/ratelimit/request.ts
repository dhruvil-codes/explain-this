/**
 * Server-only rate-limit gate shared by all API routes (PRD §7).
 *
 * Upstash Ratelimit when both UPSTASH_* vars are set, otherwise the
 * in-memory sliding-window limiter (dev/test/multi-instance caveat: local
 * counts only — documented in DEPLOY.md). Limits per IP: 20 explains/hour,
 * 60 show-me/hour, 10 shares/hour. Friendly 429 copy, never reset math.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import {
  RATE_LIMITS,
  RATE_LIMIT_MESSAGE,
  type RateLimitKey,
} from "@/lib/config";
import {
  createMemoryRateLimiter,
  WINDOW_ONE_HOUR_MS,
} from "@/lib/ratelimit/memory";

const memoryGates: Record<RateLimitKey, ReturnType<typeof createMemoryRateLimiter>> = {
  explain: createMemoryRateLimiter({
    limit: RATE_LIMITS.explain.count,
    windowMs: WINDOW_ONE_HOUR_MS,
  }),
  showme: createMemoryRateLimiter({
    limit: RATE_LIMITS.showme.count,
    windowMs: WINDOW_ONE_HOUR_MS,
  }),
  share: createMemoryRateLimiter({
    limit: RATE_LIMITS.share.count,
    windowMs: WINDOW_ONE_HOUR_MS,
  }),
};

const redisGates = new Map<RateLimitKey, Ratelimit>();

function getRedisGate(key: RateLimitKey): Ratelimit | null {
  const cached = redisGates.get(key);
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  try {
    const gate = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(RATE_LIMITS[key].count, "3600 s"),
      prefix: `explainthis:${key}`,
    });
    redisGates.set(key, gate);
    return gate;
  } catch {
    return null;
  }
}

/** Best-effort client IP for per-IP caps (proxy-aware). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export interface GateDecision {
  allowed: boolean;
  /** Set when blocked: a ready-to-return 429 response. */
  response?: NextResponse;
}

/**
 * Enforce the hourly cap for `key`. Returns `{allowed:true}` or
 * `{allowed:false, response}` (429 + friendly message + Retry-After).
 */
export async function checkRateLimit(
  key: RateLimitKey,
  req: Request
): Promise<GateDecision> {
  const ip = getClientIp(req);
  const redis = getRedisGate(key);
  if (redis) {
    try {
      const { success } = await redis.limit(ip);
      if (!success) return { allowed: false, response: limited() };
      return { allowed: true };
    } catch {
      // Redis failure must never block: fall through to memory.
    }
  }
  const gate = memoryGates[key];
  const result = gate.allow(`${key}:${ip}`);
  if (!result.allowed) return { allowed: false, response: limited() };
  return { allowed: true };
}

function limited(): NextResponse {
  return NextResponse.json(
    { error: RATE_LIMIT_MESSAGE, code: "rate_limited" },
    { status: 429, headers: { "Retry-After": "300" } }
  );
}
