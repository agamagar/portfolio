// The Living Sky as the view out of the window.
//
// The window scene runs on WebGPURenderer, which has no ShaderMaterial path, so
// the sky is not ported: it keeps its own small offscreen WebGL canvas running the
// SAME shader string the home page runs (imported from src/shaders/washes.js,
// never copied), compiled as the WINDOW build (the SKY_WINDOW define in front of
// it; see the header of public/shader-viewer/presets/living-sky.frag). The engine
// wraps plate.canvas in a THREE.CanvasTexture and sets needsUpdate right after
// every plate.update(), in the same rAF task: the canvas is created without
// preserveDrawingBuffer, so its pixels are only guaranteed until that task ends.
//
// THE PLATE IS AN EQUIRECTANGULAR PATCH OF SKY, not a picture of one:
//   bearing   = viewAz + (u - 0.5) * fovH            degrees, 0 N, 90 E
//   elevation = v * fovH / aspect                     degrees, v = 0 on the horizon
// with u, v the texture coordinates (v up). plateDir() and plateUV() below convert
// both ways in the scene's world frame, so the engine can build whatever surface
// it hangs the texture on (a sphere segment, a cylinder, a far plane) and the sun,
// the gold of sunset and the drift of the clouds all land where they really are.
//
// World frame (the capture contract): metres, x right, y up, +z from the window
// into the room; the window faces north, so looking out is looking along -z.

import { LIVING_SKY, LIVING_SKY_DEFAULTS } from "../../shaders/washes.js";
import { seasonFor } from "../../lib/weather.js";
import { worldDir, norm180 } from "../../lib/astro.js";

export const SKY_WINDOW_DEFINE = "#define SKY_WINDOW 1\n";
export const LIVING_SKY_WINDOW = SKY_WINDOW_DEFINE + LIVING_SKY;

// The window faces north (bearing 0: 20-question-bank "Just build" 4). The plate
// is centred on the view and wider than the window, so parallax never runs off
// its edge: the window spans about -12 to +39 deg from the chair.
export const WINDOW_VIEW = Object.freeze({ bearing: 0, viewAz: 0, fovH: 110, aspect: 2 });

// Orange-grey city glow. Bangalore's streets are mostly white LED now, but the
// glow on a low deck still reads warm (dust and humidity redden it). This is the
// colour a city-lit cloud base takes on (display values, before the plate's
// grade); tuned by measurement against the classic night deck, which is a cool
// (66, 73, 95) sRGB on its own: with it an overcast night lands near (97, 78, 73).
export const SKYGLOW_COLOR = Object.freeze([0.62, 0.42, 0.3]);
// How bright a city this is, 0..1: a metro of 13 million.
export const CITY_GLOW = 0.8;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// --- plate <-> world ------------------------------------------------------------
// plateUV(az, alt) -> [u, v] for a compass bearing and an altitude in degrees.
export function plateUV(azDeg, altDeg, { viewAz = WINDOW_VIEW.viewAz, fovH = WINDOW_VIEW.fovH, aspect = WINDOW_VIEW.aspect } = {}) {
  return [0.5 + norm180(azDeg - viewAz) / fovH, altDeg / (fovH / aspect)];
}
// plateDir(u, v) -> unit vector in the world frame, the direction that texel
// shows. Hang the plate so that each vertex at (u, v) sits along plateDir(u, v).
export function plateDir(u, v, { viewAz = WINDOW_VIEW.viewAz, fovH = WINDOW_VIEW.fovH, aspect = WINDOW_VIEW.aspect, bearing = WINDOW_VIEW.bearing } = {}) {
  return worldDir(viewAz + (u - 0.5) * fovH, v * (fovH / aspect), bearing);
}

// --- one wind for everything ------------------------------------------------------
// The shader's gust pulse, the SAME formula on the same clock, so the bamboo, the
// far trees, the rain slant and the clouds all breathe together
// (living-sky.frag: gustNow). gustAmp is u_gust.
export function windPulse(t, gustAmp) {
  return 1 + gustAmp * (Math.cos(t * 0.085) + 0.55 * Math.cos(t * 0.23 + 1.7));
}
// How far the deck has travelled by time t (its integral: never runs backwards),
// in deck units; wMean is the shader's mix(0.01, 0.09, u_wind).
export function windTravel(t, wMean, gustAmp) {
  return t * wMean + wMean * gustAmp * (Math.sin(t * 0.085) / 0.085 + 0.55 * Math.sin(t * 0.23 + 1.7) / 0.23);
}

