// taqiyah / prayer cap: a snug dome sitting above the brow line, with a thin rolled edge
import { mergeSimple } from "./headwear-turban.js";
export default {
  slot: "Headwear", id: "taqiyah", label: "Prayer cap", hides: "top",
  params: { height: { type: "number", min: 0.7, max: 1.4, step: 0.02, default: 1.0, label: "Height" } },
  build({ P, THREE }) {
    const C = new THREE.Vector3(0, 0.05, -0.02);
    const dome = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.43).scale(1.12, 1.33 * P.height, 1.07).translate(C.x, C.y, C.z);
    // the rolled edge: a thin torus on the dome's rim
    const th = Math.PI * 0.43, rx = Math.sin(th) * 1.12, ry = Math.cos(th) * 1.33 * P.height;
    const edge = new THREE.TorusGeometry(1, 0.045, 10, 56).rotateX(Math.PI / 2).scale(rx, 1, Math.sin(th) * 1.07).translate(0, C.y + ry, C.z);
    return mergeSimple(THREE, [dome, edge], C);
  },
};
