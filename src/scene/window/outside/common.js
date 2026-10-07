// Shared machinery for everything outside the glass: the per-frame uniforms, one
// wind for every moving thing (in TSL, with the previous frame's offset handed to
// positionPrevious so TRAA sees true motion vectors), the outdoor material
// (sky ambient, wet darkening, distance haze, the Dreamlike moon rim, and how much
// of it reaches the bloom), and a small geometry accumulator for merged meshes.
//
// World frame (30-locked-brief.md): metres, x right (east), y up, +z from the
// window into the room; outside is -z (north). The glass of the left pair is z = 0,
// the sill top is y = 0.
//
// WHY MERGED, NOT INSTANCED: every bamboo cane has its own lean and arch, every
// branch its own curve, so there is nothing to instance; one merged mesh per
// material is one draw call, the same cost an InstancedMesh would have, and every
// vertex carries what the wind needs (root, height, phases) as attributes.

import * as THREE from "three/webgpu";
import {
  Fn,
  attribute,
  uniform,
  vec2,
  vec3,
  vec4,
  float,
  mix,
  exp,
  max,
  min,
  sin,
  dot,
  smoothstep,
  positionLocal,
  positionPrevious,
  positionWorld,
  normalWorld,
  normalView,
  normalViewGeometry,
  positionViewDirection,
  cameraPosition,
  output,
  mrt,
  abs,
  sqrt,
  inverseSqrt,
  lights as lightsNode,
} from "three/tsl";

export const D2R = Math.PI / 180;
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// sRGB hex -> linear THREE.Color (colours are authored as display hex)
export function lin(hex) {
  return new THREE.Color().setStyle(hex, THREE.SRGBColorSpace);
}
// sRGB hex -> a linear vec3 CONSTANT node. Never vec3(aColor): a vec3-typed const
// reads .x .y .z, which a THREE.Color does not have, so it compiles to black.
export function linv(hex) {
  const c = lin(hex);
  return vec3(c.r, c.g, c.b);
}

// THE NEON SIGNS' LIGHT (outside/neon.js writes it every frame; all zero while no sign
// is on, so what reads it adds exactly 0 in the other looks): mean, the signs' summed
// illuminance at the window (linear, scene units: their light in the outdoor air and
// the room's window fill); a and b, the first two palette colours at the signs'
// radiance (each rain streak and each drop on the wet glass picks one of them);
// dirA and dirB, where those two colours' signs stand (xyz: the mean unit direction
// from the window, world), and spread, how close to it a drop must look to catch
// one (x for the falling streaks, y for the drops on the glass: 1 / sigma^2 in
// radians; a drop's weight is exp((dot(view, dir) - 1) x spread), so 0 = everywhere).
export const NEON = {
  mean: new THREE.Color(0, 0, 0),
  a: uniform(new THREE.Vector3()),
  b: uniform(new THREE.Vector3()),
  dirA: uniform(new THREE.Vector3(0, 0, -1)),
  dirB: uniform(new THREE.Vector3(0, 0, -1)),
  spread: uniform(new THREE.Vector2(0, 0)),
};

