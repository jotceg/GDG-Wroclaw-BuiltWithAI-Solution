# PROBLEM SELECTION - analysis of 7 options

> **⚠️ SECOND METHOD IS LOCKED to 5 Whys for ALL problems** (root-cause → countermeasures, run in
> parallel with TRIZ). It is method-agnostic to the problem, so the per-problem "second method"
> suggestions below (Biomimicry / SCAMPER) are **historical** from the pre-lock analysis and no
> longer drive the decision. Kept only as a record of the problem-selection reasoning. See
> `08_triz_primer.md` and `04_architecture.md` for the current method design.

> Kakapos = first pick (of 14 teams). Each problem can be taken by max 2 teams.
> Decision at 8:00 - Oleh leads. Problem choice no longer determines the second method (it is 5 Whys).
> Note: the app must work with ALL 7 problems (generic pipeline), but the demo and pitch focus on Problem 7.

---

## Selection filter (in priority order)

1. **Do I see a clear innovation twist?** (Innovation = 25 pts, highest weight among outcome criteria)
2. **Is the MVP feasible in 9h with our stack?** (parallel two-method pipeline + UI + deploy)
3. **Can we show a measurable effect?** (Day 4 report: scenarios → metrics)
4. **Does it sell well in a 5-min pitch?** (understandable, emotional, visual)

---

## Assessment of the 7 problems

### Problem 1: E-waste recovery (SDG 12)
**Contradiction:** devices designed to be cheap/compact/fast to produce vs material recovery requires easy disassembly and separation.
- Innovation potential: medium - well-known topic
- Pitch appeal: good - everyone has an old phone
- MVP risk: low
- TRIZ contradiction: clean (ease of production vs ease of recycling)
- Best second method: SCAMPER

### Problem 2: Urban wastewater (SDG 6)
**Contradiction:** we want to treat more wastewater (volume) vs we want to keep the treatment quality.
- Innovation potential: medium
- Pitch appeal: weaker - abstract, hard to visualize
- MVP risk: medium - technical
- TRIZ contradiction: clean (volume vs quality)
- Best second method: SCAMPER

### Problem 3: Electricity for remote areas (SDG 7)
**Contradiction:** fast deployment (solar/battery) vs reliability and capacity (grid). Organizers' hint: "batteries are NOT a solution" = explicit contradiction.
- Innovation potential: **high** - "no batteries" forces creativity
- Pitch appeal: good - emotional, healthcare/education angle
- MVP risk: medium
- TRIZ contradiction: clean (deployment speed vs reliability)
- Best second method: Biomimicry (how nature stores/transports energy)

### Problem 4: Oil spills in maritime (SDG 14)
**Contradiction:** large tankers = economical but catastrophic on failure. "Keep transport as-is but protect marine life."
- Innovation potential: medium-high
- Pitch appeal: **very good** - visual, emotional (oil + dolphins)
- MVP risk: low - simple to formulate
- TRIZ contradiction: clean (transport volume vs spill risk)
- Best second method: Biomimicry (how marine organisms handle contamination) or SCAMPER

### Problem 5: Packaging pollution (SDG 12)
**Contradiction:** packaging must protect the product (tough, moisture-resistant) vs must disappear after use (biodegradable, easy to recycle).
- Innovation potential: medium - many existing solutions, harder to surprise
- Pitch appeal: good - everyday
- MVP risk: low
- TRIZ contradiction: clean (durability vs biodegradability)
- Best second method: SCAMPER

### Problem 6: Desalination (SDG 6/7)
**Contradiction:** we want more fresh water vs energy use and equipment strain rise proportionally.
- Innovation potential: **high** - "drink the ocean" is a strong narrative
- Pitch appeal: good
- MVP risk: medium - technical, but clean contradiction
- TRIZ contradiction: classic (output vs energy consumption)
- Best second method: **Biomimicry** (how mangroves/fish/seabirds desalinate water)

### Problem 7: Buildings hot & cold (SDG 13/11) - DEMO FOCUS
**PHYSICAL contradiction:** the same walls/windows must insulate heat in winter and release it in summer - opposite requirements depending on the season. Hint: "AC is not the solution - produces A LOT of heat."
- Innovation potential: **high** - adaptive/smart materials is a non-obvious direction
- Pitch appeal: good - "your house works against you half the year"
- MVP risk: low - simple to formulate
- TRIZ contradiction: **cleanest of all** - a physical contradiction (the same element must have opposite properties)
- Best second method: **Biomimicry** (termites keep a constant temperature in the mound, polar bears - adaptive insulation, birds - moulting)

---

## Recommendation: TOP 3

### 1. Problem 7 (Buildings) - PRIMARY / DEMO FOCUS
- Cleanest TRIZ contradiction (physical - opposite requirements on the same element).
- Second method = 5 Whys (locked): the engineer + AI drill "why does the same wall fight us in both seasons?" to a root cause, then generate countermeasures. Innovation story = transparent human+AI root-cause collaboration.
- Highest innovation potential.
- Simple to formulate, simple to demo.

### 2. Problem 4 (Oil spills) - BACKUP #1
- Best pitch appeal (visual, emotional).
- Low barrier to entry - contradiction simple to formulate.
- Second method = 5 Whys (locked), same as all problems.

### 3. Problem 3 (Electricity) - BACKUP #2
- Strongest organizer hint (they explicitly rule out the obvious solution).
- Emotional angle (healthcare, education).
- Higher MVP risk (technical problem).

## Second-method decision - LOCKED: 5 Whys

The second method is **5 Whys** for every problem (not chosen per problem). It runs in parallel
with TRIZ: the engineer answers guided "Why?" questions, the model facilitates (with guardrails
and an opt-in hypothesis fallback), we drill to root cause(s) and generate ≥3 countermeasures.

The table below is **historical** (pre-lock, when method was chosen per problem) and kept only
for the record:

| Problem | (historical) method 2 idea | Why |
|---------|----------------------|-----|
| 7 (Buildings) | ~~Biomimicry~~ → **5 Whys** | superseded; 5 Whys locked |
| 4 (Oil spills) | ~~SCAMPER / Biomimicry~~ → **5 Whys** | superseded |
| 3 (Electricity) | ~~Biomimicry~~ → **5 Whys** | superseded |
| Others | ~~SCAMPER~~ → **5 Whys** | superseded |

**Design of the 5 Whys method: `08_triz_primer.md` (second method section) and `04_architecture.md`.**
