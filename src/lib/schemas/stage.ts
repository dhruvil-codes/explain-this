/**
 * Stage-error shape + validation entry point for the LLM pipeline.
 *
 * PRD §9: every stage runs `runStage()` → zod-validate → on failure ONE
 * repair retry (the validation error fed back as a hint) → typed error.
 * The `llm` agent implements the retry in `runStage`; this file defines the
 * shared error contract and the `parseOrThrow` helper it calls.
 */
import { z } from "zod";
import { text } from "./helpers";

/** Machine-readable failure codes for every pipeline stage. */
export const StageErrorCodeSchema = z.enum([
  "validation",
  "provider",
  "timeout",
  "rate_limited",
  "capacity",
]);
export type StageErrorCode = z.infer<typeof StageErrorCodeSchema>;

/** Typed error returned to API routes (routes map `code` → status + copy). */
export const StageErrorSchema = z.object({
  code: StageErrorCodeSchema,
  /** Calm, user-safe message. Never a stack trace (PRD §6.4). */
  message: text(1000),
  /** Stage that failed: analyze | simplify | visualize | explore | show-me. */
  stage: text(64).optional(),
  retryable: z.boolean(),
  /**
   * The validation issues fed back to the model on the repair retry.
   * Present only when `code` is `validation`.
   */
  repairHint: text(5000).optional(),
});
export type StageError = z.infer<typeof StageErrorSchema>;

/**
 * Thrown by `parseOrThrow` when model output fails schema validation.
 * `runStage` catches this, builds the repair prompt from `repairHint`
 * (see `formatIssues`), retries once, and converts a second failure into
 * a `StageError` with `code: "validation"`.
 */
export class StageValidationError extends Error {
  readonly code = "validation" as const;
  readonly stage: string;
  readonly zodError: z.ZodError;
  /** Pre-formatted issue list for the one repair retry (`repairHint`). */
  readonly repairHint: string;

  constructor(stage: string, zodError: z.ZodError, repairHint?: string) {
    super(`[${stage}] output failed validation: ${repairHint ?? "see issues"}`);
    this.name = "StageValidationError";
    this.stage = stage;
    this.zodError = zodError;
    this.repairHint = repairHint ?? formatIssues(zodError);
  }
}

/** Render zod issues as `path: message` lines for the repair prompt. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}

/**
 * Validate `data` against `schema` or throw `StageValidationError`.
 *
 * @param schema zod schema for the stage output
 * @param data raw model output (already JSON-parsed by the caller)
 * @param stage stage name used in the error and repair prompt
 * @param repairHint optional pre-built hint; defaults to formatted issues.
 *   The llm agent's `runStage` feeds this back to the model for its single
 *   repair retry, then converts a repeat failure into a `StageError`.
 */
export function parseOrThrow<Output>(
  schema: z.ZodType<Output>,
  data: unknown,
  stage = "unknown",
  repairHint?: string,
): Output {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  throw new StageValidationError(stage, result.error, repairHint);
}

/** Convert an unknown stage failure into a user-safe `StageError`. */
export function toStageError(error: unknown, stage = "unknown"): StageError {
  if (error instanceof StageValidationError) {
    return {
      code: "validation",
      message: "The explanation didn't come out right. Try again.",
      stage: error.stage,
      retryable: true,
      repairHint: error.repairHint.slice(0, 5000),
    };
  }
  if (error instanceof Error) {
    return { code: "provider", message: error.message, stage, retryable: true };
  }
  return {
    code: "provider",
    message: "Something went wrong generating this. Try again.",
    stage,
    retryable: true,
  };
}
