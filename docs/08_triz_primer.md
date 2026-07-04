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

## The second method - why and which

The task requires two methods. TRIZ is mandatory and will be everywhere (14 teams). You differentiate with the second method.

### Biomimicry (recommended for Problem 7 / 6 / 3)
"How did nature solve this problem?"
- LLM + web search finds biological analogies
- Pitch gold: "Termites have kept a constant temperature in their mound for millions of years without AC"
- Strong for Innovation (non-obvious source of solutions)

### SCAMPER (universal, recommended for Problem 1 / 4 / 5)
7 creative operators: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.
- The LLM systematically walks through each operator
- Fast, explains well in the pitch
- Contrasts with analytical TRIZ (creative vs engineering)

## What you do NOT need to know

- The exact list of 39 parameters - the pytriz MCP server knows that
- How to read the matrix by hand - the system does it
- The difference between a technical and a physical contradiction - in 10h we only do technical
- ARIZ, Su-Field, Trends of Evolution - advanced TRIZ tools, out of scope

## What you must be able to say in the pitch

"Our system uses TRIZ - a methodology based on the analysis of 200 thousand patents. It identifies the technical contradiction in a problem, then systematically searches for solutions that worked on similar contradictions in other fields. We complement it with [Biomimicry/SCAMPER] to have both an engineering and a creative approach. Every step is transparent - the client sees where each recommendation came from."

> When the second method is locked, the agent must update this file's "second method" section together with `01_task.md`, `03_problem_selection.md`, `04_architecture.md`, and `06_pitch.md`.
