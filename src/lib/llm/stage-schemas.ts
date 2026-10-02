/**
 * Local minimal zod schemas for the LLM stages (PRD §9.1, §9.3, §10.3, §11).
 *
 * NOTE (discrepancy): at build time `src/lib/schemas/**` (owned by the
 * architect agent) was still empty, so these minimal schemas live here under
 * llm ownership. They mirror the PRD field-for-field. When the architect's
 * canonical schemas land, prefer importing from `@/lib/schemas/*` and keep
 * these as deprecated aliases — field names were chosen to match the PRD so
 * the swap is mechanical.
 *
 * zod v4.x is installed; these use plain `z.object` (unknown keys stripped,
 * which keeps validation tolerant of extra model fields).
 */

import { z } from "zod";

// ---------------------------------------------------------------- analyze (§9.1)

export const VisualTypeSchema = z.enum([
  "flowchart",
  "architecture",
  "concept_map",
  "process",
  "comparison",
  "sequence",
  "timeline",
]);
export type VisualType = z.infer<typeof VisualTypeSchema>;

export const AnalysisSchema = z.object({
  topic: z.string().min(1).max(200),
  /** <= 40 words (checked by eval; kept as plain string so repair is simple). */
  summary: z.string().min(1).max(2000),
  /** BCP-47 language tag, e.g. "en". */
  language: z.string().min(2).max(12),
  concepts: z
    .array(
      z.object({
        id: z.string().min(1).max(16),
        label: z.string().min(1).max(120),
        /** <= 25 words. */
        explanation: z.string().min(1).max(1000),
      }),
    )
    .min(1)
    .max(12),
  relationships: z
    .array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        label: z.string().min(1).max(120),
      }),
    )
    .max(24)
    .default([]),
  visual_type: VisualTypeSchema,
  /** Short description of the best interactive idea. */
  interaction_type: z.string().min(1).max(300),
  interaction_fit: z.enum(["interactive", "diagram", "text"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

// ---------------------------------------------------------------- simplify level

export const SimplifyLevelSchema = z.enum(["simpler", "standard", "technical"]);
export type SimplifyLevel = z.infer<typeof SimplifyLevelSchema>;

// ---------------------------------------------------------------- visualize (§9.3)

export const DiagramNodeSchema = z.object({
  id: z.string().min(1).max(32),
  /** <= 6 words. */
  label: z.string().min(1).max(120),
  kind: z.string().min(1).max(60).default("step"),
  group: z.string().max(60).optional(),
  /** 1-2 plain sentences, <= 40 words. */
  explanation: z.string().min(1).max(2000),
});
export type DiagramNode = z.infer<typeof DiagramNodeSchema>;

export const DiagramEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  /** <= 4 words. */
  label: z.string().max(60).default(""),
  /** Step order for the "Step through" feature; required when sequence matters. */
  order: z.number().int().positive().optional(),
});
export type DiagramEdge = z.infer<typeof DiagramEdgeSchema>;

export const DiagramSpecSchema = z.object({
  type: VisualTypeSchema,
  title: z.string().min(1).max(200),
  /** 5-14 nodes. Layout is computed client-side with dagre — never by the model. */
  nodes: z.array(DiagramNodeSchema).min(5).max(14),
  edges: z.array(DiagramEdgeSchema).max(30).default([]),
  /** Only for sequence and timeline (rendered with Mermaid). */
  mermaid: z.string().max(8000).optional(),
});
export type DiagramSpec = z.infer<typeof DiagramSpecSchema>;

/** Scoped-down diagram for Show Me This (§11): 3-7 nodes. */
export const MiniDiagramSpecSchema = DiagramSpecSchema.extend({
  nodes: z.array(DiagramNodeSchema).min(3).max(7),
});
export type MiniDiagramSpec = z.infer<typeof MiniDiagramSpecSchema>;

// ---------------------------------------------------------------- explore spec (§10.3)

export const ControlSchema = z.object({
  kind: z.enum(["slider", "toggle", "select", "stepper"]),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  default: z.union([z.number(), z.string(), z.boolean()]).optional(),
  options: z.array(z.string().max(120)).max(20).optional(),
});
export type SpecControl = z.infer<typeof ControlSchema>;

export const SceneSchema = z.union([
  z.object({
    kind: z.literal("function-plot"),
    expressions: z.array(z.string().min(1).max(500)).min(1).max(4),
    params: z.array(z.string().max(64)).max(8).default([]),
  }),
  z.object({
    kind: z.literal("step-flow"),
    nodeIds: z.array(z.string().min(1)).min(1).max(14),
  }),
  z.object({
    kind: z.literal("matrix-heatmap"),
    rows: z.array(z.string().max(80)).min(1).max(12),
    cols: z.array(z.string().max(80)).min(1).max(12),
  }),
  z.object({
    kind: z.literal("compare-bars"),
    series: z.array(z.string().min(1).max(200)).min(1).max(6),
  }),
  z.object({
    kind: z.literal("sequence-steps"),
    actors: z.array(z.string().max(80)).min(1).max(8),
    messages: z.array(z.string().max(300)).min(1).max(16),
  }),
]);
export type SpecScene = z.infer<typeof SceneSchema>;

export const InteractionSpecSchema = z.object({
  title: z.string().min(1).max(200),
  /** <= 30 words. */
  intro: z.string().min(1).max(1000),
  controls: z.array(ControlSchema).max(6).default([]),
  scene: SceneSchema,
  steps: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        explanation: z.string().min(1).max(1000),
      }),
    )
    .max(12)
    .default([]),
  /** 2-3 short "what to notice" lines. */
  takeaways: z.array(z.string().min(1).max(300)).min(2).max(4),
});
export type InteractionSpec = z.infer<typeof InteractionSpecSchema>;

// ---------------------------------------------------------------- show-me (§11)

export const ShowMeExplainSchema = z.object({
  /** Short plain-language explanation of the selection, in context. */
  explanation: z.string().min(1).max(3000),
  /** One concrete example. */
  example: z.string().min(1).max(1500),
  /**
   * One-line note shown when the fit check decides the selection is better
   * explained than shown ("This one is better explained than shown.").
   */
  note: z.string().max(300).optional(),
});
export type ShowMeExplain = z.infer<typeof ShowMeExplainSchema>;

/** Fit-check rubric result (§11): vague/opinion selections are not visualized. */
export const FitCheckSchema = z.object({
  visualizable: z.boolean(),
  /** Required when visualizable=false: the one-line explain-instead note. */
  reason: z.string().min(1).max(300),
});
export type FitCheck = z.infer<typeof FitCheckSchema>;

// ---------------------------------------------------------------- stage registry

/** Stage names understood by runStage's mock path. */
export const STAGE_NAMES = [
  "analyze",
  "visualize",
  "explore-spec",
  "explore-html",
  "simplify",
  "showme-explain",
  "showme-visual",
  "showme-interactive",
  "fit-check",
] as const;
export type StageName = (typeof STAGE_NAMES)[number];
