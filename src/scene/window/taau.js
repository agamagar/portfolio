// Resting TAAU: three r186's TAAUNode (examples/jsm/tsl/display/TAAUNode.js) with
// resting supersampling and an output-only sharpen. The core lane owns it
// (loop 2, gap C2: "not high definition at 1:1").
//
// Why a fork. Three's TAAU reconstructs every frame with a Gaussian sized in INPUT
// pixels (sigma 0.47 input px, so 0.81 output px on the high tier, where the scene
// pass is 0.575 of the DPR 2 buffer) and blends it into the history at a fixed
// 0.025. Two things follow: the history can never be sharper than the input grid
// (DPR 2 carried the same detail as DPR 1), and a 32-frame capture is only 55 %
// converged from the seed, a bilinear upscale of one aliased frame (measured
// round 3: 0.83 detail at DPR 2 against 1.42 at DPR 1).
//
// What changes, per pixel:
//   moving (the camera scrolls, a cane sways, a pixel was just disoccluded)
//     three's TAAU exactly: wide reconstruction, variance clip, flicker reduction
//   at rest (valid history, no depth change, under `still` output px of motion)
//     a weighted running mean at the OUTPUT resolution: each frame's samples count
//     by a narrow Gaussian of their distance to the output pixel's centre in OUTPUT
//     px (sigma 0.45 px), and the history carries its accumulated weight (the lock
//     target's green channel), so a sample that lands on the pixel counts fully and
//     one that lands 0.8 px away barely at all. As the 32 Halton offsets fill the
//     output grid the pixel converges to a 2 px per CSS px supersample. The weight
//     is capped (maxWeight): live, about 40 frames of memory, as responsive as
//     three's 0.025; capture, effectively unbounded (a true mean of every frame).
//     The history is clipped to the neighbourhood's min and max live (a lightning
//     flash or a theme swap still lands at once); capture does not clip (the scene
//     is frozen, and the box would clip real sub-input-pixel detail).
//   coming to rest, the history counts as `seed` samples, so the image sharpens
//   over about 0.1 s instead of popping
// Then an output-only sharpen (never fed back into the history): an unsharp mask
// on the cross neighbourhood in a luminance-compressed space, clamped to the
// neighbourhood's range so it cannot ring. A phone sharpens every photo; the
// reference's own detail (2.68 on the round trip metric) includes it.
//
// The velocity fix (a cause of the soft 1:1, on both AA paths). three's TAA nodes
// hand the velocity pass the unjittered projection only from their before-render
// hook, and that hook is registered while the pipeline's output material is built,
// which is INSIDE the pipeline's first render. So every scene material compiled on
// that first frame (all of them: the engine's warm frame) bakes the camera's own,
// jittered, projection into its velocity, and a static pixel moves by the jitter
// every frame (measured: 0.4 to 0.9 output px). The history was then resampled at
// a random offset each frame (a blur that never converges), and nothing was ever
// "at rest". Here every material references ONE matrix, UNJITTERED, which the
// engine updates after posing the camera (syncUnjittered) and both AA nodes keep
// current and never clear; traa() below wraps three's TRAANode the same way. It
// also removes a stale-matrix hazard: a pipeline rebuild (a look switch) used to
// leave materials compiled under the old node pointing at its frozen matrix.
//
// The engine sets the shared uniforms below every frame from params.supersample
// (params.core.js) and the capture flag; post.js builds the nodes with taau() and
// traa() as before (only its import points here).

import { HalfFloatType, Vector2, RenderTarget, RendererUtils, QuadMesh, NodeMaterial, TempNode, NodeUpdateType, Matrix4, DepthTexture, FloatType } from "three/webgpu";
import {
  exp,
  float,
  Fn,
  max,
  min,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
  luminance,
  convertToTexture,
  passTexture,
  velocity,
  ivec2,
  mix,
  property,
  outputStruct,
  context,
  OnBeforeRenderPipeline,
  OnAfterRenderPipeline,
} from "three/tsl";
import { clipAABB, computeHaltonOffsets, flickerReduction, sampleCurrentDepth, samplePreviousDepth } from "three/addons/tsl/utils/TAAUtils.js";
import { traa as threeTraa } from "three/addons/tsl/display/TRAANode.js";

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();
let _rendererState;

// The one unjittered projection every scene material's velocity reads.
export const UNJITTERED = new Matrix4();

