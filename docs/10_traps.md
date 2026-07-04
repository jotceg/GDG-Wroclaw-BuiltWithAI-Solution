# TRAPS - what costs points if you forget

> "Before the pitch" checklist - go through each item and confirm you addressed it.

---

## Critical (direct point loss)

1. **"Single prompt dressed up"** - the jury EXPLICITLY says it doesn't want this. Every pipeline step must be separate logic with its own input/output. If all the logic sits in one prompt with a cosmetic split - 0 pts for Criterion Zero.

2. **Missing Day 4 report** - this is a SEPARATE artifact (a document), not part of the app. It must cover: input scenarios → evaluation → metrics. Plan it from the first hour, don't bolt it on at 17:00.

3. **Forgotten "rate all teams"** - a required post-pitch action. Form ~19:30. At least 1 team member must rate ALL teams. Owner: Oleh.

4. **Deploy left to 17:00** - deploy a skeleton at 16:00, iterate. Deploy at the end = a classic way to lose 20 pts (Pillar 5) + risk losing Criterion Zero (app doesn't work publicly).

5. **Missing one of the 6 form links** - each miss = up to 20 pts lost. See `07_checklist.md`.

6. **No confirmation with Dawid Perdek** - he's in your room (204D). No excuse.

## Serious (lower the score)

7. **Missing "Figma design" link** - the form requires it explicitly. Resolve with Dawid in the morning: is a Claude Design link OK? If not - html.to.design as a fallback.

8. **No web-search in the pipeline** - the task says "use of available LLM tools, including web-search & retrieval is very appreciated". Add it as an LLM tool - a cheap point in Innovation and LLM Engineering.

9. **Over-investing UI at the expense of the pipeline** - a working ugly pipeline with sensible output > a beautiful frontend with no logic. Criterion Zero > Design (10 pts).

10. **No semantic HTML** - "div soup" (a screen built from bare divs) costs points in Pillar 2 (A11Y). Minimum: `<button>`, `<input>`, `<label>`, `<h1>`-`<h6>`, `<nav>`. Not `<div onclick>`.

11. **Day 4 test scenarios not defined at the start** - if you define scenarios at 16:00, you have no time to run them and collect metrics. Define 5-8 scenarios in the first hour.

## Tactical (easy to fix, easy to forget)

12. **No `lang="pl"` on `<html>`** - costs nothing, the screen reader reads Polish correctly. Checked by axe/Lighthouse.

13. **No README with run instructions** - required explicitly in Pillar 3. "Link to the repository with working code and instructions on how to run it."

14. **No team composition diagram** - an element required to be allowed to pitch. "Ideally in ng-diagram form, but not a hard requirement."

15. **Not naming the stack in the pitch** - the jury scores "alignment with the workshops". Say "Angular, NestJS, Nx, MCP server with pytriz" - a cheap signal.

16. **Pitch longer than 4:30** - rehearse to 4:30, not 5:00. They cut you off mid-sentence. Buffer for nerves.
