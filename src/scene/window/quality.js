// The quality tier: params.quality = "high" | "mid" | "low", picked ONCE at start
// (after renderer.init(), before anything is built) from the backend, the GPU and
// the viewport. Every lane reads params.quality for its own cost:
//   engine   the drawing buffer's DPR cap and the sky plate (params.core.js
//            qualityTiers, applied here as a params layer)
//   light    the scene pass's internal density with TAAU, the air, AO, bloom, DOF
//            (post.js, POST_PARAMS.tiers)
//   room     materials (materials.js), outside: canes, leaves, cards (their modules)
//
// Budgets (orchestrator, 2026-09-27), wall-clock ms per frame measured uncapped with
// stats() at 1440 x 900 on the M3 Pro: high <= 10 (DPR 2, the pass below it, TAAU up),
// mid <= 6 (DPR 1), low <= 4 (the phone tier).
//
// The WebGL2 policy (loop 2, C3). The fallback backend runs the same frame 50 to
// 100 % slower on the M3 Pro (loop 1 final: high 19.9, mid 12.1, low 6.3 ms at the
// p = 0 hero, against WebGPU's 13.0, 7.9, 4.2), and whoever lands on it has either
// no WebGPU (an older Safari or Firefox) or a blocklisted GPU. So WebGL2 is capped
// at "low" on every device, with its own budget: 8 ms at the p = 0 hero (a 60 Hz
// frame with half of it left for the page). ?quality= still pins any tier, and
// capture mode still renders "high" on either backend, so the two backends stay
// comparable pixel for pixel.
export const BUDGETS_MS = {
  webgpu: { high: 10, mid: 6, low: 4 },
  webgl2: { low: 8 },
};

// Overrides, strongest last: the pick below; ?quality=high|mid|low; ?set=quality:x.
// Capture mode (?capture=1) never auto-picks: it renders "high" unless the URL names
// a tier, so a capture is the same on every machine.

export const QUALITY_NAMES = ["high", "mid", "low"];

export function normalizeQuality(q) {
  return QUALITY_NAMES.includes(q) ? q : null;
}

// What the GPU says about itself. WebGPU: GPUDevice.adapterInfo (Chrome 128+).
// WebGL2: the unmasked renderer string where the browser exposes it.
export function gpuInfo(renderer) {
  const out = { backend: renderer?.backend?.isWebGPUBackend ? "webgpu" : "webgl2", vendor: "", architecture: "", description: "", fallback: false, compat: false };
  try {
    const b = renderer.backend;
    if (b.isWebGPUBackend) {
      const i = b.device?.adapterInfo || {};
      out.vendor = String(i.vendor || "");
      out.architecture = String(i.architecture || "");
      out.description = String(i.description || i.device || "");
      out.fallback = !!i.isFallbackAdapter;
      out.compat = !!b.compatibilityMode;
    } else {
      const gl = b.gl;
      const ext = gl?.getExtension("WEBGL_debug_renderer_info");
      out.description = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER) || "");
      out.vendor = String(ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : "");
    }
  } catch {
    /* no info: the viewport rules still apply */
  }
  return out;
}

// The pick. Pure: the same inputs give the same tier, and `why` says which rule won.
//   gpu       gpuInfo(renderer)
//   viewport  { w, h } CSS px, dpr, coarse (pointer: coarse)
//   device    { cores, memory, saveData }
export function pickQuality({ gpu = {}, viewport = {}, device = {} } = {}) {
  const w = viewport.w || 1440, h = viewport.h || 900;
  const text = `${gpu.vendor} ${gpu.architecture} ${gpu.description}`.toLowerCase();
  const software = gpu.fallback || /swiftshader|llvmpipe|software|basic render|microsoft basic/.test(text);
  const phone = !!viewport.coarse || Math.min(w, h) < 600;
  if (software) return { quality: "low", why: "software renderer" };
  if (phone) return { quality: "low", why: "phone or small viewport" };
  if (device.saveData) return { quality: "low", why: "save-data" };
  const weakDevice = (device.memory && device.memory <= 4) || (device.cores && device.cores <= 4);
  const integrated = /intel|mali|adreno|powervr|uhd|iris/.test(text) && !/arc a/.test(text);
  if (gpu.backend === "webgl2") return { quality: "low", why: "webgl2 fallback (capped at low, own budget 8 ms)" };
  if (weakDevice || integrated) return { quality: "mid", why: "integrated gpu or small device" };
  // Apple silicon reports only "apple" / "metal-N": the base chips (8 or fewer
  // CPU cores) have half the GPU of a Pro, so they take mid
  if (/apple/.test(text) && device.cores && device.cores < 10) return { quality: "mid", why: "apple base chip" };
  // big viewports: the high tier's pass is 1.4 px per CSS px, so its cost grows
  // with the CSS area (1440 x 900 is 1.3 MP; above 2.2 MP it would miss 10 ms)
  if (w * h > 2.2e6) return { quality: "mid", why: "large viewport" };
  return { quality: "high", why: "desktop gpu" };
}

// Everything the browser knows at start, for pickQuality.
export function probeViewport() {
  if (typeof window === "undefined") return { viewport: {}, device: {} };
  const vv = window.visualViewport;
  return {
    viewport: {
      w: vv ? vv.width : window.innerWidth,
      h: vv ? vv.height : window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      coarse: !!window.matchMedia?.("(pointer: coarse)").matches,
    },
    device: {
      cores: navigator.hardwareConcurrency || 0,
      memory: navigator.deviceMemory || 0,
      saveData: !!navigator.connection?.saveData,
    },
  };
}
