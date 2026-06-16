# Portfolio Strategy

Agam Agarwal · Interaction Designer · Amsterdam.
Purpose: a durable credibility hub, with Present mode engineered for big-tech panel interviews.
This doc is the source of truth — every page, case study, and animation decision traces back to a rule here.

---

## 1. The three readers

Everything on the site is built for one of three reading modes. If content doesn't serve one of them, cut it.

| Reader | Time | What they need | Surface |
|---|---|---|---|
| Recruiter | ~30 sec | Who, where, what level, proof of outcomes | Home page only |
| Hiring manager | ~3 min/case | Your decisions, your reasoning, real results | Case study article |
| Interview panel | ~30 min | A presentable narrative — one idea at a time | Present mode |

**The clarity gate applies at every level:** if a design hiring manager can't understand a title, a lead, or a section on first read, it doesn't ship. No jargon, no internal product names without explanation, no process theater.

## 2. What works today (operating principles)

Distilled from the guides behind the portfolio-builder skill:

1. **Outcome-led, accent-highlighted titles.** "Designing *scheduled delivery* for a 10-minute platform" — the accent phrase is the hook. Never "Case Study: Zepto".
2. **Decisions over process.** HMs skip the double-diamond. Show the fork you faced, the direction you killed, and why. The Zepto "two directions, tested to ground" section is the model.
3. **Visualizations do the heavy lifting.** Any mechanism that takes >2 paragraphs to explain gets a diagram/flow/before-after instead. Sketch it first; prose is the fallback, not the default.
4. **Real numbers, honestly framed.** ₹600 vs ₹300 AOV beats "significantly improved". Where numbers are weak, lead with the behavioral shift and say so.
5. **One curb-cut max per case study.** One uniquely-landed moment (inline demo, punchline visual, real artifact) per story. None is better than a forced one.
6. **Restraint as craft signal.** Motion, color, and density should demonstrate judgment. The motion lab stays unlinked; its techniques surface in the site only where they aid comprehension (e.g., self-drawing flow diagrams).

## 3. Project selection framework

Slots: 4–5 visible projects. Candidates: Toppr, Zepto, CaratLane, Deutsche Bank (locked), Siemens, Cyware.

Score each candidate 1–3 on:

- **Outcome strength** — is there a real, defensible result?
- **Ownership** — can "I decided X" be said truthfully and specifically?
- **Type diversity** — does it add a project type the lineup lacks?
- **Artifact availability** — screens/flows you can actually show (NDA reality check)
- **Interview mileage** — can it carry a 30-minute panel discussion?

Project types to cover (from the skill's taxonomy — aim for 4 distinct types across the lineup):

| Type | Likely candidate | Copy mix |
|---|---|---|
| Consumer narrative | Toppr | Story-led, emotion + metrics |
| Retail / operational | Zepto, CaratLane | Constraint-led, systems thinking |
| B2B / technical feature | Cyware, Siemens | Viz-heavy, mechanism explainers |
| Enterprise / regulated | Deutsche Bank (locked) | Teaser + on-request access |
| Research / 0→1 | Research section papers | Abstract-style summaries |

**Rule:** two projects of the same type compete for one slot — keep the one with the stronger outcome + artifacts. Zepto and CaratLane are both retail/operational; pick one for depth, the other can be a shorter "snapshot" entry or cut.

**Locked-project pattern:** Deutsche Bank stays visibly locked on the index (signals caliber of employer), with a one-line scope teaser. Full story available live in interviews via Present mode — this turns the NDA into an interview asset.

## 4. Case study format

Structure (per the skeleton): Lead (outcome up front, ≤4 sentences) → Context & problem → My role (specific, first) → Constraints → Process as decisions → Details that made it work → Impact → Reflection (one honest "what I'd revisit").

Length targets: 900–1,400 words article mode. Every section asks: *could a figure replace this?*

The 8-check clarity gate runs on every draft before it ships — unforgiving by design. Key checks: 30-second comprehension by an HM, no unexplained internal terms, role unambiguous, every claim either quantified or explicitly qualitative, no section that exists only to show process.

Zepto is the reference-quality case study; Toppr is next to be brought to that bar (its `todo` list in App.jsx is the work queue).

## 5. Present mode — the big-tech panel deck

Present mode is not a reformatted article; it's the primary interview tool. Rules:

- **One idea per slide.** If a slide needs two paragraphs, split it.
- **Media-forward.** Default `split: "media"` for process/solution slides; text-only slides reserved for framing and impact.
- **12–18 slides per case study** — fits a 30–40 min panel slot with discussion.
- **The kill-decision slide is mandatory.** Big-tech panels probe judgment; the direction you cut and why is the strongest slide in the deck.
- **Impact slide reads in 5 seconds.** Big numbers, no bullets-of-bullets.
- Presenter affordances to build: speaker notes (visible only to presenter), slide-level deep links, and a "panel mode" that strips the todo blocks.

## 6. Site-level direction

- **Home:** name, role, city, 2-line bio, Resume + LinkedIn, then the work list. Nothing else. The accent-dot list pattern stays — it scans in seconds.
- **Research section:** real papers only; placeholder entries stay hidden until filled. Abstract-style one-liners, venue + year.
- **Sample slots:** remove from production view; keep in code as templates. Shipping placeholders fails the credibility test.
- **Motion:** M3 motion tokens for UI transitions (standard, not expressive, for navigation; expressive reserved for one hero moment per case study). Reduced-motion fallbacks always.
- **Voice:** Agam's first person. Confident, concrete, no superlatives about oneself — the work claims, the numbers prove.

## 7. Build order

1. Lock the project lineup using §3 scoring (needs Agam's input on outcomes/artifacts per project).
2. Finish Toppr to Zepto's bar — fill the `todo` facts, run the clarity gate.
3. Replace figure placeholders with real annotated artifacts (both case studies).
4. Present-mode upgrades: speaker notes, panel mode, slide splits tuned per §5.
5. Add the 2–3 remaining case studies, one at a time, each through the full skill loop (classify → copy mix → viz plan → draft → clarity gate).
6. Research section with real papers; cut sample slots from production.
7. Final pass: motion polish from the lab, OG/meta, performance.

---

*Maintained alongside the code. When a decision here changes, change it here first.*
