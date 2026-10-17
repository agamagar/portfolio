// THE CLAY'S FLOOD, shared by the morph's timeline (mascotMorph.js) and the page's light (Hello.jsx),
// so the face's bloom and the page's wave are one light event on one clock. No three.js here: the
// landing page imports it without pulling the renderer into its chunk.
//
// The face develops from deep inside out: everything deeper than devAt(t) px from the outline has
// its flat skin colour (the pale mass), everything deeper than devSAt(t) its clay shading. Between
// the two fronts the face is pale and bright: that band is the face's glow. flood(t) is its width,
// 0..1, and FLOOD_PEAK the t where it is widest, which is where the page's wave leaves the face.
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// THE ONE CLOCK. The morph runs t 0..1 over DURATION ms of real time through RAMP, and the page's light
// wave is laid out on that same t (Hello.jsx: its radius is linear in t), so the face and the wave share
// one tempo beat for beat: the same quick start, the same slow-motion stretch, the same settle.
export const DURATION = 3800; // ms for t 0..1 (no turn since 11 Oct, so a little shorter than the test page's 4.2 s)
// SPEED RAMP (Agam, 2026-10-11: "the 3D face reveal should be speed ramped"): one remap of
// the morph's clock, real time u -> timeline t, so every track (the slide, the colour, the
// grow, the thinning) ramps together like a film speed ramp: quick as the lines start to move
// and the clay floods in, slow motion while the form resolves (t about 0.40 to 0.72), a quick
// settle, then an ease into the hold. A monotone cubic through these keys (Fritsch-Carlson, so
// it never runs backwards or overshoots); its slope is the playback speed.
export const RAMP = [[0, 0], [0.18, 0.4], [0.62, 0.72], [0.85, 0.96], [1, 1]];
export const ramp = (() => {
  const x = RAMP.map((k) => k[0]), y = RAMP.map((k) => k[1]);
  const d = x.slice(1).map((xi, i) => (y[i + 1] - y[i]) / (xi - x[i]));
  const m = [d[0], ...d.slice(1).map((di, i) => (di * d[i] <= 0 ? 0 : (2 * di * d[i]) / (di + d[i]))), 0];
  m[0] = Math.max(0, (3 * d[0] - m[1]) / 2); // the start is quick; the end stops (slope 0) into the hold
  return (u) => {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let i = 0;
    while (u > x[i + 1]) i++;
    const h = x[i + 1] - x[i], s = (u - x[i]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * y[i + 1] + (s3 - s2) * h * m[i + 1];
  };
})();

const span = (t, a, b) => clamp01((t - a) / (b - a));
const inOutQ = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const lerp = (a, b, k) => a + (b - a) * k;

// 17 Oct: "the face glow reveal is lagging behind the page reveal, start it earlier". The fronts used to start at
// 0.08 / 0.12, so the glow only showed (flood >= 0.1) at t 0.21, ~0.1 t after the page's first element (t 0.12).
// Now the flat colour's front starts before t 0 (it has already moved when the clock starts) and the glow is
// visible by t 0.116: with the page's first element, never after it. Same end state, same finish.
export const DEV = [-0.04, 0.74]; // the flat colour's front, 360 px deep to the outline
export const DEV_S = [0, 0.84]; // the shading's front, a little behind
export const devAt = (t) => (t < DEV[0] ? 1e4 : lerp(360, -2, inOutQ(span(t, DEV[0], DEV[1]))));
export const devSAt = (t) => (t < DEV_S[0] ? 1e4 : lerp(350, -2, inOutQ(span(t, DEV_S[0], DEV_S[1]))));
// the clay's flat skin (morphRenderer's uFlatSkin, #f2dcc6): the colour the face glows in
export const FLOOD_RGB = [242, 220, 198];

const width = (t) => Math.max(0, Math.min(devSAt(t), 360) - Math.min(devAt(t), 360));
let peak = 0, max = 1e-6;
for (let t = DEV_S[0]; t <= DEV_S[1]; t += 0.0025) { const w = width(t); if (w > max) { max = w; peak = t; } }
export const FLOOD_PEAK = peak; // ~0.465
export const flood = (t) => clamp01(width(t) / max);
