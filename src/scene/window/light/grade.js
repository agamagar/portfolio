// The grade, as TSL: what a camera and a colourist do to the light the scene
// renders, per look (params.grade, light/params.light.js).
//
//   scene-linear (before the tone mapper, post.js):
//     + veiling glare (a share of the frame's mean light everywhere: the phone's
//       lifted blacks), x white balance, x exposure (light/exposure.js),
//       a hue band turned about the grey axis (grade.hueBand, Cyberpunk only),
//       saturation around luminance, contrast around mid grey in log2
//   display (after the tone mapper): lift, gamma, a split tone (grade.split,
//     Cyberpunk only), vignette
//   the sky (the dome's material, engine.js): the colour of the hour and the
//     weather on the Living Sky plate's luminance (gradeSky, updateSkyGrade).

import * as THREE from "three/webgpu";
import { uniform, vec3, float, mix, max, min, pow, log2, exp2, dot, smoothstep, screenUV, length, uv, atan, abs, mod, cos, sin, cross, sqrt } from "three/tsl";

const LUMA = vec3(0.2126, 0.7152, 0.0722);

export function createGradeUniforms() {
  return {
    exposure: uniform(1),
    flare: uniform(new THREE.Color(0, 0, 0)), // scene units, added
    wb: uniform(new THREE.Vector3(1, 1, 1)),
    saturation: uniform(1),
    contrast: uniform(1),
    mid: uniform(0.18),
    lift: uniform(0),
    dispSat: uniform(1),
    gamma: uniform(1),
    vignette: uniform(0),
    vignetteRound: uniform(0.65),
    // the hue band (grade.hueBand): amount, and the angles in radians
    hbAmt: uniform(0),
    hbCentre: uniform(0),
    hbHalf: uniform(0),
    hbFeather: uniform(1),
    hbAngle: uniform(0),
    // ... weighted by the colour's chroma against its grey (0 at satLo, full at satHi):
    // a low-chroma cream or olive near the band's edge never splits into blotches
    hbSatLo: uniform(0),
    hbSatHi: uniform(1e-4),
    // the split tone (grade.split): unit-luminance tints, amounts and ranges
    spShadow: uniform(new THREE.Vector3(1, 1, 1)),
    spShadowAmt: uniform(0),
    spLo: uniform(0.02),
    spLoTo: uniform(0.2),
    spHigh: uniform(new THREE.Vector3(1, 1, 1)),
    spHighAmt: uniform(0),
    spHi: uniform(0.45),
    spHiTo: uniform(0.9),
    // ... the shadow tint held off saturated colours (display saturation, max-min over
    // max: none from keepSat[1], all below keepSat[0]): a neon sign or a lit stile
    // keeps its own colour, the near-neutral room takes the tint
    spSatLo: uniform(10),
    spSatHi: uniform(11),
  };
}

// The grey axis and two unit vectors across it (U1 x U2 = K): a hue is the angle
// of a colour's projection on the plane they span (red 30, green 150, blue 270 deg)
const GREY_K = vec3(1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3));
const GREY_U1 = vec3(1 / Math.SQRT2, -1 / Math.SQRT2, 0);
const GREY_U2 = vec3(1 / Math.sqrt(6), 1 / Math.sqrt(6), -2 / Math.sqrt(6));

// Turn the hues within a band about the grey axis (Rodrigues' rotation about K):
// a positive angle moves green toward cyan. Neutral pixels are fixed points.
export function hueBand(c, g) {
  const x = dot(c, GREY_U1), y = dot(c, GREY_U2);
  const h = atan(y, x);
  const d = abs(mod(h.sub(g.hbCentre).add(Math.PI), 2 * Math.PI).sub(Math.PI));
  // chroma relative to the grey component (a pure primary about 1.4, a cream 0.2)
  const sat = sqrt(x.mul(x).add(y.mul(y))).div(max(dot(c, GREY_K), 1e-6));
  const w = float(1).sub(smoothstep(g.hbHalf, g.hbHalf.add(g.hbFeather), d)).mul(smoothstep(g.hbSatLo, g.hbSatHi, sat));
  const a = g.hbAngle.mul(g.hbAmt).mul(w);
  const ca = cos(a);
  return c.mul(ca).add(cross(GREY_K, c).mul(sin(a))).add(GREY_K.mul(dot(GREY_K, c)).mul(float(1).sub(ca)));
}

