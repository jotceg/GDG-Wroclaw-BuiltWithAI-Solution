# DAY SCHEDULE - run of day

> Kakapos | Room 204D | Facilitator: Dawid Perdek
> 10h build sprint. Checkpoints every 2-3h. Oleh drives the rhythm.

---

## 7:00-7:55 - Registration (Building E, room 1)

- [ ] Pick up gifts, team photo.
- [ ] Confirm room: **204D**.
- [ ] Oleh: read the 7 problems (if not done the evening before).

## 8:00 - Task announcement + problem selection

- [ ] **Oleh leads the problem choice.** Filter: see `03_problem_selection.md`.
- [ ] Pitch slot choice: aim for the **3rd-5th** slot (jury warmed up, still fresh).
- [ ] Decision: problem + second method (TRIZ mandatory, see `03_problem_selection.md`).

## 8:15-8:30 - START BUILDING

## 8:30-9:30 - SCOPE WINDOW (Oleh leads, whole team) ★★★

**Goal: lock scope and start three parallel tracks.**

### Oleh (60 min):
- [ ] Problem statement + persona (R&D manager at company X)
- [ ] Core pipeline flow (5 steps from `04_architecture.md`)
- [ ] **Hard MVP cut** - what does NOT go in (write it on the board / in an issue)
- [ ] **Day 1 artifact: Event Storming / BPMN of the pipeline in Camunda** - do it NOW, not at the end
- [ ] Define 5-8 test scenarios for the Day 4 report
- [ ] Task board (GitHub Issues / kanban) + checkpoints
- [ ] Team composition and responsibility diagram (required artifact for the pitch)
- [ ] **Question for Dawid Perdek:** is a Claude Design link accepted as the "Figma design"?

### Kuba (after scope from Oleh):
- [ ] `nx g @nx/angular:app frontend` - skeleton
- [ ] First page: Problem Input + results skeleton

### Denys:
- [ ] `nx g @nx/nest:app backend` - skeleton
- [ ] Stand up the pytriz MCP server (from Day 5 materials)
- [ ] First endpoint: `POST /problems/:id/contradiction` - proof of life
- [ ] Docker + initial deploy to Cloud Run (skeleton)

## 9:30-11:00 - BUILDING (parallel tracks)

### Oleh:
- [ ] UI/UX in Claude Design: 5 pipeline screens (feed it `design-system.md`)
- [ ] Hand off screens to Kuba
- [ ] Scaffold the Day 4 report (template, scenarios)
- [ ] Draft the pitch narrative

### Kuba:
- [ ] Screen 1: Problem Input (form)
- [ ] Screen 2: Contradiction View
- [ ] Design tokens from `design-system.md` → Angular Material theme

### Denys:
- [ ] Steps 1-2 endpoints (analyze + contradiction)
- [ ] LLM + pytriz MCP integration
- [ ] SQL schema + Sequelize

## 11:00 - CHECKPOINT #1 (Oleh leads) ★★

**Question: do Step 1 (Problem Analysis) + Step 2 (Contradiction) work end-to-end?**
- Frontend sends a problem → backend reformulates → pytriz returns parameters → user sees the contradiction?
- **YES:** continue Steps 3-5.
- **NO:** cut scope. Simplify the backend. Priority = a working pipeline, even with hardcoded data on the missing steps.

## 11:00-14:00 - BUILDING (continued)

### Oleh:
- [ ] UI iteration (feedback from the checkpoint)
- [ ] Day 4 report: run the test scenarios through the system
- [ ] Pitch: refine the structure (see `06_pitch.md`)

### Kuba:
- [ ] Screens 3-5 (Solutions Gallery, Evaluation Matrix, Recommendation)
- [ ] Wiring to endpoints (as they land)
- [ ] A11Y basics: semantic HTML, labels, contrast

### Denys:
- [ ] Steps 3a, 3b, 4, 5 endpoints
- [ ] Web search as an LLM tool (task: "very appreciated")
- [ ] Persist the reasoning trail in SQL

## 14:00 - PIZZA + CHECKPOINT #2 ★★

**Question: does the pipeline run all 5 steps end-to-end, even if ugly?**
- **YES:** polish UI, a11y, Day 4 report, pitch.
- **NO:** freeze new features. Whole team on closing the pipeline.

## 14:30-16:00 - POLISH + DEPLOY

### Oleh:
- [ ] Day 4 report: run scenarios, collect metrics
- [ ] README with run instructions
- [ ] Pitch rehearsal (first pass)

### Kuba:
- [ ] A11Y pass: Tab, focus, contrast, labels (top 10 from `a11y_AA_checklist.md`)
- [ ] UI polish (spacing, typography, responsiveness)

### Denys:
- [ ] Fix-only on the backend, zero new features
- [ ] Deploy to Cloud Run with a working pipeline

## 15:00 - CHECKPOINT #3 (Criterion Zero) ★★★

**Question: does the system genuinely solve the assigned problem?**
- Feed the chosen SDG problem → run 5 steps → is the output sensible?
- If the reasoning trail is nonsense: **fix prompts/context** (context engineering from Day 4).

## 16:00 - DEPLOY MUST BE READY ★★★

- [ ] Denys: test under the public URL
- [ ] Oleh: walk the app as a "client" - does it work?
- [ ] **DO NOT LEAVE DEPLOY TO 17:00**

## 16:00-17:30 - CLOSING (no new features)

- [ ] Oleh: finish the Day 4 report
- [ ] Oleh: collect ALL links (see `07_checklist.md`)
- [ ] Kuba: final UI/a11y fixes
- [ ] Denys: stability, logs, monitoring

## 17:30 - SUBMISSION FORM (HARD GATE) ★★★

- [ ] Submit the form with all links
- [ ] **Confirm with Dawid Perdek** (he is in your room!)

## 17:30-18:00 - PITCH PREP

- [ ] Oleh: rehearse to 4:30 (not 5:00)
- [ ] Backup: record the demo as a video (live demos die on unknown networks)

## 18:00 - Building ends

## 18:05 - PITCHES (order known from the morning)

## 19:30 - Jury evaluates + audience vote form

- [ ] **Oleh: rate ALL teams** = required gate. Do not forget.

## 20:35 - Results announced

## 21:00 - Afterparty (Beachbar)
