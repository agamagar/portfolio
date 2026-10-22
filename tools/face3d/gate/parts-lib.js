// Page side of the parts check: is every part the face is supposed to wear built, visible, drawn, and attached to the head?
// Separate from gate-lib on purpose (its own rig, its own renderer) so it can run in any browser the gate is pointed at.
import * as THREE from "three";
import { createFaceRig } from "/src/figures/faces/morph/faceRig3D.js";
import { resolveFace, PRESETS } from "/src/figures/faces/features/core.js";
import { SKINS } from "/src/figures/faces/faceSkins.js";
const W = 802, H = 862;
const cfgOf = (skin) => {
  if (skin === "clay") return { W, H };
  if (skin === "noir") return { W, H, src: "/faces/face-noir.glb", fitSrc: "/faces/fit-noir.json", idSrc: null, rawSrc: "/faces/skin-raw-noir.png", marginSrc: "/faces/margins-noir.png", cleanSrc: "/faces/skin-clean-noir.png", skinId: "noir", hat: true };
  if (skin === "plast") return { face: resolveFace(PRESETS["agam-clay"]), W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: "plast", hat: true, procedural: true };
  const sk = SKINS.find((s) => s.id === skin);
  return sk.rig ? { W, H, src: sk.rig.src, fitSrc: sk.rig.fit, idSrc: sk.rig.idmap || null, rawSrc: sk.rig.raw || null, marginSrc: sk.rig.margins || null, cleanSrc: null, skinId: skin } : { W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: skin, mode: sk.mode };
};
const canvas = document.createElement("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
const gl = renderer.getContext();
const pixels = () => { const d = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, d); return d; };
const frame = (rig) => { rig.pose({}); rig.shaded(renderer, null); return pixels(); };

export async function inspect(skin, preset) {
  const rig = createFaceRig(cfgOf(skin)); await rig.ready;
  let face = rig.face;
  if (preset) { face = resolveFace(PRESETS[preset]); rig.setFace(face); }
  rig.pose({}); rig._root.updateMatrixWorld(true);
  const skinM = rig.parts.Skin, sp = skinM.geometry.attributes.position, sbox = new THREE.Box3().setFromObject(skinM), height = sbox.max.y - sbox.min.y;
  const spts = []; const tmp = new THREE.Vector3(); for (let i = 0; i < sp.count; i += 3) spts.push(tmp.fromBufferAttribute(sp, i).applyMatrix4(skinM.matrixWorld).clone());
  const expected = ["Hair", "Brow", "Eye", "Mouth"].flatMap((n) => (n === "Brow" || n === "Eye" ? [n + "L", n + "R"] : [n]));
  if (skin === "plast") for (const [slot, spec] of Object.entries(face?.parts || {})) if (spec) expected.push(slot);
  if (skin === "plast" && face?.hair?.style === "bald") expected.splice(expected.indexOf("Hair"), 1);
  const base = frame(rig); const out = { skin, preset, skinHeight: height, parts: {}, problems: [] };
  for (const name of new Set([...expected, ...Object.keys(rig.parts)])) {
    const m = rig.parts[name]; const isExpected = expected.includes(name);
    if (!m) { if (isExpected) out.problems.push(`${name}: expected, not built`); out.parts[name] = { present: false, expected: isExpected }; continue; }
    if (/^Lid|^MouthInner$|^HatBand$|^Hat$/.test(name)) continue; // shown only while a pose uses them
    const info = { present: true, expected: isExpected, visible: m.visible, verts: m.geometry.attributes.position?.count || 0 };
    // connected pieces (by shared vertices) and each piece's distance to the head's skin
    const g = m.geometry, pos = g.attributes.position, idx = g.index; const parent = new Int32Array(pos.count).map((_, i) => i);
    const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
    const T = idx ? idx.count : pos.count; for (let t = 0; t + 2 < T; t += 3) { const a = idx ? idx.getX(t) : t, b = idx ? idx.getX(t + 1) : t + 1, c = idx ? idx.getX(t + 2) : t + 2; parent[find(b)] = find(a); parent[find(c)] = find(a); }
    // weld by position too (parts are built from separate strips that touch)
    const pk = new Map(); const q = (i) => Math.round(pos.getX(i) * 500) + "," + Math.round(pos.getY(i) * 500) + "," + Math.round(pos.getZ(i) * 500);
    for (let i = 0; i < pos.count; i++) { const k = q(i); if (pk.has(k)) parent[find(i)] = find(pk.get(k)); else pk.set(k, i); }
    const comps = new Map(); for (let i = 0; i < pos.count; i++) { const r = find(i); (comps.get(r) || comps.set(r, []).get(r)).push(i); }
    m.updateMatrixWorld(true);
    const list = [];
    for (const ids of comps.values()) { if (ids.length < 4) continue; let best = Infinity; const step = Math.max(1, Math.floor(ids.length / 120));
      for (let a = 0; a < ids.length; a += step) { tmp.fromBufferAttribute(pos, ids[a]).applyMatrix4(m.matrixWorld); for (const s of spts) { const d = tmp.distanceToSquared(s); if (d < best) best = d; } }
      list.push({ verts: ids.length, gap: Math.sqrt(best) / height }); }
    list.sort((a, b) => b.verts - a.verts);
    info.pieces = list.length; info.floating = ["Mouth", "EyeL", "EyeR", "BrowL", "BrowR"].includes(name) ? [] : list.filter((c) => c.gap > 0.06).map((c) => ({ verts: c.verts, gap: +c.gap.toFixed(3) }));
    // drawn: how many pixels change when the part is hidden
    if (m.visible && isExpected) { m.visible = false; const d = frame(rig); m.visible = true; let n = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - base[i]) + Math.abs(d[i + 1] - base[i + 1]) + Math.abs(d[i + 2] - base[i + 2]) + Math.abs(d[i + 3] - base[i + 3]) > 24) n++; info.drawnPx = n; }
    out.parts[name] = info;
    if (isExpected && !m.visible) out.problems.push(`${name}: not visible`);
    if (isExpected && info.verts === 0) out.problems.push(`${name}: empty geometry`);
    if (isExpected && info.drawnPx != null && info.drawnPx < (["Bindi", "NosePin", "Tilak", "Earring"].includes(name) ? 8 : 60)) out.problems.push(`${name}: not drawn (${info.drawnPx}px change when hidden)`);
    if (info.floating.length) out.problems.push(`${name}: ${info.floating.length} floating piece(s) (${info.floating.map((f) => f.verts + "v @" + f.gap).join(", ")})`);
  }
  out.ctxLost = gl.isContextLost(); rig.dispose(); return out;
}
