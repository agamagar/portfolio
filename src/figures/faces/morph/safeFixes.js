// Safe automatic fixes for the face pipeline (face production gate, 22 Oct 2026).
//
// Each fix is deterministic, never lowers resolution, texture size, DPR or mesh density, and runs only when asked:
//   applyFixes(rig, { frame, lid, normals, mirrorFill, inpaint }, { renderer, THREE })
// The gate (tools/face3d/gate) turns a flag on only for a face whose check failed, and reports what ran. Nothing here
// runs in production unless a caller passes flags (the hero does not, yet: the gate decides which faces need which).
//   frame       auto-centre and scale: measure the skin's box from the ids pass at rest, then shift and zoom the camera
//               so it matches `frame.target` ({cx, cy, h} in px of the rig's W x H, the family base's box)
//   lid         (no-op: the attempt, copying the skin's material onto the lids, measured worse; see below)
//   normals     recompute normals on asymmetric verts: where a vertex's normal is not the mirror of its mirror
//               partner's, both take the average (the "melted" shading on one side)
//   mirrorFill  symmetry-aware re-projection: skin-texture texels that are holes (alpha < 250) take the colour of the
//               mirror-image texel (through the UVs of the mirror-paired vertices)
//   inpaint     small holes (<= 400 texels) in the skin texture are filled by diffusion from their border
// The pure pixel routines are exported for the gate's self test (tools/face3d/gate/selftest.mjs).

// ---- pure pixel routines (RGBA Uint8ClampedArray, w x h) -----------------------------------------------------------------
export function holeMask(d, w, h, alphaBelow = 250) { const m = new Uint8Array(w * h); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] < alphaBelow ? 1 : 0; return m; }
// fill the masked texels of small connected holes by repeated neighbour averaging; returns the number filled
export function inpaintSmallHoles(d, w, h, mask, maxArea = 400) {
  const lab = new Int32Array(w * h), comps = []; const st = [];
  for (let s = 0; s < mask.length; s++) { if (!mask[s] || lab[s]) continue; const id = comps.length + 1, px = []; lab[s] = id; st.push(s);
    while (st.length) { const i = st.pop(); px.push(i); const x = i % w; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * h - w ? i + w : -1]) if (j >= 0 && mask[j] && !lab[j]) { lab[j] = id; st.push(j); } }
    comps.push(px); }
  let filled = 0;
  for (const px of comps) { if (px.length > maxArea) continue; const todo = new Set(px);
    for (let it = 0; it < 64 && todo.size; it++) { const done = [];
      for (const i of todo) { const x = i % w; let r = 0, g = 0, b = 0, a = 0, c = 0;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * h - w ? i + w : -1]) if (j >= 0 && !todo.has(j) && d[j * 4 + 3] >= 250) { r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; a += d[j * 4 + 3]; c++; }
        if (c) done.push([i, r / c, g / c, b / c, a / c]); }
      for (const [i, r, g, b, a] of done) { d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = Math.max(250, a); todo.delete(i); filled++; } if (!done.length) break; } }
  return filled;
}
// uvA / uvB: Float32Array of 6 per triangle (the three UV corners of triangle t and of its mirror image); copies the
// mirror texel into each masked texel of the triangle (when the source texel is not itself masked); returns the count
export function mirrorFillTexels(d, w, h, mask, tris) {
  let n = 0;
  for (const [A, B] of tris) {
    const px = (u, v) => [u * w, v * h]; const [ax, ay] = px(A[0], A[1]), [bx, by] = px(A[2], A[3]), [cx, cy] = px(A[4], A[5]);
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(w - 1, Math.ceil(Math.max(ax, bx, cx))), y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy)));
    const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy); if (Math.abs(den) < 1e-9) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * w + x; if (!mask[i]) continue;
      const l1 = ((by - cy) * (x + 0.5 - cx) + (cx - bx) * (y + 0.5 - cy)) / den, l2 = ((cy - ay) * (x + 0.5 - cx) + (ax - cx) * (y + 0.5 - cy)) / den, l3 = 1 - l1 - l2;
      if (l1 < -0.01 || l2 < -0.01 || l3 < -0.01) continue;
      const su = (l1 * B[0] + l2 * B[2] + l3 * B[4]) * w, sv = (l1 * B[1] + l2 * B[3] + l3 * B[5]) * h, sx = Math.floor(su), sy = Math.floor(sv);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue; const j = sy * w + sx; if (mask[j]) continue;
      d[i * 4] = d[j * 4]; d[i * 4 + 1] = d[j * 4 + 1]; d[i * 4 + 2] = d[j * 4 + 2]; d[i * 4 + 3] = d[j * 4 + 3]; mask[i] = 0; n++; } }
  return n;
}

