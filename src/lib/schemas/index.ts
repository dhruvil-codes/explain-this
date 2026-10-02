/**
 * Schema barrel — single import point for the shared contract layer.
 *
 * PRD §9: every model output and API boundary is validated with these.
 * Per `code-structure`: this directory owns reusable validation mechanics;
 * domain policy (when to re-ask, what to render) lives with the callers
 * (llm agent's `runStage`, route handlers, feature components).
 */
export * from "./helpers";
export * from "./common";
export * from "./analysis";
export * from "./diagram";
export * from "./interaction";
export * from "./showme";
export * from "./request";
export * from "./stored";
export * from "./stage";
