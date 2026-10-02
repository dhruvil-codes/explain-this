/**
 * Prompt eval (PRD §9.5): runs each fixture input through the LIVE provider
 * only when an API key is present, and checks schema validity, length limits,
 * and reading-level heuristics. Results are appended to docs/EVAL.md.
 *
 * - Mock mode / missing key: prints SKIP, appends a skip entry, exits 0.
 * - Never prints secrets: only provider name, model ids, and key presence.
 *
 * Usage: pnpm eval:prompts
 */

import { readFileSync, readdirSync, appendFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  getProvider,
  hasLiveKey,
  runStage,
  runTextStage,
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

const EVAL_PATH = resolve(process.cwd(), "docs/EVAL.md");
const PER_STAGE_TIMEOUT_MS = 60_000;

const SAMPLE_INPUTS: { name: string; text: string }[] = [
  {
    name: "inline/transformers",
    text: "Transformers process whole sequences in parallel. Each token is embedded as a vector, then multi-head self-attention weighs every token against every other token, letting the model resolve references like pronouns. A position-wise feed-forward network refines each representation. Stacked layers build increasingly abstract meaning, and a final softmax predicts the next token.",
  },
  {
    name: "inline/compound-interest",
    text: "Compound interest means you earn interest on interest. If you invest $1,000 at 7% annual return, after year one you have $1,070. In year two you earn 7% on $1,070, giving $1,144.90. Over 30 years this snowballs to about $7,612, because each year's gains become next year's principal.",
  },
];

function loadInputs(): { name: string; text: string; fromExamples: boolean }[] {
  const dir = resolve(process.cwd(), "content/examples");
  try {
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
      .sort()
      .slice(0, 3);
    if (files.length > 0) {
      return files.map((f) => ({
        name: `content/examples/${f}`,
        text: readFileSync(resolve(dir, f), "utf8").slice(0, 4000),
        fromExamples: true,
      }));
    }
  } catch {
    // content/examples not present (content agent owns it) — fall through.
  }
  return SAMPLE_INPUTS.map((s) => ({ ...s, fromExamples: false }));
}

// ------------------------------------------------------------- heuristics

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

interface Check {
  name: string;
  pass: boolean;
  detail: string;
}

function checkLengthLimit(
  name: string,
  text: string,
  maxWords: number,
): Check {
  const n = countWords(text);
  return {
    name,
    pass: n <= maxWords,
    detail: `${n} words (limit ${maxWords})`,
  };
}

// ------------------------------------------------------------------ stages

interface StageOutcome {
  stage: string;
  ms: number;
  checks: Check[];
  error?: string;
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const start = Date.now();
  const value = await fn();
  return { value, ms: Date.now() - start };
}

async function evalAnalyze(input: string): Promise<StageOutcome> {
  const { system, prompt } = buildAnalyzePrompt(input);
  try {
    const { value, ms } = await timed(() =>
      runStage({
        stage: "analyze",
        system,
        prompt,
        schema: AnalysisSchema,
        fast: true,
        timeoutMs: PER_STAGE_TIMEOUT_MS,
      }),
    );
    const checks: Check[] = [
      { name: "schema-valid", pass: true, detail: "ok" },
      checkLengthLimit("summary<=40w", value.summary, 40),
      {
        name: "concepts<=12",
        pass: value.concepts.length >= 1 && value.concepts.length <= 12,
        detail: `${value.concepts.length} concepts`,
      },
    ];
    for (const c of value.concepts) {
      checks.push(checkLengthLimit(`concept[${c.id}]<=25w`, c.explanation, 25));
    }
    return { stage: "analyze", ms, checks };
  } catch (error) {
    return {
      stage: "analyze",
      ms: 0,
      checks: [{ name: "schema-valid", pass: false, detail: "threw" }],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function evalSimplify(input: string): Promise<StageOutcome> {
  const { system, prompt } = buildSimplifyPrompt(input, "standard");
  try {
    const { value, ms } = await timed(() =>
      runTextStage({
        stage: "simplify",
        system,
        prompt,
        fast: true,
        timeoutMs: PER_STAGE_TIMEOUT_MS,
        mockHint: input.slice(0, 40),
      }),
    );
    const sentences = splitSentences(value);
    const lengths = sentences.map(countWords);
    const avg = lengths.length
      ? lengths.reduce((a, b) => a + b, 0) / lengths.length
      : 0;
    const max = lengths.length ? Math.max(...lengths) : 0;
    return {
      stage: "simplify",
      ms,
      checks: [
        { name: "non-empty", pass: value.trim().length > 0, detail: `${value.length} chars` },
        {
          name: "avg-sentence<=25w",
          pass: avg <= 25,
          detail: `avg ${avg.toFixed(1)} over ${sentences.length} sentences`,
        },
        { name: "max-sentence<=30w", pass: max <= 30, detail: `max ${max}` },
      ],
    };
  } catch (error) {
    return {
      stage: "simplify",
      ms: 0,
      checks: [{ name: "non-empty", pass: false, detail: "threw" }],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function evalVisualize(
  input: string,
  analysisJson: string,
): Promise<StageOutcome> {
  const { system, prompt } = buildVisualizePrompt({
    source: input,
    analysis: analysisJson,
  });
  try {
    const { value, ms } = await timed(() =>
      runStage({
        stage: "visualize",
        system,
        prompt,
        schema: DiagramSpecSchema,
        fast: true,
        timeoutMs: PER_STAGE_TIMEOUT_MS,
      }),
    );
    const checks: Check[] = [
      { name: "schema-valid", pass: true, detail: "ok" },
      {
        name: "nodes-5..14",
        pass: value.nodes.length >= 5 && value.nodes.length <= 14,
        detail: `${value.nodes.length} nodes`,
      },
    ];
    for (const n of value.nodes) {
      checks.push(checkLengthLimit(`node[${n.id}].label<=6w`, n.label, 6));
      checks.push(checkLengthLimit(`node[${n.id}].expl<=40w`, n.explanation, 40));
    }
    return { stage: "visualize", ms, checks };
  } catch (error) {
    return {
      stage: "visualize",
      ms: 0,
      checks: [{ name: "schema-valid", pass: false, detail: "threw" }],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function evalExploreSpec(
  input: string,
  analysisJson: string,
): Promise<StageOutcome> {
  const { system, prompt } = buildExploreSpecPrompt({
    source: input,
    analysis: analysisJson,
  });
  try {
    const { value, ms } = await timed(() =>
      runStage({
        stage: "explore-spec",
        system,
        prompt,
        schema: InteractionSpecSchema,
        fast: true,
        timeoutMs: PER_STAGE_TIMEOUT_MS,
      }),
    );
    return {
      stage: "explore-spec",
      ms,
      checks: [
        { name: "schema-valid", pass: true, detail: "ok" },
        checkLengthLimit("intro<=30w", value.intro, 30),
        {
          name: "takeaways-2..4",
          pass: value.takeaways.length >= 2 && value.takeaways.length <= 4,
          detail: `${value.takeaways.length} takeaways`,
        },
      ],
    };
  } catch (error) {
    return {
      stage: "explore-spec",
      ms: 0,
      checks: [{ name: "schema-valid", pass: false, detail: "threw" }],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function evalShowMeExplain(input: string): Promise<StageOutcome> {
  const words = input.split(/\s+/);
  const selection = words.slice(0, 30).join(" ");
  const { system, prompt } = buildShowMeExplainPrompt({
    selection,
    contextParagraph: input.slice(0, 800),
    analysisSummary: "Eval context: analysis summary placeholder.",
  });
  try {
    const { value, ms } = await timed(() =>
      runStage({
        stage: "showme-explain",
        system,
        prompt,
        schema: ShowMeExplainSchema,
        fast: true,
        timeoutMs: PER_STAGE_TIMEOUT_MS,
      }),
    );
    return {
      stage: "showme-explain",
      ms,
      checks: [
        { name: "schema-valid", pass: true, detail: "ok" },
        {
          name: "explanation-non-empty",
          pass: value.explanation.trim().length > 0,
          detail: `${value.explanation.length} chars`,
        },
        {
          name: "example-non-empty",
          pass: value.example.trim().length > 0,
          detail: `${value.example.length} chars`,
        },
      ],
    };
  } catch (error) {
    return {
      stage: "showme-explain",
      ms: 0,
      checks: [{ name: "schema-valid", pass: false, detail: "threw" }],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ------------------------------------------------------------------- report

function ensureEvalFile(): void {
  if (!existsSync(EVAL_PATH)) {
    appendFileSync(
      EVAL_PATH,
      "# EVAL — Prompt Quality Log\n\n" +
        "Live prompt eval results (PRD §9.5). Each run appends one section.\n" +
        "Run with `pnpm eval:prompts` (live provider only when a key is present).\n\n",
    );
  }
}

function appendReport(header: string, lines: string[]): void {
  ensureEvalFile();
  appendFileSync(
    EVAL_PATH,
    `\n## ${header}\n\n${lines.join("\n")}\n`,
  );
}

async function main(): Promise<void> {
  const provider = getProvider();
  const live = hasLiveKey();
  console.log(
    `[eval] provider=${provider.name} fast=${provider.fastModelId} strong=${provider.strongModelId} keyPresent=${live}`,
  );

  const stamp = new Date().toISOString();
  if (!live) {
    console.log("[eval] SKIP: no API key for provider — live eval needs a key.");
    appendReport(`${stamp} — skipped`, [
      `- provider: \`${provider.name}\`, key present: false`,
      "- Live eval skipped (no API key). Mock fixtures are exercised by unit tests instead.",
    ]);
    return;
  }

  const inputs = loadInputs();
  console.log(
    `[eval] ${inputs.length} input(s) (examples=${inputs.some((i) => i.fromExamples)})`,
  );
  const report: string[] = [
    `- provider: \`${provider.name}\`, fast: \`${provider.fastModelId}\`, strong: \`${provider.strongModelId}\``,
    "",
    "| input | stage | ms | check | pass | detail |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const input of inputs) {
    // Analyze first; reuse a compact analysis JSON for downstream stages.
    const analyze = await evalAnalyze(input.text);
    let analysisJson = "{}";
    if (!analyze.error) {
      try {
        const { system, prompt } = buildAnalyzePrompt(input.text);
        const analysis = await runStage({
          stage: "analyze",
          system,
          prompt,
          schema: AnalysisSchema,
          fast: true,
          timeoutMs: PER_STAGE_TIMEOUT_MS,
        });
        analysisJson = JSON.stringify(analysis).slice(0, 4000);
      } catch {
        analysisJson = "{}";
      }
    }
    const outcomes: StageOutcome[] = [
      analyze,
      await evalSimplify(input.text),
      await evalVisualize(input.text, analysisJson),
      await evalExploreSpec(input.text, analysisJson),
      await evalShowMeExplain(input.text),
    ];
    for (const o of outcomes) {
      for (const c of o.checks) {
        report.push(
          `| ${input.name} | ${o.stage} | ${o.ms} | ${c.name} | ${c.pass ? "pass" : "FAIL"} | ${c.detail} |`,
        );
      }
      if (o.error) {
        report.push(
          `| ${input.name} | ${o.stage} | ${o.ms} | error | FAIL | ${o.error.slice(0, 200)} |`,
        );
      }
      const failed = o.checks.filter((c) => !c.pass).length;
      console.log(
        `[eval] ${input.name} ${o.stage}: ${o.ms}ms, ${o.checks.length - failed}/${o.checks.length} pass${o.error ? ` (error: ${o.error.slice(0, 120)})` : ""}`,
      );
    }
  }
  appendReport(stamp, report);
  console.log(`[eval] appended to docs/EVAL.md`);
}

main().catch((error) => {
  console.error("[eval] fatal:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