// --- per-frame uniforms, one set for the whole outside -------------------------------
export function createOutsideUniforms() {
  return {
    // wind now and one frame ago: (towardX, towardZ, mean strength, gust strength),
    // strengths = km/h / params.outside.wind.strengthAt
    W: uniform(new THREE.Vector4(1, 0, 0.3, 0.5)),
    Wp: uniform(new THREE.Vector4(1, 0, 0.3, 0.5)),
    T: uniform(0), // ambient seconds
    Tp: uniform(0),
    // wind response: (lean, sway, flutter, advection m/s: how fast a gust front travels)
    K: uniform(new THREE.Vector4(0.006, 0.0012, 1, 3)),
    skyAmb: uniform(new THREE.Color(0.3, 0.35, 0.4)), // scene units, what a sky-facing matte surface receives
    groundAmb: uniform(new THREE.Color(0.05, 0.06, 0.04)), // what a ground-facing one receives
    hazeCol: uniform(new THREE.Color(0.4, 0.45, 0.5)),
    hazeDist: uniform(90), // m, e-folding distance of the haze
    bloom: uniform(0.1), // fraction of outdoor light written to the bloom (as the sky dome does)
    wet: uniform(0), // 0..1
    moonDir: uniform(new THREE.Vector3(0, 0.5, -1).normalize()),
    moonRim: uniform(new THREE.Color(0, 0, 0)), // Dreamlike only
    sunDir: uniform(new THREE.Vector3(0, 1, 0)), // toward the sun, world
    sunCol: uniform(new THREE.Color(0, 0, 0)), // the outdoor sun (unshadowed), colour x strength, for far things
    // the low sun on the horizon band (outside/horizon.js, which no scene light
    // reaches): its colour at the sky ambient's luminance, dimmed near the horizon
    // and by cloud (outside.js); the band scales it by horizon.sun
    farSun: uniform(new THREE.Color(0, 0, 0)),
    sat: uniform(1), // outdoor colour saturation (per look)
    // 0 by day .. 1 from civil twilight on (sun below about -5 deg): the outdoor
    // ambient and albedo move to their night values (outdoorMaterial nightAmb, nightDark)
    night: uniform(0),
    // the camera's lens, for the far layers' pre-blur (outdoorLensBlur): x aperture
    // diameter (m), y 1 / focus distance (1/m), z the angle (rad, diameter) the post's
    // depth of field already blurs a far point by, w 1 = on
    lens: uniform(new THREE.Vector4(0.0039, 1, 0, 0)),
    // THE CITY AT NIGHT (loop 2, outside.js cityAt): x the share of windows lit (it
    // falls through the night), y the urban skyglow's level (scene units, x glowCol's
    // hue), z the street lights (0 by day, 1 from dusk), w how dark it is (0 by day,
    // 1 from about -6 deg: when a lit window shows at all)
    city: uniform(new THREE.Vector4(0, 0, 0, 0)),
    glowCol: uniform(new THREE.Color(0, 0, 0)), // the skyglow's colour x its level, linear
    // THE MURK (Cyberpunk, outside.horizon.murk): x how thick the weather's lit murk is
    // this frame (0 clear; 0 in every other look), y its base and z its depth (deg:
    // the towers fade into it above the base), w x the city's glow it carries
    murk: uniform(new THREE.Vector4(0, 16, 4, 1)),
    // the light lane's G (light/exposure.js lightGain: E_true / E_render), which every
    // physical light carries; the lit windows take it (outside.js)
    lightGain: uniform(1),
    // the white-LED street lights: colour x strength (scene units of illuminance x
    // 1 m^2, so a surface d metres away gets streetCol x w / (d^2 + 1)), and up to
    // three luminaires, (x, y, z, relative output); outside.js fills them
    streetCol: uniform(new THREE.Color(0, 0, 0)),
    poles: [uniform(new THREE.Vector4(0, -100, 0, 0)), uniform(new THREE.Vector4(0, -100, 0, 0)), uniform(new THREE.Vector4(0, -100, 0, 0))],
    // every outdoor material, so outside.js can give them their own light list
    materials: [],
  };
}

// The white-LED street lights on a surface (illuminance, linear, before albedo):
// each luminaire throws its light down and out (a cobra head's wide Type II beam:
// full from about 20 deg below its own horizontal, nothing above it), falls off as
// 1 / (d^2 + 1 m^2) (the +1 keeps a leaf beside the head finite), and wraps a
// little round a crown (wrap: a leafy mass is lit past its terminator). No shadows:
// a crown a street light stands in lights from inside anyway, and the poles stand
// clear of the house.
export function streetLight(U, nrm = normalWorld, wrap = 0.35) {
  let e = float(0);
  for (const pole of U.poles) {
    const L = pole.xyz.sub(positionWorld);
    const d2 = dot(L, L);
    const l = L.mul(inverseSqrt(max(d2, 1e-4)));
    const ndl = dot(nrm, l).add(wrap).div(1 + wrap).max(0);
    const cone = smoothstep(-0.05, 0.35, l.y);
    e = e.add(pole.w.mul(ndl).mul(cone).div(d2.add(1)));
  }
  return vec3(U.streetCol).mul(e);
}

