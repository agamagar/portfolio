// MATERIAL: the soft clay (matte plasticine, the shader's mode 11) or any existing skin's look, drawn on
// the same head (cel, hose, felt, stone, pixel, riso, claySun, print). A skin's own palette replaces the
// parts' colours and locks the skin tone to it; hair and eye colours can still override.
import { skinById, SKINS } from "../../faceSkins";
export default {
  id: "material", label: "Material", order: 10,
  params: {
    kind: { type: "select", label: "Look", default: "clay", options: [["clay", "Soft clay"], ...SKINS.filter((s) => s.mode !== "fit" && s.mode !== "noir").map((s) => [s.id, s.label])] },
    grain: { type: "number", label: "Surface detail", min: 0, max: 1, step: 0.02, default: 0.6 },
    warmth: { type: "number", label: "Subsurface warmth", min: 0, max: 1, step: 0.02, default: 0.6 },
  },
  apply(v) {
    if (v.kind === "clay") return { material: { mode: "plast", bump: v.grain, sss: v.warmth }, lockSkin: false };
    const sk = skinById(v.kind);
    return { material: { mode: sk.mode, bump: 0, sss: 0 }, palette: Object.fromEntries(Object.entries(sk.parts).map(([k, p]) => [k, { ...p }])), lockSkin: true };
  },
};
