/**
 * Shared zod primitives for ExplainThis schemas.
 *
 * PRD: §9 (AI pipeline — every model output and API boundary is zod-validated).
 * Structural checks only (lengths, enums, word caps where cheap). Anything that
 * needs judgement (e.g. concept explanations ≤ 25 words) is a *prompt* concern
 * and is intentionally NOT enforced here — see the per-schema notes.
 *
 * Verified against installed deps: `zod` 4.6.5 (v4 API) and `ai` 7.x, which
 * imports schemas from `zod/v4` — so plain `from "zod"` imports are natively
 * compatible. Do NOT use `zod/v3` imports.
 */
import { z } from "zod";

/** Count whitespace-separated words (cheap structural proxy for PRD word limits). */
export function countWords(value: string): number {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Predicate factory for `.refine()`: passes when the string is within `max` words. */
export function wordsWithin(max: number): (value: string) => boolean {
  return (value: string) => countWords(value) <= max;
}

/**
 * A required, blank-rejecting string capped at `maxLen` characters.
 * (`.trim()` output is not relied on — the refine rejects whitespace-only input.)
 */
export function text(maxLen: number) {
  return z
    .string()
    .min(1, "Must not be empty")
    .max(maxLen, `Must be ${maxLen} characters or fewer`)
    .refine((s) => s.trim().length > 0, "Must not be blank");
}
