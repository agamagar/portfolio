# How each skin moves (2026-10-12)

Agam: "read about them, understand how they're supposed to behave... animate each of them
individually with their own characteristics." One dossier per skin (`<skin>.md`): how that
medium moves on screen, the sources, and a motion profile. The profiles live in
`src/figures/faces/styleMotion.js`; FaceSV performs every shared emote through them.

Sourcing caveat: the research ran in a cloud container whose proxy refused page fetches, so the
citations come from search-result excerpts (each file says so), and inferences are marked
"(synthesis)". Worth a read-through before treating any number as gospel.

| skin | exposure | ease | time | size | boil | the medium's tell |
| --- | --- | --- | --- | --- | --- | --- |
| clay | twos (83 ms) | smooth | x1.1 | x1.0 | 0.006 | thumb-boil, replacement mouths (shape keys in 6 steps) |
| claySun | twos | heavy | x1.25 | x0.95 | 0.008, tilt only | softened clay, sluggish |
| felt | twos | smooth | x1.05 | x0.85 | 0.004 | soft, little squash (felt doesn't stretch) |
| stone | twos | heavy | x1.6 | x0.6 | 0.002 | heavy, barely idles, small turns |
| noir | film ones (42 ms) | smooth | x1.3 | x0.7 | 0.002 | slow and deliberate |
| pixel | threes (125 ms) | snap | x0.9 | x1.0 | none | head moves on a grid, shapes in 3 steps |
| cel | threes | snap | x0.85 | x1.1 | none | holds and quick in-betweens, a kick past the key |
| hose | twos | bouncy | x0.8 | x1.3 | 0.004 | overshoot and squash x1.6, a big bobbing idle |
| riso | threes | snap | x0.95 | x0.9 | 0.009 | jittery, collage-like |
| print | twos | snap | x0.85 | x1.15 | 0.002 | snappy, comic timing |

`motion-curves.png` (../audit/2026-10-12/) plots the same nod through every profile:
`node curves.mjs OUT.json && python3 curves.py OUT.json OUT.png`.

## The hook for the hero's emote engine

`morph/emoteEngine.js` belongs to the hero work; nothing here edits it. To give the hero the
same per-skin performance, import from `../styleMotion`:

- `const prof = motionFor(skinId)`
- the clock: sample at `stepTime(prof, now)` rather than `now`
- the keyframe sampler: `easeKey(prof, k)` in place of smoothstep
- durations: `dur * prof.durationScale`
- the sampled pose, before it's applied: `perform(prof, pose, restPose, stepIndex)` (amplitude,
  squash, turn budget, replacement-shape steps, boil, pixel snap)

Reduced motion and held poses pass `{ ...prof, boil: 0 }`, as FaceSV does.

Not done (each dossier's notes): per-ink misregistration for riso and print, film flicker and
gate weave for noir, palette cycling for pixel, a tempo-locked idle for hose. Those are shading
effects, outside this motion layer.
