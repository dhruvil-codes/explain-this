# ExplainThis — Design System (MASTER, global truth)

> When building a page, first check `design-system/pages/<page>.md`.
> A page file overrides this MASTER for that page only.
> Everything else follows this file. PRD §6 and §12 override every other
> source, including the `ui-ux-pro-max` skill output recorded below.

- Product: ExplainThis — "the I don't get it button for AI answers."
- Direction: warm editorial reading room. A well-set book that happens to
  be interactive. Generous whitespace, thin hairline rules, large serif
  headlines with italic emphasis words, calm motion. Never a SaaS dashboard.
- Skill run: `ui-ux-pro-max` search
  `"editorial calm explanatory learning tool reading" --design-system`
  plus `--domain typography` ("calm reading typography serif") and
  `--stack nextjs` ("streaming tabs skeleton nextjs") supplements,
  2026-10-02. Raw skill output is kept in
  `design-system/explainthis/MASTER.md` for reference. That file is NOT
  authoritative wherever it conflicts with this file.

## 1. Overrides where PRD wins over the skill (recorded per brief)

| # | Skill suggestion | PRD lock (what we ship) | Reason |
| - | ---------------- | ----------------------- | ------ |
| 1 | Fonts: Cormorant Garamond headings + Crimson Pro body + Cinzel labels | Instrument Serif for EVERYTHING (headings, body, buttons, labels, tabs, tooltips); JetBrains Mono only for code | PRD §12.2 typography lock |
| 2 | Palette: stone primary `#78716C`, amber CTA `#D97706`, amber bg `#FFFBEB`, slate text | Light bg `#FAF7F2`, surface `#FFFFFF`, ink `#1B1A17`, muted `#6B665C`, hairline `#E4DED2`, single accent `#C2410C` / dark bg `#141311`, surface `#1C1B18`, ink `#F2EEE6`, muted `#A39E92`, hairline `#2E2C27`, accent `#F08A5D` | PRD §12.3 token lock, AA-verified (see §3) |
| 3 | Pattern: Hero + Testimonials + CTA carousel with social proof | Landing per PRD §6.3: nav, hero, input card, example chips, before/after strip, 3-step How it works, recent history, footer. No testimonials, no carousel | Product is a tool, not a marketing funnel; first-time user must reach the input in seconds |
| 4 | Buttons: 600 weight, 8px radius, lift-on-hover (`translateY`) | Weight 400 only (no synthetic bold anywhere); pill radius; hover changes color/opacity only, never moves layout | PRD §12.2 (no bold) + skill anti-pattern "layout-shifting hovers" |
| 5 | Cards with `shadow-md/lg` and hover lift | Hairline borders, almost no shadow; hover changes border color only | PRD §12.3 look-and-feel lock |
| 6 | Helvetica/Swiss grid keywords | Editorial serif reading room; 12-col grid thinking is fine, Helvetica is not | PRD §12.3 direction lock |

Adopted from the skill (no conflict): SVG icons only (Lucide, no emoji);
`cursor-pointer` on all clickables; 150-300ms transitions (we use
150-250ms); 4.5:1 text contrast; visible focus; prefers-reduced-motion;
responsive at 375 / 768 / 1024 / 1440; skeleton loaders with reserved
space (no layout shift on stream); Suspense/streaming-friendly patterns.

## 2. Typography (locked, PRD §12.2)

- Instrument Serif via `next/font/google` (`Instrument_Serif`, weight 400,
  normal + italic, `display: swap`, latin) for everything: headings, body,
  buttons, labels, tabs, tooltips.
- No bold weight exists. NEVER use weight 700, bold utility classes,
  or b / strong elements for emphasis. Hierarchy comes
  from size, italic, color, spacing, and hairline rules.
- Body 19-20px / 1.6 desktop, 18px minimum mobile. Small labels never
  below 15px.
- `font-feature-settings` ligatures/kerning on; `text-wrap: balance` on
  headings, `pretty` on paragraphs (in `globals.css`).
- Mono (`JetBrains Mono` via `next/font`, `code`/`pre` only) for code
  blocks and inline code. Fallback stack:
  `"Instrument Serif", ui-serif, Georgia, "Times New Roman", serif`.
- Type scale: hero 56-72px desktop / 40px mobile; H1 40px; H2 32px;
  section titles 28px; lead 22px; body 19px; small labels 15-16px.

## 3. Color tokens (locked, PRD §12.3; full definitions in `src/styles/tokens.css`)

Single accent, warm paper surfaces, hairlines instead of shadows.

Light: background `#FAF7F2`, surface `#FFFFFF`, paper `#FFFDF8`,
ink `#1B1A17`, muted `#6B665C`, hairline `#E4DED2`, accent `#C2410C`,
accent-ink `#93350A`, accent-soft `#FCE9DC`, on-accent `#FFFFFF`.

Dark: background `#141311`, surface `#1C1B18`, paper `#1E1D19`,
ink `#F2EEE6`, muted `#A39E92`, hairline `#2E2C27`, accent `#F08A5D`,
accent-ink `#F5B58F`, accent-soft `#2E2019`, on-accent `#1B1A17`.

