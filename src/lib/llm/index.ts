/**
 * Public surface of the LLM layer for routes and scripts.
 * Server-only: provider/keys must never leak into client bundles.
 */
export {
  getProviderName,
  getFastModelId,
  getStrongModelId,
  getProvider,
  getLanguageModel,
  getProviderStatus,
  hasLiveKey,
  isMockProvider,
  keyEnvVarForActiveProvider,
  DEFAULT_PROVIDER,
  DEFAULT_FAST_MODEL,
  DEFAULT_STRONG_MODEL,
  type LlmProviderName,
  type ResolvedProvider,
} from "./provider";
export { getMockResult, getMockText } from "./mock";
export {
  extractJsonCandidate,
  stripTrailingCommas,
  formatValidationIssues,
  buildRepairPrompt,
  parseAndValidate,
  type ParseResult,
} from "./json-repair";
export {
  StageError,
  classifyProviderError,
  runStage,
  runTextStage,
  streamStage,
  type StageErrorCode,
  type RunStageOptions,
  type RunTextOptions,
  type StreamStageOptions,
} from "./run-stage";
export {
  toSourceBlock,
  buildUserMessage,
  escapeSourceClose,
  checkSourceLength,
  SOURCE_DEPRIVILEGE_INSTRUCTION,
  SOURCE_MAX_CHARS,
  SOURCE_MIN_CHARS,
} from "./sanitize-input";
export {
  AnalysisSchema,
  SimplifyLevelSchema,
  DiagramSpecSchema,
  DiagramNodeSchema,
  DiagramEdgeSchema,
  MiniDiagramSpecSchema,
  ControlSchema,
  SceneSchema,
  InteractionSpecSchema,
  ShowMeExplainSchema,
  FitCheckSchema,
  VisualTypeSchema,
  STAGE_NAMES,
  type Analysis,
  type SimplifyLevel,
  type DiagramSpec,
  type MiniDiagramSpec,
  type InteractionSpec,
  type SpecScene,
  type SpecControl,
  type ShowMeExplain,
  type FitCheck,
  type VisualType,
  type StageName,
} from "./stage-schemas";
