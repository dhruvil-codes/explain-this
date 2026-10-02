/**
 * Mock provider — deterministic hand-written fixtures through the SAME code
 * path as live calls (runStage validates mock output with the same zod
 * schemas and the same single-repair logic).
 *
 * NOTE: `content/examples/**` (owned by the content agent) did not exist at
 * build time, so fixtures are inlined below. If the content agent's fixtures
 * land, point MOCK_FIXTURES at them — the shapes already match the PRD.
 *
 * Zero config: active whenever LLM_PROVIDER=mock (or unset provider with no
 * key — routes should prefer mock then; see provider.ts).
 */

import type {
  Analysis,
  DiagramSpec,
  InteractionSpec,
  MiniDiagramSpec,
  ShowMeExplain,
  FitCheck,
  StageName,
} from "./stage-schemas";

const MOCK_ANALYSIS: Analysis = {
  topic: "How transformers work",
  summary:
    "Transformers read whole passages at once, weigh which words matter most, and use that context to predict what comes next.",
  language: "en",
  concepts: [
    {
      id: "c1",
      label: "Tokens",
      explanation: "Small pieces of text the model reads and writes.",
    },
    {
      id: "c2",
      label: "Attention",
      explanation: "Scores that say which other words matter for each word.",
    },
    {
      id: "c3",
      label: "Embeddings",
      explanation: "Number lists that capture what each token means.",
    },
    {
      id: "c4",
      label: "Prediction",
      explanation: "The model outputs the most likely next token.",
    },
  ],
  relationships: [
    { from: "c1", to: "c3", label: "become" },
    { from: "c3", to: "c2", label: "weighted by" },
    { from: "c2", to: "c4", label: "lead to" },
  ],
  visual_type: "concept_map",
  interaction_type: "Drag a slider to change attention focus and watch prediction shift",
  interaction_fit: "interactive",
  difficulty: "beginner",
};

const MOCK_DIAGRAM: DiagramSpec = {
  type: "concept_map",
  title: "How transformers work",
  nodes: [
    {
      id: "n1",
      label: "Text split into tokens",
      kind: "input",
      explanation:
        "The input text is cut into small pieces called tokens. Each token is one unit the model can process.",
    },
    {
      id: "n2",
      label: "Tokens become numbers",
      kind: "step",
      explanation:
        "Every token is mapped to a list of numbers, its embedding. Similar meanings give similar numbers.",
    },
    {
      id: "n3",
      label: "Attention weighs words",
      kind: "step",
      explanation:
        "For each word, attention scores say which other words matter most. Strong links count more.",
    },
    {
      id: "n4",
      label: "Context builds meaning",
      kind: "step",
      explanation:
        "Weighted signals merge into a rich picture of the whole passage. Ambiguous words get clarified.",
    },
    {
      id: "n5",
      label: "Next token predicted",
      kind: "output",
      explanation:
        "The model scores every possible next token and outputs the most likely one. Repeat to write sentences.",
    },
    {
      id: "n6",
      label: "Loop writes full answer",
      kind: "output",
      explanation:
        "Each new token is fed back in. The loop continues until the answer is complete.",
    },
  ],
  edges: [
    { from: "n1", to: "n2", label: "embed", order: 1 },
    { from: "n2", to: "n3", label: "attend", order: 2 },
    { from: "n3", to: "n4", label: "combine", order: 3 },
    { from: "n4", to: "n5", label: "predict", order: 4 },
    { from: "n5", to: "n6", label: "repeat", order: 5 },
  ],
};

const MOCK_MINI_DIAGRAM: MiniDiagramSpec = {
  type: "flowchart",
  title: "Attention in one glance",
  nodes: [
    {
      id: "m1",
      label: "Word asks question",
      kind: "input",
      explanation:
        "Each word sends out a query describing what context it needs.",
    },
    {
      id: "m2",
      label: "Other words answer",
      kind: "step",
      explanation:
        "Every other word offers its meaning, scored by relevance.",
    },
    {
      id: "m3",
      label: "Scores pick winners",
      kind: "step",
      explanation:
        "The highest scores decide which words influence the result.",
    },
    {
      id: "m4",
      label: "Meaning updated",
      kind: "output",
      explanation:
        "The word takes on a sharper meaning built from its context.",
    },
  ],
  edges: [
    { from: "m1", to: "m2", label: "query", order: 1 },
    { from: "m2", to: "m3", label: "score", order: 2 },
    { from: "m3", to: "m4", label: "update", order: 3 },
  ],
};

