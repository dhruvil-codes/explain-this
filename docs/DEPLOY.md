# Deploy — ExplainThis

Production hosting is **Vercel**. `Dockerfile` (multi-stage, `standalone` output)
ships for portability. Health check: `GET /api/health` returns
`{ ok, version, provider, strategy }` (never secrets).

Prerequisites:

- Node 20+, pnpm 10 (`corepack enable`), Vercel CLI (`npm i -g vercel`), Docker (only for step 5).
- Optional: provider API key, Upstash Redis REST credentials.
- No key? The app still runs in mock/degraded mode with the 6 pre-generated examples.

Regenerate the sandbox font embed before deploying (offline-safe, writes a stub if blocked):

```bash
pnpm exec tsx scripts/fetch-font.ts
```

---

## Step 1 — Create the Vercel project (CLI)

```bash
vercel login
vercel link          # accept defaults on first run: creates the project
vercel               # first preview deploy, follow prompts
```

This creates the project and a preview URL. Note the project name for step 3.

## Step 2 — Set environment variables

Add via CLI (repeat per variable) or the dashboard
(Project → Settings → Environment Variables). Set for **Preview and Production**.

```bash
vercel env add LLM_PROVIDER production
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
# …repeat for each row below
```

| Variable                      | Required | Default / example   | Purpose                                                        |
| ----------------------------- | -------- | ------------------- | -------------------------------------------------------------- |
| `LLM_PROVIDER`                | Yes      | `google`            | `google` \| `openai` \| `anthropic` \| `mock` (no key = `mock`) |
| `LLM_FAST_MODEL`              | Yes      | `gemini-2.5-flash`  | Fast model: analyze, simplify, visualize, Show Me              |
| `LLM_STRONG_MODEL`            | Yes      | `gemini-2.5-pro`    | Strong model: explore / sandbox HTML generation                |
| `GOOGLE_GENERATIVE_AI_API_KEY`| If google| — (secret)          | Key for `LLM_PROVIDER=google`                                   |
| `OPENAI_API_KEY`              | If openai| — (secret)          | Key for `LLM_PROVIDER=openai`                                   |
| `ANTHROPIC_API_KEY`           | If anthropic | — (secret)      | Key for `LLM_PROVIDER=anthropic`                                |
| `EXPLORE_STRATEGY`            | No       | `html`              | `html` (sandbox) \| `spec` (safe renderer fallback)             |
| `UPSTASH_REDIS_REST_URL`      | Prod rec.| —                   | Share-link storage; unset = local JSON fallback (dev only)      |
| `UPSTASH_REDIS_REST_TOKEN`    | Prod rec.| — (secret)          | Token for Upstash Redis REST                                    |
| `DAILY_REQUEST_CAP`           | No       | `1000`              | Global daily kill-switch; friendly "at capacity" message        |
| `VERCEL_TOKEN`                | No       | — (secret)          | Only needed for CLI/MCP-automated deploys                       |

Rules: only one provider key is needed (matching `LLM_PROVIDER`).
`LLM_PROVIDER=mock` needs no key and is the default for tests/CI.
Never commit `.env.local`; `.env.example` documents every variable.

## Step 3 — Preview → production

```bash
vercel                  # preview deploy → get preview URL, click-test it
vercel --prod           # promote to production
curl -s https://<your-app>.vercel.app/api/health
# expect: {"ok":true,"version":"0.1.0","provider":"google","strategy":"html"}
```

Verify on the production URL: paste text → Explain this → Read streams,
See draws a diagram, Play loads an interaction, highlight text → Show me this,
Share copies a `/s/[id]` link. `vercel.json` sets function `maxDuration: 60`
and security headers (`X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options: DENY`, mirrored in `next.config.ts`).

## Step 4 — Custom domain (optional)

```bash
vercel domains add explainthis.example.com
```

Then add the `CNAME`/`A` record shown by the CLI to your DNS provider,
and assign it in the dashboard (Project → Settings → Domains). HTTPS is automatic.

## Step 5 — Docker alternative (no Vercel)

The `Dockerfile` aligns with `next.config.ts` (`output: "standalone"`):
builds with pnpm, copies `.next/standalone` + `.next/static` + `public`,
runs as non-root `nextjs` on port 3000.

```bash
docker build -t explainthis .
docker run --rm -p 3000:3000 --env-file .env.local explainthis
curl -s http://localhost:3000/api/health
```

Compose/production: pass env with `-e` flags or your orchestrator's secret
store instead of `--env-file`. Image serves `node server.js` (`HOSTNAME=0.0.0.0`).

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Landing banner "Live explanations unavailable" | Normal in `mock` mode; set `LLM_PROVIDER` + key, redeploy |
| Share links reset on restart | Set `UPSTASH_REDIS_REST_URL`/`TOKEN` (local JSON fallback is ephemeral) |
| `429` / "going fast" / "at capacity" | Per-IP rate limits or `DAILY_REQUEST_CAP` tripped; wait or raise the cap |
| Function timeout on explore | `maxDuration: 60` is already set; check provider latency, retry (one auto-repair is built in) |
