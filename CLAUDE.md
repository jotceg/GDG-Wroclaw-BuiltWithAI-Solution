# CLAUDE.md - Team Kakapos | GDG Wrocław "Build with AI" Hackathon Final

> This file is the master context for ALL AI agent sessions (Claude Code / Claude / Gemini).
> It is symlink-shared as AGENTS.md and GEMINI.md - keep it tool-agnostic.
> Your job: help team Kakapos score the maximum points in a 10-hour build sprint.
> Keep answers practical and concrete. When making strategic calls, always refer to the scoring criteria.

## 1. Who we are

Team **Kakapos**, 3 people, finals of GDG Wrocław "Build with AI" hackathon (10h, one day):
- **Oleh** - PM / business / design / pitch. Does NOT write code. Owns scope, Claude Design prototypes, process, submission, pitch.
- **Kuba** - frontend (Angular via agentic coding; game-dev background).
- **Denys** - backend (NestJS; 15+ yrs C++ senior). Owns deployment, LLM integration, technical quality.

Details, strengths, risks, pillar mapping: `team_profile.md`.

## 2. The task (summary - full decode in `01_task.md`)

Build a system for an R&D department (jury = client/investor) that:
1. Takes an inventive problem → reformulates it as a **technical contradiction**
2. Generates **≥3 candidate solutions via TRIZ** (contradiction matrix) + **≥3 via a second method**
3. **Evaluates all candidates** against the original problem, **selects one**
4. Presents the full reasoning trail: problem → contradiction → candidates → evaluation → choice

Hard constraint: **"Every step must run as a real, inspectable piece of logic, not a single prompt dressed up to look structured."** Build a multi-step pipeline (separate endpoints, separate prompts, persisted state) - never one mega-prompt.

Web search / retrieval as LLM tools = "very appreciated" by organizers. Use them.

**Scope rule:** the app must work with **all 7 SDG problems** from the task list (generic pipeline),
but the **demo and pitch focus on Problem 7 (Keeping Buildings Hot & Cold, SDG 13/11)**.
Problem analysis and rationale: `03_problem_selection.md`. TRIZ basics: `08_triz_primer.md`.

## 3. Scoring (200 pts total - details in `02_scoring.md` and `hackathon-priorities-scoring.md`)

- **100 pts** - artifacts from 5 workshop days (20 each): Day 1 process analysis (BPMN), Day 2 design system + tokens, Day 3 repo + run instructions, Day 4 evaluation report, Day 5 deployed public app
- **50 pts** - outcome criteria: Innovation **25**, Usability 10, Design 10, Completeness 5
- **50 pts** - Pitch 25 + Audience vote 25
- Rating other teams' presentations is a required post-pitch action but does not add to our own score
- **Criterion Zero (gate):** the app must genuinely solve the domain problem. If the reasoning trail is nonsense, nothing else counts.

## 4. Our priorities (ordered - full table in `hackathon-priorities-scoring.md`)

1. Criterion Zero: pipeline works end-to-end (verify at regular checkpoints)
2. Day 1 process analysis + hard MVP scope cut (do this first, before any serious code)
3. Innovation framing (problem choice + second generation method)
4. Repo with working code + README
5. Early deploy (skeleton on Cloud Run early, never last-minute)
6. Design system + tokens (Claude Design fed by `design-system.md`)
7. Day 4 evaluation report (define test scenarios at the start; it is a SEPARATE document)
8. Pitch + English slides
9. Visual polish, then usability pass
10. Completeness last (worth only 5 pts - never trade innovation or the pipeline for it)

If you (the agent) disagree with a priority call in context, say so briefly and propose the alternative.

## 5. Stack (locked - rationale in `09_stack.md`)

- **Nx monorepo**: `apps/frontend` (Angular 19+, signals, Angular Material 3), `apps/backend` (NestJS)
- **pytriz & Antigravity MCP server** (Python) on port **8123** for the TRIZ contradiction matrix and stateful reasoning agents built with the **Google Antigravity SDK** (`google-antigravity`)
- **SQL** (Cloud SQL / Postgres via Sequelize) - reasoning trail is persisted, never ephemeral
- **Claude Design** for UI prototypes (tokens from `design-system.md`); **Camunda Modeler** for the Day 1 BPMN artifact
- Deployment: Google Cloud Run + Cloud Build CI/CD
- Architecture spec (5 screens, 7+ endpoints, data model): `04_architecture.md`

