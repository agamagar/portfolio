import { glasses } from "./glasses-round.js";
export default {
  slot: "Glasses", id: "square", label: "Rectangular glasses",
  params: { size: { type: "number", min: 0.8, max: 1.3, step: 0.02, default: 1.0, label: "Lens size" }, thick: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1.0, label: "Frame weight" }, shape: { type: "number", min: 0, max: 1, step: 0.05, default: 0.85, label: "Round to square" } },
  build(ctx) { return glasses(ctx); },
};
