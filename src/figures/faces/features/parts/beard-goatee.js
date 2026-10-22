// goatee and moustache: a chin patch and an upper-lip bar, nothing on the cheeks
export default {
  slot: "Beard", id: "goatee", label: "Goatee",
  params: { length: { type: "number", min: 0, max: 1, step: 0.02, default: 0.3, label: "Length" } },
  build({ S, P, shellMesh }) {
    const geo = S.shell((x, y, z) => {
      const mouth = ((x + 0.14) / 0.3) ** 2 + ((y + 0.68) / 0.11) ** 2 < 1;
      if (mouth) return -1;
      const chin = y < -0.8 && Math.abs(x + 0.05) < 0.32 && z > 0.0;
      const lip = y < -0.5 && y > -0.6 && Math.abs(x + 0.05) < 0.34 && z > 0.6;
      return chin || lip ? 0.07 : -1;
    }, { downward: (x, y) => (y < -1.0 ? 0.18 * P.length : 0) });
    return shellMesh(geo, S, "Beard");
  },
};
