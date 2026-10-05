// The calm field (loop 2, gap C1: "the p = 0 frame fights the page text"). The
// core lane owns it.
//
// Where the page's text sits over the scene (the greeting and the timeline at the
// top of the folio page), the frame is quietened, and only there, only near the top
// of the runway: an extra defocus (the scene seen through a shallower lens) and a
// local tone compression toward the field's own mean light (the bright glass comes
// down, the dark stiles come up), feathered so there is no box to see. It is a
// property of the image, not a scrim: no colour is added, the hour and the weather
// still read through it.
//
// It wraps the post pipeline's final (display-space) output node from the engine,
// so post.js is untouched: a quarter-resolution copy of the finished frame is
// blurred twice (the defocus, and a wide one for the local mean), and the full
// resolution composite mixes them in under a mask built from the text boxes.
//
// The boxes: the page passes its real text rects (engine.setCalmBoxes, CSS px of
// the canvas); until it does (the sandbox, capture), params.calm.boxes holds the
// folio page's measured boxes (tools/window-light/spec/12-folio-page-scroll.md 2)
// as fractions of the viewport, one set for landscape and one for portrait.

import * as THREE from "three/webgpu";
import { rtt, uniform, uniformArray, vec2, vec3, vec4, float, screenUV, screenCoordinate, smoothstep, max, min, mix, dot, fract, Fn } from "three/tsl";
import { gaussianBlur } from "three/addons/tsl/display/GaussianBlurNode.js";

export const MAX_BOXES = 4;

const lum = (c) => dot(c, vec3(0.2126, 0.7152, 0.0722));

// Hoskins' hash, 0..1 (the same family as post.js's grain)
function hash12(p) {
  const p3 = fract(vec3(p.x, p.y, p.x).mul(0.1031));
  const q = p3.add(dot(p3, p3.yzx.add(33.33)));
  return fract(q.x.add(q.y).mul(q.z));
}

