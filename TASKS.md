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
- [ ] **architect**: Schemas & shared types (`src/lib/schemas/*`) — *doing* (subagent)
- [ ] **design**: Design system (`design-system/MASTER.md`), Instrument Serif font, base UI tokens and primitives (`src/components/ui/*`) — *doing* (subagent)
- [ ] **llm**: Provider adapters (Google/OpenAI/Anthropic/Mock), prompts (`src/prompts/*`), repair logic — *doing* (subagent)
- [ ] **content**: 6 pre-generated example fixtures (`content/examples/*`) — *doing* (subagent)
- [ ] **qa**: Vitest & Playwright scaffold — *doing* (scaffold done; subagent expands coverage)
- [ ] **devops**: `Dockerfile`, `vercel.json`, `/api/health` route — *done* (orchestrator; subagent adds DEPLOY.md + font fetch)

## Phase 2: Feature Development
- [ ] **shell**: Landing page, navbar, input card, before/after strip, history (`src/app/(site)/*`) — *todo*
- [ ] **read**: Simplify streaming tab & reading level controls (`src/features/read/*`) — *todo*
- [ ] **see**: Diagram visualization with React Flow & Mermaid (`src/features/see/*`) — *todo*
- [ ] **play**: Sandboxed interactive iframe & fallback spec renderer (`src/features/play/*`, `src/lib/sandbox/*`) — *todo*
- [ ] **showme**: Selection floating toolbar, drawer/bottom sheet, context stack (`src/features/showme/*`) — *todo*
- [ ] **share**: Share link creation (`/s/[id]`), storage adapter, rate limits (`src/features/share/*`) — *todo*

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
