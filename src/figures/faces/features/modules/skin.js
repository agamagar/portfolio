// SKIN TONE: one slider from light to deep; the three tones of the skin colour follow. (Ignored while a
// material that brings its own skin colour, like cel or hose, is worn.)
import { tones, hex, toHex, mix } from "../util";
// light peach through to deep brown-black (the Desi-Log pack runs the whole range); `undertone` leans the hue
const ANCHORS = ["#f6dfc9", "#eec9a6", "#dfae85", "#c68e63", "#a56b48", "#835034", "#5f3a28", "#3f261b"].map(hex);
export default {
  id: "skin", label: "Skin", order: 20,
  params: { tone: { type: "number", label: "Tone (light to deep)", min: 0, max: 1, step: 0.01, default: 0.4 },
    undertone: { type: "number", label: "Undertone (cool rose to warm olive)", min: -1, max: 1, step: 0.02, default: 0 },
    blush: { type: "number", label: "Warmth in the shade", min: 0, max: 1, step: 0.02, default: 0.5 } },
  apply(v, acc) {
    if (acc.lockSkin) return {};
    const f = Math.min(0.9999, v.tone) * (ANCHORS.length - 1), i = Math.floor(f), c = mix(ANCHORS[i], ANCHORS[i + 1], f - i);
    // undertone: warm pushes red and yellow up, cool pulls green down toward rose
    const u = v.undertone || 0, cu = [c[0] + 6 * u, c[1] + 3 * u - 4 * Math.max(0, -u), c[2] - 8 * u];
    const t = tones(toHex(cu));
    // the shade leans red with `blush`
    const sh = hex(t.shade); sh[0] += 14 * v.blush; sh[2] -= 6 * v.blush;
    return { palette: { Skin: { ...t, shade: toHex(sh), spec: 0 }, Mouth: tones(toHex(mix(c, [150, 70, 55], 0.4))) } };
  },
};
