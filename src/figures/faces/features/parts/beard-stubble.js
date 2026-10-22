// stubble: a thin shell on the jaw, chin and upper lip; the palette's Beard colour (skin mixed with the hair) with a speckled surface
export default {
  slot: "Beard", id: "stubble", label: "Stubble",
  params: { amount: { type: "number", min: 0, max: 1, step: 0.02, default: 0.6, label: "Density" } },
  build({ S, P, shellMesh }) {
    const t = 0.006 + 0.012 * P.amount;
    const geo = S.shell((x, y, z, nx, ny, nz) => {
      const mouth = ((x + 0.14) / 0.34) ** 2 + ((y + 0.68) / 0.13) ** 2 < 1;
      const jaw = y < -0.62 && z > -0.2 && ny < 0.6;
      const lip = y < -0.46 && y > -0.62 && Math.abs(x + 0.05) < 0.5 && z > 0.5;
      const cheek = y < -0.15 && Math.abs(x) > 0.5 && Math.abs(x) < 1.1 && z > 0.1 && y > -1.0 && Math.abs(x) < 1.0 - 0.3 * Math.max(0, -(y + 0.4));
      return !mouth && (jaw || lip || cheek) ? t : -1;
    });
    return shellMesh(geo, S, "Beard");
  },
};
