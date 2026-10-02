/**
 * Shared primitives used across schemas and API boundaries.
 *
 * PRD: §6.4 (level control, input caps), §7 (share IDs), §9 (language tags).
 */
import { z } from "zod";

/** Read-tab level control. Default is `standard` (PRD §6.4). */
export const LevelSchema = z.enum(["simpler", "standard", "technical"]);
export type ExplainLevel = z.infer<typeof LevelSchema>;

/** BCP-47 language tag reported by `/api/analyze` (e.g. `en`, `pt-BR`). */
export const LanguageTagSchema = z
  .string()
  .regex(/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, "Expected a BCP-47 language tag");

/** Share-link IDs are `nanoid(10)` (PRD §7). */
export const ShareIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{10}$/, "Expected a 10-character share id");

/** ISO-8601 creation timestamp stored on every shared record. */
export const IsoDateTimeSchema = z.iso.datetime();
