// The camera's own processing, as TSL: what the lens and the phone's pipeline do
// to the light that reaches them (post.js wires it; params.post.glare, .localTone,
// .tone in light/params.light.js).
//
//   veiling glare  a linear point spread: every pixel sends a small share of its
//                  light into a tight core (a few px of lens haze beside every bright
//                  edge), a mid halo and a long faint tail (the room grading toward
//                  the window). No threshold: the real PSF scatters everything, the
//                  dark room simply has little to scatter. All three are blurs of a
//                  box-filtered copy of the image whose HEIGHT IS FIXED IN TEXELS, so
//                  the PSF covers the same share of the frame at any DPR and at any
//                  internal render scale.
//   local tone     an edge-aware lift of the shadows and pull of the highlights,
//                  what an iPhone's local tone mapping does: a fast guided filter (He and Sun 2015) on log2
//                  luminance at a fixed small size gives a base layer that follows
//                  every silhouette at full resolution; the base is lifted (up to
//                  `lift` stops below `lo`, nothing above `hi`, fading out again
//                  below `floor` so a switched-off screen stays black), a large
//                  bright region's base (the sky) is pulled down by up to `pull`
//                  stops; the detail (the cloud tops over the sky) rides on top. A blurred veil lifts the darks too, but it smears the bright
//                  glass over the bars; this keeps the bars' edges crisp.
//   phone curve    per channel, linear up to a knee, then a hard quadratic shoulder
//                  that reaches display white at `clip` (exposed scene units) and
//                  clips: the gold cumulus clips to pale yellow the way the phone's
//                  does, where AgX greys it on the way through.

import * as THREE from "three/webgpu";
import { Fn, uniform, uv, vec2, vec3, vec4, float, max, min, mix, dot, log2, exp2, smoothstep, step, select, screenUV, rtt } from "three/tsl";
import { gaussianBlur } from "three/addons/tsl/display/GaussianBlurNode.js";

const LUMA = vec3(0.2126, 0.7152, 0.0722);
const _size = new THREE.Vector2();

// A box-filtered downsample of a texture node: 3 x 3 bilinear taps across one
// output texel (each tap already averages 2 x 2 source texels), so thin bright
// gaps between the bars do not alias into the glare as the camera moves.
function downsample(src, texel) {
  return Fn(() => {
    const t = uv();
    const acc = vec3(0).toVar();
    for (const dy of [-1 / 3, 0, 1 / 3]) {
      for (const dx of [-1 / 3, 0, 1 / 3]) {
        acc.addAssign(src.sample(t.add(texel.mul(vec2(dx, dy)))).rgb);
      }
    }
    return vec4(acc.div(9), 1);
  })();
}

// The share of a pixel's light that scatters: all of it above the threshold
// (exposed units, soft over a factor 1.5), none of it well below. th 0 = linear.
function glareMask(c, u) {
  const l = dot(c, LUMA).mul(u.glareGain);
  return select(u.glareTh.greaterThan(0), smoothstep(u.glareTh, u.glareTh.mul(1.5), l), float(1));
}

// log2 luminance statistics (mean of I and of I^2) of a 2 x 2 block of the source,
// for the guided filter. `gain` puts the source in exposed scene units.
function logStats(src, texel, gain) {
  return Fn(() => {
    const t = uv();
    const sI = float(0).toVar();
    const sII = float(0).toVar();
    for (const dy of [-0.25, 0.25]) {
      for (const dx of [-0.25, 0.25]) {
        const c = src.sample(t.add(texel.mul(vec2(dx, dy)))).rgb;
        const l = log2(max(dot(c, LUMA).mul(gain), 1 / 16384));
        sI.addAssign(l);
        sII.addAssign(l.mul(l));
      }
    }
    return vec4(sI.mul(0.25), sII.mul(0.25), 0, 1);
  })();
}

export function createLensUniforms() {
  return {
    // glare weights (shares of the light scattered into each lobe) and tint
    core: uniform(0),
    mid: uniform(0),
    tail: uniform(0),
    tailSpread: uniform(1),
    midSpread: uniform(1),
    tint: uniform(new THREE.Color(1, 1, 1)),
    glareTh: uniform(0), // exposed units; 0 = everything scatters
    glareGain: uniform(1), // source to exposed units (the exposure)
    // local tone
    ltGain: uniform(1), // source to exposed scene units (exposure x white balance luma)
    ltLift: uniform(0), // stops at most
    ltLo: uniform(-6.5), // log2: full lift below
    ltHi: uniform(-4.0), // log2: no lift above
    ltFloor: uniform(-9), // log2: below it the lift fades out over 2 stops (blacks stay black)
    ltPull: uniform(0), // stops the highlights' base is pulled down at most
    ltPullLo: uniform(0), // log2: no pull below
    ltPullHi: uniform(1), // log2: full pull above
    ltEps: uniform(0.2), // guided filter regulariser (stops^2): below it, texture is detail
    ltSpread: uniform(1),
    // phone curve
    clip: uniform(2),
    knee: uniform(0.5),
    // texel sizes of the small targets (set per frame)
    qTexel: uniform(new THREE.Vector2(1 / 256, 1 / 256)),
    q16Texel: uniform(new THREE.Vector2(1 / 64, 1 / 64)),
    ltTexel: uniform(new THREE.Vector2(1 / 128, 1 / 128)),
  };
}

// Heights in texels of the small targets (fixed, so the PSF and the tone map's
// neighbourhood are the same share of the frame at any size, DPR or tier)
export const LENS_HEIGHTS = { q: 216, q16: 54, lt: 108 };

