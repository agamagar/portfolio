// FACIAL HAIR: stubble, moustache (optionally handlebar), goatee, full beard (features/parts/beard-*.js). Follows the hair colour unless told otherwise.
import { tones, hex, toHex, mix } from "../util";
import { variantsOf } from "../parts";
const V = variantsOf("Beard");
export default {
  id: "facialHair", label: "Facial hair", order: 36,
  params: {
    kind: { type: "select", label: "Type", default: "none", options: [["none", "None"], ...V.map((v) => [v.id, v.label])] },
    followHair: { type: "bool", label: "Same colour as the hair", default: true },
    color: { type: "color", label: "Colour", default: "#2f1d14" },
    greying: { type: "number", label: "Greying", min: 0, max: 1, step: 0.02, default: 0 },
    length: { type: "number", label: "Length", min: 0, max: 1, step: 0.02, default: 0.35, showWhen: { kind: ["full", "goatee"] } },
    fullness: { type: "number", label: "Fullness", min: 0, max: 1, step: 0.02, default: 0.6, showWhen: { kind: ["full"] } },
    amount: { type: "number", label: "Stubble density", min: 0, max: 1, step: 0.02, default: 0.6, showWhen: { kind: ["stubble"] } },
    curl: { type: "number", label: "Handlebar curl", min: 0, max: 1, step: 0.02, default: 0, showWhen: { kind: ["moustache"] } },
    width: { type: "number", label: "Moustache width", min: 0.6, max: 1.4, step: 0.02, default: 1, showWhen: { kind: ["moustache"] } },
    thickness: { type: "number", label: "Moustache thickness", min: 0.3, max: 1.5, step: 0.02, default: 1, showWhen: { kind: ["moustache"] } },
  },
  apply(v, acc) {
    if (v.kind === "none") return { parts: { Beard: null } };
    const base = v.followHair ? (acc.palette.Hair?.base || "#553626") : v.color;
    const col = toHex(mix(hex(base), hex("#cfcac3"), v.greying * 0.9));
    let t = tones(col);
    if (v.kind === "stubble") { const sk = hex(acc.palette.Skin?.base || "#c98f66"); t = tones(toHex(mix(sk, hex(col), 0.55))); }
    return { parts: { Beard: { variant: v.kind, params: { length: v.length, fullness: v.fullness, amount: v.amount, curl: v.curl, width: v.width, thickness: v.thickness } } }, palette: { Beard: { ...t, spec: 0 } } };
  },
};