const MOCK_SPEC: InteractionSpec = {
  title: "Tune the focus, watch the prediction",
  intro: "Drag the slider to shift attention and see the predicted word change.",
  controls: [
    {
      kind: "slider",
      id: "focus",
      label: "Attention focus",
      min: 0,
      max: 100,
      step: 1,
      default: 50,
    },
  ],
  scene: {
    kind: "compare-bars",
    series: ["focus=low -> predicts 'bank'", "focus=high -> predicts 'river'"],
  },
  steps: [
    {
      label: "Low focus",
      explanation: "Attention spreads thin and the common meaning wins.",
    },
    {
      label: "High focus",
      explanation: "Attention locks onto context and the rare meaning wins.",
    },
  ],
  takeaways: [
    "Attention decides which context counts.",
    "Small focus shifts change the output word.",
  ],
};

const MOCK_HTML = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><style>body{font-family:serif;padding:24px;line-height:1.6}button{font-size:18px;padding:8px 16px}</style></head>
<body>
<p id="caption">Attention focus: <strong id="v">50</strong>. Prediction: <strong id="p">bank</strong>.</p>
<input id="s" type="range" min="0" max="100" value="50" aria-label="Attention focus">
<script>
var s = document.getElementById('s');
s.addEventListener('input', function () {
  document.getElementById('v').textContent = s.value;
  document.getElementById('p').textContent = Number(s.value) > 60 ? 'river' : 'bank';
});
</script>
</body>
</html>`;

const MOCK_SIMPLIFY_MD = `The transformer reads the whole passage at once.

It cuts text into small pieces called tokens. Each token becomes a list of numbers that captures its meaning.

Then attention scores link each word to the words that matter for it. Strong links count more than weak links.

Finally the model predicts the most likely next token. It repeats this loop until the answer is done.

- Tokens are the pieces the model reads.
- Attention is the scoring that adds context.
- Prediction is the most likely next piece.`;

const MOCK_SHOWME_EXPLAIN: ShowMeExplain = {
  explanation:
    "Attention is a scoring step. Each word looks at the other words and assigns scores. High scores mean strong influence on what the word ends up meaning.",
  example:
    "In 'the animal did not cross the street because it was too tired', attention links 'it' strongly to 'animal', so the model knows who is tired.",
};

const MOCK_FIT_CHECK: FitCheck = {
  visualizable: true,
  reason: "The selection describes a mechanism with parts and steps.",
};

/**
 * Deterministic fixture for a stage. `hint` (e.g. the first 40 chars of the
 * input) is echoed into text outputs only, so repeated calls stay stable
 * while still looking input-aware. Structured fixtures are input-independent
 * by design — validation, not personalization, is what mock mode proves.
 */
export function getMockResult(stage: StageName, hint = ""): unknown {
  switch (stage) {
    case "analyze":
      return MOCK_ANALYSIS;
    case "visualize":
      return MOCK_DIAGRAM;
    case "explore-spec":
    case "showme-interactive":
      return MOCK_SPEC;
    case "explore-html":
      return MOCK_HTML;
    case "simplify":
      return hint
        ? `${MOCK_SIMPLIFY_MD}\n\n*Mock explanation related to: ${hint.slice(0, 80)}*`
        : MOCK_SIMPLIFY_MD;
    case "showme-explain":
      return MOCK_SHOWME_EXPLAIN;
    case "showme-visual":
      return MOCK_MINI_DIAGRAM;
    case "fit-check":
      return MOCK_FIT_CHECK;
  }
}

/** Plain-text mock payload for streaming/text stages. */
export function getMockText(stage: Extract<StageName, "simplify" | "explore-html">, hint = ""): string {
  const result = getMockResult(stage, hint);
  return typeof result === "string" ? result : JSON.stringify(result);
}
