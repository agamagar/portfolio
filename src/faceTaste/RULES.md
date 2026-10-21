# Face taste: the rules and why

`src/faceTaste/` judges a face config (the face system's JSON). Pure JS, no UI. All numbers are in `data.js`;
`index.js` only interprets them. Run `node tools/face-taste-check.mjs` after any change: it scores the presets,
the hand-tuned skin faces and seven deliberately bad faces, and fails if the data drifts from `src/figures/faces`.

API: `score(face)` (0-100 + per-rule reasons), `suggest(face)` (1-3 smallest edits, each explained and applicable),
`constrain(face)` (clamp to the taste ranges), `randomize(seed, {style, threshold})`, `pairings` (curated tables).

Positive examples: the `agam-clay` preset and one face per hand-tuned skin (`data.js` REFERENCES). They all score
85+. Tuning means keeping them up while the bad faces stay low.

## The seven rules (weights in `WEIGHTS`)
1. **Proportion harmony (.20).** Eye spacing follows face width (a narrow jaw wants eyes closer); the mouth is about
   half the eye size either side; the nose is in scale with the mouth; hair mass sits between "a cap" and "a helmet";
   brows keep a gap above the eyes. Why: faces read as off when scale relations break, long before any single
   feature does.
2. **Feature compatibility (.15).** Declarative clashes (`CLASHES`): heavy brow + narrowed eyes = angry, stern brow +
   big grin = menace, wide eyes under low brows = startled, full fringe over small eyes = hidden, smile-squint on a
   frown = wince, and so on. Each carries a penalty, the sentence shown to the visitor, and the edit that cures it.
3. **Small-size readability (.14).** At favicon/avatar size what survives is hair-vs-skin value contrast (L* gap),
   eye size and openness, and a visible mouth. Why: the face is used at 16-64 px (favicon, avatars).
4. **Colour harmony (.14).** Hair saturation within what the material allows (riso/pixel stylised, stone muted);
   hair not a near-miss hue of the accent (the lavender clip); dark eyes; brows close to hair value; lips in the
   skin's hue family. Why: near-misses look like mistakes, deliberate contrast or match looks designed.
5. **Expression coherence (.15).** Mouth, eyes and brows each give a warm/cool signal; their disagreement is
   penalised (grin with stern brows, a squint with no smile). A calm neutral is fully coherent.
6. **Material fit (.09).** Per material, parameter ranges its look wants (felt wants round cheeks, stone a defined jaw
   and a closed mouth, pixel big eyes and a clear smile, rubber hose cheerfulness).
7. **Distinctiveness (.13).** L2 distance in normalised parameter space to the nearest reference. Under 0.06 is a
   near-duplicate (0 points), over 0.20 is distinct (full). An exact preset is a preset, not a copy.

## Aggregation
Weighted geometric mean with sharpness 2.2 (`AGGREGATE`): small blemishes cost a few points, one failed rule (say the
hair the colour of the skin) drags the total into the 40s. Healthy faces land 85-100; bad ones 35-70.

## suggest / constrain / randomize
- `suggest` tries single edits (three step sizes up and down per param, each clash's fix, other hair styles and
  paired hair colours, the clip), keeps per param the smallest edit within 85% of its best gain, ranks by gain minus
  a small size cost, returns at most 3, each with `apply(face)`.
- `constrain` clamps to `NUMERIC[..].lo/hi` (narrower than the sliders), tames hair saturation, fixes eye and brow
  colour, and applies the first fix of any hard clash (penalty >= .5).
- `randomize` samples per style (`STYLES`: balanced, cute, bold, calm, character; bell-shaped around a centre inside
  the taste ranges, hair colour from the skin-band pairing), constrains, scores, and returns the first sample at or
  above the threshold (default 78); failing that it nudges the best with its own suggestions. Same seed, same face.
- `pairings`: hair colours by skin band, hair styles by material, brow/mouth ranges by hair style, materials by emote.
