# Skills Used

Inventory date: 2026-10-02. Source dirs: `.agents/skills/`, `.opencode/skills/` (mirrored, 8 skills).

| Skill | Where / when used | Status |
|---|---|---|
| `ui-ux-pro-max` | Phase 1 design: `design-system/MASTER.md` generation via `scripts/search.py --design-system --persist`; all UI in `src/components/ui/**`, `src/app/**`, `src/features/**`; pre-delivery checklist §12.5 | invoked (design-system search run 2026-10-02; MASTER to be persisted) |
| `code-structure` | Architecture: service-layer split — `src/lib/llm/*` + `src/lib/store/*` + `src/lib/sandbox/*` as service layer; API routes `src/app/api/*` as orchestration layer | to invoke during architect/llm/share/play work |
| `new-feature` | Git worktree isolation per subagent (`git worktree add ../wt-<name> -b feat/<name>`); scope check via `gh pr list` | to invoke before each Phase 2 feature branch |
| `before-and-after` | Visual comparison screenshots landing/result/share at 375/1280 light+dark into `docs/screenshots/` via `npx @vercel/before-and-after` | to invoke in Phase 3 polish |
| `evidence-driven-testing` | Hands-on verification: Playwright e2e + live smoke (`scripts/smoke-live.ts`); screen recording where GUI available, else headless Playwright probes; evidence attached to PR/issue | to invoke in Phase 3 QA |
| `greploop` / `greploop-apps` | PR review loop until Greptile 5/5 (if Greptile installed; else reviewer agent does manual review) | reviewed, conditionally applicable at merge time |
| `unslop` | Before every commit message, PR body, README/docs copy, and UI copy pass | to invoke continuously |

All 8 skills discovered and mapped. None judged irrelevant.
