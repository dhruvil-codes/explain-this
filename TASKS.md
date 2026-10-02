# ExplainThis — Task Tracking

Status: `todo` | `doing` | `done` | `blocked-with-fallback`

## Phase 0: Bootstrap & Inventory
- [x] Repo initialized, remote connected, initial push (`main`) — *done*
- [x] Skills inventory installed (`ui-ux-pro-max`, `before-and-after`, `code-structure`, `evidence-driven-testing`, `greploop`, `greploop-apps`, `new-feature`, `unslop`) — *done*
- [x] Create `docs/SKILLS_USED.md` & `docs/MCP_USED.md` — *done* (orchestrator)
- [x] Project scaffolding (Next.js 16 App Router, TypeScript strict, Tailwind v4, pnpm) — *done* (orchestrator; `pnpm build` green)
- [ ] Setup GitHub issues per feature — *doing* (orchestrator; needs `gh` auth check)
- [x] Setup CI workflow (`.github/workflows/ci.yml`) — *done* (orchestrator)
- [x] `.env.example` secret redaction — *done* (reverted leaked key)

## Phase 1: Foundations
- [x] **architect**: Schemas & shared types (`src/lib/schemas/*`) — *done* (c68f207)
- [x] **design**: Design system (`design-system/MASTER.md`), Instrument Serif font, base UI tokens and primitives (`src/components/ui/*`) — *done* (cc5f200)
- [x] **llm**: Provider adapters (Google/OpenAI/Anthropic/Mock), prompts (`src/prompts/*`), repair logic — *done* (c4c6d4e)
- [x] **content**: 6 pre-generated example fixtures (`content/examples/*`) — *done* (9cba9ff)
- [x] **qa**: Vitest & Playwright scaffold — *done* (49466d6; 29 tests green)
- [x] **devops**: `Dockerfile`, `vercel.json`, `/api/health` route — *done* (8a13a47; DEPLOY.md + font embedded)
- [x] **orchestrator**: shared `checkRateLimit` helper (`src/lib/ratelimit/request.ts`) — *done*

## Phase 2: Feature Development
- [ ] **shell**: Landing page, navbar, input card, before/after strip, history (`src/app/(site)/*`) — *doing* (subagent; issue #1)
- [ ] **read**: Simplify streaming tab & reading level controls (`src/features/read/*`) — *doing* (subagent; issue #2)
- [ ] **see**: Diagram visualization with React Flow & Mermaid (`src/features/see/*`) — *doing* (subagent; issue #3)
- [ ] **play**: Sandboxed interactive iframe & fallback spec renderer (`src/features/play/*`, `src/lib/sandbox/*`) — *doing* (subagent; issue #4)
- [ ] **showme**: Selection floating toolbar, drawer/bottom sheet, context stack (`src/features/showme/*`) — *doing* (subagent; issue #5)
- [ ] **share**: Share link creation (`/s/[id]`), storage adapter, rate limits (`src/features/share/*`) — *doing* (subagent; issue #6)

## Phase 3: Integration & Hardening
- [ ] Merge feature worktrees to `main` — *todo* (using path ownership, not worktrees — see DECISIONS.md)
- [ ] End-to-end testing with mock provider (`pnpm e2e`) — *todo*
- [ ] Security audit (sandbox, CSP, sanitization, injection safeguards) — *todo*
- [ ] Accessibility (WCAG AA, keyboard navigation, reduced motion) — *todo*
- [ ] Visual polish & screenshots (Light/Dark at 375px & 1280px in `docs/screenshots/`) — *todo*

## Phase 4: Release & Handoff
- [ ] Production deployment / `docs/DEPLOY.md` — *todo*
- [ ] Comprehensive documentation (`README.md`, `docs/HANDOFF.md`, `CHANGELOG.md`) — *todo*
- [ ] Tag `v1.0.0` and push — *todo*
