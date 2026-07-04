# WCAG AA Checklist - for the hackathon final (Pillar 2: UI/UX & A11Y)

> "AA" = you must meet ALL level A criteria **and** all level AA criteria.
> WCAG 2.1 AA = 50 criteria. WCAG 2.2 AA = 55 (2.2 is the current W3C recommendation, built on 2.1).
> 4 principles = POUR: Perceivable / Operable / Understandable / Robust.
> Legend: **[YOU]** = you can check it yourself, no code · **[AUTO]** = axe/Lighthouse catches it · **[DEV]** = needs Denys / code review · ★ = jury likely checks / high priority · ⚪ = usually N/A for an MVP without media/timers.

---

## TOP PRIORITY FOR THE FINAL (start with these)
The subset that really decides points in the few minutes of evaluation:

1. ★ **Keyboard navigation** (2.1.1) - the whole app is operable with Tab/Enter/Esc alone, no mouse. **[YOU]**
2. ★ **Visible focus** (2.4.7) - you clearly see which element you're on (outline). **[YOU]**
3. ★ **Text contrast** (1.4.3) - text readable on its background (min. 4.5:1 for normal, 3:1 for large). **[AUTO/YOU]**
4. ★ **Field labels** (3.3.2, 1.3.1) - every field has a visible label saying what to enter. **[YOU]**
5. ★ **Alt text** (1.1.1) - meaningful images/icons have an alt description. **[AUTO/YOU]**
6. ★ **Not color alone** (1.4.1) - error/status carried by text/icon too, not just color. **[YOU]**
7. ★ **Error messages** (3.3.1, 3.3.3) - clear, next to the right field, with a hint how to fix. **[YOU]**
8. ★ **Headings and structure** (1.3.1, 2.4.6) - headings in a sensible order, descriptive. **[DEV/AUTO]**
9. ★ **Buttons are buttons** (4.1.2) - the element has the correct role for the screen reader (not a `div` faking a button). **[DEV/AUTO]**
10. ★ **Touch target size** (2.5.8, 2.2) - clickable elements min. 24x24px. **[YOU/AUTO]**

---

## 1. PERCEIVABLE

