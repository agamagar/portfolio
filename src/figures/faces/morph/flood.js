// THE CLAY'S FLOOD, shared by the morph's timeline (mascotMorph.js) and the page's light (Hello.jsx),
// so the face's bloom and the page's wave are one light event on one clock. No three.js here: the
// landing page imports it without pulling the renderer into its chunk.
//
// The face develops from deep inside out: everything deeper than devAt(t) px from the outline has
// its flat skin colour (the pale mass), everything deeper than devSAt(t) its clay shading. Between
// the two fronts the face is pale and bright: that band is the face's glow. flood(t) is its width,
// 0..1, and FLOOD_PEAK the t where it is widest, which is where the page's wave leaves the face.
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const span = (t, a, b) => clamp01((t - a) / (b - a));
const inOutQ = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const lerp = (a, b, k) => a + (b - a) * k;

export const DEV = [0.08, 0.78]; // the flat colour's front, 360 px deep to the outline
export const DEV_S = [0.12, 0.84]; // the shading's front, a little behind
export const devAt = (t) => (t < DEV[0] ? 1e4 : lerp(360, -2, inOutQ(span(t, DEV[0], DEV[1]))));
export const devSAt = (t) => (t < DEV_S[0] ? 1e4 : lerp(350, -2, inOutQ(span(t, DEV_S[0], DEV_S[1]))));
// the clay's flat skin (morphRenderer's uFlatSkin, #f2dcc6): the colour the face glows in
export const FLOOD_RGB = [242, 220, 198];

const width = (t) => Math.max(0, Math.min(devSAt(t), 360) - Math.min(devAt(t), 360));
let peak = 0, max = 1e-6;
for (let t = DEV_S[0]; t <= DEV_S[1]; t += 0.0025) { const w = width(t); if (w > max) { max = w; peak = t; } }
export const FLOOD_PEAK = peak; // ~0.465
export const flood = (t) => clamp01(width(t) / max);
