// THE FACE SYSTEM (2026-10-20). A face is a plain JSON config, one block per feature:
//   { "hair": { "style": "shoulder-messy", "length": 0.9, ... }, "eyes": { ... }, "nose": { ... }, ... }
// Each feature is its own module (features/modules/<id>.js) that turns its block into composable
// contributions on the shared head (public/faces/face.glb, the same topology, shape keys and rig as
// every skin). Dropping a file into features/modules/ adds a feature; into features/presets/ a
// preset; into features/hairStyles/ a hair style. Nothing here is edited to add one.
//
// A module is { id, label, order, params, apply(values, acc) } and returns a partial of:
//   keys:    { <shape key>: weight }  the resting face, layered UNDER the emotes (see below)
//   handles: [ { c: [x,y,z], r, d: [dx,dy,dz], s: [sx,sy,sz], mirror } ]   soft warps of the head: every
//            vertex within r of c (and of its mirror image at -x when `mirror`) moves by d plus s x (p - c),
//            with a gaussian falloff; applied in the vertex shader to every face part alike so they stay joined
//   palette: { <Part>: { base, shade, deep, spec } }   colours (Skin, Hair, Eye, Brow, Mouth, MouthInner, HatBand)
//   hair:    { ...builder params }    the hair geometry (hairStyles/ + morph/plastHair.js)
//   material:{ mode, bump, sss }      shading
// `acc` is everything resolved so far (modules run in `order`), so a module can read an earlier one's output.
//
// LAYERING (bottom to top): the head's own shape (handles) -> the resting face (keys) -> the emote's
// keys. An emote key REPLACES the resting face for its group (eye*, brow*, mouth/jaw/cheek*) as it comes
// in (faceRig3D.pose): a blink closes the eyes from wherever the resting squint sits, a grin takes over
// the mouth's resting curve, and when the emote ends the resting face returns.

const mods = import.meta.glob("./modules/*.js", { eager: true });
const presets = import.meta.glob("./presets/*.json", { eager: true });
const styles = import.meta.glob("./hairStyles/*.js", { eager: true });

export const MODULES = Object.values(mods).map((m) => m.default).sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
export const PRESETS = Object.fromEntries(Object.entries(presets).map(([f, m]) => [f.replace(/^.*\/|\.json$/g, ""), m.default ?? m]));
export const HAIR_STYLES = Object.fromEntries(Object.values(styles).map((m) => [m.default.id, m.default]));
export const MAX_HANDLES = 16;

import { hex, toHex, mix, tones } from "./util";
export { hex, toHex, mix, tones };

// every param's default, per module: the neutral face
export const defaults = () => Object.fromEntries(MODULES.map((m) => [m.id, Object.fromEntries(Object.entries(m.params).map(([k, p]) => [k, p.default]))]));
// a config with anything missing filled from the defaults (and from the style's own defaults for hair)
export const complete = (cfg = {}) => { const d = defaults(); return Object.fromEntries(MODULES.map((m) => [m.id, { ...d[m.id], ...(cfg[m.id] || {}) }])); };

export function resolveFace(cfg) {
  const full = complete(cfg), acc = { keys: {}, handles: [], palette: {}, hair: null, material: { mode: "plast", bump: 0.6, sss: 0.6 }, lockSkin: false, config: full };
  for (const m of MODULES) {
    const out = m.apply(full[m.id], acc) || {};
    for (const [k, v] of Object.entries(out.keys || {})) acc.keys[k] = Math.min(1, Math.max(0, (acc.keys[k] || 0) + v));
    if (out.handles) acc.handles.push(...out.handles);
    for (const [part, c] of Object.entries(out.palette || {})) acc.palette[part] = { ...(acc.palette[part] || {}), ...c };
    if (out.hair) acc.hair = { ...(acc.hair || {}), ...out.hair };
    if (out.material) acc.material = { ...acc.material, ...out.material };
    if (out.lockSkin !== undefined) acc.lockSkin = out.lockSkin;
  }
  acc.handles = acc.handles.slice(0, MAX_HANDLES);
  return acc;
}

// the handles as the shader's uniform array: three vec4 each, [centre, r] [delta, mirror] [scale, 0]
export function packHandles(handles, out) {
  const n = Math.min(handles.length, MAX_HANDLES);
  for (let i = 0; i < MAX_HANDLES; i++) {
    const h = handles[i];
    out[i * 3].set(...(h ? [...h.c, h.r] : [0, 0, 0, 0]));
    out[i * 3 + 1].set(...(h ? [...(h.d || [0, 0, 0]), h.mirror ? 1 : 0] : [0, 0, 0, 0]));
    out[i * 3 + 2].set(...(h ? [...(h.s || [0, 0, 0]), 0] : [0, 0, 0, 0]));
  }
  return n;
}