// Build the lens graph on `src` (a texture node: the anti-aliased image). Returns
// { nodes, glare(hdr), localTone(exposedHdr), update(renderer) }.
export function buildLens(src, u, { glare = true, localTone = true, midSigma = 3, tailSigma = 5 } = {}) {
  const nodes = {};
  nodes.q = rtt(downsample(src, u.qTexel), null, null, { resolutionScale: 0.25 });
  nodes.q.name = "lens q";
  if (glare) {
    // what scatters: the light above the threshold, at q's size
    const qMasked = Fn(() => {
      const c = nodes.q.sample(uv()).rgb;
      return vec4(c.mul(glareMask(c, u)), 1);
    })();
    nodes.qg = rtt(qMasked, null, null, { resolutionScale: 0.25 });
    nodes.qg.name = "lens glare source";
    // kernels in texels of fixed-height targets, dense taps (a sparse, spread
    // kernel aliases the downsample into stripes): the effective sigma is
    // (3 + 2 x sigma) / 3 texels
    nodes.mid = gaussianBlur(nodes.qg, u.midSpread, midSigma); // 3: 3 texels of 216, 1.4% of the frame height
    nodes.q16 = rtt(downsample(nodes.qg, u.q16Texel), null, null, { resolutionScale: 0.0625 });
    nodes.q16.name = "lens q16";
    nodes.tail = gaussianBlur(nodes.q16, u.tailSpread, tailSigma); // 5: 4.3 texels of 54, 8% of the height
  }
  if (localTone) {
    nodes.lq = rtt(logStats(nodes.q, u.ltTexel, u.ltGain), null, null, { resolutionScale: 0.125 });
    nodes.lq.name = "lens log stats";
    nodes.lqBlur = gaussianBlur(nodes.lq, u.ltSpread, 4);
    const m = nodes.lqBlur.getTextureNode();
    const abNode = Fn(() => {
      const s = m.sample(uv());
      const v = max(s.y.sub(s.x.mul(s.x)), 0);
      const a = v.div(v.add(u.ltEps));
      return vec4(a, s.x.mul(float(1).sub(a)), 0, 1);
    })();
    nodes.ab = rtt(abNode, null, null, { resolutionScale: 0.125 });
    nodes.ab.name = "lens guided ab";
    nodes.abBlur = gaussianBlur(nodes.ab, u.ltSpread, 4);
  }

  const api = {
    nodes,
    // scene-linear, before exposure: the direct image loses what it scatters
    glare(hdr) {
      if (!glare) return hdr;
      const core = nodes.qg.sample(screenUV).rgb;
      const mid = nodes.mid.getTextureNode().sample(screenUV).rgb;
      const tail = nodes.tail.getTextureNode().sample(screenUV).rgb;
      const scat = core.mul(u.core).add(mid.mul(u.mid)).add(tail.mul(u.tail)).mul(vec3(u.tint));
      // added only: taking the scattered share back out of the direct image per
      // pixel would, with a threshold, make the image non-monotonic (contour
      // bands where the sky crosses it); the shares are small beside the sky
      return hdr.add(scat);
    },
    // the lift in stops this pixel gets (exposed scene units in, for the debug view)
    lift(c) {
      if (!localTone) return float(0);
      const ab = nodes.abBlur.getTextureNode().sample(screenUV);
      const I = log2(max(dot(c, LUMA), 1 / 16384));
      const base = ab.x.mul(I).add(ab.y);
      const top = float(1).sub(smoothstep(u.ltLo, u.ltHi, base));
      const bottom = smoothstep(u.ltFloor.sub(2), u.ltFloor, base);
      const pull = smoothstep(u.ltPullLo, u.ltPullHi, base).mul(u.ltPull);
      return top.mul(bottom).mul(u.ltLift).sub(pull);
    },
    localTone(c) {
      if (!localTone) return c;
      return c.mul(exp2(api.lift(c)));
    },
    // per frame: the targets' sizes from the drawing buffer's height
    update(renderer) {
      renderer.getDrawingBufferSize(_size);
      const H = Math.max(1, _size.y);
      const set = (n, h, texel) => {
        if (!n) return;
        const s = Math.min(1, h / H);
        if (Math.abs(n.getResolutionScale() - s) > 1e-6) n.setResolutionScale(s);
        texel?.value.set(1 / Math.max(1, Math.floor(_size.x * s)), 1 / Math.max(1, Math.floor(H * s)));
      };
      set(nodes.q, LENS_HEIGHTS.q, u.qTexel);
      set(nodes.qg, LENS_HEIGHTS.q, null);
      set(nodes.q16, LENS_HEIGHTS.q16, u.q16Texel);
      set(nodes.lq, LENS_HEIGHTS.lt, u.ltTexel);
      set(nodes.ab, LENS_HEIGHTS.lt, null);
    },
    dispose() {
      for (const n of Object.values(nodes)) {
        try {
          n?.dispose?.();
        } catch {
          /* gone */
        }
      }
    },
  };
  return api;
}

// The phone's tone curve, per channel (exposed scene-linear in, display-linear out).
export function phoneCurve(x, u) {
  const clip = max(u.clip, 1e-3);
  const xk = clip.mul(u.knee);
  const s = float(2).div(xk.add(clip));
  const c = s.div(clip.sub(xk).mul(2));
  const lin = x.mul(s);
  const d = max(vec3(clip).sub(x), vec3(0));
  const sh = float(1).sub(d.mul(d).mul(c));
  return min(mix(lin, sh, step(vec3(xk), x)), vec3(1));
}