- **1.1.1 Non-text content** (A) ★ - every image/icon/chart has a text equivalent (alt). Decorative = empty alt. **[AUTO/YOU]**
- **1.2.1-1.2.5 Audio/video media** (A/AA) ⚪ - captions, audio description, transcripts. Usually N/A unless the MVP has video/audio. **[DEV]**
- **1.3.1 Info and relationships** (A) ★ - structure visible visually is also in the code (headings, lists, tables, label-field link). Foundational. **[DEV/AUTO]**
- **1.3.2 Meaningful sequence** (A) - reading order in code matches the visual order. **[DEV]**
- **1.3.3 Sensory characteristics** (A) - instructions don't rely on shape/position alone ("click the round button on the right"). **[YOU]**
- **1.3.4 Orientation** (AA) - works in both portrait and landscape (doesn't force one). **[YOU]**
- **1.3.5 Identify input purpose (autocomplete)** (AA) - fields like email/name have a programmatic type so the browser can autofill. **[DEV]**
- **1.4.1 Use of color** (A) ★ - color is not the only carrier of information (error = red + text/icon). **[YOU]**
- **1.4.2 Audio control** (A) ⚪ - auto-playing audio >3s can be stopped. Usually N/A. **[YOU]**
- **1.4.3 Contrast (minimum)** (AA) ★ - text 4.5:1, large text 3:1. Check with a contrast checker. **[AUTO/YOU]**
- **1.4.4 Resize text** (AA) - text scalable to 200% without loss of content/function. **[YOU]**
- **1.4.5 Images of text** (AA) - text as real text, not an image (except logos). **[YOU]**
- **1.4.10 Reflow** (AA) ★ - on zoom/narrow screen content wraps, no horizontal scroll. Test: narrow the window / zoom 400%. **[YOU]**
- **1.4.11 Non-text contrast** (AA) - field borders, icons, focus states have min. 3:1 contrast. **[AUTO/YOU]**
- **1.4.12 Text spacing** (AA) - nothing breaks when the user increases line height/spacing. **[DEV]**
- **1.4.13 Content on hover/focus** (AA) - tooltips/popovers can be dismissed, hovered, don't vanish on their own. **[YOU]**

## 2. OPERABLE

- **2.1.1 Keyboard** (A) ★★ - ALL functionality available from the keyboard. Most important test: go through the app with Tab alone. **[YOU]**
- **2.1.2 No keyboard trap** (A) ★ - focus can enter AND LEAVE every element (e.g. a modal). **[YOU]**
- **2.1.4 Character key shortcuts** (A) ⚪ - if single-key shortcuts exist, they can be turned off/remapped. Usually N/A. **[DEV]**
- **2.2.1 Timing adjustable** (A) ⚪ - time limits can be extended/turned off. N/A if no timers. **[DEV]**
- **2.2.2 Pause/stop/hide** (A) ⚪ - moving/blinking/auto-updating content can be stopped. **[YOU]**
- **2.3.1 Three flashes or below** (A) ★ - nothing flashes more than 3x/s (seizure risk). **[YOU]**
- **2.4.1 Bypass blocks** (A) - "skip to content" / landmarks to skip repeated navigation. **[DEV]**
- **2.4.2 Page titled** (A) ★ - every page/view has a descriptive title. **[YOU/AUTO]**
- **2.4.3 Focus order** (A) ★ - Tab moves through elements in a logical order. **[YOU]**
- **2.4.4 Link purpose (in context)** (A) - the link text tells you where it leads (not just "click here"). **[YOU]**
- **2.4.5 Multiple ways** (AA) - more than one way to find a page (menu + search). Often N/A for a small MVP. **[YOU]**
- **2.4.6 Headings and labels** (AA) ★ - headings and labels are descriptive and sensible. **[YOU]**
- **2.4.7 Focus visible** (AA) ★★ - you always see where focus is. Don't remove the default outline without a better replacement. **[YOU]**
- **2.4.11 Focus not obscured** (AA, 2.2) - the focused element is not hidden by a sticky header/footer. **[YOU]**
- **2.5.1 Pointer gestures** (A) - features using complex gestures have a simple alternative. Usually N/A on desktop. **[YOU]**
- **2.5.2 Pointer cancellation** (A) - the action fires on release, not press (can be cancelled by dragging away). **[DEV]**
- **2.5.3 Label in name** (A) ★ - a button's visible label matches its name for the screen reader. **[DEV/AUTO]**
- **2.5.4 Motion actuation** (A) ⚪ - shake/tilt features have an alternative. Usually N/A. **[DEV]**
- **2.5.7 Dragging movements** (AA, 2.2) - anything done via drag&drop can also be done with a single click. **[YOU]**
- **2.5.8 Target size (minimum)** (AA, 2.2) ★ - clickable elements min. 24x24px (or with spacing). **[YOU/AUTO]**

## 3. UNDERSTANDABLE

- **3.1.1 Language of page** (A) ★ - `lang` set (e.g. `lang="pl"`) so the screen reader uses correct pronunciation. **[DEV/AUTO]**
- **3.1.2 Language of parts** (AA) - fragments in another language are marked up. **[DEV]**
- **3.2.1 On focus** (A) - merely focusing doesn't trigger a sudden change (e.g. a reload). **[YOU]**
- **3.2.2 On input** (A) - changing a field's value doesn't cause surprises without warning. **[YOU]**
- **3.2.3 Consistent navigation** (AA) ★ - navigation looks and works the same on every screen. **[YOU]**
- **3.2.4 Consistent identification** (AA) - the same elements are named the same everywhere. **[YOU]**
- **3.2.6 Consistent help** (A, 2.2) - if there's help/contact, it's in the same place on every screen. **[YOU]**
- **3.3.1 Error identification** (A) ★ - the error is clearly indicated in text (not just a red border). **[YOU]**
- **3.3.2 Labels or instructions** (A) ★★ - every field has a label/instruction on what to enter. **[YOU]**
- **3.3.3 Error suggestion** (AA) ★ - the message says HOW to fix it ("email must contain @"). **[YOU]**
- **3.3.4 Error prevention (legal/financial/data)** (AA) - on important actions: confirm/undo/verify. **[DEV]**
- **3.3.7 Redundant entry** (A, 2.2) - don't make the user re-enter what they already provided. **[DEV]**
- **3.3.8 Accessible authentication (minimum)** (AA, 2.2) - login doesn't require a memory test/puzzle without an alternative. Usually N/A for an MVP without login. **[DEV]**

## 4. ROBUST

- **4.1.2 Name, role, value** (A) ★★ - every UI component exposes the correct role, name and state to assistive tech (button=button, checkbox with checked state, etc.). Critical when AI generates div-soup. **[DEV/AUTO]**
- **4.1.3 Status messages** (AA) - messages like "saved"/"5 results found" are announced to the screen reader without moving focus. **[DEV]**
- (4.1.1 Parsing - REMOVED in WCAG 2.2, skipped.)

---

## How to handle this in 10h (no code, directing AI)
1. **Put A11Y requirements into the design system / component prompt IMMEDIATELY** (semantic HTML, labels, roles, contrast, focus visible). Retrofit is expensive - an accessible component base handles most ★ automatically.
2. **Automation at the start:** axe DevTools / Lighthouse in Chrome (ties in with Day 3 / Chrome DevTools MCP) - catches contrast, missing alt, missing labels, roles.
3. **Your manual pass before the pitch:** Tab through the whole app + zoom 200-400% + check that form errors have text and a hint.
4. **Denys** handles what needs code: roles/names (4.1.2), heading structure, `lang`, status messages.
