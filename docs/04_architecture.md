# SYSTEM ARCHITECTURE

> A 5-step pipeline. Each step = separate logic, separate endpoint, separate screen.
> "Every step must run as a real, inspectable piece of logic" - this is a task requirement.
> The pipeline is generic across all 7 problems; Problem 7 (Buildings) is the demo case.

---

## Pipeline (data flow)

```
[Problem Input]
  → Step 1: Problem Analysis
      LLM analyzes the problem, identifies TRIZ parameters (improving/worsening)
  → Step 2: Contradiction Formulation
      LLM + pytriz MCP: map to the 39 parameters → technical contradiction
  → Step 3a: TRIZ Solution Generation
      pytriz MCP: contradiction matrix → inventive principles → LLM generates min. 3 concrete solutions
  → Step 3b: Method 2 Solution Generation
      LLM + [Biomimicry/SCAMPER]: min. 3 candidates via another method
  → Step 4: Evaluation
      LLM: evaluate all 6+ candidates against criteria (feasibility, impact, cost, innovation)
  → Step 5: Selection + Reasoning Trail
      LLM: select one, full justification, present the trail
  → [Output: complete reasoning trail]
```

---

## Layer 1: Frontend (Angular) - Kuba

### What the user sees (R&D client)

| Screen | Name | Input | Output |
|--------|------|-------|--------|
| 1 | Problem Input | Text description of the inventive problem | Registered problem |
| 2 | Contradiction View | (auto from Step 1-2) | Improving param, worsening param, contradiction |
| 3 | Solutions Gallery | (auto from Step 3a+3b) | 6+ candidates (3 TRIZ + 3 method 2) with descriptions and method source |
| 4 | Evaluation Matrix | (auto from Step 4) | Table: candidate × criterion, scoring, ranking |
| 5 | Recommendation | (auto from Step 5) | Selected candidate + full reasoning trail |

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
POST   /api/problems                    → accept problem, return ID
POST   /api/problems/:id/analyze        → Step 1: problem analysis (LLM)
POST   /api/problems/:id/contradiction  → Step 2: reformulate as contradiction (LLM + pytriz)
POST   /api/problems/:id/solutions/triz → Step 3a: generate TRIZ solutions (pytriz + LLM)
POST   /api/problems/:id/solutions/alt  → Step 3b: generate method-2 solutions (LLM)
POST   /api/problems/:id/evaluate       → Step 4: evaluate candidates (LLM)
POST   /api/problems/:id/select         → Step 5: select and justify (LLM)
GET    /api/problems/:id/trail           → return the full reasoning trail
GET    /api/problems/:id                 → status + results of all steps
```

Each endpoint = a separate NestJS module/service. Not one mega-endpoint.

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
- Step 1: "Analyze this inventive problem. Identify what needs to be improved and what constraint is preventing it."
- Step 2: "Map these to TRIZ engineering parameters. Call pytriz to find the improving and worsening parameters."
- Step 3a: "Based on TRIZ principles [X, Y, Z] from the contradiction matrix, generate 3 specific solutions for [problem]."
- Step 3b: "Using [Biomimicry/SCAMPER], generate 3 alternative solutions for [problem]."
- Step 4: "Evaluate all candidates against: feasibility, impact, cost, innovation. Score each 1-10."
- Step 5: "Select the best candidate. Justify with a full reasoning trail."

---

## Layer 5: Database (SQL) - Denys

**Persistence** - the reasoning trail must live in the database, not be ephemeral LLM output.

```
problems          → id, description, status, created_at
contradictions    → id, problem_id, improving_param, worsening_param, description
solutions         → id, problem_id, method (triz/alt), principle, description, source
evaluations       → id, solution_id, criterion, score, reasoning
selections        → id, problem_id, solution_id, justification, full_trail
```

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

> When the second method (3b) or the stack is refined, the agent must keep this file in sync with `01_task.md`, `03_problem_selection.md`, and `09_stack.md`.
