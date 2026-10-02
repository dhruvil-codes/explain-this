import { describe, expect, it } from "vitest";
import {
  RATE_LIMITS,
  WINDOW_ONE_HOUR_MS,
  createMemoryRateLimiter,
} from "@/lib/ratelimit/memory";

describe("in-memory sliding-window limiter (PRD §7)", () => {
  it("locks the per-IP hourly caps", () => {
    expect(RATE_LIMITS.explainPerHour).toBe(20);
    expect(RATE_LIMITS.showMePerHour).toBe(60);
    expect(RATE_LIMITS.sharePerHour).toBe(10);
    expect(WINDOW_ONE_HOUR_MS).toBe(3_600_000);
  });

  it("allows up to the limit, then blocks", () => {
    let now = 0;
    const limiter = createMemoryRateLimiter({
      limit: 3,
      windowMs: 1_000,
      now: () => now,
    });
    expect(limiter.allow("ip-1").allowed).toBe(true);
    expect(limiter.allow("ip-1").allowed).toBe(true);
    const last = limiter.allow("ip-1");
    expect(last.allowed).toBe(true);
    expect(last.remaining).toBe(0);

    const blocked = limiter.allow("ip-1");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it("refills after the window slides past (deterministic clock)", () => {
    let now = 0;
    const limiter = createMemoryRateLimiter({
      limit: 2,
      windowMs: 1_000,
      now: () => now,
    });
    limiter.allow("ip-1");
    limiter.allow("ip-1");
    expect(limiter.allow("ip-1").allowed).toBe(false);

    now += 1_001; // slide past the window
    const refilled = limiter.allow("ip-1");
    expect(refilled.allowed).toBe(true);
    expect(refilled.remaining).toBe(1);
  });

  it("tracks keys independently", () => {
    let now = 0;
    const limiter = createMemoryRateLimiter({
      limit: 1,
      windowMs: 1_000,
      now: () => now,
    });
    expect(limiter.allow("ip-a").allowed).toBe(true);
    expect(limiter.allow("ip-a").allowed).toBe(false);
    expect(limiter.allow("ip-b").allowed).toBe(true);
  });

  it("enforces the 20-explains/hour cap shape", () => {
    let now = 0;
    const limiter = createMemoryRateLimiter({
      limit: RATE_LIMITS.explainPerHour,
      windowMs: WINDOW_ONE_HOUR_MS,
      now: () => now,
    });
    for (let i = 0; i < RATE_LIMITS.explainPerHour; i++) {
      expect(limiter.allow("user").allowed).toBe(true);
    }
    expect(limiter.allow("user").allowed).toBe(false);
    now += WINDOW_ONE_HOUR_MS + 1;
    expect(limiter.allow("user").allowed).toBe(true);
  });

  it("supports reset and resetAll", () => {
    let now = 0;
    const limiter = createMemoryRateLimiter({
      limit: 1,
      windowMs: 1_000,
      now: () => now,
    });
    limiter.allow("ip-a");
    limiter.allow("ip-b");
    limiter.reset("ip-a");
    expect(limiter.allow("ip-a").allowed).toBe(true);
    expect(limiter.allow("ip-b").allowed).toBe(false);
    limiter.resetAll();
    expect(limiter.allow("ip-b").allowed).toBe(true);
  });
});
