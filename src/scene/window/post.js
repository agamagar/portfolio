// The post pipeline: one RenderPipeline built from TSL nodes. Light, air and lens.
//
//   scene pass, MRT { output, emissive, normal, velocity } (+ depth); it renders at
//   the quality tier's internal scale (params.quality, POST_PARAMS.tiers), or on
//   high-DPR screens at params.post.resolutionScaleHiDpi when no tier is set
//     -> TRAA then depth of field (full-size pass), or depth of field then TAAU
//        (scaled pass: DOF at the pass size, TAAU upscales while it resolves);
//        the DOF focus distance comes from the camera path
//     -> x AO (SSAONode, half resolution, self-denoised)
//     -> + the air: the lamp's beam and the room's dust (light/volume.js), ray
//        marched in its own low-resolution pass, gaussian-denoised
//     -> + selective bloom from the emissive target (sky, screen, bulb, specks),
//        sized from the frame's height so it reaches as far at any DPR
//     -> veiling glare (light/lens.js): a linear PSF, tight core + mid halo + long
//        faint tail, from a box-filtered copy of fixed height (DPR independent)
//     -> the grade in scene-linear light (light/grade.js): white balance, the auto
//        exposure (light/exposure.js), a hue band (Cyberpunk), saturation, contrast
//     -> the local tone map (light/lens.js): an edge-aware shadow lift, the phone's
//        own processing (Photo-true), a touch of it in the other looks
//     -> tone mapping + sRGB, ONCE: the renderer's tone mapper (AgX) or the phone's
//        per-channel hard-shoulder curve (params.post.tone.curve)
//     -> the display grade: lift, gamma, a split tone (Cyberpunk), vignette; then
//        grain: a denoised sensor's
//        (a 3 x 3 tent of a per-pixel hash, about 0.7 px, shaped by luminance:
//        a little more in the shadows, almost none in the highlights)
//     -> the page on the screen: over the runway's last half (and the bookend's
//        first stretch) the monitor's own pixels leave the look (veil, lift, grain,
//        vignette, the tone curve) and show the page as the page shows it, so
//        the hand-off is a reveal, not a fade (params.post.handoff.page)
//     -> the hand-off: a final mix to the exact page ground (#ffffff / #0e0e11)
//
// Every stage has an enable flag (a rebuild) and strengths (uniforms, per frame)
// in params.post and params.grade. The debug switch (?view=) shows one buffer
// instead: beauty | normal | ao | emissive | velocity | depth | volume | lift.
//
// Materials decide what blooms by what they write into the emissive target; a
// material can override it with material.mrtNode = mrt({ emissive: ... }).

import * as THREE from "three/webgpu";
import {
  pass,
  mrt,
  output,
  emissive,
  normalView,
  velocity,
  uniform,
  vec2,
  vec3,
  vec4,
  float,
  mix,
  fract,
  sin,
  dot,
  screenUV,
  screenCoordinate,
  renderOutput,
  smoothstep,
  sRGBTransferOETF,
  Fn,
  If,
  rtt,
  toneMappingExposure,
  texture,
} from "three/tsl";
import { ssao } from "three/addons/tsl/display/SSAONode.js";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { dof } from "three/addons/tsl/display/DepthOfFieldNode.js";
import { taau, traa } from "./taau.js"; // the core lane's AA: resting TAAU (a fork of three's TAAUNode) and three's TRAA, both with the velocity bound to the unjittered projection
import { gaussianBlur } from "three/addons/tsl/display/GaussianBlurNode.js";
import { lightBus, publishDebug, VOLUME_LAYER } from "./light/bus.js";
import { createAir } from "./light/volume.js";
import { createGradeUniforms, gradeSceneLinear, gradeDisplay } from "./light/grade.js";
import { cameraExposure, setLightGain } from "./light/exposure.js";
import { createLensUniforms, buildLens, phoneCurve } from "./light/lens.js";

const _size = new THREE.Vector2();
const glareOn = (E) => !!E.glare.enabled && (E.glare.core > 0 || E.glare.mid > 0 || E.glare.tail > 0);
const localToneOn = (E) => !!E.localTone?.enabled && (E.localTone.lift > 0 || E.localTone.pull > 0);
// the grade's optional stages (grade.hueBand, grade.split): built only when a look
// asks for them, so the other looks keep their exact graph
const hueBandOn = (Gp) => (Gp?.hueBand?.amount ?? 0) > 0;
const splitOn = (Gp) => (Gp?.split?.shadowAmount ?? 0) > 0 || (Gp?.split?.highAmount ?? 0) > 0;
const D2R = Math.PI / 180;