// The split tone in display space: the shadows lean to one unit-luminance tint and
// the highlights to another, luminance kept
export function splitTone(c, g) {
  const L = dot(c, LUMA);
  const cMax = max(max(c.x, c.y), c.z), cMin = min(min(c.x, c.y), c.z);
  const sat = cMax.sub(cMin).div(max(cMax, 1e-5));
  const ws = float(1).sub(smoothstep(g.spLo, g.spLoTo, L)).mul(g.spShadowAmt).mul(float(1).sub(smoothstep(g.spSatLo, g.spSatHi, sat)));
  const wh = pow(smoothstep(g.spHi, g.spHiTo, L), float(1.5)).mul(g.spHighAmt);
  return c.mul(float(1).sub(ws).sub(wh)).add(vec3(g.spShadow).mul(L).mul(ws)).add(vec3(g.spHigh).mul(L).mul(wh));
}

// opts.hueBand: build the hue band (post.js decides; off, the graph is unchanged)
export function gradeSceneLinear(hdr, g, opts = {}) {
  let c = hdr.add(vec3(g.flare)).mul(g.wb).mul(g.exposure);
  if (opts.hueBand) c = hueBand(c, g);
  const l = max(dot(c, LUMA), 1e-6);
  c = mix(vec3(l), c, g.saturation);
  // contrast in log2 around the pivot, applied to luminance (hue kept)
  const l2 = max(dot(c, LUMA), 1e-6);
  const lc = exp2(log2(l2.div(g.mid)).mul(g.contrast)).mul(g.mid);
  return max(c.mul(lc.div(l2)), vec3(0));
}

// opts.split: build the split tone (post.js decides; off, the graph is unchanged)
export function gradeDisplay(ldr, g, opts = {}) {
  // saturation after the tone mapper: AgX greys the brights (a sky at 1.5x the
  // screen's white comes out almost white), a phone keeps them pale blue
  const dl = dot(ldr, LUMA);
  let c = max(mix(vec3(dl), ldr, g.dispSat), vec3(0));
  // lift (blacks up, whites held), then gamma
  c = c.mul(float(1).sub(g.lift)).add(g.lift);
  c = pow(max(c, vec3(0)), vec3(float(1).div(g.gamma)));
  if (opts.split) c = splitTone(c, g);
  // vignette: cos^4-ish falloff toward the corners, round or rectangular
  const p = screenUV.sub(0.5).mul(2);
  const rRound = length(p).mul(1 / Math.SQRT2);
  const rRect = max(p.x.abs(), p.y.abs());
  const r = mix(rRect, rRound, g.vignetteRound);
  const v = float(1).sub(g.vignette.mul(smoothstep(0.4, 1.0, r)));
  return c.mul(v);
}

// The sky: uniforms live on the engine's uniform bag (buildSkyDome has no scene),
// the light rig sets them every frame (updateSkyGrade, below).
//
// The Living Sky plate keeps its luminance (the clouds' shapes, the gradients, the
// drift) and takes its COLOUR from the hour: a table of sky colours keyed by the
// sun's altitude (GRADE_PARAMS.sky.keys: zenith, horizon, sunlit cloud tops,
// cloud bases), bent for dawn (pinker, paler), the afternoon haze (paler and
// warmer than the morning), and the cloud cover (a deck greys the sky, rain and
// storm darken it). The plate alone draws the home band's palette: a salmon dusk
// and a violet night, which a north window never shows.
export function skyGradeUniforms(bag) {
  if (!bag.skyGrade) {
    const C = (r, g, b) => uniform(new THREE.Color(r, g, b));
    bag.skyGrade = {
      mean: uniform(0.2), // the plate's mean luminance (the key for "brighter than the sky")
      zenith: C(0.5, 0.8, 1.6), // unit-luminance linear colours
      horizon: C(0.9, 1, 1.1),
      cloudLit: C(1, 1, 1),
      cloudBase: C(0.9, 1, 1.1),
      recolor: uniform(0), // 0 = the plate as drawn, 1 = the table's colours
      horizonTop: uniform(0.35), // plate v where the horizon colour has given way to the zenith's
      cloudLo: uniform(0.9), // plate luminance / its mean: where cloud starts
      cloudHi: uniform(1.35), // and where it is all cloud
      litLo: uniform(1.2), // where the sunlit tops start
      litHi: uniform(2.0),
      litGain: uniform(1), // brightness of the sunlit tops (the golden hour's clip)
      dim: uniform(1), // the weather's dimming of the whole sky
      saturation: uniform(1),
      contrast: uniform(1),
      satCloud: uniform(0), // 0..1: grey plate pixels count as cloud (the shaded undersides)
      plateCloud: uniform(0), // 0..1: take the cloud mask from the plate's own cover (its alpha)
      hazeTop: uniform(0.06), // plate v under which the horizon reads as haze
      haze: uniform(0), // how much: cloud and sky there fade to the haze colour
      hazeCol: C(1, 1, 1), // unit-luminance linear
    };
  }
  return bag.skyGrade;
}

