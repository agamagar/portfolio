# Fitting the face to the reference (tools/face3d/fit)

Goal: the clay face, seen from the fitted camera, reproduces public/faces/ref-clay.webp
pixel for pixel, with its lighting. Run on local disk (copy this folder out of Drive).

1. segref.py: cut the reference into part masks (skin, hair, eye, brow).
2. optimize.py + fitworker.py: CMA-ES over ~90 form and camera parameters (the names
   build_head.py reads), N Blender workers, scored on part overlap + landmarks; with
   FIT_SHADE=1 FIT_LIGHT=light.json it also scores shading against the reference pixels.
   Result: fit_params.json (copy beside build_head.py).
3. pipeline.sh PARAMS NAME: build_head -> warp.py (optical flow between part maps, every
   vertex slid in the camera plane, 7 passes coarse to fine) -> projuv.py (UVs projected
   from the fitted camera; skin and hair split into two depth layers, so a surface behind
   an overlap, like the cheek behind the nose, keeps its own colour) -> render_passes2.py
   (AO baked to vertex colour, one ray per pixel) -> lightfit.py (9-term spherical-harmonic
   light per part, AO^k) -> albedo2.py (reference / light per part and layer, light floored
   at 0.03, stored x0.25) -> finalize.py (GLB + fit.json with the camera in three.js axes)
   -> snapfit + pixdiff (site render vs reference).
4. refine.sh NAME ROUNDS: closes the loop. Renders in the real browser, divides the
   reference by that render per pixel and folds it into the textures (every pixel inside
   the head, seams included), then re-exports. Two rounds converge.
5. Copy NAME/final.glb to public/faces/face.glb and NAME/fit.json to public/faces/fit.json.
   The shader side lives in src/figures/faces/faceSkins.js (mode "fit") and FaceSV.jsx.

Measured, 2026-10-10, browser render vs reference (802 x 862, face pixels):
- run2 / p2: mean error 1.57 / 255, 93.5% within 4 levels
- p3 (depth layers, light floor, 4x range, closed-loop refinement): mean error 0.62 / 255,
  98.6% within 4 levels, 99.2% within 16. What is left: 1 to 3 px nicks on the hair
  silhouette (geometry) and the anti-aliased outer edge.
gapcrops.py NAME/site_diff.png OUT.png shows the known gap areas, reference | ours.
