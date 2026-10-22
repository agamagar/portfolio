// colour helpers shared by the face system's modules
export const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const toHex = (c) => "#" + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
export const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// a part's three tones from one colour: lit, turning away (warmer, darker), core shadow
// a part's three tones from one colour: lit, turning away (warmer, darker), core shadow. Near-black colours (black hair, deep skin)
// are lifted for the lit tone so the form still reads in the shading (the colour you asked for stays the shade of the part)
export const tones = (h) => {
  let c = hex(h); const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  if (l < 80) c = mix(c, [128, 104, 92], ((80 - l) / 80) * 0.42);
  return { base: toHex(c), shade: toHex(mix(c, [c[0] * 0.62 + 18, c[1] * 0.5, c[2] * 0.44], 0.85)), deep: toHex(c.map((v, i) => v * [0.36, 0.3, 0.28][i])) };
};
