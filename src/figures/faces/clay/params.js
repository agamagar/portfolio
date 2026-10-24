// The clay head as a JSON of proportions (three.js axes, head width about 2: x right, y up, z toward the viewer). Everything the SDF builder and the
// materials read lives here, so a look is a parameter set (the chef is DEFAULT). Merge with `{ ...DEFAULT, ...mine }` per block via mergeParams().
export const DEFAULT = {
  skin: { color: "#fbdcc6", sheen: "#ffd9c0", roughness: 0.78 },
  // the block head: a rounded-box cranium blended into a broad rounded-box jaw, plus cheeks
  head: {
    cranium: { c: [0, 0.3, -0.06], r: [0.97, 0.86, 0.9], m: 3.0 },
    jaw: { c: [0, -0.4, 0.04], r: [0.9, 0.62, 0.84], m: 2.6 }, blend: 0.5,
    cheek: { x: 0.46, y: -0.3, z: 0.5, r: 0.4 }, cheekBlend: 0.3,
    taper: 0.1,   // the jaw narrows toward the chin (fraction of the width at the chin)
  },
  ear: { x: 1.16, y: -0.02, z: -0.08, ry: 0.52, rz: 0.4, rx: 0.2, toeIn: 38, bowl: 1.6, fold: 1.4, lobe: 1.0 },
  nose: { bridgeY: 0.28, tipY: -0.3, tipZ: 0.26, r0: 0.075, r1: 0.15, width: 1.0, tilt: 0 },
  eye: { x: 0.4, y: 0.16, r: 0.1, color: "#0b0706", gap: 0 },
  brow: { x: 0.4, y: 0.52, len: 0.42, thick: 0.065, arch: 0.05, tilt: 10, color: "#3a1e12" },
  mouth: { y: -0.68, width: 0.36, curve: 0.45, depth: 0.034, tuck: 0.0, open: 0, smileL: 0, smileR: 0 },
  hair: {
    color: "#4a2616", roughness: 0.5, edgeBlend: 0.05,
    cap: { thick: 0.07, region: [{ c: [0, 1.18, 0.1], r: [1.5, 0.7, 1.0] }, { c: [0, -0.05, -0.92], r: [1.3, 1.1, 0.78] }, { c: [0, 0.6, -0.35], r: [1.3, 0.62, 0.75] }] },
    // the wing: a spine of [x, y, z, r] sweeping up from the forehead's left and out to the right, tapering; flutes are short spines fanning off its end
    wing: { spine: [[-0.4, 1.0, 0.4, 0.40], [0.0, 1.2, 0.3, 0.46], [0.4, 1.34, 0.15, 0.46], [0.82, 1.4, 0.0, 0.40], [1.15, 1.36, -0.1, 0.26]],
      flutes: [[[0.3, 1.28, 0.2, 0.3], [0.62, 1.05, 0.14, 0.24], [0.92, 0.84, 0.05, 0.13]], [[0.5, 1.42, 0.22, 0.28], [0.98, 1.5, 0.15, 0.22], [1.42, 1.44, 0.04, 0.12]], [[0.25, 1.42, 0.32, 0.26], [0.5, 1.78, 0.22, 0.2], [0.8, 2.0, 0.1, 0.09]]] },
    swooshBlend: 0.3, fluteBlend: 0.06, napeBlend: 0.32,
  },
  light: { exposure: 1.0 },
};
export function mergeParams(over = {}, base = DEFAULT) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k of Object.keys(over || {})) out[k] = over[k] && typeof over[k] === "object" && !Array.isArray(over[k]) && base[k] && typeof base[k] === "object" ? mergeParams(over[k], base[k]) : over[k];
  return out;
}
