// hijab / headscarf and dupatta: one drape over the skull and sides, an open face, and a fold under the chin that falls to the shoulders.
// The face opening is cut by clamping the front vertices onto its boundary (collapsed triangles), so the edge is a clean curve.
import { smooth, meshFromGrid, faceOut } from "./_shared.js";
export function drape({ P, THREE }) {
  const loose = P.loose, ROWS = 64, COLS = 120, yTop = 1.34, yBot = P.drop;
  const C = new THREE.Vector3(0, 0, -0.05);
  // half-width of the face opening at height y (the scarf frames the face; it lies on the cheeks' outer edge)
  const open = (y) => 0.8 + 0.3 * smooth(0.75, 0.15, y) - 0.1 * smooth(-0.3, -1.1, y) + 0.08 * loose;
  const g = meshFromGrid(THREE, ROWS, COLS, (i, j) => {
    const v = i / ROWS, y = yTop + (yBot - yTop) * v;
    // radius profile: skull above, jaw/neck below, flare at the shoulders
    const above = Math.sqrt(Math.max(0.0001, 1 - ((y - 0.05) / 1.35) ** 2));
    const r0 = y > 0.1 ? 1.1 * above + 0.04 : 1.1 - 0.35 * smooth(0.1, -1.3, y) + 0.5 * smooth(-1.3, yBot, y) * (P.drop < -1.5 ? 1 : 0.4);
    let a = ((j / COLS) - 0.5) * Math.PI * 2;                 // -pi..pi, 0 at the back? 0 = front (+z)
    const aa = Math.abs(a);
    // the face opening: front sector |a| < A(y) (only above the chin)
    const w = open(y), A = Math.asin(Math.min(0.96, w / Math.max(r0 * 1.04, 0.3)));
    const frontOpen = y > -1.42;
    if (frontOpen && aa < A) a = Math.sign(a || 1) * A;
    const fold = 1 + 0.03 * Math.sin(a * 7 + y * 4) * (0.5 + loose) + 0.06 * loose * smooth(0.0, -1.2, y);
    const r = r0 * fold * (1 + 0.08 * loose);
    return [Math.sin(a) * r * 1.04, y, Math.cos(a) * r * 1.0 - 0.02];
  });
  faceOut(THREE, g, C);
  return new THREE.Mesh(g);
}
export default {
  slot: "Headwear", id: "hijab", label: "Hijab / headscarf", hides: "all",
  params: { drop: { type: "number", min: -2.2, max: -1.45, step: 0.02, default: -1.85, label: "Length (to the shoulders)" }, loose: { type: "number", min: 0, max: 1, step: 0.02, default: 0.15, label: "Looseness" } },
  build(ctx) { return drape(ctx); },
};