export function gradeSky(rgb, bag) {
  const s = skyGradeUniforms(bag);
  const l = max(dot(rgb, LUMA), 1e-5);
  const rel = l.div(max(s.mean, 1e-4));
  // What is cloud: brighter than the sky's mean, OR greyer than clear sky at
  // that elevation. By luminance alone a cumulus's shaded underside (about the
  // sky's brightness) was painted sky blue, and only the lit tops kept a cloud
  // colour: flat gold shapes with no grey bases (round 2). The plate's clear sky
  // loses saturation toward the horizon (measured at 17:41: 0.65 at the zenith,
  // 0.30 at mid height, 0.08 on the horizon), its cloud stays at 0.1 to 0.2; the
  // last 10% above the horizon, where haze is as grey as cloud, is left to the
  // luminance test.
  const v = uv().y.clamp(0, 1);
  const mx = max(rgb.x, max(rgb.y, rgb.z));
  const sat = mx.sub(min(rgb.x, min(rgb.y, rgb.z))).div(max(mx, 1e-5));
  const skySat = float(0.08).add(pow(v, float(1.3)).mul(0.6));
  const grey = float(1).sub(smoothstep(0.45, 0.8, sat.div(skySat))).mul(smoothstep(0.1, 0.2, v)).mul(s.satCloud);
  const cloudLum = max(smoothstep(s.cloudLo, s.cloudHi, rel), grey);
  // THE PLATE'S OWN COVER (loop 2): the window build writes its cloud coverage c
  // into alpha as 1 - 0.25 c (living-sky.frag). A mask from luminance ratios put
  // the colour edge on a brightness contour: hard gold cut-outs with bright rims
  // (the 17:41 critics); the shader's c has the cloud's own soft edge. The engine
  // hands this function texture(plate).rgb, so the texture is that swizzle's node.
  const src = rgb && rgb.isSplitNode && rgb.node && rgb.node.isTextureNode ? rgb.node : null;
  const cover = src ? float(1).sub(src.a).mul(4).clamp(0, 1) : cloudLum;
  const cloud = mix(cloudLum, max(cover, grey.mul(0.5)), s.plateCloud);
  const lit = smoothstep(s.litLo, s.litHi, rel);
  // the plate's v is the elevation (0 on the horizon)
  const sky = mix(vec3(s.horizon), vec3(s.zenith), smoothstep(0, s.horizonTop, uv().y.max(0)));
  const cl = mix(vec3(s.cloudBase), vec3(s.cloudLit), lit);
  let target = mix(sky, cl, cloud);
  // the horizon band is haze: sky and cloud both dissolve into it
  const hz = float(1).sub(smoothstep(0, s.hazeTop, v)).mul(s.haze);
  target = mix(target, vec3(s.hazeCol), hz);
  let c = mix(rgb, target.mul(l), s.recolor);
  c = c.mul(mix(float(1), s.litGain, lit.mul(cloud))).mul(s.dim);
  const lc = max(dot(c, LUMA), 1e-5);
  // saturation around the luminance, capped where a channel would go below 0 (a
  // clamp there turns a deep navy violet; the cap keeps the hue)
  const dn = max(vec3(lc).sub(c), vec3(1e-6));
  const kch = vec3(lc).div(dn);
  const kmax = min(kch.x, min(kch.y, kch.z)).mul(0.98);
  c = mix(vec3(lc), c, min(s.saturation, max(kmax, 1)));
  const lk = exp2(log2(lc.div(s.mean)).mul(s.contrast)).mul(s.mean);
  return max(c.mul(lk.div(lc)), vec3(0));
}

// --- the table, on the CPU -------------------------------------------------------------
const _a = new THREE.Color();
const _b = new THREE.Color();
const _c = new THREE.Color();
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smoothJs = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lumOf = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
// a display hex as a unit-luminance linear colour
function unitColor(hex, out) {
  out.set(hex);
  const l = Math.max(1e-5, lumOf(out));
  return out.multiplyScalar(1 / l);
}
// scale a unit-luminance colour's chroma around its luminance (1), along the
// line from white through it (its hue kept): capped where a channel reaches 0,
// since clamping a channel there would turn the hue (a navy goes violet)
function chroma(c, k) {
  let kmax = Infinity;
  for (const v of [c.r, c.g, c.b]) if (v < 1) kmax = Math.min(kmax, 1 / (1 - v));
  k = Math.min(k, kmax * 0.97);
  c.r = Math.max(0, 1 + (c.r - 1) * k);
  c.g = Math.max(0, 1 + (c.g - 1) * k);
  c.b = Math.max(0, 1 + (c.b - 1) * k);
  const l = Math.max(1e-5, lumOf(c));
  return c.multiplyScalar(1 / l);
}
// the key colour for `field` at this altitude (log-free linear blend of the two keys around it)
function keyAt(keys, alt, field, out) {
  let i = 0;
  while (i < keys.length - 2 && alt > keys[i + 1].alt) i++;
  const k0 = keys[i], k1 = keys[Math.min(keys.length - 1, i + 1)];
  const t = k1.alt === k0.alt ? 0 : clamp01((alt - k0.alt) / (k1.alt - k0.alt));
  unitColor(k0[field], _a);
  unitColor(k1[field], _b);
  return out.copy(_a).lerp(_b, t);
}