Semantic: destructive light `#B3261E` / dark `#E8A08A`;
success light `#2C7046` / dark `#8FD0A3`; each with a `-soft` surface.

### Contrast notes (measured 2026-10-02, WCAG AA normal text >= 4.5)

Light: ink/bg 16.28, muted/bg 5.34, accent/bg 4.85, white/accent 5.18,
accent-ink/accent-soft 6.47, destructive/destructive-soft 5.36,
success/success-soft 5.15. Dark: ink/bg 16.05, muted/bg 6.95,
accent/bg 7.51, accent/accent-soft 6.36, destructive pair 7.01,
success pair 8.26. All pass.

Two corrections made during token design: light `success` moved from
`#2F7D4F` to `#2C7046` (was 4.34 on its soft surface, now 5.15), and a
separate `accent-ink` role was added because accent on accent-soft is
4.40 in light and fails — text on accent-soft surfaces must use
`accent-ink`, never `accent`.

Diagram palette: five muted tones from the accent family
(`--diagram-1..5` + soft fills). Nodes always pair ink text with a soft
fill and a text label; color never carries meaning alone.

## 4. Shape, motion, voice

- Radius: cards 12-14px, controls 10px, pills 999px. Shadows: almost
  none; hairline borders do the work. Paper textarea gets one subtle
  inner shadow.
- Motion: 150-250ms ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`); tab
  transitions crossfade; streaming text fades in by line; selection
  pulse on Show-Me open. All disabled under `prefers-reduced-motion`
  (global kill-switch in `globals.css`).
- Voice: plain, welcoming, zero jargon in UI. No "LLM", "node graph",
  "concept map". Say "plain English", "diagram", "interactive".
- Copy is locked in PRD §6.2 — use it verbatim (hero H1, sub, placeholder,
  CTA, trust line, share note, footer privacy line).

## 5. Component inventory (`src/components/ui/`, one file each)

All components: Tailwind v4 + `class-variance-authority` where variants
help, Lucide icons only, tokens via CSS vars (no raw hex), visible focus
rings (accent, 2px + offset), min 44px touch targets on interactive
elements, `cursor-pointer` on clickables, 150-250ms ease-out motion with
`prefers-reduced-motion` support, appropriate aria props.

| Component | File | Notes |
| --------- | ---- | ----- |
| Button | `button.tsx` | cva: primary / secondary / subtle / ghost / destructive; sm/md/lg; loading state; arrow-icon slot pattern |
| IconButton | `icon-button.tsx` | 44px square; `aria-label` required; ghost / outline |
| Tabs | `tabs.tsx` | Underlined serif words, accent underline on active, muted italic subtitles; roving tabindex, arrow-key nav, `tablist` semantics |
| SegmentedControl | `segmented-control.tsx` | `radiogroup` semantics; used for Read level (Simpler / Standard / Technical) |
| Card | `card.tsx` | surface + hairline; variants default / paper / ghost |
| Textarea | `textarea.tsx` | Paper style, inner shadow; label, hint, error, live counter near limit |
| Chip | `chip.tsx` | Pill action chip for examples; active state |
| Toast | `toast.tsx` | `Toast` + `ToastStack`; `status` / `alert` roles; success/info/error |
| Skeleton | `skeleton.tsx` | `Skeleton`, `SkeletonLines`; `aria-hidden`, reserved-space shapes |
| Tooltip | `tooltip.tsx` | `role=tooltip`, describedby wiring, Esc dismiss |
| Drawer | `drawer.tsx` | Right drawer ~420px desktop; focus trap-in, return focus, scroll lock, Esc |
| BottomSheet | `bottom-sheet.tsx` | Mobile sheet; drag handle, swipe-down dismiss, Esc |
| ThemeToggle | `theme-toggle.tsx` | System default, localStorage persist, Sun/Moon/Monitor |
| Logo | `logo.tsx` | ExplainThis italic serif wordmark, link home |
| ProgressLine | `progress-line.tsx` | Slim determinate/indeterminate line with muted italic label |
| EmptyState | `empty-state.tsx` | Icon + title + description + action slot |
| ErrorState | `error-state.tsx` | `role=alert`, calm copy, Try-again via `onRetry` or action slot |
| Helper | `cn.ts` | `clsx` + `tailwind-merge` class composer (stays inside owned paths) |

## 6. Page overrides

- `pages/landing.md` — hero, input card, example chips, before/after strip.
- `pages/result.md` — split-screen result view, tab bar, Show-Me hooks.
- `pages/share.md` — read-only shared page, `noindex`, calm chrome.

## 7. Pre-delivery checklist (skill + PRD §12.5)

Contrast AA both themes; visible focus everywhere; `cursor-pointer` on
clickables; touch targets >= 44px; no horizontal scroll at 375px;
verified at 375 / 768 / 1024 / 1440; no layout shift on stream;
skeletons match final layout; loading/empty/error/success states per
stage; reduced motion honored; keyboard-only full flow; Lucide icons
only, consistent stroke; Instrument Serif rendered everywhere, no
synthetic bold; screenshots (landing, result x3 tabs, Show-Me panel,
share; light + dark at 375 and 1280) in `docs/screenshots/`.