// The engine: after posing the camera (its view offset is clear at that point),
// before the pipeline renders. Binds the velocity pass to UNJITTERED from the very
// first frame on.
export function syncUnjittered(camera) {
  UNJITTERED.copy(camera.projectionMatrix);
  if (velocity.projectionMatrix !== UNJITTERED) velocity.setProjectionMatrix(UNJITTERED);
}

// Shared by every instance (post.js rebuilds the node when its signature changes;
// the engine keeps writing these).
export const restUniforms = {
  enabled: uniform(1), // 0: three's TAAU as shipped
  kNarrow: uniform(1 / (2 * 0.45 * 0.45)), // exp(-k d^2), d in output px: sigma 0.45 px
  maxWeight: uniform(16), // accumulated weight cap (live); capture sets it far higher
  seed: uniform(2), // weight the history carries when a pixel comes to rest
  still: uniform(0.02), // output px of motion under which a pixel is at rest
  clip: uniform(1), // 1: clip the resting history to the neighbourhood's min / max
  sharpen: uniform(0.25), // output-only unsharp amount, 0 = none
  hold: uniform(0), // 1: resting pixels show the current frame and keep no weight (capture's settling frames)
};

// params.supersample (params.core.js) and the capture flag into the uniforms.
export function applySupersample(S = {}, { capture = false, hold = false } = {}) {
  const U = restUniforms;
  U.enabled.value = S.enabled === false ? 0 : 1;
  const s = Math.max(0.2, S.sigma ?? 0.45);
  U.kNarrow.value = 1 / (2 * s * s);
  U.maxWeight.value = capture ? S.maxWeightCapture ?? 4096 : S.maxWeight ?? 16;
  U.seed.value = S.seed ?? 2;
  U.still.value = S.still ?? 0.02;
  U.clip.value = capture ? (S.clipCapture ? 1 : 0) : S.clip === false ? 0 : 1;
  U.sharpen.value = S.sharpen ?? 0.25;
  U.hold.value = hold ? 1 : 0;
}

class RestingTAAUNode extends TempNode {
  static get type() {
    return "RestingTAAUNode";
  }

  constructor(beautyNode, depthNode, velocityNode, camera) {
    super("vec4");
    this.isTAAUNode = true;
    this.updateBeforeType = NodeUpdateType.FRAME;
    this.beautyNode = beautyNode;
    this.depthNode = depthNode;
    this.velocityNode = velocityNode;
    this.camera = camera;
    this.depthThreshold = 0.0005;
    this.edgeDepthDiff = 0.001;
    this.maxVelocityLength = 128;
    this.currentFrameWeight = 0.025;
    this._jitterIndex = 0;
    this._jitterOffset = uniform(new Vector2());
    this._outputSize = uniform(new Vector2(1, 1));
    // Two histories, ping-ponged (loop 2, C3): each frame resolves from one into
    // the other, so no full-resolution copy is made (three's TAAU copied its resolve
    // into its history every frame). Each has TWO attachments, colour and lock: three
    // resolved into a single one, so its lock output (and here the accumulated
    // weight) was silently dropped and the second texture only ever held zeros
    const hist = (k) => {
      const rt = new RenderTarget(1, 1, { depthBuffer: false, type: HalfFloatType, count: 2 });
      rt.textures[0].name = `RestingTAAU.history${k}.color`;
      rt.textures[1].name = `RestingTAAU.history${k}.lock`;
      return rt;
    };
    this._histories = [hist(0), hist(1)];
    this._prev = 0; // index of the history holding the previous frame
    this._historyRenderTarget = this._histories[0]; // (three's name, for tools)
    // the sharpened image the chain reads (the history keeps the unsharpened one)
    this._outputRenderTarget = new RenderTarget(1, 1, { depthBuffer: false, type: HalfFloatType });
    this._outputRenderTarget.texture.name = "RestingTAAU.output";
    this._previousDepthRenderTarget = new RenderTarget(1, 1, { depthBuffer: false, depthTexture: new DepthTexture() });
    this._previousDepthRenderTarget.depthTexture.name = "RestingTAAU.previousDepth";
    this._resolveMaterials = []; // built in setup(): one per history it reads
    this._seedMaterial = new NodeMaterial();
    this._seedMaterial.name = "RestingTAAU.seed";
    this._sharpenMaterials = []; // built in setup(): one per history it sharpens
    this._textureNode = passTexture(this, this._outputRenderTarget.texture);
    this._originalProjectionMatrix = new Matrix4();
    this._cameraNearFar = uniform(new Vector2());
    this._cameraWorldMatrix = uniform(new Matrix4());
    this._cameraWorldMatrixInverse = uniform(new Matrix4());
    this._cameraProjectionMatrixInverse = uniform(new Matrix4());
    this._previousCameraWorldMatrix = uniform(new Matrix4());
    this._previousCameraProjectionMatrixInverse = uniform(new Matrix4());
    this._previousDepthNode = texture(this._previousDepthRenderTarget.depthTexture);
    this._needsPostProcessingSync = false;
  }

