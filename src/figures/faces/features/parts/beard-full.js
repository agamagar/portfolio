// full beard: cheeks, jaw and chin thickened into a clay mass, a hollow left for the mouth, and a chin that grows downward with `length`
export default {
  slot: "Beard", id: "full", label: "Full beard",
  params: { length: { type: "number", min: 0, max: 1, step: 0.02, default: 0.25, label: "Length" }, fullness: { type: "number", min: 0, max: 1, step: 0.02, default: 0.4, label: "Fullness" }, seed: { type: "number", min: 1, max: 40, step: 1, default: 7, label: "Shuffle" } },
  build({ S, P, shellMesh }) {
    const th = 0.06 + 0.1 * P.fullness;
    const lump = (x, y, z) => 0.5 + 0.5 * Math.sin(x * 9.1 + P.seed) * Math.sin(y * 8.3 + z * 7.1 + P.seed * 0.7);
    const geo = S.shell((x, y, z, nx, ny, nz) => {
      const mouth = ((x + 0.14) / 0.36) ** 2 + ((y + 0.68) / 0.14) ** 2 < 1;
      if (mouth) return -1;
      const jaw = y < -0.7 && z > -0.3;
      const lip = y < -0.46 && y > -0.62 && Math.abs(x + 0.05) < 0.55 && z > 0.5;
      const cheek = y < -0.1 && Math.abs(x) > 0.5 && z > 0.0 && y > -1.0 && Math.abs(x) < 1.12;
      if (!(jaw || lip || cheek)) return -1;
      const fade = Math.min(1, Math.max(0, (-0.05 - y) / 0.35)); // sideburns taper in toward the ear
      return th * (0.55 + 0.45 * lump(x, y, z)) * (cheek && !jaw && !lip ? fade : 1);
    }, { downward: (x, y, z) => (y < -0.9 ? 0.22 * P.length * Math.min(1, (-0.9 - y) / 0.4 + 0.3) * Math.max(0, 1 - Math.abs(x) / 0.9) : 0) });
    return shellMesh(geo, S, "Beard");
  },
};
