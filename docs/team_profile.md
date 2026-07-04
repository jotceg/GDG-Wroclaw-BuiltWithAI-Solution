# Team profile - GDG Wrocław "Build with AI" (10h final)

> Reusable document (can be pasted into prompts / shared with the team).
> Maps the 3 people's real strengths onto the 5 scoring pillars + Criterion Zero.

**Composition (roles locked):** Oleh - business/PM/design + AI orchestration + pitch (does not code). Kuba - frontend (volunteered). Denys - backend (only option).

**Key note on competencies:** only two people actually touch code - Kuba (game-dev C++/Unreal background, learning Angular) and Denys (15 years C++, learning NestJS). Both are new to the web stack and lean heavily on AI. Oleh does not program in any language - his contribution is directing AI tools (Claude Code) + product QA at the behavior level (not code review) + the team's strongest business and design judgment + pitch. At an AI-native event this is a real, scored contribution, but it means there is no backup pair of hands for code - so Denys is the technical backbone and scope must be ruthless.

---

## SHORT VERSION

**Oleh - Product/Business/Design lead, AI orchestration, Pitch, Process (does not code)**
Business Informatics (spec. Analysis and Design of IT Systems). Strongest business and design judgment on the team. Can direct AI agents (Claude Code) and QA the result at the product level; understands BPMN/systems modeling conceptually. Operational background (Żabka Jush: live KPI, Looker, CSAT 4.83/5). Prior AI hackathon with BNY: under his direction AI built a working prototype, he presented it to an industry jury. Multilingual.
→ **Leads:** Discovery/MVP scope (Pillar 1), UI/UX direction (Pillar 2), pitch, process (git-workflow, task board, checkpoints), domain-correctness QA (Criterion Zero), AI orchestration during the build.
→ **Does not do:** solo code. Not a backup for implementation when devs get stuck.

**Kuba - Frontend (Angular via AI) + Systems/Architecture**
Unreal Engine programmer (C++, Blueprint), 2+ years, ~30k lines, multiplayer, optimization (Unreal Insights, 80-150 FPS). Bachelor's thesis on systems analysis and design. Perforce admin. 10xDevs - Agentic / AI-Native Development. Design Thinking (DThon). Has some design sense (but Oleh holds the design/business direction).
→ **Leads:** frontend implementation Angular/Nx (Pillar 3) via agentic coding; co-architecture (Pillar 4); optimization (Pillar 5).
→ **Note:** zero web-frontend - compensates with agentic coding. Tendency toward "proper analysis/design" = over-engineering risk under pressure.

**Denys - Backend (NestJS) + Deployment + LLM + technical backbone**
15+ years C++, senior. CI/CD (Jenkins), build systems, sysadmin. Cert **Claude Code (Anthropic)** + cert **Advanced AI: Transformers/GPTs/NN**. Optimization/benchmarking (Kalman, embedded). Java/Kotlin/Swift. Known for discipline and ownership.
→ **Leads:** NestJS + architecture (Pillar 4), Deployment/CI-CD/Cloud (Pillar 5), LLM engineering (Pillar 4), assessing AI output quality (the only one with real seniority).
→ **Note:** NestJS is new, but its patterns (DI, modules, layers) map 1:1 to his enterprise background - low barrier.

**Pillar coverage (short):**
Pillar 1 (Product/MVP) - very strong. Pillar 2 (UI/UX & A11Y) - **weakest, needs a deliberate A11Y owner**. Pillar 3 (Angular/Nx) - medium, risk of no web experience, compensated by AI. Pillar 4 (NestJS/Arch/LLM) - strong. Pillar 5 (Deploy/Scale/Opt) - strong, deployment has an owner.

---

## LONG VERSION

### 1. Oleh - Product/Business/Design lead, AI orchestration, Pitch, Process

**Background:** Business Informatics (UEW), specialization "Analysis and Design of IT Systems". Real Time Operations Specialist at Żabka Jush (live KPI monitoring, order-flow optimization on live data, 2000+ sessions/month, CSAT 4.83/5, escalations, compensation decisions; tools: Looker, Jira, Confluence, Freshdesk, Excel, Slack/Zapier). Earlier customer service/POS, multilingual. Erasmus (Cyprus).

