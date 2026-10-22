// ACCESSORIES: glasses (round, rectangular), bindi, tilak, earrings (hoops, studs), nose pin (features/parts/*).
import { tones } from "../util";
import { variantsOf } from "../parts";
const G = variantsOf("Glasses");
export default {
  id: "accessories", label: "Accessories", order: 37,
  params: {
    glasses: { type: "select", label: "Glasses", default: "none", options: [["none", "None"], ...G.map((v) => [v.id, v.label])] },
    glassesColor: { type: "color", label: "Frame colour", default: "#26211f" },
    lensSize: { type: "number", label: "Lens size", min: 0.8, max: 1.3, step: 0.02, default: 1, showWhen: { glasses: ["round", "square"] } },
    frameWeight: { type: "number", label: "Frame weight", min: 0.5, max: 2, step: 0.05, default: 1, showWhen: { glasses: ["round", "square"] } },
    bindi: { type: "bool", label: "Bindi", default: false },
    bindiColor: { type: "color", label: "Bindi colour", default: "#b3261e" },
    bindiSize: { type: "number", label: "Bindi size", min: 0.5, max: 2, step: 0.05, default: 1, showWhen: { bindi: [true] } },
    tilak: { type: "bool", label: "Tilak", default: false },
    tilakColor: { type: "color", label: "Tilak colour", default: "#c2410c" },
    earrings: { type: "select", label: "Earrings", default: "none", options: [["none", "None"], ["hoops", "Hoops"], ["studs", "Studs"]] },
    earringSize: { type: "number", label: "Earring size", min: 0.6, max: 1.8, step: 0.05, default: 1, showWhen: { earrings: ["hoops", "studs"] } },
    metal: { type: "color", label: "Metal colour", default: "#d9a73a" },
    nosePin: { type: "select", label: "Nose pin", default: "none", options: [["none", "None"], ["1", "Right"], ["-1", "Left"]] },
  },
  apply(v) {
    const parts = {}, palette = {};
    parts.Glasses = v.glasses === "none" ? null : { variant: v.glasses, params: { size: v.lensSize, thick: v.frameWeight } };
    if (v.glasses !== "none") palette.Glasses = { ...tones(v.glassesColor), spec: 0 };
    parts.Bindi = v.bindi ? { variant: "dot", params: { size: v.bindiSize } } : null; if (v.bindi) palette.Bindi = { ...tones(v.bindiColor), spec: 0 };
    parts.Tilak = v.tilak ? { variant: "stripe", params: {} } : null; if (v.tilak) palette.Tilak = { ...tones(v.tilakColor), spec: 0 };
    parts.Earring = v.earrings === "none" ? null : { variant: "hoops", params: { size: v.earringSize, studs: v.earrings === "studs" ? 1 : 0 } };
    parts.NosePin = v.nosePin === "none" ? null : { variant: "stud", params: { side: +v.nosePin } };
    if (parts.Earring) palette.Earring = { ...tones(v.metal), spec: 0 };
    if (parts.NosePin) palette.NosePin = { ...tones(v.metal), spec: 0 };
    return { parts, palette };
  },
};
