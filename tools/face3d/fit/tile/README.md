# Fitting the other six tiles (tools/face3d/fit/tile)

Goal: every skin with a reference tile reproduces it the way clay, noir and felt do. These
six (2026-10-12) are claySun (clay-yellow.png), stone, cel, hose (rubberhose.png), pixel and
riso. None wears a fitted prop, so this is felt's path (the clay build re-fitted, ../ stages),
generalised: one segmenter, one plate maker, one scorer, one driver, with what differs per
tile in segtile.py's CFG and landmarks/SKIN.json. Print (Spider-Verse) has no tile and stays drawn.

Run on local disk, one copy of ../ per skin (the stages write fixed names in the fit folder):
copy ../ into WORK/SKIN/fit with build_fit/build_head.py (tools/face3d/build_head.py), the tile
as SKIN.png, and a symlink WORK/SKIN/harness -> the fit harness (a Vite page rendering
`<FaceSV size={349} skin={?skin}>` with its own public/faces; snapfelt.mjs drives it).

1. tile/segtile.py SKIN: ref.webp (the tile at 802 x 862, lossless) and part labels
   (0 bg, 1 skin, 2 hair, 3 eye, 4 brow): the backdrop flooded in from the border by colour
   (riso: the torn white rim walls the head off); dark thick blobs placed by the landmarks
   (eyes, brows); the hair by its own colour; ink lines and the anti-aliased silhouette take
   the nearest of skin and hair; a skin island cut off inside the hair (a highlight) is hair.
   Stone is one material, so its hair is a traced polygon and its carved eyes and brows
   ellipses. Riso's safety pin tip, past the ear, is left out of the head.
2. tile/tileplates.py SKIN: SKIN-back.webp, the backdrop with the head painted out
   (felt's method). Riso keeps its pin tip in the plate.
3. ../optimize.py, as felt: FIT_LM=tile/landmarks/SKIN.json FIT_KEYS=cam FIT_NW=2
   FIT_SIGMA=1.0 from the shipped clay form (40 gens) -> c1, then all numbers FIT_SIGMA=0.25
   from c1/best.json (120 gens; hose 0.45 and 150, its proportions are furthest from clay's)
   -> c3. The warp does the rest.
4. tile/tilepipe.sh SKIN c3/best.json NAME [REFINE_ROUNDS=3]: felt/feltpipe.sh generalised
   (build -> warp -> projected UVs -> passes -> SH light -> albedo -> GLB -> harness render
   -> refine rounds scored by tilediff.py). Felt's switches stay on (FIT_CLEAN_FILL=diffuse,
   FIT_K=skin:0); the feature margins are clay's unless FIT_GROW says.
5. tile/pack.sh NAME/final.glb face-SKIN.glb: meshopt (16-bit positions and UVs), the site
   render pixel-identical, ~2.5x smaller. Not for face.glb or face-noir.glb (the hero's morph
   reads raw object-space positions).

Ship: face-SKIN.glb (packed), NAME/fit.json -> fit-SKIN.json, NAME/tex/idmap.png ->
idmap-SKIN.png, NAME/tex/Skin_ratio_raw.png -> skin-raw-SKIN.png, NAME/tex/margins.png ->
margins-SKIN.png, SKIN-back.webp -> public/faces/. faceSkins.js names them in each skin's `rig`.

Checked in this environment first: felt rebuilt from felt_fit.json with these tools scored
0.42 / 255 on the head (its README: 0.44), so the cloud toolchain (Blender as the bpy module,
software GL) reproduces the Mac's.

Measured: see the table in ../../audit/README.md.
