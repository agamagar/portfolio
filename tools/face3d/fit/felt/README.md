# Fitting the felt skin to its tile (tools/face3d/fit/felt)

Goal: the felt skin reproduces tools/face-styles/ref/knit.png the way the clay skin
reproduces public/faces/ref-clay.webp. Same character; felt gets its own camera, a lightly
re-fitted form, its own light and surface (raw and clean skin, margins, id map, as clay's p11
rig has them) and one flat layer cut from the tile: the red backdrop with the head painted out.

Why felt was next (2026-10-11): of the unfitted tiles it is the clearest for this pipeline.
The backdrop is saturated red (the head cuts out by colour, no traced polygons), it wears no
props, and it is a soft-lit physical material in clay's pose, so 9-term SH light times an
albedo texture models it well.

Felt has no hat, so this folder drives the clay stages in ../ (warp, projuv, render_passes2,
lightfit, albedo2, finalize, refine) rather than noir's hat path. Run on local disk: copy ../
(with build_fit/) out of Drive into its own folder, copy knit.png in as felt.png, and run
everything from that copy of fit/ (segfelt overwrites its ref.webp and ref_parts*.npy).

1. ref.webp: the tile resized to 802 x 862 (Lanczos, lossless webp).
2. felt/segfelt.py: part labels by colour: 0 bg, 1 skin, 2 hair, 3 eye, 4 brow. The
   stitched smile stays skin (the skin texture carries it). Writes ref_parts_full.npy,
   ref_parts.npy (fit size), ref_parts_tile.npy, trim_keep.npy, parts_check.png.
3. felt/feltplates.py: felt-back.webp, the backdrop with the head painted out: a cubic
   surface fitted to the open backdrop plus matched grain (diffusion-plus-tiling, noir's
   way, left stripes on a flat colour). The tile's pale left edge columns become backdrop.
4. ../optimize.py, CMA-ES, starting from the shipped clay form (p11 fit_params.json):
   FIT_LM=felt/landmarks.json FIT_KEYS=cam FIT_NW=4 FIT_SIGMA=1.0 -> c1 (camera only, 40
   gens, loss 2.16), then FIT_LM=... FIT_NW=5 FIT_SIGMA=0.2 from c1/best.json -> c3 (all
   numbers, a gentle polish, 120 gens, loss 1.97). A full-width search (sigma 0.6) did
   worse (2.65): keep the form near clay's and let the warp do the rest. The shipped fit
   is felt_fit.json.
5. felt/feltpipe.sh PARAMS.json NAME [REFINE_ROUNDS=3]: build -> warp (7 passes, 0.33% of
   pixels mislabelled) -> projected UVs -> passes -> lightfit -> albedo2 -> finalize -> the
   harness render -> refine rounds, each scored by felt/feltdiff.py (canvas over the plate).
   TEX_ONLY=1 keeps NAME's geometry and passes and redoes light and textures.
   It sets three switches the shared stages read (clay's defaults are unchanged without them):
   - FIT_K=skin:0 (lightfit): pins the skin's AO exponent. Felt's scan picked 0.5, and the
     skin under the brows and beads (occluded at rest) went grey the moment they moved.
   - FIT_GROW=eye:11,brow:14,mouth:14 (albedo2, refine): wider feature margins; felt's beads
     and raised brows cast soft shadows past clay's 6/10/14.
   - FIT_CLEAN_FILL=diffuse (albedo2): the clean skin under the movers is diffused in from
     clean skin clear of the margin, plus grain, instead of the nearest texel (which dragged
     the bead's shadow ring and highlight into radial streaks).
6. felt/snapfelt.mjs (the harness render), felt/feltdiff.py (scores), felt/feltcompare.py
   (the before/after sheet), felt/switchtest.mjs (clay -> felt -> noir -> felt -> clay).

Measured (2026-10-11, run f3): mean abs error 0.44 / 255 on the head (skin, hair, eyes,
brows) at the tile's own size, 97.9% of head pixels within 4 levels, 99.6% within 16; 0.45
at the canvas size. Before the fit (the procedural felt mode on the clay rig) it was 40.6.
Over every pixel 2.18: the silhouette ring (the tile's soft edge and contact shadow, painted
out of the plate so it can't detach when the head bounces) averages 15.8 and the tile's pale
left edge strip ~26; the open backdrop elsewhere is 1.0.

Left: a few texture flecks a few pixels wide at layer seams (right temple, under the ear);
the hard silhouette against the tile's soft one.

Ship: NAME/final.glb -> public/faces/face-felt.glb, NAME/fit.json -> fit-felt.json,
NAME/tex/idmap.png -> idmap-felt.png, NAME/tex/Skin_ratio_raw.png -> skin-raw-felt.png,
NAME/tex/margins.png -> margins-felt.png, felt-back.webp -> public/faces/. The felt skin's
`rig` (faceSkins.js) names them all; FaceSV's loadRig takes a rig's own id map, raw skin
and margins (clay's still sit beside fit.json).
