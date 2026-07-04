# Volt Design System

**Volt** is the design system for an AI-powered inventive-problem-solving tool: it takes an assigned problem, reformulates it as a TRIZ technical contradiction, generates candidates via two independent methods, evaluates them, and presents the full reasoning trail — *Problem → Contradiction → Candidates → Evaluation → Choice*. The UI's #1 job is to make that inspectability **visible and trustworthy**.

Companion file: `volt-design-tokens.json` — the machine-readable token sheet this document describes. Tokens map 1:1 to Angular Material 3 roles (`--mat-sys-*`, see each token's `role` field).

---

## 1. Brand overview

### Identity
- **Name:** Volt — energy, the spark of invention, and the jump between contradiction and resolution.
- **Voice:** confident, precise, a little warm. Never mystical about AI — every claim is backed by an inspectable step.
- **The reasoning core:** the central brand element. A pulsing radial glow in primary indigo that appears (a) behind the running pipeline stage, (b) as the ambient hero background, (c) as Volt-the-mascot's chest core. One concept, three scales — when the pipeline thinks, everything that carries the core pulses on the same 1.8s clock.
- **Two-color identity:** electric indigo (`--color-primary`) = reasoning/intelligence; a fresh mint-green (`--color-mascot-accent`) is Volt's signature — it lives on the mascot (eyes, joints, sparkles) and on the "Download all (.zip)" export CTA. The chartreuse `--color-accent-fill` is reserved for signal moments (pipeline pulse, "focused" pip); it never appears as body text on light surfaces (use `--color-secondary #5E6B00` there).

### Wordmark
`VOLT` set in Space Grotesk 700, letter-spacing 0.14em, with the mini mascot head to the left. The mini head + wordmark also serves as the "home" button in the nav.

---

## 2. Color usage guide

All values, roles, and verified ratios live in `volt-design-tokens.json`. Rules of use:

### Surfaces & elevation
- Light mode: elevation = **soft box-shadows** on `--color-surface-1..3`.
- Dark mode: elevation = **lightness steps** (`#0C0B12 → #16141F → #1E1B29 → #282435`), no shadow halos.

### Primary (indigo)
- `--color-primary-fill` + `--color-on-primary-fill`: filled buttons, TRIZ badges, selected states.
- `--color-primary` (text variant): links, active nav, inline emphasis. In dark mode these are *different values* (`#6D50FF` fill vs `#B0A2FF` text).
- `--color-primary-container` / `--color-on-primary-container`: Method-2 badges, principle chips, icon wells.

### TRIZ vs Method-2 — unified style, tonal step
Both badges are **filled, same shape (8px radius), same size, same icon slot**. They differ by one tonal step within the indigo family — never by contrasting hues:
- **TRIZ:** `--color-primary-fill` background, white text, contradiction icon.
- **Method 2:** `--color-primary-container` background, `--color-on-primary-container` text, branch icon.
Method provenance is metadata; badges must read as one family. Color is never the sole differentiator — icon + label + tonal step.

### Semantic colors
- `--color-success` — completed states, the winner marker (always trophy icon + "WINNER" text, never color alone).
- `--color-warning` — caution only. Text (`#946200` light / `#FFC53D` dark) for inline text; fill (`#FFC53D`) + `--color-on-warning` for chips/banners.
- `--color-error` — destructive actions, validation errors (icon + correction hint).
- `--color-info` — neutral notices.
- Warning ≠ error ≠ success is guaranteed by three independent channels: hue (amber / red / green), icon shape, and label text.

### Score palette (evaluation matrix)
A single, semantically consistent 5-step gradient across both modes: **red → orange → slate → mint → green** (low = needs attention, high = strong). Every score maps to `--color-score-1..5` with **AA+ on all surfaces in both modes** (see `volt-design-tokens.json`). Cells combine the color with the mono number and a meter bar — three channels of the same information.

### Do / Don't
- ✅ Reference every color via token; ❌ never a raw hex in component code.
- ✅ `--color-border` decorative hairlines; ✅ `--color-border-interactive` (≥3:1) enclosing controls.
- ❌ No lime text on light surfaces (use `#5E6B00`). ❌ No new grays. ❌ Never differentiate concepts by two opposing colors when a tonal step + icon + label works (see TRIZ vs Method-2).
- **Disabled text** (`--color-text-disabled`): deliberately muted but clearly legible (~4.4–5.2:1 in dark, ~4.4:1 in light). Pair with `cursor: not-allowed` and `aria-disabled`.

---

## 3. Typography

| Role (M3) | Family | Size/Line | Weight | Use |
|---|---|---|---|---|
| display-large | Space Grotesk | 57/64 | 700 | Landing hero only |
| display-small | Space Grotesk | 36/44 | 700 | Page titles |
| headline-large | Space Grotesk | 32/40 | 600 | Report section heads |
| headline-small | Space Grotesk | 24/32 | 600 | Card group titles |
| title-large | Space Grotesk | 20/28 | 600 | Card titles |
| title-medium | Space Grotesk | 16/24 | 600 | Component headers |
| body-large | IBM Plex Sans | 16/26 | 400 | Long-form reading (report) |
| body-medium | IBM Plex Sans | 14/22 | 400 | UI copy |
| label-large | IBM Plex Sans | 14/20 | 600 | Buttons, form labels |
| label-medium | IBM Plex Sans | 12/16 | 600 | Chips, badges, eyebrows |
| mono-data | IBM Plex Mono | 13/20 | 500 | TRIZ params, scores, raw traces, step I/O |

Minimum size anywhere: **12px**. Spacing on an **8px grid** (4px allowed for icon-text gaps). Mono is a trust signal: anything that is *data from the pipeline* is mono; anything editorial is sans.

---

## 4. Component catalog

Each component ships in both modes with states: default / hover / focus-visible / active / disabled / loading / error.

### 4.1 Pipeline Stepper (5 stages)
**Problem → Parallel Analysis → Merged Candidates → Evaluation → Selected Solution.** TRIZ and 5 Whys are NOT sequential steps — they run simultaneously inside stage 2, mirroring the BPMN gateway split. The workspace is a lean process cockpit; full artifact content renders only in the Final Report.
- Stage card: pixel-stage icon well, `STEP 0n` mono label, stage name (`--color-on-surface`), status line (icon + text).
- **States:** completed (primary dot + check + "Completed"), running (lime dot, pulsing halo, "Reasoning…"), current/focused (primary border + "Focused"), pending (muted dot, "Pending").
- Clicking a stage shows that stage's view in the workspace center.
- **Reasoning pulse** glow migrates 400ms behind the active stage.
- **A11y:** container `role="list"` labelled "Reasoning pipeline"; each stage is a real `<button role="listitem">` with `aria-current="step"` on the focused stage.

### 4.1b Parallel Analysis cockpit (workspace stage 2)
Two columns running side by side:
- **Left — 5 Whys (interactive):** header with "Why n of 5" progress, 5 numbered timeline chips (check = answered, active = current, dimmed = future; click an answered chip to edit — v1 editing updates in place, toast "Answer updated."), question card with textarea + Continue, Volt reacting beside the timeline (idle → thinking → aha). Special states: on-topic gate (inline "Let's stay on the problem", round not consumed), "I'm stuck — suggest hypotheses" (2–3 grounded hypotheses, confirm/reject), root-cause-reached badge + "Generating ≥3 candidates from root cause…" → "5 candidates generated ✓".
- **Right — TRIZ (automatic):** three visible sub-stages (Formulating contradiction → Applying contradiction matrix 39×39/pytriz → Instantiating principles with live n/5 counter), each with a pulsing reasoning-core dot while active, check + toast on completion, "TRIZ COMPLETE ✓" badge at ≥3 candidates. **Process only** — generated content renders exclusively in the Final Report.
- **Join gate footer:** both branches must deliver ≥3 candidates; shows "Waiting for [branch] to complete…" if one finishes first; when passed → "Continue to Merged Candidates" (stage-reveal motion).

### 4.2 Contradiction Card *(renders in the Final Report, TRIZ-trail section)*
Improving vs worsening parameter panels, TRIZ parameter numbers in mono, matrix-output inventive principles as `primary-container` chips. Direction carried by arrow icon + word, not color alone.

### 4.3 Candidate Solution Card *(renders in the Final Report branch sections)*
Unified 8-radius badge (see TRIZ vs Method-2 rule) + optional WINNER marker (trophy + text, success color), title, summary, expandable **"Reasoning trace"** disclosure with a **"Copy raw output"** button inside — for R&D managers who want the raw trace.
- **A11y:** `<button aria-expanded>` disclosure; trace is `<pre>` in mono (selectable, `cursor: text`).
- The report also shows a compact **merged-pool list** (badge + title + winner marker + total score) after the two branch sections.

### 4.3b Final Report structure
1. Problem statement · 2. TRIZ trail (contradiction → matrix output → 3 candidates) · 3. 5 Whys trail (all Q&A as timeline → highlighted root cause → 3 candidates) · 4. Merged pool · 5. Evaluation matrix · 6. Selected solution hero · 7. Export (PDF / JSON / MD / ZIP). Premium document tone; raw traces stay one click away.

### 4.4 Evaluation Matrix Table
Real `<table>` with `<caption>`, `<th scope="col">` criteria and `<th scope="row">` candidates. Each cell: bold mono score in the score-N color + a meter bar in the same color. Winner row: tinted bg **plus** trophy + "WINNER" text + bold total in `--color-success`.

### 4.5 Selected Solution Card (workspace)
Full-width **`<button>`** — the entire card is a real link into the Final Report anchored at the winner. Clear affordance (`cursor: pointer`, hover ring in success color, "Open in report →" affordance on the right). A nested inspect action uses a `role="button" span` with `event.stopPropagation` so the card link and the inspect action don't fight.

### 4.6 Inspector Drawer
Right-side `role="dialog" aria-modal="true"` labelled "Step inspector". Body: INPUT and OUTPUT `<pre>` blocks in mono (selectable) + **Copy** button (state flips to "Copied" ~1.6s, icon swaps to check).

### 4.7 Problem Input Form
Visible labels above every field, required marked with * (and `aria-required`). Inline errors: `--color-error` text + alert icon + **correction hint** tied via `aria-describedby`. Live char counter. **SDG chips** are toggle buttons with a small pixel-style SVG icon (climate / cities / energy / industry) + "SDG N · Name" label + check icon when pressed — never dependent on colour alone. Empty-state aside: Volt idle at 6.4× scale with a bobbing animation.

### 4.8 Export Section (Final Report)
Four export buttons in a `role="group" aria-label="Export formats"` grid:
- **PDF** (primary indigo, opens a print-styled window that auto-invokes the print dialog).
- **JSON** (outlined, structured reasoning trail — problem, contradiction, every candidate with reasoning trace, evaluation with totals, choice).
- **Markdown** (outlined, human-readable with tables).
- **Download all (.zip)** (outlined with `--color-mascot-accent` border, bundles all three plus a README — built in-browser with a stored-only ZIP encoder, no external libs).
- **A11y:** every option is a real `<button>` with a bold label + short subtitle; a toast confirms each download via the `aria-live="polite"` region.

### 4.9 Buttons
- **Primary:** `primary-fill` bg, white text, 44–52px height, radius 11–13px. Magnetic hover + lime spark cursor **only on landing hero CTA and form submit** (other primary buttons stay stable — magnetic drift on secondary controls felt broken and was removed).
- **Secondary:** transparent, 1.5px `border-interactive` border.
- **Ghost:** transparent, primary text.
- **Destructive:** `--color-error` bg, white text.
- **Disabled:** `surface-2` bg, `text-disabled` text, dashed border, `cursor: not-allowed`, `aria-disabled`.
- **Grouped:** the workspace "Simulate run / View report" pair sits inside a single 6px-padded pill container with a hairline divider between them — one visual group, consistent 44px height, no drift.

### 4.10 Chips, badges, toasts, skeletons, nav
- Chips: pill, `label-medium`; interactive chips are `<button aria-pressed>` (SDG chips carry a pixel-glyph icon).
- Toast/status: fixed bottom-center, `aria-live="polite" aria-atomic="true"` region always present; success icon + text; auto-dismiss ~3.2s.
- Skeletons: shimmer bars (1.3s linear), paired with a Volt-working sprite.
- Nav bar: sticky, backdrop-blur surface at 82% opacity; active item = primary underline + `aria-current="page"`. All top-bar controls are exactly 44px tall.

### 4.11 Light/Dark toggle
Circular 44px button, top-right of the nav. Custom **sun ⇄ moon geometry morph** (140ms ease) — a mask circle slides in to carve the moon crescent and rays fade/scale in for the sun. On toggle, the whole UI cross-fades color-by-color at **180ms** (about 3× snappier than the original spec). All motion cut under `prefers-reduced-motion`.

---

## 5. Signature animations

### Animation 1 — "Reasoning pulse"
Radial gradient glow (`rgba(glow, .28–.5) → transparent 70%`) behind the active pipeline stage.
- Pulse: **1.8s ease-in-out infinite**, opacity .45→.9, scale 1→1.14 (strong variant 1.22).
- Migration: glow `left` transitions **400ms ease** to the next stage on completion.
- Reused at hero scale (ambient, blurred 6px) and inside Volt's chest core (opacity blink variant, same 1.8s clock).

### Animation 2 — "Stage reveal"
Content sections enter with fade-up: **translateY(24px) → 0, opacity 0 → 1, 600ms** on landing sections (300ms elsewhere), easing `cubic-bezier(.16,.8,.3,1)`, children staggered **50ms** (`data-d="1..3"` delay steps).

Both: disabled under `prefers-reduced-motion: reduce`.

### Micro-interactions
- **Volt bob:** every mascot has a `[data-volt]` bob (2.6s ease-in-out infinite, ±2px). Hover accelerates to 1.2s.
- **Theme toggle morph + UI cross-fade:** 140ms / 180ms.
- **Magnetic CTAs:** hero + form submit only — drift ≤5px toward cursor.

---

## 6. Mascot guide — Volt

A compact **pixel-art robot** on a 16×16 grid (SVG rects, `shape-rendering: crispEdges`). Curious, clever, "solves contradictions."

### Palette
Every color routes through a token so Volt works in both modes automatically. Key tokens: `--color-on-surface` (silhouette), `--color-on-surface-variant` (body), `--color-border-interactive` (body shading), `--color-mascot-face` (contrasty face plate — light lavender in light mode, deep purple in dark), `--color-mascot-accent` (**bright mint green** — eyes, joints, sparkles), `--color-primary-fill` (chest core, pulses), `--color-warning-fill` (antenna tip amber). Face features get a dedicated inset plate specifically so eyes and expression stay crisp at small sizes in both modes.

### Expressions
| Expression | Cue | Where |
|---|---|---|
| **Idle / greeting** | wave arm, soft smile, core pulsing, bobbing | Landing hero, form empty state, export section |
| **Thinking** | eyes up, blue thought pixels, core pulsing | Pipeline running (workspace header) |
| **Aha!** | green sparks around head, wide smile | Solution chosen — swaps in automatically when pipeline settles |
| **Confused** | bent antenna, uneven eyes | Errors — friendly, never alarming |
| **Working** | focused eyes, progress pixels below | Loading, long ops |

### Placement / sizing
- Mini head (~6×9 grid) in the nav lockup and footer.
- 4× scale next to workspace header (auto-swaps thinking ↔ aha with `state.running`).
- 4.6× on landing hero, 6.4× on form empty state — Volt is a brand asset, sized so it lands.
- Foundations page shows all 5 expressions at 4.4× scale plus 5 matching pixel stage illustrations.

### A11y
Meaningful instances carry `role="img"` + descriptive `aria-label` ("Volt thinking — pipeline running"). Decorative repeats are `aria-hidden="true"`. Bob animation dies under `prefers-reduced-motion`.

---

## 7. Accessibility summary

**Compliance statement:** WCAG 2.2 — AAA targeted, AA hard floor, verified in **both** modes on **every** surface level (base + 3 elevations), not just the base background. Full per-token ratios in `volt-design-tokens.json`.

- **Text:** dark mode is AAA nearly everywhere. Light mode: neutrals AAA; brand/semantic text AA (4.6–8.8:1); score-2 (deep orange) and score-4 (mid-green) documented as ≥4.02:1 (AA large / non-text; the mono numeral is bold and paired with a colored meter bar for redundancy).
- **Score palette re-verification:** every score AA+ on `surface-1/2/3` in both modes. Score-2 is a clean deep orange (`#B65114` light / `#FFAE5A` dark) — no brown; score-3 is a neutral slate identical in perception across modes.
- **Stepper text:** stage names use `--color-on-surface` explicitly and the stepper cards no longer color-mix the background, so text passes AAA on all cards in both modes.
- **Non-text:** interactive borders, icons, focus ring all ≥3:1 on every surface.
- **Focus:** 3px solid `--color-focus` outline, 2px offset — never removed.
- **Targets:** ≥24px everywhere; primary actions and close buttons ≥44px; the Step-5 jump arrow is 34px inside its card (its parent card is the primary hit target at ≥112px min-height).
- **Structure:** semantic HTML throughout, one `h1` per page, logical heading ladder, `aria-current` for nav/stepper, `aria-expanded` disclosures, `aria-pressed` toggle chips, `aria-live` toast region, `aria-describedby` error binding.
- **Color never sole carrier:** winner = trophy + "WINNER" text; stage status = icon + word; method = tonal step + icon + label; scores = number + color + bar; SDG chips = icon + label + checkmark.
- **Disabled text** (`--color-text-disabled`): WCAG-exempt but held at ~4.4–5.2:1 in dark (`#8B86A3`), ~4.4:1 in light (`#7A7689`) so it reads "present but inactive."

## 8. Motion & prefers-reduced-motion policy

- Micro-interactions 150–220ms ease-out; reveals 300–600ms; theme cross-fade 180ms; loops only for the reasoning pulse (1.8s, low amplitude) and Volt's bob (2.6s, ±2px).
- One global gate: `@media (prefers-reduced-motion: reduce)` sets `animation: none` and `transition: none` on everything and forces reveal content visible. The magnetic-cursor handler checks the same media query in JS.
- No parallax, no autoplaying video, no flashing above 3 Hz, no motion that carries information not also carried by text.
