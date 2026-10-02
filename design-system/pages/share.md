# Share (`/s/[id]`) — page override

Extends `design-system/MASTER.md` with shared-page rules.

## Chrome

- Read-only. Minimal top bar: `Logo` (small) + theme toggle only. No
  input, no toolbar, no analytics beyond page view.
- `noindex` meta. Share note verbatim under the title: "Anyone with the
  link can view this."

## Content

- Same `Tabs` (Read / See / Play) and renderers as the result view, fed
  by the stored payload. Missing stages render `EmptyState`, never a
  spinner that never resolves.
- Expired/missing link: `EmptyState` with "This link has expired or never
  existed." + action linking home. Footer carries the one-line privacy
  note verbatim.

## Performance

Fully static render from the stored payload; lazy-load diagram and
interaction runtimes below the fold. Skeletons only while those chunks
load, with reserved space.
