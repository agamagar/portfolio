// nose pin: a small gold bead on the left or right nostril
export default {
  slot: "NosePin", id: "stud", label: "Nose pin",
  params: { side: { type: "number", min: -1, max: 1, step: 2, default: 1, label: "Side (-1 left, 1 right)" }, size: { type: "number", min: 0.6, max: 1.8, step: 0.05, default: 1.0, label: "Size" } },
  build({ S, P, THREE }) {
    const x = 0.2 * P.side, y = -0.3, f = S.onFace(x, y, 0.02);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.03 * P.size, 14, 10).translate(f.p.x, f.p.y, f.p.z));
    return m;
  },
};
