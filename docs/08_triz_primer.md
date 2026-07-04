# TRIZ - minimum for the PM

> What you need to know to understand what the team is doing, make scope decisions, and pitch the jury.
> You don't need to know the 39 parameters - you need to understand the logic and be able to sell it.

---

## What TRIZ is (30 seconds)

Theory of Inventive Problem Solving (Russian: ТРИЗ). Premise: "Your problem has already been solved in another domain." Altshuller analyzed 200,000 patents and found that most inventions resolve contradictions using 40 recurring principles.

## Technical contradiction (key concept)

"I want to improve X, but Y gets worse."

Examples:
- "I want a lighter car (weight ↓), but it loses strength (strength ↓)"
- "I want a faster process (speed ↑), but complexity rises (complexity ↑)"
- Problem 7 (buildings): "I want insulation in winter (heat retained), but in summer the same walls trap heat (heat should be released)"

## Contradiction matrix (39×39)

- 39 engineering parameters: weight, speed, strength, temperature, reliability, device complexity, energy use...
- Row = parameter to improve (improving)
- Column = parameter that worsens (worsening)
- At the intersection: 1-4 numbers of the 40 inventive principles that historically resolved that contradiction

**Analogy:** the matrix is a "navigation map" - it doesn't give a finished solution, but it points to directions (principles) that worked for other inventors in a similar situation.

## 40 inventive principles (selected examples)

| # | Principle | What it does | Example |
|---|-----------|--------------|---------|
| 1 | Segmentation | Split into independent parts | Modular phone instead of a monolith |
| 2 | Extraction | Separate out the interfering element | Engine outside the aircraft fuselage |
| 13 | Inversion | Do the opposite | Treadmill instead of running outside |
| 15 | Dynamization | Let elements change with conditions | Adaptive shock absorber |
| 25 | Self-service | The system repairs/maintains itself | Self-cleaning glass |
| 28 | Mechanics substitution | Replace a mechanical system with another | Magnetic field instead of a clamp |
| 35 | Parameter change | Change state/density/flexibility | Foam instead of solid metal |

## How it works in OUR system

```
1. User types in an inventive problem
2. LLM analyzes: "what do we want to improve?" → improving parameter (e.g. #9 Speed)
                 "what gets worse?"            → worsening parameter (e.g. #36 Device complexity)
3. pytriz MCP looks up the matrix → returns principles e.g. #10, #13, #28, #38
4. LLM takes the principles and generates concrete solutions for this problem
```

## Why it plays well for Innovation (25 pts)

TRIZ is not "the AI made something up at random". It's a systematic, data-based framework (200k patents). The jury (client/investor) sees:
- **Methodology**, not a magic box
- **Cross-domain innovation** - the system looks for solutions in domains an engineer wouldn't check
- **Repeatability** - it works on any inventive problem

This is exactly "approaching the problem in an unconventional way" from the Innovation criterion.

## The second method - 5 Whys (LOCKED)

The task requires two generation methods. TRIZ is mandatory and will be everywhere (14 teams).
Our second method is **5 Whys** - the classic root-cause analysis technique, turned into a
generation method: drill from the symptom down to the root cause(s), then generate ≥3
**countermeasures** that address the root cause. Those countermeasures are the candidate solutions.

### Why 5 Whys pairs well with TRIZ
- **Different axis of thinking.** TRIZ abstracts the problem into a contradiction and imports
  solutions from other domains. 5 Whys stays inside the problem and drills causally downward.
  Engineering (TRIZ) vs investigative (5 Whys) - two genuinely different lenses on the same problem.
- **Human-in-the-loop.** The engineer answers each "Why?"; the model **facilitates** (asks,
  presses for evidence) but does NOT invent the answers - that would produce a plausible-but-false
  causal chain and break both the method and the task's "not a single prompt dressed up" rule.
- **Guardrails baked in.** Off-topic / abuse (e.g. "what's the weather") is refused. If the
  engineer is stuck, the model may - only on explicit opt-in - offer web-search-grounded
  hypotheses "to verify"; the engineer confirms or rejects, and unconfirmed items are marked
  as assumptions, never facts.

> Trade-off to know: 5 Whys is a weaker "wow" hook than a nature/Biomimicry angle. The Innovation
> story is now the **human + AI root-cause collaboration** and the transparent, guardrailed
> pipeline, not a termite metaphor.

## What you do NOT need to know

- The exact list of 39 parameters - the pytriz MCP server knows that
- How to read the matrix by hand - the system does it
- The difference between a technical and a physical contradiction - in 10h we only do technical
- ARIZ, Su-Field, Trends of Evolution - advanced TRIZ tools, out of scope

## What you must be able to say in the pitch

"Our system uses TRIZ - a methodology based on the analysis of 200 thousand patents. It identifies the technical contradiction in a problem, then systematically searches for solutions that worked on similar contradictions in other fields. We complement it with a guided 5 Whys analysis - the engineer and the AI drill to the root cause together, and the system turns each root cause into concrete countermeasures. Every step is transparent - the client sees where each recommendation came from."

> Second method is locked to **5 Whys**. If it changes again, the agent must update this file's "second method" section together with `01_task.md`, `03_problem_selection.md`, `04_architecture.md`, and `06_pitch.md`.
