# Backend Test Findings & Fixes

Result of testing the whole backend end-to-end against `docs/01_task.md` (6 hard
requirements) and `docs/04_architecture.md` (endpoints, tables, persistence).

**Bottom line:** the pipeline **orchestration is correct** and now runs end-to-end to
`COMPLETED` with a fully persisted, inspectable reasoning trail — verified both by the
integration suite (real Postgres, mocked LLM) and by a live HTTP run of all 11
endpoints. Several defects were found; the impactful ones are **fixed and verified**.
Criterion Zero (pipeline works end-to-end) is **met**.

## Test assets added

- `npx nx test backend` — unit suite (no infra): controller (11 handlers), service
  methods + guard branches, `LlmService` tool routing + offline fallback, `McpClientService`
  wire contract. **55 tests.**
- `npx nx test-integration backend` — live suite (Postgres + MCP), isolated per-file
  Postgres schema, fails loudly if infra is down. **9 tests.**
- `apps/backend/TEST_RUNBOOK.md` — manual/curl live smoke runbook + DB inspection.

## Findings

| # | Severity | Issue | Status |
|---|---|---|---|
| 1 | Blocker | Backend calls MCP via REST `POST /tools/{name}`, but FastMCP served only `/mcp` → every tool call 404'd | **FIXED** |
| 2 | High | `run_select_agent` used undefined `evals` (param is `evaluations`) → NameError on select | **FIXED** |
| 3 | Medium | No input validation on any endpoint (no DTOs / ValidationPipe) | **Partially fixed** |
| 4 | Low | `User` model not registered in `ProblemsModule.forFeature` | **FIXED** |
| 5 | High | `LLM_PROVIDER=ollama` + default model `llama3` absent → silent mock fallback | **Mitigated** |
| 6 | Low | `axios` used but undeclared dep; committed DB password in `.env` | **Partially fixed** |
| 7 | High | Offline `mockFallback` matched on prompt keywords → TRIZ/eval misrouted → 500 crash | **FIXED** |
| 8 | Blocker | `nx build backend` failed: dead test helper `testing/sequelize-mock.ts` (uses `jest`) shipped in app build | **FIXED** |
| 9 | Medium | `search_parameter` / `search_principle` didn't `await` the async pytriz store → "coroutine has no len()" | **FIXED** |

### Detail & fix

- **#1 MCP transport** — added a plain-REST bridge in `apps/mcp-server/app/main.py`:
  `POST /tools/{tool_name}` dispatches the registered tool and returns
  `{content:[{text}]}`, inserted on the same Starlette app so `/mcp` and its
  session-manager lifespan keep working. Verified live: `browse_contradiction_matrix`
  and `search_parameter` return 200 with real pytriz data; `/mcp` still 406 (alive);
  unknown tool → 404. *Note:* the `agent_*` tools still need a Google Antigravity API
  key to produce real reasoning; without it they error at runtime (transport is fixed,
  auth is environmental).
- **#2** — `apps/mcp-server/app/services/agents.py`: `json.dumps(evals…)` → `evaluations`.
- **#3** — added lightweight guards (`BadRequestException`) for empty problem
  description and empty 5-Whys answer in `problems.service.ts`. Full DTO/ValidationPipe
  validation deferred (needs `class-validator`/`class-transformer`, not installed).
- **#4** — `User` added to `ProblemsModule.forFeature`.
- **#5 / #7** — `llm.service.ts` `mockFallback` now routes by an explicit step `kind`
  (not prompt keywords) and returns the correct shape for every step; `evaluate`/`select`
  fallbacks use the **real candidate ids** so the offline trail is FK-consistent. Result:
  with no LLM reachable the full pipeline completes to `COMPLETED` (6 candidates, 24
  evaluations, persisted trail) instead of 500-ing at TRIZ. The default `OLLAMA_MODEL`
  is still `llama3`; set `OLLAMA_MODEL` to an installed model (e.g. `gpt-oss:20b`) for a
  real-LLM run — the contradiction step produced genuine high-quality reasoning when
  tested with `gpt-oss:20b`.
- **#6** — `axios` declared in root `package.json`. The committed DB password in `.env`
  is **not** fixed here — rotate the credential and move it to a secret store (code-scope
  change only removes it going forward; the value is already in git history).
- **#8** — `apps/backend/tsconfig.app.json` excludes `src/app/testing/**` (and the
  integration jest config). Recommended follow-up: delete the unused helper entirely.
- **#9** — `search_parameter`/`search_principle` made `async` and `await` the store.

## Verified requirement coverage (live run, Problem 7)

| Req | Evidence |
|---|---|
| 1 two methods | solutions with `method:'triz'` and `method:'fivewhys'` |
| 2 ≥3 + ≥3 | 3 TRIZ + 3 five-whys = 6 candidates |
| 3 evaluate ALL | 24 evaluations = 6 × {feasibility, impact, cost, innovation} |
| 4 select one | one `selections` row, real `selectedSolutionId` + justification |
| 5/6 persisted, inspectable trail | `trail` = problem→contradiction→fiveWhysSteps→candidates+evaluations→choice; status `COMPLETED`; each step in its own table |

## Remaining / out of scope

- Google Antigravity API key for real `agent_*` output (environmental).
- Full request-body validation via DTOs (needs new deps).
- Rotating the leaked DB credential; removing the dead `testing/sequelize-mock.ts`.
- MCP server README still says port 8000 (actual 8123).
