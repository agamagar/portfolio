// The exposure model: how bright the sky is in scene units at each hour, how
// strong the sun is, and how the camera exposes what it sees. Pure functions of
// the weather, the params and the camera, so a capture at ?tod= is repeatable and
// a scroll back reverses exactly.
//
// Scene units: the monitor's white page is 1.0 (light/params.light.js).

import * as THREE from "three/webgpu";
import { setKelvin } from "three/addons/utils/ColorUtils.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Log-linear interpolation through knots (xs ascending, ys > 0).
export function logInterp(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  const n = xs.length;
  if (x >= xs[n - 1]) return ys[n - 1];
  let i = 0;
  while (i < n - 2 && x > xs[i + 1]) i++;
  const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
  return Math.exp(Math.log(ys[i]) + t * (Math.log(ys[i + 1]) - Math.log(ys[i])));
}

// The Living Sky window plate's own mean linear luminance (the sub-rect the engine
// averages, u 0.25..0.75, v 0.02..0.55) for the reference sky (wx=partly) by sun
// altitude. MEASURED on this machine with tools/window-light/runs/light/harness/
// plate.html (the plate is display-referred, so it only dims about 13x from noon
// to night; the scene needs about 1000x). Dividing by it leaves the weather's own
// difference (a rain deck, a city-lit overcast night) in the plate.
const PLATE_REF_ALT = [-78, -27, -19.6, -17.6, -12.3, -10.3, -7.15, -4.95, -2.97, -1.3, 0.68, 2.36, 4.34, 7.03, 11.63, 16.95, 26.2, 31.5, 54.5, 75.5];
const PLATE_REF_Y = [0.0434, 0.044, 0.0474, 0.0499, 0.0784, 0.088, 0.102, 0.1085, 0.1075, 0.1155, 0.1223, 0.1394, 0.1606, 0.2076, 0.327, 0.5017, 0.5641, 0.5692, 0.5727, 0.5668];
export function plateRef(alt) {
  return logInterp(PLATE_REF_ALT, PLATE_REF_Y, alt);
}

// Sky luminance in scene units for the reference sky at this sun altitude.
export function skyTarget(P, alt) {
  const S = P.exposure.sky;
  let L = logInterp(S.alt, S.lum, alt);
  // the night lift (Heightened, Dreamlike): only once the blue hour is over
  // (about 45 min after sunset, -10 deg), so the blue hour stays deep (round 2:
  // at 18:39, -7.3 deg, it lifted Dreamlike's sky 1.4x into a milky grey-blue)
  const lift = S.nightLift ?? 1;
  if (lift !== 1) L *= 1 + (lift - 1) * (1 - smooth(S.liftFrom ?? -16, S.liftTo ?? -10, alt));
  return L;
}

// The weather's own darkness of the sky, a multiplier (params.grade.sky.weather):
// a full deck, rain, a storm. The plate draws them only slightly darker than a
// clear sky (it is display-referred), where a storm sky is two stops down.
export function weatherDim(P, sw) {
  const W = P.grade?.sky?.weather;
  if (!W) return 1;
  const cl = sw?.cloud || {};
  const deck = Number.isFinite(cl.low) && Number.isFinite(cl.mid) ? 1 - (1 - cl.low) * (1 - cl.mid) : cl.total ?? 0.4;
  const wet = sw?.rain?.active ? 1 : 0;
  const storm = sw?.storm?.active ? 1 : 0;
  const deckDim = 1 - (1 - (W.overcast ?? 1)) * smooth(0.6, 0.95, deck) * (1 - wet);
  return deckDim * (wet ? (storm ? W.storm ?? 1 : W.rain ?? 1) : 1);
}

// THE TWO EXPOSURES (loop 2). One camera: E_true = 2^(evCal - EV100), the
// exposure a phone at that EV100 gives the physical light (the photos' own EV100
// on the capture shots, a metered EV100 live; cameraExposure below). Every light
// source the light rig owns is physical and is shown at E_true: the sky, the
// sun, the moon, the lamp, the room's return, the ceiling light. What other
// modules author as fixed glow in scene units (the screen and its hand-off, the
// motes, the fireflies, the moon's halo, the bulb) was calibrated for the old
// exposure range, so it is shown at E_render = E_true clamped to the look's range
// (params.exposure.auto min..max, plus the highlight rule). The two agree inside
// that range (every day frame, the 17:41 reference); beyond it (dusk and night:
// the 18:40 photos were exposed 60x the 17:41 one, EV100 3.7 against 9.6) the
// post applies E_render and every physical light carries the ratio
// G = E_true / E_render. G reaches the rig one frame late (the engine asks for
// the sky's gain before the camera is solved); a capture renders 32 frames.
const _gain = new WeakMap(); // params object -> G of the last solved frame
export function lightGain(P) {
  return _gain.get(P) ?? 1;
}
export function setLightGain(P, G) {
  _gain.set(P, Number.isFinite(G) && G > 0 ? G : 1);
}

