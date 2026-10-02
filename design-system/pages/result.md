# Result (`/explain`) — page override

Extends `design-system/MASTER.md` with result-view rules.

## Layout

- Desktop >= 1024px: split screen — original answer left, output right,
  hairline rule between. Mobile: original collapses into an expandable
  `Card` above the tabs.
- Top bar: back link, per-tab Copy + Regenerate `IconButton`s, Share
  `Button` (subtle). Trust line under tabs verbatim: "Same meaning,
  simpler words. Your original is always one tap away." (muted italic).

## Tab bar (`Tabs`)

Underlined serif words, no heavy pills; active tab gets accent
underline; subtitles in muted italic. Labels verbatim: Read (plain
English), See (diagram), Play (interactive). Arrow-key navigable;
`tab_viewed` analytics on change.

## Per-tab loading

- Read streams tokens; text fades in by line; `aria-live="polite"`
  status ("Reading…").
- See shows `Skeleton` diagram-shape + `ProgressLine` verbatim
  "Drawing the diagram…". Play shows `Skeleton` stage-shape +
  `ProgressLine` "Building something to play with…". Skeletons reserve
  final space — no layout shift when content lands.

## Failures

Failed stage shows calm inline `ErrorState` with Try again; never a
stack trace or blank panel. Play auto-falls back to the step-through
spec with note "This one is best as a walkthrough."

## Show Me hooks

Selection (min 8 chars) in original or Read output opens the floating
toolbar (Explain simply / Show visually / Show me this — PRD §6.2
verbatim). Result opens in `Drawer` (desktop) / `BottomSheet` (mobile)
with quote on top, result below, history stack with back/forward, Copy
per result. Source text keeps a highlight pulse while open.
