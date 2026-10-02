/**
 * DiagramSpec schemas — the contract between the model and the See tab.
 *
 * PRD §9.3 (`POST /api/visualize`, fast model, JSON): 5–14 nodes with short
 * labels and a per-node `explanation` (click-to-explain), edges with an
 * optional `order` (step-through), `mermaid` ONLY for sequence/timeline.
 * Layout is computed client-side (dagre) — the model never positions nodes,
 * so there are deliberately no x/y fields here.
 */
import { z } from "zod";
import { text, wordsWithin } from "./helpers";
import { VisualTypeSchema } from "./analysis";

/** A diagram node. Label ≤ 6 words enforced structurally (cheap word count). */
export const DiagramNodeSchema = z.object({
  id: z.string().min(1).max(64),
  label: text(120).refine(
    wordsWithin(6),
    "Node label must be 6 words or fewer",
  ),
  /** Free-form kind hint for styling (e.g. "start", "decision", "actor"). */
  kind: text(64),
  group: text(64).optional(),
  /** 1–2 plain sentences shown on node click (≤40 words is a prompt concern). */
  explanation: text(1000),
});
export type DiagramNode = z.infer<typeof DiagramNodeSchema>;

/** A directed edge. `order` enables the "Step through" button. */
export const DiagramEdgeSchema = z.object({
  from: z.string().min(1).max(64),
  to: z.string().min(1).max(64),
  label: text(80)
    .refine(wordsWithin(4), "Edge label must be 4 words or fewer")
    .optional(),
  order: z.number().int().positive().optional(),
});
export type DiagramEdge = z.infer<typeof DiagramEdgeSchema>;

/** Mermaid source is only valid for these two diagram types. */
const MERMAID_TYPES = new Set(["sequence", "timeline"]);

/** Shared DiagramSpec core with a configurable node-count window. */
function makeDiagramSchema(nodeMin: number, nodeMax: number) {
  return z
    .object({
      type: VisualTypeSchema,
      title: text(200),
      nodes: z.array(DiagramNodeSchema).min(nodeMin).max(nodeMax),
      edges: z.array(DiagramEdgeSchema).max(100).default([]),
      mermaid: z.string().min(1).max(20000).optional(),
    })
    .superRefine((val, ctx) => {
      const ids = new Set(val.nodes.map((n) => n.id));
      if (ids.size !== val.nodes.length) {
        ctx.addIssue({
          code: "custom",
          message: "Node ids must be unique",
          path: ["nodes"],
        });
      }
      val.edges.forEach((edge, i) => {
        for (const side of ["from", "to"] as const) {
          if (!ids.has(edge[side])) {
            ctx.addIssue({
              code: "custom",
              message: `edges[${i}].${side} references unknown node id "${edge[side]}"`,
              path: ["edges", i, side],
            });
          }
        }
      });
      if (val.mermaid !== undefined && !MERMAID_TYPES.has(val.type)) {
        ctx.addIssue({
          code: "custom",
          message: `mermaid is only allowed for sequence/timeline diagrams (got "${val.type}")`,
          path: ["mermaid"],
        });
      }
    });
}

/** Full See-tab diagram: 5–14 nodes (PRD §9.3). */
export const DiagramSchema = makeDiagramSchema(5, 14);
export type DiagramSpec = z.infer<typeof DiagramSchema>;

/** Scoped Show-Me diagram: 3–7 nodes (PRD §11, "Show visually"). */
export const MiniDiagramSchema = makeDiagramSchema(3, 7);
export type MiniDiagramSpec = z.infer<typeof MiniDiagramSchema>;