// --- lightning, decided here so the room can flash with it ------------------------
// The shader's own strike clock, moved to JS: one candidate every 1/0.11 = 9.1 s,
// offset so t = 0 is never a flash, firing with probability = storm intensity, a
// main flash plus a weaker echo, flickering. Only for real thunderstorm codes
// (95, 96, 99); heavy rain darkens the sky but does not throw lightning.
const fract = (x) => x - Math.floor(x);
function hash2(x, y) {
  // Hoskins' hash, as in the shader (the values differ from the GPU's in the last
  // bits, which does not matter: only the timing's statistics have to agree)
  let a = fract(x * 0.1031), b = fract(y * 0.1031), c = fract(x * 0.1031);
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
  a += d; b += d; c += d;
  return fract((a + b) * c);
}
export function lightningAt(t, storm) {
  const amt = typeof storm === "number" ? storm : storm?.active ? storm.intensity ?? 0.75 : 0;
  if (!(amt > 0.001)) return { flash: 0, x: 0.5 };
  const cyc = t * 0.11 + 0.4;
  const slot = Math.floor(cyc);
  const ph = cyc - slot;
  if (hash2(slot, 3.7) <= 1 - amt) return { flash: 0, x: hash2(slot, 8.1) };
  const main = Math.exp(-ph * 26);
  const echo = Math.exp(-Math.max(ph - 0.055, 0) * 34) * 0.55;
  return { flash: Math.max(main, echo) * (0.75 + 0.25 * Math.sin(t * 120)), x: hash2(slot, 8.1) };
}

// --- SceneWeather -> the full uniform set -----------------------------------------
// sw is a SceneWeather (src/scene/window/weatherBridge.js). extras:
//   t            ambient time in seconds (u_time); freeze it for captures
//   viewAz, fovH, aspect   the plate's view (WINDOW_VIEW); aspect = width/height
//   plateOnly    1 (default): the 3D scene draws rain and fog and times lightning
//   cumulusFloor true (default): Bangalore's afternoon cumulus on top of the data
//                (20-question-bank Q14: the model misses the towers in the photo),
//                stacked toward the horizon with clear sky above (u_cuBand), with
//                finer lobes and torn edges (u_cuDetail) and grey-lilac bases in
//                the golden hour (u_cuBase); see CUMULUS below
//   cumulus      overrides for CUMULUS (tuning)
//   skyglow      "auto" (city glow scaled by low cloud) or a number 0..1
//   skyglowColor [r, g, b]
//   flash        "auto" (lightningAt(t, sw.storm)) or a number; flashX with it
//   moon         null = the true moon seen through the view (a north window
//                never has it in frame), or { x, y, visible = 1, scale = 1 } to
//                place it on the plate (the Dreamlike look); its lit side always
//                comes from the real sun and moon
//   uniforms     raw u_* values applied last, for tuning
// The window build's cumulus (living-sky.frag, SKY_WINDOW): the deck by elevation
// (deg): thinning upward from `from` and clear of the low deck above `to`
// (the cover threshold rises `clear`, more by the afternoon's build `clearBuild`),
// thicker below `from` (`low`, by the build). The 17:41 photo's rows: A spans
// about 26 to 36 deg from the chair, B 10 to 24, the gold cumulus sits in B's
// lower half (10 to 17) and A is clear pale blue. detail: the extra octaves and
// edge erosion (the photo's cauliflower tops, frayed edges). base: the undersides'
// grey-lilac (display rgb, only hue and chroma count) and how much of it in the
// golden hour.
// mass: ONE large low cumulus where the 17:41 photo has it (loop 2): the shader's
// u_cuMass, a density bump at bearing az, elevation el (deg), half-width w (deg),
// `amount` of it, grown with the afternoon's build and the broken deck (none when
// clear, overcast or wet). The photo: row B of the left pair spans bearings 10 to
// 28 deg and elevations 9.5 to 22 from the chair, the cloud its lower two thirds.
// advect: the window deck's drift against the home band's (u_advect). Measured on
// the plate at 17:41 partly: 0.62 deg/s at 1 (6.2 deg in 10 s), a time-lapse; a
// cumulus about 8 km away in a 5 to 10 m/s wind crosses 0.04 to 0.07 deg/s, so 0.1.
// A storm's low deck is nearer and faster: advectStorm. evolve: the shapes' own
// change, slowed with it (a cumulus takes minutes to re-form, not seconds).
export const CUMULUS = Object.freeze({ from: 18, to: 23, clear: 0.08, clearBuild: 0.2, low: 0.3, detail: 1, detailWet: 0.4, base: [0.62, 0.58, 0.74], baseAmount: 0.85, mass: { az: 22, el: 15, w: 15, amount: 0.45 }, advect: 0.1, advectStorm: 0.3, evolve: 0.25 });

