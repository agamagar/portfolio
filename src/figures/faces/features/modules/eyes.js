// EYES: openness (narrowed to wide), the squint a smile brings, size, spacing, and height. Openness and
// squint are the resting face's shape keys (an emote's blink or wide-eyes takes over from them); size,
// spacing and height are soft warps of the head.
export default {
  id: "eyes", label: "Eyes", order: 40,
  params: {
    openness: { type: "number", label: "Openness (narrowed to wide)", min: -1, max: 1, step: 0.02, default: 0 },
    smileSquint: { type: "number", label: "Smile squint", min: 0, max: 1, step: 0.02, default: 0 },
    size: { type: "number", label: "Size", min: -1, max: 1, step: 0.02, default: 0 },
    spacing: { type: "number", label: "Spacing (close to wide)", min: -1, max: 1, step: 0.02, default: 0 },
    height: { type: "number", label: "Height", min: -1, max: 1, step: 0.02, default: 0 },
    color: { type: "color", label: "Colour", default: "#1b110d" },
  },
  apply(v) {
    const n = Math.max(0, -v.openness), w = Math.max(0, v.openness);
    const keys = { eyeBlinkLeft: n * 0.4, eyeBlinkRight: n * 0.4, eyeSquintLeft: n * 0.55 + v.smileSquint * 0.6, eyeSquintRight: n * 0.55 + v.smileSquint * 0.6, eyeWideLeft: w * 0.8, eyeWideRight: w * 0.8 };
    const C = [0.4, 0.19, 0.86];
    const handles = [
      { c: C, r: 0.34, s: [v.size * 0.35, v.size * 0.35, v.size * 0.1], mirror: true },
      { c: C, r: 0.55, d: [v.spacing * 0.1, v.height * 0.1, 0], mirror: true },
    ];
    return { keys, handles, palette: { Eye: { base: v.color, shade: v.color, deep: v.color, spec: 0 } } };
  },
};
