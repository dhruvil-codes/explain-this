# MCP Usage

Inventory date: 2026-10-02.

Connected MCP/tool servers observed in this harness:

| MCP / tool family | Available tools | Used for |
|---|---|---|
| `context7` (`resolve-library-id`, `query-docs`) | docs lookup | Fetch current API docs for Next.js, React, Tailwind, shadcn/ui, `@xyflow/react`, Mermaid, Vercel AI SDK, Motion before writing code; cache into `docs/refs/` |
| `Neon` (project/branch/db/auth/storage) | Postgres mgmt | Not needed — project uses Upstash Redis/file store, not Neon Postgres. Logged as reviewed, not applicable |
| `paper` (artboards, HTML, styles, tokens) | design canvas | Not used — UI is built in Next.js with `ui-ux-pro-max`, not Paper canvas. Logged as reviewed, not applicable |
| `fetch`/`webfetch`/`websearch` | web I/O | Instrument Serif font fetch for sandbox embed fallback; model-ID verification if context7 lacks it |
| `filesystem` (`read`/`write`/`edit`/`glob`/`grep`) | dev work | All file work |
| `shell` (`bash`) | dev work | pnpm, git, worktrees, scripts, tests, builds |
| `task` (subagents) | orchestration | Spawn architect/design/llm/content/qa/devops/shell/read/see/play/showme/share/security/reviewer/docs agents |
| `skill` | skills | Load skill instructions (ui-ux-pro-max etc.) |
| GitHub (`gh` CLI) | repo/CI | Repo verify, issues per feature, PRs, Actions logs (GitHub MCP server not connected as MCP; CLI used instead) |
| Vercel (CLI) | deploy | Deploy preview/production, env vars, build logs (CLI used; MCP server not connected) |
| Playwright (CLI, `npx playwright`) | browser verify | Screenshots at 375/768/1280, sandbox behavior, tab flow, saved to `docs/screenshots/` |

Efficiency rules applied: batch related calls, cache fetched docs into `docs/refs/`, never re-fetch, prefer MCP/CLI over scraping, scope each subagent's use.
