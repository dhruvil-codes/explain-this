/** Barrel for stage prompts (PRD §9.5). Each module exports a SYSTEM string + builder. */
export { SIMPLIFY_SYSTEM_TEMPLATE, renderSimplifySystem, buildSimplifyPrompt, SIMPLIFY_LEVELS, DEFAULT_SIMPLIFY_LEVEL } from "./simplify";
export { ANALYZE_SYSTEM, buildAnalyzePrompt } from "./analyze";
export { VISUALIZE_SYSTEM, buildVisualizePrompt, type VisualizeInput } from "./visualize";
export { EXPLORE_SPEC_SYSTEM, buildExploreSpecPrompt, type ExploreSpecInput } from "./explore-spec";
export { EXPLORE_HTML_SYSTEM, buildExploreHtmlPrompt, type ExploreHtmlInput } from "./explore-html";
export { SHOWME_EXPLAIN_SYSTEM, buildShowMeExplainPrompt, type ShowMeExplainInput } from "./showme-explain";
export { SHOWME_VISUAL_SYSTEM, buildShowMeVisualPrompt, type ShowMeVisualInput } from "./showme-visual";
export { SHOWME_INTERACTIVE_SYSTEM, buildShowMeInteractivePrompt, type ShowMeInteractiveInput } from "./showme-interactive";
export { FIT_CHECK_SYSTEM, FIT_CHECK_RUBRIC, FIT_CHECK_EXPLAIN_NOTE, buildFitCheckPrompt, type FitCheckInput } from "./fit-check";
