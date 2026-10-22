// The checks. Each takes a ctx { get(caseName) -> {w,h,rgba,id}, has(name), meta, dir, face } and returns
// { value, unit, worst: caseName|null, mask?: Uint8Array (flagged pixels in worst case) , note? } or null when
// the cases it needs are not in the cache (fast subset). Thresholds live in thresholds.json.
import { W, H, lumaMap, luma, lab, dE, dilate, erode, and, andNot, or, invert, count, maskOf, bbox, floodBorder, components, boxDown, composite } from "./imgops.mjs";
const ID = { Skin: 1, Hair: 2, EyeL: 3, EyeR: 4, BrowL: 5, BrowR: 6, Mouth: 7, Ear: 8 };
const isSkin = (id) => id === 1 || id === 8;
const alphaMask = (img, t = 128) => maskOf(img.w * img.h, (i) => img.rgba[i * 4 + 3] >= t);
const idMask = (img, ...ids) => maskOf(img.w * img.h, (i) => ids.includes(img.id[i]));
const per10k = (n, area) => (n / Math.max(1, area)) * 1e4;
const medianLab = (img, mask) => { const L = [], A = [], B = []; for (let i = 0; i < mask.length; i += 3) if (mask[i]) { const l = lab(img.rgba[i * 4], img.rgba[i * 4 + 1], img.rgba[i * 4 + 2]); L.push(l[0]); A.push(l[1]); B.push(l[2]); }
  const med = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1] ?? 0; }; return L.length < 20 ? null : [med(L), med(A), med(B)]; };
const SKIN_CASES = ["rest_front", "rest_q3L", "rest_q3R", "rest_up", "rest_down"];
const ALL = (ctx) => ctx.meta.cases.filter((c) => !c.startsWith("flick"));

