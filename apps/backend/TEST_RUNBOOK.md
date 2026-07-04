# Backend Test Runbook

How to test the backend end-to-end and confirm it behaves per `docs/01_task.md` (the
6 hard requirements) and `docs/04_architecture.md` (endpoints, tables, persistence).

There are three layers: **unit tests** (no infra), **integration tests** (live
Postgres + MCP), and a **live smoke run** (the real HTTP pipeline). Run them in that
order.

---

## 0. Prerequisites

| Dependency | Where | Needed for |
|---|---|---|
| Node + npm, `npx nx` | repo root | everything |
| Postgres | `localhost:5432`, db `buildwithai`, creds from root `.env` | integration + live |
| Ollama | `localhost:11434` | live smoke (default LLM path) |
| MCP daemon | `apps/mcp-server`, `localhost:8123` | MCP path + MCP integration test |

Check what's up:

```bash
for p in 5432 11434 8123 3000; do (exec 3<>/dev/tcp/localhost/$p && echo "$p OPEN" && exec 3<&-) 2>/dev/null || echo "$p CLOSED"; done
curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"'   # which Ollama models exist
```

> ⚠️ The backend defaults to `OLLAMA_MODEL=llama3`. If that model is not pulled,
> every Ollama call 404s and the service silently uses a hardcoded mock — which
> then **crashes the TRIZ step** (see findings #5/#7 in `docs/backend_test_findings.md`).
> For a real live run, set `OLLAMA_MODEL` to a model you actually have, e.g.
> `OLLAMA_MODEL=gpt-oss:20b`.

---

## 1. Unit tests (no infra) — must always be green

```bash
npx nx test backend
```

Covers: controller routing (all 11 handlers), `ProblemsService` methods + guard
branches (NotFound / BadRequest), `LlmService` MCP tool routing + Ollama fallback,
`McpClientService` wire contract (axios mocked). Runs without Postgres/Ollama/MCP.

## 2. Integration tests (live Postgres + MCP)

```bash
npx nx test-integration backend
```

- Runs only `*.integration.spec.ts`.
- Uses an **isolated Postgres schema** (`backend_it`, override with `DB_TEST_SCHEMA`)
  created and dropped per run, so it never touches `buildwithai` dev data.
- **Fails loudly** if Postgres or the MCP daemon is down (no silent pass).
- `mcp-client.service.integration.spec.ts` characterizes finding #1: the backend's
  REST path `POST /tools/{tool}` returns **404** because FastMCP serves the MCP
  protocol at `/mcp`. These tests PASS while the mismatch exists and FLIP once it's
  fixed.

## 3. Live smoke run (the real HTTP pipeline) — Criterion Zero

Build and start the app:

```bash
npx nx build backend
OLLAMA_MODEL=gpt-oss:20b node dist/apps/backend/main.js   # pick a model you have
# → 🚀 Application is running on: http://localhost:3000/api
```

Drive the documented pipeline (Problem 7). `:id` comes from step 1's response.

```bash
API=http://localhost:3000/api; CT='Content-Type: application/json'
# 1. create
curl -s -X POST $API/problems -H "$CT" \
  -d '{"description":"Keeping buildings hot in winter and cold in summer with minimal energy"}'
#    → { "id": "...", "status": "PENDING" }
ID=<paste id>

# 2. contradiction  (Branch A / TRIZ)
curl -s -X POST $API/problems/$ID/contradiction        # → improving/worsening params + explanation
# 3. TRIZ solutions (>=3)
curl -s -X POST $API/problems/$ID/solutions/triz        # → array of >=3 {title,description,principleCode,...}

# 4. 5 Whys loop (Branch B) — repeat next→answer to drill toward a root cause
curl -s -X POST $API/problems/$ID/fivewhys/next         # → { question, done }
curl -s -X POST $API/problems/$ID/fivewhys/answer -H "$CT" -d '{"answer":"Because sunlight enters through large windows","confirmed":true}'
# 5. 5 Whys countermeasures (>=3)
curl -s -X POST $API/problems/$ID/solutions/fivewhys    # → array of >=3 {title,description}

# 6. evaluate ALL candidates
curl -s -X POST $API/problems/$ID/evaluate              # → evaluations across feasibility/impact/cost/innovation
# 7. select one + persist trail
curl -s -X POST $API/problems/$ID/select                # → { selectedSolutionId, justification }
# 8. inspect
curl -s $API/problems/$ID/trail                         # → full reasoning trail JSON
curl -s $API/problems/$ID                               # → status COMPLETED + all associations
```

A convenience driver that runs all of the above lives at
`scratchpad/drive.sh` (session-local); copy it into the repo if you want it durable.

### Pass/fail checklist (maps to the 6 hard requirements)

- [ ] **Req 1 (two methods)**: solutions exist with both `method:'triz'` and `method:'fivewhys'`.
- [ ] **Req 2 (>=3 + >=3)**: at least 3 TRIZ + at least 3 five-whys candidates.
- [ ] **Req 3 (evaluate ALL)**: every solution id appears in `evaluations`.
- [ ] **Req 4 (select one)**: exactly one `selections` row with a non-empty `justification`.
- [ ] **Req 5/6 (inspectable, persisted trail)**: `trail` contains
      problem → contradiction → fiveWhysSteps → candidates+evaluations → choice, and
      final status is `COMPLETED`.

### 4. Inspectability check — confirm each step is separately persisted (not one blob)

```bash
PGPASSWORD=$DB_PASSWORD psql -h localhost -U pgsadmin -d buildwithai -c \
"SELECT 'problems' t, count(*) FROM problems
 UNION ALL SELECT 'contradictions', count(*) FROM contradictions
 UNION ALL SELECT 'solutions', count(*) FROM solutions
 UNION ALL SELECT 'evaluations', count(*) FROM evaluations
 UNION ALL SELECT 'five_whys_steps', count(*) FROM five_whys_steps
 UNION ALL SELECT 'selections', count(*) FROM selections;"
```

Each pipeline step must have written its own rows — that is what makes the reasoning
trail "a real, inspectable piece of logic" rather than a single dressed-up prompt.

---

## Status of known issues (see `docs/backend_test_findings.md`)

- **#1 FIXED** — MCP server now exposes a REST bridge at `POST /tools/{name}`, so the
  MCP path reaches the pytriz tools (200, not 404). `agent_*` tools still need a Google
  Antigravity key for real output.
- **#5 / #7 FIXED** — offline mock fallback is now deterministic and correctly shaped;
  with no LLM reachable the full pipeline completes to `COMPLETED` (default config),
  so a green live run no longer requires any model. Set `OLLAMA_MODEL` to an installed
  model for a real-LLM run.
- **#8 FIXED** — build no longer fails on the dead test helper (`tsconfig.app.json` exclude).

Remaining: Google Antigravity key for real MCP-agent output; rotate the committed DB
password; MCP README port says 8000 (actual 8123).