// The blur a far point at world distance d still needs beyond what the post's depth
// of field gives it (rad, diameter): a real lens blurs a point at d by A |1/s - 1/d|
// (A the aperture's diameter, s the focus distance), whatever the focal length; the
// post's DepthOfFieldNode caps every far point at one fixed radius (its bokehScale,
// in pixels of a 1600 px frame), which a 66 mm close-up focused at 0.9 m leaves about
// 3x too sharp (5482: the street trees 12 px across in the photo, 4 in the render).
// The two add in quadrature.
export function outdoorLensBlur(U, d) {
  const phys = U.lens.x.mul(abs(U.lens.y.sub(float(1).div(max(d, 0.05)))));
  return sqrt(max(phys.mul(phys).sub(U.lens.z.mul(U.lens.z)), 0)).mul(U.lens.w);
}

// --- the wind ------------------------------------------------------------------------
// Attributes every wind-driven vertex carries:
//   aW0 = (rootX, rootZ, H, phase)       the plant: where it stands, how tall, its phase
//   aW1 = (s, stiff, branchPhase, bdist)  s = normalised height of the point on the stem
//                                         that drives this vertex; bdist = metres out
//                                         along a branch (0 on the stem)
//   aW2 = (leafPhase, along, leafLen, flag) along = 0 at the leaf's base, 1 at its tip;
//                                         flag scales flutter (0 for stems and branches)
//
// GUSTS (loop round 1). The wind at a plant is the mean speed plus a gust: a smooth
// burst signal g in 0..1 (quasi-random: three incommensurate sines through a
// smoothstep, so a burst rises in about a second and dies over two or three) that
// travels WITH the wind: a plant `along` metres downwind of the origin sees it
// along / K.w seconds later, so the upwind canes move first and a front sweeps the
// clump, the street trees a second or two after. The instantaneous speed runs from
// the reading's mean (W.z) up to its gust speed (W.w); the push on a culm grows as
// speed^1.4 (GUST.push), so a storm (26 km/h, gusts 58) pushes the canes about 3x
// harder at a gust's peak than between gusts, and a calm evening still rocks them.
// Gusts swing the canes sideways too (GUST.lateral), which matters from the hero:
// it looks north-east, down the south-west monsoon wind, so the along-wind push is
// mostly away from the camera. Worked out on the hero camera (scratchpad
// outside/windsim.py, the same formulas): the most a cane at window height moves in
// any one second is about 11 cm (20 px at 1440 x 900) in the storm preset, 4.6 cm in
// rain, 2.5 cm (7 px) at 12 km/h (partly), 1.5 cm in the clear preset's 8 km/h.
//   gustLevel(tau)        the same signal in JS (rain slant and density, the room's
//                         ajar leaf and bead chain can use it: windGustAt below)
// W = (towardX, towardZ, mean strength, gust strength), T = seconds,
// K = (lean, sway, flutter, advection m/s). Returns the world offset for that vertex.
// lateral: gusts also swing sideways (turbulence: the cross-wind fluctuation is about
// 0.75 of the along-wind one), from a second, decorrelated signal in -1..1 (fl, phl)
// push: a leafy culm streamlines as the wind rises (its drag grows as speed^1.4, not
// speed^2: a Vogel exponent of -0.6, typical of flexible leafy plants), so a breeze
// still rocks it and a storm does not whip it flat
export const GUST = { f: [0.61, 1.37, 2.83], ph: [1.3, 0.4, 2.1], a: [0.5, 0.3, 0.2], lo: 0.05, hi: 0.75, across: 0.35, lateral: 0.75, fl: [0.47, 1.13, 2.41], phl: [0.7, 2.9, 5.1], latShift: 3.7, push: 1.4 };
export function gustLevel(tau) {
  const v = GUST.a[0] * Math.sin(tau * GUST.f[0] + GUST.ph[0]) + GUST.a[1] * Math.sin(tau * GUST.f[1] + GUST.ph[1]) + GUST.a[2] * Math.sin(tau * GUST.f[2] + GUST.ph[2]);
  return smooth(GUST.lo, GUST.hi, v);
}
export function gustLateral(tau) {
  const t = tau + GUST.latShift;
  return GUST.a[0] * Math.sin(t * GUST.fl[0] + GUST.phl[0]) + GUST.a[1] * Math.sin(t * GUST.fl[1] + GUST.phl[1]) + GUST.a[2] * Math.sin(t * GUST.fl[2] + GUST.phl[2]);
}
// The gust (0..1) and the instantaneous speed (km/h) at world point (x, z) at time t,
// for a FrameState wind { vecX, vecZ, speed, gust } (km/h): what the plants there feel.
export function windGustAt(wind, x, z, t, advect = 3) {
  const vx = wind?.vecX ?? 1, vz = wind?.vecZ ?? 0;
  const along = x * vx + z * vz;
  const across = -x * vz + z * vx;
  const tau = t - along / Math.max(advect, 0.5) + across * GUST.across;
  const g = gustLevel(tau);
  const speed = wind?.speed ?? 8;
  const gs = Math.max(speed, wind?.gust ?? speed * 1.5);
  // lateral: km/h toward the wind's left (+) or right (-)
  return { g, speed: speed + (gs - speed) * g, lateral: GUST.lateral * (gs - speed) * gustLateral(tau) };
}
function gustNode(tau) {
  const v = sin(tau.mul(GUST.f[0]).add(GUST.ph[0])).mul(GUST.a[0])
    .add(sin(tau.mul(GUST.f[1]).add(GUST.ph[1])).mul(GUST.a[1]))
    .add(sin(tau.mul(GUST.f[2]).add(GUST.ph[2])).mul(GUST.a[2]));
  return smoothstep(GUST.lo, GUST.hi, v);
}
function lateralNode(tau) {
  const t = tau.add(GUST.latShift);
  return sin(t.mul(GUST.fl[0]).add(GUST.phl[0])).mul(GUST.a[0])
    .add(sin(t.mul(GUST.fl[1]).add(GUST.phl[1])).mul(GUST.a[1]))
    .add(sin(t.mul(GUST.fl[2]).add(GUST.phl[2])).mul(GUST.a[2]));
}
// The gust (0..1) and the instantaneous along-wind strength a plant rooted at root
// (vec2 world x, z) feels now: the same travelling front windOffset uses (for
// shading that moves with the gusts, the far crowns' shimmer).
export function windGustNode(U, root, ph = float(0)) {
  const dir = vec2(U.W.x, U.W.y);
  const perp = vec2(dir.y.negate(), dir.x);
  const tau = U.T.sub(dot(root, dir).div(max(U.K.w, 0.5))).add(dot(root, perp).mul(GUST.across)).add(ph.mul(0.05));
  const g = gustNode(tau);
  return { g, u: mix(U.W.z, U.W.w, g) };
}
export function windOffset(a0, a1, a2, nrm, W, T, K, scale = 1) {
  const dir = vec2(W.x, W.y);
  const perp = vec2(dir.y.negate(), dir.x);
  const H = a0.z;
  const ph = a0.w;
  const s = a1.x;
  const stiff = a1.y;
  // the gust front reaches this plant along / advection seconds after the origin
  const root = vec2(a0.x, a0.y);
  const tau = T.sub(dot(root, dir).div(max(K.w, 0.5))).add(dot(root, perp).mul(GUST.across)).add(ph.mul(0.05));
  const g = gustNode(tau);
  const u = mix(W.z, W.w, g); // instantaneous along-wind strength
  const v = W.w.sub(W.z).mul(GUST.lateral).mul(lateralNode(tau)); // cross-wind
  const mag = u.mul(u).add(v.mul(v)).sqrt().max(1e-3);
  const drag = mag.mul(mag); // dynamic pressure: the leaves' flutter goes with it
  // the push is |V|^(push-1) V, quasi-static (a culm answers in well under a second),
  // so it follows the gust along and across the wind; on top, the culm's own sway at
  // 0.5 to 0.9 Hz, larger the harder it blows
  const k = mag.pow(GUST.push - 1);
  const freq = float(3.2).add(stiff.mul(1.6));
  const swayA = K.y.mul(k).mul(mag);
  const osc = sin(T.mul(freq).add(ph)).mul(swayA);
  const cross = sin(T.mul(freq.mul(1.31)).add(ph.mul(2.3))).mul(swayA).mul(0.45);
  const bend = dir.mul(K.x.mul(k).mul(u).add(osc)).add(perp.mul(K.x.mul(k).mul(v).add(cross)));
  // cantilever shape, softer stems bend more
  const shape = s.mul(s).mul(float(1.35).sub(s.mul(0.35))).div(max(stiff, 0.2));
  const d = bend.mul(H).mul(shape).mul(scale);
  // keep the stem's length: the tip drops as it bends
  const drop = dot(d, d).div(max(H.mul(s).mul(2), 0.05)).negate();
  let off = vec3(d.x, drop, d.y);
  // branches: their own sway, out along the branch
  const bph = a1.z;
  const bdist = a1.w;
  const bsw = sin(T.mul(4.4).add(bph)).mul(bdist).mul(K.y).mul(8).mul(drag.add(0.1));
  off = off.add(vec3(perp.x.mul(bsw), bsw.mul(0.3), perp.y.mul(bsw)));
  // leaves: flutter about the blade's normal at 3.2 Hz in a breeze, 5.3 Hz in a gust
  // (two fixed oscillators cross-faded: a changing frequency would chirp), by about
  // 4 deg in a calm, up to 25 to 30 deg at a storm gust's peak (K.z scales it); in
  // strong wind they stream downwind and lift
  const lph = a2.x;
  const alongL = a2.y;
  const leafLen = a2.z;
  const flag = a2.w;
  const gl = g.mul(min(u, 1));
  const fl = mix(sin(T.mul(20.1).add(lph)), sin(T.mul(33.3).add(lph.mul(1.9))), gl);
  const theta = float(0.05).add(min(drag, 8.5).mul(0.05)).mul(K.z);
  off = off.add(nrm.mul(fl.mul(theta).mul(alongL).mul(alongL).mul(leafLen).mul(flag)));
  const stream = smoothstep(1.5, 6, drag).mul(alongL).mul(alongL).mul(leafLen).mul(0.6).mul(flag);
  off = off.add(vec3(dir.x.mul(stream), stream.mul(0.35), dir.y.mul(stream)));
  return off;
}

