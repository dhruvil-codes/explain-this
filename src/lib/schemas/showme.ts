/**
 * Show Me This schemas — the signature highlight-to-explain feature.
 *
 * PRD §11: selection (8–1,000 chars) + surrounding paragraph (≤800 chars) +
 * analysis context → one of three actions: Explain simply / Show visually /
 * Show me this. A vague selection fails the fit check and returns `explain`
 * with a note ("This one is better explained than shown."). Results stack in
 * a history with back/forward — each entry is a ShowMeResult.
 */
import { z } from "zod";
import {
  SELECTION_MAX_CHARS,
  SELECTION_MIN_CHARS,
  SHOWME_CONTEXT_MAX_CHARS,
} from "../config";
import { AnalysisSchema } from "./analysis";
import { MiniDiagramSchema } from "./diagram";
import { ExplorePayloadSchema } from "./interaction";
import { text } from "./helpers";

/** Toolbar actions (PRD §11): explain | visual | interactive. */
export const ShowMeModeSchema = z.enum(["explain", "visual", "interactive"]);
export type ShowMeMode = z.infer<typeof ShowMeModeSchema>;

/** What the client sends: selection + surrounding paragraph + analysis context. */
export const ShowMeRequestSchema = z.object({
  selection: z
    .string()
    .min(SELECTION_MIN_CHARS)
    .max(SELECTION_MAX_CHARS),
  /** Surrounding paragraph, capped at 800 chars (PRD §11). */
  context: z.string().max(SHOWME_CONTEXT_MAX_CHARS).default(""),
  mode: ShowMeModeSchema,
  /** Never the bare selection alone — analysis travels with it. */
  analysis: AnalysisSchema,
});
export type ShowMeRequest = z.infer<typeof ShowMeRequestSchema>;

/**
 * One history-stack entry. The payload field required depends on `kind`
 * (enforced below): explain → explanation, visual → diagram (3–7 nodes),
 * interactive → interaction (spec-first for speed, html when available).
 */
export const ShowMeResultSchema = z
  .object({
    quote: z.string().min(SELECTION_MIN_CHARS).max(SELECTION_MAX_CHARS),
    kind: z.enum(["explain", "visual", "interactive"]),
    explanation: text(2000).optional(),
    diagram: MiniDiagramSchema.optional(),
    interaction: ExplorePayloadSchema.optional(),
    /** Fit-check note, e.g. "This one is better explained than shown." */
    note: text(280).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.kind === "explain" && val.explanation === undefined) {
      ctx.addIssue({
        code: "custom",
        message: 'kind "explain" requires an explanation',
        path: ["explanation"],
      });
    }
    if (val.kind === "visual" && val.diagram === undefined) {
      ctx.addIssue({
        code: "custom",
        message: 'kind "visual" requires a diagram',
        path: ["diagram"],
      });
    }
    if (val.kind === "interactive" && val.interaction === undefined) {
      ctx.addIssue({
        code: "custom",
        message: 'kind "interactive" requires an interaction payload',
        path: ["interaction"],
      });
    }
  });
export type ShowMeResult = z.infer<typeof ShowMeResultSchema>;
