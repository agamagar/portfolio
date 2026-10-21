# The 3D face (src/figures/faces)

One head (`public/faces/face.glb`, same topology, morph targets and rig for every look), many looks. Stable API, in order of
how often you will touch it:

## The renderer: `morph/morphRenderer.js` (`createMorphRenderer`, reached as `mm.MR` from `createMascotMorph`)
- `MR.listSkins()` -> `[{ id, label }]` in click-cycle order: `clay, noir, hose, cel, claySun, pixel, felt, stone, riso, print, plast`.
  (`SKIN_IDS` is the same list, importable without a renderer.)
- `await MR.setSkin(id, { transition })` loads the skin if needed (its GLB, fit and maps stream in while the current head keeps drawing), then
  wears it. `transition` is optional: a function `(swap) => Promise`; call `swap()` at your midpoint (HeroMorph's spin does, at yaw pi). Without it
  the swap is immediate.
- `MR.loadSkin(id)` / `MR.preloadNext(id)` to warm one (idle-callback). Rigs are kept as the three most recent and disposed after that.
- `MR.rigs[id]` is the loaded rig (`rig.pose(...)`, `rig.setFace(resolveFace(cfg))` on `plast`), `MR.rigName` the one worn.
- Fitted skins (hose, cel, claySun, pixel, felt, stone, riso, noir, clay) wear photo-fitted textures and cannot be reshaped; `print` and `plast` are
  drawn on the head and take face configs (below).

## The face system: `features/` (README there)
A face is JSON, one block per feature: `{ material, skin, hair, eyes, brows, nose, mouth, cheeks }` (see each `features/modules/*.js` `params` for
the keys and ranges). `resolveFace(cfg)` -> shape keys (the resting face, under the emotes), soft-warp handles (head shape), palette, hair, material.
Presets are `features/presets/*.json` (`agam-clay`, `neutral`). Adding a module, preset or hair style is adding a file. The schema is additive:
unknown blocks and keys are ignored, missing ones take the module's defaults, so a saved face keeps loading as modules grow.

## Rest of the folder
`faceSkins.js` (shaders, palettes, `SKINS`), `FaceSV.jsx` (/faces, the nine skins by the old path), `morph/faceRig3D.js` (the rig),
`morph/emoteEngine.js` (emotes), `morph/plastHair.js` (built hair). Audit and fit tools: `tools/face3d/`, newest renders in
`tools/face3d/audit/<date>/` (`rigshot.mjs` renders the hero rig for every skin and emote; `heroclick.mjs` clicks the real hero through every head).
