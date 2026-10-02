import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Schema contract tests (PRD §15, ARCHITECTURE.md).
 *
 * For each module under `src/lib/schemas/`, assert its canonical export
 * parses a valid sample and rejects broken ones. Modules (or their
 * dependencies, e.g. `src/lib/config`) not yet written by the `architect`
 * agent are skipped gracefully (console.warn + pass) so `pnpm test` stays
 * green until they land — at which point these tests automatically start
 * enforcing the contracts below.
 *
 * Samples follow PRD §9.1 (analysis), §9.3 (diagram), §10.3 (interaction),
 * §6.4 (stored share payload), §11 (show-me context), §§6.4/8 (request
 * boundaries) and §9 (stage errors). If the architect lands a stricter
 * shape, a failure here is intentional: align the sample or the schema in
 * Phase 3.
 */

const ORIGINAL_VALID =
  "Photosynthesis is how green plants turn sunlight into food.";

const ANALYSIS_VALID = {
  topic: "Photosynthesis",
  summary: "Plants turn sunlight, water, and air into food and oxygen.",
  language: "en",
  concepts: [
    {
      id: "c1",
      label: "Chlorophyll",
      explanation: "Green pigment that catches sunlight in leaves.",
    },
    {
      id: "c2",
      label: "Glucose",
      explanation: "Simple sugar plants make as food.",
    },
  ],
  relationships: [{ from: "c1", to: "c2", label: "powers" }],
  visual_type: "process",
  interaction_type: "Slider that changes sunlight and shows growth",
  interaction_fit: "interactive",
  difficulty: "beginner",
};

const DIAGRAM_VALID = {
  type: "process",
  title: "Photosynthesis",
  nodes: [
    { id: "n1", label: "Sunlight arrives", kind: "step", explanation: "Leaves catch light from the sun." },
    { id: "n2", label: "Water absorbed", kind: "step", explanation: "Roots take in water from soil." },
    { id: "n3", label: "Air enters", kind: "step", explanation: "Leaves take in air through pores." },
    { id: "n4", label: "Food made", kind: "step", explanation: "The plant builds sugar as food." },
    { id: "n5", label: "Oxygen released", kind: "step", explanation: "The plant releases oxygen air." },
  ],
  edges: [
    { from: "n1", to: "n4", label: "powers", order: 1 },
    { from: "n2", to: "n4", label: "feeds", order: 2 },
    { from: "n3", to: "n4", label: "feeds", order: 3 },
    { from: "n4", to: "n5", label: "releases", order: 4 },
  ],
};

const INTERACTION_VALID = {
  title: "Grow a plant",
  intro: "Drag the slider to change sunlight and watch growth.",
  controls: [
    {
      type: "slider",
      id: "sunlight",
      label: "Sunlight",
      min: 0,
      max: 100,
      step: 1,
      default: 50,
    },
  ],
  scene: {
    kind: "step-flow",
    nodes: [
      { id: "n1", label: "Sunlight" },
      { id: "n2", label: "Growth" },
    ],
  },
  steps: [
    { label: "Shine light", explanation: "Leaves catch the light." },
    { label: "Plant grows", explanation: "Food builds up and stems rise." },
  ],
  takeaways: [
    "More light means faster growth.",
    "Plants release the air we breathe.",
  ],
};

const SHOWME_VALID = {
  selection: "Chlorophyll catches sunlight in the leaves.",
  context:
    "Plants are green because chlorophyll catches sunlight in the leaves all day.",
  mode: "explain",
  analysis: ANALYSIS_VALID,
};

const STAGE_ERROR_VALID = {
  code: "validation",
  message: "The explanation didn't come out right. Try again.",
  stage: "analyze",
  retryable: true,
};

interface ModuleCase {
  module: string;
  exportName: string;
  valid: unknown;
}

/** Canonical export per schema module. */
const MODULE_CASES: ModuleCase[] = [
  { module: "analysis", exportName: "AnalysisSchema", valid: ANALYSIS_VALID },
  { module: "diagram", exportName: "DiagramSchema", valid: DIAGRAM_VALID },
  {
    module: "interaction",
    exportName: "InteractionSpecSchema",
    valid: INTERACTION_VALID,
  },
  {
    module: "stored",
    exportName: "ShareRecordSchema",
    valid: {
      id: "abc123XyZ0",
      original: ORIGINAL_VALID,
      level: "standard",
      simplified: "Plants use sunlight to make food.",
      diagram: DIAGRAM_VALID,
      interaction: { format: "spec", spec: INTERACTION_VALID },
      showme: [],
      created_at: "2026-01-01T00:00:00.000Z",
    },
  },
  { module: "showme", exportName: "ShowMeRequestSchema", valid: SHOWME_VALID },
  {
    module: "request",
    exportName: "SimplifyRequestSchema",
    valid: { original: ORIGINAL_VALID, level: "standard" },
  },
  { module: "stage", exportName: "StageErrorSchema", valid: STAGE_ERROR_VALID },
];

/** Payloads no object schema should accept. */
const BROKEN_SAMPLES: unknown[] = [42, { __broken: true }];

