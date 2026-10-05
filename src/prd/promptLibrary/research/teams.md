# Teams · research dossier (index)
_Researched 2026-09-04. One dossier per function under `research/teams/`; each numbers its own sources, and the role cards in `teams/teams.data.js` cite those numbers._

The Teams half of the library holds prompts that do a function's working documents, so
"the medium" here is each function's own craft, plus the way current chat models respond
to text prompts. Both were researched before a clause was written.

| File | Covers | What it changed versus memory |
| --- | --- | --- |
| `teams/levers.md` | The text-prompt levers, from Anthropic, OpenAI and Google's own docs (11 sources) | The ask goes last after pasted material; a rule carries its reason; positive replacements beat prohibitions; capitals, "think step by step" and long rule lists now backfire; examples are the strongest lever and are copied closely |
| `teams/ds-product.md` | Data science and Product (48 sources) | The ship rule is mechanical (superior on a success metric, non-inferior on every guardrail, nothing deteriorating); sample ratio mismatch is a gate not a caveat; quick-commerce tests randomise on stores or zone-days, not users; launched lifts cannot be summed; kill criteria come from Annie Duke, non-goals from Google's design-doc practice |
| `teams/last-mile.md` | Last-mile operations (24 sources) | Orders per hour, rider utilisation and cost per delivery are vendor-blog words with no practitioner definition; the practitioners publish orders per dark store per day, net versus gross order value, contribution margin, active dark stores; delivery time has a named equation and breaches are attributed by leg; supply shortage is a discrete stress state; batching is always written with its lateness price |
| `teams/engineering.md` | Backend and Frontend engineering (46 sources) | Google's retry rule is per error code (retry UNAVAILABLE, never DEADLINE_EXCEEDED); Stripe's idempotency layer errors on parameter mismatch and caches failures; a runbook is per alert; feature flags have four kinds and a carrying cost; INP has three phases and CLS is caused by animating top or left |
| `teams/leads-leadership.md` | Design leads and Company leadership (30 sources) | Critique, feedback and review are three different things and rule one of critique is no problem-solving; Stripe's quality axes are utility, usability, beauty with friction logs as evidence; six-pagers are not pre-read; committed OKRs expect 1.0, aspirational 0.7; several requested terms (calibration, operating cadence, north star) had no source and were kept out |

## What was kept out, and why
A clause with nothing behind it is the failure this pipeline exists to prevent. The
dossiers name these gaps and the role cards repeat them in their Sources field:

- SQL and dashboard specs (data science), release notes (product), store audits and
  launch playbooks (last mile), release checklists (frontend), incident communication
  and hiring plans (leadership): no primary practitioner source found. Where a task
  ships anyway it is marked as a practice inference in its own check line.
- Nathan Curtis's component-spec and contribution-model articles returned 403, so the
  frontend component-spec section list is partly UNVERIFIED and design-system
  governance has no card.
- "Act as a world-class expert" adjectives, politeness, and a fixed short-prompt order:
  no vendor documents them, so the assembler does none of them.

## The assembler these feed
`teams/buildPrompt.js`: role stated as a perspective, task with its reason, inputs in
tagged blocks above the ask, an examples slot, output shape stated positively, craft and
a short rule list with reasons, a self-check rubric, the ask restated last. Every part
cites `teams/levers.md`.
