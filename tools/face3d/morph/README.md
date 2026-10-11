# tools/face3d/morph: the hand-off data for the mascot morph (2026-10-10)

Run from a local copy (not Drive). The page scripts drive a local harness on :58731 (a Vite
root holding src/figures/faces/morph as src/, faceSkins.js beside it, public/faces) with
Playwright from the home checkout (portfolio/node_modules).

1. align.py: drawing onto the fitted part map by a 2D similarity on features only
   (head IoU 0.78: the drawing is more frontal than the clay).
2. fit.mjs / fit2.mjs: pose fit in the page (fitPose.js): 3D yaw and pitch plus the drawing's
   similarity, scored on head, hair and ear overlap and feature centroids. Result in
   pose.json: yaw -0.217, pitch -0.042 (head IoU 0.87, hair 0.80, ear 0.84). Tilt and smile
   keys gave nothing.
3. dump.mjs (ids at a pose), ink2.mjs (renderer frames: uDebug 1 = mass/ear/lines,
   2 = eyes/brows/mouth) -> A_d1.png, A_d2.png, handoff_ids.png at the hand-off pose.
4. landmarks.py DIR: pairs between the drawing and the ink head: outer silhouette and face
   opening by DTW, eyes, brow and mouth axes, nose and ear lines by skeleton. -> handoff.json
   (copy to src/figures/faces/morph/), landmarks.png to check.
5. frames.mjs OUT N|list, strip.py, then ffmpeg for the video. shot.mjs screenshots the page.
