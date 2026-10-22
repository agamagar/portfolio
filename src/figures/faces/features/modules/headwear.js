// HEADWEAR: turban, prayer cap, hijab/headscarf, dupatta (features/parts/headwear-*.js). It covers the hair: a turban or hijab all of it,
// a cap or dupatta the crown only.
import { tones } from "../util";
import { variantsOf } from "../parts";
const V = variantsOf("Headwear");
export default {
  id: "headwear", label: "Headwear", order: 35,
  params: {
    kind: { type: "select", label: "Type", default: "none", options: [["none", "None"], ...V.map((v) => [v.id, v.label])] },
    color: { type: "color", label: "Colour", default: "#b2483e" },
    height: { type: "number", label: "Height", min: 0.6, max: 1.4, step: 0.02, default: 1.0, showWhen: { kind: ["turban", "taqiyah"] } },
    layers: { type: "number", label: "Wraps", min: 3, max: 8, step: 1, default: 5, showWhen: { kind: ["turban"] } },
    tilt: { type: "number", label: "Wrap tilt", min: 0, max: 1, step: 0.02, default: 0.45, showWhen: { kind: ["turban"] } },
    drop: { type: "number", label: "Length (to the shoulders)", min: -2.2, max: -1.45, step: 0.02, default: -1.85, showWhen: { kind: ["hijab", "dupatta"] } },
    loose: { type: "number", label: "Looseness", min: 0, max: 1, step: 0.02, default: 0.2, showWhen: { kind: ["hijab", "dupatta"] } },
  },
  apply(v) {
    if (v.kind === "none") return { parts: { Headwear: null }, hairHide: null };
    const variant = V.find((x) => x.id === v.kind);
    return { parts: { Headwear: { variant: v.kind, params: { height: v.height, layers: v.layers, tilt: v.tilt, drop: v.drop, loose: v.loose } } }, hairHide: variant?.hides || "all", palette: { Headwear: { ...tones(v.color), spec: 0 } } };
  },
};
