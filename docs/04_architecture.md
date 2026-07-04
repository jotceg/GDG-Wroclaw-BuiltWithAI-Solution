# SYSTEM ARCHITECTURE

> A pipeline with TWO PARALLEL generation methods (TRIZ + 5 Whys) that converge on a shared
> evaluation + selection. Each step = separate logic, separate endpoint, inspectable on the UI.
> "Every step must run as a real, inspectable piece of logic" - this is a task requirement.
> The pipeline is generic across all 7 problems; Problem 7 (Buildings) is the demo case.

---

## Pipeline (data flow)

The problem comes straight from the user's prompt - there is NO separate normalization/analysis
step. Each branch interprets the problem itself: TRIZ via the contradiction, 5 Whys via questioning.
The two generation methods run in parallel so the engineer answers 5 Whys questions while the
automated TRIZ branch works (no wasted time).

```
[Problem Input]
  → SPLIT into two parallel generation methods

  ── Branch A - TRIZ (automated) ──
     A1: Formulate technical contradiction (LLM + pytriz MCP: map to the 39 parameters)
     A2: Contradiction matrix → inventive principles → LLM generates ≥3 concrete solutions

  ── Branch B - 5 Whys (human-in-the-loop) ──
     B1: Agent asks "Why?" (scoped to the problem); engineer answers each step in turn.
         Guardrail: off-topic / abuse (e.g. "what's the weather") is refused, not answered
         (cost + abuse control). If the engineer is stuck, the agent may offer web-search-
         grounded hypotheses "to verify" - explicit human opt-in, engineer confirms/rejects;
         unconfirmed items are marked "assumption", never fact. The agent facilitates, it does
         NOT answer for the engineer (preserves 5 Whys integrity).
     B2: Drill to root cause(s) → LLM generates ≥3 countermeasure solutions

  → MERGE candidate pool (6+ candidates)
  → Step 4: Evaluation
      LLM: evaluate all 6+ candidates against criteria (feasibility, impact, cost, innovation)
  → Step 5: Selection + Reasoning Trail
      LLM: select one, full justification, present the trail
  → [Output: complete reasoning trail, persisted per step]
```

> The two generation methods (TRIZ + 5 Whys) satisfy the task's "≥3 candidates from each of two
> methods". They contrast well: TRIZ = cross-domain abstraction via the contradiction matrix;
> 5 Whys = causal drill-down to a root cause, then targeted countermeasures.

---

## Layer 1: Frontend (Angular) - Kuba

### What the user sees (R&D client)

| Screen | Name | Input | Output |
|--------|------|-------|--------|
| 1 | Problem Input | Text description of the inventive problem | Registered problem |
| 2 | Contradiction View | (auto from Branch A) | Improving param, worsening param, contradiction |
| 2b | 5 Whys Q&A | Engineer answers each "Why?" (interactive) | Causal chain → root cause(s); shows guardrail refusals + any confirmed hypotheses |
| 3 | Solutions Gallery | (auto from Branch A2 + B2) | 6+ candidates (3 TRIZ + 3 via 5 Whys) with descriptions and method source |
| 4 | Evaluation Matrix | (auto from Step 4) | Table: candidate × criterion, scoring, ranking |
| 5 | Recommendation | (auto from Step 5) | Selected candidate + full reasoning trail |

> Screen 2 (TRIZ contradiction, automated) and Screen 2b (5 Whys Q&A, interactive) run in
> parallel - the engineer can answer 5 Whys while TRIZ computes.

**Key UX:** each screen = one pipeline step. The user sees the input and output of each step. This is the "inspectable" requirement. Ability to go back to any step and see what went in and what came out.

### Technology
- Angular 19+ (signals, standalone components)
- Angular Material 3 (`--mat-sys-*` tokens from `design-system.md`)
- Semantic HTML from the first component (A11Y)
- Nx workspace: `apps/frontend`

---

## Layer 2: Backend (NestJS) - Denys

### Pipeline endpoints

```
POST   /api/problems                        → accept problem, return ID
# Branch A - TRIZ (automated)
POST   /api/problems/:id/contradiction      → reformulate as contradiction (LLM + pytriz)
POST   /api/problems/:id/solutions/triz     → generate ≥3 TRIZ solutions (pytriz + LLM)
# Branch B - 5 Whys (interactive loop driven by the client)
POST   /api/problems/:id/fivewhys/next      → agent returns next "Why?" (guardrail-checked)
POST   /api/problems/:id/fivewhys/answer    → submit engineer's answer / opt-in for hypotheses
POST   /api/problems/:id/solutions/fivewhys → root cause → generate ≥3 countermeasure solutions
# Converge
POST   /api/problems/:id/evaluate           → Step 4: evaluate ALL candidates (LLM)
POST   /api/problems/:id/select             → Step 5: select and justify (LLM)
GET    /api/problems/:id/trail              → return the full reasoning trail
GET    /api/problems/:id                     → status + results of all steps
```

Each endpoint = a separate NestJS module/service. Not one mega-endpoint. Branches A and B are
independent; the client can run them in parallel and drives Branch B's Q&A loop turn by turn.
There is no `/analyze` endpoint - each branch interprets the raw problem itself.

