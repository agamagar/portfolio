// Page side of the face production gate. The SAME rig the homepage hero wears (faceRig3D.createFaceRig,
// shaded pass = what the hero draws) posed by the hero's own emotes (emotes.js toPose), plus its ids pass for
// part masks. Nothing here is a lab path: no debug shaders, no extra lights.
import * as THREE from "three";
import { createFaceRig } from "/src/figures/faces/morph/faceRig3D.js";
import { resolveFace, PRESETS } from "/src/figures/faces/features/core.js";
import { SKINS } from "/src/figures/faces/faceSkins.js";
import { EMOTES, sample, toPose } from "/src/figures/faces/morph/emotes.js";
import { applyFixes } from "/src/figures/faces/morph/safeFixes.js";

export const W = 802, H = 862;
const canvas = document.createElement("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
const gl = renderer.getContext();
const copy = document.createElement("canvas"); copy.width = W; copy.height = H;
const cx = copy.getContext("2d", { willReadFrequently: true });

const cfg = { clay: { W, H }, noir: { W, H, src: "/faces/face-noir.glb", fitSrc: "/faces/fit-noir.json", idSrc: null, rawSrc: "/faces/skin-raw-noir.png", marginSrc: "/faces/margins-noir.png", cleanSrc: "/faces/skin-clean-noir.png", skinId: "noir", hat: true } };
for (const sk of SKINS) if (!cfg[sk.id]) cfg[sk.id] = sk.rig
  ? { W, H, src: sk.rig.src, fitSrc: sk.rig.fit, idSrc: sk.rig.idmap || null, rawSrc: sk.rig.raw || null, marginSrc: sk.rig.margins || null, cleanSrc: null, skinId: sk.id }
  : { W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: sk.id, mode: sk.mode };
cfg.plast = { face: resolveFace(PRESETS["agam-clay"]), W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: "plast", hat: true, procedural: true };

// every face the gate certifies: each skin, and each preset (the curated Desi-Log combos) worn on the soft-clay rig
export const faces = () => [
  ...Object.keys(cfg).filter((id) => id !== "plast").map((id) => ({ id, skin: id, preset: null })),
  { id: "plast", skin: "plast", preset: "agam-clay" },
  ...Object.keys(PRESETS).filter((p) => p !== "agam-clay").map((p) => ({ id: "plast:" + p, skin: "plast", preset: p })),
];
// the files a skin's look depends on (hashed node-side for the incremental cache)
export const assetsOf = (skin) => { const c = cfg[skin]; return [c.src, c.fitSrc, c.idSrc, c.rawSrc, c.marginSrc, c.cleanSrc].filter(Boolean).concat(skin === "plast" || !c.src ? ["/faces/face.glb", "/faces/fit.json"] : []); };
export const presetJson = (p) => JSON.stringify(PRESETS[p]);
export const emoteNames = Object.keys(EMOTES);
export const emotePeak = Object.fromEntries(Object.entries(EMOTES).map(([k, [, fr]]) => [k, fr[1][0]]));

let cur = null, rig = null, logs = [], fixOpts = null;
const origErr = console.error, origWarn = console.warn;
console.error = (...a) => { logs.push("error: " + a.join(" ").slice(0, 300)); origErr(...a); };
console.warn = (...a) => { logs.push("warn: " + a.join(" ").slice(0, 300)); origWarn(...a); };
addEventListener("error", (e) => logs.push("pageerror: " + String(e.message).slice(0, 300)));
export const setFixes = (o) => { fixOpts = o; };
export const takeLogs = () => logs.splice(0);

// load one face; returns load ms, memory, geometry stats
export async function load(id) {
  const f = faces().find((x) => x.id === id);
  if (cur && cur !== f.skin) { rig?.dispose?.(); rig = null; }
  logs = [];
  const heap0 = performance.memory?.usedJSHeapSize || 0, t0 = performance.now();
  if (!rig || cur !== f.skin) { rig = createFaceRig(cfg[f.skin]); cur = f.skin; await rig.ready; }
  if (f.preset) rig.setFace(resolveFace(PRESETS[f.preset]));
  let fixInfo = null;
  if (fixOpts) {
    const o = { ...fixOpts }; if (o.frame) o.frame = { target: fixOpts.frame.targets[f.skin === "plast" ? "plast" : "clay"] };
    fixInfo = applyFixes(rig, o, { renderer, THREE });
    if (o.frame?.target && rig.frameFix) for (let r = 0; r < 3; r++) { rig.pose({}); const b = skinBox(); if (!b) break; rig.frameFix(b); }
  }
  rig.pose({}); rig.shaded(renderer, null);
  const ms = performance.now() - t0;
  const info = renderer.info.memory;
  let texBytes = 0; const seen = new Set();
  rig.scene.traverse((o) => { const u = o.material?.uniforms; if (u) for (const v of Object.values(u)) { const t = v.value; if (t?.isTexture && t.image && !seen.has(t)) { seen.add(t); texBytes += (t.image.width || 1) * (t.image.height || 1) * 4 * (t.generateMipmaps ? 1.33 : 1); } } });
  const sk = SKINS.find((x) => x.id === f.skin), hex = !f.preset || f.preset === "agam-clay" ? sk?.parts?.Skin?.base : null;
  const declaredSkinLuma = hex ? (parseInt(hex.slice(1, 3), 16) * 0.2126 + parseInt(hex.slice(3, 5), 16) * 0.7152 + parseInt(hex.slice(5, 7), 16) * 0.0722) : null;
  return { declaredSkinLuma, ms, geometries: info.geometries, textures: info.textures, texMB: texBytes / 1048576, heapMB: ((performance.memory?.usedJSHeapSize || 0) - heap0) / 1048576, geo: geometryStats(), fixInfo };
}

// the skin's box in px at rest, from the ids pass (the same definition the framing check uses: ids 1 and 8, alpha >= 128)
function skinBox() {
  rig.ids(renderer, null); const d = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, d); rig.shaded(renderer, null);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const r = d[((H - 1 - y) * W + x) * 4]; if (r === 1 || r === 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  return x1 < 0 ? null : { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, h: y1 - y0 + 1 };
}
// pose a case: { emote, t, yaw, pitch }
function poseCase(c) {
  const s = c.emote ? sample(EMOTES[c.emote][1], c.t) : sample(EMOTES.blink[1], 0);
  rig.pose({ ...toPose(s), yaw: c.yaw || 0, pitch: c.pitch || 0 });
}
const grab = () => {
  cx.clearRect(0, 0, W, H); cx.drawImage(canvas, 0, 0);
  const d = cx.getImageData(0, 0, W, H).data;
  let s = ""; const CH = 0x8000; for (let i = 0; i < d.length; i += CH) s += String.fromCharCode.apply(null, d.subarray(i, i + CH));
  return btoa(s);
};
// returns base64 RGBA of the shaded pass and (ids:true) of the ids pass, plus GL errors raised
export function shot(c, ids = true) {
  poseCase(c);
  rig.shaded(renderer, null);
  const rgba = grab();
  let idp = null;
  if (ids) { rig.ids(renderer, null); idp = grab(); rig.shaded(renderer, null); }
  const err = gl.getError();
  return { rgba, ids: idp, glError: err };
}

// ---- geometry: texture stretch ------------------------------------------------------------------
// For the skin mesh at rest: (a) UV density = uv area / surface area per triangle; (b) projection stretch =
// surface area / area seen from the fit camera (1/|n.v|): the fitted textures are camera projections, so a
// face turned away from the fit camera is stretched. Both compared between mirror-image triangles
// (x -> -x): a melted side is a stretch that the other side doesn't share.
function geometryStats() {
  const out = {};
  const camPos = rig.cam.position.clone();
  for (const name of ["Skin"]) {
    const m = rig.parts[name]; if (!m) continue;
    m.updateMatrixWorld(true);
    const g = m.geometry, pos = g.attributes.position, uv = g.attributes.uv, idx = g.index;
    if (!pos) continue;
    const n = idx ? idx.count / 3 : pos.count / 3;
    const P = (i) => new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
    const tri = (t) => idx ? [idx.getX(t * 3), idx.getX(t * 3 + 1), idx.getX(t * 3 + 2)] : [t * 3, t * 3 + 1, t * 3 + 2];
    const rec = [];
    const a = new THREE.Vector3(), b = new THREE.Vector3(), nrm = new THREE.Vector3(), v = new THREE.Vector3();
    for (let t = 0; t < n; t++) {
      const [i, j, k] = tri(t);
      const A = P(i), B = P(j), C = P(k);
      a.subVectors(B, A); b.subVectors(C, A); nrm.crossVectors(a, b);
      const area = nrm.length() / 2; if (area < 1e-9) continue;
      const cen = A.clone().add(B).add(C).multiplyScalar(1 / 3);
      v.subVectors(camPos, cen).normalize();
      const facing = nrm.clone().normalize().dot(v);
      let uvA = 0;
      if (uv) { const u0 = uv.getX(i), v0 = uv.getY(i); uvA = Math.abs((uv.getX(j) - u0) * (uv.getY(k) - v0) - (uv.getX(k) - u0) * (uv.getY(j) - v0)) / 2; }
      rec.push({ x: cen.x, y: cen.y, z: cen.z, area, dens: uvA / area, proj: facing > 0.02 ? 1 / facing : null, facing });
    }
    // object-space x of the model is the face's symmetry axis (cen.x in world space; the model sits at x=0)
    const med = (arr) => { const s = arr.filter(Number.isFinite).sort((p, q) => p - q); return s[Math.floor(s.length / 2)] || 0; };
    const mDens = med(rec.map((r) => r.dens).filter((d) => d > 0));
    const stretchOf = (r) => r.dens > 0 ? Math.abs(Math.log(r.dens / mDens)) : null;
    const front = rec.filter((r) => r.facing > 0.02);
    const L = front.filter((r) => r.x < -0.05), R = front.filter((r) => r.x > 0.05);
    const frac = (arr, f) => arr.length ? arr.reduce((s, r) => s + (f(r) ? r.area : 0), 0) / arr.reduce((s, r) => s + r.area, 0) : 0;
    const uvBad = (r) => (stretchOf(r) ?? 0) > Math.log(3);
    const projBad = (r) => r.proj != null && r.proj > 3;
    out[name] = {
      tris: rec.length, uvStretchFrac: frac(front, uvBad), projStretchFrac: frac(front, projBad),
      uvStretchAsym: Math.abs(frac(L, uvBad) - frac(R, uvBad)), projStretchAsym: Math.abs(frac(L, projBad) - frac(R, projBad)),
      uvDensP95: (() => { const s = front.map(stretchOf).filter((x) => x != null).sort((p, q) => p - q); return s[Math.floor(s.length * 0.95)] || 0; })(),
      // vertex mirror pairs: how many verts lack a mirror partner / have an un-mirrored normal (asymmetric verts)
      ...vertSymmetry(m),
    };
  }
  return out;
}
function vertSymmetry(m) {
  const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal;
  if (!pos || !nor) return {};
  const key = (x, y, z) => Math.round(x * 400) + "," + Math.round(y * 400) + "," + Math.round(z * 400);
  const map = new Map();
  for (let i = 0; i < pos.count; i++) map.set(key(pos.getX(i), pos.getY(i), pos.getZ(i)), i);
  let unpaired = 0, badN = 0, central = 0;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    if (Math.abs(x) < 0.005) { central++; continue; }
    const j = map.get(key(-x, pos.getY(i), pos.getZ(i)));
    if (j == null) { unpaired++; continue; }
    const dn = Math.hypot(nor.getX(i) + nor.getX(j), nor.getY(i) - nor.getY(j), nor.getZ(i) - nor.getZ(j));
    if (dn > 0.25) badN++;
  }
  return { verts: pos.count, unpairedVerts: unpaired, asymNormalVerts: badN, unpairedFrac: unpaired / Math.max(1, pos.count - central), asymNormalFrac: badN / Math.max(1, pos.count - central) };
}
