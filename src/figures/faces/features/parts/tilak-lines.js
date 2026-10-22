// tilak: a vertical stripe (or three horizontal bars) on the forehead, laid along the surface
export default {
  slot: "Tilak", id: "stripe", label: "Tilak (vertical)",
  params: { width: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1.0, label: "Width" }, height: { type: "number", min: 0.5, max: 1.5, step: 0.05, default: 1.0, label: "Height" } },
  build({ S, P, THREE }) {
    const pts = []; const y0 = 0.46, y1 = 0.46 + 0.42 * P.height;
    for (let i = 0; i <= 8; i++) { const y = y0 + (y1 - y0) * (i / 8); const f = S.onFace(0, y, 0.012); pts.push(f.p); }
    const geos = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = a.distanceTo(b);
      const seg = new THREE.CapsuleGeometry(0.03 * P.width, len, 4, 8).rotateX(0);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      seg.scale(1, 1, 0.3); seg.applyQuaternion(q); seg.translate(mid.x, mid.y, mid.z); geos.push(seg);
    }
    return mergeGeos(geos, THREE);
  },
};
function mergeGeos(geos, THREE) {
  const pos = [], nor = [], uv = [], idx = []; let off = 0;
  for (const g of geos) { const P = g.attributes.position, N = g.attributes.normal; for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(0, 0); } for (const i of Array.from(g.index.array)) idx.push(i + off); off += P.count; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  return new THREE.Mesh(geo);
}