// ---- rig fixes -----------------------------------------------------------------------------------------------------------
// vertex -> mirror partner (x -> -x), nearest within tol, via a spatial hash
export function mirrorPairs(pos, tol = 0.025) {
  const cell = tol * 2, key = (x, y, z) => Math.floor(x / cell) + "," + Math.floor(y / cell) + "," + Math.floor(z / cell), grid = new Map();
  for (let i = 0; i < pos.count; i++) { const k = key(pos.getX(i), pos.getY(i), pos.getZ(i)); (grid.get(k) || grid.set(k, []).get(k)).push(i); }
  const pair = new Int32Array(pos.count).fill(-1);
  for (let i = 0; i < pos.count; i++) { const mx = -pos.getX(i), my = pos.getY(i), mz = pos.getZ(i); let best = -1, bd = tol * tol;
    const cx = Math.floor(mx / cell), cy = Math.floor(my / cell), cz = Math.floor(mz / cell);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) for (const j of grid.get(`${cx + a},${cy + b},${cz + c}`) || []) { const d = (pos.getX(j) - mx) ** 2 + (pos.getY(j) - my) ** 2 + (pos.getZ(j) - mz) ** 2; if (d < bd) { bd = d; best = j; } }
    pair[i] = best; }
  return pair;
}
function skinImage(tex, THREE) {
  const img = tex?.image; if (!img || !(img.width && img.height)) return null;
  const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const cx = cv.getContext("2d", { willReadFrequently: true }); cx.drawImage(img, 0, 0);
  return { cv, cx, data: cx.getImageData(0, 0, cv.width, cv.height) };
}
export function applyFixes(rig, o = {}, { THREE } = {}) {
  const info = {}; const skin = rig.parts?.Skin; if (!skin) return { skipped: "no skin" };
  if (o.lid) {
    // MEASURED WORSE (22 Oct 2026, noir/felt/stone/claySun, gate lidcover): copying the Skin material's colour, light and map uniforms onto the
    // lids raised dE from 17/4.1/9.9/5.1 to 38/8.7/21/14.7. The lids' fitted look is projected with their own camera matrices, so the skin's
    // settings do not transfer. Left as a no-op until the lid look is fitted per skin (fix list: tools/face3d/gate/FIXLIST.md).
    info.lid = "skipped: measured worse";
  }
  if (o.normals) {
    const g = skin.geometry, nor = g.attributes.normal; if (nor) { const pair = mirrorPairs(g.attributes.position); let fixed = 0;
      for (let i = 0; i < pair.length; i++) { const j = pair[i]; if (j < 0 || j < i) continue; const ax = nor.getX(i), ay = nor.getY(i), az = nor.getZ(i), bx = -nor.getX(j), by = nor.getY(j), bz = nor.getZ(j);
        if (Math.hypot(ax - bx, ay - by, az - bz) < 0.25) continue; const mx = (ax + bx) / 2, my = (ay + by) / 2, mz = (az + bz) / 2, l = Math.hypot(mx, my, mz) || 1;
        nor.setXYZ(i, mx / l, my / l, mz / l); nor.setXYZ(j, -mx / l, my / l, mz / l); fixed += 2; }
      nor.needsUpdate = true; info.normals = fixed; }
  }
  if (o.mirrorFill || o.inpaint) {
    const u = skin.userData.mats.shaded.uniforms, tex = u.uMap.value, im = skinImage(tex, THREE);
    if (im) { const { data, cv, cx } = im, w = cv.width, h = cv.height; const mask = holeMask(data.data, w, h); let filled = 0, mirrored = 0;
      if (o.mirrorFill) { const g = skin.geometry, pos = g.attributes.position, uv = g.attributes.uv, idx = g.index; const pair = mirrorPairs(pos), tris = [];
        const T = idx ? idx.count / 3 : pos.count / 3; for (let t = 0; t < T; t++) { const v = idx ? [idx.getX(t * 3), idx.getX(t * 3 + 1), idx.getX(t * 3 + 2)] : [t * 3, t * 3 + 1, t * 3 + 2]; const p = v.map((i) => pair[i]); if (p.some((i) => i < 0)) continue;
          tris.push([[uv.getX(v[0]), uv.getY(v[0]), uv.getX(v[1]), uv.getY(v[1]), uv.getX(v[2]), uv.getY(v[2])], [uv.getX(p[0]), uv.getY(p[0]), uv.getX(p[1]), uv.getY(p[1]), uv.getX(p[2]), uv.getY(p[2])]]); }
        // (the texture's rows run with flipY false, as the loader sets them: v maps straight to a row)
        mirrored = mirrorFillTexels(data.data, w, h, mask, tris); }
      if (o.inpaint) filled = inpaintSmallHoles(data.data, w, h, holeMask(data.data, w, h));
      if (mirrored || filled) { cx.putImageData(data, 0, 0); const t2 = new THREE.CanvasTexture(cv); t2.flipY = false; t2.colorSpace = tex.colorSpace; t2.magFilter = tex.magFilter; t2.minFilter = tex.minFilter; t2.generateMipmaps = tex.generateMipmaps; t2.anisotropy = tex.anisotropy; t2.needsUpdate = true;
        for (const n of ["Skin", "LidL", "LidR"]) { const uu = rig.parts[n]?.userData.mats.shaded.uniforms; if (uu?.uMap.value === tex) uu.uMap.value = t2; } }
      info.mirrorFill = mirrored; info.inpaint = filled; }
    else info.textureSkipped = "skin map not readable";
  }
  if (o.frame?.target) {
    const target = o.frame.target, cam = rig.cam, orig = rig.pose; let k = 1, dx = 0, dy = 0; const W = cam.view?.fullWidth, H = cam.view?.fullHeight; const ox0 = cam.view?.offsetX || 0, oy0 = cam.view?.offsetY || 0;
    const apply = () => { cam.zoom *= k; cam.setViewOffset(W, H, ox0 + dx, oy0 + dy, W, H); cam.updateProjectionMatrix(); };
    rig.pose = (p) => { orig(p); apply(); };
    // box: the skin's current box {cx, cy, h} at rest, measured by the caller from the ids pass; called until it converges
    // (two rounds: the zoom first moves the box, so the shift is measured after it)
    rig.frameFix = (box) => { k *= target.h / box.h; dx += box.cx - target.cx; dy += box.cy - target.cy; info.frame = { k, dx, dy }; };
    info.frame = "armed";
  }
  return info;
}
