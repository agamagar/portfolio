// SKIN TONE: one slider from light to deep; the three tones of the skin colour follow. (Ignored while a
// material that brings its own skin colour, like cel or hose, is worn.)
import { tones, hex, toHex, mix } from "../util";
const ANCHORS = ["#f6dfc9", "#e8bf9a", "#d29c72", "#b57a52", "#8a5638", "#5e3a27"].map(hex);
export default {
  id: "skin", label: "Skin", order: 20,
  params: { tone: { type: "number", label: "Tone (light to deep)", min: 0, max: 1, step: 0.01, default: 0.4 },
    blush: { type: "number", label: "Warmth in the shade", min: 0, max: 1, step: 0.02, default: 0.5 } },
  apply(v, acc) {
    if (acc.lockSkin) return {};
    const f = Math.min(0.9999, v.tone) * (ANCHORS.length - 1), i = Math.floor(f), c = mix(ANCHORS[i], ANCHORS[i + 1], f - i);
    const t = tones(toHex(c));
    // the shade leans red with `blush`
    const sh = hex(t.shade); sh[0] += 14 * v.blush; sh[2] -= 6 * v.blush;
    return { palette: { Skin: { ...t, shade: toHex(sh), spec: 0 }, Mouth: tones(toHex(mix(c, [150, 70, 55], 0.4))) } };
  },
};
