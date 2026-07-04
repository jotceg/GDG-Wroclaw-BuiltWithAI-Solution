# TASK - decoded

> What exactly needs to be built and what the hard requirements from the task statement are.

---

## Task in one sentence

A system for an R&D department (client/investor) that takes an inventive problem, reformulates it as a technical contradiction (TRIZ), generates at least 3 solutions via TRIZ + at least 3 via a second method of choice, evaluates all candidates, selects one, and presents the full reasoning trail.

## Required system output (reasoning trail)

```
problem → contradiction → all candidates → evaluation → choice
```

## Hard requirements (verbatim from the statement)

1. **Two generation methods** - TRIZ (mandatory) + a second method of choice.
2. **Min. 3+3 candidates** - at least 3 from each method.
3. **Evaluate ALL candidates** against the original problem.
4. **Select one** with justification.
5. **Full reasoning trail** - inspectable, not "a single prompt dressed up".
6. **"Every step must run as a real, inspectable piece of logic"** - the jury wants a PIPELINE, not one mega-prompt returning a pretty JSON. Each step must be a separate, auditable piece of logic.

## Hints from the statement

- Use of LLM tools with web-search & retrieval is "very appreciated".
- Additional context from documents (e.g. SDG reports) is welcome.
- The `pytriz` package from Day 5 (MCP server for TRIZ / contradiction matrix) maps directly onto this task.

## What this means architecturally

This is NOT a chatbot. It is a **multi-step pipeline / workflow engine** where each step has a defined input and output, is inspectable (the user sees what went in and what came out), and uses the LLM as a reasoning engine but stays a separate module.

## 7 problems to choose from (each max 2 teams)

| # | Problem | SDG |
|---|---------|-----|
| 1 | Reducing volume of electronic waste | 12 |
| 2 | Treating rising volumes of urban wastewater | 6 |
| 3 | Delivering electricity to remote populations | 7 |
| 4 | Preventing oil spills in maritime transport | 14 |
| 5 | Reducing packaging pollution | 12 |
| 6 | Improving desalination | 6/7 |
| 7 | Keeping buildings hot & cold | 13/11 |

Detailed problem analysis and selection recommendation → see `03_problem_selection.md`.

## Criterion Zero (necessary condition)

The app must genuinely solve the assigned domain problem. The system must correctly and logically process the problem and return substantively sensible solutions. If it does not fulfil the core business function, the project fails verification.

**In the context of this task:** you feed in an inventive problem → the system returns a sensible technical contradiction → sensible solutions → a sensible evaluation → a sensible choice. If the reasoning trail is nonsense, the rest of the points do not count.