  getTextureNode() {
    return this._textureNode;
  }

  setSize(outputWidth, outputHeight) {
    this._histories[0].setSize(outputWidth, outputHeight);
    this._histories[1].setSize(outputWidth, outputHeight);
    this._outputRenderTarget.setSize(outputWidth, outputHeight);
  }

  // the jitter spans one INPUT pixel (the Halton sequence then fills the output
  // grid over the frames); as three's TAAU
  setViewOffset(inputWidth, inputHeight) {
    this.camera.updateProjectionMatrix();
    this._originalProjectionMatrix.copy(this.camera.projectionMatrix);
    UNJITTERED.copy(this._originalProjectionMatrix);
    velocity.setProjectionMatrix(UNJITTERED);
    const h = _haltonOffsets[this._jitterIndex];
    const jx = h[0] - 0.5, jy = h[1] - 0.5;
    this._jitterOffset.value.set(jx, jy);
    this.camera.setViewOffset(inputWidth, inputHeight, jx, jy, inputWidth, inputHeight);
  }

  clearViewOffset() {
    this.camera.clearViewOffset();
    velocity.setProjectionMatrix(UNJITTERED); // never null: a material built outside the pipeline must not bake the camera's own matrix
    this._jitterIndex = (this._jitterIndex + 1) % _haltonOffsets.length;
  }

  updateBefore(frame) {
    const { renderer } = frame;
    this._previousCameraWorldMatrix.value.copy(this._cameraWorldMatrix.value);
    this._previousCameraProjectionMatrixInverse.value.copy(this._cameraProjectionMatrixInverse.value);
    this._cameraNearFar.value.set(this.camera.near, this.camera.far);
    this._cameraWorldMatrix.value.copy(this.camera.matrixWorld);
    this._cameraWorldMatrixInverse.value.copy(this.camera.matrixWorldInverse);
    this._cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse);

    const beautyRenderTarget = this.beautyNode.isRTTNode ? this.beautyNode.renderTarget : this.beautyNode.passNode.renderTarget;
    const inputWidth = beautyRenderTarget.texture.width;
    const inputHeight = beautyRenderTarget.texture.height;
    const drawingBufferSize = renderer.getDrawingBufferSize(_size);
    const outputWidth = drawingBufferSize.width;
    const outputHeight = drawingBufferSize.height;
    this._outputSize.value.set(outputWidth, outputHeight);

    _rendererState = RendererUtils.resetRendererState(renderer, _rendererState);

    const needsRestart = this._histories[0].width !== outputWidth || this._histories[0].height !== outputHeight;
    this.setSize(outputWidth, outputHeight);
    if (needsRestart === true) {
      renderer.initRenderTarget(this._histories[0]);
      renderer.initRenderTarget(this._histories[1]);
      renderer.initRenderTarget(this._outputRenderTarget);
      renderer.setRenderTarget(this._histories[this._prev]);
      _quadMesh.material = this._seedMaterial;
      _quadMesh.name = "RestingTAAU.seed";
      _quadMesh.render(renderer);
      renderer.setRenderTarget(null);
    }
    if (this._needsPostProcessingSync === true) {
      this.setViewOffset(inputWidth, inputHeight);
      this._needsPostProcessingSync = false;
    }

    // resolve: from the previous history into the other one (which becomes the
    // history the next frame reads; unsharpened)
    const from = this._prev, to = 1 - this._prev;
    renderer.setRenderTarget(this._histories[to]);
    _quadMesh.material = this._resolveMaterials[from];
    _quadMesh.name = "RestingTAAU";
    _quadMesh.render(renderer);
    renderer.setRenderTarget(null);
    this._prev = to;

