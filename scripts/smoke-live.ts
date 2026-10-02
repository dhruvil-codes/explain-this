/**
 * Live smoke test (PRD §15): one real request through every stage, with
 * timings. Runs only when an API key is present; otherwise prints SKIP and
 * exits 0. Never prints secrets — only provider name, model ids, presence.
 *
 * Usage: pnpm smoke:live
 */

import {
  getProvider,
  hasLiveKey,
  runStage,
  runTextStage,
  streamStage,
  AnalysisSchema,
  DiagramSpecSchema,
  InteractionSpecSchema,
  ShowMeExplainSchema,
} from "../src/lib/llm/index";
import {
  buildAnalyzePrompt,
  buildExploreSpecPrompt,
  buildShowMeExplainPrompt,
  buildSimplifyPrompt,
  buildVisualizePrompt,
} from "../src/prompts/index";

const TIMEOUT_MS = 60_000;
const SMOKE_INPUT =
  "Photosynthesis converts light into chemical energy. Chlorophyll in leaves absorbs red and blue light. Water from roots splits, releasing oxygen. Carbon dioxide enters through pores called stomata. The Calvin cycle then builds glucose from carbon dioxide using ATP and NADPH from the light reactions.";

async function step<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const value = await fn();
    console.log(`[smoke] ${label}: OK ${Date.now() - start}ms`);
    return value;
  } catch (error) {
    console.log(
      `[smoke] ${label}: FAIL ${Date.now() - start}ms — ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }
}

async function main(): Promise<void> {
  const provider = getProvider();
  console.log(
    `[smoke] provider=${provider.name} fast=${provider.fastModelId} strong=${provider.strongModelId} keyPresent=${hasLiveKey()}`,
  );
  if (!hasLiveKey()) {
    console.log("[smoke] SKIP: no API key — set the provider key env var to run.");
    return;
  }

  const analyzeBuilt = buildAnalyzePrompt(SMOKE_INPUT);
  const analysis = await step("analyze", () =>
    runStage({
      stage: "analyze",
      system: analyzeBuilt.system,
      prompt: analyzeBuilt.prompt,
      schema: AnalysisSchema,
      fast: true,
      timeoutMs: TIMEOUT_MS,
    }),
  );
  const analysisJson = JSON.stringify(analysis);

  const simplifyBuilt = buildSimplifyPrompt(SMOKE_INPUT, "standard");
  await step("simplify/text", () =>
    runTextStage({
      stage: "simplify",
      system: simplifyBuilt.system,
      prompt: simplifyBuilt.prompt,
      fast: true,
      timeoutMs: TIMEOUT_MS,
    }),
  );
  await step("simplify/stream", async () => {
    const res = await streamStage({
      stage: "simplify",
      system: simplifyBuilt.system,
      prompt: simplifyBuilt.prompt,
      fast: true,
      mockHint: SMOKE_INPUT.slice(0, 40),
    });
    const text = await res.text();
    if (!text.trim()) throw new Error("empty stream body");
  });

  const visBuilt = buildVisualizePrompt({
    source: SMOKE_INPUT,
    analysis: analysisJson,
  });
  await step("visualize", () =>
    runStage({
      stage: "visualize",
      system: visBuilt.system,
      prompt: visBuilt.prompt,
      schema: DiagramSpecSchema,
      fast: true,
      timeoutMs: TIMEOUT_MS,
    }),
  );

  const specBuilt = buildExploreSpecPrompt({
    source: SMOKE_INPUT,
    analysis: analysisJson,
  });
  await step("explore-spec", () =>
    runStage({
      stage: "explore-spec",
      system: specBuilt.system,
      prompt: specBuilt.prompt,
      schema: InteractionSpecSchema,
      fast: true,
      timeoutMs: TIMEOUT_MS,
    }),
  );

  const showBuilt = buildShowMeExplainPrompt({
    selection: "Chlorophyll in leaves absorbs red and blue light.",
    contextParagraph: SMOKE_INPUT.slice(0, 800),
    analysisSummary: analysis.summary,
  });
  await step("showme-explain", () =>
    runStage({
      stage: "showme-explain",
      system: showBuilt.system,
      prompt: showBuilt.prompt,
      schema: ShowMeExplainSchema,
      fast: true,
      timeoutMs: TIMEOUT_MS,
    }),
  );

  console.log("[smoke] all stages OK");
}

main().catch((error) => {
  console.error("[smoke] fatal:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
