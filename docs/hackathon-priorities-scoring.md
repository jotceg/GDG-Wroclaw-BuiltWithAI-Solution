# Hackathon - Priorities and scoring

## Scoring - full (200 pts)

### Artifacts from the 5 days (100 pts)

| Day | Artifact | Pts |
|-----|----------|-----|
| Day 1 | Process analysis - BPMN / Event Storming | 20 |
| Day 2 | Design System + Design Tokens + UI consistency | 20 |
| Day 3 | Repo with working code + run instructions | 20 |
| Day 4 | Evaluation report (scenarios → evaluation → metrics) | 20 |
| Day 5 | Deployed, publicly working application | 20 |

### Outcome criteria (50 pts)

| Criterion | Pts |
|-----------|-----|
| Innovation - originality, interesting ideas, potential | 25 |
| Usability - practicality of use | 10 |
| Design - purely the visual layer, subjective "is it nice" | 10 |
| Completeness - deployment readiness | 5 |

### Other (50 pts)

| Criterion | Pts |
|-----------|-----|
| Pitch (5 min, hard timer, no Q&A) | 25 |
| Audience vote | 25 |

### TOTAL AVAILABLE TO US: 200 pts

```
100 (5-day artifacts)
 50 (outcome criteria)
 50 (pitch + audience)
---
200 pts
```

> Rating other teams' presentations is a mandatory post-pitch gate but does not add to our own score.

---

## Priorities (corrected order)

Sorting logic: point weight × risk of forgetting × time cost.

### TIER 1 - do FIRST (decides the result)

| # | What | Pts | Owner | When | Why here |
|---|------|-----|-------|------|----------|
| 1 | **Criterion Zero: pipeline works end-to-end** | gate | everyone | all day, checkpoints 11:00/14:00/15:00 | Without it the rest = 0. The system must genuinely process the problem and return sensible solutions |
| 2 | **Process analysis + MVP scope (Day 1 artifact)** | 20 | Oleh | 8:30-9:30 | Do it first - it's a deliverable AND the tool to lock scope. BPMN/Event Storming of the pipeline in Camunda |
| 3 | **Innovation of the solution** | 25 | Oleh + team | 8:00 (problem choice) + 8:30 (scope) | Highest single weight in the outcome criteria. Decided when choosing the problem and second method (TRIZ mandatory, second = your innovation lever) |
| 4 | **Repo with working code (Day 3 artifact)** | 20 | Kuba + Denys | all day | Core deliverable. README with run instructions (required explicitly) |
| 5 | **Deploy - working public app (Day 5 artifact)** | 20 | Denys | skeleton ~16:00, not at the end! | Left to 17:00 = classic 20-pt loss. Deploy early, iterate |

### TIER 2 - do IN PARALLEL with Tier 1

| # | What | Pts | Owner | When | Why here |
|---|------|-----|-------|------|----------|
| 6 | **Design System + Design Tokens (Day 2 artifact)** | 20 | Oleh | 9:00-12:00 | UI in Claude Design with `design-system.md`. Tokens (colors/typography/spacing/radii/shadows) = required explicitly |
| 7 | **Evaluation report (Day 4 artifact)** | 20 | Oleh | scenarios at 8:30, report closed 16:00-17:00 | Most-forgotten artifact. A SEPARATE document, not the app. Scenarios → evaluation → metrics |
| 8 | **Pitch + English slides** | 25 (+influence on 25 audience) | Oleh | draft from the morning, rehearsal 17:30 | 5 min decides 50 pts (jury + audience). English slides (English-speaking juror). Structure in `06_pitch.md` |

### TIER 3 - polish (after a working pipeline)

| # | What | Pts | Owner | When | Why here |
|---|------|-----|-------|------|----------|
| 9 | **Design - visual layer** | 10 | Oleh + Kuba | 14:00-16:00 | Subjective "is it nice". Angular Material 3 + design-system tokens give a solid base. Polish after the pipeline |
| 10 | **Usability - practicality** | 10 | Oleh (QA) | 15:00+ | "How easy and intuitive to use". Walk the app as a client. Fix the flow |

### TIER 4 - secure (low time cost, easy to forget)

| # | What | Pts | Owner | When | Why here |
|---|------|-----|-------|------|----------|
| 11 | **Completeness** | 5 | Denys | all day | Deliberately the lowest weight (organizers: "finishing a dumb idea doesn't matter"). Don't sacrifice innovation or the pipeline for 100% completeness |
| 12 | **Audience vote** | 25 | (driven by pitch and impression) | 19:30+ | You don't control it directly - you influence it via the pitch, demo, and overall impression |

### DON'T FORGET (gates, not separately scored)

| What | Owner | When |
|------|-------|------|
| Rate all teams (mandatory action to submit ratings) | Oleh | 19:30+ (after pitches) |
| Team composition + responsibility breakdown (diagram) | Oleh | 8:30-9:30 |
| Confirm submission with Dawid Perdek | Oleh | 17:30 |
| Collect ALL 6 form links | Oleh | 16:30 (buffer) |

---

## Corrections vs the earlier draft

| Earlier draft | Problem | Fix |
|---------------|---------|-----|
| "Date tree" | Unclear name | → "Repo with working code + README" (Day 3 artifact, 20 pts) |
| "Ewalsy" | Unclear name, low position | → "Evaluation report" (Day 4 artifact, 20 pts) - raised to Tier 2, it's a separate 20-pt deliverable, most often forgotten |
| "All kinds of links" | Not a separate category | → it's the submission checklist (a gate), not a point source. Folded into "Deploy" and "Repo" |
| 200 pts total, methods unclear | Needed clean breakdown | → 200 pts confirmed: 100 artifacts + 50 outcome + 50 pitch/audience. Rating other teams is a gate, not our points |
| "dk" / "o" against priorities | Unclear for the team | → clear assignment: Oleh / Kuba / Denys + concrete time windows |
| Criterion Zero missing | Wasn't in the list | → added as priority #1. Without a working pipeline everything else = 0 |
| Design at #3 | Too high vs its weight (10 pts) | → Tier 3 #9. Important, but only after a working pipeline and innovation |