// 1. holes and alpha gaps inside the silhouette (enclosed transparent pixels, translucent interior)
export function holes(ctx) {
  let best = null;
  for (const name of ALL(ctx)) { const img = ctx.get(name); const A = alphaMask(img, 128), n = A.length;
    const outside = floodBorder(invert(A), W, H); const enclosed = maskOf(n, (i) => !A[i] && !outside[i]);
    const nearBg = dilate(maskOf(n, (i) => outside[i]), W, H, 4);
    const transl = maskOf(n, (i) => { const a = img.rgba[i * 4 + 3]; return a > 8 && a < 240 && !nearBg[i]; });
    // only gaps in the face's own territory: inside the closing of the skin (the space between hair strands, inside a hoop earring and under a braid is open air)
    const skinM = maskOf(n, (i) => isSkin(img.id[i]) && A[i]); const closed = erode(dilate(skinM, W, H, 14), W, H, 14);
    const bad = or(and(enclosed, closed), and(transl, maskOf(n, (i) => img.id[i] === 1 || img.id[i] === 8))); const v = per10k(count(bad), count(A));
    if (!best || v > best.value) best = { value: v, worst: name, mask: bad, note: `enclosed ${count(enclosed)}px, translucent ${count(transl)}px` };
  }
  return { unit: "px per 10k", ...best };
}
// 2. NaN / black pixels: dark specks on skin, fully black skin areas
export function blackpix(ctx) {
  let best = null;
  for (const name of ALL(ctx)) { const img = ctx.get(name), L = lumaMap(img), n = L.length, A = alphaMask(img);
    const skin = maskOf(n, (i) => isSkin(img.id[i]) && A[i]); const sk = erode(skin, W, H, 3);
    const bad = new Uint8Array(n);
    for (let y = 4; y < H - 4; y++) for (let x = 4; x < W - 4; x++) { const i = y * W + x; if (!sk[i] || L[i] > 22) continue;
      const ring = (L[i - 4] + L[i + 4] + L[i - 4 * W] + L[i + 4 * W]) / 4; if (ring > 70) bad[i] = 1; }
    const dead = maskOf(n, (i) => A[i] && img.rgba[i * 4] + img.rgba[i * 4 + 1] + img.rgba[i * 4 + 2] === 0 && isSkin(img.id[i]));
    const all = or(bad, dilate(dead, W, H, 0)); const v = per10k(count(all), count(skin));
    if (!best || v > best.value) best = { value: v, worst: name, mask: dilate(all, W, H, 1) };
  }
  return { unit: "px per 10k skin", ...best };
}
// 3. texture stretch from the geometry (UV density and the fit-camera projection), left vs right
export function stretch(ctx) {
  const g = ctx.meta.load?.geo?.Skin; if (!g) return null;
  return { unit: "|L-R| area share (proj)", value: g.projStretchAsym, worst: null, extra: { projStretchFrac: g.projStretchFrac, uvStretchFrac: g.uvStretchFrac, uvStretchAsym: g.uvStretchAsym, uvDensP95: g.uvDensP95, asymNormalFrac: g.asymNormalFrac, unpairedFrac: g.unpairedFrac } };
}
// 4. left/right symmetry on skin: mirror 3/4-left against 3/4-right (aligned on skin centroid) and diff;
//    and the left/right detail (gradient) ratio at each view: a smeared ("melted") side has far less detail
export function symmetry(ctx) {
  if (!ctx.has("rest_q3L") || !ctx.has("rest_q3R")) return null;
  const a = ctx.get("rest_q3L"), b = ctx.get("rest_q3R"), La = lumaMap(a), Lb = lumaMap(b);
  const sa = maskOf(La.length, (i) => isSkin(a.id[i]) && a.rgba[i * 4 + 3] > 200), sb = maskOf(Lb.length, (i) => isSkin(b.id[i]) && b.rgba[i * 4 + 3] > 200);
  const cen = (m) => { let sx = 0, c = 0; for (let i = 0; i < m.length; i++) if (m[i]) { sx += i % W; c++; } return c ? sx / c : W / 2; };
  const ca = cen(sa), cb = cen(sb); let sum = 0, c = 0; const bad = new Uint8Array(La.length);
  // 5x5 mean to ignore pixel noise
  const blur = (L) => { const o = new Float32Array(L.length); for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { let s = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) s += L[(y + dy) * W + x + dx]; o[y * W + x] = s / 25; } return o; };
  const Ba = blur(La), Bb = blur(Lb);
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const i = y * W + x; if (!sa[i]) continue; const xb = Math.round(cb - (x - ca)); if (xb < 2 || xb >= W - 2) continue; const j = y * W + xb; if (!sb[j]) continue; const d = Math.abs(Ba[i] - Bb[j]); sum += d; c++; if (d > 40) bad[i] = 1; }
  const mirror = c > 500 ? sum / c / 255 : 0;
  // detail ratio, per view
  let worstRatio = 0, wv = null;
  for (const name of ["rest_front", "rest_q3L", "rest_q3R", "rest_up", "rest_down"]) { if (!ctx.has(name)) continue; const im = ctx.get(name), L = lumaMap(im), sk = maskOf(L.length, (i) => isSkin(im.id[i]) && im.rgba[i * 4 + 3] > 200), er = erode(sk, W, H, 6);
    const cx = cen(sk); let gl = 0, gr = 0, nl = 0, nr = 0;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (!er[i]) continue; const g = Math.abs(L[i + 1] - L[i - 1]) + Math.abs(L[i + W] - L[i - W]); if (x < cx) { gl += g; nl++; } else { gr += g; nr++; } }
    if (nl > 800 && nr > 800) { const r = Math.abs(Math.log((gl / nl + 0.5) / (gr / nr + 0.5))); if (r > worstRatio) { worstRatio = r; wv = name; } } }
  return { unit: "mean |mirror diff| /255", value: mirror, worst: "rest_q3L", mask: bad, extra: { detailLogRatio: worstRatio, detailView: wv } };
}
// 5. seams / thin line artefacts on skin (pale or dark thin ridges, >= 25 px long), outside the features
export function seams(ctx) {
  let best = null;
  for (const name of SKIN_CASES) { if (!ctx.has(name)) continue; const img = ctx.get(name), L = lumaMap(img), n = L.length;
    const skin = maskOf(n, (i) => isSkin(img.id[i]) && img.rgba[i * 4 + 3] > 250); const feat = dilate(maskOf(n, (i) => img.id[i] >= 3 && img.id[i] <= 7 || img.id[i] === 0), W, H, 8);
    const zone = andNot(erode(skin, W, H, 6), feat), flag = new Uint8Array(n);
    const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let y = 6; y < H - 6; y++) for (let x = 6; x < W - 6; x++) { const i = y * W + x; if (!zone[i]) continue;
      for (const [tx, ty] of dirs) { const nx = -ty, ny = tx, k = 2;
        const a = L[(y + ny * k) * W + x + nx * k], b = L[(y - ny * k) * W + x - nx * k], c = (a + b) / 2 - L[i];
        if (Math.abs(c) < 14 || Math.abs(a - b) > Math.abs(c)) continue;
        const f = L[(y + ty * 4) * W + x + tx * 4], g = L[(y - ty * 4) * W + x - tx * 4];
        if (Math.abs((f + g) / 2 - L[i]) < Math.abs(c) * 0.5) { flag[i] = 1; break; } } }
    const cc = components(dilate(flag, W, H, 1), W, H), bad = maskOf(n, (i) => flag[i] && cc.sizes[cc.lab[i]] >= 40);
    const v = per10k(count(bad), count(zone));
    if (!best || v > best.value) best = { value: v, worst: name, mask: dilate(bad, W, H, 1) };
  }
  return best && { unit: "line px per 10k skin", ...best };
}
// 6. lid coverage at blink: the lid's colour must match the surrounding skin (no pale discs), and the eye must be covered
export function lidcover(ctx) {
  if (!ctx.has("rest_front") || !ctx.has("blinkclosed_front")) return null;
  const rest = ctx.get("rest_front"); const eyes = idMask(rest, ID.EyeL, ID.EyeR); if (count(eyes) < 40) return { unit: "dE vs skin", value: 0, worst: null, note: "no eyes in ids" };
  const region = dilate(eyes, W, H, 4), ring = andNot(dilate(eyes, W, H, 22), dilate(eyes, W, H, 9));
  // glasses, brows, hair and the mouth overlap the eye area on some faces: keep their pixels (and 3 px around) out of both samples
  const other = dilate(maskOf(W * H, (i) => [2, 5, 6, 7].includes(rest.id[i])), W, H, 3);
  let best = null;
  for (const name of ["blinkclosed_front", "blinkclosed_q3L", "blinkclosed_q3R", "blinkmid_front"]) { if (!ctx.has(name)) continue;
    const img = ctx.get(name); const q3 = name.includes("q3"); if (q3) continue; // the 3/4 views move the eyes; they are checked by `ghosts`/`framing`
    const otherNow = dilate(maskOf(W * H, (i) => [2, 5, 6, 7].includes(img.id[i])), W, H, 3);
    const okPx = maskOf(region.length, (i) => isSkin(img.id[i]) && img.rgba[i * 4 + 3] > 200 && !other[i] && !otherNow[i]);
    const lid = and(region, okPx), ringSkin = and(ring, okPx);
    const eyeLeft = count(and(region, idMask(img, ID.EyeL, ID.EyeR))) / count(eyes);
    const lc = medianLab(img, lid), rc = medianLab(img, ringSkin); if (!lc || !rc) continue;
    const dl = lc[0] - rc[0], de = dE(lc, rc);
    const closed = name.startsWith("blinkclosed");
    // a closed blink must hide the eye; the lid colour must be the skin's. Score = dE, plus 40 per unit of eye still showing
    const v = de + (closed ? 40 * Math.max(0, eyeLeft - 0.1) : 0);
    // flagged = lid pixels that differ from the ring
    const bad = maskOf(region.length, (i) => lid[i] && dE(lab(img.rgba[i * 4], img.rgba[i * 4 + 1], img.rgba[i * 4 + 2]), rc) > 8);
    if (!best || v > best.value) best = { value: v, worst: name, mask: dilate(bad, W, H, 1), note: `dL ${dl.toFixed(1)} (lid minus skin), dE ${de.toFixed(1)}, eye still visible ${(eyeLeft * 100).toFixed(0)}%` };
  }
  return best && { unit: "dE lid vs skin", ...best };
}
// 7. leftover baked features during emotes: where the eyes, brows, mouth rest, and an emote has moved them away,
//    the pixels must look like skin
export function ghosts(ctx) {
  if (!ctx.has("rest_front")) return null;
  const rest = ctx.get("rest_front"), n = W * H;
  const feats = { eyes: idMask(rest, ID.EyeL, ID.EyeR), brows: idMask(rest, ID.BrowL, ID.BrowR), mouth: idMask(rest, ID.Mouth) };
  const refSkin = maskOf(n, (i) => isSkin(rest.id[i]) && rest.rgba[i * 4 + 3] > 250), refLab = medianLab(rest, erode(refSkin, W, H, 10));
  let best = null;
  for (const name of ctx.meta.cases.filter((c) => c.startsWith("emote_") || c.startsWith("blinkclosed_front"))) {
    const img = ctx.get(name); const L = [];
    for (const [fname, fm] of Object.entries(feats)) { if (count(fm) < 30) continue;
      const nowFeat = dilate(maskOf(n, (i) => (img.id[i] >= 3 && img.id[i] <= 7) || (img.id[i] === 0 && img.rgba[i * 4 + 3] > 200)), W, H, 5);
      const residue = and(andNot(fm, nowFeat), maskOf(n, (i) => isSkin(img.id[i]) && img.rgba[i * 4 + 3] > 200));
      const area = count(residue); if (area < 60) continue;
      const sk = maskOf(n, (i) => isSkin(img.id[i]) && img.rgba[i * 4 + 3] > 250), localRef = medianLab(img, andNot(sk, dilate(or(fm, nowFeat), W, H, 10))) || refLab;
      const bad = maskOf(n, (i) => residue[i] && dE(lab(img.rgba[i * 4], img.rgba[i * 4 + 1], img.rgba[i * 4 + 2]), localRef) > 22);
      const frac = count(bad) / area * 100; L.push({ fname, frac, bad, area }); }
    for (const r of L) if (!best || r.frac > best.value) best = { value: r.frac, worst: name, mask: dilate(r.bad, W, H, 2), note: `${r.fname} ghost in ${name}: ${r.frac.toFixed(0)}% of ${r.area}px` };
  }
  return best && { unit: "% of vacated feature px not skin-coloured", ...best };
}
// 8. framing: skin bbox centred and the same scale as the family's base; nothing cropped by the frame
export const eyeAnchor = (img) => { const m = maskOf(W * H, (i) => img.id[i] === 3 || img.id[i] === 4); let sx = 0, sy = 0, c = 0, x0 = W, x1 = -1; for (let i = 0; i < m.length; i++) if (m[i]) { const x = i % W; sx += x; sy += (i / W) | 0; c++; if (x < x0) x0 = x; if (x > x1) x1 = x; } return c > 20 ? { cx: sx / c, cy: sy / c, span: x1 - x0 } : null; };
export function framing(ctx) {
  if (!ctx.has("rest_front")) return null;
  const img = ctx.get("rest_front"), sk = maskOf(W * H, (i) => isSkin(img.id[i]) && img.rgba[i * 4 + 3] > 128), box = bbox(sk, W, H), sil = bbox(alphaMask(img, 128), W, H);
  if (!box || !sil) return { unit: "offset+scale", value: 9, worst: "rest_front", note: "no face drawn" };
  const base = ctx.base?.framing; let off = 0, sc = 1;
  if (base) { off = Math.max(Math.abs(box.cx - base.cx) / W, Math.abs(box.cy - base.cy) / H); sc = box.h / base.h; }
  let crop = 0, cropCase = null;
  for (const name of ctx.meta.cases.filter((c) => c === "rest_front" || c.startsWith("emote_"))) { const im = ctx.get(name), d = im.rgba; let hit = 0;
    for (let x = 0; x < W; x++) { if (d[(0 * W + x) * 4 + 3] > 20 || d[((H - 1) * W + x) * 4 + 3] > 20) hit++; } for (let y = 0; y < H; y++) { if (d[(y * W) * 4 + 3] > 20 || d[(y * W + W - 1) * 4 + 3] > 20) hit++; }
    if (hit > crop) { crop = hit; cropCase = name; } }
  let scale = Math.abs(Math.log(sc)), eyeNote = "";
  // the eyes are the anchor that headwear and hair cannot move: a preset is judged by them alone, a skin by the larger of the two
  const ea = eyeAnchor(img), eb = ctx.base?.eyes; let eoff = 0, esc = 1;
  if (ea && eb) { eoff = Math.max(Math.abs(ea.cx - eb.cx) / W, Math.abs(ea.cy - eb.cy) / H); esc = ea.span / eb.span; eyeNote = `; eyes off ${(eoff * 100).toFixed(1)}%, span x${esc.toFixed(2)}`; }
  const bs = ctx.base?.sil;
  // a preset moves the head's shape, hair and headwear (and so the skin box and the eyes) on purpose: judge it by its whole silhouette against the soft-clay base
  if (ctx.meta.preset && bs) { off = Math.max(Math.abs(sil.cx - bs.cx) / W, Math.abs(sil.cy - bs.cy) / H); sc = sil.h / bs.h; scale = Math.abs(Math.log(sc)); eyeNote = `; silhouette c(${sil.cx.toFixed(0)},${sil.cy.toFixed(0)}) h${sil.h} vs base`; } else if (ea && eb) { off = Math.max(off, eoff); scale = Math.max(scale, Math.abs(Math.log(esc))); }
  const v = off * 100 + scale * 50 + (crop > 0 ? 6 : 0);
  return { unit: "centre off %·1 + |ln scale|·50 + 5 if cropped", value: v, worst: crop > 0 ? cropCase : "rest_front", note: `bbox c(${box.cx.toFixed(0)},${box.cy.toFixed(0)}) h${box.h}; centre off ${(off * 100).toFixed(1)}%, scale x${sc.toFixed(2)} of base${eyeNote}, cropped px ${crop}`, extra: { box, sil, off, sc, crop } };
}
// 9. edge aliasing and halo at 83 px, both themes
export function edges83(ctx) {
  let best = null;
  for (const name of ["rest_front", "rest_q3L", "rest_q3R"]) { if (!ctx.has(name)) continue;
    const s = boxDown(ctx.get(name), 83), w = s.w, h = s.h, n = w * h, d = s.rgba; const A = (i) => d[i * 4 + 3];
    let boundary = 0, partial = 0, halo = 0; const bad = new Uint8Array(n);
    const themes = [composite(s, [242, 242, 242]), composite(s, [18, 18, 18])];
    for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) { const i = y * w + x, a = A(i);
      const near = [i - 1, i + 1, i - w, i + w]; const isB = a >= 128 && near.some((j) => A(j) < 128); if (isB) boundary++;
      if (a > 25 && a < 230) { partial++;
        // interior neighbour colour (alpha >= 240 within 2 px)
        let r = 0, g = 0, b = 0, c = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = i + dy * w + dx; if (A(j) >= 240) { r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; c++; } }
        if (c) { const un = dE(lab(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]), lab(r / c, g / c, b / c)); let fr = 0;
          themes.forEach((t, k) => { const lc = luma(t.rgba[i * 4], t.rgba[i * 4 + 1], t.rgba[i * 4 + 2]), li = luma(r / c, g / c, b / c), lb = k ? 18 : 242; if (k ? lc > Math.max(li, lb) + 22 : lc < Math.min(li, lb) - 22) fr = 1; });
          if (un > 38 || fr) { halo++; bad[i] = 1; } } } }
    const aa = boundary ? partial / boundary : 1, hv = partial ? halo / partial * 100 : 0;
    if (!best || hv > best.value) best = { value: hv, worst: name, note: `83px: aa coverage ${aa.toFixed(2)} partial/boundary, halo ${hv.toFixed(1)}% of ${partial} edge px`, extra: { aa, scaleMask: bad, w, h } };
  }
  if (best) best.mask = null; return best && { unit: "% edge px with halo/fringe", ...best };
}
export function aliasing(ctx) { const r = edges83(ctx); return r && { unit: "partial-alpha px / boundary px", value: r.extra.aa, worst: r.worst, note: r.note }; }
// 10. exposure and colour at rest: clipping, crushed blacks, and the mean skin against the declared base
export function exposure(ctx) {
  if (!ctx.has("rest_front")) return null;
  const img = ctx.get("rest_front"), n = W * H, sk = maskOf(n, (i) => isSkin(img.id[i]) && img.rgba[i * 4 + 3] > 250), er = erode(sk, W, H, 4);
  let clip = 0, crush = 0, c = 0, sum = 0; const bad = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (er[i]) { const r = img.rgba[i * 4], g = img.rgba[i * 4 + 1], b = img.rgba[i * 4 + 2], l = luma(r, g, b); c++; sum += l;
    if (r > 250 && g > 250 && b > 250) { clip++; bad[i] = 1; } if (l < 4) { crush++; bad[i] = 1; } }
  if (!c) return { unit: "% clipped or crushed", value: 100, worst: "rest_front", note: "no skin px" };
  const base = ctx.meta.declaredSkinLuma, ratio = base ? sum / c / base : null;
  const v = (clip + crush) / c * 100;
  return { unit: "% clipped/crushed skin px", value: v, worst: "rest_front", mask: bad, note: `skin luma ${(sum / c).toFixed(0)}${ratio ? `, ${ratio.toFixed(2)}x declared base` : ""}`, extra: { skinLuma: sum / c, ratio } };
}
// 11. z-fighting / flicker across 3 consecutive frames (second difference), and determinism of an identical re-render
export function flicker(ctx) {
  if (!ctx.has("flick0") || !ctx.has("flick2")) return null;
  const a = ctx.get("flick0"), b = ctx.get("flick1"), c = ctx.get("flick2"), La = lumaMap(a), Lb = lumaMap(b), Lc = lumaMap(c); const same = ctx.has("flickSame") ? lumaMap(ctx.get("flickSame")) : null;
  let bad = 0, area = 0, nd = 0; const mask = new Uint8Array(La.length);
  // surfaces only: skin and hair interiors, 3 px in from every edge (a thin strand or an outline moves a pixel under a drift; a z-fight does not need an edge)
  const solid = erode(maskOf(La.length, (i) => a.rgba[i * 4 + 3] >= 250 && b.rgba[i * 4 + 3] >= 250 && c.rgba[i * 4 + 3] >= 250), W, H, 3);
  for (let i = 0; i < La.length; i++) { if (!solid[i]) continue; area++;
    if (Math.abs(Lb[i] - (La[i] + Lc[i]) / 2) > 26) { bad++; mask[i] = 1; } if (same && Math.abs(same[i] - Lb[i]) > 6) nd++; }
  return { unit: "px per 10k (2nd difference > 26)", value: per10k(bad, area), worst: "flick1", mask: dilate(mask, W, H, 1), note: `identical re-render differs on ${per10k(nd, area).toFixed(1)} px/10k`, extra: { nondeterministic: per10k(nd, area) } };
}
// 12. console / WebGL errors during load and render
export function errors(ctx) {
  const m = ctx.meta, errs = m.logs.filter((l) => /^(error|pageerror)/.test(l) && !/agentation|4747|favicon/i.test(l)), warns = m.logs.filter((l) => /^warn/.test(l) && /THREE|shader|WebGL/i.test(l));
  return { unit: "errors", value: errs.length + m.glErrors.length + (m.fatal ? 1 : 0) + warns.length * 0.1, worst: null, note: [...errs.slice(0, 2), ...m.glErrors.slice(0, 2), m.fatal || "", ...warns.slice(0, 1)].filter(Boolean).join(" | ").slice(0, 300) };
}
// 13. load time and memory (software GL on this machine: the time is relative, the memory is real)
export function loadmem(ctx) {
  const l = ctx.meta.load; if (!l) return null;
  return { unit: "s load", value: l.ms / 1000, worst: null, note: `${l.textures} textures, ${l.texMB.toFixed(0)} MB texture memory, ${l.geometries} geometries`, extra: { texMB: l.texMB } };
}
// 14. parts: every part the face wears is built, visible, drawn, and attached to the head (no floating pieces). parts.mjs fills parts.json
import fs from "node:fs";
const partsOf = (ctx) => { const p = `${ctx.dir}/parts.json`; return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; };
export function parts(ctx) {
  const r = partsOf(ctx); if (!r) return null; const c = r.chromium || Object.values(r)[0]; if (!c) return null;
  if (c.error) return { unit: "problems", value: 9, worst: null, note: "inspect failed: " + c.error };
  // floating = a piece further from the skin than its slot allows (head heights): hair strands and braids hang free by design, earrings dangle
  const TOL = { Hair: 1.0, Earring: 0.3, Headwear: 0.3, Beard: 0.2 }, probs = c.problems.filter((p) => !/floating/.test(p));
  for (const [name, part] of Object.entries(c.parts)) { const bad = (part.floating || []).filter((f) => f.gap > (TOL[name] ?? 0.06)); if (bad.length) probs.push(`${name}: ${bad.length} floating piece(s) (${bad.slice(0, 3).map((f) => f.verts + "v @" + f.gap + " head heights").join(", ")})`); }
  return { unit: "problems", value: probs.length, worst: null, note: probs.join("; ").slice(0, 400) };
}
// 15. the same parts in every browser the gate ran (chromium and webkit): present, same piece count, drawn pixel counts within 35%
export function browsers(ctx) {
  const r = partsOf(ctx); if (!r) return null; const names = Object.keys(r); if (names.length < 2) return { unit: "mismatches", value: 0, worst: null, note: "only " + names.join(",") + " ran" };
  const [a, b] = [r[names[0]], r[names[1]]]; const diffs = [];
  if (a.error || b.error) return { unit: "mismatches", value: 9, worst: null, note: names.map((n) => `${n}: ${r[n].error || "ok"}`).join(" | ") };
  for (const k of new Set([...Object.keys(a.parts), ...Object.keys(b.parts)])) { const pa = a.parts[k], pb = b.parts[k]; if (!pa || !pb || !!pa.present !== !!pb.present) { diffs.push(`${k}: present in ${pa?.present ? names[0] : names[1]} only`); continue; }
    if (pa.pieces !== pb.pieces) diffs.push(`${k}: ${pa.pieces} vs ${pb.pieces} pieces`);
    if (pa.drawnPx != null && pb.drawnPx != null && Math.abs(pa.drawnPx - pb.drawnPx) > 40 && Math.abs(pa.drawnPx - pb.drawnPx) / Math.max(pa.drawnPx, pb.drawnPx) > 0.35) diffs.push(`${k}: drawn ${pa.drawnPx}px (${names[0]}) vs ${pb.drawnPx}px (${names[1]})`); }
  return { unit: "mismatches " + names.join(" vs "), value: diffs.length, worst: null, note: diffs.join("; ").slice(0, 400) };
}

export const CHECKS = { holes, blackpix, stretch, symmetry, seams, lidcover, ghosts, framing, aliasing, edges83, exposure, flicker, errors, loadmem, parts, browsers };
