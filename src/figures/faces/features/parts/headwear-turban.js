// turban (pagri): a dome over the skull and layered wound bands, each tilted so they spiral up to a flat crown
import { smooth, faceOut } from "./_shared.js";
export default {
  slot: "Headwear", id: "turban", label: "Turban", hides: "all",
  params: { height: { type: "number", min: 0.6, max: 1.4, step: 0.02, default: 1.0, label: "Height" }, layers: { type: "number", min: 3, max: 8, step: 1, default: 5, label: "Wraps" }, tilt: { type: "number", min: 0, max: 1, step: 0.02, default: 0.45, label: "Wrap tilt" }, seed: { type: "number", min: 1, max: 40, step: 1, default: 7, label: "Shuffle" } },
  build({ P, THREE, rng }) {
    const geos = [];
    const C = new THREE.Vector3(0, 0.1, -0.02);
    // the dome underneath: closes the gaps between the wraps
    const dome = new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.36).scale(1.12, 1.4 * P.height, 1.1).translate(C.x, C.y - 0.1 + (P.height - 1) * 0.4, C.z);
    geos.push(dome);
    const L = Math.round(P.layers);
    for (let l = 0; l < L; l++) {
      const t = l / (L - 1), y0 = 0.7 + t * 0.55 * P.height, skull = Math.sqrt(Math.max(0.05, 1 - ((y0 - 0.05) / 1.35) ** 2)), rad = skull * 1.07 + 0.1, tube = 0.17 - 0.025 * t;
      const pts = [], N = 36, tilt = P.tilt * (0.5 + 0.5 * rng()) * (l % 2 ? 1 : -1);
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const r = rad * (1 + 0.025 * Math.sin(a * 3 + l * 1.7));
        pts.push(new THREE.Vector3(Math.sin(a) * r * 1.02, y0 + tilt * 0.22 * Math.sin(a + l), Math.cos(a) * r * 0.98 - 0.02));
      }
      geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 72, tube, 10, true));
    }
    // the flat crown knot
    geos.push(new THREE.SphereGeometry(0.42, 18, 12).scale(1, 0.6, 1).translate(0.05, 1.25 + 0.3 * (P.height - 1) + 0.05, 0.05));
    return mergeSimple(THREE, geos, C);
  },
};
export function mergeSimple(THREE, geos, centre) {
  const pos = [], nor = [], uv = [], idx = []; let off = 0;
  for (const g of geos) {
    const P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(0, 0); }
    const ix = g.index ? Array.from(g.index.array) : Array.from({ length: P.count }, (_, i) => i);
    for (const i of ix) idx.push(i + off);
    off += P.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  return new THREE.Mesh(geo);
}
