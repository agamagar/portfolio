// The pre-built three.js part library. A part is a file in this folder:
//   export default { slot, id, label, params: { key: {type, min, max, step, default, label} }, build(ctx) -> THREE.Mesh | null }
// slots: Hair, Headwear, Beard, Glasses, Bindi, Tilak, Earring, NosePin (the mesh is named by its slot: that is the rig's part key,
// its palette entry and its id-pass code). ctx = { S: skin surface (skinSurface.js), P: resolved params, rng, THREE }.
// Adding a variant = adding a file here; features/modules/*.js lists the variants of its slot by id.
import * as THREE from "three";
import { shellMesh } from "../skinSurface";

const files = import.meta.glob("./*.js", { eager: true });
export const PARTS = Object.values(files).map((m) => m.default).filter((p) => p && p.slot);
export const variantsOf = (slot) => PARTS.filter((p) => p.slot === slot);
export const rngOf = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// build the part for a slot from a spec { variant, params }; null when the variant is "none" or unknown
export function buildPart(slot, spec, S) {
  if (!spec || !spec.variant || spec.variant === "none") return null;
  const p = variantsOf(slot).find((v) => v.id === spec.variant);
  if (!p) return null;
  const P = { ...Object.fromEntries(Object.entries(p.params || {}).map(([k, d]) => [k, d.default])), ...(spec.params || {}) };
  const out = p.build({ S, P, rng: rngOf(P.seed ?? 7), THREE, shellMesh });
  if (out) out.name = slot;
  return out;
}
