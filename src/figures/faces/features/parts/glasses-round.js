// glasses: round or rectangular rims around each eye, a bridge, and temples that follow the head out to the ears
export default {
  slot: "Glasses", id: "round", label: "Round glasses",
  params: { size: { type: "number", min: 0.8, max: 1.3, step: 0.02, default: 1.0, label: "Lens size" }, thick: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1.0, label: "Frame weight" }, shape: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: "Round to square" } },
  build(ctx) { return glasses(ctx); },
};
export function glasses({ S, P, THREE }) {
  const geos = [], tube = P.thick * 0.022, r = 0.27 * P.size, cy = 0.2, ex = 0.4;
  const rim = (sd) => {
    // a rounded-square path: `shape` 0 is a circle, 1 a rounded rectangle
    const pts = [], N = 40;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), k = 4 / (2 + 2 * (1 - P.shape) + 0.001);
      const e = 2 / (2 + 6 * P.shape);   // superellipse exponent: 1 = circle .. squarer
      const px = Math.sign(c) * Math.abs(c) ** e * r, py = Math.sign(s) * Math.abs(s) ** e * r * (0.92 - 0.1 * P.shape);
      const x = sd * ex + px, y = cy + py;
      pts.push(new THREE.Vector3(x, y, S.frontZ(x, y, 0.07) + 0.06));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, tube, 8, true);
  };
  for (const sd of [-1, 1]) {
    geos.push(rim(sd));
    // temple: from the rim's outer edge back over the temple to the ear, following the head's surface outward
    const x0 = sd * (ex + r), z0 = S.frontZ(x0, cy, 0.07) + 0.06, pts = [new THREE.Vector3(x0, cy, z0)];
    for (const z of [z0 - 0.25, z0 - 0.6, z0 - 0.95]) { const sx = S.sideX(cy, z, sd) ?? x0; pts.push(new THREE.Vector3(sx + sd * 0.05, cy - 0.01, z)); }
    pts.push(new THREE.Vector3(sd * 1.38, cy - 0.05, S.lobe(sd)[2] + 0.1));
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, tube * 0.9, 8, false));
  }
  // the bridge over the nose
  const bz = S.frontZ(0, cy + 0.02, 0.07) + 0.07;
  geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-ex + r, cy + 0.04, bz - 0.01), new THREE.Vector3(0, cy + 0.08, bz + 0.02), new THREE.Vector3(ex - r, cy + 0.04, bz - 0.01)]), 12, tube, 8, false));
  return mergeMesh(geos, THREE);
}
// merge tube geometries (indexed, same attributes) into one mesh
export function mergeMesh(geos, THREE) {
  const pos = [], nor = [], uv = [], idx = []; let off = 0;
  for (const g of geos) {
    const P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(0, 0); }
    const ix = g.index ? Array.from(g.index.array) : Array.from({ length: P.count }, (_, i) => i);
    for (const i of ix) idx.push(i + off);
    off += P.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  return new THREE.Mesh(geo);
}
