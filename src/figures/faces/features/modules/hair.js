// HAIR: a style (a file in hairStyles/ with the builder defaults it sets), then the sliders that override it: length, fringe,
// messiness, volume, side sweep, colour, greying, and the clip. A style may also switch the builder's modes (cap: none / ring /
// crest / curly, bun, braid, quiff): those come from the style file, not from sliders.
import { tones, hex, toHex, mix } from "../util";
const styles = Object.values(import.meta.glob("../hairStyles/*.js", { eager: true })).map((m) => m.default);
export const styleDefaults = (id) => (styles.find((s) => s.id === id) || styles[0]).defaults;
export default {
  id: "hair", label: "Hair", order: 30,
  params: {
    style: { type: "select", label: "Style", default: "shoulder-messy", resets: ["length", "fringe", "messiness", "volume", "sweep"], options: styles.map((s) => [s.id, s.label]) },
    length: { type: "number", label: "Length (crop to shoulder)", min: 0, max: 1, step: 0.01, default: null, fromStyle: true },
    fringe: { type: "number", label: "Fringe", min: 0, max: 1, step: 0.01, default: null, fromStyle: true },
    messiness: { type: "number", label: "Messiness", min: 0, max: 1, step: 0.01, default: null, fromStyle: true },
    volume: { type: "number", label: "Volume", min: 0.85, max: 1.25, step: 0.01, default: null, fromStyle: true },
    sweep: { type: "number", label: "Fringe sweep (left to right)", min: -1, max: 1, step: 0.02, default: null, fromStyle: true },
    color: { type: "color", label: "Colour", default: "#553626" },
    greying: { type: "number", label: "Greying", min: 0, max: 1, step: 0.02, default: 0 },
    clip: { type: "bool", label: "Lavender clip", default: false },
    seed: { type: "number", label: "Shuffle", min: 1, max: 40, step: 1, default: 7 },
  },
  apply(v) {
    const d = styleDefaults(v.style), pick = (k) => (v[k] ?? d[k]);
    // every key the style sets (cap, bun, braid, quiff...) passes through; the sliders override the numeric ones
    const hair = { ...d, length: pick("length"), fringe: pick("fringe"), messiness: pick("messiness"), volume: pick("volume"), sweep: pick("sweep"), clip: v.clip, seed: v.seed };
    const col = toHex(mix(hex(v.color), hex("#cfcac3"), v.greying * 0.9));
    return { hair, palette: { Hair: { ...tones(col), spec: 0 }, HatBand: tones("#b9a2e0") } };
  },
};
