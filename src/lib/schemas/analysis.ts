/**
 * Analysis schema — the shared context every downstream stage consumes.
 *
 * PRD §9.1 (`POST /api/analyze`, fast model, JSON): topic, summary, language,
 * ≤12 concepts, relationships, visual/interaction routing hints, difficulty.
 *
 * Enforcement split (per PRD): concept `explanation` ≤ 25 words and
 * `summary` ≤ 40 words are *prompt* concerns — kept structural here
 * (non-empty, char-capped). Relationship integrity (from/to reference real
 * concept ids, unique ids) IS enforced via superRefine.
 */
import { z } from "zod";
import { LanguageTagSchema } from "./common";
import { text } from "./helpers";

/** Diagram family the See tab should render (PRD §9.1 `visual_type`). */
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

/**
 * Play routing hint (PRD §9.1). `text` means no interaction would help — Play
 * still produces a gentle step-through spec instead of an empty tab.
 */
export const InteractionFitSchema = z.enum(["interactive", "diagram", "text"]);
export type InteractionFit = z.infer<typeof InteractionFitSchema>;

export const DifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

/** One extracted concept, e.g. `{ id: "c1", label: "Backpropagation", ... }`. */
export const AnalysisConceptSchema = z.object({
  id: z.string().min(1).max(32),
  label: text(120),
  /** ≤25 words is a prompt concern — structural cap only. */
  explanation: text(1000),
});
export type AnalysisConcept = z.infer<typeof AnalysisConceptSchema>;

/** A labelled link between two concept ids. */
export const ConceptRelationshipSchema = z.object({
  from: z.string().min(1).max(32),
  to: z.string().min(1).max(32),
  label: text(120),
});
export type ConceptRelationship = z.infer<typeof ConceptRelationshipSchema>;

/** Full `/api/analyze` output. Max 12 concepts (PRD §9.1). */
export const AnalysisSchema = z
  .object({
    topic: text(200),
    /** ≤40 words is a prompt concern — structural cap only. */
    summary: text(1000),
    language: LanguageTagSchema,
    concepts: z.array(AnalysisConceptSchema).min(1).max(12),
    relationships: z.array(ConceptRelationshipSchema).max(200).default([]),
    visual_type: VisualTypeSchema,
    /** Short description of the best interactive idea. */
    interaction_type: text(200),
    interaction_fit: InteractionFitSchema,
    difficulty: DifficultySchema,
  })
  .superRefine((val, ctx) => {
    const ids = new Set(val.concepts.map((c) => c.id));
    if (ids.size !== val.concepts.length) {
      ctx.addIssue({
        code: "custom",
        message: "Concept ids must be unique",
        path: ["concepts"],
      });
    }
    val.relationships.forEach((rel, i) => {
      if (!ids.has(rel.from)) {
        ctx.addIssue({
          code: "custom",
          message: `relationships[${i}].from references unknown concept id "${rel.from}"`,
          path: ["relationships", i, "from"],
        });
      }
      if (!ids.has(rel.to)) {
        ctx.addIssue({
          code: "custom",
          message: `relationships[${i}].to references unknown concept id "${rel.to}"`,
          path: ["relationships", i, "to"],
        });
      }
    });
  });
export type Analysis = z.infer<typeof AnalysisSchema>;
