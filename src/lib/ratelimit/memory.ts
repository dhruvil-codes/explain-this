// QA-owned test-support exception (PRD §15): tiny in-memory sliding-window
// rate limiter backing unit tests. Owned by `qa` only until the `share`
// agent provides the canonical limiter; if that lands, prefer theirs and
// delete this file. No imports, no I/O, no network. Deterministic via an
// injectable clock (tests pass a fake `now`).
export const WINDOW_ONE_HOUR_MS = 3_600_000;

/** Per-IP hourly caps (PRD §7). */
export const RATE_LIMITS = {
  explainPerHour: 20,
  showMePerHour: 60,
  sharePerHour: 10,
} as const;

export interface MemoryRateLimiterOptions {
  limit: number;
  windowMs: number;
  /** Clock override for deterministic tests; defaults to Date.now. */
  now?: () => number;
}

export interface AllowResult {
  allowed: boolean;
  /** Remaining hits in the current window (0 when blocked). */
  remaining: number;
  /** ms until the oldest hit in the window expires (0 when allowed & empty). */
  resetMs: number;
}

export function createMemoryRateLimiter(options: MemoryRateLimiterOptions) {
  const { limit, windowMs } = options;
  const clock = options.now ?? Date.now;
  const hits = new Map<string, number[]>();

  function prune(key: string, now: number): number[] {
    const list = hits.get(key) ?? [];
    const cutoff = now - windowMs;
    const kept = list.filter((t) => t > cutoff);
    if (kept.length === 0) hits.delete(key);
    else hits.set(key, kept);
    return kept;
  }

  return {
    allow(key: string, at?: number): AllowResult {
      const now = at ?? clock();
      const kept = prune(key, now);
      if (kept.length >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetMs: kept[0] + windowMs - now,
        };
      }
      kept.push(now);
      hits.set(key, kept);
      return {
        allowed: true,
        remaining: limit - kept.length,
        resetMs: 0,
      };
    },
    reset(key: string): void {
      hits.delete(key);
    },
    resetAll(): void {
      hits.clear();
    },
    /** Test inspection helper: hits currently counted for a key. */
    count(key: string, at?: number): number {
      return prune(key, at ?? clock()).length;
    },
  };
}

export type MemoryRateLimiter = ReturnType<typeof createMemoryRateLimiter>;