**Important competency clarification:** Oleh does not program in any language. Projects on his profile (React, JS, Claude API "integration") were built under his direction using AI/Claude Code - his role was supervisory: directing the build and making sure there were no critical failures at the product-behavior level. He does not do code review; he does behavior and product QA.

**Real strengths:**
- **Business and product judgment** - strongest on the team. Problem definition, value, ROI, MVP priorities.
- **Design/UX direction** - stronger than Kuba (who only has execution-level design sense). Oleh sets direction, Kuba implements.
- **AI orchestration** - directing AI agents in the build (Claude Code) and assessing the result at the product level. Key at an AI-native event.
- **Systems analysis / BPMN** - conceptually (analysis, process modeling), not through code.
- **Pitch** - prior presentation to a BNY jury, customer-service background, multilingual.
- **Monitoring/KPI** - Żabka/Looker: real feel for measurable metrics (time, cost, errors).

**Mapping to pillars:**
- **Pillar 1 (Product Design & MVP):** LEAD. Discovery, Problem Statement Canvas, persona, process-diagram direction (BPMN), defining measurable KPIs (Day 1 materials: "sufficient conditions", "not accuracy").
- **Pillar 2 (UI/UX & A11Y):** direction LEAD - prototype in Claude Design, UX decisions. Kuba does implementation. A11Y needs an assigned owner (see risks).
- **Pillar 4 (LLM Engineering):** support - directing prompt/context via AI (not solo backend code).
- **Criterion Zero:** continuous domain-correctness QA - plays the Client and clicks through the product.
- **Pitch (final scoring):** main speaker.

**How to use / what to watch:** the best fit on the team for product, design and pitch, plus AI conductor. Risk: no code backup - when devs get stuck, Oleh can only redirect AI or catch a behavior bug. He cannot be the sole owner of discovery + UI + A11Y + pitch at once; A11Y is best split off as a separate, checklist-based task.

---

### 2. Kuba (Jakub Cywka) - Frontend (Angular via AI), Systems/Architecture

**Background:** Unreal Engine Game Programmer (President Studio). 2+ years of Unreal: co-founder and co-lead of an informal team (up to 9 people) making a co-op horror; as the sole programmer he implemented game systems (lobby, interaction, inventory, reactor, electrics, sonar) in C++ and Blueprint, ~30k lines, multiplayer replication, multithreading, high performance (80-150 FPS), profiling in Unreal Insights. Administered Perforce. Bachelor's thesis: "The importance of the analysis and design process in software engineering". 10xDevs 3.0 - AI-Native / Agentic Engineering. Design Thinking DThon (GAMEHEARTS).

**Skills relevant to the hackathon:** systems analysis & design · software architecture · C++ (transfer of architectural thinking, not web syntax) · optimization and profiling · multithreading/performance · version control admin (Perforce - not Git) · agentic/AI-native development · design sense (for execution, not for setting direction).

**Mapping to pillars:**
- **Pillar 3 (Angular, Nx, Debugging):** implementation LEAD. Gap: no web. Compensation: agentic coding (Antigravity/Claude Code - his fresh learning direction). UI direction comes from Oleh.
- **Pillar 4 (Architecture):** co-LEAD - thesis and practice are modeling/designing architecture; valuable for Nx boundaries and NestJS modules.
- **Pillar 1 (Product/MVP):** support - Design Thinking + requirements engineering.
- **Pillar 5 (Optimization):** support - real profiling and optimization (Day 1: "Benchmark!").

**How to use / what to watch:** brings architectural judgment and fast learning with AI. Shared risk with Denys: two systems people under pressure may over-invest in architecture - you must hard time-box design and keep a walking skeleton before elegance. Oleh holds the design/business direction so Kuba doesn't have to decide it.

---

### 3. Denys (Denys Zamkovyi) - Backend (NestJS), Deployment, LLM, technical backbone

**Background:** 15+ years of engineering, senior C++ (Grid Dynamics, earlier 9 years Luxoft). Domains: flight simulation (Flight Dynamics Server - 100 aircraft real-time, 3D Sound Server), STB embedded Linux, mobile SDK (iOS/Android - C++/Kotlin/Swift), automotive AUTOSAR Classic/Adaptive, Kalman filtering. Started as sysadmin/webmaster. CI/CD (Jenkins), maintaining build systems, OEM integration. Certificates: **Claude Code in Action (Anthropic)**, **EAS-041 Advanced AI - Transformers, GPTs & Neural Networks**, Databricks Fundamentals, ML Essentials, AUTOSAR Adaptive. Testing: Google Test/Gmock. References: discipline, ownership, high quality, detail, trust with critical tasks.

