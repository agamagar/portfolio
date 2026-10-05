// WebGPURenderer for the window scene (three r186, three/webgpu), with the
// automatic WebGL2 fallback. ?backend=webgl2 forces the fallback (forceWebGL).
//
// Antialias is off: TRAA does it (post.js), and a WebGPU compatibility-mode
// device could not multisample anyway (10-r186.md 2.1). The canvas is opaque:
// the hand-off matches colours, it never punches a hole.

import * as THREE from "three/webgpu";

export const TONE_MAPPINGS = {
  agx: THREE.AgXToneMapping,
  neutral: THREE.NeutralToneMapping,
  aces: THREE.ACESFilmicToneMapping,
  none: THREE.NoToneMapping,
};

// Phones and small screens get the lighter tier (20-question Q16: DPR 1.5).
export function isMobileTier() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  const vv = window.visualViewport;
  const w = vv ? vv.width : window.innerWidth;
  const h = vv ? vv.height : window.innerHeight;
  return !!coarse || Math.min(w, h) < 600;
}

export async function createRenderer({ canvas, backend = "auto", params, trackTimestamp = false }) {
  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias: false,
    alpha: false,
    forceWebGL: backend === "webgl2",
    trackTimestamp,
    powerPreference: "high-performance",
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // soft in r186; softness is light.shadow.radius
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 1);

  const mobile = isMobileTier();
  let size = { w: 1, h: 1, dpr: 1 };

  const api = {
    renderer,
    mobile,
    backend: "webgpu",
    applyParams(P) {
      const R = P.renderer;
      renderer.toneMapping = TONE_MAPPINGS[R.toneMapping] ?? THREE.AgXToneMapping;
      renderer.toneMappingExposure = R.exposure;
      const cap = mobile ? R.dprMaxMobile : R.dprMax;
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, cap);
      if (dpr !== size.dpr) api.setSize(size.w, size.h, dpr);
    },
    setSize(w, h, dpr = size.dpr) {
      size = { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)), dpr };
      renderer.setPixelRatio(dpr);
      renderer.setSize(size.w, size.h, false); // CSS size comes from the stylesheet
    },
    get size() {
      return size;
    },
    dispose() {
      try {
        renderer.setAnimationLoop(null);
      } catch {
        /* not initialised */
      }
      renderer.dispose();
    },
  };

  api.applyParams(params);
  await renderer.init();
  api.backend = renderer.backend.isWebGPUBackend ? "webgpu" : "webgl2";
  return api;
}
