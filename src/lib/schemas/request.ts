/**
 * API-boundary request schemas — every route validates its input with these.
 *
 * PRD §§6.4, 8, 11: input caps (20–12,000 chars), level control, selection
 * rules. Limits are imported from `../config` so code and validation share
 * one source of truth. Downstream stages reuse the model-output schemas.
 */
import { z } from "zod";
import {
  INPUT_MAX_CHARS,
  INPUT_MIN_CHARS,
  SHOWME_HISTORY_MAX,
} from "../config";
import { LevelSchema } from "./common";
import { AnalysisSchema } from "./analysis";
import { DiagramSchema } from "./diagram";
import { ExplorePayloadSchema } from "./interaction";
import { ShowMeRequestSchema, ShowMeResultSchema } from "./showme";

/** The pasted AI answer. Plain text or markdown, 20–12,000 chars (PRD §6.4). */
export const OriginalTextSchema = z
  .string()
  .min(INPUT_MIN_CHARS, `Please paste at least ${INPUT_MIN_CHARS} characters`)
  .max(INPUT_MAX_CHARS, `Please keep input under ${INPUT_MAX_CHARS} characters`);

/** `POST /api/simplify` (streamed text): original + level. */
export const SimplifyRequestSchema = z.object({
  original: OriginalTextSchema,
  level: LevelSchema.default("standard"),
});
export type SimplifyRequest = z.infer<typeof SimplifyRequestSchema>;

/** `POST /api/analyze` (JSON): original only — level is a Read-tab concern. */
export const AnalyzeRequestSchema = z.object({
  original: OriginalTextSchema,
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

/** `POST /api/visualize` (JSON): original + analysis. */
export const VisualizeRequestSchema = z.object({
  original: OriginalTextSchema,
  analysis: AnalysisSchema,
});
export type VisualizeRequest = z.infer<typeof VisualizeRequestSchema>;

/** `POST /api/explore` (JSON): original + analysis (+ level for tone). */
export const ExploreRequestSchema = z.object({
  original: OriginalTextSchema,
  analysis: AnalysisSchema,
  level: LevelSchema.default("standard"),
});
export type ExploreRequest = z.infer<typeof ExploreRequestSchema>;

/** `POST /api/show-me` (JSON): selection + context + analysis (PRD §11). */
export const ShowMeApiRequestSchema = ShowMeRequestSchema;
export type ShowMeApiRequest = z.infer<typeof ShowMeApiRequestSchema>;

/** `POST /api/share` (JSON): everything needed to rebuild `/s/[id]`. */
export const ShareCreateRequestSchema = z.object({
  original: OriginalTextSchema,
  level: LevelSchema,
  simplified: z.string().min(1).max(100_000),
  diagram: DiagramSchema,
  interaction: ExplorePayloadSchema,
  showme: z.array(ShowMeResultSchema).max(SHOWME_HISTORY_MAX).default([]),
});
export type ShareCreateRequest = z.infer<typeof ShareCreateRequestSchema>;
