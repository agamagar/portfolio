# Why the projection-fitted faces melt, ghost, show lid discs and seams (root cause)

Measured on the source asset (`tools/face3d/face.blend`, Blender 5.2.2, headless: `asset/diagnose.py`, `asset/mirror_error.py`; raw numbers in
`asset/diagnosis.json`, `asset/mirror_error.json`). Not from baked textures or renders.

## What the asset is
Skin: 28,222 verts, 37,520 tris + 9,472 quads, watertight (0 boundary, 0 non-manifold edges). Separate meshes for Hair (20.5k), Hat, Brows, Eyes, Lids,
Mouth, MouthInner, Pin. Shape keys exist only for jaw, smile, puff on Skin; blink/squint/wide on the lids; brow keys on the brow meshes; 15 of ARKit's 52.

## Findings
1. **The UVs are a camera projection, not an unwrap.** Skin has 46,992 UV islands for 47,000 faces: every face is its own island, carrying the
   screen position it had in the fitted reference photo. 96.2% of the occupied UV grid cells are claimed by two or more islands (Hair 96.4%, Hat 84%,
   Lids 65%, Mouth 66%, Brows 50-53%). Several surfaces therefore share the same texels: the cheek behind the nose, the nose flank, the far ear, a lid
   and the eye socket it covers all read the same pixels. That is the **melt** (the far cheek and ear wear the face's texels), the **ghosts** (a feature
   painted in the photo is on every surface behind it), and the **lid discs** (a lid's UV lands on the eye's hole, which the texture maker inpainted flat).
2. **Seams everywhere.** 75,224 seam edges on Skin (one per face boundary), so bilinear/mip filtering bleeds across every edge: the thin pale or dark
   lines along the nose, the sockets and the ear rim are texels from the neighbouring island, not geometry.
3. **Texel density is uniform (p5/p95 ratio 1.2), so resolution is not the problem**: each face is allotted the same tiny share (~220 px per unit),
   but only the front-facing 57% of the map (uv_area_share 0.57) is real photo; everything that faced away was filled by the texture tools, not seen.
4. **The geometry is NOT the cause of the right-side melt.** Mirror error of the Skin: median 0.0056 and 90th percentile 0.016 of a 2.4 head width
   (0.2-0.7%), max 0.07; left and right halves have the same triangle/quad counts (18,694/4,648 vs 18,826/4,824) and winding. The mesh is a near-
   symmetric sculpt whose topology is not mirrored (40% of vertices have no partner within 4 units of tolerance): shape is fine, but any per-vertex
   or per-UV fix cannot be mirrored index-for-index. (The visible right-side damage was shading: the far ear and the temple read the face's texels.)
5. **Lids are real geometry but a separate, offset mesh**: 2,388 verts each, key deltas 0.22 (blink) vs eye size ~0.19: they cover the eye on the clay
   head, but the fitted skins re-scale the head and not the lids, so cel and hose (large cartoon eyes) leave the eyeball showing.
6. **Expression coverage is thin**: 15 of 52 ARKit targets; the rest of the emotes are code (head moves, gaze, squash).

## So the fix is the asset, not the skins
One canonical head with: (a) a real UV unwrap, one island per body region, seams hidden (hairline, behind ears, under the jaw), no overlap, even density;
(b) symmetric topology (mirror-exact vertices) so the near side bakes onto the far side by index; (c) eyelid and mouth edge loops, lid geometry built
with the head and sharing its UVs and material; (d) the ARKit 52 as shape keys. Then every skin is re-baked onto that unwrap from several cameras
with coverage masks (uncovered texels mirror-filled from the covered half and cleaned), instead of one projection with patches.

## Status of the canonical head (23 Oct, headless Blender 5.2.2)
Built by `build_canonical.py` then `unwrap_canonical.py` (`canonical_head.blend`, object `SkinCanon`; checker render `uv-checker.png`):
- Symmetric: the x <= 0 half is the master; the far half is its exact mirror (28,581 verts, 47,259 faces, mirror distance 0.0, an index `mirror` attribute).
- One unwrap: islands for face, scalp, side/back, neck, nose, each ear; density now even across the face (p95/p5 ratio 21 from tiny outliers, down from a
  per-face island soup); 108 flipped faces remain (ears/nose cone) to fix; shape keys (jaw, smile L/R, puff) rebuilt on the canonical head (the first push lost them and left the mirrored half unsmoothed; fixed 23 Oct: each Left/Right key now moves one side only).
- Not yet done: ARKit 52 targets, rebuilt lid geometry with shared UVs, the other parts retopologised/unwrapped, skin re-bakes, glTF-Transform export + Khronos Validator,
  goldens approved, gate vs goldens (SSIM/LPIPS), device checks.
- `asset/lookdev.py` renders the Eevee goldens (clay first): `asset/goldens/clay/*.png`, sheet `asset/goldens/clay-turntable.png`. The head still wears the
  source hair, brows, eyes and mouth; those are the next parts to unify.
