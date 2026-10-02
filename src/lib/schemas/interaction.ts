/**
 * InteractionSpec schemas — the safe-path/spec renderer contract.
 *
 * PRD §10.3: exactly five scenes (function-plot | step-flow | matrix-heatmap |
 * compare-bars | sequence-steps) sharing common fields
 * (title/intro/controls/scene/steps/takeaways). Controls are
 * slider|toggle|select|stepper. Math expressions (mathjs) are plain strings —
 * evaluation is the play agent's job (restricted scope, no imports).
 *
 * Also defines ExplorePayload: the Play tab produces either self-contained
 * `html` (strong model, §10.1) or a `spec` (fast model / fallback, §10.3).
 * HTML sanitization is the sandbox builder's job — the schema stays structural.
 */
import { z } from "zod";
import { text, wordsWithin } from "./helpers";

/** Control parameter id: JS-identifier-safe so specs can bind it to expressions. */
const ParamIdSchema = z
  .string()
  .regex(
    /^[A-Za-z][A-Za-z0-9_-]{0,63}$/,
    "Control id must start with a letter (letters, digits, _ and - allowed)",
  );

/** One interactive control. Discriminated by `type`. */
export const ControlSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("slider"),
    id: ParamIdSchema,
    label: text(120),
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    default: z.number(),
  }),
  z.object({
    type: z.literal("toggle"),
    id: ParamIdSchema,
    label: text(120),
    default: z.boolean(),
  }),
  z.object({
    type: z.literal("select"),
    id: ParamIdSchema,
    label: text(120),
    options: z.array(text(120)).min(2).max(20),
    default: text(120),
  }),
  z.object({
    type: z.literal("stepper"),
    id: ParamIdSchema,
    label: text(120),
    min: z.number().int(),
    max: z.number().int(),
    step: z.number().int().positive(),
    default: z.number().int(),
  }),
]);
export type InteractionControl = z.infer<typeof ControlSchema>;

/** One walkthrough step shared by all scenes. */
export const SpecStepSchema = z.object({
  label: text(120),
  explanation: text(1000),
});
export type SpecStep = z.infer<typeof SpecStepSchema>;

/**
 * The five renderable scenes (PRD §10.3). Math expressions are opaque strings;
 * the play agent evaluates them with mathjs in a restricted scope.
 */
export const SceneSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("function-plot"),
    /** Expression(s) in `x`, e.g. `x^2 + a*x`. Slider-bound params by control id. */
    expressions: z.array(text(500)).min(1).max(4),
    xRange: z.tuple([z.number(), z.number()]).optional(),
    showTrajectory: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("step-flow"),
    nodes: z
      .array(z.object({ id: text(64), label: text(120) }))
      .min(2)
      .max(12),
  }),
  z.object({
    kind: z.literal("matrix-heatmap"),
    rows: z.array(text(80)).min(2).max(12),
    cols: z.array(text(80)).min(2).max(12),
    values: z.array(z.array(z.number())).min(2).max(12),
  }),
  z.object({
    kind: z.literal("compare-bars"),
    series: z
      .array(
        z.object({ id: text(64), label: text(120), expression: text(500) }),
      )
      .min(2)
      .max(6),
  }),
  z.object({
    kind: z.literal("sequence-steps"),
    actors: z.array(text(80)).min(2).max(8),
    messages: z
      .array(
        z.object({
          from: text(80),
          to: text(80),
          label: text(200),
          order: z.number().int().positive().optional(),
        }),
      )
      .min(1)
      .max(20),
  }),
]);
export type InteractionScene = z.infer<typeof SceneSchema>;

/** Full spec envelope: common fields + scene + walkthrough + takeaways. */
export const InteractionSpecSchema = z
  .object({
    title: text(200),
    intro: text(500).refine(
      wordsWithin(30),
      "Intro must be 30 words or fewer",
    ),
    controls: z.array(ControlSchema).max(8).default([]),
    scene: SceneSchema,
    steps: z.array(SpecStepSchema).min(1).max(12),
    /** 2–3 short "what to notice" lines (PRD §10.3). */
    takeaways: z.array(text(280)).min(2).max(3),
  })
  .superRefine((val, ctx) => {
    const scene = val.scene;
    if (scene.kind === "matrix-heatmap") {
      if (scene.values.length !== scene.rows.length) {
        ctx.addIssue({
          code: "custom",
          message: `values must have one row per entry in rows (${scene.rows.length})`,
          path: ["scene", "values"],
        });
      }
      scene.values.forEach((row, i) => {
        if (row.length !== scene.cols.length) {
          ctx.addIssue({
            code: "custom",
            message: `values[${i}] must have one value per entry in cols (${scene.cols.length})`,
            path: ["scene", "values", i],
          });
        }
      });
    }
  });
export type InteractionSpec = z.infer<typeof InteractionSpecSchema>;

/** Self-contained sandbox HTML (strong model, PRD §10.1). Structural only. */
export const ExploreHtmlSchema = z.object({
  format: z.literal("html"),
  html: z.string().min(32).max(200_000),
});
export type ExploreHtml = z.infer<typeof ExploreHtmlSchema>;

/** Declarative spec payload (fast model / guaranteed fallback, PRD §10.3). */
export const ExploreSpecPayloadSchema = z.object({
  format: z.literal("spec"),
  spec: InteractionSpecSchema,
});
export type ExploreSpecPayload = z.infer<typeof ExploreSpecPayloadSchema>;

/** Whatever the Explore pipeline produced — rendered by the Play tab. */
export const ExplorePayloadSchema = z.discriminatedUnion("format", [
  ExploreHtmlSchema,
  ExploreSpecPayloadSchema,
]);
export type ExplorePayload = z.infer<typeof ExplorePayloadSchema>;
