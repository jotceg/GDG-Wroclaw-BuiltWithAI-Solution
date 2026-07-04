# PITCH - 5-minute structure

> 25 pts jury + influence on 25 pts audience = 50 pts riding on these 5 minutes.
> Oleh = main speaker. Demo case = Problem 7 (Buildings).

---

## Conditions (hard)

- **5 minutes**, hard timer, cut off mid-sentence.
- **No Q&A** - no chance to explain after time.
- **English slides** (suggested - one English-speaking juror).
- You may speak Polish.
- Presentation order known from the morning - aim for slot 3-5.
- Slides recommended, not mandatory.

---

## Structure (front-load the most important)

### 0:00-0:30 - HOOK
One sentence that makes the jury want to keep listening.

> "Company X loses Y weeks analyzing inventive problems. Our system does it in minutes - and produces solutions people wouldn't find themselves, because it searches domains an engineer would never check."

### 0:30-1:30 - PROBLEM + PERSONA
- Who the user is: an R&D manager at a manufacturing company.
- Their problem: a technical inventive problem, no systematic process, reliance on the team's intuition and experience.
- What it costs: time, money, limited solutions (tunnel vision).
- Why now / why AI: TRIZ has existed since the 1940s but needs an expert. LLM + contradiction matrix = democratizing TRIZ.

### 1:30-3:00 - DEMO (recorded as backup!)
Show the full trail on a concrete SDG problem (Buildings for the demo):
1. I type in the problem → the system analyzes it
2. I see the technical contradiction (param A vs param B)
3. I see 3 TRIZ solutions (with principle names) + 3 Biomimicry/SCAMPER
4. I see the evaluation matrix (scoring per criterion)
5. I see the recommendation with a full justification

**Key:** show that each step is inspectable. Click the contradiction - see where it comes from. Click a solution - see which TRIZ principle and why.

### 3:00-3:45 - HOW IT WORKS (1 architecture slide)
- 5-step pipeline (diagram)
- Angular + NestJS + Nx + pytriz MCP server + LLM + web search
- "This is not a single prompt dressed up - it is a real pipeline with 7 endpoints and persisted data"
- Name the workshop technologies (signal that "we applied what you taught")

### 3:45-4:15 - IMPACT / METRICS (from the Day 4 report)
- Time: from X weeks of brainstorming to Y minutes
- Coverage: the system finds solutions from domains the R&D team wouldn't check itself (cross-domain innovation)
- Quality: Z% of candidates realistically address the contradiction (vs baseline)
- Not "accuracy" as the main metric - justify why (Day 1 materials: "not accuracy")

### 4:15-4:30 - VISION / ASK
- "This isn't a tool for one problem. It's a platform that can take any technical contradiction..."
- Next steps: more generation methods, integration with patent databases, feedback loop
- You are pitching a CLIENT and an INVESTOR - close with potential

---

## Rules

- **Rehearse to 4:30**, not 5:00 (buffer for nerves and mistakes).
- **Two audiences at once:** jury (client/investor - business case matters) and the room (audience vote - "wow" and clarity matter).
- **Live demo is risky** on an unknown network. Record a backup video with narration. If live works - use live. If not - switch to video without apologizing.
- **Don't apologize for unfinished things.** Completeness = 5 pts. Talk about what works and why it's valuable.
- **Name the workshop stack** (Angular, NestJS, Nx, MCP, pytriz) - the jury scores "alignment with what was taught".
