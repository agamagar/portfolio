// The capture contract (tools/window-light/spec/30-locked-brief.md): the URL
// parameters every tool relies on, and the window.__windowScene hook.
//
//   look      dreamlike | heightened | photo          (default dreamlike)
//   tod       decimal hours in the sky's local time    (default live)
//   wx        live | clear | partly | overcast | rain | storm
//   sky       mine | yours
//   date      YYYY-MM-DD (addition from the weather builder, for repeatable captures)
//   p         0..1 main runway progress; pins the camera, scroll no longer drives it
//   p2        0..1 bookend progress (wins over p when above 0)
//   shot      ref1741: the solved 17:41 framing, vertical FOV 56.8 deg (4:3);
//             ref5480 to ref5484: the 18:39 to 18:40 dusk photos, poses solved
//             from their pane corners and grille bars (3:4 upright; params.camera.shots)
//   t         seconds of ambient time, frozen
//   capture   1: no DOM chrome, fixed seeds, deterministic time, frames only on demand
//   gui       1: the lil-gui tuning panel
//   set       a.b.c:value,d.e:value   any params path
//   backend   webgpu | webgl2 (webgl2 = forceWebGL)
//   theme     light | dark (hand-off colour and poster)
//   view      beauty | normal | ao | emissive | velocity | depth (debug); plate
//             lays the raw sky plate canvas over the page
//   stats     1: GPU timestamps where the backend has them (measureGpu's
//             cross-check and its costliest passes)
//   quality   high | mid | low: pin the quality tier (quality.js; default: picked
//             from the GPU and the viewport at start, "high" in capture mode)

import { overridesFromSearch } from "./weatherBridge.js";
import { normalizeLook } from "./looks.js";
import { parseSet } from "./params.js";
import { normalizeQuality } from "./quality.js";
import { SHOT_NAMES } from "./camera.js";

export const CONTRACT_VERSION = "window-core-1";
export const DEBUG_VIEWS = ["beauty", "normal", "ao", "emissive", "velocity", "depth", "plate"];

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export function parseCaptureParams(search = typeof location !== "undefined" ? location.search : "") {
  const q = new URLSearchParams(search);
  const num = (k) => {
    if (!q.has(k)) return null;
    const v = parseFloat(q.get(k));
    return Number.isFinite(v) ? v : null;
  };
  const capture = q.get("capture") === "1";
  const p = num("p");
  const p2 = num("p2");
  const t = num("t");
  const backend = q.get("backend");
  const theme = q.get("theme");
  const view = q.get("view");
  return {
    capture,
    look: normalizeLook(q.get("look")),
    weather: overridesFromSearch(search), // { tod?, wx?, sky?, date? }
    p: p === null ? (capture ? 0 : null) : clamp01(p),
    p2: p2 === null ? null : clamp01(p2),
    shot: SHOT_NAMES.includes(q.get("shot")) ? q.get("shot") : null,
    t: t === null ? (capture ? 0 : null) : t,
    gui: q.get("gui") === "1",
    set: parseSet(q.get("set")),
    backend: backend === "webgl2" || backend === "webgpu" ? backend : "auto",
    theme: theme === "light" || theme === "dark" ? theme : null,
    view: DEBUG_VIEWS.includes(view) ? view : null,
    // GPU timestamps only when asked (loop 2: in capture mode they cost a query per
    // pass and logged WebGL2's "beginQuery: a query is already active" warning on
    // every load; measureGpu no longer needs them)
    stats: q.get("stats") === "1",
    quality: normalizeQuality(q.get("quality")),
    seed: 1741,
  };
}

// Small seeded PRNG (mulberry32): fixed seeds make captures repeatable.
export function seededRandom(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// window.__windowScene, exactly the contract, plus a few extras for tools
// (setLook, setProgress, engine). Returns an uninstall function.
export function installHook(engine) {
  const hook = {
    ready: engine.ready,
    version: CONTRACT_VERSION,
    get params() {
      return engine.params;
    },
    setParams: (patch) => engine.setParams(patch),
    renderFrames: (n = 1) => engine.renderFrames(n),
    seek: (t) => engine.seek(t),
    stats: () => engine.stats(),
    // extras
    setLook: (look) => engine.setLook(look),
    setProgress: (p, p2) => engine.pinProgress(p, p2),
    moonCheck: (ps) => engine.moonCheck(ps), // [{ p, ndc, px, inFrame, blockedBy }]
    engine,
  };
  if (typeof window !== "undefined") window.__windowScene = hook;
  return () => {
    if (typeof window !== "undefined" && window.__windowScene === hook) delete window.__windowScene;
  };
}
