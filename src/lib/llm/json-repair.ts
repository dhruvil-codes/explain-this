/**
 * JSON repair helpers (PRD §9: "zod-validate → on failure one repair retry").
 *
 * - `extractJsonCandidate`: pull the most plausible JSON payload out of model
 *   prose (fenced ```json blocks, or first-{ to last-} slice).
 * - `formatValidationIssues`: render a zod error as a short bullet list the
 *   model can act on in the single repair retry.
 * - `buildRepairPrompt`: the follow-up prompt feeding the raw output plus the
 *   validation errors back to the model.
 * - `parseAndValidate`: extract → JSON.parse (with one tiny mechanical
 *   repair: trailing commas) → zod safeParse.
 */

import { z } from "zod";

const FENCE_RE = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/gi;

/** Remove trailing commas before } or ] — the most common mechanical flaw. */
export function stripTrailingCommas(jsonText: string): string {
  return jsonText.replace(/,\s*([}\]])/g, "$1");
}

/**
 * Extract the most plausible JSON candidate from raw model output.
 * Prefers the first fenced block containing { or [, else the slice from the
 * first { / [ to the last } / ], else the trimmed raw text.
 */
export function extractJsonCandidate(raw: string): string {
  const text = raw.trim();
  if (text.length === 0) return text;

  FENCE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FENCE_RE.exec(text)) !== null) {
    const body = match[1].trim();
    if (body.includes("{") || body.includes("[")) return body;
  }

  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let start = -1;
  let endChar = "";
  if (firstBrace === -1) {
    start = firstBracket;
    endChar = "]";
  } else if (firstBracket === -1) {
    start = firstBrace;
    endChar = "}";
  } else if (firstBrace < firstBracket) {
    start = firstBrace;
    endChar = "}";
  } else {
    start = firstBracket;
    endChar = "]";
  }
  if (start !== -1) {
    const end = text.lastIndexOf(endChar);
    if (end > start) return text.slice(start, end + 1).trim();
  }
  return text;
}

export type IssueLike = {
  path: Array<string | number | symbol>;
  message: string;
};

/** Render validation failures as a short model-actionable bullet list. */
export function formatValidationIssues(
  error: z.ZodError | { issues: IssueLike[] },
  maxIssues = 20,
): string {
  const lines = error.issues.slice(0, maxIssues).map((issue) => {
    const path =
      issue.path.length === 0
        ? "(root)"
        : issue.path.map(String).join(".");
    return `- ${path}: ${issue.message}`;
  });
  if (error.issues.length > maxIssues) {
    lines.push(`- …and ${error.issues.length - maxIssues} more problem(s).`);
  }
  return lines.join("\n");
}

export type ParseResult<T> =
  | { ok: true; data: T; candidate: string }
  | { ok: false; candidate: string; issuesText: string; rawError: string };

/**
 * Extract → JSON.parse (retrying once with trailing-comma repair) → zod
 * safeParse. Never throws; reports structured failure for the repair retry.
 */
export function parseAndValidate<T>(
  raw: string,
  schema: z.ZodType<T>,
): ParseResult<T> {
  const candidate = extractJsonCandidate(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (firstError) {
    try {
      parsed = JSON.parse(stripTrailingCommas(candidate));
    } catch {
      const message =
        firstError instanceof Error ? firstError.message : String(firstError);
      return {
        ok: false,
        candidate,
        issuesText: `- JSON parse error: ${message}`,
        rawError: message,
      };
    }
  }
  const result = schema.safeParse(parsed);
  if (result.success) {
    return { ok: true, data: result.data, candidate };
  }
  return {
    ok: false,
    candidate,
    issuesText: formatValidationIssues(result.error),
    rawError: "schema validation failed",
  };
}

/** Build the single repair-retry prompt: previous output + errors, JSON only. */
export function buildRepairPrompt(options: {
  candidate: string;
  issuesText: string;
}): string {
  return (
    "Your previous response was not valid. Fix it and return ONLY the corrected JSON object — " +
    "no prose, no fences, no commentary.\n\n" +
    "Previous output:\n" +
    `<previous>\n${options.candidate}\n</previous>\n\n` +
    "Problems to fix:\n" +
    `${options.issuesText}\n\n` +
    "Corrected JSON:"
  );
}