export function createCalm() {
  const u = {
    strength: uniform(0), // 0..1, by runway progress (engine)
    defocus: uniform(0.85), // share of the blurred copy inside the field
    contrast: uniform(0.5), // exponent on (L / L_mean) inside the field (1 = none)
    lift: uniform(0), // display-space pull of the field's mean toward `level`
    level: uniform(0.5),
    liftDir: uniform(0), // -1: the lift only darkens, +1: only lightens, 0: both
    grain: uniform(0.02), // grain put back into the defocused field (display units)
    seed: uniform(0),
    boxes: uniformArray(new Array(MAX_BOXES).fill(0).map(() => new THREE.Vector4(0, 0, 0, 0)), "vec4"), // x0, y0, x1, y1 in screen UV (y down)
    count: uniform(0), // boxes in use (float: compared against the unrolled index)
    pad: uniform(new THREE.Vector2(0.01, 0.02)), // UV: inside the box, full strength this far out
    feather: uniform(new THREE.Vector2(0.04, 0.06)), // UV: then fades over this
    shapeBand: uniform(1), // 1: a full-width band over the text rows; 0: per box
    band: uniform(new THREE.Vector4(0.25, 0.55, 0.1, 0.1)), // UV: full strength from x to y, feathered over z above and w below
    dirSmall: uniform(1), // blur step multipliers (resolution-independent sizes, set per frame)
    dirWide: uniform(2),
    // the depth gate (2026-09-27, after loop 2's critics): the field acts only on
    // what lies BEYOND the glass (sky, trees, the outside grille), so the room's
    // frame, stiles, bars and handle stay crisp and it reads as optics, not a
    // filter. gatePlane = the world plane z = -gate.z in view space (n.xyz, w; the
    // signed distance n.X + w is positive on the room side); proj = P[0][0], P[1][1]
    useGate: uniform(0),
    gatePlane: uniform(new THREE.Vector4(0, 0, 1, 0)),
    gateSoft: uniform(0.15), // m beyond the plane over which the gate ramps to full
    proj: uniform(new THREE.Vector2(1, 1)),
    dirGate: uniform(1),
  };
  const plane = new THREE.Plane();

  let base = null;
  let wrapped = null;
  let parts = [];

  // the mask. "band" (default): the rows the text occupies, full width, feathered
  // above and below: it reads as a shallow focal plane (the handle and the keyhole
  // below stay sharp, the sky's top row and the moon above stay sharp), not as a
  // patch. "boxes": the max over the boxes of a feathered rectangle (unrolled: no
  // dynamic loop or dynamic uniform-array index on either backend).
  const mask = Fn(() => {
    const p = screenUV;
    const dyb = max(u.band.x.sub(p.y).div(u.band.z), p.y.sub(u.band.y).div(u.band.w)).max(0);
    const kBand = float(1).sub(smoothstep(0, 1, dyb));
    const m = float(0).toVar();
    for (let i = 0; i < MAX_BOXES; i++) {
      const b = u.boxes.element(i);
      const dx = max(b.x.sub(p.x), p.x.sub(b.z)).sub(u.pad.x).max(0);
      const dy = max(b.y.sub(p.y), p.y.sub(b.w)).sub(u.pad.y).max(0);
      const k = float(1).sub(smoothstep(0, 1, dx.div(u.feather.x))).mul(float(1).sub(smoothstep(0, 1, dy.div(u.feather.y))));
      m.assign(max(m, u.count.greaterThan(i).select(k, float(0))));
    }
    return u.shapeBand.greaterThan(0.5).select(u.count.greaterThan(0).select(kBand, float(0)), m);
  });

  // viewZ: the scene pass's view-space depth node (post.scenePass.getViewZNode());
  // without it the field acts on every pixel, as before.
  function wrap(outNode, { viewZ = null } = {}) {
    dispose();
    base = outNode;
    // the finished frame at a quarter of the buffer, blurred twice
    const small = rtt(outNode, null, null, { resolutionScale: 0.25 });
    const soft = gaussianBlur(small, u.dirSmall, 4);
    // the local mean: a wide Gaussian at a sixteenth of the buffer (23 taps, so a
    // mean hundreds of px wide is sampled densely, not in blotches)
    const wide = gaussianBlur(soft.getTextureNode(), u.dirWide, 10, { resolutionScale: 0.25 });
    parts = [small, soft, wide];
    // the depth gate at a quarter of the buffer, softened a few px: a per-pixel test
    // after TAAU would flip with the jitter along every bar edge and shimmer
    let gateTex = null;
    if (viewZ) {
      const gateNode = Fn(() => {
        const uv = screenUV;
        const ray = vec3(uv.x.mul(2).sub(1).div(u.proj.x), float(1).sub(uv.y.mul(2)).div(u.proj.y), -1);
        const d = viewZ.negate().mul(dot(u.gatePlane.xyz, ray)).add(u.gatePlane.w);
        return vec4(vec3(smoothstep(0, u.gateSoft, d.negate())), 1);
      })();
      const gSmall = rtt(gateNode, null, null, { resolutionScale: 0.25 });
      const gSoft = gaussianBlur(gSmall, u.dirGate, 2);
      parts.push(gSmall, gSoft);
      gateTex = gSoft.getTextureNode();
    }
    const node = Fn(() => {
      const src = outNode.toVar();
      const gate = gateTex ? mix(float(1), gateTex.sample(screenUV).r, u.useGate) : float(1);
      const k = mask().mul(u.strength).mul(gate).toVar();
      const out = src.rgb.toVar();
      // a uniform branch: the rest of the runway pays three texture reads, no more
      const hit = k.greaterThan(0.0005);
      const blurred = soft.getTextureNode().sample(screenUV).rgb;
      const mean = wide.getTextureNode().sample(screenUV).rgb;
      // defocus (0 by default since 2026-09-27: the camera's own depth of field
      // softens the far field instead, params.calm.farBokeh; a screen-space blur here
      // smeared the crisp frame into a band)
      const x = mix(src.rgb, blurred, k.mul(u.defocus));
      // local compression around the field's own mean light, on luminance (hue
      // kept), then the mean moved toward the theme's level by `lift`
      const Lx = lum(x).max(1e-4);
      const Lm = lum(mean).max(1e-4);
      // one-sided: a dark theme's veil only ever darkens (a night field is left as
      // it is), a light theme's only ever lightens
      const Lpull = mix(Lm, u.level, u.lift.mul(k));
      const Lt = u.liftDir.lessThan(-0.5).select(min(Lpull, Lm), u.liftDir.greaterThan(0.5).select(max(Lpull, Lm), Lpull)).max(1e-4);
      const Ly = Lt.mul(Lx.div(Lm).pow(mix(float(1), u.contrast, k)));
      const y = x.mul(Ly.div(Lx));
      // the grain the defocus took out, put back (a 2 x 2 average of a hash)
      const c = screenCoordinate.xy.add(vec2(u.seed.mul(17.3), u.seed.mul(29.1)));
      const n = hash12(c).add(hash12(c.add(vec2(1, 0)))).add(hash12(c.add(vec2(0, 1)))).add(hash12(c.add(vec2(1, 1)))).mul(0.25).sub(0.5).mul(2);
      const g = n.mul(u.grain).mul(k.mul(u.defocus));
      out.assign(hit.select(y.add(g), src.rgb));
      return vec4(out, src.a);
    })();
    wrapped = node;
    return node;
  }

  function dispose() {
    for (const n of parts) {
      try {
        n?.dispose?.();
      } catch {
        /* gone */
      }
    }
    parts = [];
    base = wrapped = null;
  }

  // Per frame. C: params.calm; boxes: CSS px rects [{x0,y0,x1,y1}] from the page or
  // null (params' defaults); view: { w, h, dpr } CSS px; k: 0..1 strength by p.
  function update(C0, { boxes, view, k, seed = 0, grainAmount = 0.02, theme = "light", look = null, camera = null }) {
    // a look's own overrides (params.calm.looks[look]) over the base
    const C = look && C0?.looks?.[look] ? { ...C0, ...C0.looks[look] } : C0 || {};
    const on = C?.enabled !== false;
    // the page theme's own pull (params.calm.themes): the field's mean moves toward
    // a level the theme's text reads on
    const T = C.themes?.[theme] || {};
    u.strength.value = on ? Math.max(0, Math.min(1, k)) * (C.strength ?? 1) : 0;
    u.defocus.value = C.defocus ?? 0.85;
    u.contrast.value = T.contrast ?? C.contrast ?? 0.5;
    u.lift.value = T.lift ?? C.lift ?? 0;
    u.level.value = T.level ?? C.level ?? 0.5;
    u.liftDir.value = T.dir === "down" ? -1 : T.dir === "up" ? 1 : 0;
    u.grain.value = (C.grain ?? 1) * grainAmount;
    u.seed.value = seed;
    const w = Math.max(1, view.w), h = Math.max(1, view.h);
    let rects = boxes;
    if (!rects || !rects.length) {
      const portrait = w / h < (C.portraitBelow ?? 0.8);
      const src = (portrait ? C.boxes?.portrait : C.boxes?.landscape) || [];
      rects = src.map(([x0, y0, x1, y1]) => ({ x0: x0 * w, y0: y0 * h, x1: x1 * w, y1: y1 * h }));
    }
    const n = Math.min(MAX_BOXES, rects.length);
    for (let i = 0; i < MAX_BOXES; i++) {
      const r = rects[i];
      if (i < n && r) u.boxes.array[i].set(r.x0 / w, r.y0 / h, r.x1 / w, r.y1 / h);
      else u.boxes.array[i].set(0, 0, 0, 0);
    }
    u.count.value = n;
    // sizes are CSS px at a 1440 px wide viewport, scaled by (w / 1440) ^ sizeExp:
    // on a 390 px phone the same absolute blur is four times larger relative to the
    // frame and turned the whole hero to murk (loop 2)
    const ks = Math.pow(w / (C.sizeRef ?? 1440), C.sizeExp ?? 0.5);
    const px = (v, d) => (v ?? d) * ks;
    u.pad.value.set(px(C.pad, 24) / w, px(C.pad, 24) / h);
    u.feather.value.set(px(C.feather, 72) / w, px(C.feather, 72) / h);
    u.shapeBand.value = (C.shape ?? "band") === "band" ? 1 : 0;
    if (n) {
      let top = Infinity, bottom = -Infinity;
      for (let i = 0; i < n; i++) {
        top = Math.min(top, rects[i].y0);
        bottom = Math.max(bottom, rects[i].y1);
      }
      const pad = px(C.pad, 24);
      u.band.value.set((top - pad) / h, (bottom + pad) / h, Math.max(1, px(C.featherTop ?? C.feather, 72)) / h, Math.max(1, px(C.featherBottom ?? C.feather, 72)) / h);
    }
    // blur sizes: the quarter-res copy has a texel of 4 / dpr CSS px; the blur node's
    // Gaussian (sigma param 4) spans about 3.7 texels per unit direction, the wide
    // one (sigma param 10, a further quarter) about 7.7 texels of 16 / dpr CSS px
    const dpr = Math.max(0.5, view.dpr || 1);
    u.dirSmall.value = Math.max(0.25, px(C.defocusPx, 10) / ((3.7 * 4) / dpr));
    u.dirWide.value = Math.max(0.25, px(C.meanPx, 90) / ((7.7 * 16) / dpr));
    // the depth gate: the world plane z = -gate.z (the glass is z = 0, the outside
    // negative z) carried into view space; its blur is about 1.85 quarter-res texels
    // per unit direction at sigma param 2
    const Gt = C.gate || {};
    u.useGate.value = camera && Gt.enabled !== false ? 1 : 0;
    if (camera) {
      camera.updateMatrixWorld();
      plane.normal.set(0, 0, 1);
      plane.constant = Gt.z ?? 0.3;
      plane.applyMatrix4(camera.matrixWorldInverse);
      u.gatePlane.value.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
      const e = camera.projectionMatrix.elements;
      u.proj.value.set(e[0], e[5]);
      u.gateSoft.value = Gt.soft ?? 0.15;
      u.dirGate.value = Math.max(0.25, px(Gt.softPx, 6) / ((1.85 * 4) / dpr));
    }
  }

  return {
    uniforms: u,
    wrap,
    update,
    get base() {
      return base;
    },
    get wrapped() {
      return wrapped;
    },
    dispose,
  };
}
