// MOUTH: width, the resting curve (frown to smile, a shape key so an emote's mouth takes over), how far
// the lips part at rest.
export default {
  id: "mouth", label: "Mouth", order: 70,
  params: {
    width: { type: "number", label: "Width", min: -1, max: 1, step: 0.02, default: 0 },
    smile: { type: "number", label: "Resting curve (frown to smile)", min: -1, max: 1, step: 0.02, default: 0 },
    parted: { type: "number", label: "Lips parted", min: 0, max: 0.4, step: 0.01, default: 0 },
    color: { type: "color", label: "Lip colour", default: "#b9704f" },
  },
  apply(v) {
    const s = Math.max(0, v.smile), f = Math.max(0, -v.smile);
    return { keys: { mouthSmileLeft: s * 0.7, mouthSmileRight: s * 0.7, mouthFrownLeft: f * 0.7, mouthFrownRight: f * 0.7, jawOpen: v.parted },
      handles: [{ c: [0.3, -0.68, 0.95], r: 0.28, d: [v.width * 0.1, 0, 0], mirror: true }],
      palette: { Mouth: { base: v.color, shade: v.color, deep: v.color, spec: 0 } } };
  },
};