// The positionNode for a wind-driven merged mesh: current offset on positionLocal,
// the previous frame's offset on positionPrevious (only when the pass wants motion
// vectors), so TRAA reprojects the sway instead of smearing it (10-r186.md 2.7).
export function windPositionNode(U, scale = 1) {
  const a0 = attribute("aW0", "vec4");
  const a1 = attribute("aW1", "vec4");
  const a2 = attribute("aW2", "vec4");
  const nrm = attribute("normal", "vec3");
  return Fn((builder) => {
    if (builder.needsPreviousData && builder.needsPreviousData()) {
      const offPrev = windOffset(a0, a1, a2, nrm, U.Wp, U.Tp, U.K, scale);
      positionPrevious.assign(positionPrevious.add(offPrev));
    }
    const off = windOffset(a0, a1, a2, nrm, U.W, U.T, U.K, scale);
    return positionLocal.add(off);
  })();
}

// --- the outdoor material --------------------------------------------------------------
// Scene lights (the sun with its shadows, the lamp through the window at night, the
// faint hemisphere) light it as usual; on top it gets what the scene lights cannot
// give an outdoor surface: the sky it sits under (U.skyAmb, from the Living Sky
// plate's own average), a little ground bounce, the wet darkening after rain, the
// Dreamlike moon on its edges, and distance haze from the visibility. It writes
// U.bloom of its final light to the bloom target, the same fraction the sky dome
// writes, so the view through the glass blooms as one picture.
//
// opts: { kind: 'standard' | 'sss' | 'lambert', albedo (node, linear), roughness (number or node),
//         side, mask (bool node), position (node), ambient (number), wetDarken,
//         sheen (0..1, glossy wet leaves), rim (0..1 moon rim), trans (vec3 node, for sss),
//         haze (0..1 how much distance haze), name,
//         flipNormals (default true; false keeps a double-sided card's authored
//           normal on both faces: a leaf-clump card shades with its crown's sphere
//           whichever side the camera sees, instead of a random half of the cards
//           turning their normal away, which read as white foam under the moon),
//         rimPow (the moon rim's falloff from the silhouette, default 3),
//         cap (0 = off: a soft ceiling on the lit radiance, as a multiple of the
//           horizon sky's luminance; a far leaf under a low sun never outshines the
//           sky it stands against, so the DOF has no hot points to ring),
//         nightAmb (ambient multiplier from civil twilight on, U.night; default 1),
//         nightDark (albedo multiplier at night, default 1),
//         nightTint (a hex the albedo leans to at night, luminance kept),
//         haze may also be a node (per vertex: the far trees take more),
//         glow (a node, scene units: light the surface gives off itself, a lit
//           window; hazed like the rest, never capped),
//         street (share of the white-LED street lights it receives, default 0),
//         streetWrap (how far round a mass they reach, default 0.35),
//         noLights (true: no scene light reaches it, not even the key; a crown's
//           shaded inside, lit only through the leaves around it),
//         farSun (share of U.farSun, the low sun at the sky light's level, on the
//           side facing it: light filtering through a crown's leaves),
//         farSunLow (0..1: how much a high sun loses of that; sunlight from above
//           lights a crown's top, which a window below never sees, while a low sun
//           shines in through its side) }
// WHY THE NIGHT VALUES. U.skyAmb comes from the plate's average over its horizon
// band. By day that band is a fair stand-in for the sky a crown sees; from civil
// twilight on it is the brightest part of the sky (the afterglow, the city's glow,
// in Dreamlike the moonlit clouds), while a crown sees the dark zenith and the dark
// east. So far foliage lit by it read one or two stops too bright at dusk (5482,
// L2 row C +1.2 stops) and as pale speckle at night.
export function outdoorMaterial(U, opts = {}) {
  const {
    kind = "standard",
    albedo,
    roughness = 0.8,
    side = THREE.FrontSide,
    mask = null,
    position = null,
    ambient = 1,
    wetDarken = 0.35,
    rim = 0,
    rimPow = 3,
    trans = null,
    haze = 1,
    sun = 0,
    wrap = 0.25,
    flipNormals = true,
    cap = 0,
    nightAmb = 1,
    nightDark = 1,
    nightTint = null,
    glow = null,
    street = 0,
    streetWrap = 0.35,
    noLights = false,
    farSun = 0,
    farSunLow = 0,
    name = "outdoor",
  } = opts;
  const m = kind === "sss" ? new THREE.MeshSSSNodeMaterial({ side }) : kind === "lambert" ? new THREE.MeshLambertNodeMaterial({ side }) : new THREE.MeshStandardNodeMaterial({ side });
  m.name = name;
  if (kind !== "lambert") m.metalness = 0;
  if (!flipNormals) m.normalNode = normalViewGeometry;
  const lum = dot(albedo, vec3(0.2126, 0.7152, 0.0722));
  const sat = mix(vec3(lum), albedo, U.sat);
  let alb = sat.mul(float(1).sub(U.wet.mul(wetDarken)));
  // the street lights see the surface's true albedo: the night darkening below stands
  // in for the dark sky a crown really sees (it is not a darker leaf)
  const dayAlb = alb;
  if (nightTint || nightDark !== 1) {
    let nAlb = alb;
    if (nightTint) {
      const t = lin(nightTint);
      const tl = 0.2126 * t.r + 0.7152 * t.g + 0.0722 * t.b;
      nAlb = mix(alb, vec3(dot(alb, vec3(0.2126, 0.7152, 0.0722))).mul(vec3(t.r / tl, t.g / tl, t.b / tl)), 0.7);
    }
    alb = mix(alb, nAlb.mul(nightDark), U.night);
  }
  m.colorNode = alb;
  if (kind !== "lambert") {
    const rough = typeof roughness === "number" ? float(roughness) : roughness;
    m.roughnessNode = mix(rough, rough.mul(0.45), U.wet);
  }
  // sky from above, ground bounce from below
  const up = normalWorld.y.mul(0.5).add(0.5);
  let amb = mix(vec3(U.groundAmb), vec3(U.skyAmb), up).mul(ambient);
  if (nightAmb !== 1) amb = amb.mul(mix(float(1), float(nightAmb), U.night));
  let emissive = alb.mul(amb);
  if (sun > 0) {
    // the low sun on far things the scene's shadow map never reaches (the street
    // trees, the building, the ground): direct light plus the bright sky around the
    // sun (a wrapped term), both warm with the sun's own colour
    const nl = dot(normalWorld, U.sunDir);
    const direct = nl.max(0).add(nl.mul(0.5).add(0.5).mul(wrap));
    emissive = emissive.add(alb.mul(vec3(U.sunCol)).mul(direct).mul(sun));
    if (trans) {
      // light through thin leaves when the sun is behind them
      const back = dot(positionViewDirection, U.sunDir).negate().max(0).pow(3);
      emissive = emissive.add(trans.mul(vec3(U.sunCol)).mul(back).mul(sun * 0.5));
    }
  }
  if (rim > 0) {
    // the Dreamlike moon catching the edges that face it
    const ndv = dot(normalView, positionViewDirection).abs();
    const facing = dot(normalWorld, U.moonDir).mul(0.6).add(0.4).clamp(0, 1);
    const edge = float(1).sub(ndv).pow(rimPow);
    emissive = emissive.add(vec3(U.moonRim).mul(edge.mul(facing).mul(rim)));
  }
  if (farSun > 0) emissive = emissive.add(alb.mul(vec3(U.farSun)).mul(dot(normalWorld, U.sunDir).mul(0.5).add(0.5)).mul(float(1).sub(U.sunDir.y.max(0).mul(farSunLow))).mul(farSun));
  if (street > 0) {
    // under a white LED at night foliage reads grey-green: the light's spectrum and the
    // low level both take colour out (half the albedo's chroma kept)
    const sAlb = mix(vec3(dot(dayAlb, vec3(0.2126, 0.7152, 0.0722))), dayAlb, 0.5);
    emissive = emissive.add(sAlb.mul(streetLight(U, normalWorld, streetWrap)).mul(street));
  }
  m.emissiveNode = emissive;
  if (kind === "sss" && trans) {
    m.thicknessColorNode = trans.mul(float(1).sub(U.wet.mul(0.3)));
    m.thicknessDistortionNode = float(0.25);
    m.thicknessAmbientNode = float(0.0);
    m.thicknessAttenuationNode = float(opts.transGain ?? 0.6);
    m.thicknessPowerNode = float(3.0);
    m.thicknessScaleNode = float(1.0);
  }
  if (mask) m.maskNode = mask;
  if (position) m.positionNode = position;
  // the ceiling on the lit radiance: a soft shoulder from 0.6 of it (below that
  // nothing changes), as a multiple of the horizon sky's luminance
  let lit = output.rgb;
  if (cap > 0) {
    const l = max(dot(lit, vec3(0.2126, 0.7152, 0.0722)), 1e-6);
    const top = max(dot(vec3(U.hazeCol), vec3(0.2126, 0.7152, 0.0722)).mul(cap), 1e-5);
    const knee = top.mul(0.6);
    const span = top.sub(knee);
    const over = max(l.sub(knee), 0);
    const lc = min(l, knee).add(span.mul(float(1).sub(exp(over.div(span).negate()))));
    lit = lit.mul(lc.div(l));
  }
  if (glow) lit = lit.add(glow);
  // distance haze toward the horizon colour, e-folding at U.hazeDist
  const dist = positionWorld.sub(cameraPosition).length();
  const f = float(1).sub(exp(dist.div(U.hazeDist).negate())).mul(haze).clamp(0, 0.97);
  const fogged = mix(lit, vec3(U.hazeCol), f);
  m.outputNode = vec4(fogged, output.a);
  m.mrtNode = mrt({ emissive: fogged.mul(U.bloom) });
  m.fog = false;
  if (noLights) {
    m.lightsNode = lightsNode([]);
    m.userData.outdoorNoLights = true;
  }
  U.materials.push(m);
  return m;
}

