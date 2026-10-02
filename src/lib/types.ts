/**
 * Shared TypeScript types — re-exported from the zod schemas so the schemas
 * stay the single source of truth (PRD §9). Import types from here in
 * feature code; import schemas from `@/lib/schemas` for validation.
 */
import type {
  Analysis,
  AnalysisConcept,
  ConceptRelationship,
  Difficulty,
  InteractionFit,
  VisualType,
} from "./schemas/analysis";
import type { DiagramEdge, DiagramNode, DiagramSpec, MiniDiagramSpec } from "./schemas/diagram";
import type {
  ExplorePayload,
  InteractionControl,
  InteractionScene,
  InteractionSpec,
  SpecStep,
} from "./schemas/interaction";
import type { ShowMeMode, ShowMeRequest, ShowMeResult } from "./schemas/showme";
import type {
  AnalyzeRequest,
  ExploreRequest,
  ShareCreateRequest,
  ShowMeApiRequest,
  SimplifyRequest,
  VisualizeRequest,
} from "./schemas/request";
import type { ShareRecord, StoredShare } from "./schemas/stored";
import type { ExplainLevel } from "./schemas/common";
import type { StageError, StageErrorCode } from "./schemas/stage";

export type {
  Analysis,
  AnalysisConcept,
  AnalyzeRequest,
  ConceptRelationship,
  DiagramEdge,
  DiagramNode,
  DiagramSpec,
  Difficulty,
  ExplainLevel,
  ExplorePayload,
  ExploreRequest,
  InteractionControl,
  InteractionFit,
  InteractionScene,
  InteractionSpec,
  MiniDiagramSpec,
  ShareCreateRequest,
  ShareRecord,
  ShowMeApiRequest,
  ShowMeMode,
  ShowMeRequest,
  ShowMeResult,
  SimplifyRequest,
  SpecStep,
  StageError,
  StageErrorCode,
  StoredShare,
  VisualType,
  VisualizeRequest,
};

/** Pipeline stage names (matches `runStage` + `StageError.stage`). */
export type StageName = "analyze" | "simplify" | "visualize" | "explore" | "show-me";

/** Result-view tabs: Read = simplify, See = visualize, Play = explore. */
export type ResultTabId = "read" | "see" | "play";
