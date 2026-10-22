// Procedural textures and materials for the room (window frame, glass, iron,
// brass, plaster, fabric, lamp, monitors, desk things). Everything is generated at
// load from seeded noise into DataTextures: no downloads, no canvas (so the same
// code runs in node for the geometry fit tools), identical on every load.
//
// UVs: every room geometry carries UVs in metres (room/geom.js), so a texture's
// tile size below is a physical size.
//
// Colours are authored as measured values: the paint's linear albedo (0.085, 0.058,
// 0.040) and the other numbers come from 13-photo-inventory.md. Materials are TSL
// node materials (three/webgpu), so they run on WebGPU and the WebGL2 fallback.

import * as THREE from "three/webgpu";
import { generateRoomTextures, DUST_TILE, SPECK_MEAN } from "./roomTextures.js";
import {
  texture,
  uv,
  uniform,
  float,
  vec2,
  vec3,
  mix,
  clamp,
  smoothstep,
  normalMap,
  normalWorld,
  hash,
  floor,
  fract,
  abs,
  max,
  min,
  length,
  step,
  mrt,
  positionWorld,
  fwidth,
  output,
  vec4,
  dot,
  positionGeometry,
  normalGeometry,
  positionView,
  normalView,
  positionViewDirection,
  transformNormalToView,
  faceDirection,
  TBNViewMatrix,
  anisotropyT,
  anisotropyB,
  cameraPosition,
  normalize,
} from "three/tsl";
import { skyGradeUniforms } from "./light/grade.js";
import { NEON } from "./outside/common.js";

// --- how much of the window a surface really sees -----------------------------------------
// The window fill (lights.js, the RectAreaLight named "windowFill") is one
// unshadowed rectangle of the opening's mean light. A surface that the corner
// post, the casing or the frames hide from most of the opening, or one that faces
// a dark part of it (the lamp dome sits in front of R2's dark plane), still gets
// all of it. RoomStandardMaterial scales that one light by `share`, the fraction
// of the opening's light that really reaches the surface; the lamp, the key, the
// monitor and the bounce stay whole (enamelShade below scales every light).
// Measured at p = 0, 17:41, Dreamlike (round 2): with the fill off, R1's room faces
// fall from 0.033 to 0.016 and turn from blue-grey (hue 62 to 90, C* 2) to maroon;
// the corner post stands in front of R1's faces and blocks the left pair from them.
// Loop 2: the share is split by how wide a lobe is. `share` scales what the fill
// gives the diffuse and any broad specular lobe (both integrate a wide cone, so the
// frames and the dark R2 plane hide part of the opening from them, as from the
// irradiance), `specShare` what it gives the one sharp lobe: a mirror-like
// reflection that points at the glass sees the glass's own radiance, not the
// opening's average, so the dome's rim and the bars' highlight lines take most of
// it. With a clear coat the coat is the sharp lobe and the base keeps `share`;
// without one the single lobe is the sharp one. Loop 2's first cut gave the dome's
// 0.4 base the sharp share too: a grey sheen over the whole dome (+0.23 stops).
// The anisotropy flag is passed on to the physical model (the brass below uses it):
// the r186 constructor takes it fourth, after sheen and iridescence.
class WindowShareLighting extends THREE.PhysicalLightingModel {
  constructor(share, specShare = share, clearcoat = false, anisotropy = false) {
    super(clearcoat, false, false, anisotropy);
    this.share = share;
    this.specShare = specShare;
    this.baseSpecShare = clearcoat ? share : specShare;
  }
  directRectArea(input, builder) {
    const isWindow = input.lightNode?.light?.name === "windowFill";
    if (!isWindow || (this.share === 1 && this.specShare === 1 && this.baseSpecShare === 1)) return super.directRectArea(input, builder);
    const rl = input.reflectedLight, d = this.share, sp = this.specShare, bs = this.baseSpecShare;
    // r186 directRectArea adds into these three (and nothing else): scale each
    const proxy = {
      directDiffuse: { addAssign: (x) => rl.directDiffuse.addAssign(x.mul(d)) },
      directSpecular: { addAssign: (x) => rl.directSpecular.addAssign(x.mul(bs)) },
    };
    const cc = this.clearcoatSpecularDirect;
    if (cc) this.clearcoatSpecularDirect = { addAssign: (x) => cc.addAssign(x.mul(sp)) };
    try {
      return super.directRectArea({ ...input, reflectedLight: proxy }, builder);
    } finally {
      this.clearcoatSpecularDirect = cc;
    }
  }
}
class RoomStandardMaterial extends THREE.MeshStandardNodeMaterial {
  static get type() {
    return "RoomStandardNodeMaterial";
  }
  constructor(parameters, share = 1, specShare = share) {
    super(parameters);
    this.windowShare = share;
    this.windowSpecShare = specShare;
  }
  setupLightingModel() {
    return new WindowShareLighting(this.windowShare, this.windowSpecShare);
  }
  // the shares are not nodes: they must still keep programs apart
  customProgramCacheKey() {
    return super.customProgramCacheKey() + ":ws" + this.windowShare + ":" + this.windowSpecShare;
  }
}
// The same with a clear coat (MeshPhysicalNodeMaterial): gloss enamel over a
// pigmented base. The coat is the paint's own smooth top (the brush ridges live in
// it, clearcoatNormalNode); the base lobe under it is the broader sheen.
class RoomPhysicalMaterial extends THREE.MeshPhysicalNodeMaterial {
  static get type() {
    return "RoomPhysicalNodeMaterial";
  }
  constructor(parameters, share = 1, specShare = share) {
    super(parameters);
    this.windowShare = share;
    this.windowSpecShare = specShare;
  }
  setupLightingModel() {
    return new WindowShareLighting(this.windowShare, this.windowSpecShare, this.useClearcoat, this.useAnisotropy);
  }
  customProgramCacheKey() {
    return super.customProgramCacheKey() + ":ws" + this.windowShare + ":" + this.windowSpecShare;
  }
}

// --- brass: what the metal mirrors ------------------------------------------------------
// The scene has no environment map, so a metal shows only the lights' own lobes and is
// black between its glints (5482: the bow read dark brown, L* 46 with bloom and glare
// off, where the photo's grip is a satin khaki, L* 67). The photo's satin comes from
// what the handle mirrors, and that is mostly the door: the lamp-lit stile 2 cm behind
// the bar. So every punctual light also adds the light it puts on the leaf's face
// (lightColor x the face's cosine: faceE), and indirect() gives the metal that face as
// radiance, a Lambertian of the paint's albedo: whole where the reflection runs back
// into the face, roomShare of it where it turns out into the room. U.surround scales
// it (0 turns it off); U.sat keeps a share of the paint's chroma (at 1 the maroon
// enamel turned the brass copper). One bounce, punctual lights only: the window fill
// and the monitor are rect lights, which the LTC lobe already mirrors. It stands in for
// an environment map, so it switches itself off when the material gets one (an envMap,
// an envNode or scene.environment: BrassMaterial.setupEnvironment), or the door would
// count twice.
const LUMA = vec3(0.2126, 0.7152, 0.0722);
class BrassLighting extends WindowShareLighting {
  constructor(share, anisotropy, U, hasEnv = false) {
    super(share, share, false, anisotropy);
    this.U = U;
    this.hasEnv = hasEnv;
  }
  start(builder) {
    this.faceE = vec3(0).toVar("brassFaceE");
    super.start(builder);
  }
  direct(input, builder) {
    super.direct(input, builder);
    this.faceE.addAssign(input.lightColor.mul(this.U.nFace.dot(input.lightDirection).clamp()));
  }
  indirect(builder) {
    if (this.hasEnv) return super.indirect(builder);
    const U = this.U;
    const rv = positionViewDirection.negate().reflect(normalView);
    // 1 while the reflection points back into the face, roomShare once it points out
    // past 0.35 of the face's normal (written as 1 - smoothstep: reversed edges are
    // undefined in GLSL)
    const w = float(1).sub(smoothstep(-0.25, 0.35, rv.dot(U.nFace))).mul(float(1).sub(U.roomShare)).add(U.roomShare);
    const alb = vec3(U.albedo);
    const tint = mix(vec3(dot(alb, LUMA)), alb, U.sat);
    builder.context.radiance.addAssign(this.faceE.mul(tint).mul(w).mul(U.surround).mul(1 / Math.PI));
    super.indirect(builder);
  }
}
// The brass itself: RoomPhysicalMaterial (window share) with BrassLighting, and the
// anisotropic lobe's frame fixed. r186 builds the tangent frame from the uv
// derivatives when a geometry has no tangent attribute (TangentUtils.js) and scales T
// and B by the longer of the two, not each to unit length. On the handle's tube (uv.x
// runs 0.11 m along the bow, uv.y 0.023 m round it) T comes out about 0.2 long, which
// stretched the along-grip roughness about five times: a white-hot streak down the
// whole bow (hero dL +12.65, planning probe d). setupVariants re-orthonormalises T
// against the shading normal; the material's anisotropy runs along +T only (its
// direction is vec2(a, 0)), so B is N x T. Pinned to three 0.186.1: re-check it on
// an upgrade (it relies on TBNViewMatrix, anisotropyT and anisotropyB).
class BrassMaterial extends RoomPhysicalMaterial {
  static get type() {
    return "BrassNodeMaterial";
  }
  constructor(parameters, share, U) {
    super(parameters, share, share);
    this.brassU = U;
  }
  // runs before setupLightingModel (NodeMaterial.setupLighting: the material's
  // lightings, then the model), so the model knows whether an environment map is there
  setupEnvironment(builder) {
    const env = super.setupEnvironment(builder);
    this.brassHasEnv = env !== null;
    return env;
  }
  setupLightingModel() {
    return new BrassLighting(this.windowShare, this.useAnisotropy, this.brassU, this.brassHasEnv === true);
  }
  setupVariants(builder) {
    super.setupVariants(builder);
    if (this.useAnisotropy) {
      const N = normalView;
      const t0 = TBNViewMatrix[0];
      const t1 = t0.sub(N.mul(N.dot(t0)));
      const t = t1.div(t1.length().max(1e-6));
      anisotropyT.assign(t);
      anisotropyB.assign(N.cross(t));
    }
  }
  customProgramCacheKey() {
    return super.customProgramCacheKey() + ":brass";
  }
}

