# research/ · where the prompts come from

One dossier per prompt system, plus `models.md` for the cross-cutting model
knowledge. **A prompt clause is a claim about how a medium works, and claims get
sourced.** These files are the sources.

The pipeline that produces and consumes them is the `prompt-library-craft` skill
(`~/.claude/skills/prompt-library-craft/`). The short version:

1. Read the group's data + views files, its dossier here, and `models.md`.
2. If there is no dossier, or it predates the group's last substantive change,
   research the medium first. Never write a clause from memory.
3. Write the clause using the craft's own vocabulary, not adjectives.
4. Run the gate: `node ~/.claude/skills/prompt-library-craft/scripts/check.mjs`
5. Cite it in the spec's `Sources` block and append to the skill's `LEDGER.md`.

## Why the vocabulary matters

An image model responds to terms that are dense in the captions attached to images
that actually look like the thing. "Beautiful stylised icon" describes a wish;
"2:1 dimetric projection, single-weight monoline stroke with butt caps, aligned to
a 24px keyline grid" describes the artifact. The second one is what the craft calls
it, and it is what moves the model.

## Dossier format

```
# <Group> · research dossier
_Researched YYYY-MM-DD. Sources listed at the bottom, numbered; cite by number inline._

## What the medium actually is
## Vocabulary worth putting in prompts     (TERM | meaning | why a model responds | source #)
## What separates a convincing result from a generic one
## Model-side levers
## Proposed clause upgrades
## Sources
```

## The standing rules for research

- Never invent a source or a URL. Only list pages actually fetched.
- Mark inference as inference and unverified claims as UNVERIFIED.
- Say "nothing solid found" rather than filling a gap with plausible craft lore.
  A confident sentence with nothing behind it is the failure this whole pipeline
  exists to prevent.
- Prefer primary sources: practitioners, standards bodies, manufacturer docs,
  platform design guidance, model vendors' own documentation.
