# Architecture

## Overview
ExplainThis: paste AI answer → Read (simplify, streamed) + See (diagram) + Play (interactive) + Show Me This (selection-scoped) + Share (`/s/[id]`).

## Request flow (§8)
1. `POST /api/simplify` (stream) + `POST /api/analyze` (JSON) in parallel.
2. On analyze success → `POST /api/visualize` + `POST /api/explore` in parallel.
3. Show Me: `POST /api/show-me` with `{selection, context, analysis}`.
4. Share: `POST /api/share` → `GET /s/[id]`.

All stages: route → `runStage()` (`src/lib/llm/`) → zod-validate → one repair retry → typed error. `maxDuration = 60`. Pasted text wrapped in `<source>` delimiters, never followed as instructions.

## Service vs orchestration (`code-structure` skill)
- Orchestration: `src/app/api/*` routes (auth/ownership checks, rate limits, failure classification, retries).
- Service layer: `src/lib/llm/*` (provider SDK calls), `src/lib/store/*` (ShareStore), `src/lib/sandbox/*` (shell build/CSP/handshake), `src/lib/ratelimit/*`.

## Schemas (`src/lib/schemas/`)
- `analysis.ts` (§9.1), `diagram.ts` (§9.3), `interaction.ts` (§10.3), `stored.ts` (share payload, TTL 90d), `showme.ts`.

## Sandbox (§10.2)
`buildDocument.ts` wraps model HTML: CSP `default-src 'none'; script-src 'unsafe-inline'; ...`, theme vars, base64 Instrument Serif `@font-face`, bootstrap (`ready`/`error`/height). Strips meta/base/link/iframe/object/embed/external src/forms. Parent validates `event.source === iframe.contentWindow` + zod message shape. 4s `ready` timeout, 3s post-ready error window. `sandbox="allow-scripts"`, `srcdoc` only, never `allow-same-origin`.

## Store
`ShareStore` interface → `redis.ts` (Upstash REST, when env present) / `file.ts` (local JSON) / `memory.ts`. `nanoid(10)` IDs. Rate limits: 20 explains/h, 60 show-me/h, 10 shares/h per IP; in-memory fallback.

## Client state
Zustand (or context) + `sessionStorage` mirror; `localStorage` recent-10. Tabs parallel, skeletons, `aria-live` streaming status.

## Routes
`/` landing, `/explain`, `/examples`, `/s/[id]` (noindex), `/about`, `/api/{health,simplify,analyze,visualize,explore,show-me,share}`, 404/error in brand style.