// --- textures ------------------------------------------------------------------------------
// Generated in roomTextures.js (pure noise into plain pixel arrays, worker-safe) and
// wrapped in DataTextures here. The engine starts them in a Web Worker as soon as the
// quality tier is known (prepareRoomTextures, below) and hands the result in through
// ctx.textures, so the room's build no longer carries about 0.5 s of texture CPU on
// the main thread (2026-10-05: the biggest single block in the warm-up behind the
// plain page). Without a worker, or if it fails, they are generated here, as before.
export { DUST_TILE, SPECK_MEAN };

function dataTex(data, w, h, { srgb = false } = {}) {
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}
// a tree of raw textures (roomTextures.js) to the same tree of DataTextures
function wrapTextures(node) {
  if (node && node.raw) return dataTex(node.data, node.w, node.h, { srgb: node.srgb });
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = wrapTextures(v);
  return out;
}

// The textures for a quality tier, generated in a worker: resolves to what
// createRoomMaterials takes as ctx.textures, or null if there is no worker (then the
// materials generate them on the main thread). One worker per call, gone on receipt.
export async function prepareRoomTextures(quality = "high") {
  if (typeof Worker === "undefined") return null;
  // a repeat visit reads them back from IndexedDB (texCache.js, keyed by a hash of the
  // generator); the first one generates in the worker and stores the result
  let cache = null;
  try {
    cache = await import("./texCache.js");
    const hit = await cache.readTextures(quality);
    if (hit) return hit;
  } catch {
    cache = null;
  }
  const made = await generateInWorker(quality);
  if (made && cache) cache.writeTextures(made);
  return made;
}

function generateInWorker(quality) {
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL("./roomTextures.worker.js", import.meta.url), { type: "module" });
    } catch {
      return resolve(null);
    }
    const done = (value) => {
      try {
        worker.terminate();
      } catch {
        /* gone */
      }
      resolve(value);
    };
    worker.onmessage = (e) => done(e.data && !e.data.error && e.data.tree ? e.data : null);
    worker.onerror = () => done(null);
    worker.postMessage({ quality });
  });
}


// --- materials -----------------------------------------------------------------------------
const lin = (hex) => new THREE.Color(hex); // THREE.Color parses display hex into linear working space
const tuv = (tile) => uv().div(tile);

/**
 * createRoomMaterials(P, ctx) -> { m (named materials), u (uniforms), textures,
 *   update(state), apply(P), dispose() }
 * ctx.uniforms.skyAvg: the engine's mean sky light in scene units (linear colour uniform).
 */
