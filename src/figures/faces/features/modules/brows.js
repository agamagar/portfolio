// BROWS: height, angle (inner ends up, worried, to inner ends down, stern), arch, thickness-free: the
// shape keys set the angle at rest, soft warps set the height.
import { tones } from "../util";
export default {
  id: "brows", label: "Brows", order: 50,
  params: {
    height: { type: "number", label: "Height", min: -1, max: 1, step: 0.02, default: 0 },
    angle: { type: "number", label: "Angle (worried to stern)", min: -1, max: 1, step: 0.02, default: 0 },
    arch: { type: "number", label: "Arch", min: -1, max: 1, step: 0.02, default: 0 },
    color: { type: "color", label: "Colour", default: "#2f1d14" },
  },
  apply(v) {
    const keys = { browDownLeft: Math.max(0, v.angle) * 0.6, browDownRight: Math.max(0, v.angle) * 0.6, browInnerUp: Math.max(0, -v.angle) * 0.7, browOuterUpLeft: Math.max(0, v.arch) * 0.5, browOuterUpRight: Math.max(0, v.arch) * 0.5 };
    const handles = [{ c: [0.4, 0.47, 0.9], r: 0.4, d: [0, v.height * 0.1, 0], mirror: true }];
    if (v.arch < 0) handles.push({ c: [0.4, 0.5, 0.9], r: 0.3, d: [0, v.arch * 0.05, 0], mirror: true });
    return { keys, handles, palette: { Brow: { ...tones(v.color), spec: 0 } } };
  },
};
