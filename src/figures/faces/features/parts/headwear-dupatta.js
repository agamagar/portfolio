import { drape } from "./headwear-hijab.js";
export default {
  slot: "Headwear", id: "dupatta", label: "Dupatta over the head", hides: "top",
  params: { drop: { type: "number", min: -2.2, max: -1.45, step: 0.02, default: -1.6, label: "Length" }, loose: { type: "number", min: 0, max: 1, step: 0.02, default: 0.7, label: "Looseness" } },
  build(ctx) { return drape(ctx); },
};