export function skyUniformsFrom(sw, extras = {}) {
  const {
    t = 0,
    viewAz = WINDOW_VIEW.viewAz,
    fovH = WINDOW_VIEW.fovH,
    aspect = WINDOW_VIEW.aspect,
    plateOnly = 1,
    cumulusFloor = true,
    cumulus = null,
    skyglow = "auto",
    skyglowColor = SKYGLOW_COLOR,
    flash = "auto",
    flashX = 0.5,
    moon = null,
    uniforms = {},
  } = extras;
  const base = sw?.base || LIVING_SKY_DEFAULTS;
  const u = { ...LIVING_SKY_DEFAULTS, ...base };

  // time and the real sun (the home band's sunUniforms, plus the compass bearing
  // the window build needs)
  const sun = sw?.sun || { alt: 30, az: 180, sinAlt: 0.5, hourAngle: 0 };
  u.u_tod = (((sw?.tod ?? 12) / 24) % 1 + 1) % 1;
  u.u_cycle = 0;
  u.u_sunReal = 1;
  u.u_sunElev = Math.sin((sun.alt * Math.PI) / 180);
  u.u_sunAz = Math.max(-0.25, Math.min(1.25, 0.5 + (sun.hourAngle ?? 0) / 180));
  u.u_sunAzDeg = sun.az;
  const lat = sw?.place?.lat ?? 12.97;
  u.u_season = seasonFor(lat, sw?.date || new Date());
  u.u_latitude = clamp01(Math.abs(lat) / 66);
  u.u_moonph = sw?.moon?.phase ?? base.u_moonph ?? 0.5;

  // the window
  u.u_fovH = fovH;
  u.u_viewAz = viewAz;
  u.u_plateOnly = plateOnly;

  // cloud: low + mid make the deck (cirrus says nothing about it), high makes the
  // cirrus, when the reading carries the layers and it is dry
  const cl = sw?.cloud;
  const wet = !!sw?.rain?.active;
  if (cl && Number.isFinite(cl.low) && Number.isFinite(cl.mid) && !wet && !(base.u_precip > 0)) {
    const lowMid = 1 - (1 - cl.low) * (1 - cl.mid);
    u.u_cover = clamp01(0.84 - lowMid * 0.52);
  }
  if (cl && Number.isFinite(cl.high)) u.u_cirrus = Math.max(0, Math.min(2, 0.35 + 1.5 * cl.high));
  const C = { ...CUMULUS, ...(cumulus || {}) };
  u.u_cuBand = [0, 0, 0, 0];
  u.u_cuDetail = 0;
  u.u_cuBase = [1, 1, 1, 0];
  u.u_cuMass = [0, 0, 1, 0];
  u.u_advect = (sw?.storm?.active ? C.advectStorm : C.advect) ?? 1;
  u.u_evolve = (u.u_evolve ?? 1) * (C.evolve ?? 1);
  if (cumulusFloor && !wet) {
    // never below scattered when dry; towers build through the afternoon (after
    // about 13:30), scaled by CAPE, and fade once the sun is well down
    const tod = sw?.tod ?? 12;
    const build = tod >= 12 ? smooth(13.5, 15.5, tod) * smooth(-14, -3, sun.alt) : 0;
    const capeK = clamp01((sw?.storm?.cape ?? 300) / 1200);
    const floor = 0.66 - build * (0.03 + 0.09 * capeK);
    // (loop 2) only as cloudy as the reading allows: a clear reading (under about
    // 10% cloud) keeps its clear sky, no floor, no band, no mass (wx=clear drew the
    // same cumulus as partly: 1.9/255 apart)
    const tot = Number.isFinite(cl?.total) ? cl.total : cl && Number.isFinite(cl.low) ? 1 - (1 - cl.low) * (1 - (cl.mid ?? 0)) * (1 - 0.5 * (cl.high ?? 0)) : 0.4;
    const cloudy = smooth(0.08, 0.3, tot);
    if (u.u_cover > floor) u.u_cover += (floor - u.u_cover) * cloudy;
    u.u_softness = Math.min(u.u_softness, 0.4 - 0.1 * build);
    // stacked toward the horizon, the upper sky clear (more so as the towers
    // build); a full deck is left alone (a stratus sheet has no band)
    const open = smooth(0.34, 0.5, u.u_cover) * cloudy;
    u.u_cuBand = [C.from, C.to, (C.clear + C.clearBuild * build) * open, C.low * build * open];
    u.u_cuDetail = C.detail;
    // the golden hour's grey-lilac undersides
    const golden = smooth(-4, 1.5, sun.alt) * (1 - smooth(12, 22, sun.alt));
    u.u_cuBase = [...C.base, C.baseAmount * golden];
    const M = C.mass;
    if (M && M.amount > 0) u.u_cuMass = [M.az, M.el, Math.max(1, M.w), M.amount * build * open];
  } else if (cumulusFloor) u.u_cuDetail = C.detailWet;

  // wind: the real direction turns the drift (the shader's classic drift carries
  // cloud toward the viewer's LEFT, which is the angle 0); the real gust factor
  // sets the pulse
  const w = sw?.wind;
  if (w && Number.isFinite(w.dirFromDeg)) {
    const r = ((w.dirFromDeg + 180 - viewAz) * Math.PI) / 180; // bearing the cloud moves to, relative to the view
    u.u_windDir = Math.atan2(-Math.cos(r), -Math.sin(r));
  }
  if (w && Number.isFinite(w.gustAmp)) u.u_gust = w.gustAmp;

  // distance: a short visibility is haze whatever the aerosol says
  const vis = sw?.visibility;
  if (Number.isFinite(vis) && vis < 10000) u.u_haze = Math.max(u.u_haze, 0.35 + 0.5 * (1 - vis / 10000));

  // the city at night, strongest under a low deck
  if (skyglow === "auto") {
    const lowish = wet ? 1 : Math.max(cl?.low ?? 0.3, 0.7 * (cl?.mid ?? 0));
    // (loop 2) the city's evening: its glow is fullest from dusk to about 23:00
    // and thins through the small hours as shops, offices and traffic go dark
    // (0.8 at midnight, 0.55 by 02:30), back up by dawn; so 21:00 and 00:00 differ
    const h = (((sw?.tod ?? 21) % 24) + 24) % 24;
    const small = 0.8 - 0.25 * smooth(0, 2.5, h);
    const late = h >= 12 ? 1 - 0.2 * smooth(22.5, 24, h) : small + (1 - small) * smooth(4.5, 6, h);
    u.u_skyglow = CITY_GLOW * (0.6 + 0.4 * clamp01(lowish)) * late;
  } else u.u_skyglow = clamp01(+skyglow || 0);
  u.u_skyglowColor = [...skyglowColor];

  // lightning
  if (flash === "auto") {
    const l = lightningAt(t, sw?.storm);
    u.u_flash = l.flash;
    u.u_flashX = l.x;
  } else {
    u.u_flash = +flash || 0;
    u.u_flashX = flashX;
  }

  // the moon: placed (Dreamlike) or true. Its lit limb always comes from the data:
  // limbAngle is counterclockwise from up, the screen angle is from +x.
  const m = sw?.moon;
  u.u_moonLimb = (((m?.limbAngle ?? 0) + 90) * Math.PI) / 180;
  // a placed moon's glow is held back in the blue hour (until about -12 deg): its
  // glow washed the deep blue to grey (round 2); the disc keeps its light
  u.u_moonGlowCut = 0;
  if (moon) {
    u.u_moonGlowCut = 0.8 * smooth(-14, -9, sun.alt) * (1 - smooth(-1, 2, sun.alt));
    u.u_moonReal = clamp01(moon.visible ?? 1) || 1e-4;
    u.u_moonX = moon.x;
    u.u_moonY = moon.y;
    u.u_moonScale = moon.scale ?? 1;
  } else if (m) {
    const [mu, mv] = plateUV(m.az, m.alt, { viewAz, fovH, aspect });
    u.u_moonReal = Math.max(1e-4, smooth(-0.5, 1.0, m.alt)); // > 0 so the true position is used even when set
    u.u_moonX = mu;
    u.u_moonY = mv;
    u.u_moonScale = 1;
  }

  u.u_time = t;
  u.u_mouse = [0.5, 0.5];
  u.u_dark = 0;
  return Object.assign(u, uniforms);
}

