/**
 * Stored share schemas — what a share link persists and rehydrates.
 *
 * PRD §6.4: stored = original, level, simplified output, diagram JSON,
 * interaction (HTML or spec), created_at. `showme[]` holds entries the user
 * chose via "Add to shared page". TTL (90 days) is a *store* concern handled
 * by the share agent — this file only requires `created_at` be present.
 */
import { z } from "zod";
import {
  INPUT_MAX_CHARS,
  INPUT_MIN_CHARS,
  SHOWME_HISTORY_MAX,
} from "../config";
import { IsoDateTimeSchema, LevelSchema, ShareIdSchema } from "./common";
import { DiagramSchema } from "./diagram";
import { ExplorePayloadSchema } from "./interaction";
import { ShowMeResultSchema } from "./showme";

/** The persisted payload behind `/s/[id]`. */
export const StoredShareSchema = z.object({
  original: z.string().min(INPUT_MIN_CHARS).max(INPUT_MAX_CHARS),
  level: LevelSchema,
  /** Plain-language rewrite (markdown). */
  simplified: z.string().min(1).max(100_000),
  diagram: DiagramSchema,
  interaction: ExplorePayloadSchema,
  showme: z.array(ShowMeResultSchema).max(SHOWME_HISTORY_MAX).default([]),
  created_at: IsoDateTimeSchema,
});
export type StoredShare = z.infer<typeof StoredShareSchema>;

/** A stored share plus its public id (`nanoid(10)`). */
export const ShareRecordSchema = StoredShareSchema.extend({
  id: ShareIdSchema,
});
export type ShareRecord = z.infer<typeof ShareRecordSchema>;
