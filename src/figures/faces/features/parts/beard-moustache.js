// moustache: an upper-lip bar; `curl` lifts the outer ends (handlebar)
export default {
  slot: "Beard", id: "moustache", label: "Moustache",
  params: { width: { type: "number", min: 0.6, max: 1.4, step: 0.02, default: 1.0, label: "Width" }, thickness: { type: "number", min: 0.3, max: 1.5, step: 0.02, default: 1.0, label: "Thickness" }, curl: { type: "number", min: 0, max: 1, step: 0.02, default: 0.0, label: "Handlebar curl" } },
  build({ S, P, shellMesh }) {
    const w = 0.34 * P.width;
    const geo = S.shell((x, y, z) => {
      const mouth = ((x + 0.14) / 0.3) ** 2 + ((y + 0.68) / 0.11) ** 2 < 1;
      const end = Math.abs(x + 0.05) / w;
      return !mouth && y < -0.47 && y > -0.62 && end < 1 && z > 0.6 ? 0.05 * P.thickness * (1 - 0.35 * end * end) : -1;
    }, { downward: (x) => -P.curl * 0.14 * Math.max(0, (Math.abs(x + 0.05) / w - 0.45) / 0.55) ** 2 });
    return shellMesh(geo, S, "Beard");
  },
};
