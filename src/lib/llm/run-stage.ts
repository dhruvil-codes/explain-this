/**
 * Generic stage runner (PRD §9):
 *   server route → runStage() → zod-validate → ONE repair retry (validation
 *   error fed back) → typed StageError.
 *
 * Verified against installed ai v7.x:
 * - structured output: `generateText({ model, system, prompt,
 *   output: Output.object({ schema }) })` → `result.output`
 *   (`Output.object({ schema: FlexibleSchema })` accepts zod schemas;
 *   `generateObject` still exists but is deprecated in favor of this form).
 * - streaming: `streamText({ model, system, prompt })` →
 *   `result.toTextStreamResponse()`.
 * - errors: `APICallError` (HTTP failures, carries statusCode/isRetryable),
 *   `NoObjectGeneratedError` (carries raw `.text` for the repair retry).
 */

import {
  generateText,
  streamText,
  Output,
  APICallError,
  NoObjectGeneratedError,
  type LanguageModel,
} from "ai";
import { z } from "zod";
import {
  getLanguageModel,
  getProviderName,
  hasLiveKey,
  isMockProvider,
  keyEnvVarForActiveProvider,
} from "./provider";
import { getMockResult, getMockText } from "./mock";
import {
  buildRepairPrompt,
  formatValidationIssues,
  parseAndValidate,
} from "./json-repair";
import type { StageName } from "./stage-schemas";

export type StageErrorCode =
  | "validation"
  | "provider"
  | "timeout"
  | "rate_limited"
  | "capacity";

const STAGE_ERROR_MESSAGES: Record<StageErrorCode, string> = {
  validation: "The AI returned an unexpected format.",
  provider: "The AI provider failed. Try again.",
  timeout: "The request took too long. Try again.",
  rate_limited: "You're going fast. Try again in a few minutes.",
  capacity: "We're at capacity today. Try again later.",
};

/** Typed stage failure. `message` is safe to log; `userMessage` is UI-safe. */
export class StageError extends Error {
  readonly code: StageErrorCode;
  readonly stage: string;
  readonly retryable: boolean;
  readonly userMessage: string;
  readonly statusCode?: number;
  readonly issuesText?: string;

