# EVAL — Prompt Quality Log

Live prompt eval results (PRD §9.5). Each run appends one section.
Run with `pnpm eval:prompts` (live provider only when a key is present).
Run with `pnpm smoke:live` for a one-shot timing check across all stages.

No live results yet — no provider key was present at authoring time.
Mock fixtures are exercised by unit tests instead (see `tests/`).

## How to read a run

Each row is one heuristic check for one stage on one input:

- `schema-valid` — output parsed as JSON and passed its zod schema.
- Length checks (`summary<=40w`, `concept[..]<=25w`, `node[..].label<=6w`, …) mirror the PRD limits.
- Reading checks (`avg-sentence<=25w`, `max-sentence<=30w`) approximate the §9.2 simplify rules.
- `ms` is wall-clock time for the stage call (first attempt + at most one repair retry).
