# Fitting the noir skin to its tile (tools/face3d/fit/noir)

Goal: the noir skin reproduces tools/face-styles/ref/noir.png the way the clay skin
reproduces public/faces/ref-clay.webp. Same character, same fitted clay form; noir gets its
own camera, a fitted fedora, its own light and surface, and two flat layers cut from the
tile (the rain behind, the coat collar in front). Run on local disk (copy this folder and
../ out of Drive). It needs the clay run's build in base/ (face.blend, fit_params.json,
build_head.py, as ../pipeline.sh made them) and the tile copied in as noir.png.

1. segnoir.py: part labels for the tile: 0 bg, 1 skin, 2 hair, 3 eye, 4 brow, 5 hat,
   6 coat. The dark parts (hat, hair, coat, rain) can't be told apart by tone, so they are
   traced polygons; skin, eyes and brows are cut by tone inside them. Writes
   ref_parts_tile.npy (382 x 408), ref_parts_full.npy (802 x 862, the site canvas) and
   ref_parts.npy (fit size). ref.webp is the tile resized to 802 x 862.
2. noirhat.py: the parametric fedora (crown radii and height, taper, crease, pinch, a
   forward bulge, brim width front and side, curl, droop; tilt, offset, scale) and
   press_hair (the hair squashed under it, in the hat's own frame).
3. noiropt.py + noirworker.py: CMA-ES over 8 camera and 21 hat numbers (the head's form is
   fixed), Blender workers rendering flat part ids, scored on part overlap and 6
   landmarks; the coat's pixels score nothing. Result: RUN/best.json (the shipped fit is
   noir_fit.json; the hat's overlap was 0.81 before the warp).
4. noirpipe.sh FIT.json NAME [WARP_PASSES=7]: noirbuild (the clay build with this hat, hair
   pressed for good) -> noirwarp (optical flow between part maps, the hat included, the
   coat taking our own label; 1.2% of pixels mislabelled after 7 passes) -> noirtrim (hat
   faces seen over open background dropped: a far-brim sliver) -> noirprojuv (UVs from the
   fitted camera; skin, hair and hat in two depth layers) -> noirpasses (AO, one ray per
   pixel, plus the hits just behind it) -> noirlight (SH light per part, the hat its own)
   -> noiralbedo (reference / light, with a floor, a scale and a gamma per light: noir is
   near-black where a 9-term SH light dips under zero) -> noirfinal (GLB + fit json).
5. noirplates.py: noir-back.webp (the tile with the head painted out) and noir-coat.webp
   (the coat, shirt and tie with a soft alpha).
6. snapnoir.mjs + noirdiff.py: the site render (harness) composited with the plates as the
   page layers them, scored against the tile at its own size and at the canvas size.
   simulate.py runs the shader on the ray passes: if it matches the tile and the site
   doesn't, the GPU is drawing other faces than the rays saw (that is how the hat's
   inconsistent winding showed up).

Lessons (each cost a run):
- The hat must have consistent outward winding: the site culls back faces, the ray passes
  don't, and the layer test in projuv reads face normals.
- Erode a layer's texels only at real part edges, not along the seam between a part's two
  depth layers, or thin slivers of one layer get filled from far away (scribbles).
- Agreement with the tile's labels is no rule for picking ratios: it clips them.

Measured (2026-10-10, n5): mean abs error 0.57 / 255 on the head (skin, hair, eyes, brows,
hat) at the tile's own size, 97.5% of head pixels within 4 levels, 99.6% within 16; 0.64 at
the canvas size; 1.15 over every pixel (the plates are lossy webp). Clay, same day: 1.57 (run2), 1.03 after the clay session's
later pass.

Ship: NAME/final.glb -> public/faces/face-noir.glb, NAME/fit.json -> public/faces/fit-noir.json,
noir-back.webp and noir-coat.webp -> public/faces/. The noir skin's `rig` (faceSkins.js)
points at them; FaceSV swaps that rig in while noir is worn.
