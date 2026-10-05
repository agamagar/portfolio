// The window scene engine: renderer, scene, camera path, room, outside, lights,
// the Living Sky plate, the weather bridge, the post pipeline, the monitor screen
// and the render loop. WindowScenePage.jsx drives it (scroll progress, activity);
// capture.js exposes it to tools as window.__windowScene.
//
// Loop rules (20-question "Just build" 14, 30-locked-brief.md):
//   - one renderer.setAnimationLoop; setActive(false) stops it with
//     setAnimationLoop(null); renderFrames(n) runs exactly n frames on demand
//   - capture mode never renders on its own: every frame is asked for, time is ?t,
//     seeds are fixed, so identical shots are identical
//   - ambient time runs at display rate from THREE.Timer (paused with the tab)

import * as THREE from "three/webgpu";
import { texture, uniform, mix, mrt, vec2, vec3, vec4, uv as uvNode, smoothstep, positionWorld, cameraPosition, normalize, reflect, dot, exp, max, float } from "three/tsl";
import { lightBus } from "./light/bus.js";
import { createRenderer } from "./renderer.js";
import { createPost } from "./post.js";
import { cameraPose, applyPose, chairPose, keyframes } from "./camera.js";
import { createLights } from "./lights.js";
import { buildRoom } from "./room.js";
import { buildOutside } from "./outside.js";
import { placedMoonAt } from "./outside/moon.js";
import { createSkyPlate, skyUniformsFrom, plateUV, windPulse } from "./skyPlate.js";
import { createWeatherBridge } from "./weatherBridge.js";
import { deepMerge, hexToLinear, clone } from "./params.js";
import { composeParams, normalizeLook, LOOK_NAMES } from "./looks.js";
import { seededRandom } from "./capture.js";
import { pickQuality, gpuInfo, probeViewport, normalizeQuality, BUDGETS_MS } from "./quality.js";
import { skyGain } from "./light/exposure.js";
import { gradeSky } from "./light/grade.js";
import { applySupersample, syncUnjittered } from "./taau.js";
import { createCalm } from "./calm.js";

export const POSTERS = {
  // the portfolio's TOP screen (greeting, project list, the grid's first row) on the
  // page ground, 2560 x 1440: the hand-off lands on the very top of the page
  // (2026-09-27, Agam). The work-grid posters folio-light/dark.jpg are kept.
  light: "/window-scene/posters/folio-top-light.jpg",
  dark: "/window-scene/posters/folio-top-dark.jpg",
};
// the page ground the screen's light becomes at the hand-off (--bg)
export const PAGE_GROUND = { light: "#ffffff", dark: "#0e0e11" };

const D2R = Math.PI / 180;
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const srgb01 = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);

// Mean linear luminance of an image (the poster), from a small 2D copy.
function imageMeanLinear(img) {
  try {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 36;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0, 64, 36);
    const d = g.getImageData(0, 0, 64, 36).data;
    const lin = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
    return s / (d.length / 4);
  } catch {
    return 0.5;
  }
}

// The sky dome: a sphere segment of radius R around the window, each vertex along
// the direction its plate texel shows (skyPlate.plateUV), so the sun, the gold and
// the drift land where they really are.
function buildSkyDome(P, skyTex, uniforms) {
  const v = P.sky.view;
  const aspect = P.sky.plate.width / P.sky.plate.height;
  const view = { viewAz: v.viewAz, fovH: v.fovH, aspect };
  const R = P.sky.radius;
  const az0 = v.viewAz - v.fovH / 2 - 30, az1 = v.viewAz + v.fovH / 2 + 30;
  const el0 = -25, el1 = 89;
  const nA = 72, nE = 40;
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= nE; j++) {
    const el = el0 + ((el1 - el0) * j) / nE;
    for (let i = 0; i <= nA; i++) {
      const az = az0 + ((az1 - az0) * i) / nA;
      const a = az * D2R, e = el * D2R;
      pos.push(R * Math.cos(e) * Math.sin(a), R * Math.sin(e), -R * Math.cos(e) * Math.cos(a));
      const [u, vv] = plateUV(az, el, view);
      uv.push(u, vv);
    }
  }
  for (let j = 0; j < nE; j++)
    for (let i = 0; i < nA; i++) {
      const a = j * (nA + 1) + i, b = a + 1, c = a + nA + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide, depthWrite: true });
  m.fog = false;
  // below the horizon the plate has nothing (its v < 0 clamps to the horizon row):
  // fade to a distant-ground tone there, so rays that pass under the far trees
  // do not read as pale sky
  const plateSky = gradeSky(texture(skyTex).rgb, uniforms).mul(uniforms.skyGain); // light/grade.js: the golden hour
  const below = smoothstep(0.0, 0.08, uvNode().y.negate()); // WGSL smoothstep needs low < high
  const sky = mix(plateSky, uniforms.horizonGround, below);
  m.colorNode = sky;
  m.mrtNode = mrt({ emissive: sky.mul(uniforms.skyBloom) });
  const mesh = new THREE.Mesh(g, m);
  mesh.name = "skyDome";
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = -1;
  return { mesh, view };
}

// The sky's mean light for the lights and materials, measured on the GPU and read
// back WITHOUT stalling. The old path (skyPlate.readAverage: a synchronous
// readPixels on the plate's own WebGL context) waited for the whole GPU queue and
// froze the live loop for 0.6 to 1.5 s every averageEvery frames on every tier
// (round-2 perf-stalls). Here a 16 x 1 float target takes the mean of the plate's
// uploaded texture over the same region (each texel one column strip of it, 4 x 16
// taps, bilinear, linear light: the dome samples the same texture) and
// renderer.readRenderTargetPixelsAsync brings it back a frame or more later. WebGPU:
// mapAsync, never a wait (0 frames over 50 ms on every tier). WebGL2: a pixel-pack
// buffer and a polled fence, but Chrome's getBufferSubData still blocked (0.3 s with
// an uncapped queue), so the fallback reads rarely (frame(): averageSecondsWebGL2).
// One read in flight at a time; within 1 % of the plate's own read (skyAverageCheck).
const METER_N = 16, METER_TX = 4, METER_TY = 16;
function createSkyMeter(renderer, skyTex, { u0, u1, v0, v1 }) {
  // float32: RGBA/FLOAT is the readPixels format WebGL2 guarantees for a float
  // colour buffer, and a night sky's mean (about 0.003) keeps its precision
  const rt = new THREE.RenderTarget(METER_N, 1, { type: THREE.FloatType, depthBuffer: false, stencilBuffer: false });
  rt.texture.name = "skyMeter";
  rt.texture.generateMipmaps = false;
  rt.texture.minFilter = THREE.NearestFilter;
  rt.texture.magFilter = THREE.NearestFilter;
  const du = (u1 - u0) / METER_N;
  const col = uvNode().x.mul(METER_N).floor().clamp(0, METER_N - 1);
  const colU = col.mul(du).add(u0);
  let acc = null;
  for (let j = 0; j < METER_TY; j++) {
    const v = v0 + ((j + 0.5) / METER_TY) * (v1 - v0);
    for (let i = 0; i < METER_TX; i++) {
      const s = texture(skyTex, vec2(colU.add(((i + 0.5) / METER_TX) * du), v)).level(0).rgb;
      acc = acc ? acc.add(s) : s;
    }
  }
  const mat = new THREE.NodeMaterial();
  mat.name = "skyMeter";
  mat.fragmentNode = vec4(acc.div(METER_TX * METER_TY), 1);
  mat.depthTest = false;
  mat.depthWrite = false;
  const quad = new THREE.QuadMesh(mat);
  quad.name = "skyMeter";
  const decode = (arr) => {
    const half = arr instanceof Uint16Array;
    const f = (k) => (half ? THREE.DataUtils.fromHalfFloat(arr[k]) : arr[k]);
    const l = [0, 0, 0];
    let n = 0;
    for (let x = 0; x < METER_N; x++) {
      const r = f(x * 4), g = f(x * 4 + 1), b = f(x * 4 + 2);
      if (!(Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b))) continue;
      l[0] += r;
      l[1] += g;
      l[2] += b;
      n++;
    }
    if (!n) return null;
    const lin = l.map((c) => Math.max(0, c / n));
    const enc = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
    return { linear: lin, srgb: lin.map(enc) };
  };
  return {
    // draw the mean now (after the frame that uploaded the plate) and start the read;
    // resolves with { linear, srgb } or null
    measure() {
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(rt);
      quad.render(renderer);
      renderer.setRenderTarget(prev);
      return renderer.readRenderTargetPixelsAsync(rt, 0, 0, METER_N, 1).then(decode);
    },
    dispose() {
      rt.dispose();
      mat.dispose();
      quad.geometry?.dispose?.();
    },
  };
}