### Technology
- NestJS (modules/controllers/providers)
- Nx workspace: `apps/backend`
- OpenAPI/Swagger auto-documentation

---

## Layer 3: MCP Server (pytriz & Antigravity Agents) - Denys

The Python MCP server in `apps/mcp-server` is built using `fastmcp` and the **Google Antigravity SDK** (`google-antigravity`).

**Exposes:**
- **Raw TRIZ Matrix Lookup**: Maps improving + worsening parameters to principles.
- **Stateful AI Agents (as tools)**:
  - `agent_contradiction`: Runs `ContradictionAgent` to identify technical contradiction parameters.
  - `agent_triz_solutions`: Runs `TrizSolutionAgent` to generate TRIZ-based candidates.
  - `agent_five_whys_next`: Runs `FiveWhysAgent` with Google Search tool capabilities to ask questions or verify hypotheses.
  - `agent_five_whys_solutions`: Runs `FiveWhysSolutionAgent` for countermeasures.
  - `agent_evaluate`: Runs `EvaluationAgent` to score candidates.
  - `agent_select`: Runs `SelectionAgent` to select the best candidate.

---

## Layer 4: LLM Orchestration (Google Antigravity SDK) - Denys

- LLM (Gemini 3.5 Flash via Google Antigravity SDK) is orchestrated within the Python MCP server.
- **Stateful agents** enforce structured output schemas (via Pydantic models) so that NestJS receives strictly typed JSON payloads.
- **One prompt/agent per step** for context engineering.
- **Web search tool** is bound to the `FiveWhysAgent` to retrieve web-search-grounded hypotheses when requested by the engineer.

### Agent Prompts & Schemas (Structured Output)
- **ContradictionAgent**: Identifies technical contradiction. Prompts: *"Extract improving/worsening parameters."* Returns `ContradictionResult` schema.
- **TrizSolutionAgent**: Generates solutions from principles. Prompts: *"Given inventive principles [X], generate >=3 solutions."* Returns list of `SolutionItem` schema.
- **FiveWhysAgent**: Asks next why, checks for abuse. Prompts: *"Ask next Why. If off-topic, refuse. If engineer requests help, query search tool for hypotheses."* Returns `FiveWhysResponse` schema.
- **FiveWhysSolutionAgent**: Generates countermeasures. Prompts: *"Based on root cause [R], generate >=3 solutions."*
- **EvaluationAgent**: Scores all solutions. Prompts: *"Score 1-10 against feasibility, impact, cost, innovation."* Returns candidate matrix schema.
- **SelectionAgent**: Selects best solution. Prompts: *"Choose the best candidate, provide full trail."* Returns `SelectionResult` schema.

---

## Layer 5: Database (SQL) - Denys

**Persistence** - the reasoning trail must live in the database, not be ephemeral LLM output.

```
users             → id, email, password_hash, name, role, created_at, updated_at
problems          → id, user_id, description, status, created_at, updated_at
contradictions    → id, problem_id, improving_param_code, improving_param_name, worsening_param_code, worsening_param_name, explanation, created_at, updated_at
five_whys_steps   → id, problem_id, depth, question, answer, kind (answer/refusal/hypothesis), confirmed, created_at, updated_at
solutions         → id, problem_id, method (triz/alt), principle_code, principle_name, title, description, created_at, updated_at
evaluations       → id, solution_id, criterion, score, reasoning, created_at, updated_at
selections        → id, problem_id, selected_solution_id, justification, full_trail_json, created_at, updated_at
```

> `five_whys_steps` persists the whole 5 Whys Q&A trail (including guardrail refusals and any
> confirmed hypotheses) so it is inspectable on the UI - not ephemeral chat.

Technology: Cloud SQL (PostgreSQL) via Sequelize ORM (from Day 4).

---

## Deployment (Pillar 5)

- Google Cloud Run: frontend + backend + MCP server (3 containers)
- CI/CD: Cloud Build → Artifact Registry → Cloud Run
- Cloud SQL: PostgreSQL
- Cloud Logging / dashboards (Pillar 5 bonus)

**IMPORTANT: deploy a skeleton early, not at the last minute.** A deploy left to the end is a classic way to lose 20 pts.

---

## Who builds what (summary)

| Who | What | Pillar |
|-----|------|--------|
| Oleh | Scope, task board, UI/UX in Claude Design, BPMN (Day 1), design tokens, Day 4 report, pitch, README, rate all teams | 1, 2, (4) |
| Kuba | 5 Angular screens, wiring to API, design tokens → CSS, a11y pass | 2, 3 |
| Denys | NestJS pipeline (7 endpoints), pytriz MCP server, LLM integration, SQL, Docker, Cloud Run, CI/CD | 4, 5 |

> Second method is locked to **5 Whys** (root-cause → countermeasures), run in parallel with TRIZ.
> When the second method or the stack is refined, the agent must keep this file in sync with `01_task.md`, `03_problem_selection.md`, `06_pitch.md`, `08_triz_primer.md`, and `09_stack.md`.
