/**
 * Provider adapter — selects the LLM backend from env, never hard-coded.
 *
 * Env contract (see .env.example):
 *   LLM_PROVIDER       google | openai | anthropic | mock   (default: google)
 *   LLM_FAST_MODEL     e.g. gemini-2.5-flash                (default below)
 *   LLM_STRONG_MODEL   e.g. gemini-2.5-pro                  (default below)
 *   GOOGLE_GENERATIVE_AI_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY
 *
 * Verified against installed code (ai v7.x, provider packages v4.x):
 * - `import { google } from "@ai-sdk/google"` then `google("gemini-2.5-flash")`
 *   returns a LanguageModel (README example uses google('gemini-3.1-pro-preview')).
 * - Same callable-instance pattern for `openai` and `anthropic`.
 * - Model IDs are plain strings; the provider packages accept any model ID,
 *   so the gemini-2.5 defaults below work without code changes.
 *
 * Server-only: never import from client components (reads process.env keys).
 */

import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

export type LlmProviderName = "google" | "openai" | "anthropic" | "mock";

export const DEFAULT_PROVIDER: LlmProviderName = "google";
export const DEFAULT_FAST_MODEL = "gemini-2.5-flash";
export const DEFAULT_STRONG_MODEL = "gemini-2.5-pro";

const PROVIDER_NAMES: ReadonlySet<string> = new Set([
  "google",
  "openai",
  "anthropic",
  "mock",
]);

/** Provider selected via LLM_PROVIDER. Unknown/empty values fall back to google. */
export function getProviderName(): LlmProviderName {
  const raw = (process.env.LLM_PROVIDER ?? "").trim().toLowerCase();
  if (PROVIDER_NAMES.has(raw)) return raw as LlmProviderName;
  return DEFAULT_PROVIDER;
}

/** Fast-model ID for analyze/simplify/visualize/spec/show-me. */
export function getFastModelId(): string {
  return process.env.LLM_FAST_MODEL?.trim() || DEFAULT_FAST_MODEL;
}

/** Strong-model ID for explore HTML generation. */
export function getStrongModelId(): string {
  return process.env.LLM_STRONG_MODEL?.trim() || DEFAULT_STRONG_MODEL;
}

export function isMockProvider(
  name: LlmProviderName = getProviderName(),
): boolean {
  return name === "mock";
}

function keyEnvVarFor(name: LlmProviderName): string | null {
  switch (name) {
    case "google":
      return "GOOGLE_GENERATIVE_AI_API_KEY";
    case "openai":
      return "OPENAI_API_KEY";
    case "anthropic":
      return "ANTHROPIC_API_KEY";
    case "mock":
      return null;
  }
}

/**
 * True when a live call can be attempted (mock mode never needs a key).
 * Only reports presence — never returns or logs secret values.
 */
export function hasLiveKey(
  name: LlmProviderName = getProviderName(),
): boolean {
  if (name === "mock") return false;
  const envVar = keyEnvVarFor(name);
  if (!envVar) return false;
  return Boolean(process.env[envVar]?.trim());
}

/** Which env var holds the key for the active provider (null in mock mode). */
export function keyEnvVarForActiveProvider(): string | null {
  return keyEnvVarFor(getProviderName());
}

function buildModel(
  name: LlmProviderName,
  modelId: string,
): LanguageModel | null {
  switch (name) {
    case "google":
      return google(modelId);
    case "openai":
      return openai(modelId);
    case "anthropic":
      return anthropic(modelId);
    case "mock":
      return null;
  }
}

/**
 * Resolve a LanguageModel for the active provider.
 * Returns null in mock mode (callers must take the fixture path).
 * `modelId` overrides the fast/strong default when provided.
 */
export function getLanguageModel(options?: {
  fast?: boolean;
  modelId?: string;
}): LanguageModel | null {
  const name = getProviderName();
  if (name === "mock") return null;
  const modelId =
    options?.modelId?.trim() ||
    (options?.fast === false ? getStrongModelId() : getFastModelId());
  return buildModel(name, modelId);
}

export interface ResolvedProvider {
  name: LlmProviderName;
  fastModelId: string;
  strongModelId: string;
  isMock: boolean;
  /** Null in mock mode. */
  model: (fast?: boolean) => LanguageModel | null;
}

/** Full resolved provider config for routes and scripts. */
export function getProvider(): ResolvedProvider {
  const name = getProviderName();
  return {
    name,
    fastModelId: getFastModelId(),
    strongModelId: getStrongModelId(),
    isMock: name === "mock",
    model: (fast = true) => getLanguageModel({ fast }),
  };
}

/** Safe-to-expose status for /api/health (never includes secrets). */
export function getProviderStatus(): {
  provider: LlmProviderName;
  fastModel: string;
  strongModel: string;
  mock: boolean;
  keyPresent: boolean;
} {
  const name = getProviderName();
  return {
    provider: name,
    fastModel: getFastModelId(),
    strongModel: getStrongModelId(),
    mock: name === "mock",
    keyPresent: hasLiveKey(name),
  };
}
