// NOSE: width, tip height (turned down to turned up), length (how far it stands off the face).
export default {
  id: "nose", label: "Nose", order: 60,
  params: {
    width: { type: "number", label: "Width", min: -1, max: 1, step: 0.02, default: 0 },
    tip: { type: "number", label: "Tip (down to up)", min: -1, max: 1, step: 0.02, default: 0 },
    length: { type: "number", label: "Length", min: -1, max: 1, step: 0.02, default: 0 },
  },
  apply(v) {
    return { handles: [
      { c: [0.16, -0.32, 1.1], r: 0.24, d: [v.width * 0.09, 0, 0], mirror: true },
      { c: [0, -0.22, 1.24], r: 0.24, d: [0, v.tip * 0.1, v.length * 0.12], mirror: false },
    ] };
  },
};
