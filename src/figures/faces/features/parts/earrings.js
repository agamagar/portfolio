// earrings: studs or hoops on the ear lobes, found on the real ear geometry
export default {
  slot: "Earring", id: "hoops", label: "Hoop earrings",
  params: { size: { type: "number", min: 0.6, max: 1.8, step: 0.05, default: 1.0, label: "Size" }, studs: { type: "number", min: 0, max: 1, step: 1, default: 0, label: "Studs instead of hoops" } },
  build({ S, P, THREE }) {
    const pos = [], nor = [], uv = [], idx = []; let off = 0;
    const add = (g) => { const Pp = g.attributes.position, N = g.attributes.normal; for (let i = 0; i < Pp.count; i++) { pos.push(Pp.getX(i), Pp.getY(i), Pp.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(0, 0); } for (const i of Array.from(g.index.array)) idx.push(i + off); off += Pp.count; };
    for (const sd of [-1, 1]) {
      const [lx, ly, lz] = S.lobe(sd);
      if (P.studs) add(new THREE.SphereGeometry(0.045 * P.size, 14, 10).translate(lx + sd * 0.03, ly + 0.02, lz));
      else add(new THREE.TorusGeometry(0.15 * P.size, 0.018 * P.size, 8, 28).rotateY(Math.PI / 2).translate(lx + sd * 0.04, ly - 0.14 * P.size, lz));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    return new THREE.Mesh(geo);
  },
};
