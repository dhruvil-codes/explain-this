/**
 * Typed environment reader + product limits (single source of truth).
 *
 * PRD §§6.4, 7, 10.1, 13: provider/model selection, explore strategy, Upstash
 * storage, input caps, rate limits, daily kill-switch.
 *
 * Boundary rule: the plain `*_CHARS` / `RATE_LIMIT_*` constants are safe to
 * import anywhere (including client components). `getServerConfig()` reads
 * `process.env` — call it only in server code (routes, server actions).
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Input caps (PRD §§6.4, 11) — client-safe constants                  */
/* ------------------------------------------------------------------ */

/** Pasted AI answer: min 20 chars, max 12,000 chars. */
export const INPUT_MIN_CHARS = 20;
export const INPUT_MAX_CHARS = 12_000;

/** Show-Me selection: min 8 chars, max 1,000 chars. */
export const SELECTION_MIN_CHARS = 8;
export const SELECTION_MAX_CHARS = 1_000;

/** Surrounding-paragraph context sent with a Show-Me request (PRD §11). */
export const SHOWME_CONTEXT_MAX_CHARS = 800;

/** Max Show-Me entries kept in a share payload ("Add to shared page"). */
export const SHOWME_HISTORY_MAX = 20;

/* ------------------------------------------------------------------ */
/* Rate limits (PRD §7) — per IP, client-safe constants                */
/* ------------------------------------------------------------------ */

export const RATE_LIMITS = {
  /** 20 explains/hour. */
  explain: { count: 20, windowSeconds: 3600 },
  /** 60 show-me/hour. */
  showme: { count: 60, windowSeconds: 3600 },
  /** 10 shares/hour. */
  share: { count: 10, windowSeconds: 3600 },
} as const;
export type RateLimitKey = keyof typeof RATE_LIMITS;

/** Friendly copy shown on 429 (PRD §7). Never leak reset math to the UI. */
export const RATE_LIMIT_MESSAGE =
  "You're going fast. Try again in a few minutes.";

/** Friendly copy when the global kill-switch trips (PRD §13). */
export const CAPACITY_MESSAGE =
  "We're at capacity today. Please try again tomorrow.";

/* ------------------------------------------------------------------ */
/* Server env (parse with getServerConfig — server only)               */
/* ------------------------------------------------------------------ */

const ServerEnvSchema = z.object({
  /** LLM provider; `mock` serves fixtures with zero config (PRD §7). */
  LLM_PROVIDER: z.enum(["google", "openai", "anthropic", "mock"]).default("google"),
  /** Fast model: analyze, simplify, visualize, Show-Me (PRD §9). */
  LLM_FAST_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  /** Strong model: Explore HTML generation (PRD §10.1). */
  LLM_STRONG_MODEL: z.string().min(1).default("gemini-2.5-pro"),
  /** Play strategy: generated `html` sandbox first, `spec` renderer (PRD §10.1). */
  EXPLORE_STRATEGY: z.enum(["html", "spec"]).default("html"),
  /** Upstash Redis REST (share store + rate limits). Unset → local fallback. */
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  /** Optional global daily request kill-switch (PRD §13). */
  DAILY_REQUEST_CAP: z.coerce.number().int().positive().optional(),
});

export type ServerConfig = z.infer<typeof ServerEnvSchema> & {
  /** True when `LLM_PROVIDER=mock` (tests, no-key demo, degraded mode). */
  isMock: boolean;
  /** True when both Upstash vars are set (Redis store + ratelimit live). */
  hasRedis: boolean;
};

let cached: ServerConfig | undefined;

/** Parse and memoize server env. Throws a clear error on invalid values. */
export function getServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  if (cached) return cached;
  const parsed = ServerEnvSchema.parse(env);
  cached = {
    ...parsed,
    isMock: parsed.LLM_PROVIDER === "mock",
    hasRedis: Boolean(
      parsed.UPSTASH_REDIS_REST_URL?.trim() &&
        parsed.UPSTASH_REDIS_REST_TOKEN?.trim(),
    ),
  };
  return cached;
}

/** Test-only escape hatch to re-parse env (e.g. after changing providers). */
export function resetServerConfigForTests(): void {
  cached = undefined;
}