// Hoskins' hash (sin-free: a sin hash of large pixel coordinates loses its low
// bits in fp32 on some GPUs), 0..1
function hash12(p) {
  const p3 = fract(vec3(p.x, p.y, p.x).mul(0.1031));
  const q = p3.add(dot(p3, p3.yzx.add(33.33)));
  return fract(q.x.add(q.y).mul(q.z));
}

// 1 on the monitor's own pixels (inside its quad, and the nearest surface there
// is the panel: the lamp head in front of it is not the page), soft over a pixel
function screenMask(viewZ, u, q = { A: u.scrA, B: u.scrB, C: u.scrC, D: u.scrD, N: u.scrN }) {
  const uvp = screenUV;
  const edge = (a, b) => {
    const e = b.sub(a);
    const d = e.x.mul(uvp.y.sub(a.y)).sub(e.y.mul(uvp.x.sub(a.x)));
    // signed distance in px (the quad is counterclockwise in UV, y down)
    const len = e.mul(u.scrPx).length().max(1e-4);
    return smoothstep(-0.5, 0.5, d.mul(u.scrPx.x).mul(u.scrPx.y).div(len));
  };
  const inside = edge(q.A, q.B).mul(edge(q.B, q.C)).mul(edge(q.C, q.D)).mul(edge(q.D, q.A));
  // the panel plane's view depth along this pixel's ray
  const ray = vec3(uvp.x.mul(2).sub(1).div(u.scrProj.x), float(1).sub(uvp.y.mul(2)).div(u.scrProj.y), -1);
  const nd = dot(q.N.xyz, ray);
  const planeZ = q.N.w.div(nd.abs().max(1e-4).mul(nd.sign())).negate();
  const front = float(1).sub(smoothstep(0.01, 0.03, viewZ.sub(planeZ)));
  return inside.mul(front);
}

// The tier this frame renders at: params.quality when it names one of
// POST_PARAMS.tiers, else null (the DPR rule below).
function tierOf(P) {
  const q = P.quality;
  return q && P.post.tiers?.[q] ? P.post.tiers[q] : null;
}

