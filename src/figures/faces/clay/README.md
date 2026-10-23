# Procedural clay head (three.js only)
`params.js` (a JSON of proportions) -> `claySdf.js` (smooth-blended SDF primitives: rounded super-ellipsoid cranium and jaw, cheeks, ears with a carved bowl and fold,
nose cone, the smile groove as a smooth subtraction, hair cap + swoosh) -> `surfaceNets.js` (polygonised, normals from the field's gradient) -> `ClayHead.js`
(MeshPhysicalMaterial clay with a faint sheen, vertex colours for skin / hair / the groove's shade, bead eyes, brow pills, soft studio light).
Hair and skin are ONE unioned surface (no shell, no z-fighting). Build at n = 96 takes about 1 to 2.5 s headless (software GL); a worker or cached bake is the next step.
Dev: /face-lab (top card) edits the JSON live and orbits; `tools/face3d/claydev/shots.mjs` renders the turnaround's views; `tools/face3d/asset/turn_compare.py` scores them;
`tools/face3d/claudefit/fit.mjs` is the Claude-as-critic loop (needs ANTHROPIC_API_KEY in the environment or a git-ignored .env.local).
Not yet: eyelids/blink, expression morphs, parts (hats, glasses, beards, devices), the other looks as parameter sets, the face-system JSON bridge, the hero.
