import { describe, expect, it } from "vitest";
import {
  INPUT_MAX_LENGTH,
  INPUT_MIN_LENGTH,
  INPUT_WARN_REMAINING,
  SELECTION_CONTEXT_MAX_LENGTH,
  SELECTION_MAX_LENGTH,
  SELECTION_MIN_LENGTH,
  getInputCounterState,
  isInputLengthValid,
  isSelectionLengthValid,
  truncateSelectionContext,
  validateInputText,
  validateSelectionText,
} from "@/lib/limits";

describe("input caps (PRD §6.4)", () => {
  it("locks the input min/max constants", () => {
    expect(INPUT_MIN_LENGTH).toBe(20);
    expect(INPUT_MAX_LENGTH).toBe(12_000);
  });

  it("rejects input shorter than 20 chars", () => {
    expect(validateInputText("")).toMatchObject({
      ok: false,
      code: "too-short",
    });
    expect(validateInputText("x".repeat(19))).toMatchObject({
      ok: false,
      code: "too-short",
    });
  });

  it("accepts input at exactly the boundaries", () => {
    expect(validateInputText("x".repeat(20)).ok).toBe(true);
    expect(validateInputText("x".repeat(12_000)).ok).toBe(true);
    expect(isInputLengthValid(20)).toBe(true);
    expect(isInputLengthValid(12_000)).toBe(true);
  });

  it("rejects input longer than 12,000 chars", () => {
    const over = validateInputText("x".repeat(12_001));
    expect(over).toMatchObject({
      ok: false,
      code: "too-long",
      length: 12_001,
    });
    expect(isInputLengthValid(12_001)).toBe(false);
  });
});

describe("input counter thresholds (PRD §6.4 live counter)", () => {
  it("reports remaining and percent used", () => {
    const state = getInputCounterState(11_000);
    expect(state.remaining).toBe(1_000);
    expect(state.percentUsed).toBeCloseTo(11_000 / 12_000);
    expect(state.overLimit).toBe(false);
  });

  it("flags near-limit when remaining chars drop to the warn threshold", () => {
    expect(INPUT_WARN_REMAINING).toBe(1_000);
    expect(
      getInputCounterState(INPUT_MAX_LENGTH - INPUT_WARN_REMAINING).nearLimit,
    ).toBe(true);
    expect(getInputCounterState(100).nearLimit).toBe(false);
  });

  it("flags over-limit and under-min states", () => {
    expect(getInputCounterState(12_001).overLimit).toBe(true);
    expect(getInputCounterState(12_001).nearLimit).toBe(false);
    expect(getInputCounterState(5).underMin).toBe(true);
    expect(getInputCounterState(20).underMin).toBe(false);
  });
});

describe("selection caps for Show Me This (PRD §11)", () => {
  it("locks the selection min/max constants", () => {
    expect(SELECTION_MIN_LENGTH).toBe(8);
    expect(SELECTION_MAX_LENGTH).toBe(1_000);
  });

  it("rejects selections shorter than 8 chars", () => {
    expect(validateSelectionText("short!")).toMatchObject({
      ok: false,
      code: "too-short",
    });
    expect(isSelectionLengthValid(7)).toBe(false);
  });

  it("accepts selections at exactly the boundaries", () => {
    expect(validateSelectionText("12345678").ok).toBe(true);
    expect(validateSelectionText("x".repeat(1_000)).ok).toBe(true);
    expect(isSelectionLengthValid(8)).toBe(true);
    expect(isSelectionLengthValid(1_000)).toBe(true);
  });

  it("rejects selections longer than 1,000 chars", () => {
    expect(validateSelectionText("x".repeat(1_001))).toMatchObject({
      ok: false,
      code: "too-long",
    });
    expect(isSelectionLengthValid(1_001)).toBe(false);
  });

  it("clamps surrounding-paragraph context to 800 chars", () => {
    expect(SELECTION_CONTEXT_MAX_LENGTH).toBe(800);
    expect(truncateSelectionContext("x".repeat(800)).length).toBe(800);
    expect(truncateSelectionContext("x".repeat(801)).length).toBe(800);
  });
});