// Plate to scene units, the multiplier the sky dome applies (engine.js); the
// weather's darkness is in it, so the dome, the engine's sky average, the
// window's light, the glass's scatter and the camera's key all follow it. With
// the curve off, the old flat gain with its night dimming. Times G (above): the
// dome, the sky average and everything lit by it are physical light.
export function skyGain(P, sw) {
  return skyGainPhysical(P, sw) * lightGain(P);
}
export function skyGainPhysical(P, sw) {
  const alt = sw?.sun?.alt ?? 30;
  if (!P.exposure?.sky?.enabled) {
    const night = 1 - smooth(-10, -2, alt);
    return P.sky.gain * (1 + (P.sky.nightGain - 1) * night) * weatherDim(P, sw);
  }
  return (skyTarget(P, alt) / plateRef(alt)) * weatherDim(P, sw);
}

// How golden the hour is (0..1): the sun between the horizon and about 15 deg, none
// under a rain deck.
export function goldenFactor(sw) {
  const alt = sw?.sun?.alt ?? 30;
  const g = smooth(-3, 1.5, alt) * (1 - smooth(9, 20, alt));
  const wet = sw?.rain?.active ? 0.8 : 0;
  const cover = clamp(sw?.cloud?.low ?? sw?.cloud?.total ?? 0.3, 0, 1);
  return g * (1 - wet) * (1 - 0.5 * smooth(0.75, 1, cover));
}

const _c = new THREE.Color();
// The sun's colour (linear, max channel 1) by altitude.
export function sunColor(P, alt, out = [1, 1, 1]) {
  const S = P.lights.sun;
  setKelvin(_c, S.kelvinLow + (S.kelvinHigh - S.kelvinLow) * Math.pow(smooth(0, 25, alt), 0.6));
  const m = Math.max(_c.r, _c.g, _c.b, 1e-6);
  out[0] = _c.r / m;
  out[1] = _c.g / m;
  out[2] = _c.b / m;
  return out;
}

// Direct sun illuminance in scene units (lux-like: a white lambertian surface
// square to the sun reads E / pi). Low sun is weak (haze), cloud takes most of it.
export function sunIlluminance(P, sw) {
  const alt = sw?.sun?.alt ?? -90;
  const S = P.lights.sun;
  const up = smooth(-1, 3, alt);
  if (up <= 0) return 0;
  const ratio = S.ratioLow + (S.ratioHigh - S.ratioLow) * smooth(3, 35, alt);
  const cloud = clamp(sw?.cloud?.low ?? sw?.cloud?.total ?? 0.4, 0, 1);
  const clear = (1 - 0.85 * Math.pow(cloud, 1.6)) * (sw?.rain?.active ? 0.15 : 1);
  return Math.PI * skyTarget(P, Math.max(alt, 0)) * ratio * up * clear;
}

// --- the key: what the camera sees, projected ----------------------------------------------
const _v = new THREE.Vector3();
// Clip a polygon (array of [x, y, z] in view space) to z <= -near.
function clipNear(poly, near) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const ina = a[2] <= -near, inb = b[2] <= -near;
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (-near - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, -near]);
    }
  }
  return out;
}
// Clip a 2D polygon to the square [-1, 1]^2 (Sutherland-Hodgman).
function clipSquare(poly) {
  const edges = [
    (p) => p[0] >= -1, (p) => p[0] <= 1, (p) => p[1] >= -1, (p) => p[1] <= 1,
  ];
  const cut = [
    (a, b) => (-1 - a[0]) / (b[0] - a[0]), (a, b) => (1 - a[0]) / (b[0] - a[0]),
    (a, b) => (-1 - a[1]) / (b[1] - a[1]), (a, b) => (1 - a[1]) / (b[1] - a[1]),
  ];
  let out = poly;
  for (let e = 0; e < 4 && out.length; e++) {
    const inp = out;
    out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length];
      const ia = edges[e](a), ib = edges[e](b);
      if (ia) out.push(a);
      if (ia !== ib) {
        const t = cut[e](a, b);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
  }
  return out;
}
// Fraction of the viewport a world-space quad covers (0..1).
export function coverage(corners, camera) {
  if (!corners) return 0;
  const view = corners.map((c) => _v.copy(c).applyMatrix4(camera.matrixWorldInverse).toArray());
  const vis = clipNear(view, camera.near);
  if (vis.length < 3) return 0;
  const ndc = vis.map((p) => {
    _v.fromArray(p).applyMatrix4(camera.projectionMatrix);
    return [_v.x, _v.y];
  });
  const poly = clipSquare(ndc);
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return clamp(Math.abs(a) / 2 / 4, 0, 1);
}

