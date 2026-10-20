// CHEEKS & JAW: cheek fullness, jaw width (narrow to wide), chin (pointed to round), as soft warps.
export default {
  id: "cheeks", label: "Cheeks & jaw", order: 80,
  params: {
    fullness: { type: "number", label: "Cheek fullness", min: -1, max: 1, step: 0.02, default: 0 },
    jaw: { type: "number", label: "Jaw (narrow to wide)", min: -1, max: 1, step: 0.02, default: 0 },
    chin: { type: "number", label: "Chin (pointed to round)", min: -1, max: 1, step: 0.02, default: 0 },
  },
  apply(v) {
    return { keys: { cheekPuff: Math.max(0, v.fullness) * 0.2 }, handles: [
      { c: [0.78, -0.3, 0.8], r: 0.45, d: [v.fullness * 0.05, 0, v.fullness * 0.09], mirror: true },
      { c: [0.8, -0.95, 0.4], r: 0.5, d: [v.jaw * 0.12, 0, 0], mirror: true },
      { c: [0, -1.3, 0.55], r: 0.35, d: [0, v.chin * 0.07, -v.chin * 0.03], mirror: false },
    ] };
  },
};