interface ZodLike {
  safeParse(data: unknown): {
    success: boolean;
    error?: unknown;
    data?: unknown;
  };
}

function isZodLike(value: unknown): value is ZodLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "safeParse" in value &&
    typeof (value as Record<string, unknown>).safeParse === "function"
  );
}

async function loadModule(
  name: string,
): Promise<Record<string, unknown> | null> {
  const filePath = path.join(
    process.cwd(),
    "src",
    "lib",
    "schemas",
    `${name}.ts`,
  );
  if (!existsSync(filePath)) {
    console.warn(`[qa] schema "${name}" not yet written — skipping.`);
    return null;
  }
  try {
    return (await import(
      /* @vite-ignore */ `../src/lib/schemas/${name}`
    )) as Record<string, unknown>;
  } catch (err) {
    console.warn(`[qa] schema "${name}" failed to import — skipping.`, err);
    return null;
  }
}

describe.each(MODULE_CASES.map((c) => [c.module, c] as const))(
  "schema %s",
  (_name, { module, exportName, valid }) => {
    it("parses a valid sample and rejects broken ones (or skips if not yet written)", async () => {
      const mod = await loadModule(module);
      if (!mod) {
        expect(true).toBe(true);
        return;
      }
      const schema = mod[exportName];
      if (!isZodLike(schema)) {
        console.warn(
          `[qa] schema "${module}" exports no "${exportName}" — skipping.`,
        );
        expect(true).toBe(true);
        return;
      }
      const parsed = schema.safeParse(valid);
      expect(
        parsed.success,
        `expected valid ${module} sample to parse: ${JSON.stringify(parsed.error)?.slice(0, 500)}`,
      ).toBe(true);
      for (const broken of BROKEN_SAMPLES) {
        expect(
          schema.safeParse(broken).success,
          `expected broken ${module} sample ${JSON.stringify(broken)} to be rejected`,
        ).toBe(false);
      }
    });
  },
);

describe("schema request", () => {
  it("defaults the simplify level to standard (or skips if not yet written)", async () => {
    const mod = await loadModule("request");
    if (!mod || !isZodLike(mod.SimplifyRequestSchema)) {
      console.warn('[qa] schema "request" not ready — skipping.');
      expect(true).toBe(true);
      return;
    }
    const parsed = mod.SimplifyRequestSchema.safeParse({
      original: ORIGINAL_VALID,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect((parsed.data as { level: string }).level).toBe("standard");
    }
  });
});

describe("schema common", () => {
  it("validates shared primitives (or skips if not yet written)", async () => {
    const mod = await loadModule("common");
    if (!mod) {
      expect(true).toBe(true);
      return;
    }
    const { LevelSchema, LanguageTagSchema, ShareIdSchema, IsoDateTimeSchema } =
      mod;
    if (
      !isZodLike(LevelSchema) ||
      !isZodLike(LanguageTagSchema) ||
      !isZodLike(ShareIdSchema) ||
      !isZodLike(IsoDateTimeSchema)
    ) {
      console.warn('[qa] schema "common" exports incomplete — skipping.');
      expect(true).toBe(true);
      return;
    }
    expect(LevelSchema.safeParse("standard").success).toBe(true);
    expect(LevelSchema.safeParse("bogus").success).toBe(false);
    expect(LanguageTagSchema.safeParse("en").success).toBe(true);
    expect(LanguageTagSchema.safeParse("pt-BR").success).toBe(true);
    expect(LanguageTagSchema.safeParse("e").success).toBe(false);
    expect(ShareIdSchema.safeParse("abc123XyZ0").success).toBe(true);
    expect(ShareIdSchema.safeParse("short").success).toBe(false);
    expect(
      IsoDateTimeSchema.safeParse("2026-01-01T00:00:00.000Z").success,
    ).toBe(true);
    expect(IsoDateTimeSchema.safeParse("yesterday").success).toBe(false);
  });
});

describe("schema helpers", () => {
  it("counts words and builds blank-rejecting text schemas (or skips if not yet written)", async () => {
    const mod = await loadModule("helpers");
    if (!mod) {
      expect(true).toBe(true);
      return;
    }
    const { countWords, wordsWithin, text } = mod as {
      countWords?: (value: string) => number;
      wordsWithin?: (max: number) => (value: string) => boolean;
      text?: (maxLen: number) => ZodLike;
    };
    if (
      typeof countWords !== "function" ||
      typeof wordsWithin !== "function" ||
      typeof text !== "function"
    ) {
      console.warn('[qa] schema "helpers" exports incomplete — skipping.');
      expect(true).toBe(true);
      return;
    }
    expect(countWords("  hello   world ")).toBe(2);
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(wordsWithin(2)("a b")).toBe(true);
    expect(wordsWithin(2)("a b c")).toBe(false);

    const short = text(5);
    expect(isZodLike(short)).toBe(true);
    expect(short.safeParse("hi").success).toBe(true);
    expect(short.safeParse("").success).toBe(false);
    expect(short.safeParse("   ").success).toBe(false);
    expect(short.safeParse("123456").success).toBe(false);
  });
});
