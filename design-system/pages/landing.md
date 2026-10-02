# Landing (`/`) — page override

Extends `design-system/MASTER.md` with landing-specific rules.

## Structure (PRD §6.3, in order)

Nav (wordmark left via `Logo`; "Examples" link + `ThemeToggle` right),
hero, input, example chips, before/after strip, 3-step How it works,
recent history (localStorage, last 10, hidden if empty), footer.

## Hero

- H1 verbatim: "Don't reread it. See it." — oversized (56-72px desktop,
  40px mobile), `text-wrap: balance`, one italic emphasis word ("See it."
  in italic accent-ink).
- Sub verbatim: "Paste any AI answer. Get it back in plain English, as a
  diagram, and as something you can play with." Lead 22px, muted.
- Single accent CTA (`Button` primary, ArrowRight icon, "Explain this")
  scrolls to / focuses the input card.

## Input card

- `Textarea` paper style, large, subtle inner shadow; placeholder verbatim:
  "Paste an AI answer here…".
- Live counter near the 12,000-char cap; min 20 chars to enable CTA.
- Label above: "Or try an example" introduces the `Chip` row (6 PRD
  chips verbatim), each chip fills the input on click.

## Before/after strip

Dense paragraph (left, muted, small) turning into the three outputs
(right): three mini `Card`s labeled Read / See / Play with one-line
muted italic captions. Static on mobile (stacked), no carousel.

## How it works

Three steps, numbered in italic accent ("1 · Paste", "2 · Pick a way to
see it", "3 · Show me any sentence"), short muted descriptions, hairline
rules between. No icons needed; numerals carry it.

## States

Empty history hidden (not an empty box). No-key degraded mode: calm
banner above input ("Live explanations are temporarily unavailable. Try
the examples.") linking to `/examples`.