export function createRoomMaterials(P, ctx = {}) {
  const R = P.room;
  // params.quality (high | mid | low, chosen at start by the engine): the low (phone)
  // tier builds the procedural textures at half resolution over the same physical
  // tiles; a phone's pixel is coarser than their texels anyway
  const quality = P.quality || "high";
  const low = quality === "low";
  // the clear coats of the enamels (paint, iron, lamp) run on the high tier only: a
  // second lobe per light cost 0.7 to 1.1 ms at the p = 0 hero on mid (loop 2, four
  // interleaved A/B pairs on WebGPU), a sixth of mid's 6 ms; mid and low take one
  // lobe tuned between the two. Capture shots always run high
  const coated = quality === "high";
  const owned = [];
  const own = (m, name) => {
    m.name = name;
    owned.push(m);
    return m;
  };
  // the textures: from the worker (ctx.textures, this tier's), or generated here
  const rawTex = ctx.textures && ctx.textures.quality === quality ? ctx.textures : generateRoomTextures(quality);
  const T = wrapTextures(rawTex.tree);
  const speckMean = rawTex.speckMean ?? SPECK_MEAN;

  // per-frame uniforms
  const u = {
    dust: uniform(1), // glass dust amount (look)
    scatter: uniform(0.9), // dust forward scatter of the sky
    wet: uniform(0), // rain wetness 0..1 (weather)
    rainT: uniform(0), // seconds (ambient time)
    slant: uniform(0), // running-drop slant (wind along the glass)
    lampColor: uniform(new THREE.Color("#ffbe6c")),
    bulb: uniform(8),
    paintBrush: uniform(1),
    paintDust: uniform(1),
    paintChips: uniform(1),
    paintAlbedo: uniform(new THREE.Color(0.087, 0.047, 0.04)),
    paintRough: uniform(0.28),
    paintCoat: uniform(1), // the enamel's clear top: its weight, roughness and brush-ridge normal scale
    paintCoatRough: uniform(0.06),
    paintCoatBrush: uniform(0.25),
    paintBaseSpec: uniform(0.25),
    ironBaseSpec: uniform(0.5),
    lampScuff: uniform(0.5),
    ironRough: uniform(0.3),
    ironCoat: uniform(1),
    ironCoatRough: uniform(0.08),
    lampRough: uniform(0.45),
    lampCoat: uniform(0.3),
    lampCoatRough: uniform(0.08),
    lampDust: uniform(1),
    ironDust: uniform(1),
    haze: uniform(0.2), // the dust's low-frequency haze
    speck: uniform(0.62), // the dust's fine grain
    rebateSky: uniform(0.3), // the glazing rebate's share of the sky's light (seen through the glass)
    neon: uniform(0), // the neon signs in the drops (room.window.glass.neon; 0 = none)
    // the brass (params.room.brass; set in apply(), so the GUI and the looks move them
    // live). Colours as uniform(Color) set with setRGB: vec3(aTHREE.Color) compiles to black
    brassF0: uniform(new THREE.Color(0.19, 0.17, 0.12)),
    brassTarnish: uniform(new THREE.Color(0.1, 0.09, 0.066)),
    brassRough: uniform(0.3),
    brassPatinaRough: uniform(0.6),
    brassAniso: uniform(0.5),
    brassBend0: uniform(0.008),
    brassBend1: uniform(0.017),
    brassBendWeight: uniform(0.4),
    brassInnerWeight: uniform(0.55),
    brassGrain: uniform(0.3),
    brassSurround: uniform(1.0),
    brassSurroundSat: uniform(0.2),
    brassRoomShare: uniform(0.12),
    brassSlotDepth: uniform(0.0003),
    brassIsoGain: uniform(0.75),
  };
  const skyAvg = ctx.uniforms?.skyAvg ?? uniform(new THREE.Color(0.3, 0.35, 0.45));
  // the sky's mean light in the dome's graded colour (light/grade.js): the raw
  // plate average keeps the ungraded palette (violet at night, salmon at dusk), so
  // what the room takes from the sky (the dust's scatter, the drops, the rebate)
  // takes the grade's colour at the plate's luminance, as the dome does
  const SG = ctx.uniforms ? skyGradeUniforms(ctx.uniforms) : null;
  const skyLum = dot(vec3(skyAvg), vec3(0.2126, 0.7152, 0.0722));
  const skyCol = SG ? mix(vec3(skyAvg), vec3(SG.horizon).add(vec3(SG.zenith)).mul(0.5).mul(skyLum), SG.recolor) : vec3(skyAvg);

  // pixel footprint in metres (UVs are metres everywhere): the band limit for every
  // fine term below. fade(a, b) is 1 while a pixel is under a metres, 0 above b.
  const guv0 = uv();
  const foot = max(fwidth(guv0.x), fwidth(guv0.y));
  const fade = (a, b) => float(1).sub(smoothstep(a, b, foot));
  // the minor axis of the footprint: at an oblique view the anisotropic texture
  // filter already averages along the major axis, so the glass grain's band limit
  // only has to watch the minor one (the major axis faded R2's grain to its mean
  // at the hero, R2 being seen 20 to 30 deg off its normal)
  const footMinor = min(fwidth(guv0.x), fwidth(guv0.y));
  const fadeMinor = (a, b) => float(1).sub(smoothstep(a, b, footMinor));

  // --- frame enamel: glossy maroon-brown with brush streaks, nibs, chips and dust ---
  // Albedo: Lab (28, 9, 6.5), hue 36 (5480 and 5481 under the room light: #4b3937,
  // #513f3c, #59403c, hue 30 to 33 under a warm lamp; round 1 had hue 67, an olive
  // brown that the day's cool fill turned into grey driftwood). Its variation stays
  // within 5 percent: the gloss, not the albedo, draws every edge and streak.
  const pd = texture(T.paint.data, tuv(0.25));
  const upness = clamp(normalWorld.y, 0, 1);
  const paintDustAmt = pd.r.mul(u.paintDust).mul(float(0.3).add(upness.mul(0.9))).clamp(0, 1);
  const chip = pd.b.mul(u.paintChips);
  const enamelBase = vec3(u.paintAlbedo).mul(float(0.95).add(pd.g.mul(0.1)));
  const enamelColor = mix(mix(enamelBase, vec3(0.12, 0.105, 0.09), paintDustAmt.mul(0.35)), vec3(0.3, 0.24, 0.18), chip.mul(0.85));
  // Loop 2 (gloss): gloss enamel is one smooth interface over a pigment that is
  // nearly all diffuse. So: a clear coat (paint.coatRoughness 0.06) carrying straight
  // fine brush ridges (paint.coatBrush), over a base whose own specular is a faint
  // broader sheen (paint.roughness 0.28 at paint.baseSpec 0.25 of a dielectric's
  // F0). The lamp, its glow and the ceiling light draw crisp streaks textured by
  // the ridges, the rounded bead of the casing and the rounded bars catch them as
  // lines, where one 0.1 lobe with a faint normal read as matte clay (the critics:
  // "matte pink-mauve, no gloss, no brush marks"). Dust and chips matte the coat
  // where they sit. Mid and low keep one lobe (0.12), one lighting pass per light.
  // both lobes take the fine-ridge normal (T.paint.coat): the flow waves of
  // T.paint.normal in the broad base lobe bent the ceiling light into wide wavy
  // bands down the casing in 5481 (loop 2, first cut)
  const paintN = texture(T.paint.coat, tuv(0.25));
  const enamelRough = u.paintRough.add(pd.g.sub(0.5).mul(0.05)).add(paintDustAmt.mul(0.3)).add(chip.mul(0.5)).clamp(0.06, 1);
  const enamelNormal = normalMap(paintN, vec2(u.paintBrush.mul(0.5)));
  const coatAmt = u.paintCoat.mul(float(1).sub(paintDustAmt.mul(0.7)).sub(chip)).clamp(0, 1);
  const coatRough = u.paintCoatRough.add(paintDustAmt.mul(0.35)).add(pd.g.sub(0.5).mul(0.03)).clamp(0.03, 1);
  const coatNormal = normalMap(paintN, vec2(u.paintCoatBrush));
  const lowRough = u.paintCoatRough.mul(2).add(paintDustAmt.mul(0.3)).add(chip.mul(0.5)).clamp(0.06, 1);
  const glossy = (m) => {
    m.colorNode = enamelColor;
    if (!coated) {
      m.roughnessNode = lowRough;
      m.normalNode = coatNormal;
    } else {
      m.roughnessNode = enamelRough;
      m.normalNode = enamelNormal;
      m.clearcoatNode = coatAmt;
      m.clearcoatRoughnessNode = coatRough;
      m.clearcoatNormalNode = coatNormal;
      // the pigment under the clear top is nearly all diffuse: its own specular at
      // full F0 (0.28 rough) spread the ceiling light as a broad silver sheen over
      // whole rails in 5484 (loop 2, first cut); dust brings some of it back
      m.specularIntensityNode = u.paintBaseSpec.add(paintDustAmt.mul(0.5)).clamp(0, 1);
    }
    return m;
  };
  const Paint = coated ? RoomPhysicalMaterial : RoomStandardMaterial;
  // the frame's paint sees a share of the window fill: the L pair's room faces
  // face away from it (they get nothing either way); the right section's faces,
  // turned 23 deg toward the room, would see the left pair over their shoulder at
  // grazing, but the corner post and the casing stand in the way
  const enamel = glossy(own(new Paint({ metalness: 0 }, R.paint.windowShare ?? 0.3, R.paint.specShare ?? 0.3), "enamel"));
  // the same paint on faces the window cannot reach: the side of the corner post
  // that faces L2 (shaded by L2's hinge stile) and the like. The window fill is an
  // unshadowed RectAreaLight, so it lit these as if they saw the whole opening and
  // drew pale false edges (round 1: the "right casing reveal" at p=0); `shade` is
  // the fraction of the opening they really see
  const enamelShade = glossy(own(new Paint({ metalness: 0 }), "enamelShade"));
  const SHADE = 0.22;
  enamelShade.outputNode = output.mul(vec4(SHADE, SHADE, SHADE, 1)); // every light's share, diffuse and gloss alike

  // the pane reveal: the sticking's side between the glass and its chamfer. Matte
  // and a little darker than the faces (weathered, dusty paint). A glossy reveal
  // beside the bright glass mirrored the pane at grazing view: a pale outline
  // round every pane (round 2). It sees only its own pane, at grazing, through the
  // dust: 0.35 of the fill puts it near the wood's own value, as the photos show it
  const RV = R.window.reveal || {};
  const reveal = own(new RoomStandardMaterial({ metalness: 0 }, RV.windowShare ?? 0.35), "enamelReveal");
  reveal.colorNode = enamelColor.mul(RV.shade ?? 0.7);
  reveal.roughnessNode = float(RV.roughness ?? 0.75);
  // the glazing rebate behind the glass: seen through the pane, its faces are the
  // outside putty and paint, lit by the sky (a share of the sky's light). Round 1
  // drew it as unlit enamel, a dark rim inside every pane
  const rebate = own(new THREE.MeshStandardNodeMaterial({ metalness: 0 }), "rebate");
  rebate.colorNode = vec3(0.12, 0.1, 0.09);
  rebate.roughnessNode = float(0.9);
  rebate.emissiveNode = mix(skyCol, vec3(skyLum), 0.6).mul(u.rebateSky).mul(vec3(1.0, 0.94, 0.88));
  rebate.mrtNode = mrt({ emissive: vec3(0) });

  // the brown exterior box grille: the same paint, weathered and dusty, matte
  const brown = own(new THREE.MeshStandardNodeMaterial({ metalness: 0 }), "exteriorBrown");
  const bc = lin(P.room.exterior.color);
  brown.colorNode = mix(vec3(bc.r, bc.g, bc.b), vec3(0.2, 0.17, 0.13), pd.r.mul(0.6)).mul(float(1).sub(u.wet.mul(0.35)));
  brown.roughnessNode = float(0.72).add(pd.g.mul(0.2)).sub(u.wet.mul(0.4)).clamp(0.2, 1);

  // --- black iron: glossy enamel heavily speckled with grey dust (13-photo 4.7) ---
  const IA = R.iron.albedo;
  const dSpeck = texture(T.dust, tuv(DUST_TILE));
  // (the photos: #1b1714 under the room light, about a fifth of the paint's value, so
  // the grey dust is a sparse stipple, not a coat). The specks are band-limited: at
  // the hero distance (0.72 m) a 1 mm speck is about a pixel, and at full contrast
  // (5x the iron) it sparkled under the TAA jitter and melted once converged (round
  // 1, hd/crop-bars.png); they fade to their mean before they reach pixel size
  const ironSpeck = mix(float(speckMean), dSpeck.r, fade(0.00025, 0.0005));
  const ironDustAmt = clamp(ironSpeck.mul(0.9).add(dSpeck.g.mul(0.12)).add(pd.r.mul(0.3)), 0, 1).mul(u.ironDust).mul(float(0.5).add(upness.mul(0.8)));
  // the bars' sides see the opening beside them through the frames and the other
  // bars, and in front of R2's dark plane: a share of the fill's mean
  // Loop 2: black gloss paint over iron (a dielectric: metalness 0; round 1's 0.15
  // only darkened its gloss), a clear coat that draws the highlight line down each
  // rounded bar (room/geom.js roundBarGeo), the dust a sparse grey on the upward
  // faces that mattes the coat where it sits. It sees most of the window in its
  // gloss (iron.specShare): the bars stand in front of the glass
  const ironDustLook = ironDustAmt.mul(0.5);
  const iron = own(!coated ? new RoomStandardMaterial({ metalness: 0 }, R.iron.windowShare ?? 0.6, R.iron.specShare ?? 0.9) : new RoomPhysicalMaterial({ metalness: 0 }, R.iron.windowShare ?? 0.6, R.iron.specShare ?? 0.9), "iron");
  iron.colorNode = mix(vec3(IA[0], IA[1], IA[2]), vec3(0.16, 0.15, 0.14), ironDustLook.mul(0.3));
  iron.roughnessNode = u.ironRough.add(ironDustLook.mul(0.5)).add(pd.g.sub(0.5).mul(0.08)).clamp(0.1, 1);
  const ironN = normalMap(texture(T.paint.normal, tuv(0.25)), vec2(0.12));
  iron.normalNode = ironN;
  if (coated) {
    iron.clearcoatNode = u.ironCoat.mul(float(1).sub(ironDustLook.mul(1.2))).clamp(0, 1);
    iron.clearcoatRoughnessNode = u.ironCoatRough.add(ironDustLook.mul(0.4));
    iron.clearcoatNormalNode = ironN;
    iron.specularIntensityNode = u.ironBaseSpec.add(ironDustLook.mul(0.5)).clamp(0, 1);
  } else iron.roughnessNode = u.ironCoatRough.mul(2.5).add(ironDustLook.mul(0.5)).clamp(0.1, 1);

  // --- oxidised brass: the D-handle and the hinges (13-photo 4.5; params.room.brass) ---
  // Why not the photographed colour: 13-photo 4.5's median #a77960 is the handle as
  // LIT (by the 3000 K lamp), not the metal's F0. In linear, (0.39, 0.19, 0.12) has G/R
  // 0.49 and B/R 0.31, redder than copper (G/R about 0.67; brass is about 0.86 and
  // 0.46), and the lamp warmed it a second time: pale salmon plastic (hue 53 at the
  // hero, 62 in 5482 against the photo's 73), and with L* +11 over the enamel round it
  // the most legible object at p = 0. The F0 is now a worn, tarnished brass: brass's
  // ratios, desaturated and darker (brass.f0), so its glints sit under the stile's.
  // Why windowShare: as a plain metal it took the whole unshadowed window fill, about
  // 39 percent of its light (fill off: L* 42.3 to 33.4, the enamel ring round it 35.3
  // to 33.9); the bar stands 2 cm off a frame that hides most of the opening from it,
  // so it takes the enamel's share (0.3).
  // Why not the UVs: the tube's, the lathe's and the cylinder's UVs run 0 to 1 per
  // part, not in metres, so the paint's 0.25 m tile was squeezed onto 11 cm of bow and
  // 2.3 cm round it (random mottling, lilac bolsters). The patina is placed in object
  // space instead: each batch's glass plane is z = 0, so positionGeometry.z minus the
  // leaf's face is the height off the door (m). The legs, the bends and the turned feet
  // sit within brass.bend of the face, where no hand polishes it and the cloth misses:
  // they darken. The bow's inside faces the door (normalGeometry.z < 0) and darkens
  // less; a grain breaks the edge, faded by the pixel's footprint (as the iron's
  // speck) so it cannot sparkle under the TAA jitter. The hinges sit in the rebate,
  // behind the face: all patina, and hidden.
  // Anisotropy runs along the grip (the tube's uv.x runs along the bow), on the high
  // tier only (as the clear coats); it shapes the punctual lights' glints only (the
  // rect lights' LTC lobe is isotropic). Why its frame is renormalised: BrassMaterial.
  // The screws' slots are a detail on the caps only (no geometry): a band across each
  // cap's disc UV, as a bump and filled with patina, faded out below a pixel.
  const BR = R.brass || {};
  const hFace = positionGeometry.z.sub((R.window.leaf.depth - R.window.leaf.glassFromBack) * P.dims.W);
  // the pixel's footprint on the surface (m): about 1.4 times the pixel's size on a face
  // seen square on (fwidth is |d/dx| + |d/dy| per axis)
  const footG = length(fwidth(positionGeometry));
  const nearFace = float(1).sub(smoothstep(u.brassBend0, u.brassBend1, hFace));
  const inner = float(1).sub(smoothstep(-0.6, 0.1, normalGeometry.z));
  const gSize = BR.grainSize ?? 0.0004;
  const [gF0, gF1] = BR.grainFade ?? [0.0002, 0.0005];
  // two hashed cell sizes (0.4 and 1.1 mm), each faded once its cell nears a pixel
  const grainCell = (k) => {
    const q = floor(positionGeometry.div(gSize * k));
    return hash(q.x.add(q.y.mul(57)).add(q.z.mul(131)).add(4099)).sub(0.5).mul(float(1).sub(smoothstep(gF0 * k, gF1 * k, footG)));
  };
  const grain = grainCell(1).add(grainCell(2.7)).mul(0.5);
  const SL = BR.slot || {};
  const capMask = smoothstep(0.0007, 0.0009, hFace).mul(float(1).sub(smoothstep(0.0013, 0.0015, hFace))).mul(smoothstep(0.85, 0.95, normalGeometry.z));
  const sa = ((SL.angleDeg ?? 15) * Math.PI) / 180;
  const suv = uv().sub(0.5);
  const sd = abs(suv.x.mul(Math.cos(sa)).add(suv.y.mul(Math.sin(sa)))); // across the slot, in the cap's disc UV (radius 0.5)
  const se = max(fwidth(sd), 0.015);
  const sw = (SL.width ?? 0.16) / 2;
  const [sF0, sF1] = SL.fade ?? [0.0005, 0.001];
  const slot = float(1).sub(smoothstep(float(sw).sub(se), float(sw).add(se), sd)).mul(capMask).mul(float(1).sub(smoothstep(sF0, sF1, footG)));
  const patina = max(nearFace.mul(u.brassBendWeight).add(inner.mul(u.brassInnerWeight)).add(grain.mul(u.brassGrain)), slot).clamp(0, 1);
  const brass = own(
    new BrassMaterial({ metalness: 1 }, BR.windowShare ?? 0.3, {
      nFace: transformNormalToView(vec3(0, 0, 1)).normalize(), // the leaf's face (+z in each batch), in view space
      albedo: u.paintAlbedo,
      sat: u.brassSurroundSat,
      surround: u.brassSurround,
      roomShare: u.brassRoomShare,
    }),
    "brass",
  );
  // the tiers without anisotropy (mid, low): the isotropic lobe keeps the lamp's glint
  // where the bow's curve samples it, where the stretched one spreads it along the grip
  // into directions the tube never shows, so the same F0 reads lighter; brass.isoGain
  // scales the F0 there (fit on the mid and low hero probes: params.room.js)
  const brassF0 = mix(vec3(u.brassF0), vec3(u.brassTarnish), patina);
  brass.colorNode = coated ? brassF0 : brassF0.mul(u.brassIsoGain);
  brass.roughnessNode = mix(u.brassRough, u.brassPatinaRough, patina);
  if (coated) brass.anisotropyNode = vec2(u.brassAniso.mul(float(1).sub(patina.mul(0.7))), 0);
  // the slot as a height (m, down into the cap) and Mikkelsen's surface-gradient bump
  // with the true screen derivatives (unnormalised, so the height is in metres); off
  // the slots the shading normal is the geometry's
  {
    const H = slot.mul(u.brassSlotDepth).negate();
    const sx = positionView.dFdx(), sy = positionView.dFdy();
    const N0 = normalView;
    const r1 = sy.cross(N0), r2 = N0.cross(sx);
    const det = sx.dot(r1).mul(faceDirection);
    const grad = det.sign().mul(H.dFdx().mul(r1).add(H.dFdy().mul(r2)));
    brass.normalNode = slot.greaterThan(0.001).select(det.abs().mul(N0).sub(grad).normalize(), N0);
  }

  // --- cream plaster wall: emulsion over smooth plaster. Only a very low-frequency
  // albedo drift (under 1 percent) and a faint fine peel (normal scale 0.08, about a
  // sixth of round 1's). Target: mid-frequency texture under 0.6 percent of L* on the
  // lamp-lit wall at p = 0 (the photographed wall in 5480: 0.4) ---
  const pl = texture(T.plaster.data, tuv(0.6));
  const wc = lin(R.wall.color);
  const plaster = own(new THREE.MeshStandardNodeMaterial({ metalness: 0 }), "plaster");
  plaster.colorNode = vec3(wc.r, wc.g, wc.b).mul(float(0.99).add(pl.r.mul(0.02)).sub(pl.g.mul(0.006)));
  plaster.roughnessNode = float(0.93).add(pl.g.sub(0.5).mul(0.06)); // the paint sheens a touch unevenly (the colour sample, so no extra texture read)
  plaster.normalNode = normalMap(texture(T.plaster.normal, tuv(0.6)), vec2(R.wall.peel ?? 0.08));

  // --- the grey dusty sill ledge ---
  const sc = lin(R.sill.color);
  const sillM = own(new THREE.MeshStandardNodeMaterial({ metalness: 0 }), "sill");
  sillM.colorNode = mix(vec3(sc.r, sc.g, sc.b), vec3(0.3, 0.29, 0.26), pd.r.mul(0.5)).mul(float(1).sub(u.wet.mul(0.3)));
  sillM.roughnessNode = float(0.82).sub(u.wet.mul(0.45));
  sillM.normalNode = normalMap(texture(T.plaster.coarse, tuv(0.3)), vec2(0.6));

  // --- fabric blind ---
  const blind = own(new THREE.MeshStandardNodeMaterial({ metalness: 0, side: THREE.DoubleSide }), "blind");
  blind.colorNode = texture(T.blind.color, vec2(uv().x.div(0.4), uv().y.div(0.1))).rgb.mul(0.62);
  blind.roughnessNode = float(0.96);
  blind.normalNode = normalMap(texture(T.blind.normal, vec2(uv().x.div(0.4), uv().y.div(0.1))), vec2(0.8));

  // --- bead chain: ivory and brown (13-photo 7) ---
  // (13-photo 7 measured #e1d6c6 under the room light: a lit colour, so the
  // albedo sits lower; satin plastic beads)
  const chainIvory = own(new THREE.MeshStandardNodeMaterial({ color: lin("#bdb09e"), roughness: 0.62, metalness: 0 }), "chainIvory");
  const chainBrown = own(new THREE.MeshStandardNodeMaterial({ color: lin("#3a2a20"), roughness: 0.62, metalness: 0 }), "chainBrown");

  // --- lamp: black enamel (13-photo 5; 5484): a gloss black dome under a clear coat,
  // scuffed through to dull black in places; a white reflector inside; a cream swivel.
  // Linear albedo 0.018: round 1's 0.016 to 0.08 at roughness 0.4 to 0.9 caught the
  // window fill as a soft grey clay. Now the diffuse is negligible and the window
  // reaches it only as the rect light's specular: black in the middle, a crisp curved
  // rim where the dome turns toward the glass (Fresnel at grazing)
  // Round 2: the dome sits in front of R2's dark plane, the corner post and R1's
  // frame, so the uniform window fill (the opening's mean light) overstates what its
  // gloss can mirror: it sees about 0.4 of it (R2 reads 0.42 of the clear glass).
  // Albedo 0.012 (satin black enamel over black pigment); the photo's dome is a
  // near-black with a thin rim where it turns to the window
  // Loop 2: semi-matte black enamel as two lobes (the critics: "matte grey-brown
  // clay with a fuzzy edge", "a hammered noise over a big soft specular blob"). The
  // base is satin black pigment (lamp.roughness: the ceiling light's broad soft
  // highlight in 5484), a thin smooth top (lamp.coat, lamp.coatRoughness) whose
  // Fresnel draws the window as a crisp line only where the dome turns away, and the
  // lamp and ceiling light as sharp points. No normal map: round 1's paint normal at
  // a 12 cm tile was the "hammered" noise. Wear is two things: sparse pale dust
  // specks (lamp.dust, 5484), band-limited like the glass's grain so none sparkles
  // under the TAA jitter, and a few large dull patches (lamp.scuff), roughness only.
  const LP = R.lamp;
  const LA = LP.albedo ?? 0.012;
  const lampDustT = texture(T.dust, tuv(0.4)); // specks 0.3 to 0.8 mm across, the sparse ones only
  const lampDustAmt = smoothstep(0.8, 1.0, lampDustT.r).mul(smoothstep(0.45, 0.7, lampDustT.g)).mul(fade(0.00025, 0.0006)).mul(u.lampDust).mul(float(0.35).add(upness.mul(0.65)));
  // scuffs: a few low-frequency patches (5 to 8 cm) where the gloss is worn dull (13-photo
  // 5: "scuffed through to dull black in places"; 5484), roughness only, no normal
  const lampScuffT = texture(T.plaster.data, tuv(0.25)).r;
  const lampScuff = smoothstep(0.6, 0.72, lampScuffT).mul(u.lampScuff);
  const lampBlack = own(!coated ? new RoomStandardMaterial({ metalness: 0 }, LP.windowShare ?? 0.4, LP.specShare ?? 0.5) : new RoomPhysicalMaterial({ metalness: 0 }, LP.windowShare ?? 0.4, LP.specShare ?? 0.5), "lampBlack");
  lampBlack.colorNode = mix(vec3(LA, LA, LA), vec3(0.11, 0.105, 0.1), lampDustAmt.mul(0.8)).mul(float(1).add(lampScuff.mul(0.4)));
  lampBlack.roughnessNode = u.lampRough.add(lampDustAmt.mul(0.5)).add(lampScuff.mul(0.3)).clamp(0.05, 1);
  if (coated) {
    lampBlack.clearcoatNode = u.lampCoat.mul(float(1).sub(lampDustAmt).sub(lampScuff.mul(0.8))).clamp(0, 1);
    lampBlack.clearcoatRoughnessNode = u.lampCoatRough;
  } else lampBlack.roughnessNode = u.lampRough.mul(0.75).add(lampDustAmt.mul(0.5)).add(lampScuff.mul(0.3)).clamp(0.05, 1); // mid and low: one lobe between the two
  const lampInside = own(new THREE.MeshStandardNodeMaterial({ color: lin("#e8e4dc"), roughness: 0.55, metalness: 0, side: THREE.BackSide }), "lampInside");
  lampInside.emissiveNode = vec3(u.lampColor).mul(u.bulb.mul(0.012));
  // the vent holes near the cup's end: dark wells; one of them catches a faint
  // glint of the lit socket (the 17:41 photo shows one faint glint, not a ring of
  // glowing holes; round 1 lit all ten at 0.012 of the bulb)
  const lampVent = own(new THREE.MeshBasicNodeMaterial(), "lampVent");
  lampVent.colorNode = vec3(u.lampColor).mul(u.bulb.mul(LP.ventGlow ?? 0.0015));
  lampVent.mrtNode = mrt({ emissive: vec3(0) });
  const cream = own(new THREE.MeshStandardNodeMaterial({ color: lin("#d8ccb2"), roughness: 0.5, metalness: 0 }), "creamPlastic");
  const steelDark = own(new THREE.MeshStandardNodeMaterial({ color: lin("#222222"), roughness: 0.45, metalness: 0.8 }), "steelDark");
  const screwSteel = own(new THREE.MeshStandardNodeMaterial({ color: lin("#9a9a98"), roughness: 0.3, metalness: 1 }), "screwSteel");
  const bulb = own(new THREE.MeshBasicNodeMaterial(), "bulb");
  const bulbLight = vec3(u.lampColor).mul(u.bulb);
  bulb.colorNode = bulbLight;
  bulb.mrtNode = mrt({ emissive: bulbLight.mul(0.5) });

  // --- monitors ---
  const monBlack = own(new THREE.MeshStandardNodeMaterial({ color: lin("#0f0f10"), roughness: 0.55, metalness: 0 }), "monitorBlack");
  const monBezel = own(new THREE.MeshStandardNodeMaterial({ color: lin("#0a0a0b"), roughness: 0.4, metalness: 0 }), "monitorBezel");
  const portraitFace = own(new THREE.MeshStandardNodeMaterial({ color: lin("#0b0b0d"), roughness: 0.18, metalness: 0 }), "portraitFace");
  const champagne = own(new THREE.MeshStandardNodeMaterial({ color: lin("#b8a08a"), roughness: 0.35, metalness: 0.9 }), "champagne");

  // --- desk: dark brown wood-look under a satin lacquer. The grain carries 0.55x to
  // 1.45x of the albedo so it reads in the closing shot, and the satin finish takes
  // the screen's and the lamp's light as a soft sheen that falls off with distance
  const DA = R.desk.albedo;
  const wd = texture(T.wood, vec2(uv().x.div(0.2), uv().y.div(0.6)));
  const desk = own(new THREE.MeshStandardNodeMaterial({ metalness: 0 }), "desk");
  desk.colorNode = vec3(DA[0], DA[1], DA[2]).mul(float(0.55).add(wd.r.mul(0.9)));
  desk.roughnessNode = float(0.36).add(wd.g.mul(0.12)).add(wd.r.mul(0.1));
  // the white cloth strip under the portrait monitor (5480: a sliver at its foot)
  const cloth = own(new THREE.MeshStandardNodeMaterial({ color: lin("#c9c4ba"), roughness: 0.97, metalness: 0 }), "cloth");

  // --- car, tile, bottle, dock ---
  // the Hot Wheels woodie's paint: pearl silver-grey (5483, L* about 72) with some
  // metal in it under a clear coat (the die-cast's glossy lacquer: crisp window
  // reflections over a softer pearl sheen). The low tier drops the clear coat
  const carBody = own(low ? new THREE.MeshStandardNodeMaterial({ metalness: 0.3, roughness: 0.3 }) : new THREE.MeshPhysicalNodeMaterial({ metalness: 0.3, roughness: 0.36, clearcoat: 1, clearcoatRoughness: 0.06 }), "carBody");
  carBody.colorNode = texture(T.livery).rgb;
  // the car's plated parts: the scene has no environment map, so a pure metal
  // mirrors only the lights and reads black (round 2: the blower was a dark
  // block); half metal, half bright paint stands in for the room it would mirror
  const chrome = own(new THREE.MeshStandardNodeMaterial({ color: lin("#d8d8d8"), roughness: 0.2, metalness: 0.55 }), "chrome");
  const goldChrome = own(new THREE.MeshStandardNodeMaterial({ color: lin("#d6b25a"), roughness: 0.24, metalness: 0.55 }), "goldChrome");
  const tyre = own(new THREE.MeshStandardNodeMaterial({ color: lin("#111111"), roughness: 0.7, metalness: 0 }), "tyre");
  const rim = own(new THREE.MeshStandardNodeMaterial({ color: lin("#b8643a"), roughness: 0.28, metalness: 1 }), "rim"); // copper
  const surf = own(new THREE.MeshStandardNodeMaterial({ color: lin("#3a9cc0"), roughness: 0.35, metalness: 0 }), "surfboard"); // teal (5483)
  const carGlass = own(new THREE.MeshStandardNodeMaterial({ color: lin("#2f7e8c"), roughness: 0.08, metalness: 0 }), "carGlass");
  const tileFace = own(new THREE.MeshStandardNodeMaterial({ roughness: 0.4, metalness: 0 }), "tileFace");
  tileFace.colorNode = texture(T.tile).rgb;
  const tileEdge = own(new THREE.MeshStandardNodeMaterial({ color: lin("#e8e2d6"), roughness: 0.6, metalness: 0 }), "tileEdge");
  const steelBrushed = own(new THREE.MeshStandardNodeMaterial({ color: lin("#c8c8c6"), roughness: 0.3, metalness: 1 }), "steelBrushed");
  steelBrushed.roughnessNode = float(0.26).add(texture(T.paint.normal, vec2(uv().x.div(0.02), uv().y.div(0.5))).r.mul(0.12));
  // the 3-in-1 dock: bead-blasted grey aluminium (13-photo 6), a broad satin sheen
  const dockGrey = own(new THREE.MeshStandardNodeMaterial({ color: lin("#8e9196"), roughness: 0.48, metalness: 0.7 }), "dockGrey");
  const padBlack = own(new THREE.MeshStandardNodeMaterial({ color: lin("#1a1a1c"), roughness: 0.6, metalness: 0 }), "padBlack");
  const whitePlastic = own(new THREE.MeshStandardNodeMaterial({ color: lin("#f2f2f0"), roughness: 0.35, metalness: 0 }), "whitePlastic");
  const blocked = own(new THREE.MeshStandardNodeMaterial({ color: lin(P.room.blocked.color), roughness: 0.95, metalness: 0 }), "blocked");
  const dark = own(new THREE.MeshStandardNodeMaterial({ color: lin("#0a0807"), roughness: 0.8, metalness: 0 }), "darkRecess");
  // the glazing putty: a thin fillet on the glass at every pane edge (window.js),
  // weathered tan-pink where it shows (5481: a thin pinkish line round most of a
  // pane's edge), painted over with the enamel elsewhere (the 17:41 photo: white
  // putty at a few corners only). The mask runs along the member (UV v is along
  // it). Round 1: a 0.03 W strip of pale #9f9583 round every pane
  const PT = R.window.putty || {};
  const ptC = lin(PT.color || "#9c8579");
  const ptShow = smoothstep(float(0.6 - (PT.share ?? 0.55) * 0.3), float(0.64 - (PT.share ?? 0.55) * 0.3), texture(T.paint.data, vec2(uv().x.div(0.02), uv().y.div(0.25))).g);
  const putty = own(new RoomStandardMaterial({ metalness: 0 }, 1), "putty");
  putty.colorNode = mix(enamelColor, vec3(ptC.r, ptC.g, ptC.b), ptShow);
  putty.roughnessNode = mix(float(0.3), float(0.85), ptShow);
  // bare wood where the old handle's fixings tore the enamel off (5482: a torn,
  // lighter brown rim round the keyhole slot, not a pale patch)
  const bareWood = own(new THREE.MeshStandardNodeMaterial({ color: lin("#6a4a33"), roughness: 0.8, metalness: 0 }), "bareWood");

  // --- glass: a dust film that scatters sky light (visible only over dark things),
  // drops and running streaks when wet, slanted by the wind. One material per
  // leaf group (L pair, R1, R2), identical but for how dusty each leaf is ---
  const guv = uv(); // metres on the pane (u right, v up)
  // a quarter-mip sharpening: at the hero a pixel covers about two texels, and
  // trilinear filtering there blurred the 1 px specks into a soft mottle (round 1
  // added a half-mip blur on top); the band limit below keeps them from sparkling
  const dst = texture(T.dust, guv.div(DUST_TILE)).bias(-0.25);
  // running drops: slanted columns, stick-slip heads with thin trails (a plain
  // function: it only assembles the node graph once, at build time)
  const rain = () => {
    const colW = float(0.009);
    const xs = guv.x.add(guv.y.mul(u.slant));
    const colF = xs.div(colW);
    const col = floor(colF);
    const fx = fract(colF).sub(0.5).mul(colW); // metres from the column centre
    const r1 = hash(col.add(11.3)), r2 = hash(col.mul(1.7).add(3.1)), r3 = hash(col.mul(2.9).add(7.7));
    const active = step(0.55, r1);
    const speed = mix(float(0.012), float(0.05), r2); // m/s
    const period = mix(float(0.18), float(0.5), r3); // m between drops
    const yy = guv.y.add(u.rainT.mul(speed)).div(period).add(r2.mul(5.0));
    const fy = fract(yy).mul(period); // metres above the head
    const rh = mix(float(0.0016), float(0.0032), r3);
    const head = float(1).sub(smoothstep(rh.mul(0.55), rh, length(vec2(fx, fy.sub(rh))))).mul(active);
    const trailLen = mix(float(0.03), float(0.12), r1);
    const trailW = rh.mul(0.32);
    const trail = float(1)
      .sub(smoothstep(trailW.mul(0.4), trailW, abs(fx)))
      .mul(float(1).sub(smoothstep(float(0), trailLen, fy)))
      .mul(step(rh.mul(1.5), fy))
      .mul(active);
    const beads = texture(T.beads, guv.div(0.1));
    const beadCov = beads.r;
    const cov = max(max(head, trail.mul(0.55)), beadCov.mul(0.8));
    // normal xy of the lenses (head dome, bead domes)
    const nHead = vec2(fx, fy.sub(rh)).div(rh).mul(head);
    const nBead = beads.gb.sub(0.5).mul(2).mul(beadCov);
    // a drop is a lens: the refracted (inverted) sky makes its lower half bright and
    // its edge picks up the dark surroundings, a dark rim that shows against the sky
    const rimB = beadCov.mul(float(1).sub(beadCov)).mul(4);
    const headSoft = float(1).sub(smoothstep(rh.mul(0.25), rh, length(vec2(fx, fy.sub(rh))))).mul(active);
    const rimH = head.sub(headSoft.mul(head)).mul(2.2).clamp(0, 1);
    return { cov, n: nHead.add(nBead), clean: max(trail, head), rim: max(rimB, rimH).clamp(0, 1), trail };
  };
  const rn = rain();
  const wetCov = rn.cov.mul(u.wet);
  // The dust film ADDS light: each speck forward-scatters the bright sky toward the
  // room, so over a dark bar or R2's dark plane it shows as a bright stipple, and
  // over the sky, whose light it only redirects, it all but vanishes (13-photo 4.9).
  // Three terms: a low-frequency haze (the soft gradient across R2), fine even specks
  // band-limited to their mean coverage as a pixel nears their size (so they never
  // alias or sparkle, round 1's gap), and sparse water spots and dried tracks.
  // Running drops wash it off where they run.
  // normalised to the design mean on every tier (the low tier's half-size texture
  // has fewer, clamped specks), faded to it as a pixel nears a speck's size
  const speckBL = mix(float(SPECK_MEAN), dst.r.mul(SPECK_MEAN / Math.max(1e-3, speckMean)), fadeMinor(0.0006, 0.0013));
  // The grain's weight per leaf (uGrain, set in apply()): speck x dust^1.5 as in
  // loop 1, now also faded out below the look's heavy dust (glass.grainFrom to
  // grainTo): Photo-true (dust 1.0) keeps the photos' crisp speckle, Heightened (0.4)
  // and Dreamlike (0.3) are a clean film (haze, spots, the veil) with no speckle.
  // Their speckle sat over the dark outside bars and, blurred by the depth of field
  // at the bars' depth, read as a granite texture ON the bars (both critics). R2 keeps
  // a frosted grain (glass.frost) while the dark plane stands behind it.
  const dustFilm = float(0.02).add(dst.g.mul(u.haze)).add(dst.b.mul(0.22));
  const paneGrain = { L: 0, R1: 0, R2: 0 };
  const uGrain = uniform(0).onObjectUpdate(({ object }) => paneGrain[object?.userData?.paneKey] ?? 0);
  const tint = lin(R.window.glass.tint);
  // each drop inverts what is behind it: the dark ground shows in its upper half,
  // the bright sky in its lower half (n.y > 0 is the drop's upper side)
  // (Cyberpunk) the neon signs, above the horizon, land in each drop's lower half
  // (outside/neon.js writes NEON; 0 in every other look, so this adds exactly 0).
  // Each drop shows ONE sign colour, picked per 12 mm cell of the pane (a drop is a
  // few mm): the two colours' average was a lavender that read as magenta, and the
  // teal sign never showed on the glass (2026-10-05, F7 on/off: 88 to 94 % magenta)
  // (2026-10-06) and only where the drop looks toward that colour's signs: a drop's
  // lower half shows a wide cone of what is above its line of sight, so the weight is
  // a broad one (NEON.spread.y) round the signs' direction (NEON.dirA / dirB), the
  // line of sight raised a little; elsewhere the drops keep the sky's colour
  const dropCell = floor(guv.div(0.012));
  const vGlass = normalize(positionWorld.sub(cameraPosition).add(vec3(0, positionWorld.sub(cameraPosition).length().mul(0.2), 0)));
  const nearGA = vec3(NEON.a).mul(dot(vGlass, NEON.dirA).sub(1).mul(NEON.spread.y).exp());
  const nearGB = vec3(NEON.b).mul(dot(vGlass, NEON.dirB).sub(1).mul(NEON.spread.y).exp());
  const neonPick = mix(nearGA, nearGB, step(0.5, hash(dropCell.x.mul(7.13).add(dropCell.y.mul(157.31)))));
  const neonDrop = neonPick.mul(float(1).sub(smoothstep(-0.25, 0.05, rn.n.y))).mul(u.neon);
  const lensSky = skyCol.mul(mix(float(1.3), float(0.22), rn.n.y.mul(0.5).add(0.5).clamp(0, 1))).mul(float(1).sub(rn.rim.mul(0.6))).mul(float(1).sub(rn.trail.mul(0.3))).add(neonDrop);
  // the film scatters light from a wide cone (sky, cloud, trees, the building),
  // so its colour is the sky's, mostly greyed: the photo's R2 stipple is a cool
  // grey (C* 2.8), and the sky grade's zenith colour made it blue (C* 7.7)
  const dustSky = mix(skyCol, vec3(skyLum), 0.7);
  const dustLight = dustSky.mul(u.scatter).mul(vec3(tint.r, tint.g, tint.b)).mul(1.7);
  // One material for every leaf (one shader program: WebGL2 compiles are slow); how
  // dusty each leaf is comes in per object, from the mesh's userData.paneKey
  const paneDust = { L: 1, R1: 1, R2: 1 };
  const uPane = uniform(1).onObjectUpdate(({ object }) => paneDust[object?.userData?.paneKey] ?? 1);
  // the forward-scatter veil: the film spreads a share of the sky's light over the
  // whole pane, so what is dark behind it (the outside bars, the trees) lifts
  // toward the sky while the sky itself, whose light it only redirects, stays put
  // (an even term in the film's cover; the grain above is its texture)
  const paneVeil = { L: 0, R1: 0, R2: 0 };
  const uVeil = uniform(0).onObjectUpdate(({ object }) => paneVeil[object?.userData?.paneKey] ?? 0);
  const glass = own(new THREE.MeshStandardNodeMaterial({ transparent: true, depthWrite: false, metalness: 0, side: THREE.DoubleSide }), "glass");
  const washed = float(1).sub(rn.clean.mul(u.wet).mul(0.85));
  const filmAmt = dustFilm.mul(u.dust).add(speckBL.mul(uGrain)).mul(uPane).mul(washed); // the grains and haze (they also catch the room's lights)
  const dustAmt = filmAmt.add(uVeil.mul(u.dust).mul(washed)); // plus the veil (the sky's forward scatter only)
  // lit dust: sky light scattered forward (emissive, scales with the sky) plus the
  // room's own lights (the lamp catches the grains at night) through colorNode;
  // the dust back-scatters little toward a viewer on the lamp's side: 5482 shows the
  // lamp-lit stile bright gold beside dark glass with a few lit specks
  // (the veil is sky light only: the lamp and the ceiling light reach the film's
  // own grains, so the lit share is the film's part of the cover)
  glass.colorNode = vec3(tint.r, tint.g, tint.b).mul(0.08).mul(filmAmt.div(max(dustAmt, 1e-3)));
  glass.emissiveNode = mix(dustLight, lensSky, wetCov.clamp(0, 1));
  // drops are mostly clear: their inverted image and dark rim carry them
  glass.opacityNode = clamp(clamp(dustAmt, 0, 0.85).add(wetCov.mul(0.5)), 0, 0.95);
  glass.roughnessNode = mix(float(0.85), float(0.08), wetCov.clamp(0, 1));
  glass.normalNode = normalMap(vec3(rn.n.mul(u.wet).mul(0.5).add(0.5), 1));
  glass.mrtNode = mrt({ emissive: vec3(0) });
  const glassR1 = glass, glassR2 = glass;
  // R2's depth while it is frosted (room/window.js glassR2FrostDepth): depth only,
  // no colour; it discards every fragment while R2 is clear (uFrost 0), so it is
  // compiled with the scene and a look switch never builds a pipeline
  const uFrost = uniform(0);
  const glassFrostDepth = own(new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: true, colorWrite: false, side: THREE.DoubleSide }), "glassFrostDepth");
  glassFrostDepth.opacityNode = uFrost;
  glassFrostDepth.alphaTest = 0.5;

  const m = {
    enamel,
    enamelShade,
    reveal,
    rebate,
    brown,
    iron,
    brass,
    plaster,
    sill: sillM,
    blind,
    chainIvory,
    chainBrown,
    lampBlack,
    lampInside,
    lampVent,
    screwSteel,
    cream,
    steelDark,
    bulb,
    monBlack,
    monBezel,
    portraitFace,
    champagne,
    desk,
    cloth,
    carBody,
    chrome,
    goldChrome,
    tyre,
    rim,
    surf,
    carGlass,
    tileFace,
    tileEdge,
    steelBrushed,
    dockGrey,
    padBlack,
    whitePlastic,
    blocked,
    dark,
    putty,
    bareWood,
    glass,
    glassR1,
    glassR2,
    glassFrostDepth,
  };

  // the speck grain per leaf: see uGrain; R2 keeps glass.frost.R2 of the full grain
  // while it is frosted (the dark plane behind it: room.js setFrost)
  let frosted = false;
  function applyGrain(P2 = P) {
    const G = P2.room.window.glass;
    const d = Math.max(0, Math.min(1.5, G.dust));
    const lo = G.grainFrom ?? 0.35, hi = G.grainTo ?? 0.85;
    const t = Math.max(0, Math.min(1, (d - lo) / Math.max(1e-3, hi - lo)));
    const g = (G.speck ?? 0.62) * Math.pow(d, 1.5) * t * t * (3 - 2 * t);
    paneGrain.L = g;
    paneGrain.R1 = g;
    paneGrain.R2 = frosted ? Math.max(g, (G.speck ?? 0.62) * (G.frost?.R2 ?? 0.8)) : g;
    uFrost.value = frosted ? 1 : 0;
  }
  function apply(P2 = P) {
    const G = P2.room.window.glass;
    u.dust.value = Math.max(0, Math.min(1.5, G.dust));
    u.scatter.value = G.scatter;
    u.lampColor.value.set(P2.lights.lamp.color);
    u.bulb.value = P2.lights.lamp.bulb;
    const Pn = G.panes || {};
    paneDust.L = Pn.L ?? 1;
    paneDust.R1 = Pn.R1 ?? 1;
    paneDust.R2 = Pn.R2 ?? 1;
    const Vn = G.veil || {};
    paneVeil.L = Vn.L ?? 0;
    paneVeil.R1 = Vn.R1 ?? 0;
    paneVeil.R2 = Vn.R2 ?? 0;
    u.rebateSky.value = P2.room.window.rebateSky ?? 0.3;
    u.haze.value = G.haze ?? 0.2;
    u.speck.value = G.speck ?? 0.62;
    applyGrain(P2);
    const Pp = P2.room.paint;
    u.paintBrush.value = Pp.brush;
    u.paintDust.value = Pp.dust;
    u.paintChips.value = Pp.chips ?? 1;
    u.paintRough.value = Pp.roughness;
    u.paintCoat.value = Pp.coat ?? 1;
    u.paintCoatRough.value = Pp.coatRoughness ?? 0.06;
    u.paintCoatBrush.value = Pp.coatBrush ?? 0.25;
    const Ir = P2.room.iron, Lp = P2.room.lamp;
    u.ironRough.value = Ir.roughness ?? 0.3;
    u.ironCoat.value = Ir.coat ?? 1;
    u.ironCoatRough.value = Ir.coatRoughness ?? 0.08;
    u.lampRough.value = Lp.roughness ?? 0.45;
    u.lampCoat.value = Lp.coat ?? 0.3;
    u.lampCoatRough.value = Lp.coatRoughness ?? 0.08;
    u.lampDust.value = Lp.dust ?? 1;
    u.lampScuff.value = Lp.scuff ?? 0.5;
    u.paintBaseSpec.value = Pp.baseSpec ?? 0.25;
    u.ironBaseSpec.value = Ir.baseSpec ?? 0.5;
    u.paintAlbedo.value.setRGB(Pp.albedo[0], Pp.albedo[1], Pp.albedo[2]);
    u.ironDust.value = P2.room.iron.dust;
    const Bz = P2.room.brass || {};
    const f0 = Bz.f0 ?? [0.19, 0.17, 0.12], tn = Bz.tarnish ?? [0.1, 0.09, 0.066], bend = Bz.bend ?? [0.008, 0.017];
    u.brassF0.value.setRGB(f0[0], f0[1], f0[2]);
    u.brassTarnish.value.setRGB(tn[0], tn[1], tn[2]);
    u.brassRough.value = Bz.roughness ?? 0.3;
    u.brassPatinaRough.value = Bz.patinaRoughness ?? 0.6;
    u.brassAniso.value = Bz.anisotropy ?? 0.5;
    u.brassBend0.value = bend[0];
    u.brassBend1.value = bend[1];
    u.brassBendWeight.value = Bz.bendWeight ?? 0.4;
    u.brassInnerWeight.value = Bz.innerWeight ?? 0.55;
    u.brassGrain.value = Bz.grain ?? 0.3;
    u.brassSurround.value = Bz.surround ?? 1.0;
    u.brassSurroundSat.value = Bz.surroundSat ?? 0.2;
    u.brassRoomShare.value = Bz.roomShare ?? 0.12;
    u.brassSlotDepth.value = Bz.slot?.depth ?? 0.0003;
    u.brassIsoGain.value = Bz.isoGain ?? 0.75;
  }
  apply(P);

  function update(state) {
    u.rainT.value = state.time;
    u.neon.value = P.room.window.glass.neon ?? 0;
    const wx = state.weather;
    u.wet.value = Math.max(0, Math.min(1, wx?.rain?.wetness ?? 0));
    // the wind's component along the glass slants the running drops (a 30 km/h
    // cross wind leans them about 30 deg)
    const w = state.wind || {};
    const along = (w.vecX || 0) * Math.min(1, (w.speed || 0) / 30) * (w.gustEnvelope || 1);
    u.slant.value = Math.max(-0.7, Math.min(0.7, along * 0.6));
  }

  return {
    m,
    u,
    textures: T,
    apply,
    update,
    setFrost(on) {
      frosted = !!on;
      applyGrain(P);
    },
    dispose() {
      owned.forEach((x) => x.dispose());
      const all = [T.paint.normal, T.paint.coat, T.paint.data, T.dust, T.beads, T.plaster.normal, T.plaster.coarse, T.plaster.data, T.blind.color, T.blind.normal, T.wood, T.livery, T.tile];
      all.forEach((t) => t.dispose());
    },
  };
}
