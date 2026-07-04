# STACK - decision and rationale

> Decision locked. This file documents why and what it means in practice.

---

## Decision: Angular + NestJS + Nx + SQL + pytriz MCP server

Supporting tools: **Claude Design** (UI prototyping, no Figma company account) and **Camunda Modeler** (Day 1 BPMN artifact).

## Why (closing arguments)

### 1. Pillars 3 and 4 are named after these technologies
- Pillar 3: "**Angular**, NX, Debugging" (20 pts)
- Pillar 4: "Fullstack (**NestJS**), Architecture, LLM Engineering" (20 pts)
- What's assessed is "alignment with what was presented during the workshops"
- Using React + C++ forfeits a large part of those 40 pts

### 2. The task maps directly onto this stack
- Day 5 workshop = building an MCP server with the `pytriz` package (TRIZ, contradiction matrix)
- The hackathon task = a system using TRIZ via the contradiction matrix
- pytriz + MCP + NestJS = the path the organizers planned

### 3. React + C++ gives no advantage on this task
- This is an LLM orchestration pipeline, not a game engine
- C++ does not speed up building a REST API with LLM integration
- React is not faster than Angular in 10h (the frontend dev is learning both anyway)

### 4. GDG event = Google-native is a plus
- Angular = Google, Material Design 3 = Google, Cloud Run = Google
- Even if the jury doesn't score this directly, stack consistency with the event is a signal

## Pace-risk mitigation

Risk: 15 years of C++ don't translate 1:1 to speed in NestJS. We address it, we don't run from it.

| Risk | Mitigation |
|------|-----------|
| NestJS new for the backend dev | Keep NestJS thin - orchestration over LLM/MCP, not heavy business logic |
| Angular new for the frontend dev | Claude Code scaffolds boilerplate. Angular Material 3 provides ready components |
| Nx monorepo boilerplate | Use nan-stack (Adam Kowalski, Day 4) as a starter or scaffold with Nx generators |
| Overall pace | Checkpoint 11:00: if NestJS isn't up, cut backend scope to the minimum. Priority = a working pipeline |

## Where C++ / React do NOT cost points

- Utility scripts, tooling, local tools - if someone wants to quickly test something in C++, fine
- But none of it goes into the deliverables

## What it means in practice

### For Kuba (frontend):
- Angular 19+ with signals and standalone components
- Angular Material 3 (ready components, `--mat-sys-*` tokens)
- Nx workspace: `apps/frontend`
- Claude Code for scaffolding boilerplate

### For Denys (backend):
- NestJS (modules / controllers / providers / middleware)
- Nx workspace: `apps/backend`
- pytriz MCP server (from Day 5 materials)
- Sequelize ORM + Cloud SQL (PostgreSQL)
- OpenAPI/Swagger auto-documentation

### For Oleh (PM):
- You don't need to know syntax - you need to understand the architecture (see `04_architecture.md`)
- Design tokens from `design-system.md` feed Angular Material
- Claude Code for: README, diagrams, simple text/config fixes

> If any stack element changes, the agent must update this file plus `04_architecture.md`, `CLAUDE.md`, and any affected sections in `05_schedule.md`.