export function createWindowEngine({ canvas, opts, theme = "light" }) {
  const capture = !!opts.capture;
  const params = {};
  let look = normalizeLook(opts.look);
  const setLayer = clone(opts.set || {});
  const userLayer = {};
  // the quality tier's layer (quality.js): { quality, ...params.qualityTiers[tier] },
  // under ?set= and setParams() so either can still pin any knob
  let qualityLayer = {};
  let qualityWhy = "default";
  let gpu = null;
  // the viewport's layer: a portrait viewport moves the Dreamlike moon to where the
  // phone framing sees open sky (params.sky.moon.mobile), so the plate's disc, its
  // halo (outside/moon.js) and its rim light (lights.js) all follow one position
  let viewLayer = {};
  let portraitNow = false;
  const compose = () => composeParams(params, look, viewLayer, qualityLayer, setLayer, userLayer);
  compose();
  const P = params;
  function setQuality(tier, why) {
    const q = normalizeQuality(tier) || "high";
    qualityWhy = why;
    qualityLayer = { quality: q };
    compose();
    deepMerge(qualityLayer, clone(P.qualityTiers?.[q] || {}));
    compose();
    return q;
  }

  let disposed = false;
  let built = false;
  let rApi = null, renderer = null, post = null, lights = null, room = null, outside = null;
  let scene = null, camera = null, plate = null, skyTex = null, skyDome = null, skyView = null;
  let bridge = null, timer = null, screenMat = null;
  // the calm field under the page's text (calm.js): its wrapper around the post
  // pipeline's output, and the page's own text rects (null: params.calm.boxes)
  let calm = null;
  let calmBoxes = null;
  let screenInfo = null;
  const posterCache = new WeakMap(); // live poster canvases -> their textures (setPoster)
  // the cursor over the canvas (CSS px, velocity px/s), for things in the room that
  // react to it (the bead chain); the page feeds it (useWindowScene), capture never
  const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0, active: false };
  let chainHover = false;
  const posters = {};
  const posterMean = { light: 0.6, dark: 0.08 };
  let random = seededRandom(opts.seed ?? 1741);

  // time
  let t = Number.isFinite(opts.t) ? opts.t : 0;
  const frozenT = Number.isFinite(opts.t);
  let dt = 0;

  // progress: pinned by the URL (p, p2) or driven by the page's scroll
  let pinned = opts.p !== null || opts.p2 !== null || opts.shot !== null;
  let pinnedP = opts.p ?? 0, pinnedP2 = opts.p2 ?? 0;
  let scrollP = 0, scrollP2 = 0;
  let view = opts.view || P.debug.view;
  let currentTheme = theme === "dark" ? "dark" : "light";
  let codeScreen = null;

  // loop
  let active = false;
  let loopOn = false;
  let waiters = [];
  let frameNo = 0;
  // the sky's mean light (linear, plate units): skyAvg is what this frame uses;
  // live, it eases toward the latest reading (skyAvgTarget) so a new reading never
  // pops the room's light; capture mode takes each reading as it lands
  let skyAvg = { linear: [0.2, 0.25, 0.35], srgb: [0.45, 0.5, 0.6] };
  let skyAvgTarget = null;
  let meter = null; // createSkyMeter, built with the plate
  let meterPending = null; // the read in flight: { promise, since }
  let meterLastFrame = -1e9; // frameNo of the last read started (negative: read on the next frame)
  let meterLastTime = 0; // performance.now() of the last read started
  let meterReads = 0;
  let meterErrors = 0; // consecutive failed reads
  let meterFailed = false; // three failed in a row: fall back to the plate's sync read, rarely
  let lastSkyUniforms = null;
  const METER_REGION = { u0: 0.25, u1: 0.75, v0: 0.02, v1: 0.55 };
  let lastStats = { backend: "none", drawCalls: 0, triangles: 0, frameMs: 0 };
  let lastGpuMs = null;
  let measuring = false;
  let lastFrameSpan = [0, 0]; // performance.now() around the last frame() the loop ran
  let lastErrorLogged = false;
  // capture: resting supersampling averages only settled frames. The first frames
  // after a start or a change are not the steady image (measured on the ref1741
  // shot: the monitor reads 171.9, 177.5, 180.6, 182.3 at frames 2 to 5 and 184.1
  // from frame 8 on, with the depth of field on); three's TAAU hid this only
  // because a 32-frame capture was 45 % its seed, frame 1
  let settleUntil = 0;
  const unsettle = () => {
    settleUntil = frameNo + Math.max(0, (P.supersample?.settleFrames ?? 8) | 0);
  };

  const uniforms = {
    skyAvg: uniform(new THREE.Color(0.2, 0.25, 0.35)),
    horizonGround: uniform(new THREE.Color(0.05, 0.06, 0.04)),
    sunColor: uniform(new THREE.Color(1, 1, 1)),
    skyGain: uniform(new THREE.Color(1, 1, 1)),
    skyBloom: uniform(0.1),
    hand: uniform(0),
    white: uniform(1),
    bgLin: uniform(new THREE.Color(1, 1, 1)),
    bgLevel: uniform(1),
    screenBloom: uniform(0.06),
    // the lamp's glint in the glossy screen (5480, 5481, 5483: a hot point at the
    // top edge with a long thin streak down the panel)
    glintPos: uniform(new THREE.Vector3(0, 0, 0)), // world: the lamp's bright point
    glintCol: uniform(new THREE.Color(0, 0, 0)), // linear, strength included
    glintN: uniform(new THREE.Vector3(0, 0, 1)), // the screen's normal (world)
    glintU: uniform(new THREE.Vector3(1, 0, 0)), // across the streak (world, in the screen plane)
    glintV: uniform(new THREE.Vector3(0, 1, 0)), // along the streak
    glintCore: uniform(0.03), // rad
    glintW: uniform(0.006), // rad, streak half-width
    glintL: uniform(0.25), // rad, streak half-length
    glintStreak: uniform(0.35), // streak / core
    glintBloom: uniform(0.3),
  };

  // --- build -------------------------------------------------------------------------
  function buildModules() {
    const chair = chairPose(P);
    room = buildRoom(P, { renderer, random, chair, uniforms });
    scene.add(room.group);
    // the engine owns the screen's material: the poster, rising to the page ground
    room.anchors.monitorScreen.material = screenMat;
    const scr = room.anchors.monitorScreen;
    scr.updateWorldMatrix(true, false);
    const c = new THREE.Vector3().setFromMatrixPosition(scr.matrixWorld);
    const n = new THREE.Vector3(0, 0, 1).transformDirection(scr.matrixWorld);
    const sx = new THREE.Vector3().setFromMatrixColumn(scr.matrixWorld, 0).length();
    const sy = new THREE.Vector3().setFromMatrixColumn(scr.matrixWorld, 1).length();
    const gp = scr.geometry.parameters || {};
    const tx = new THREE.Vector3(1, 0, 0).transformDirection(scr.matrixWorld);
    const ty = new THREE.Vector3(0, 1, 0).transformDirection(scr.matrixWorld);
    screenInfo = { center: c.toArray(), normal: n.toArray(), tangent: tx.toArray(), bitangent: ty.toArray(), width: (gp.width ?? 0.597) * sx, height: (gp.height ?? 0.336) * sy };
    outside = buildOutside(P, { renderer, skyTexture: skyTex, skyDome, anchors: room.anchors, random, uniforms });
    scene.add(outside.group);
    lights = createLights(scene, room.anchors, P, { uniforms });
  }
  function disposeModules() {
    lights?.dispose();
    outside?.dispose();
    if (room) {
      room.anchors.monitorScreen.material = new THREE.MeshBasicNodeMaterial(); // keep screenMat alive
      room.dispose();
    }
    lights = outside = room = null;
  }

  // startup, phase by phase (ms since createWindowEngine; stats().startup): the
  // loop-2 perf lane's evidence for where the 1.8 s hook-to-ready goes
  const tStart = performance.now();
  const startup = {};
  const mark = (k) => (startup[k] = +(performance.now() - tStart).toFixed(1));

  // r186's WebGL2 backend throws when EXT_texture_filter_anisotropic is missing
  // (Safari 26.2 on ?backend=webgl2 lost both posters to it, 2026-09-27)
  function maxAniso() {
    try {
      return Math.min(8, renderer?.getMaxAnisotropy?.() || 1);
    } catch {
      return 1;
    }
  }

  async function init() {
    rApi = await createRenderer({ canvas, backend: opts.backend, params: P, trackTimestamp: !!opts.stats });
    mark("renderer");
    if (disposed) {
      rApi.dispose();
      return false;
    }
    renderer = rApi.renderer;
    lastStats.backend = rApi.backend;
    // the quality tier, once, before anything is built: ?set=quality wins, then
    // ?quality=, then capture mode's fixed "high", then the pick from the GPU
    gpu = gpuInfo(renderer);
    if (normalizeQuality(setLayer.quality)) setQuality(setLayer.quality, "?set=quality");
    else if (opts.quality) setQuality(opts.quality, "?quality=");
    else if (capture) setQuality("high", "capture default");
    else {
      const pick = pickQuality({ gpu, ...probeViewport() });
      setQuality(pick.quality, pick.why);
    }
    rApi.setSize(typeof window !== "undefined" ? window.innerWidth : 1440, typeof window !== "undefined" ? window.innerHeight : 900);
    rApi.applyParams(P);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    camera = new THREE.PerspectiveCamera(50, 1, P.camera.near, P.camera.far);

    // the sky plate (its own small WebGL canvas) and the dome it hangs on
    plate = createSkyPlate({ width: P.sky.plate.width, height: P.sky.plate.height });
    skyTex = new THREE.CanvasTexture(plate.canvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    skyTex.generateMipmaps = false;
    skyTex.minFilter = THREE.LinearFilter;
    skyTex.magFilter = THREE.LinearFilter;
    const dome = buildSkyDome(P, skyTex, uniforms);
    skyDome = dome.mesh;
    skyView = dome.view;
    scene.add(skyDome);
    meter = createSkyMeter(renderer, skyTex, METER_REGION);

    // the monitor screen's material
    const loader = new THREE.TextureLoader();
    const loadPoster = async (k) => {
      try {
        const tex = await loader.loadAsync(POSTERS[k]);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso();
        posters[k] = tex;
        posterMean[k] = imageMeanLinear(tex.image);
      } catch (e) {
        console.warn("[window] poster failed:", POSTERS[k], e?.message || e);
      }
    };
    await Promise.all([loadPoster("light"), loadPoster("dark")]);
    mark("posters");
    // a photo shot shows what the photo's screen showed (params: camera.ref.poster,
    // camera.shots.*.poster), for both themes: the Photo-true gate then measures
    // the render, not the page's design
    const shotCfg = opts.shot ? (opts.shot === "ref1741" ? P.camera.ref : P.camera.shots?.[opts.shot]) : null;
    if (shotCfg?.poster) {
      try {
        const tex = await loader.loadAsync(shotCfg.poster);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso();
        posters.light?.dispose();
        posters.dark?.dispose();
        posters.light = posters.dark = tex;
        posterMean.light = posterMean.dark = imageMeanLinear(tex.image);
      } catch (e) {
        console.warn("[window] shot poster failed:", shotCfg.poster, e?.message || e);
      }
    }
    if (disposed) return false;
    const blank = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    blank.needsUpdate = true;
    const posterNode = texture(posters[currentTheme] || posters.light || blank);
    // the panel's own reflection: an anti-glare coated panel reflects a few times less
    // than bare glass (F0 0.04), and diffusely; specularIntensity scales F0
    // (params.screen.specular) so the lit room does not wash the dark app at grazing
    // angles (ref5480: +1.8 stops with the bare-glass F0)
    screenMat = new THREE.MeshPhysicalNodeMaterial({ color: 0x000000, roughness: P.screen.roughness, metalness: 0, specularIntensity: P.screen.specular ?? 1 });
    const screenLight = mix(posterNode.rgb.mul(uniforms.white), vec3(uniforms.bgLin).mul(uniforms.bgLevel), uniforms.hand);
    // the glint: the view ray mirrored in the panel, against the lamp's direction;
    // a small gaussian core plus a long thin streak (the anti-glare coat), gone as
    // the screen becomes the page ground
    const Vw = normalize(cameraPosition.sub(positionWorld));
    const Rw = reflect(Vw.negate(), uniforms.glintN);
    const Lw = normalize(uniforms.glintPos.sub(positionWorld));
    const cosRL = dot(Rw, Lw);
    const off = Lw.sub(Rw.mul(cosRL)); // perpendicular offset, about the angle in rad
    const gu = dot(off, uniforms.glintU), gv = dot(off, uniforms.glintV);
    const core = exp(gu.mul(gu).add(gv.mul(gv)).div(uniforms.glintCore.mul(uniforms.glintCore)).negate());
    const streak = exp(gu.mul(gu).div(uniforms.glintW.mul(uniforms.glintW)).add(gv.mul(gv).div(uniforms.glintL.mul(uniforms.glintL))).negate());
    const glint = vec3(uniforms.glintCol).mul(core.add(streak.mul(uniforms.glintStreak))).mul(max(cosRL, float(0)).pow(4)).mul(float(1).sub(uniforms.hand));
    const screenOut = screenLight.add(glint);
    screenMat.emissiveNode = screenOut;
    screenMat.mrtNode = mrt({ emissive: screenLight.mul(uniforms.screenBloom).add(glint.mul(uniforms.glintBloom)) });
    screenMat.userData.posterNode = posterNode;

    // weather (presets never touch the network; live waits a few seconds at most)
    bridge = createWeatherBridge({
      mode: opts.weather?.sky || "mine",
      overrides: opts.weather || {},
      followGlobal: !opts.weather?.sky,
      view: skyView,
    });
    await withTimeout(bridge.ready, capture ? 8000 : 2500);
    if (disposed) return false;
    mark("weather");

    buildModules();
    post = createPost(renderer, scene, camera, P);
    calm = createCalm();
    built = true;
    mark("build");

    timer = new THREE.Timer();
    timer.connect(document);

    applyTheme(currentTheme);
    // compile before the first visible frame: every uniform set once and the
    // pipeline graph built without drawing, then the scene's materials compiled
    // (the page keeps the canvas transparent until ready resolves)
    setAspect();
    frame(false);
    // Loop 2 (C3, startup): compile only what is drawn. The scene is only ever
    // drawn through the post pipeline's MRT scene pass (and the air's volume pass),
    // whose pipelines differ from the canvas target's: renderer.compileAsync(scene)
    // built canvas variants that are never used, and the real ones were compiled in
    // the warm frame below anyway.
    // (params.renderer.compile: "none" | "canvas" | "pass"; params.core.js has the
    // measurements, "none" is the fastest on both backends)
    const how = P.renderer.compile ?? "none";
    if (how === "pass") {
      await Promise.all([post.scenePass.compileAsync(renderer), post.volumePass?.compileAsync?.(renderer)]);
    } else if (how === "canvas") await renderer.compileAsync(scene, camera);
    if (disposed) return false;
    mark("compile");
    // warm every render pipeline of the MRT scene pass: compileAsync only covers
    // the canvas target, so one frame with culling off draws (and compiles) every
    // object once, instead of a hitch the first time the camera turns to it
    // Spread over frames, a few materials at a time (2026-09-27): Safari compiles each
    // pipeline synchronously, so the one-frame warm-up froze the page for 11 to 16 s
    // (WebGL2, Agam's Safari 26.2; 7.2 s WebGL2 and 2.1 s WebGPU in WebKit 26.6).
    // Each batch is sized to about WARM_BUDGET_MS of compiling, then a final frame
    // draws everything together (the post pipeline and any shared variants).
    const culled = [];
    const meshes = [];
    scene.traverse((o) => {
      if (!(o.isMesh || o.isInstancedMesh)) return;
      if (o.frustumCulled) {
        culled.push(o);
        o.frustumCulled = false;
      }
      if (o.visible) meshes.push(o);
    });
    const byMat = new Map();
    for (const o of meshes) {
      const k = (Array.isArray(o.material) ? o.material : [o.material]).map((m) => m?.uuid).join("|");
      if (!byMat.has(k)) byMat.set(k, []);
      byMat.get(k).push(o);
    }
    const groups = [...byMat.values()];
    const WARM_BUDGET_MS = 120;
    meshes.forEach((o) => (o.visible = false));
    let batch = 2;
    for (let i = 0; i < groups.length && !disposed; ) {
      const now = groups.slice(i, i + batch);
      now.forEach((g) => g.forEach((o) => (o.visible = true)));
      const t0 = performance.now();
      await drawFrames(1);
      const ms = performance.now() - t0;
      now.forEach((g) => g.forEach((o) => (o.visible = false)));
      i += now.length;
      batch = ms < WARM_BUDGET_MS / 2 ? batch * 2 : ms > WARM_BUDGET_MS * 2 ? Math.max(1, batch >> 1) : batch;
    }
    meshes.forEach((o) => (o.visible = true));
    await drawFrames(1);
    culled.forEach((o) => (o.frustumCulled = true));
    if (disposed) return false;
    mark("warmFrame");
    // the first sky reading (started by that frame) lands before the page shows the
    // canvas, so the first visible frame is lit by the real sky, not the default
    await withTimeout(meterPending?.promise ?? Promise.resolve(), 3000);
    if (skyAvgTarget) skyAvg = skyAvgTarget;
    if (disposed) return false;
    mark("skyRead");
    // two settled frames, one per animation frame (TRAA's resolve runs per frame)
    await drawFrames(2);
    // a capture's first frames after ready are still settling (see settleUntil)
    unsettle();
    mark("ready");
    if (view === "plate") {
      // debug: the raw Living Sky plate over everything (it redraws every frame)
      Object.assign(plate.canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "80", pointerEvents: "none" });
      document.body.appendChild(plate.canvas);
    }
    return true;
  }

  // --- per frame ---------------------------------------------------------------------------
  function setAspect() {
    const s = rApi.size;
    camera.aspect = s.w / s.h;
    const portrait = camera.aspect < (P.camera.window.mobileBelow ?? 0.8) && Array.isArray(P.camera.window.regionMobile);
    if (portrait !== portraitNow) {
      portraitNow = portrait;
      const Mm = P.sky.moon?.mobile;
      viewLayer = portrait && Mm ? { sky: { moon: { az: Mm.az, alt: Mm.alt } } } : {};
      compose();
    }
  }

  function progress() {
    if (opts.shot) return { p: 0.5, p2: 0 };
    return pinned ? { p: pinnedP, p2: pinnedP2 } : { p: scrollP, p2: scrollP2 };
  }

  // The placed moon's place this frame (outside/moon.js placedMoonAt, by the clock):
  // ONE answer for the plate's disc, the dome point, the halo and rim (state.moonPlaced)
  // and the moon key (lights.js). null outside the placed mode.
  let moonPlacedNow = null;
  function placeMoon(sw) {
    const M = P.sky.moon;
    moonPlacedNow = M.mode === "placed" ? placedMoonAt(M, sw, P.outside?.moon?.track) : null;
    return moonPlacedNow;
  }

  function moonOption(sw) {
    const M = P.sky.moon;
    if (M.mode !== "placed") return null;
    const mp = moonPlacedNow || M;
    const [x, y] = plateUV(mp.az, mp.alt, skyView);
    const above = smooth(-1, 2, sw.moon?.alt ?? -10);
    const night = M.nightAlways ? 1 - smooth(-8, -2, sw.sun?.alt ?? 10) : 0;
    return { x, y, visible: Math.max(above, night), scale: M.scale };
  }

  function frame(draw = true) {
    const t0 = performance.now();
    if (timer) {
      timer.update();
      dt = capture ? 0 : Math.min(timer.getDelta(), 0.1);
    }
    if (!frozenT) t += dt * P.time.rate;
    frameNo++;

    rApi.applyParams(P);
    setAspect();
    const sw = bridge.get();
    placeMoon(sw);
    const { p, p2 } = progress();

    // camera
    const pose = cameraPose(P, p, p2, { aspect: camera.aspect, screen: screenInfo, shot: opts.shot });
    // params.camera.sweep (the folio page): an extra turn in degrees, eased out along the
    // main path; NEGATIVE turns the camera left (the code editor's monitor comes in, the
    // main screen is cut on the right) and the window then drifts left as the camera
    // closes in; 0 at `to` (p = 1), so the landing and screenRectAt(1) are untouched
    const SW = P.camera.sweep;
    if (SW?.deg && !opts.shot && p2 === 0) pose.yaw += SW.deg * (1 - smooth(SW.from ?? 0, SW.to ?? 1, p));
    // params.camera.folio (the folio page): focus on the main monitor all the way in and
    // a gentler depth of field, so both screens stay sharp (Agam, 2026-09-27: "a glow on
    // both screens... so that the views are sharper"); the window keeps a soft blur
    const CF = P.camera.folio;
    if (CF && !opts.shot && p2 === 0) {
      if (CF.focusScreen && screenInfo?.center) {
        const c = screenInfo.center;
        pose.focus = Math.hypot(pose.pos[0] - c[0], pose.pos[1] - c[1], pose.pos[2] - c[2]);
      }
      if (Number.isFinite(CF.bokeh)) pose.bokeh = (pose.bokeh ?? 1) * CF.bokeh;
    }
    applyPose(camera, pose, P);
    // the velocity pass reads this frame's unjittered projection (taau.js: without
    // it every static pixel moved by the TAA jitter and nothing converged)
    syncUnjittered(camera);

    // one wind for everything
    const gustEnvelope = windPulse(t, sw.wind.gustAmp);
    const wind = { vecX: sw.wind.vecX, vecZ: sw.wind.vecZ, speed: sw.wind.speed, gust: sw.wind.gust, gustEnvelope };

    // sky plate: draw, upload in this same task
    const su = skyUniformsFrom(sw, {
      t,
      viewAz: skyView.viewAz,
      fovH: skyView.fovH,
      aspect: skyView.aspect,
      cumulusFloor: P.sky.cumulusFloor,
      skyglow: P.sky.skyglow,
      moon: moonOption(sw),
      uniforms: P.sky.uniforms,
    });
    // the plate's upload into WebGPU (copyExternalImageToTexture from a WebGL
    // canvas) costs more than its shader, and the sky moves slowly: redraw every
    // updateEvery frames live, every frame in capture mode and in a storm
    const plateEvery = capture || sw.storm?.active ? 1 : Math.max(1, P.sky.updateEvery | 0);
    let plateDrawn = false;
    lastSkyUniforms = su;
    if ((frameNo <= 2 || frameNo % plateEvery === 0) && plate.update(su)) {
      skyTex.needsUpdate = true;
      plateDrawn = true;
      // fallback only (the GPU read failed): the old synchronous read, at start and
      // then rarely (it stalls the plate's context)
      if (meterFailed && (frameNo <= 2 || frameNo - meterLastFrame >= 20 * Math.max(1, P.sky.averageEvery | 0))) {
        meterLastFrame = frameNo;
        skyAvgTarget = plate.readAverage({ ...METER_REGION, step: 12 });
      }
    }
    // the reading in use: capture takes it as it lands; live eases toward it (about
    // 0.4 s), so a changing sky or a new weather relights the room smoothly
    if (skyAvgTarget) {
      if (capture || frameNo <= 3) skyAvg = skyAvgTarget;
      else {
        const k = 1 - Math.exp(-dt / 0.4);
        const l = skyAvg.linear.map((c, i) => c + (skyAvgTarget.linear[i] - c) * k);
        skyAvg = { linear: l, srgb: skyAvgTarget.srgb };
      }
    }
    const tint = P.sky.tint;
    const g = skyGain(P, sw); // light/exposure.js: plate to scene units by the hour
    uniforms.skyGain.value.setRGB(g * tint[0], g * tint[1], g * tint[2]);
    uniforms.skyBloom.value = P.sky.bloom;
    uniforms.skyAvg.value.setRGB(skyAvg.linear[0] * g * tint[0], skyAvg.linear[1] * g * tint[1], skyAvg.linear[2] * g * tint[2]);
    const hg = P.sky.horizonGround;
    uniforms.horizonGround.value.setRGB(uniforms.skyAvg.value.r * hg[0], uniforms.skyAvg.value.g * hg[1], uniforms.skyAvg.value.b * hg[2]);

    // the screen and the hand-off
    const H = P.post.handoff;
    let hand, final;
    if (opts.shot) {
      hand = 0;
      final = 0;
    } else if (p2 > 0) {
      hand = 1 - smooth(0, H.bookendEnd, p2);
      final = 1 - smooth(0, H.bookendEnd * 0.5, p2);
    } else if (H.toPage) {
      // the folio page (2026-09-27): the screen keeps the page's own first viewport to
      // the end (setPoster, a live capture mapped by screenRectAt(1)); the post's page
      // composite shows it untonemapped, so the canvas hides onto identical pixels
      hand = 0;
      final = 0;
    } else {
      hand = smooth(H.screenStart, H.screenEnd, p);
      final = smooth(H.finalStart, 1, p);
    }
    const ground = PAGE_GROUND[currentTheme];
    const gLin = hexToLinear(ground);
    uniforms.hand.value = hand;
    // at night the page's white would bloom over a dark room: the screen dims (the
    // monitor's own brightness, not the page), by theme
    const nightK = 1 - smooth(-8, -2, sw.sun?.alt ?? 10);
    const nightWhite = P.screen.night?.[currentTheme] ?? 1;
    const whiteNow = P.screen.white * (1 + (nightWhite - 1) * nightK);
    uniforms.white.value = whiteNow;
    uniforms.bgLin.value.setRGB(gLin[0], gLin[1], gLin[2]);
    uniforms.bgLevel.value = currentTheme === "light" ? P.screen.handoffLight : 1;
    // the code editor on the portrait monitor wears the page's theme (codeScreen.js;
    // a no-op unless the theme changed)
    codeScreen ??= scene?.getObjectByName("portraitScreen")?.userData.code ?? null;
    codeScreen?.setTheme(currentTheme);
    // the folio's live capture, for post.js to draw 1:1 on the monitor (toPage only)
    lightBus(scene).posterTex = H.toPage && !opts.shot ? posters[currentTheme] || null : null;
    uniforms.screenBloom.value = P.screen.bloom;
    screenMat.roughness = P.screen.roughness;
    screenMat.specularIntensity = P.screen.specular ?? 1;
    const gLum = 0.2126 * gLin[0] + 0.7152 * gLin[1] + 0.0722 * gLin[2];
    const screenLight = posterMean[currentTheme] * (1 + (nightWhite - 1) * nightK) * (1 - hand) + gLum * uniforms.bgLevel.value * hand;

    // shot / ceilingLight: the named capture framing, and whether its photo had the
    // room's ceiling light on (the dusk close-ups), for the light rig
    const shotCfg = opts.shot ? (opts.shot === "ref1741" ? P.camera.ref : P.camera.shots?.[opts.shot]) : null;
    const state = { time: t, dt, p, p2, look, weather: sw, wind, shot: opts.shot || null, ceilingLight: !!shotCfg?.ceilingLight, quality: P.quality, moonPlaced: moonPlacedNow, pointer: capture ? null : pointer, camera, view: { w: rApi.size.w, h: rApi.size.h } };
    lights.update(state, { sky: { linear: [uniforms.skyAvg.value.r, uniforms.skyAvg.value.g, uniforms.skyAvg.value.b] }, screenLight });
    room.update(state);
    // the cursor over the bead chain: the page shows a grab hand (useWindowScene)
    if (!!state.chainHover !== chainHover) {
      chainHover = !!state.chainHover;
      canvas.dispatchEvent(new CustomEvent("wscene:chainhover", { detail: chainHover }));
    }
    // the pointer's velocity decays between events, so a resting cursor stops pushing
    pointer.vx *= 0.8;
    pointer.vy *= 0.8;
    outside.update(state);
    updateGlint();

    post.update({
      view: view === "plate" ? "beauty" : view,
      focus: pose.focus,
      final,
      bg: srgb01(ground),
      seed: capture ? 17.41 : (frameNo % 997) * 0.731,
      dpr: rApi.size.dpr,
    });
    // the camera path's own depth of field (the hero melts the near frame): a
    // multiplier on the look's bokeh, which post.update has just written
    if (post.uniforms?.bokeh && Number.isFinite(pose.bokeh)) post.uniforms.bokeh.value *= pose.bokeh;
    // resting supersampling (taau.js): its shared uniforms, from params.supersample
    applySupersample(P.supersample, { capture, hold: capture && frameNo <= settleUntil });
    // the calm field under the page's text: wrap the pipeline's output (again after
    // any rebuild post.update just made), full strength near the top of the main
    // runway, never on a named shot, the bookend or a debug view
    if (calm) {
      if (post.pipeline.outputNode !== calm.wrapped) {
        post.pipeline.outputNode = calm.wrap(post.pipeline.outputNode, { viewZ: post.scenePass?.getViewZNode?.() || null });
        post.pipeline.needsUpdate = true;
      }
      const C = P.calm || {};
      // at night the frame is already quiet under the text (loop 1: greeting 2 to 46
      // at 21:00) and the Dreamlike night is the frame worth keeping crisp
      const nightCalm = 1 - (1 - (C.nightStrength ?? 1)) * (1 - smooth(-8, -2, sw.sun?.alt ?? 10));
      const kCalm = opts.shot || p2 > 0 || view !== "beauty" ? 0 : (1 - smooth(C.from ?? 0.12, C.to ?? 0.3, p)) * nightCalm;
      // the far field's softness under the text comes from the lens, not a screen
      // blur: the focus stays on the frame and the bokeh opens up near the top of
      // the runway, so only what lies beyond the glass melts (2026-09-27)
      if (post.uniforms?.bokeh && C.enabled !== false) post.uniforms.bokeh.value *= 1 + ((C.farBokeh ?? 1) - 1) * kCalm;
      const G = P.post.grain || {};
      calm.update(C, { boxes: calmBoxes, view: { w: rApi.size.w, h: rApi.size.h, dpr: rApi.size.dpr }, k: kCalm, seed: capture ? 17.41 : (frameNo % 997) * 0.731, grainAmount: G.enabled === false ? 0 : G.amount ?? 0.02, theme: currentTheme, look, camera });
    }
    if (!draw) return;
    post.render();

    const info = renderer.info.render;
    lastStats = {
      backend: rApi.backend,
      drawCalls: info.drawCalls,
      triangles: info.triangles,
      frameMs: +(performance.now() - t0).toFixed(3),
      gpuMs: lastGpuMs,
      frame: frameNo,
      p: +p.toFixed(4),
      p2: +p2.toFixed(4),
      look,
      theme: currentTheme,
      tod: +(sw.tod ?? 0).toFixed(3),
      weather: sw.preset || (sw.live ? "live" : "fallback"),
      camera: { pos: pose.pos.map((v) => +v.toFixed(4)), yaw: +pose.yaw.toFixed(3), pitch: +pose.pitch.toFixed(3), roll: +pose.roll.toFixed(3), fovV: +pose.fov.toFixed(3), focus: +pose.focus.toFixed(4), bokeh: +(pose.bokeh ?? 1).toFixed(3) },
      dpr: rApi.size.dpr,
      size: [rApi.size.w, rApi.size.h],
      quality: P.quality,
      qualityWhy,
      budgetMs: BUDGETS_MS[rApi.backend]?.[P.quality] ?? null,
      skyAvg: skyAvg.linear.map((v) => +v.toFixed(5)),
      skyReads: meterReads,
      skyMeter: meterFailed ? "sync-fallback" : "gpu-async",
      startup,
      // the calm field as drawn this frame (tools: the text-zone gate)
      calm: calm ? { strength: +calm.uniforms.strength.value.toFixed(3), boxes: calm.uniforms.count.value, band: calm.uniforms.band.value.toArray().map((v) => +v.toFixed(3)), wrapped: post.pipeline.outputNode === calm.wrapped } : null,
    };
    // GPU time is only measured on request (measureGpu): an async resolve running
    // beside the loop sums an unknown number of frames, and headless timestamps
    // proved unreliable anyway

    // the sky's mean light: start a read of the plate this frame uploaded, when one
    // is due (never blocks: the result lands a frame or more later)
    if (meterPending && performance.now() - meterPending.since > 5000) meterPending = null; // a lost read never wedges the meter
    // WebGL2 (live): Chrome's getBufferSubData still blocks on ANGLE even after the
    // fence reports done (0.3 s per read with an uncapped queue, measured round 2),
    // so the fallback reads at start, on any change (seek, params, look) and then
    // every averageSecondsWebGL2; the sky's mean moves over minutes, not frames
    const every = Math.max(1, P.sky.averageEvery | 0);
    const gl2Live = !capture && rApi.backend === "webgl2";
    const due = gl2Live
      ? meterLastFrame < 0 || performance.now() - meterLastTime >= 1000 * (P.sky.averageSecondsWebGL2 ?? 120)
      : frameNo - meterLastFrame >= every;
    if (plateDrawn && meter && !meterFailed && !meterPending && (frameNo <= 2 || due)) startSkyRead();
  }

  function startSkyRead() {
    meterLastFrame = frameNo;
    meterLastTime = performance.now();
    let p;
    try {
      p = meter.measure();
    } catch (e) {
      p = Promise.reject(e);
    }
    const entry = { since: performance.now(), promise: null };
    entry.promise = p
      .then((r) => {
        if (r) {
          skyAvgTarget = r;
          meterReads++;
          meterErrors = 0;
        }
      })
      .catch((e) => {
        // a read that dies with the engine (a remount) is not a failure; three in a
        // row are, and only then the plate's own (stalling) read takes over
        if (disposed) return;
        meterErrors++;
        if (meterErrors >= 3 && !meterFailed) {
          console.warn("[window] sky meter: GPU read failed three times, using the plate's own read:", e?.message || e);
          meterFailed = true;
          meterLastFrame = -1e9;
        }
      })
      .finally(() => {
        if (meterPending === entry) meterPending = null;
      });
    meterPending = entry;
  }
  // after anything that can change the plate outside the live loop (seek, a params
  // patch, a look), read the sky again on the next frame
  function invalidateSky() {
    meterLastFrame = -1e9;
  }

  // --- the lamp's glint in the screen -------------------------------------------------------
  const _gp = new THREE.Vector3(), _gq = new THREE.Vector3();
  function updateGlint() {
    const G = P.screen.glint;
    const shot = opts.shot ? P.camera.shots?.[opts.shot] : null;
    // on only where the source is really on: `always`, or a dusk close-up shot
    // taken with the ceiling light on (the streak mirrors the room, not the lamp)
    const on = G?.enabled && (G.always || !!shot?.ceilingLight);
    if (!on || !screenInfo) {
      uniforms.glintCol.value.setRGB(0, 0, 0);
      return;
    }
    const W = P.dims.W;
    if (G.source === "lamp") {
      const lamp = lightBus(scene).lamp;
      if (!lamp?.pos) return uniforms.glintCol.value.setRGB(0, 0, 0);
      _gp.copy(lamp.pos);
    } else _gp.set(G.source[0] * W, G.source[1] * W, G.source[2] * W);
    uniforms.glintPos.value.copy(_gp);
    const c = hexToLinear(G.color || "#ffffff");
    const k = G.strength;
    uniforms.glintCol.value.setRGB(c[0] * k, c[1] * k, c[2] * k);
    // the panel's normal, tipped back tiltDeg (its top away from the viewer)
    const n = screenInfo.normal, t = screenInfo.tangent, b = screenInfo.bitangent;
    const tb = (G.tiltDeg ?? 0) * D2R;
    _gq.set(n[0], n[1], n[2]).multiplyScalar(Math.cos(tb)).addScaledVector(new THREE.Vector3(b[0], b[1], b[2]), Math.sin(tb)).normalize();
    uniforms.glintN.value.copy(_gq);
    const a = (G.angleDeg ?? 0) * D2R, ca = Math.cos(a), sa = Math.sin(a);
    uniforms.glintU.value.set(t[0] * ca + b[0] * sa, t[1] * ca + b[1] * sa, t[2] * ca + b[2] * sa);
    uniforms.glintV.value.set(-t[0] * sa + b[0] * ca, -t[1] * sa + b[1] * ca, -t[2] * sa + b[2] * ca);
    uniforms.glintCore.value = (G.coreDeg ?? 1.5) * D2R;
    uniforms.glintW.value = (G.streakWidthDeg ?? 0.35) * D2R;
    uniforms.glintL.value = (G.streakLengthDeg ?? 14) * D2R;
    uniforms.glintStreak.value = G.streak ?? 0.35;
    uniforms.glintBloom.value = G.bloom ?? 0.3;
  }

  // --- the Dreamlike moon: where it lands for each camera ---------------------------------
  // The placed moon's point on the sky dome (the plate draws it at plateUV(az, alt)
  // and the dome maps that texel back to the same bearing and altitude).
  function moonWorld() {
    const M = moonPlacedNow || P.sky.moon;
    const a = M.az * D2R, e = M.alt * D2R, R = P.sky.radius;
    return new THREE.Vector3(R * Math.cos(e) * Math.sin(a), R * Math.sin(e), -R * Math.cos(e) * Math.cos(a));
  }
  const _ray = new THREE.Raycaster();
  const _cam = new THREE.PerspectiveCamera();
  const NOT_SOLID = /glass|blocked|halo|mote|rain|drip|leaf|leaves|spray/i;
  // For each p (main runway) the moon's NDC and pixel position at the current
  // viewport, whether it is in frame, and the first room or outside surface
  // between the camera and it (null: seen through clear glass or open air).
  function moonCheck(ps = [0, 0.25, 0.5]) {
    if (!camera || !screenInfo || !room) return null;
    const M = P.sky.moon;
    const world = moonWorld();
    const s = rApi.size;
    const targets = [room.group, outside?.group].filter(Boolean);
    return ps.map((p) => {
      const pose = cameraPose(P, p, 0, { aspect: camera.aspect, screen: screenInfo });
      _cam.aspect = camera.aspect;
      applyPose(_cam, pose, P);
      const ndc = world.clone().project(_cam);
      const inFrame = Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && ndc.z < 1;
      const dir = world.clone().sub(_cam.position).normalize();
      // the disc (living-sky.frag: radius 0.014 of the plate height x scale, the
      // plate height spanning fovH / aspect degrees): centre plus two rings of rays
      const rDeg = (0.014 * (M.scale || 1) * P.sky.view.fovH) / (P.sky.plate.width / P.sky.plate.height);
      const up = Math.abs(dir.y) > 0.99 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const e1 = new THREE.Vector3().crossVectors(dir, up).normalize();
      const e2 = new THREE.Vector3().crossVectors(e1, dir).normalize();
      const rays = [[0, 0]];
      for (const [k, n] of [[0.5, 8], [0.95, 12]]) for (let i = 0; i < n; i++) rays.push([k * Math.cos((2 * Math.PI * i) / n), k * Math.sin((2 * Math.PI * i) / n)]);
      const tr = Math.tan(rDeg * D2R);
      let blockedBy = null, clear = 0;
      rays.forEach(([a, b], i) => {
        const d = dir.clone().addScaledVector(e1, a * tr).addScaledVector(e2, b * tr).normalize();
        _ray.set(_cam.position, d);
        _ray.far = P.sky.radius * 1.2;
        let hit = null;
        for (const h of _ray.intersectObjects(targets, true)) {
          const o = h.object;
          if (!o.visible || NOT_SOLID.test(o.name) || NOT_SOLID.test(o.material?.name || "")) continue;
          hit = o.name || o.parent?.name || "unnamed";
          break;
        }
        if (!hit) clear++;
        if (i === 0) blockedBy = hit;
      });
      return {
        p,
        ndc: [+ndc.x.toFixed(3), +ndc.y.toFixed(3)],
        px: [Math.round(((ndc.x + 1) / 2) * s.w), Math.round(((1 - ndc.y) / 2) * s.h)],
        inFrame,
        blockedBy, // what the disc's centre ray meets first (null: clear glass or open air)
        clear: +(clear / rays.length).toFixed(2), // fraction of the disc not hidden by the frame, grilles or canes
        radiusPx: Math.round((Math.tan(rDeg * D2R) / Math.tan((pose.fov * D2R) / 2)) * (s.h / 2)),
        mode: M.mode,
      };
    });
  }

  // --- the loop ------------------------------------------------------------------------------
  function tick() {
    if (disposed) return;
    if (!built) return; // frames asked for before the build finished wait for it
    // capture mode draws nothing while a sky reading is in flight, so every frame
    // sees the reading of the plate before it whatever the GPU's timing: identical
    // shots stay identical (live mode never waits)
    if (capture && meterPending && performance.now() - meterPending.since < 3000) return;
    try {
      const tf0 = performance.now();
      frame();
      lastFrameSpan = [tf0, performance.now()];
    } catch (e) {
      // never leave a tool waiting on a frame that cannot be drawn
      lastStats.error = String(e?.message || e);
      if (!lastErrorLogged) console.error("[window] frame failed:", e);
      lastErrorLogged = true;
    }
    if (waiters.length) {
      for (const w of waiters) w.left--;
      const done = waiters.filter((w) => w.left <= 0);
      waiters = waiters.filter((w) => w.left > 0);
      done.forEach((w) => w.resolve());
    }
    if (!active && !waiters.length) setLoop(false);
  }
  function setLoop(on) {
    if (!renderer || on === loopOn) return;
    loopOn = on;
    renderer.setAnimationLoop(on ? tick : null);
  }
  // Start-up frames drawn directly on a timer, not on requestAnimationFrame: Safari
  // gave this page almost no animation frames while it judged the tab hidden (1 in
  // 30 s, 2026-09-27), so the batched warm-up sat waiting and the scene took far too
  // long to appear. Capture mode keeps runFrames (its sky-reading wait lives in tick).
  async function drawFrames(n) {
    if (capture) return runFrames(n);
    for (let i = 0; i < n && !disposed && renderer; i++) {
      try {
        frame();
      } catch (e) {
        lastStats.error = String(e?.message || e);
        if (!lastErrorLogged) console.error("[window] frame failed:", e);
        lastErrorLogged = true;
      }
      // let the GPU finish this frame before the next one is queued (unpaced frames
      // piled up and doubled the longest freeze), with a timer fallback
      const q = renderer.backend?.device?.queue;
      await Promise.race([q ? q.onSubmittedWorkDone() : Promise.resolve(), new Promise((r) => setTimeout(r, 250))]).catch(() => {});
      await new Promise((r) => setTimeout(r, 16));
    }
  }
  function runFrames(n) {
    return new Promise((resolve) => {
      if (disposed || !renderer) return resolve();
      waiters.push({ left: Math.max(1, n | 0), resolve });
      setLoop(true);
    });
  }

  const readyPromise = init()
    .then((ok) => {
      if (ok && active && !capture) setLoop(true);
      return ok;
    })
    .catch((e) => {
      // disposed while starting (a StrictMode or hot-reload remount tore it down
      // mid-compile): not a failure, the new mount carries on
      if (disposed) return false;
      console.error("[window] engine init failed:", e);
      throw e;
    });

  const engine = {
    ready: readyPromise,
    get params() {
      return params;
    },
    get look() {
      return look;
    },
    get theme() {
      return currentTheme;
    },
    get backend() {
      return rApi?.backend ?? null;
    },
    // the tier this page runs at, why, and what the GPU said about itself
    get quality() {
      return { quality: P.quality, why: qualityWhy, gpu, budgetMs: BUDGETS_MS[rApi?.backend || "webgpu"]?.[P.quality] ?? null };
    },
    get running() {
      return loopOn;
    },
    get weather() {
      return bridge?.get() ?? null;
    },
    // The cursor over the canvas, CSS px from its top left (tMs: the event's timeStamp);
    // null clears it (the cursor left the window).
    setPointer(x, y, tMs = performance.now()) {
      if (x === null) {
        pointer.active = false;
        pointer.vx = pointer.vy = 0;
        return;
      }
      const dts = pointer.active ? Math.max(0.004, (tMs - pointer.t) / 1000) : 0;
      if (dts > 0 && dts < 0.25) {
        // smoothed, so one jittery event cannot fling the chain
        pointer.vx = 0.5 * pointer.vx + 0.5 * ((x - pointer.x) / dts);
        pointer.vy = 0.5 * pointer.vy + 0.5 * ((y - pointer.y) / dts);
      } else pointer.vx = pointer.vy = 0;
      pointer.x = x;
      pointer.y = y;
      pointer.t = tMs;
      pointer.active = true;
    },
    // The page's scroll progress (ignored while the URL pins p or p2).
    setScroll(p, p2 = 0) {
      scrollP = Math.max(0, Math.min(1, p));
      scrollP2 = Math.max(0, Math.min(1, p2));
    },
    // The page's text rects over the canvas (CSS px, canvas-relative: [{ x0, y0,
    // x1, y1 }]), for the calm field; null returns to params.calm.boxes.
    setCalmBoxes(rects) {
      const ok = Array.isArray(rects) ? rects.filter((r) => r && r.x1 - r.x0 > 1 && r.y1 - r.y0 > 1) : [];
      calmBoxes = ok.length ? ok.map((r) => ({ x0: +r.x0, y0: +r.y0, x1: +r.x1, y1: +r.y1 })) : null;
      if (renderer && !loopOn && !capture) runFrames(1);
    },
    // Tools: pin the camera (null, null releases it back to the scroll).
    pinProgress(p, p2 = 0) {
      if (p === null && p2 === null) pinned = false;
      else {
        pinned = true;
        pinnedP = Math.max(0, Math.min(1, p ?? 0));
        pinnedP2 = Math.max(0, Math.min(1, p2 ?? 0));
      }
      unsettle();
      return runFrames(1);
    },
    // Continuous rendering on or off (the page: a runway is on screen, tab visible).
    setActive(on) {
      active = !!on && !capture;
      if (!renderer) return;
      if (active) {
        timer?.reset?.();
        setLoop(true);
      } else if (!waiters.length) setLoop(false);
    },
    renderOnce() {
      return runFrames(1);
    },
    renderFrames(n = 1) {
      return readyPromise.then(() => runFrames(n));
    },
    seek(s) {
      t = +s || 0;
      invalidateSky();
      unsettle();
      return readyPromise.then(() => runFrames(1));
    },
    async setParams(patch = {}) {
      deepMerge(userLayer, patch);
      // a new tier rebuilds everything that reads it at build time
      const tier = normalizeQuality(patch.quality);
      if (tier) setQuality(tier, "setParams");
      const geometry = !!(patch.dims || patch.room || patch.outside || tier);
      const skyShape = !!(patch.sky && (patch.sky.plate || patch.sky.view || patch.sky.radius !== undefined)) || !!tier;
      compose();
      await readyPromise;
      if (skyShape) rebuildSky();
      if (geometry) rebuild();
      invalidateSky();
      unsettle();
      await runFrames(1);
      await nextFrame();
    },
    async setLook(name) {
      look = normalizeLook(name);
      compose();
      await readyPromise;
      room?.setLook(look);
      outside?.setLook(look);
      invalidateSky();
      unsettle();
      await runFrames(1);
    },
    // the header's Outside menu (outsideStore.js): the weather preset and the hour
    async setOutside({ wx, tod } = {}) {
      await readyPromise;
      bridge?.setOverrides({ wx, tod });
      invalidateSky();
      unsettle();
      if (renderer && !loopOn && !capture) runFrames(1);
    },
    setTheme(th) {
      applyTheme(th === "dark" ? "dark" : "light");
      unsettle();
      if (renderer && !loopOn && !capture) runFrames(1);
    },
    setView(v) {
      view = v;
      if (renderer && !loopOn && !capture) runFrames(1);
    },
    // Called after a params change that touches geometry (GUI, setParams).
    rebuild,
    rebuildSky,
    resize(w, h) {
      if (!rApi) return;
      rApi.setSize(w, h);
      rApi.applyParams(P);
      unsettle();
      // capture mode draws only when a tool asks (a stray frame would move TRAA's jitter)
      if (!loopOn && !disposed && !capture) runFrames(1);
    },
    // Where the screen is and how far the fill is (for tools and the GUI).
    keyframes() {
      return screenInfo ? keyframes(P, { aspect: camera.aspect, screen: screenInfo }) : null;
    },
    stats() {
      const out = { ...lastStats };
      // capture tools read the Dreamlike moon's placement from stats (render.mjs
      // records stats() in every sidecar)
      // the monitor's active area in world metres (tools: overlays, pose solves)
      if (capture && screenInfo) {
        const { center: c, tangent: t, bitangent: b, width: w, height: h } = screenInfo;
        const at = (sx, sy) => c.map((v, i) => +(v + t[i] * sx * w * 0.5 + b[i] * sy * h * 0.5).toFixed(4));
        out.screen = { tl: at(-1, 1), tr: at(1, 1), br: at(1, -1), bl: at(-1, -1), normal: screenInfo.normal.map((v) => +v.toFixed(4)) };
      }
      if (capture && P.sky.moon.mode === "placed") {
        try {
          out.moon = moonCheck();
        } catch {
          /* not built */
        }
      }
      return out;
    },
    // Tools: the GPU meter's reading against the plate's own synchronous read of
    // the same plate (redrawn now, read in the same task). Stalls; tools only.
    async skyAverageCheck() {
      await readyPromise;
      if (!plate || !lastSkyUniforms) return null;
      plate.update(lastSkyUniforms);
      skyTex.needsUpdate = true;
      const cpu = plate.readAverage({ ...METER_REGION, step: 4 });
      plate.update(lastSkyUniforms);
      skyTex.needsUpdate = true;
      const gpu = await meter.measure();
      return { gpu, cpu, inUse: skyAvg, reads: meterReads, fallback: meterFailed };
    },
    // Tools (composition): what the camera sees at (p, p2), from a grid of rays at
    // the current aspect. Each ray's first surface (glass and other see-through
    // layers skipped): "view" when it leaves through the window (the outside group or
    // open sky), else the room object's name. Returns the share of each, the view's
    // share per third of the frame, and per named object the median distance along
    // the view axis (m: what the DOF focus measures).
    coverage({ p = 0, p2 = 0, nx = 48, ny = 30, shot = null } = {}) {
      if (!camera || !screenInfo || !room) return null;
      const pose = cameraPose(P, p, p2, { aspect: camera.aspect, screen: screenInfo, shot });
      _cam.aspect = camera.aspect;
      applyPose(_cam, pose, P);
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(_cam.quaternion);
      const targets = [room.group, outside?.group].filter(Boolean);
      const isOutside = (o) => {
        for (let q = o; q; q = q.parent) if (q === outside?.group) return true;
        return false;
      };
      const SEE = /glass|halo|mote|rain|drip|spray|dust|beam|air|volume/i;
      const counts = {}, depth = {}, thirds = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      const rows = [];
      const nd = new THREE.Vector2();
      for (let j = 0; j < ny; j++) {
        let row = "";
        for (let i = 0; i < nx; i++) {
          nd.set(((i + 0.5) / nx) * 2 - 1, 1 - ((j + 0.5) / ny) * 2);
          _ray.setFromCamera(nd, _cam);
          _ray.far = 200;
          let name = "view", d = null;
          for (const h of _ray.intersectObjects(targets, true)) {
            const o = h.object;
            if (!o.visible || SEE.test(o.name) || SEE.test(o.material?.name || "")) continue;
            d = h.point.clone().sub(_cam.position).dot(fwd);
            name = isOutside(o) ? "view" : o.name || o.parent?.name || "unnamed";
            if (name === "view") name = "view:" + (o.name || o.parent?.name || "outside");
            break;
          }
          const key = name.startsWith("view") ? name : name;
          counts[key] = (counts[key] || 0) + 1;
          if (d !== null) (depth[key] = depth[key] || []).push(d);
          const view = name.startsWith("view");
          thirds[Math.min(2, Math.floor((j / ny) * 3))][Math.min(2, Math.floor((i / nx) * 3))] += view ? 1 : 0;
          row += view ? (d === null ? "." : "v") : name[0];
        }
        rows.push(row);
      }
      const N = nx * ny, cell = N / 9;
      const share = Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +(v / N).toFixed(4)]));
      const med = (a) => {
        const s = a.slice().sort((x, y) => x - y);
        return +s[s.length >> 1].toFixed(3);
      };
      const viewShare = Object.entries(counts).filter(([k]) => k.startsWith("view")).reduce((s, [, v]) => s + v, 0) / N;
      return {
        pose: { pos: pose.pos.map((v) => +v.toFixed(4)), yaw: +pose.yaw.toFixed(2), pitch: +pose.pitch.toFixed(2), fov: +pose.fov.toFixed(2), focus: +pose.focus.toFixed(3), bokeh: +(pose.bokeh ?? 1).toFixed(2) },
        viewShare: +viewShare.toFixed(4),
        viewThirds: thirds.map((r) => r.map((v) => +(v / cell).toFixed(2))),
        share,
        depth: Object.fromEntries(Object.entries(depth).map(([k, a]) => [k, { median: med(a), min: +Math.min(...a).toFixed(3), max: +Math.max(...a).toFixed(3) }])),
        rows,
      };
    },
    // Tools: world points (m) to pixels at the current viewport, through the camera
    // at (p, p2) or a named shot (poster rectification, overlays, pose checks).
    project(points = [], { p = 0, p2 = 0, shot = null } = {}) {
      if (!camera || !screenInfo) return null;
      const pose = cameraPose(P, p, p2, { aspect: camera.aspect, screen: screenInfo, shot });
      _cam.aspect = camera.aspect;
      applyPose(_cam, pose, P);
      const s = rApi.size;
      return points.map((q) => {
        const v = new THREE.Vector3(q[0], q[1], q[2]).project(_cam);
        return [+(((v.x + 1) / 2) * s.w).toFixed(2), +(((1 - v.y) / 2) * s.h).toFixed(2), +v.z.toFixed(4)];
      });
    },
    // A poster from the page itself (a canvas or image in sRGB), for a theme (default:
    // the current one): the folio page captures its first viewport live so the
    // screen ends on exactly what the page shows after the hand-off.
    setPoster(source, theme = currentTheme) {
      if (!source || !renderer) return;
      // one texture per source, reused when the page swaps between its posters
      let tex = source instanceof THREE.Texture ? source : posterCache.get(source);
      if (!tex) {
        tex = new THREE.CanvasTexture(source);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso();
        posterCache.set(source, tex);
      }
      const old = posters[theme];
      posters[theme] = tex;
      try {
        posterMean[theme] = imageMeanLinear(tex.image);
      } catch {
        /* keep the last mean */
      }
      if (theme === currentTheme) applyTheme(theme);
      if (old && old !== posters.light && old !== posters.dark && !old.isCanvasTexture) old.dispose();
      if (!loopOn && !capture) runFrames(1);
    },
    // The monitor screen's four corners in CSS px of the canvas at runway position p
    // (bookend p2), for mapping a page image onto it: top-left, top-right,
    // bottom-right, bottom-left as the viewer sees them.
    screenRectAt(p = 1, p2 = 0) {
      const scr = room?.anchors?.monitorScreen;
      if (!scr || !camera || !screenInfo) return null;
      const pose = cameraPose(P, p, p2, { aspect: camera.aspect, screen: screenInfo });
      _cam.aspect = camera.aspect;
      applyPose(_cam, pose, P);
      _cam.updateMatrixWorld();
      _cam.updateProjectionMatrix();
      scr.updateMatrixWorld(true);
      const geo = scr.geometry;
      if (!geo.boundingBox) geo.computeBoundingBox();
      const b = geo.boundingBox;
      const s = rApi.size;
      const pts = [];
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) {
        const v = new THREE.Vector3(x, y, (b.min.z + b.max.z) / 2).applyMatrix4(scr.matrixWorld).project(_cam);
        pts.push([((v.x + 1) / 2) * s.w, ((1 - v.y) / 2) * s.h]);
      }
      const byY = [...pts].sort((a, c) => a[1] - c[1]);
      const top = byY.slice(0, 2).sort((a, c) => a[0] - c[0]);
      const bot = byY.slice(2).sort((a, c) => a[0] - c[0]);
      return { tl: top[0], tr: top[1], br: bot[1], bl: bot[0], w: s.w, h: s.h };
    },
    // Where the placed moon lands for each runway position (tools, the GUI).
    moonCheck(ps) {
      return moonCheck(ps);
    },
    // GPU cost per frame, measured one isolated frame at a time (loop 2, C3: the
    // old version summed three's per-pass timestamp durations and read 177 ms
    // against a 13.7 ms wall clock: on Apple GPUs passes overlap, and on a shared
    // GPU a pass's span includes other processes' work). Now: wait for the queue
    // to go idle, draw one frame, wait for idle again. serialMs is that span (CPU
    // encoding plus GPU execution, nothing overlapping: an upper bound on the
    // pipelined frame), cpuMs the frame() call alone, tailMs what the GPU still had
    // to do after the last submit (above 0: GPU-bound). With ?stats=1 the timestamp
    // sum and the costliest passes come along, for the record only: on the M3 Pro in
    // Chrome 153 every pass reads about 7 ms and the sum 95 to 104 ms against a 12 ms
    // frame (loop 2), so pass timestamps there are not a cost. WebGPU: the queue's
    // onSubmittedWorkDone; WebGL2: a fence polled without blocking.
    async measureGpu(n = 20) {
      await readyPromise;
      if (!renderer || disposed) return null;
      const b = renderer.backend;
      const idle = async () => {
        if (b.isWebGPUBackend) return b.device.queue.onSubmittedWorkDone();
        const gl = b.gl;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        // poll by yielding a task (a MessageChannel hop, not setTimeout's 4 ms clamp)
        const mc = new MessageChannel();
        const hop = () => new Promise((res) => { mc.port1.onmessage = () => res(); mc.port2.postMessage(0); });
        for (let i = 0; i < 20000; i++) {
          const r = gl.clientWaitSync(sync, 0, 0);
          if (r === gl.ALREADY_SIGNALED || r === gl.CONDITION_SATISFIED) break;
          await hop();
        }
        mc.port1.close();
        gl.deleteSync(sync);
      };
      // frames go through three's animation loop (runFrames): a frame() called
      // outside it does not advance the node frame, so every pass skips its
      // per-frame update and the "frame" costs 0.3 ms
      const wasActive = active;
      active = false;
      measuring = true;
      const serial = [], cpu = [], tail = [], tsum = [];
      const passes = {};
      try {
        await runFrames(1);
        if (b.trackTimestamp) await renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER).catch(() => null);
        for (let i = 0; i < n + 2; i++) {
          await idle();
          await runFrames(1);
          const [t0, t1] = lastFrameSpan;
          await idle();
          const t2 = performance.now();
          if (i < 2) continue; // warm: the first frames after a pause re-upload
          serial.push(t2 - t0);
          cpu.push(t1 - t0);
          tail.push(t2 - t1);
          if (b.trackTimestamp) {
            const ms = await renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER).catch(() => null);
            if (Number.isFinite(ms)) tsum.push(ms);
            const pool = b.timestampQueryPool?.render;
            for (const [uid, d] of pool?.timestamps || []) {
              const k = String(uid).replace(/:f\d+$/, "");
              (passes[k] = passes[k] || []).push(d);
            }
          }
        }
      } finally {
        measuring = false;
        active = wasActive;
        if (active) setLoop(true);
      }
      const med = (a) => {
        if (!a.length) return null;
        const s2 = a.slice().sort((x, y) => x - y);
        return +s2[s2.length >> 1].toFixed(3);
      };
      const top = Object.entries(passes)
        .map(([k, a]) => [k, med(a)])
        .sort((x, y) => y[1] - x[1])
        .slice(0, 12);
      const r = { method: "serial", backend: rApi.backend, frames: serial.length, serialMs: med(serial), cpuMs: med(cpu), tailMs: med(tail), minSerialMs: serial.length ? +Math.min(...serial).toFixed(3) : null, timestampSumMs: med(tsum), topPasses: top, quality: P.quality };
      lastGpuMs = r.serialMs;
      lastStats.gpuMs = r.serialMs;
      return r;
    },
    get renderer() {
      return renderer;
    },
    looks: LOOK_NAMES,
    dispose() {
      if (disposed) return; // the page can give up on a slow start, then unmount
      disposed = true;
      waiters.forEach((w) => w.resolve());
      waiters = [];
      try {
        renderer?.setAnimationLoop(null);
      } catch {
        /* not initialised */
      }
      bridge?.dispose();
      timer?.dispose();
      calm?.dispose();
      post?.dispose();
      disposeModules();
      skyDome?.geometry.dispose();
      skyDome?.material.dispose();
      skyTex?.dispose();
      meter?.dispose();
      plate?.canvas?.remove?.();
      plate?.dispose();
      new Set(Object.values(posters)).forEach((tx) => tx.dispose());
      screenMat?.dispose();
      rApi?.dispose();
    },
  };

  function applyTheme(th) {
    currentTheme = th;
    const node = screenMat?.userData.posterNode;
    if (node && posters[th]) node.value = posters[th];
  }

  // the plate's size, the view it covers and the dome's radius are build-time
  function rebuildSky() {
    if (!renderer) return;
    plate.resize(P.sky.plate.width, P.sky.plate.height);
    skyTex.dispose(); // the GPU copy is re-made at the new size on the next upload
    skyTex.needsUpdate = true;
    scene.remove(skyDome);
    skyDome.geometry.dispose();
    skyDome.material.dispose();
    const dome = buildSkyDome(P, skyTex, uniforms);
    skyDome = dome.mesh;
    skyView = dome.view;
    scene.add(skyDome);
  }

  function rebuild() {
    codeScreen = null;
    if (!renderer) return;
    disposeModules();
    random = seededRandom(opts.seed ?? 1741);
    buildModules();
  }

  return engine;
}
