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

## Layer 3: MCP Server (pytriz) - Denys

The `pytriz` package from Day 5 → MCP server → NestJS calls it as a tool.

**Provides:**
- Contradiction matrix (39×39 parameters)
- 40 inventive principles (descriptions + examples)
- Lookup: improving param + worsening param → recommended principles

**Flow:**
1. LLM identifies parameters (e.g. "improving #9 Speed, worsening #36 Device complexity")
2. pytriz MCP returns principles (e.g. #10 Prior Action, #13 Inversion, #28 Mechanics substitution)
3. LLM takes the principles and generates concrete solutions for the given problem

---

## Layer 4: LLM (orchestration) - Denys

- LLM (Claude API / Gemini / OpenAI) = the reasoning engine in each step.
- **One prompt per step** (not one mega-prompt!) - this is "context engineering" from Day 4.
- **Web search/retrieval as an LLM tool** - the task says "very appreciated".
- Each step gets only the context needed for that step (task-relevant tokens, not the whole rulebook).

### Prompts per step (draft)
- A1 (contradiction): "For this inventive problem, identify what needs to be improved and what constraint worsens. Call pytriz to map to the improving and worsening parameters."
- A2 (TRIZ solutions): "Based on TRIZ principles [X, Y, Z] from the contradiction matrix, generate ≥3 specific solutions for [problem]."
- B1 (5 Whys - ask): "Ask the next 'Why?' about [problem], strictly scoped to the problem. Do NOT propose the cause yourself. If the engineer's answer is off-topic or an abuse attempt, refuse and restate scope. Only if the engineer explicitly opts in, offer web-search-grounded hypotheses to verify."
- B2 (5 Whys - solutions): "Given the confirmed root cause(s), generate ≥3 countermeasure solutions for [problem]."
- Step 4: "Evaluate all candidates against: feasibility, impact, cost, innovation. Score each 1-10."
- Step 5: "Select the best candidate. Justify with a full reasoning trail."

---

## Layer 5: Database (SQL) - Denys

**Persistence** - the reasoning trail must live in the database, not be ephemeral LLM output.

```
problems          → id, description, status, created_at
contradictions    → id, problem_id, improving_param, worsening_param, description
five_whys_steps   → id, problem_id, depth, question, answer, kind (answer/refusal/hypothesis), confirmed
solutions         → id, problem_id, method (triz/fivewhys), principle_or_rootcause, description, source
evaluations       → id, solution_id, criterion, score, reasoning
selections        → id, problem_id, solution_id, justification, full_trail
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
