# Face skins: audit and fit results (2026-10-12)

Headless checks for every skin in /faces (FaceSV) and the homepage hero (faceRig3D), and the
mean head error of each fitted skin against its tile. Everything here ran in a cloud container
on software WebGL (SwiftShader) and Blender as the bpy module (software GL); see "Real GPU" below.

- audit.mjs OUT [BASE]: each skin at rest, grin, blink, turned left and right, from behind, plus
  the page shot (plates and all) and console errors. SKINS=a,b and VIEWS=rest,grin narrow it;
  MOMENTS=1 holds every emote at its strongest moment instead (the emote sheet).
- grid.py DIR OUT [VIEWS]: the audit as a sheet. beforeafter.py: the PR's before/after sheet.
- switch.mjs OUT [BASE]: next() (what a click does) through every skin, twice round.
- hero.mjs OUT [BASE]: the hero morph's clay hold, click-to-noir and back, light and dark
  (needs ?morph=on without a GPU; reads the hero's own canvas).
- score.sh [SKINS]: each fitted skin's head error as the site draws it now (snapfelt + the
  skin's own scorer, in its work folder: tools/face3d/fit/tile/README.md).
- beforescore.py: the old (drawn) skins' rest shots scored against their tiles.

## Mean head error, /255 (the tile's own size; head = skin, hair, eyes, brows, noir's hat)

| skin | before | after | within 4 levels | fit |
| --- | --- | --- | --- | --- |
| clay | 0.78 | 0.78 | 98.2% | unchanged (fit/, p11) |
| noir | 0.92 | 0.75 | 96.1% | unchanged GLB; id map, part colours, depth for turns |
| felt | 0.46 | 0.46 | 97.9% | unchanged textures; packed 8.6 -> 3.5 MB |
| claySun | 30.3 (drawn) | 0.57 | 97.5% | new: tile/ |
| stone | 54.3 (drawn) | 0.64 | 97.7% | new |
| pixel | 48.0 (drawn) | 0.72 | 96.4% | new |
| cel | 35.8 (drawn) | 0.97 | 96.5% | new |
| riso | 79.2 (drawn) | 0.99 | 97.1% | new (3 px grow for its torn edge) |
| hose | 43.8 (drawn) | 1.34 | 96.5% | new (3 px grow for its ink outline) |
| print | (no tile) | - | - | stays drawn |

"Before" for clay, noir and felt is the code at a1a01b2 measured the same way in this container
(noir's README says 0.57 on the Mac's GPU; SwiftShader rasterises edges differently, so compare
within a column, not across machines). For the six new ones it is the drawn skin's rest shot
from audit.mjs over the tile's backdrop colour (beforescore.py), so only a rough figure.

What is left in hose and riso is their silhouettes: a black ink outline (hose) and a torn paper
rim (riso) that a smooth mesh edge can't follow pixel for pixel; about half of hose's error sits
in a 6 px band round the outline. Inside the head both are under 1.

## Behaviour checked

- Emotes: all 12 held at their strongest moment on every fitted skin (2026-10-12/after-emotes.jpg).
- Turned views (the far ear, the back): no smear and no blow-out on any fitted skin. Fixed here:
  noir blew its hair and far side out to white; turned hair went orange or red; the far ear took
  the face's texels (now a rest depth test); silhouette texels carried backdrop colour onto the jaw.
- Click-switch and auto-cycle: switch.mjs, 20 switches over two laps, every fitted rig drawing,
  no errors; turning Cycle on or off no longer rebuilds the face. A rig that fails to load falls
  back to the skin's drawn look.
- Hero: the clay morph, click-to-noir and back, in light and dark, no errors, clean edges
  (2026-10-12/hero-light-dark.jpg). node tools/qa-smoke.mjs passes.

## Real GPU still needed

- Every number and image above is SwiftShader. Check /faces and the hero on a real GPU (Mac
  Chrome, an iPhone): timing of the spin and the first load of each rig (~3.5 MB packed GLB plus
  ~0.7 MB of maps per skin), and that the meshopt decoder's WASM loads on Safari.
- GPU memory: FaceSV now keeps the base rig plus the three most recent; worth a look in
  Safari's memory tools while cycling.