// --- the plate ----------------------------------------------------------------
const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// createSkyPlate() -> { canvas, update(uniforms), resize(w, h), readAverage(),
// dispose(), lost, width, height }
// update() draws synchronously and returns true, or false if the context is lost
// (the engine keeps its last texture then; the plate rebuilds itself when the
// browser restores the context).
export function createSkyPlate({ width = 1024, height = 512, preserveDrawingBuffer = false } = {}) {
  const canvas =
    typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(width, height);
  canvas.width = width;
  canvas.height = height;
  // alpha: the window build writes its own cloud cover there (1 - 0.25 c), for
  // the page's grade (light/grade.js); unpremultiplied, so the colour is kept
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer,
  });
  if (!gl) throw new Error("skyPlate: WebGL unavailable");

  let program = null;
  let uniformsInfo = {};
  let error = null;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
      error = gl.getShaderInfoLog(s) || "compile failed";
      console.warn("[skyPlate] compile:", error);
    }
    return s;
  };
  const build = () => {
    error = null;
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, LIVING_SKY_WINDOW));
    gl.bindAttribLocation(program, 0, "a_pos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
      error = gl.getProgramInfoLog(program) || "link failed";
      console.warn("[skyPlate] link:", error);
    }
    gl.useProgram(program);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    uniformsInfo = {};
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) || 0;
    for (let i = 0; i < n; i++) {
      const a = gl.getActiveUniform(program, i);
      if (a) uniformsInfo[a.name] = { loc: gl.getUniformLocation(program, a.name), type: a.type };
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  build();

  const onLost = (e) => e.preventDefault();
  const onRestored = () => build();
  canvas.addEventListener?.("webglcontextlost", onLost, false);
  canvas.addEventListener?.("webglcontextrestored", onRestored, false);

  const set = (name, v) => {
    const e = uniformsInfo[name];
    if (!e || v === undefined || v === null) return;
    if (e.type === gl.FLOAT) gl.uniform1f(e.loc, +v);
    else if (e.type === gl.FLOAT_VEC2) gl.uniform2f(e.loc, v[0], v[1]);
    else if (e.type === gl.FLOAT_VEC3) gl.uniform3f(e.loc, v[0], v[1], v[2]);
    else if (e.type === gl.FLOAT_VEC4) gl.uniform4f(e.loc, v[0], v[1], v[2], v[3]);
  };

  const plate = {
    canvas,
    get width() {
      return canvas.width;
    },
    get height() {
      return canvas.height;
    },
    get lost() {
      return gl.isContextLost();
    },
    get error() {
      return error;
    },
    // Draw now. Pass the full set (skyUniformsFrom gives it); u_resolution is the
    // plate's own size unless given, because rain and stars are sized in pixels.
    update(uniforms = {}) {
      if (gl.isContextLost()) return false;
      gl.useProgram(program);
      for (const [name, v] of Object.entries(uniforms)) set(name, v);
      if (!("u_resolution" in uniforms)) set("u_resolution", [canvas.width, canvas.height]);
      if (!("u_mouse" in uniforms)) set("u_mouse", [0.5, 0.5]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    },
    resize(w, h) {
      canvas.width = Math.max(1, w | 0);
      canvas.height = Math.max(1, h | 0);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    // Mean colour of a region, read straight after update() (same task). For the
    // window's area light and ambient, and as the dev check that the plate is not
    // black (the WebGPU canvas upload swallows its own failures). Region in plate
    // uv (v up); returns { srgb: [r, g, b], linear: [r, g, b] }, 0..1.
    readAverage({ u0 = 0, v0 = 0, u1 = 1, v1 = 1, step = 8 } = {}) {
      const x0 = Math.floor(u0 * canvas.width), y0 = Math.floor(v0 * canvas.height);
      const w = Math.max(1, Math.floor((u1 - u0) * canvas.width)), h = Math.max(1, Math.floor((v1 - v0) * canvas.height));
      const px = new Uint8Array(w * h * 4);
      gl.readPixels(x0, y0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const s = [0, 0, 0], l = [0, 0, 0];
      let n = 0;
      const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          for (let k = 0; k < 3; k++) {
            const c = px[i + k] / 255;
            s[k] += c;
            l[k] += lin(c);
          }
          n++;
        }
      return { srgb: s.map((c) => c / n), linear: l.map((c) => c / n) };
    },
    dispose() {
      canvas.removeEventListener?.("webglcontextlost", onLost);
      canvas.removeEventListener?.("webglcontextrestored", onRestored);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
  return plate;
}
