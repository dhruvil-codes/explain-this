# Decisions

Log format: `date · context · options considered · choice · reason`.

- 2026-10-02 · Skill inventory found 8 skills in `.agents/skills/` mirrored in `.opencode/skills/` · use all vs subset · use all per PRD §3 (greploop conditional on Greptile presence) · PRD mandates every relevant skill invoked at least once.
- 2026-10-02 · MCP inventory: no MCP resources/templates listed; Neon + Paper tools present but not applicable · force-use vs log-as-N/A · log Neon/Paper as reviewed-not-applicable, use context7/gh/Vercel CLI/Playwright · keeps product shippable without pretending to use irrelevant servers.
- 2026-10-02 · `ui-ux-pro-max --design-system` suggested Cormorant Garamond/Crimson Pro + Swiss Modernism 2.0 · accept vs PRD lock · PRD §12.2 wins: Instrument Serif everywhere, editorial warm reading-room direction; skill output used for layout/spacing/a11y guidance only · PRD explicitly overrides skill on conflict.
- 2026-10-02 · Scaffold method for Next.js in non-empty repo · `create-next-app` into temp then merge vs manual package.json · manual scaffold (package.json + configs written directly) to avoid clobbering PRD/TASKS/docs · simplest shippable path, no destructive moves.
- 2026-10-02 · Redis unavailable by design (PRD §7 fallback) · Upstash vs file store · implement `ShareStore` adapter with in-memory + local JSON file store; `@upstash/redis` + `@upstash/ratelimit` wired only when env vars present, else in-memory limiter · never blocks without credentials.
- 2026-10-02 · LLM provider default · guess model IDs vs docs lookup · look up fast/strong Google model IDs via context7/docs at build time; defaults `gemini-2.5-flash` / `gemini-2.5-pro` kept only if confirmed · PRD forbids guessing from memory.
- 2026-10-02 · `.env.example` contained a real-looking `GOOGLE_GENERATIVE_AI_API_KEY` value · keep vs redact · redact to placeholder + secret-scan before each push · never commit secrets (§5.7).