// What a see-through layer writes to the MRT targets. NOTE (r186, measured): the
// pipeline's blend state per target comes from the PASS's MRT (renderer.getMRT()),
// not from a material's mrtNode, so blend modes set here would be ignored: every
// target but `output` is overwritten by a transparent fragment. For thin specks and
// streaks that is harmless (a rain streak's own motion vector is the right one for
// TRAA there); the bloom share is written already multiplied by coverage.
export function layerMRT(emissiveNode) {
  return mrt({ emissive: emissiveNode });
}

// Additive glow material for specks (motes, rain, the moon's halo), with its own
// bloom share. colorNode is the light it adds (scene units), opacityNode its coverage.
export function glowMaterial({ colorNode, opacityNode = null, positionNode = null, bloomNode = null, blending = THREE.AdditiveBlending, name = "glow" }) {
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending, side: THREE.DoubleSide });
  m.name = name;
  m.colorNode = colorNode;
  if (opacityNode) m.opacityNode = opacityNode;
  if (positionNode) m.positionNode = positionNode;
  const a = opacityNode ?? float(1);
  m.mrtNode = layerMRT((bloomNode ?? colorNode.mul(0.5)).mul(a));
  m.fog = false;
  return m;
}

// --- a geometry accumulator -----------------------------------------------------------
// push vertices with any attributes, then build one BufferGeometry.
export class GeoBuilder {
  constructor(attrs = { aW0: 4, aW1: 4, aW2: 4, color: 3 }) {
    this.pos = [];
    this.nrm = [];
    this.uv = [];
    this.idx = [];
    this.attrs = {};
    this.sizes = attrs;
    for (const k of Object.keys(attrs)) this.attrs[k] = [];
    this.n = 0;
  }
  // v: { p:[x,y,z], n:[x,y,z], uv:[u,v], ...attrs }
  vert(v) {
    this.pos.push(v.p[0], v.p[1], v.p[2]);
    this.nrm.push(v.n[0], v.n[1], v.n[2]);
    this.uv.push(v.uv ? v.uv[0] : 0, v.uv ? v.uv[1] : 0);
    for (const k of Object.keys(this.sizes)) {
      const a = v[k];
      const sz = this.sizes[k];
      for (let i = 0; i < sz; i++) this.attrs[k].push(a ? a[i] ?? 0 : 0);
    }
    return this.n++;
  }
  tri(a, b, c) {
    this.idx.push(a, b, c);
  }
  quad(a, b, c, d) {
    this.idx.push(a, b, c, c, b, d);
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    for (const k of Object.keys(this.sizes)) g.setAttribute(k, new THREE.Float32BufferAttribute(this.attrs[k], this.sizes[k]));
    if (this.n > 65535) g.setIndex(new THREE.Uint32BufferAttribute(this.idx, 1));
    else g.setIndex(this.idx);
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

// Frame of reference along a polyline: tangents and a rotation-minimising normal.
export function polylineFrames(pts) {
  const n = pts.length;
  const T = [], N = [], B = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    T.push(new THREE.Vector3().subVectors(b, a).normalize());
  }
  // initial normal: any vector perpendicular to the first tangent
  const t0 = T[0];
  const ref = Math.abs(t0.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  N.push(new THREE.Vector3().crossVectors(t0, ref).normalize());
  B.push(new THREE.Vector3().crossVectors(t0, N[0]).normalize());
  for (let i = 1; i < n; i++) {
    const axis = new THREE.Vector3().crossVectors(T[i - 1], T[i]);
    const nn = N[i - 1].clone();
    const len = axis.length();
    if (len > 1e-6) {
      axis.divideScalar(len);
      const ang = Math.acos(Math.max(-1, Math.min(1, T[i - 1].dot(T[i]))));
      nn.applyAxisAngle(axis, ang);
    }
    N.push(nn);
    B.push(new THREE.Vector3().crossVectors(T[i], nn).normalize());
  }
  return { T, N, B };
}

// A tapered tube along pts (Vector3[]), radius r(i) and extra attributes per ring
// attrsAt(i) -> { aW0, aW1, aW2, color, aC, ... }; v runs along with vAt(i).
export function tube(gb, pts, radiusAt, sides, attrsAt, vAt = (i) => i / (pts.length - 1)) {
  const { T, N, B } = polylineFrames(pts);
  const base = gb.n;
  for (let i = 0; i < pts.length; i++) {
    const r = radiusAt(i);
    const at = attrsAt(i);
    for (let k = 0; k <= sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      const nx = N[i].x * c + B[i].x * s, ny = N[i].y * c + B[i].y * s, nz = N[i].z * c + B[i].z * s;
      gb.vert({ p: [pts[i].x + nx * r, pts[i].y + ny * r, pts[i].z + nz * r], n: [nx, ny, nz], uv: [k / sides, vAt(i)], ...at });
    }
  }
  const row = sides + 1;
  for (let i = 0; i < pts.length - 1; i++) {
    for (let k = 0; k < sides; k++) {
      const a = base + i * row + k, b = a + 1, c = a + row, d = c + 1;
      gb.tri(a, c, b);
      gb.tri(b, c, d);
    }
  }
  return { T, N, B };
}