## 6. Task list

**Sequential (blocking, in order):**
1. Scope cut + problem statement + BPMN in Camunda
2. Nx workspace scaffold: Angular app + NestJS app + repo conventions
3. Pipeline steps 1-2 working end-to-end (analyze → contradiction)
4. Pipeline steps 3a/3b/4/5 (TRIZ + method 2 → evaluate → select)
5. Deploy to Cloud Run
6. Submission form + confirmation with facilitator

**Parallel (non-blocking, run alongside):**
- UI screens in Claude Design → Angular components with `--mat-sys-*` tokens
- pytriz MCP server setup + LLM prompts per step
- Day 4 evaluation report: scenarios defined early, metrics collected during the day
- README + team responsibility diagram
- A11y pass - top 10 items from `a11y_AA_checklist.md`
- Pitch narrative + English slides + recorded demo backup

## 7. Working rules for agents

- Semantic HTML always (`<button>`, `<label>`, headings) - no div-soup; a11y is scored
- Design tokens only from `design-system.md` / `design-system-spec.md` - never hardcode hex values
- One prompt per pipeline step; only task-relevant context (context engineering)
- Keep NestJS thin - orchestration over LLM/MCP, not heavy business logic
- Trunk-based git: short branches, frequent merges to deployable `main`; never push secrets
- Common traps to avoid before every milestone: `10_traps.md`
- Schedule and checkpoint questions: `05_schedule.md`. Pitch structure: `06_pitch.md`. Submission links: `07_checklist.md`

## 8. Consistency rule (MANDATORY)

The team will keep refining decisions during the sprint (e.g. locking the second method beside TRIZ, changing the problem, adjusting the stack or architecture). Whenever a decision changes:

- You MUST update every file affected by that change, in the same session, so the docs never contradict each other.
- After any change, state briefly which files you updated and why.
- If a change would create a contradiction you cannot fully resolve, flag it explicitly instead of leaving stale content.

Cross-file impact map (change on the left → update the files on the right):
- Problem choice → `01_task.md`, `03_problem_selection.md`, `04_architecture.md`, `06_pitch.md`, `08_triz_primer.md`
- Second method (beside TRIZ) → `03_problem_selection.md`, `04_architecture.md`, `06_pitch.md`, `08_triz_primer.md`
- Stack / architecture → `04_architecture.md`, `09_stack.md`, `05_schedule.md`, this file
- Scope / priorities → `hackathon-priorities-scoring.md`, `05_schedule.md`, this file
- Design tokens → `design-system.md`, `design-system-spec.md`

All docs are in English. Keep them in English.

## 9. Context file map

- `01_task.md` - decoded task and hard requirements
- `02_scoring.md` - full point structure and owners
- `03_problem_selection.md` - 7 problems analyzed, recommendation, second-method pairing
- `04_architecture.md` - pipeline, screens, endpoints, data model, who builds what
- `05_schedule.md` - hour-by-hour run of day with checkpoints
- `06_pitch.md` - 5-minute pitch structure
- `07_checklist.md` - submission links and gates
- `08_triz_primer.md` - TRIZ explained for a non-technical PM
- `09_stack.md` - stack decision and rationale
- `10_traps.md` - point-losing mistakes to avoid
- `hackathon-priorities-scoring.md` - prioritized task order + full scoring
- `design-system.md` - design tokens (Angular Material `--mat-sys-*` + Claude Design)
- `design-system-spec.md` - token spec with verified WCAG AA contrast ratios
- `a11y_AA_checklist.md` - WCAG 2.1/2.2 AA checklist by POUR, with owners
- `team_profile.md` - team strengths, risks, pillar mapping
- `scoring_criteria.md` - organizers' 5-pillar criteria (English)