// The camera for this frame: { ev100, Etrue, Erender, G, key, shot }.
//
// A capture shot with a photo (params.exposure.camera.shots) takes the photo's
// own EV100: E_true = 2^(evCal - EV100). Live, the camera meters: the key is
// estimated from what it sees (the window opening at the sky's PHYSICAL light,
// the monitor, the room), and E_true = bias x (key0 / key)^adapt, where adapt
// runs from adaptDay (partial: noon reads brighter than 17:41, so the hours
// differ) at and above key0 to adaptNight (nearly full: the phone opens up at
// dusk as the 18:40 photos show) at keyNight and below, in log key. The
// highlight rule (a large bright area keeps its mean under A.hi) holds for both
// exposures. E_render = E_true clamped to A.min..A.max (see "the two exposures").
export function cameraExposure(P, bus, camera) {
  const A = P.exposure.auto;
  const Cm = P.exposure.camera || {};
  const r = bus.rects;
  const cw = r ? coverage(r.opening, camera) : 0.25;
  const cs = r ? coverage(r.screen, camera) : 0.3;
  const croom = Math.max(0, 1 - cw - cs);
  // the sky's light without the frame's gain (the rig puts both on the bus)
  const skyPhys = bus.lum.skyPhys ?? bus.lum.sky;
  const Lw = (1 - A.frameCover) * 0.85 * skyPhys + A.frameCover * A.roomLum * 2;
  // the screen counts at least as a typical page (A.screenKey of its white),
  // whatever the theme shows: the scene keeps the same exposure in both themes
  // (20-question Q09: the theme sets the hand-off, not the hour)
  const Ls = Math.max(bus.lum.screen, P.screen.white * A.screenKey);
  const key = cw * Lw + cs * Ls + croom * A.roomLum;
  bus.key = key;
  bus.debug.coverWindow = +cw.toFixed(4);
  bus.debug.coverScreen = +cs.toFixed(4);
  // the weather's own darkness (a storm reads darker than the camera would
  // expose it away: the lamp becomes the room's warm key)
  const wb = bus.weatherBias ?? 1;
  // expose for the highlights too: whatever large bright area is in frame (the
  // screen's page, the window) keeps its mean under A.hi after exposure, so a
  // white page in a dark room at dusk reads as a page, not a blown panel
  const hiL = Math.max(cs > 0.05 ? Ls : 0, cw > 0.05 ? Lw : 0);
  // a look's extra opening at dusk (Photo-true: the phone let the page go
  // brighter at dusk; 1 = none), applied after the highlight rule as before
  const dbSet = A.duskBoost ?? 1;
  const db = dbSet !== 1 ? 1 + (dbSet - 1) * smooth(A.duskFrom ?? 1, A.duskTo ?? -6, bus.sunAlt ?? 10) : 1;
  // a look's own highlight rule after dark (nightHi, eased in with the dusk boost's
  // ramp; null = A.hi always): Cyberpunk lets the runway's room keep its light when
  // the screen fills the frame, where the rule had pinned the physical lights 10x
  // under the hero's (the authored screen, at E_render, is not moved)
  const hiSet = Number.isFinite(A.nightHi) ? A.hi + (A.nightHi - A.hi) * smooth(A.duskFrom ?? 1, A.duskTo ?? -6, bus.sunAlt ?? 10) : A.hi;
  const hiCap = (hiL > 1e-4 ? hiSet / hiL : Infinity) * db;
  const evCal = Cm.evCal ?? 9.6;
  const shotEV = bus.shot && Cm.shots ? Cm.shots[bus.shot] : undefined;
  const k0 = A.key0, kn = Cm.keyNight ?? 0.02;
  const meter = (adapt) => (A.bias ?? 1) * wb * db * Math.pow(k0 / Math.max(key, 1e-5), adapt);
  // the display exposure: the metered model the authored glow was fitted under
  // (partial adaptation, the highlight rule, the look's range), in every frame
  const Erender = A.enabled ? clamp(Math.min(meter(A.adapt), hiCap), A.min, A.max) : (A.bias ?? 1) * wb;
  let Etrue;
  if (Number.isFinite(shotEV)) {
    // the photo's exposure, as shot (no metering, no highlight rule)
    Etrue = (A.bias ?? 1) * Math.pow(2, evCal - shotEV);
  } else if (!A.enabled) {
    Etrue = Erender;
  } else {
    const t = smooth(0, 1, Math.log(k0 / Math.max(key, 1e-6)) / Math.log(k0 / kn));
    const adapt = (Cm.adaptDay ?? A.adapt) + ((Cm.adaptNight ?? A.adapt) - (Cm.adaptDay ?? A.adapt)) * t;
    // at and above key0 this is the display exposure itself (G = 1 by day)
    Etrue = Math.min(meter(adapt), hiCap, Cm.maxTrue ?? 256);
  }
  const G = Etrue / Math.max(Erender, 1e-6);
  const ev100 = evCal - Math.log2(Math.max(Etrue, 1e-9) / (A.bias ?? 1));
  bus.debug.exposureKey = +Etrue.toFixed(4);
  // the frame's mean light in the image's scene units (what the lens veils): the
  // physical part carries G, the screen's authored page does not
  bus.keyImage = (cw * Lw + croom * A.roomLum) * G + cs * Ls;
  return { ev100, Etrue, Erender, G, key, shot: Number.isFinite(shotEV) ? bus.shot : null };
}

// The display exposure alone (tools and older callers).
export function autoExposure(P, bus, camera) {
  return cameraExposure(P, bus, camera).Erender;
}