    // the output the chain reads: sharpened (a copy when the amount is 0 costs the
    // same pass; the amount is a uniform so a change never recompiles)
    renderer.setRenderTarget(this._outputRenderTarget);
    _quadMesh.material = this._sharpenMaterials[this._prev];
    _quadMesh.name = "RestingTAAU.sharpen";
    _quadMesh.render(renderer);
    renderer.setRenderTarget(null);

    const currentDepth = this.depthNode.value;
    const srcW = currentDepth.image !== null && currentDepth.image !== undefined ? currentDepth.image.width : 0;
    const srcH = currentDepth.image !== null && currentDepth.image !== undefined ? currentDepth.image.height : 0;
    if (srcW > 0 && srcH > 0) {
      if (this._previousDepthRenderTarget.width !== srcW || this._previousDepthRenderTarget.height !== srcH) {
        this._previousDepthRenderTarget.setSize(srcW, srcH);
        renderer.initRenderTarget(this._previousDepthRenderTarget);
      }
      const dstDepth = this._previousDepthRenderTarget.depthTexture;
      renderer.copyTextureToTexture(currentDepth, dstDepth);
      this._previousDepthNode.value = dstDepth;
    }

    RendererUtils.restoreRendererState(renderer, _rendererState);
  }

  setup(builder) {
    if (builder.renderPipeline && !builder.context.renderPipelineState.viewOffsetOwner) {
      builder.context.renderPipelineState.viewOffsetOwner = this;
      this._needsPostProcessingSync = true;
      OnBeforeRenderPipeline(() => {
        const rt = this.beautyNode.isRTTNode ? this.beautyNode.renderTarget : this.beautyNode.passNode.renderTarget;
        this.setViewOffset(rt.texture.width, rt.texture.height);
      });
      OnAfterRenderPipeline(() => {
        this.clearViewOffset();
      });
    }
    if (builder.renderer.reversedDepthBuffer === true) {
      this._previousDepthRenderTarget.depthTexture.type = FloatType;
    }

    const U = restUniforms;
    // one resolve per direction (reads history k, the pass renders into the other):
    // fixed bindings, nothing is swapped at run time
    const makeResolve = (historyNode, lockNode, colorOutput, lockOutput) => Fn(() => {
      const uvNode = uv();
      const inputSize = this.beautyNode.size();
      const inputSizeF = vec2(inputSize);
      // output px per input px (1.74 on the high tier at DPR 2)
      const outPerIn = this._outputSize.div(inputSizeF);
      const pIn = uvNode.mul(inputSizeF);
      const closestTapF = pIn.sub(vec2(0.5).add(this._jitterOffset)).round();
      const closestTap = ivec2(closestTapF);

      const currentDepth = sampleCurrentDepth(this.depthNode, closestTapF, this._cameraNearFar);
      const closestDepth = currentDepth.get("closestDepth");
      const closestPositionTexel = currentDepth.get("closestPositionTexel");
      const farthestDepth = currentDepth.get("farthestDepth");

      const offsetUV = this.velocityNode.load(closestPositionTexel).xy.mul(vec2(0.5, -0.5));
      const historyUV = uvNode.sub(offsetUV);
      const previousDepth = samplePreviousDepth(this._previousDepthNode, historyUV, this._previousCameraProjectionMatrixInverse, this._previousCameraWorldMatrix, this._cameraWorldMatrixInverse, this._cameraNearFar, this.camera);

      const isValidUV = historyUV.greaterThanEqual(0).all().and(historyUV.lessThanEqual(1).all());
      const isEdge = farthestDepth.sub(closestDepth).greaterThan(this.edgeDepthDiff);
      const isDisocclusion = closestDepth.sub(previousDepth).greaterThan(this.depthThreshold);
      const hasValidHistory = isValidUV.and(isEdge.or(isDisocclusion.not()));

      const sumColor = vec4(0).toVar();
      const sumWeight = float(0).toVar();
      const sumNarrow = vec4(0).toVar();
      const sumNarrowW = float(0).toVar();
      const moment1 = vec4(0).toVar();
      const moment2 = vec4(0).toVar();
      const cMin = vec4(1e9).toVar();
      const cMax = vec4(-1e9).toVar();
      const offsets = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1],
      ];
      for (const [x, y] of offsets) {
        const tap = closestTap.add(ivec2(x, y));
        const tapCenter = vec2(tap).add(vec2(0.5).add(this._jitterOffset));
        const delta = pIn.sub(tapCenter);
        const w = exp(delta.dot(delta).mul(-2.29));
        const c = this.beautyNode.load(tap).max(0);
        sumColor.addAssign(c.mul(w));
        sumWeight.addAssign(w);
        // the same sample, weighed by its distance in OUTPUT px
        const dOut = delta.mul(outPerIn);
        const wn = exp(dOut.dot(dOut).mul(U.kNarrow).negate());
        sumNarrow.addAssign(c.mul(wn));
        sumNarrowW.addAssign(wn);
        moment1.addAssign(c);
        moment2.addAssign(c.pow2());
        cMin.assign(min(cMin, c));
        cMax.assign(max(cMax, c));
      }
      const currentColor = sumColor.div(sumWeight.max(1e-5));

      const N = float(offsets.length);
      const mean = moment1.div(N);
      const motionFactor = uvNode.sub(historyUV).mul(inputSizeF).length().div(this.maxVelocityLength).saturate();
      const varianceGamma = mix(0.5, 1, motionFactor.oneMinus().pow2());
      const variance = moment2.div(N).sub(mean.pow2()).max(0).sqrt().mul(varianceGamma);
      const minColor = mean.sub(variance);
      const maxColor = mean.add(variance);

      const historyColor = historyNode.sample(historyUV);
      const clippedHistoryColor = clipAABB(mean.clamp(minColor, maxColor), historyColor, minColor, maxColor);

      const currentLuma = luminance(currentColor.rgb);
      const meanLuma = luminance(mean.rgb).toConst();
      const thinFeature = currentLuma.sub(meanLuma).abs().div(meanLuma).smoothstep(0, 0.2);
      const isDepthChanged = closestDepth.sub(previousDepth).abs().greaterThan(this.depthThreshold);
      const canLock = isValidUV.and(isDepthChanged.not());
      const gatedThinFeature = canLock.select(thinFeature, float(0));
      const lockPrev = lockNode.sample(historyUV);
      const decay = isDisocclusion.select(0, 0.5);
      const lock = max(gatedThinFeature, lockPrev.r.mul(decay)).saturate();
      const lockedHistoryColor = mix(clippedHistoryColor, historyColor, lock);

      const currentWeight = float(this.currentFrameWeight).toVar();
      currentWeight.assign(hasValidHistory.select(currentWeight.add(motionFactor).saturate(), 1));
      const moving = flickerReduction(currentColor, lockedHistoryColor, currentWeight);

      // --- at rest: the running mean at the output resolution -------------------
      const motionOut = offsetUV.mul(this._outputSize).length();
      // the history's depth must lie within the current neighbourhood's depth range
      // (not match the closest tap: on a depth edge the closest of the 3 x 3 is the
      // near side while the pixel itself may show the far side, so that test sent
      // every edge pixel, the ones that need it most, down the moving path)
      const depthConsistent = previousDepth.greaterThanEqual(closestDepth.sub(this.depthThreshold)).and(previousDepth.lessThanEqual(farthestDepth.add(this.depthThreshold)));
      const atRest = isValidUV.and(depthConsistent).and(motionOut.lessThan(U.still)).and(U.enabled.greaterThan(0.5));
      const accPrev = lockPrev.g.max(0);
      const narrow = sumNarrow.div(sumNarrowW.max(1e-6));
      // the resting history, clipped to the neighbourhood's range (live) or not
      // (capture); a thin feature's lock keeps it, as on the moving path
      const boxHistory = clipAABB(mean.clamp(cMin, cMax), historyColor, cMin, cMax);
      const restHistory = mix(historyColor, mix(boxHistory, historyColor, lock), U.clip);
      const holding = U.hold.greaterThan(0.5);
      const a = holding.select(float(1), sumNarrowW.div(accPrev.add(sumNarrowW).max(1e-6)));
      const resting = mix(restHistory, narrow, a);
      const accRest = holding.select(float(0), min(accPrev.add(sumNarrowW), U.maxWeight));
      // moving: the history will count as `seed` samples when it comes to rest; a
      // pixel without a valid history counts as none (the first frame after a cut)
      const accMoving = hasValidHistory.select(U.seed, float(0));

      colorOutput.assign(atRest.select(resting, moving));
      lockOutput.assign(vec4(lock, atRest.select(accRest, accMoving), 0, 1));
      return vec4(0);
    });

    const sharedContext = context(builder.getSharedContext());
    this._resolveMaterials = [0, 1].map((k) => {
      const m = new NodeMaterial();
      m.name = `RestingTAAU.resolve.from${k}`;
      const co = property("vec4"), lo = property("vec4");
      m.contextNode = sharedContext;
      m.colorNode = makeResolve(texture(this._histories[k].textures[0]), texture(this._histories[k].textures[1]), co, lo)();
      m.outputNode = outputStruct(co, lo);
      return m;
    });

    {
      const co = property("vec4"), lo = property("vec4");
      this._seedMaterial.colorNode = Fn(() => {
        co.assign(this.beautyNode.sample(uv()));
        lo.assign(vec4(0));
        return vec4(0);
      })();
      this._seedMaterial.contextNode = sharedContext;
      this._seedMaterial.outputNode = outputStruct(co, lo);
    }

    // the output-only sharpen: the cross neighbourhood in a luminance-compressed
    // space (x / (1 + L), so the bright glass does not dominate), clamped to its
    // own range (no ringing), then expanded back
    const makeSharpen = (resolveTex) => Fn(() => {
      const px = ivec2(uv().mul(this._outputSize).floor());
      const lim = ivec2(this._outputSize).sub(1);
      const at = (dx, dy) => {
        const c = resolveTex.load(px.add(ivec2(dx, dy)).clamp(ivec2(0), lim)).rgb.max(0);
        return c.div(luminance(c).add(1));
      };
      const src = resolveTex.load(px);
      const c0 = at(0, 0), cn = at(0, -1), cs = at(0, 1), ce = at(1, 0), cw = at(-1, 0);
      const lo = min(c0, min(min(cn, cs), min(ce, cw)));
      const hi = max(c0, max(max(cn, cs), max(ce, cw)));
      const blur = cn.add(cs).add(ce).add(cw).mul(0.25);
      const sharp = c0.add(c0.sub(blur).mul(U.sharpen)).clamp(lo, hi);
      const Ls = luminance(sharp).min(0.999);
      const outC = sharp.div(float(1).sub(Ls));
      return vec4(mix(src.rgb, outC, U.sharpen.greaterThan(0).select(float(1), float(0))), src.a);
    })();
    // one per history (the frame's fresh resolve is history k)
    this._sharpenMaterials = [0, 1].map((k) => {
      const m = new NodeMaterial();
      m.name = `RestingTAAU.sharpen.of${k}`;
      m.fragmentNode = makeSharpen(texture(this._histories[k].textures[0]));
      return m;
    });
  }

  dispose() {
    super.dispose();
    this._histories[0].dispose();
    this._histories[1].dispose();
    this._outputRenderTarget.dispose();
    this._previousDepthRenderTarget.dispose();
    this._resolveMaterials.forEach((m) => m.dispose());
    this._seedMaterial.dispose();
    this._sharpenMaterials.forEach((m) => m.dispose());
  }
}

const _haltonOffsets = /*@__PURE__*/ computeHaltonOffsets(32);

export default RestingTAAUNode;

// Same signature as three's taau(): post.js imports it from here.
export const taau = (beautyNode, depthNode, velocityNode, camera) => new RestingTAAUNode(convertToTexture(beautyNode), depthNode, velocityNode, camera);

// three's TRAA (the full-resolution path: DPR 1, the mid and low tiers), with the
// velocity bound to UNJITTERED like the node above.
export function traa(beautyNode, depthNode, velocityNode, camera) {
  const n = threeTraa(beautyNode, depthNode, velocityNode, camera);
  const setOffset = n.setViewOffset.bind(n);
  const clearOffset = n.clearViewOffset.bind(n);
  n.setViewOffset = (...args) => {
    setOffset(...args);
    UNJITTERED.copy(n._originalProjectionMatrix);
    velocity.setProjectionMatrix(UNJITTERED);
  };
  n.clearViewOffset = (...args) => {
    clearOffset(...args);
    velocity.setProjectionMatrix(UNJITTERED);
  };
  return n;
}
