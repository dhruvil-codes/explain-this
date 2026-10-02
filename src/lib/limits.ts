// QA-owned test-support exception (PRD §15): tiny shared pure helpers for
// input caps so unit tests assert the same constants the UI enforces.
// Owned by `qa` only until `share`/`shell` agents provide canonical
// implementations; if those agents later add this module, prefer theirs
// and delete this file. No imports, no I/O, no network.
export const INPUT_MIN_LENGTH = 20;
export const INPUT_MAX_LENGTH = 12_000;
/** Show the "near the limit" counter state when this many chars remain. */
export const INPUT_WARN_REMAINING = 1_000;
/** Selection caps for Show Me This (PRD §11). */
export const SELECTION_MIN_LENGTH = 8;
export const SELECTION_MAX_LENGTH = 1_000;
/** Max surrounding-paragraph context sent with a Show Me request (PRD §11). */
export const SELECTION_CONTEXT_MAX_LENGTH = 800;

export type InputValidityCode = "ok" | "too-short" | "too-long";

export interface InputValidation {
  ok: boolean;
  code: InputValidityCode;
  length: number;
}

export function validateInputText(text: string): InputValidation {
  const length = text.length;
  if (length < INPUT_MIN_LENGTH)
    return { ok: false, code: "too-short", length };
  if (length > INPUT_MAX_LENGTH)
    return { ok: false, code: "too-long", length };
  return { ok: true, code: "ok", length };
}

export function isInputLengthValid(length: number): boolean {
  return length >= INPUT_MIN_LENGTH && length <= INPUT_MAX_LENGTH;
}

export interface InputCounterState {
  length: number;
  remaining: number;
  percentUsed: number;
  nearLimit: boolean;
  overLimit: boolean;
  underMin: boolean;
}

export function getInputCounterState(length: number): InputCounterState {
  const remaining = INPUT_MAX_LENGTH - length;
  const percentUsed = Math.min(1, Math.max(0, length / INPUT_MAX_LENGTH));
  return {
    length,
    remaining,
    percentUsed,
    nearLimit:
      length <= INPUT_MAX_LENGTH && remaining <= INPUT_WARN_REMAINING,
    overLimit: length > INPUT_MAX_LENGTH,
    underMin: length < INPUT_MIN_LENGTH,
  };
}

export type SelectionValidityCode = "ok" | "too-short" | "too-long";

export interface SelectionValidation {
  ok: boolean;
  code: SelectionValidityCode;
  length: number;
}

export function validateSelectionText(text: string): SelectionValidation {
  const length = text.length;
  if (length < SELECTION_MIN_LENGTH)
    return { ok: false, code: "too-short", length };
  if (length > SELECTION_MAX_LENGTH)
    return { ok: false, code: "too-long", length };
  return { ok: true, code: "ok", length };
}

export function isSelectionLengthValid(length: number): boolean {
  return (
    length >= SELECTION_MIN_LENGTH && length <= SELECTION_MAX_LENGTH
  );
}

/** Clamp surrounding-paragraph context to the 800-char cap (PRD §11). */
export function truncateSelectionContext(context: string): string {
  if (context.length <= SELECTION_CONTEXT_MAX_LENGTH) return context;
  return context.slice(0, SELECTION_CONTEXT_MAX_LENGTH);
}
