// bindi: a small raised disc (or teardrop) between the brows
export default {
  slot: "Bindi", id: "dot", label: "Bindi",
  params: { size: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1.0, label: "Size" }, y: { type: "number", min: 0.4, max: 0.75, step: 0.01, default: 0.52, label: "Height on the forehead" } },
  build({ S, P, THREE }) {
    const { p, n } = S.onFace(0, P.y, 0.012);
    const g = new THREE.SphereGeometry(0.06 * P.size, 20, 12).scale(1, 1, 0.22);
    const m = new THREE.Mesh(g);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); m.position.copy(p);
    m.updateMatrix(); m.geometry.applyMatrix4(m.matrix); m.position.set(0, 0, 0); m.quaternion.identity(); m.updateMatrix();
    return m;
  },
};