**Skills relevant to the hackathon:** systems architecture (15 years) · CI/CD and build systems · sysadmin/infra · optimization and benchmarking · testing · technical-level understanding of LLMs (Transformers/GPTs cert) · hands-on with Claude Code · Java/Kotlin/Swift besides C++.

**Mapping to pillars:**
- **Pillar 5 (Deployment, Scale & Optimization):** LEAD. CI/CD + sysadmin + build systems = natural owner of Cloud Run / Cloud Build / CI-CD. De-risks the most common cause of failure (deploy dies in the last hour). Plus real optimization/benchmarking.
- **Pillar 4 (NestJS, Architecture, LLM):** LEAD. NestJS is inspired by enterprise patterns (DI, modules, decorators, layers) - familiar patterns in new syntax for him, low barrier. LLM/Transformers certs = groundwork for "LLM Engineering" (evals, context engineering).
- **Technical backbone:** the only one with real seniority - judges whether AI output (and architectural decisions) make sense. Critical, because Oleh doesn't do code review.

**How to use / what to watch:** the safest pair of hands for deployment and technical quality. He should stand up the skeleton + CI/CD early (goal: green pipeline before the clock starts). Shared risk with Kuba: perfectionism vs pace - Oleh (PM) guards scope and cuts.

---

## TEAM LEVEL

### Strengths (to use deliberately)
- **AI-native is your natural mode.** Oleh conducts AI + product, Kuba agentic coding, Denys Claude Code + real LLM understanding. The event is exactly about this - play it.
- **Systems analysis & architecture - unusual depth.** Kuba (thesis), Denys (15 years), Oleh (specialization, conceptual). Directly Pillar 1 and "Architecture" in Pillar 4. Over-index on discovery and the architecture story in the pitch.
- **Deployment has an owner (Denys).** A rare advantage - most teams sink on deploy.
- **Optimization is a real edge (Kuba + Denys).** Day 1: "Benchmark!" - you have people to back it up.
- **Business judgment + pitch (Oleh).** Prior presentation to a jury (BNY), ops/customer-service background, multilingual.
- **Monitoring/KPI (Oleh, Żabka/Looker).** Maps to Pillar 5 (Cloud Logging/dashboards) and a measurable ROI narrative.

### Weaknesses / risks (address up front)
- **No fluent web coder.** Only Kuba (game→web) and Denys (C++→web) touch code, both new to the stack, both on AI. Oleh is not a code backup. This is the central throughput risk. Mitigation: ruthless scope, Denys as technical backbone, sharp AI tools, an evening scaffold + hello-world deploy.
- **Pillar 2 (UI/UX & A11Y) least staffed.** No dedicated web-UI/UX; A11Y with no owner. Bake accessibility in from the first component (semantic HTML, labels, contrast, keyboard) and assign someone - the judge checks it quickly.
- **Over-engineering risk (Kuba + Denys).** Two systems people under pressure may over-invest in architecture. Oleh (PM) must firmly guard the walking skeleton and scope cuts.
- **Version control / git-workflow.** Kuba knows Perforce, Denys Bitbucket/CI-CD - no one declares clean Git-flow for an Nx monorepo. Agree a simple, flat workflow (trunk-based + short branches) up front. Owner: Denys.

### Staffing across the 5 pillars (summary)
- **Pillar 1 - Product Design & MVP:** Oleh (lead), Kuba (architecture/discovery support).
- **Pillar 2 - UI/UX & A11Y:** Oleh (direction lead + prototype), Kuba (implementation), + assigned A11Y owner (realistically Oleh with a checklist + AI).
- **Pillar 3 - Angular, Nx, Debugging:** Kuba (implementation via agentic coding), Oleh (UI direction, behavior QA).
- **Pillar 4 - Fullstack (NestJS), Architecture, LLM:** Denys (lead backend/arch/LLM/quality), Kuba (co-architecture), Oleh (directing prompt/context via AI).
- **Pillar 5 - Deployment, Scale & Optimization:** Denys (lead deploy/CI-CD), Kuba (optimization), Oleh (monitoring/KPI narrative).
- **Criterion Zero (works substantively):** Oleh as continuous domain-correctness QA.