export function createPost(renderer, scene, camera, P) {
  const bus = lightBus(scene);
  const rp = new THREE.RenderPipeline(renderer);
  rp.outputColorTransform = false; // renderOutput() is placed by hand, before grain and the hand-off

  const sp = pass(scene, camera);
  sp.setMRT(mrt({ output, emissive, normal: normalView, velocity }));
  const colT = sp.getTextureNode("output");
  const emiT = sp.getTextureNode("emissive");
  const nrmT = sp.getTextureNode("normal");
  const depT = sp.getTextureNode("depth");
  const velT = sp.getTextureNode("velocity");
  const viewZ = sp.getViewZNode();

  // the air: its own pass on VOLUME_LAYER, no depth buffer (the scene pass's depth
  // occludes it inside the ray march)
  const air = createAir({ scene, P, depthNode: depT.sample(screenUV) });
  const vp = pass(scene, camera, { depthBuffer: false });
  vp.name = "air";
  const volLayers = new THREE.Layers();
  volLayers.disableAll();
  volLayers.enable(VOLUME_LAYER);
  vp.setLayers(volLayers);
  const volT = vp.getTextureNode();

  const u = {
    aoStrength: uniform(0.75),
    focus: uniform(0.8), // m along the view axis
    focalLength: uniform(0.9), // m
    bokeh: uniform(2.5),
    grain: uniform(0.03),
    seed: uniform(0),
    final: uniform(0), // 0..1 display-space mix to the page ground
    bg: uniform(new THREE.Vector3(1, 1, 1)), // page ground, display sRGB 0..1
    vol: uniform(1), // how much of the air reaches the image
    volBlur: uniform(1),
    cocSpread: uniform(1), // the DOF's CoC blur, stretched to keep its share of the frame
    // the page on the screen: the screen's quad in screen UV (top-left origin,
    // counterclockwise), its plane in view space (n, n . p0), the gain from the
    // screen's light to the page's own linear value, how much of the page shows
    scrA: uniform(new THREE.Vector2()),
    scrB: uniform(new THREE.Vector2()),
    scrC: uniform(new THREE.Vector2()),
    scrD: uniform(new THREE.Vector2()),
    scrN: uniform(new THREE.Vector4(0, 0, 1, 0)),
    scrProj: uniform(new THREE.Vector2(1, 1)), // projection x and y scale (P[0], P[5])
    scrPx: uniform(new THREE.Vector2(1440, 900)), // drawing buffer size, px
    scrGain: uniform(1),
    pageMix: uniform(0),
    // the portrait monitor's code editor, shown 1:1 the same way (2026-09-27, Agam:
    // "the code screen should have the same colour as the portfolio screen")
    prtA: uniform(new THREE.Vector2()),
    prtB: uniform(new THREE.Vector2()),
    prtC: uniform(new THREE.Vector2()),
    prtD: uniform(new THREE.Vector2()),
    prtN: uniform(new THREE.Vector4(0, 0, 1, 0)),
    prtGain: uniform(1),
    prtOn: uniform(0),
    // the folio's page capture itself, drawn onto the monitor's quad through a
    // homography (screen UV -> the capture's UV), so the frame before the hand-off is
    // the capture's own pixels, as sharp as the page (2026-09-27, the landing glitch:
    // the scene render of the page was softer than the page, and the swap snapped)
    scrH: uniform(new THREE.Matrix3()),
    posterOn: uniform(0),
    posterTex: texture(new THREE.Texture()),
  };
  const g = createGradeUniforms();
  const lu = createLensUniforms();

  let nodes = {};
  let lens = null;
  let signature = "";
  // per-frame skips (loop 2, perf) and the camera's rest detection
  const skip = { ao: false, air: false };
  const camRest = { m: new Float64Array(32), still: 0, frame: 0 };

  const disposeNodes = () => {
    for (const n of Object.values(nodes)) {
      try {
        n?.dispose?.();
      } catch {
        /* already gone */
      }
    }
    nodes = {};
    lens?.dispose();
    lens = null;
  };

  function build(view, scaled, scale, on) {
    disposeNodes();
    const E = P.post;
    let aoSample = null;
    let color = colT;

    // anti-aliasing: TRAA at full resolution; TAAU when the scene pass runs below
    // the drawing buffer (TRAA's depth history assumes a full-size pass, TAAU
    // reconstructs the output size from the jittered low-resolution samples).
    // Depth of field runs FIRST, at the pass's own resolution, on every path: DOF
    // at the full DPR 2 output was the single most expensive stage (measured), and
    // running it before the AA on one path and after it on the other made the
    // thin dark bars 0.1 to 0.26 stops brighter on the scaled path (the DPR gate).
    // The AA reads a render target, so DOF's result is an RTT at the pass's scale.
    const dofFirst = on.dof;
    // DepthOfFieldNode blurs its circle of confusion by a fixed 2 texels (three
    // r186): stretch that blur by the image's width over the 1600 px it was
    // judged at, so the near field spreads over the same share of the frame
    const spreadCoC = (d) => {
      if (d?._CoCBlurNode) d._CoCBlurNode.directionNode = u.cocSpread;
      return d;
    };
    if (dofFirst) {
      nodes.dof = spreadCoC(dof(colT, viewZ, u.focus, u.focalLength, u.bokeh));
      nodes.dofRT = rtt(nodes.dof, null, null, { resolutionScale: scale });
      color = nodes.dofRT;
    }
    if (E.traa.enabled) {
      nodes.aa = scaled ? taau(color, depT, velT, camera) : traa(color, depT, velT, camera);
      color = nodes.aa.getTextureNode(); // its resolve texture
    }
    // the lens reads the anti-aliased image (a texture)
    const lensSrc = color;
    let hdr = color.rgb;
    // AO after AA and DOF: it is soft (half resolution, blurred) and applying it
    // here needs no full-resolution copy of the image
    if (on.ao) {
      nodes.ao = ssao(depT, nrmT, camera);
      nodes.ao.resolutionScale = E.ao.resolutionScale;
      aoSample = nodes.ao.getTextureNode().sample(screenUV).r;
      hdr = hdr.mul(mix(float(1), aoSample, u.aoStrength));
    }
    // the air, after AO (light in the air is not occluded by the surfaces' AO);
    // its dither is static per frame and the gaussian takes it out
    let volSample = null;
    if (on.volume) {
      nodes.volBlur = gaussianBlur(volT, u.volBlur, 4);
      volSample = nodes.volBlur.rgb;
      hdr = hdr.add(volSample.mul(u.vol));
    }
    if (on.bloom) {
      nodes.bloom = bloom(emiT, E.bloom.strength, E.bloom.radius, E.bloom.threshold);
      nodes.bloom.setResolutionScale(0.5);
      hdr = hdr.add(nodes.bloom.rgb);
    }
    // the lens: veiling glare (scene-linear, before exposure) and the local tone map
    if (on.glare || on.localTone) {
      lens = buildLens(lensSrc, lu, { glare: on.glare, localTone: on.localTone, midSigma: Math.max(1, E.glare.midSigma | 0), tailSigma: Math.max(1, E.glare.tailSigma | 0) });
      if (on.glare) hdr = lens.glare(hdr);
    }

    let out;
    if (view === "normal") out = vec4(nrmT.rgb.mul(0.5).add(0.5), 1);
    else if (view === "ao") out = vec4(vec3(aoSample ?? float(1)), 1);
    else if (view === "emissive") out = renderOutput(vec4(emiT.rgb, 1));
    else if (view === "velocity") out = vec4(velT.xy.mul(40).add(0.5), 0.5, 1);
    else if (view === "depth") out = vec4(vec3(float(1).sub(viewZ.negate().div(3).clamp(0, 1))), 1);
    // the air alone, x 8; the scene colour is read (x 0) so the scene pass renders
    // before the air's pass samples its depth
    else if (view === "volume") out = renderOutput(vec4((volSample ?? vec3(0)).mul(g.exposure).mul(8).add(colT.rgb.mul(0)), 1));
    // the local tone map's lift, 0 (black) to 3 stops (white)
    else if (view === "lift") out = vec4(vec3(lens ? lens.lift(gradeSceneLinear(hdr, g, { hueBand: on.hueBand })).div(3) : float(0)), 1);
    else {
      let lin = gradeSceneLinear(hdr, g, { hueBand: on.hueBand });
      if (lens && on.localTone) lin = lens.localTone(lin);
      const disp = on.phone
        ? renderOutput(vec4(phoneCurve(lin.mul(toneMappingExposure), lu), 1), THREE.NoToneMapping)
        : renderOutput(vec4(lin, 1));
      // (the split tone runs here, before the grain, the page on the screen and the
      // final mix to the page ground: the hand-off never sees it)
      const ldr = gradeDisplay(disp.rgb, g, { split: on.split });
      // grain: a denoised sensor, not a hash. A per-pixel hash (re-seeded per
      // frame, fixed in capture mode) averaged over a 2 x 2 block (the grain is
      // correlated over about a pixel: soft, not static), renormalised to the
      // hash's own spread; more of it in the shadows, almost none in the
      // highlights (an iPhone's shadows are smooth, its sky clean)
      const base = screenCoordinate.xy.add(vec2(u.seed.mul(17.3), u.seed.mul(29.1)));
      const acc = hash12(base).add(hash12(base.add(vec2(1, 0)))).add(hash12(base.add(vec2(0, 1)))).add(hash12(base.add(vec2(1, 1))));
      const n = acc.mul(0.25).sub(0.5).div(0.5);
      const dl = dot(ldr, vec3(0.2126, 0.7152, 0.0722));
      const shape = mix(float(1.35), float(0.1), smoothstep(0.03, 0.75, dl));
      const grained = ldr.add(n.mul(u.grain).mul(shape).mul(float(1).sub(u.final)));
      // the page on the screen: a uniform branch, so the rest of the runway
      // pays nothing for it
      const shown = Fn(() => {
        const r = vec3(grained).toVar();
        If(u.pageMix.greaterThan(0), () => {
          const rendered = sRGBTransferOETF(lensSrc.sample(screenUV).rgb.mul(u.scrGain).clamp(0, 1));
          const h = u.scrH.mul(vec3(screenUV, 1));
          const puv = h.xy.div(h.z);
          const captured = sRGBTransferOETF(u.posterTex.sample(puv).rgb);
          const page = mix(rendered, captured, u.posterOn);
          r.assign(mix(r, page, screenMask(viewZ, u).mul(u.pageMix)));
        });
        If(u.pageMix.mul(u.prtOn).greaterThan(0), () => {
          const code = sRGBTransferOETF(lensSrc.sample(screenUV).rgb.mul(u.prtGain).clamp(0, 1));
          r.assign(mix(r, code, screenMask(viewZ, u, { A: u.prtA, B: u.prtB, C: u.prtC, D: u.prtD, N: u.prtN }).mul(u.pageMix).mul(u.prtOn)));
        });
        return r;
      })();
      out = vec4(mix(shown, u.bg, u.final), 1);
    }
    rp.outputNode = out;
    rp.needsUpdate = true;
    // (loop 2, perf) passes that may skip a frame and keep their last result: the
    // AO every other frame while the camera rests, the air on the low tier at the
    // hero (skip.* are set per frame in update)
    const skippable = (node, flag) => {
      if (!node || typeof node.updateBefore !== "function" || node.__skipFlag) return;
      node.__skipFlag = flag;
      const run = node.updateBefore.bind(node);
      node.updateBefore = (frame) => (skip[flag] ? false : run(frame));
    };
    skippable(nodes.ao, "ao");
    skippable(vp, "air");
    skippable(nodes.volBlur, "air");
  }

  // The page on the screen (params.post.handoff.page): how much of the monitor
  // shows the page as the page itself shows it, by where the camera is on the
  // runway (the rig puts p and p2 on the bus), and where the panel is on screen
  const _c = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const _n = new THREE.Vector3(), _p0 = new THREE.Vector3(), _e1 = new THREE.Vector3(), _e2 = new THREE.Vector3();
  const sm = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  function setQuad(rect, quad, nrm) {
    // the quad in screen UV, counterclockwise in the edge test's sense
    const uvs = rect.map((w, i) => {
      _c[i].copy(w).applyMatrix4(camera.matrixWorldInverse);
      const v = w.clone().project(camera);
      return [(v.x + 1) / 2, (1 - v.y) / 2];
    });
    let area = 0;
    for (let i = 0; i < 4; i++) {
      const a = uvs[i], b = uvs[(i + 1) % 4];
      area += a[0] * b[1] - b[0] * a[1];
    }
    // cross(e, p - a) > 0 inside needs the y-down area positive in this sense
    const ord = area < 0 ? [0, 3, 2, 1] : [0, 1, 2, 3];
    quad.forEach((q, i) => q.value.set(uvs[ord[i]][0], uvs[ord[i]][1]));
    // the plane in view space
    _e1.subVectors(_c[1], _c[0]);
    _e2.subVectors(_c[3], _c[0]);
    _n.crossVectors(_e1, _e2).normalize();
    _p0.copy(_c[0]);
    nrm.value.set(_n.x, _n.y, _n.z, _n.dot(_p0));
    return uvs;
  }
  // the homography from screen UV to the capture's UV: the quad's corners (rect
  // order: bottom-left, bottom-right, top-right, top-left as seen) to (0,0) (1,0)
  // (1,1) (0,1), the texture's v up (Heckbert's square-to-quad, inverted)
  const _Hm = new THREE.Matrix3();
  function setHomography(uvs) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = uvs;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
    const g = (dx3 * dy2 - dx2 * dy3) / den;
    const h = (dx1 * dy3 - dx3 * dy1) / den;
    // square -> quad, row-major
    _Hm.set(x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1);
    u.scrH.value.copy(_Hm).invert();
  }
  function pageOnScreen(bg) {
    const Hp = P.post.handoff?.page;
    const r = bus.rects?.screen;
    let k = 0;
    if (Hp?.enabled !== false && Hp && r) {
      const p = bus.p ?? 0, p2 = bus.p2 ?? 0;
      k = p2 > 0 ? 1 - sm(Hp.bookendFrom ?? 0.16, Hp.bookendTo ?? 0.45, p2) : sm(Hp.from ?? 0.5, Hp.to ?? 0.8, p);
      k *= Hp.max ?? 1;
    }
    u.pageMix.value = k;
    if (k <= 0) return;
    camera.updateMatrixWorld();
    const uvsMain = setQuad(r, [u.scrA, u.scrB, u.scrC, u.scrD], u.scrN);
    const ptex = bus.posterTex;
    u.posterOn.value = ptex ? 1 : 0;
    if (ptex) {
      u.posterTex.value = ptex;
      setHomography(uvsMain);
    }
    const pr = bus.rects?.portrait;
    u.prtOn.value = pr ? 1 : 0;
    if (pr) {
      setQuad(pr, [u.prtA, u.prtB, u.prtC, u.prtD], u.prtN);
      u.prtGain.value = 1 / Math.max(1e-3, bus.portraitIntensity ?? 1);
    }
    u.scrProj.value.set(camera.projectionMatrix.elements[0], camera.projectionMatrix.elements[5]);
    renderer.getDrawingBufferSize(_size);
    u.scrPx.value.set(_size.x, _size.y);
    // the screen's light is the page times its white (dimmed at night, by theme)
    const theme = (bg?.[0] ?? 1) > 0.5 ? "light" : "dark";
    const nightK = 1 - sm(-8, -2, bus.sunAlt ?? 10);
    const nw = P.screen.night?.[theme] ?? 1;
    u.scrGain.value = 1 / Math.max(1e-3, P.screen.white * (1 + (nw - 1) * nightK));
  }

  const api = {
    pipeline: rp,
    scenePass: sp,
    volumePass: vp,
    air,
    uniforms: u,
    grade: g,
    lens: lu,
    // Per frame: enable flags (rebuild on change), strengths, focus, hand-off.
    update({ view = "beauty", focus, final = 0, bg = [1, 1, 1], seed = 0, dpr = 1 } = {}) {
      const E = P.post;
      const T = tierOf(P);
      // the scene pass (and everything that follows its size) renders below the
      // drawing buffer on high-DPR screens or on a tier with a lower internal
      // density; TAA's jitter recovers the detail
      let scale;
      if (T) scale = T.density / Math.max(1, dpr);
      else scale = dpr >= 1.75 ? E.resolutionScaleHiDpi : E.resolutionScale;
      scale = Math.max(0.25, Math.min(1, scale));
      if (sp.getResolutionScale() !== scale) sp.setResolutionScale(scale);
      const scaled = scale < 0.999;
      // the air: a fraction of the scene pass, or of the drawing buffer when scaled
      const vScale = Math.max(0.1, Math.min(1, T ? T.volumeScale / Math.max(1, dpr) : scaled ? E.hiDpi.volumeScale : scale * E.volume.resolutionScale));
      if (vp.getResolutionScale() !== vScale) vp.setResolutionScale(vScale);
      const on = {
        ao: E.ao.enabled && (T ? T.aoSamples > 0 : true),
        dof: E.dof.enabled && (T ? T.dof !== false : true),
        bloom: E.bloom.enabled && E.bloom.strength > 0 && (T ? T.bloom !== false : true),
        volume: E.volume.enabled && (T ? T.volumeSteps > 0 : true),
        glare: glareOn(E),
        localTone: localToneOn(E),
        phone: E.tone?.curve === "phone",
        hueBand: hueBandOn(P.grade),
        split: splitOn(P.grade),
      };
      const sig = [on.ao, E.traa.enabled, on.dof, on.bloom, on.glare, E.glare.midSigma, E.glare.tailSigma, on.volume, on.localTone, on.phone, view, scale, on.hueBand, on.split].join("|");
      if (sig !== signature) {
        signature = sig;
        build(view, scaled, scale, on);
      }
      // the camera at rest (its pose and lens unchanged since the last frame):
      // the AO renders every other frame then (its half-resolution, blurred
      // result barely moves under TAA's jitter); on the low tier the air is not
      // drawn at the hero (p under 0.08), where its beam is a few faint specks
      camera.updateMatrixWorld();
      {
        const a = camera.matrixWorld.elements, b = camera.projectionMatrix.elements;
        let same = true;
        for (let i = 0; i < 16; i++) {
          if (Math.abs(camRest.m[i] - a[i]) > 1e-7 || Math.abs(camRest.m[16 + i] - b[i]) > 1e-7) same = false;
          camRest.m[i] = a[i];
          camRest.m[16 + i] = b[i];
        }
        camRest.still = same ? camRest.still + 1 : 0;
        camRest.frame++;
      }
      const PS = E.skip || {};
      skip.ao = PS.aoAtRest !== false && camRest.still >= 2 && camRest.frame % 2 === 1;
      skip.air = PS.airLowHero !== false && P.quality === "low" && (bus.p2 ?? 0) <= 0 && (bus.p ?? 0) < 0.08;
      bus.debug.skipAO = skip.ao;
      bus.debug.skipAir = skip.air;
      renderer.getDrawingBufferSize(_size);
      const H = Math.max(1, _size.y);
      if (nodes.ao) {
        nodes.ao.radius.value = E.ao.radius;
        nodes.ao.intensity.value = E.ao.intensity;
        nodes.ao.samples.value = T ? Math.min(E.ao.samples, T.aoSamples) : scaled ? Math.min(E.ao.samples, E.hiDpi.aoSamples) : E.ao.samples;
        if (nodes.ao.resolutionScale !== E.ao.resolutionScale) {
          nodes.ao.resolutionScale = E.ao.resolutionScale;
        }
      }
      u.aoStrength.value = E.ao.strength;
      if (nodes.bloom) {
        nodes.bloom.strength.value = E.bloom.strength;
        nodes.bloom.radius.value = E.bloom.radius;
        nodes.bloom.threshold.value = E.bloom.threshold;
        // its source is a fixed number of texels high: the same reach on screen at
        // any DPR and tier (its blur kernels are sized in texels)
        const bs = Math.max(0.05, Math.min(1, (E.bloom.height ?? 450) / H));
        if (Math.abs(nodes.bloom.getResolutionScale() - bs) > 1e-6) nodes.bloom.setResolutionScale(bs);
      }
      // the lens
      const Gl = E.glare;
      lu.core.value = Gl.core ?? 0;
      lu.mid.value = Gl.mid ?? 0;
      lu.tail.value = Gl.tail ?? 0;
      lu.midSpread.value = Gl.midSpread ?? 1;
      lu.tailSpread.value = Gl.tailSpread ?? 1;
      lu.tint.value.setRGB(Gl.tint[0], Gl.tint[1], Gl.tint[2]);
      lu.glareTh.value = Gl.threshold ?? 0;
      const LT = E.localTone || {};
      lu.ltLift.value = LT.lift ?? 0;
      lu.ltLo.value = Math.log2(Math.max(1e-5, LT.lo ?? 0.01));
      lu.ltHi.value = Math.log2(Math.max(1e-5, LT.hi ?? 0.06));
      lu.ltFloor.value = Math.log2(Math.max(1e-6, LT.floor ?? 0.001));
      lu.ltEps.value = LT.eps ?? 0.2;
      lu.ltPull.value = LT.pull ?? 0;
      lu.ltPullLo.value = Math.log2(Math.max(1e-5, LT.pullLo ?? 1));
      lu.ltPullHi.value = Math.log2(Math.max(1e-5, LT.pullHi ?? 2));
      lu.ltSpread.value = LT.spread ?? 1;
      const TC = E.tone || {};
      lu.clip.value = TC.clip ?? 2;
      lu.knee.value = TC.knee ?? 0.5;
      lens?.update(renderer);

      u.focus.value = Math.max(0.01, (focus ?? 0.8) + E.dof.focusOffset);
      u.focalLength.value = Math.max(0.01, E.dof.focalLength);
      // the bokeh is in texels of the image DOF runs on: scale it to a 1600 px wide
      // frame, so the blur is the same angle at any size and DPR (the photo:
      // 24 mm eq at f/1.78 focused on the glass blurs the far trees about 5 px
      // across at 1600 px, the monitor under 2 px)
      const dofW = _size.x * (on.dof ? scale : 1);
      u.bokeh.value = E.dof.bokehScale * (dofW / 1600);
      u.cocSpread.value = Math.max(0.25, dofW / 1600);
      u.grain.value = E.grain.enabled ? E.grain.amount : 0;
      u.final.value = Math.max(0, Math.min(1, final));
      pageOnScreen(bg);
      u.bg.value.set(bg[0], bg[1], bg[2]);
      u.seed.value = seed;

      // the air
      u.vol.value = skip.air ? 0 : E.volume.strength;
      u.volBlur.value = E.volume.blur / 4;
      const steps = T ? Math.min(E.volume.steps, T.volumeSteps) : scaled ? Math.min(E.volume.steps, E.hiDpi.volumeSteps) : E.volume.steps;
      air.material.steps = Math.max(2, steps | 0);
      air.update({
        t: bus.time ?? 0,
        lamp: bus.lamp,
        winLum: bus.window?.lum ?? 0,
        winColor: bus.window?.color ?? [1, 1, 1],
        opening: bus.opening,
        flash: bus.flash,
        flashColor: bus.flashColor ?? [1, 1, 1],
      });

      // the grade and the camera's exposure (light/exposure.js "the two
      // exposures"): the image is exposed at E_render; the physical lights carry
      // G = E_true / E_render, handed to the rig and the sky for the next frame
      const Gp = P.grade;
      const X = P.exposure;
      camera.updateMatrixWorld();
      const cam = cameraExposure(P, bus, camera);
      const Ex = cam.Erender;
      bus.exposure = Ex;
      bus.camera = { ev100: +cam.ev100.toFixed(3), exposure: +cam.Etrue.toFixed(5), exposureRender: +Ex.toFixed(5), lightGain: +cam.G.toFixed(4), key: +cam.key.toFixed(5), shot: cam.shot, unitCd: X.camera?.unitCd ?? null };
      setLightGain(P, cam.G);
      g.exposure.value = Ex;
      // the veil: a share of the frame's mean light as it reaches the lens (the
      // key is metered in physical light; the image's physical light carries G)
      const fl = X.flare.amount * (bus.keyImage ?? bus.key);
      bus.flare = fl;
      g.flare.value.setRGB(X.flare.color[0] * fl, X.flare.color[1] * fl, X.flare.color[2] * fl);
      // the hour's white point (a look's grade.hourWB, 0 in Photo-true): a
      // cinematographer's cue, cool in the clear morning and warm in the
      // afternoon, neutral at noon and left to the sky in the golden hour
      const HW = Gp.hourWB;
      let wr = 1, wg = 1, wbl = 1;
      if (HW && (HW.amount ?? 0) > 0) {
        const tod = bus.tod ?? 12, alt = bus.sunAlt ?? 30;
        const day = sm(2, 12, alt);
        // the afternoon's warmth hands over to the golden hour's own below 16 deg
        const am = (1 - sm(10, 12, tod)) * day, pm = sm(12.5, 15, tod) * sm(8, 16, alt);
        const k = HW.amount;
        wr = 1 + k * (am * (HW.morning[0] - 1) + pm * (HW.afternoon[0] - 1));
        wg = 1 + k * (am * (HW.morning[1] - 1) + pm * (HW.afternoon[1] - 1));
        wbl = 1 + k * (am * (HW.morning[2] - 1) + pm * (HW.afternoon[2] - 1));
      }
      g.wb.value.set(Gp.whiteBalance[0] * wr, Gp.whiteBalance[1] * wg, Gp.whiteBalance[2] * wbl);
      // the hour's light (a look's grade.hour; none in Photo-true). Through a north
      // window the sky's brightness barely changes from 09:00 to 15:00 and the
      // camera evens out what does (round 3: 09, 12 and 15 were 5 to 6/255
      // apart), so the hour is carried the way a cinematographer carries it: the
      // clear morning crisper and a touch more saturated, the high sun bleaching
      // the view (brighter, paler, flatter), the afternoon warm (hourWB above)
      const HG = Gp.hour;
      let hExp = 1, hSat = 1, hCon = 1;
      if (HG) {
        const alt = bus.sunAlt ?? 30, tod = bus.tod ?? 12;
        const noon = sm(HG.noonFrom ?? 45, HG.noonTo ?? 70, alt);
        const am = (1 - sm(10, 11.5, tod)) * sm(8, 20, alt) * (1 - noon);
        hExp = Math.pow(2, (HG.noonEV ?? 0) * noon);
        hSat = 1 - (HG.noonDesat ?? 0) * noon + (HG.amSat ?? 0) * am;
        hCon = 1 - (HG.noonFlat ?? 0) * noon + (HG.amContrast ?? 0) * am;
      }
      g.exposure.value = Ex * hExp;
      g.saturation.value = Gp.saturation * hSat;
      g.contrast.value = Gp.contrast * hCon;
      g.mid.value = Gp.mid;
      g.lift.value = Gp.lift;
      g.dispSat.value = Gp.displaySaturation ?? 1;
      g.gamma.value = Gp.gamma;
      g.vignette.value = Gp.vignette;
      g.vignetteRound.value = Gp.vignetteRound;
      // the hue band and the split tone (read only where built)
      const HB = Gp.hueBand || {};
      g.hbAmt.value = HB.amount ?? 0;
      g.hbCentre.value = (HB.centre ?? 128) * D2R;
      g.hbHalf.value = (HB.half ?? 22) * D2R;
      g.hbFeather.value = Math.max(1e-3, (HB.feather ?? 20) * D2R);
      g.hbAngle.value = (HB.angle ?? 0) * D2R;
      g.hbSatLo.value = HB.satLo ?? 0;
      g.hbSatHi.value = Math.max(g.hbSatLo.value + 1e-4, HB.satHi ?? 0);
      const SP = Gp.split || {};
      const unitTint = (t, out) => {
        const r = t?.[0] ?? 1, gg = t?.[1] ?? 1, b = t?.[2] ?? 1;
        const l = Math.max(1e-5, 0.2126 * r + 0.7152 * gg + 0.0722 * b);
        out.set(r / l, gg / l, b / l);
      };
      unitTint(SP.shadow, g.spShadow.value);
      unitTint(SP.high, g.spHigh.value);
      g.spShadowAmt.value = SP.shadowAmount ?? 0;
      g.spHighAmt.value = SP.highAmount ?? 0;
      g.spLo.value = SP.lo ?? 0.02;
      g.spLoTo.value = Math.max((SP.lo ?? 0.02) + 1e-4, SP.loTo ?? 0.2);
      g.spHi.value = SP.hi ?? 0.45;
      g.spHiTo.value = Math.max((SP.hi ?? 0.45) + 1e-4, SP.hiTo ?? 0.9);
      g.spSatLo.value = SP.keepSat?.[0] ?? 10;
      g.spSatHi.value = Math.max(g.spSatLo.value + 1e-4, SP.keepSat?.[1] ?? 11);
      // the tone map's statistics are taken in exposed units, before the grade's
      // saturation and contrast (which move luminance little)
      const wbL = 0.2126 * Gp.whiteBalance[0] + 0.7152 * Gp.whiteBalance[1] + 0.0722 * Gp.whiteBalance[2];
      lu.ltGain.value = Ex * hExp * wbL;
      lu.glareGain.value = Ex * hExp * wbL;
      bus.debug.tier = P.quality ?? null;
      bus.debug.sceneScale = +scale.toFixed(3);
      publishDebug(bus);
    },
    render() {
      rp.render();
    },
    dispose() {
      disposeNodes();
      air.dispose();
      rp.dispose();
      sp.dispose?.();
      vp.dispose?.();
    },
  };
  return api;
}