  constructor(options: {
    code: StageErrorCode;
    stage: string;
    message?: string;
    retryable?: boolean;
    statusCode?: number;
    issuesText?: string;
    cause?: unknown;
  }) {
    super(options.message ?? STAGE_ERROR_MESSAGES[options.code]);
    this.name = "StageError";
    this.code = options.code;
    this.stage = options.stage;
    this.retryable =
      options.retryable ?? (options.code === "rate_limited" || options.code === "timeout");
    this.userMessage = STAGE_ERROR_MESSAGES[options.code];
    this.statusCode = options.statusCode;
    this.issuesText = options.issuesText;
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

function readStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const record = error as Record<string, unknown>;
  const candidates = [
    record.statusCode,
    (record.data as Record<string, unknown> | undefined)?.statusCode,
  ];
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function readMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Map provider/SDK failures onto StageError codes. Aborts count as timeout. */
export function classifyProviderError(error: unknown, stage: string): StageError {
  if (error instanceof StageError) return error;
  const message = readMessage(error);
  const statusCode = readStatusCode(error);

  const aborted =
    (typeof error === "object" &&
      error !== null &&
      (error as { name?: unknown }).name === "AbortError") ||
    /abort|timed out|timeout/i.test(message);
  if (aborted || statusCode === 408 || statusCode === 504) {
    return new StageError({ code: "timeout", stage, cause: error });
  }
  if (statusCode === 429) {
    return new StageError({
      code: "rate_limited",
      stage,
      statusCode,
      cause: error,
    });
  }
  if (
    statusCode === 503 ||
    statusCode === 529 ||
    (/capacity|overloaded|try again later/i.test(message) && statusCode !== undefined && statusCode >= 500)
  ) {
    return new StageError({
      code: "capacity",
      stage,
      statusCode,
      cause: error,
    });
  }
  return new StageError({
    code: "provider",
    stage,
    message: message ? `Provider error: ${message}` : undefined,
    statusCode,
    cause: error,
  });
}

function isAbortLike(error: unknown): boolean {
  return (
    (typeof error === "object" &&
      error !== null &&
      (error as { name?: unknown }).name === "AbortError") ||
    /abort/i.test(readMessage(error))
  );
}

function isValidationFlavored(error: unknown): boolean {
  return (
    error instanceof NoObjectGeneratedError ||
    /validat|parse|JSON|schema|object/i.test(readMessage(error))
  );
}

export interface RunStageOptions<T> {
  /** Stage id, used for errors and the mock path. */
  stage: StageName;
  /** Full user prompt (already includes the delimited <source> block). */
  prompt: string;
  /** System prompt for the stage. */
  system?: string;
  /** Zod schema the output must satisfy. */
  schema: z.ZodType<T>;
  /**
   * Explicit model. `null` forces the mock path. When omitted, the model is
   * resolved from env (`fast` selects fast vs strong default); mock provider
   * resolves to the fixture path.
   */
  model?: LanguageModel | null;
  /** True (default) → LLM_FAST_MODEL, false → LLM_STRONG_MODEL. */
  fast?: boolean;
  /** AbortSignal / timeout for the live call. */
  timeoutMs?: number;
  /** Hint echoed into mock text fixtures (first chars of input). */
  mockHint?: string;
}

type ResolvedModel =
  | { kind: "mock" }
  | { kind: "live"; model: LanguageModel };

function resolveModel<T>(options: RunStageOptions<T>): ResolvedModel {
  if (options.model === null) return { kind: "mock" };
  if (options.model) return { kind: "live", model: options.model };
  if (isMockProvider(getProviderName())) return { kind: "mock" };
  const model = getLanguageModel({ fast: options.fast ?? true });
  if (!model) return { kind: "mock" };
  return { kind: "live", model };
}

function timeoutSignal(timeoutMs: number): {
  signal: AbortSignal;
  cancel: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

/**
 * Run a structured (JSON) stage with exactly one repair retry.
 * Mock mode returns validated fixtures with zero config.
 */
export async function runStage<T>(options: RunStageOptions<T>): Promise<T> {
  const { stage, prompt, system, schema } = options;
  const resolved = resolveModel(options);

  if (resolved.kind === "mock") {
    return runMockStage(stage, schema, options.mockHint);
  }

  if (!hasLiveKey()) {
    const envVar = keyEnvVarForActiveProvider();
    throw new StageError({
      code: "provider",
      stage,
      message: envVar
        ? `Missing API key: set ${envVar} (or LLM_PROVIDER=mock for fixtures).`
        : "Missing API key for the configured provider.",
    });
  }

  const timeout = options.timeoutMs ? timeoutSignal(options.timeoutMs) : null;
  try {
    // Attempt 1: constrained generation via Output.object.
    try {
      const result = await generateText({
        model: resolved.model,
        ...(system ? { system } : {}),
        prompt,
        output: Output.object({ schema }),
        ...(timeout ? { abortSignal: timeout.signal } : {}),
      });
      const checked = schema.safeParse(result.output);
      if (checked.success) return checked.data;
      return await repairLive(
        resolved.model,
        stage,
        system,
        schema,
        JSON.stringify(result.output),
        formatValidationIssues(checked.error),
        timeout?.signal,
      );
    } catch (error) {
      if (error instanceof StageError) throw error;
      if (timeout?.signal.aborted || isAbortLike(error)) {
        throw new StageError({ code: "timeout", stage, cause: error });
      }
      const rawText =
        error instanceof NoObjectGeneratedError && typeof error.text === "string"
          ? error.text
          : undefined;
      if (rawText !== undefined || isValidationFlavored(error)) {
        const candidate = rawText ?? "";
        const parsed = parseAndValidate(candidate, schema);
        return await repairLive(
          resolved.model,
          stage,
          system,
          schema,
          parsed.ok ? JSON.stringify(parsed.data) : candidate,
          parsed.ok
            ? "(parsed but rejected — see schema)"
            : parsed.issuesText,
          timeout?.signal,
        );
      }
      throw classifyProviderError(error, stage);
    }
  } finally {
    timeout?.cancel();
  }
}

/** Attempt 2 (final): feed the previous output + validation errors back. */
async function repairLive<T>(
  model: LanguageModel,
  stage: StageName,
  system: string | undefined,
  schema: z.ZodType<T>,
  previousOutput: string,
  issuesText: string,
  abortSignal?: AbortSignal,
): Promise<T> {
  const repairPrompt = buildRepairPrompt({
    candidate: previousOutput.slice(0, 8000),
    issuesText,
  });
  let retried: string;
  try {
    const result = await generateText({
      model,
      ...(system ? { system } : {}),
      prompt: repairPrompt,
      ...(abortSignal ? { abortSignal } : {}),
    });
    retried = result.text;
  } catch (error) {
    throw classifyProviderError(error, stage);
  }
  const parsed = parseAndValidate(retried, schema);
  if (parsed.ok) return parsed.data;
  throw new StageError({
    code: "validation",
    stage,
    issuesText: parsed.issuesText,
    cause: parsed.rawError,
  });
}

function runMockStage<T>(
  stage: StageName,
  schema: z.ZodType<T>,
  hint?: string,
): T {
  // Same validate step as live; the single "retry" re-reads the deterministic
  // fixture so the code path (validate → retry → typed error) is identical.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const fixture = getMockResult(stage, hint);
    const parsed = schema.safeParse(fixture);
    if (parsed.success) return parsed.data;
    if (attempt === 1) {
      throw new StageError({
        code: "validation",
        stage,
        message: `Mock fixture for stage "${stage}" failed schema validation.`,
        issuesText: formatValidationIssues(parsed.error),
      });
    }
  }
  throw new StageError({ code: "validation", stage });
}

// ------------------------------------------------------------------ text stages

export interface RunTextOptions {
  stage: StageName;
  prompt: string;
  system?: string;
  model?: LanguageModel | null;
  fast?: boolean;
  timeoutMs?: number;
  mockHint?: string;
}

/** Plain-text generation (simplify non-streaming, explore HTML). */
export async function runTextStage(options: RunTextOptions): Promise<string> {
  const resolved = resolveTextModel(options);
  if (resolved.kind === "mock") {
    return getMockText(
      options.stage === "explore-html" ? "explore-html" : "simplify",
      options.mockHint,
    );
  }
  if (!hasLiveKey()) {
    const envVar = keyEnvVarForActiveProvider();
    throw new StageError({
      code: "provider",
      stage: options.stage,
      message: envVar
        ? `Missing API key: set ${envVar} (or LLM_PROVIDER=mock for fixtures).`
        : "Missing API key for the configured provider.",
    });
  }
  const timeout = options.timeoutMs ? timeoutSignal(options.timeoutMs) : null;
  try {
    const result = await generateText({
      model: resolved.model,
      ...(options.system ? { system: options.system } : {}),
      prompt: options.prompt,
      ...(timeout ? { abortSignal: timeout.signal } : {}),
    });
    return result.text;
  } catch (error) {
    if (timeout?.signal.aborted || isAbortLike(error)) {
      throw new StageError({ code: "timeout", stage: options.stage, cause: error });
    }
    if (error instanceof APICallError) {
      throw classifyProviderError(error, options.stage);
    }
    throw classifyProviderError(error, options.stage);
  } finally {
    timeout?.cancel();
  }
}

function resolveTextModel(options: RunTextOptions): ResolvedModel {
  return resolveModel({
    stage: options.stage,
    prompt: options.prompt,
    system: options.system,
    schema: z.string() as z.ZodType<string>,
    model: options.model,
    fast: options.fast,
  });
}

export interface StreamStageOptions {
  stage: StageName;
  prompt: string;
  system?: string;
  model?: LanguageModel | null;
  fast?: boolean;
  mockHint?: string;
}

/**
 * Streaming text for the Read tab (`POST /api/simplify`).
 * Live: `streamText(...).toTextStreamResponse()`. Mock: a chunked
 * text/plain Response over the same fixture text — zero config.
 */
export async function streamStage(options: StreamStageOptions): Promise<Response> {
  const resolved = resolveTextModel(options);
  if (resolved.kind === "mock") {
    return mockStreamResponse(
      getMockText("simplify", options.mockHint),
    );
  }
  if (!hasLiveKey()) {
    const envVar = keyEnvVarForActiveProvider();
    throw new StageError({
      code: "provider",
      stage: options.stage,
      message: envVar
        ? `Missing API key: set ${envVar} (or LLM_PROVIDER=mock for fixtures).`
        : "Missing API key for the configured provider.",
    });
  }
  try {
    const result = await streamText({
      model: resolved.model,
      ...(options.system ? { system: options.system } : {}),
      prompt: options.prompt,
    });
    return result.toTextStreamResponse();
  } catch (error) {
    throw classifyProviderError(error, options.stage);
  }
}

function mockStreamResponse(text: string): Response {
  const encoder = new TextEncoder();
  const chunks = text.split(/(?<=\s)/);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
