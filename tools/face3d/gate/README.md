# Face production gate

One command certifies every face before it ships: every skin (clay, noir, hose, cel, claySun, pixel, felt, stone, riso, print, plast) and every preset
(the Desi-Log combos, worn on the soft-clay rig), through the production rig (`faceRig3D.createFaceRig`, shaded pass, the hero's emotes). No lab shaders.

```
npm run faces:gate        # render (incremental) + parts + gate; exits 1 if any face fails; report/index.html + report/summary.json
npm run faces:gate:fast   # hero-size front + 3/4, light only, subset of checks (also: node tools/qa-smoke.mjs --faces)
```
Needs vite on :5218 (`npx vite --port 5218`). One browser at a time; software GL is slow (about 30 s per face, plus the machine's load).

| step | file | does |
| --- | --- | --- |
| render | `render.mjs`, `gate-lib.js`, `matrix.mjs` | per face: 7 views at rest (front, 3/4 L/R, profiles, up, down), blink mid and closed (front, 3/4), every emote at its peak, 3 flicker frames + identical re-render; colour and ids pass. Cache in `~/.cache/face-gate/cache`, keyed by a hash of the face code, the skin's assets and the preset: only changed faces re-render. 256 / 83 px and light / dark are derived from the native 802x862 render in the checks and the report |
| parts | `parts.mjs`, `parts-lib.js` | every expected part built, visible, drawn (pixels change when it is hidden), attached (no piece further than 6% of head height from the skin); chromium vs webkit agree |
| checks | `checks.mjs`, `thresholds.json` | holes, blackpix, stretch, symmetry, seams, lidcover, ghosts, framing, aliasing, edges83, exposure, flicker, errors, loadmem, parts, browsers |
| report | `gate.mjs`, `report.mjs` | matrix + gallery + failing crops (`report/`), JSON summary, exit code |

Safe fixes (flags, `src/figures/faces/morph/safeFixes.js`; render with `--fixes frame,lid,normals,mirrorFill,inpaint`, compare in the report): auto-centre and scale, lid material inheritance, normal recomputation on asymmetric verts, mirrored-projection fill of texture holes, inpainting of small holes. `node tools/face3d/gate/selftest.mjs` covers the pixel routines.

Limits: sizes 83 and 256 are box-filtered from the native 802 render (1024 is not re-rendered); thresholds are calibrated on the 22 Oct 2026 baseline (see `_doc` in thresholds.json); timings are software GL, so only relative.