// Everything the sky's colour depends on, per frame. S = params.grade.sky, sw the
// SceneWeather.
export function updateSkyGrade(u, S, sw, { mean }) {
  const alt = sw?.sun?.alt ?? 30;
  const keys = S.keys;
  u.mean.value = mean;
  // the cloud cover the colours see: the deck (low and mid), or the total
  const cl = sw?.cloud || {};
  const deck = Number.isFinite(cl.low) && Number.isFinite(cl.mid) ? 1 - (1 - cl.low) * (1 - cl.mid) : cl.total ?? 0.4;
  const wet = sw?.rain?.active ? 1 : 0;
  // how grey the sky goes: a deck from about 60% cover, all of it in rain
  const grey = Math.max(smoothJs(0.55, 0.95, deck), wet);
  const tod = sw?.tod ?? 12;
  const morning = tod < 12 ? 1 : 0;
  // dawn: the same altitudes as dusk, pinker and paler
  const dawn = morning * (1 - smoothJs(4, 12, alt)) * smoothJs(-14, -4, alt);
  // the afternoon haze: paler and warmer than the morning
  const haze = (1 - morning) * smoothJs(12, 15.5, tod) * smoothJs(6, 20, alt);
  // the clear morning: deeper and cleaner (sun 15 to 50 deg, before 10:30)
  const clearAm = morning * (1 - smoothJs(9.5, 11, tod)) * smoothJs(10, 20, alt);

  const set = (uni, field, k) => {
    keyAt(keys, alt, field, _c);
    if (dawn > 0 && S.dawn?.[field]) {
      unitColor(S.dawn[field], _a);
      _c.lerp(_a, dawn * (S.dawn.mix ?? 0.5));
    }
    if (haze > 0 && S.haze?.[field]) {
      unitColor(S.haze[field], _a);
      _c.lerp(_a, haze * (S.haze.mix ?? 0.3));
    }
    if (clearAm > 0 && S.morning?.[field]) {
      unitColor(S.morning[field], _a);
      _c.lerp(_a, clearAm * (S.morning.mix ?? 0.5));
    }
    chroma(_c, k * (1 - dawn * (S.dawn?.desaturate ?? 0)) * (1 - grey * (S.greyDesaturate ?? 0.9)));
    uni.value.copy(_c);
  };
  const sat = S.chroma ?? 1;
  set(u.zenith, "zenith", sat);
  set(u.horizon, "horizon", sat);
  set(u.cloudLit, "cloudLit", sat * (S.gold ?? 1) * (1 - 0.7 * smoothJs(0.6, 0.95, deck)));
  set(u.cloudBase, "cloudBase", sat);
  u.recolor.value = S.recolor ?? 0;
  u.horizonTop.value = S.horizonTop ?? 0.35;
  u.cloudLo.value = S.cloudLo ?? 0.9;
  u.cloudHi.value = S.cloudHi ?? 1.35;
  u.litLo.value = S.litLo ?? 1.2;
  u.litHi.value = S.litHi ?? 2.0;
  // the sunlit tops clip in the golden hour (the 17:41 photo: 21% of the gold
  // panes at 255): brighter by litGain while the sun is low and the deck broken
  const golden = smoothJs(-1.5, 2, alt) * (1 - smoothJs(10, 18, alt)) * (1 - grey);
  u.litGain.value = 1 + ((S.litGain ?? 1) - 1) * golden;
  // the weather's darkness is in the sky's gain (light/exposure.js weatherDim)
  u.dim.value = 1;
  u.saturation.value = S.saturation ?? 1;
  u.contrast.value = S.contrast ?? 1;
  u.satCloud.value = S.satCloud ?? 0;
  u.plateCloud.value = S.plateCloud ?? 0;
  u.hazeTop.value = S.hazeTop ?? 0.06;
  u.haze.value = (Number.isFinite(S.hazeBand) ? S.hazeBand : 0) * (1 - 0.6 * grey);
  if (S.hazeColor) unitColor(S.hazeColor, u.hazeCol.value);
  else keyAt(keys, alt, "horizon", u.hazeCol.value);
}
