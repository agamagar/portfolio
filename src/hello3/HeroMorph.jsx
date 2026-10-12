// The mascot morph in the hero (2026-10-11, Agam: "play it on the homepage hero"): the
// line-drawn head beside "Hello! I'm Agam" turns into the fitted 3D clay head, once,
// after the hero's load reveal, then holds on the clay.
//
// It sits in the same `.header__avatar-wrap` as MorphFace and never moves it: a small 2D
// canvas, absolutely placed (no layout shift), drawn over exactly where the SVG drawing
// is. The morph itself (figures/faces/morph, three.js + the 8 MB face.glb) is loaded
// lazily and renders on a detached WebGL canvas at its reference size (802 x 862); each
// frame is copied down into the visible canvas through the drawing's own placement, so
// frame 0 lands on the SVG's lines. Until that first frame is drawn the SVG shows.
//
// Order of play: the face holds its plain drawing (MorphFace `still`: no 2D turn, Agam,
// 2026-10-11), the intro reaches "reveal", then the morph starts a beat later (3.8 s). The
// morph is loaded and built during the intro, so the start is not held up by the build or
// the network. When it ends the WebGL context is released and the last frame stays in the 2D
// canvas.
//
// Fallbacks: reduced motion shows the clay still (the last frame only, no fields built);
// no WebGL2 (or no float render targets), a failed load, or a lost context keep the line
// drawing. Phones (720 px and under) keep the drawing: they get the classic page, and the
// GLB is too heavy to fetch there for a 40 px head. Once per visit: a later mount within
// the visit shows the clay still from the cached last frame.
import { useEffect, useRef } from "react";
import { FACE_VIEWBOX } from "../faceMorph";
import { DURATION, ramp } from "../figures/faces/morph/flood";
import { settleHeroMorph } from "./heroMorphGate";
import "./heroMorph.css";

const BEAT = 0; // the morph starts the moment the wave ends (the page then reveals in step with it: Hello.jsx, "heromorph:t")
const PREROLL = 120; // ms on frame 0 before the morph's clock starts (the SVG swaps out in it)
const SWAP = 80; // ms after the first draw: the canvas is on screen by then
// the morph's drawing (drawing.js, Figma 1724-23069) sits this far from faceMorph's
// state-1 coordinates (the same paths, offset: the eyes' centres differ by exactly this)
const OFF = [29.654, 23.071];
const FW = 802, FH = 862;
// THE 3D HEAD IS BIGGER THAN THE DRAWING (Agam, 2026-10-11: "the 2D face has also increased in
// size, let's take it back to the previous size, keep 3D the current size"). The drawing keeps
// its own size and place; the clay ends 1.21 times as big, grown out from the face's right edge
// (by the greeting), and 6 screen px further right. The canvas starts exactly on the drawing
// and grows into that framing across the morph (grow, below).
const CLAY_SCALE = 1.21, CLAY_NUDGE = 6;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
// SPEED RAMP (Agam, 2026-10-11: "the 3D face reveal should be speed ramped"): one remap of the
// morph's clock, real time u -> timeline t (RAMP and ramp, in flood.js since the page's light wave
// rides the very same curve: "match the speed of the morph with the page reveal").
// from the slide's start to the clay's arrival (the timeline's 0.06 and 0.85)
const grow = (t) => inOut(clamp01((t - 0.06) / 0.79));

let lastFrame = null; // a copy of the final 802 x 862 clay frame, once played (per visit)
let lastNoir = null; // the same for the noir head, once it has been shown
let styleNow = "clay"; // which head the visit is on: a click on the head swaps them

function canMorph() {
  try {
    // a desktop device (a mouse or trackpad), whatever the window's width: Agam views the
    // page in narrow panes too. Phones and tablets keep the drawing
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
    const gl = document.createElement("canvas").getContext("webgl2");
    let ok = !!gl && !!gl.getExtension("EXT_color_buffer_float");
    // SOFTWARE WEBGL (SwiftShader, llvmpipe, a blocklisted GPU): the build and every frame run
    // on the CPU, multi-second stalls on the main thread (measured 0.4 to 24 s on a loaded
    // machine, headless Chromium has no GPU), which would freeze the hero for the morph's sake.
    // Those keep the line drawing. ?morph=on forces it (for QA on a machine without a GPU).
    if (ok && !/[?&]morph=on\b/.test(location.search)) {
      const x = gl.getExtension("WEBGL_debug_renderer_info");
      const name = x ? String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL)) : "";
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) ok = false;
    }
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

// where the SVG draws, in its own frame: its untransformed box inside the wrap (in the
// wrap's px, before the wrap's CSS scale), the viewBox's fit and MorphFace's resting
// group shift. The SVG's own CSS transform (hello.css tilts the badge face -5deg, index.css
// nudges it 4px) is read off and given to the canvas too, about the same origin, so the
// two always share one frame whatever that transform is.
function placeOf(svg, wrap, restDx) {
  const cs = getComputedStyle(svg);
  const xf = { transform: cs.transform, rotate: cs.rotate, scale: cs.scale, translate: cs.translate };
  const [tox, toy] = cs.transformOrigin.split(" ").map(parseFloat);
  const keep = Object.keys(xf).map((k) => svg.style[k]);
  for (const k in xf) svg.style[k] = "none";
  const wr = wrap.getBoundingClientRect(), sr = svg.getBoundingClientRect();
  Object.keys(xf).forEach((k, i) => { svg.style[k] = keep[i]; });
  const sc = wr.width / (wrap.offsetWidth || wr.width) || 1;
  const w = sr.width / sc, h = sr.height / sc;
  const [, , VW, VH] = FACE_VIEWBOX.split(" ").map(Number);
  const k = Math.min(w / VW, h / VH);
  const dx = restDx ?? (svg.querySelector("g")?.transform.baseVal.consolidate()?.matrix.e || 0);
  return {
    sc, k, xf, dx, tox: tox || 0, toy: toy || 0, w, h,
    sx: (sr.left - wr.left) / sc, sy: (sr.top - wr.top) / sc,
    ox: (w - VW * k) / 2 + k * (dx - OFF[0]),
    oy: (h - VH * k) / 2 - k * OFF[1],
  };
}

// canvas px -> px in the SVG box: the inverse of the drawing's placement in the canvas, so
// the drawing lands on the SVG's. No roll: the head keeps the drawing's orientation throughout
function mapping(pl, pose) {
  const { s, th, tx, ty } = pose;
  const m = pl.k / s, c = Math.cos(th) * m, n = Math.sin(th) * m;
  // R(-th) / s, then the shift that takes the placement's offset back out
  return [c, -n, n, c, pl.ox - (c * tx + n * ty), pl.oy - (-n * tx + c * ty)];
}

export default function HeroMorph({ ready }) {
  const ref = useRef(null); // the canvas
  const boxRef = useRef(null); // the placed box around it and the button
  const btnRef = useRef(null);
  // BUILT DURING THE INTRO (2026-10-11): with no 2D turn, the face sits still while the intro
  // plays, so the morph is loaded and built then (one ~160 ms main-thread task; the rest is
  // network and a worker) and can start a beat after the reveal instead of ~1.5 s after it.
  // The play effect below takes the build over; one left untaken is released on unmount.
  const build = useRef(null);
  useEffect(() => {
    if (lastFrame || !canMorph() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const b = { gl: document.createElement("canvas"), m: null, lost: false, taken: false, onLost: null };
    b.gl.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      b.lost = true;
      b.onLost?.();
    });
    const id = setTimeout(() => {
      const svg = boxRef.current?.parentElement?.querySelector("svg.header__avatar");
      b.p = import("../figures/faces/morph/mascotMorph")
        .then(({ createMascotMorph }) => createMascotMorph(b.gl, { clear: true, ink: svg ? getComputedStyle(svg).color : undefined }))
        .then((m) => (b.m = m));
      b.p.catch(() => {});
      build.current = b;
    }, 600);
    return () => {
      clearTimeout(id);
      if (build.current === b) build.current = null;
      if (!b.taken && b.p) b.p.then((m) => { m.MR.renderer.dispose(); m.MR.renderer.forceContextLoss(); }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const cv = ref.current;
    const boxEl = boxRef.current;
    const btn = btnRef.current;
    const wrap = boxEl?.parentElement;
    const svg = wrap?.querySelector("svg.header__avatar");
    if (!svg || !canMorph()) {
      settleHeroMorph();
      return undefined;
    }
    let alive = true, raf = 0, timer = 0, m = null, pose = null, frameSrc = null, t = 0, done = false;
    const ctx = cv.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = reduce || !!lastFrame;

    // the visible canvas covers the whole frame's footprint, at screen resolution
    // the SVG is looked up each time: a hover replay remounts MorphFace, and with it the
    // SVG. Its group shift is read once, at rest (a replay animates it)
    let pl, box, res;
    const layout = () => {
      pl = placeOf(wrap.querySelector("svg.header__avatar") || svg, wrap, pl?.dx);
      const xs = [], ys = [];
      const [a, b, c, d, e, f] = mapping(pl, pose);
      for (const [x, y] of [[0, 0], [FW, 0], [0, FH], [FW, FH]]) { xs.push(a * x + c * y + e); ys.push(b * x + d * y + f); }
      box = { x: Math.floor(Math.min(...xs)), y: Math.floor(Math.min(...ys)) };
      box.w = Math.ceil(Math.max(...xs)) - box.x;
      box.h = Math.ceil(Math.max(...ys)) - box.y;
      // screen resolution: the device, the wrap's scale, any scale of the SVG's own (copied),
      // and the clay's larger framing, so the canvas is never upscaled
      res = (window.devicePixelRatio || 1) * pl.sc * (parseFloat(pl.xf.scale) || 1) * CLAY_SCALE;
      // the canvas pivots on the face's right edge (the clay grows out from it). The drawing
      // turns about its own origin (its -5deg tilt, hello.css), so at the start the canvas adds
      // the shift that makes a turn about the edge equal one about the origin: (I - R)(c - O)
      const rot = ((parseFloat(pl.xf.rotate) || 0) * Math.PI) / 180, ca = Math.cos(rot), sa = Math.sin(rot);
      const O = [pl.w, pl.h / 2], dcx = pl.tox - O[0], dcy = pl.toy - O[1];
      pl.fix = [dcx - (ca * dcx - sa * dcy), dcy - (sa * dcx + ca * dcy)];
      pl.nudge = CLAY_NUDGE / pl.sc; // screen px, in the wrap's own px
      Object.assign(boxEl.style, {
        left: `${pl.sx + box.x}px`, top: `${pl.sy + box.y}px`, width: `${box.w}px`, height: `${box.h}px`,
        ...pl.xf, transformOrigin: `${O[0] - box.x}px ${O[1] - box.y}px`, visibility: "visible",
      });
      frame(gNow);
      cv.width = Math.round(box.w * res);
      cv.height = Math.round(box.h * res);
    };
    // g 0: exactly the drawing's framing; g 1: the clay's (1.21 from the right edge, 6px right)
    let gNow = 0;
    const frame = (g) => {
      gNow = g;
      const s0 = parseFloat(pl.xf.scale) || 1;
      boxEl.style.scale = String(s0 * (1 + (CLAY_SCALE - 1) * g));
      boxEl.style.translate = `${pl.fix[0] * (1 - g) + pl.nudge * g}px ${pl.fix[1] * (1 - g)}px`;
    };
    const blit = (src) => {
      const [a, b, c, d, e, f] = mapping(pl, pose);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.setTransform(a * res, b * res, c * res, d * res, (e - box.x) * res, (f - box.y) * res);
      ctx.drawImage(src, 0, 0);
    };
    const show = () => { wrap.dataset.morph = "on"; };
    const giveUp = () => {
      // back to the line drawing
      delete wrap.dataset.morph;
      boxEl.style.visibility = "hidden";
      btn.hidden = true;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      settleHeroMorph();
    };
    const release = () => {
      if (!m) return;
      m.MR.renderer.dispose();
      m.MR.renderer.forceContextLoss();
      m = null;
    };
    const finish = () => {
      done = true;
      t = 1;
      if (m) {
        m.render(1);
        if (!lastFrame) {
          lastFrame = document.createElement("canvas");
          lastFrame.width = FW; lastFrame.height = FH;
          lastFrame.getContext("2d").drawImage(m.MR.renderer.domElement, 0, 0);
        }
        frameSrc = lastFrame;
        frame(1);
        blit(frameSrc);
      }
      // the clay is here: the wave hand fades (heroMorph.css) and the head takes over with its
      // own emotes. Reduced motion: a still head, so the renderer goes
      wrap.dataset.clay = "on";
      btn.hidden = !isDark();
      btn.setAttribute("aria-pressed", "false");
      if (m && !reduce) startEmotes(m, m.MR.renderer.domElement);
      else release();
      settleHeroMorph();
    };

    // THE CLICK (Agam, 2026-10-11: "map the click on the 3D face to rotate and change to the
    // noir mode, and back"). A transparent button over the head: one full turn about the neck
    // axis (eased, 720 ms), the skin swapped at the hidden midpoint (the back of the head),
    // clay <-> noir (the hatted head fitted to the noir tile). The turned views are the ones the
    // fits never photographed (the camera-projected textures smear on a turned head; noir's
    // hard key light flares on the surfaces it never saw), so they are hidden with speed: the
    // in-out ease leaves the head near the front most of the time, the camera pulls back as it
    // turns (faceRig3D's zoom), and a blur follows the angular speed. Preloaded on the first
    // hover or focus so the click is instant. Reduced motion: a quick crossfade, no turn.
    // DARK ONLY (Agam, 2026-10-12: "disable the click face turn on light mode"): in the light theme
    // the face is not a control at all (the button is hidden, so no cursor, no focus stop, nothing
    // for a screen reader to announce), the remembered skin is clay, and a visitor who switches to
    // light while the head is noir sees it crossfade back to clay. Hover emotes are unaffected.
    const isDark = () => document.documentElement.classList.contains("dark");
    let style = styleNow, spinning = false, spinRaf = 0, liveP = null;
    if (!isDark()) style = styleNow = "clay";
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // the live renderer: the one the morph kept, or (reduced motion, a later mount) a still build
    const ensureLive = () => {
      if (m) return Promise.resolve(m);
      return (liveP ||= (async () => {
        const { createMascotMorph } = await import("../figures/faces/morph/mascotMorph");
        const glc = document.createElement("canvas");
        glc.addEventListener("webglcontextlost", (e) => { e.preventDefault(); em?.stop(); m = null; liveP = null; });
        const mm = await createMascotMorph(glc, { clear: true, ink: getComputedStyle(svg).color, still: true });
        if (!alive) { mm.MR.renderer.dispose(); mm.MR.renderer.forceContextLoss(); return null; }
        if (style === "noir") { await mm.MR.loadNoir(); mm.MR.setRig("noir"); mm.renderAt(1, {}); }
        m = mm;
        return mm;
      })().catch(() => { liveP = null; return null; }));
    };
    const preload = () => { if (done && isDark()) ensureLive().then((mm) => mm && mm.MR.loadNoir()).catch(() => {}); };
    const frameFor = (name) => (name === "noir" ? lastNoir : lastFrame);
    // the new head at rest: render it, cache its frame, hold it in the 2D canvas
    const settle = (mm, to) => {
      mm.MR.setRig(to);
      style = styleNow = to;
      mm.renderAt(1, {});
      if (to === "noir" && !lastNoir) {
        lastNoir = document.createElement("canvas");
        lastNoir.width = FW; lastNoir.height = FH;
        lastNoir.getContext("2d").drawImage(mm.MR.renderer.domElement, 0, 0);
      }
      frameSrc = frameFor(to);
      frame(1);
      blit(frameSrc);
      btn.setAttribute("aria-pressed", String(to === "noir"));
    };
    const swap = async (opts) => {
      const toLight = opts?.toLight === true; // the theme went light while on noir: fade back, no turn
      if (spinning || !done || !alive || (!isDark() && !toLight)) return;
      spinning = true;
      btn.setAttribute("aria-busy", "true");
      try {
        const mm = await ensureLive();
        if (!mm || !alive) return;
        const to = style === "clay" ? "noir" : "clay";
        if (to === "noir") await mm.MR.loadNoir();
        if (!alive) return;
        if (em) em.pause(); // the performance stops (and resets) while the head turns
        const glc = mm.MR.renderer.domElement;
        if (reduce || toLight) {
          cv.style.transition = "opacity 140ms linear";
          cv.style.opacity = "0";
          await sleep(150);
          settle(mm, to);
          cv.style.opacity = "1";
          await sleep(150);
          cv.style.transition = "";
          return;
        }
        const DUR = 720, t0 = performance.now();
        let swapped = false;
        await new Promise((resolve) => {
          const tick = () => {
            if (!alive || !m) { resolve(); return; }
            const u = Math.min(1, (performance.now() - t0) / DUR);
            const e = u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; // in-out cubic: 0 -> 1
            if (!swapped && u >= 0.5) { mm.MR.setRig(to); swapped = true; }
            // angular speed, 0 at the ends and 1 in the middle, drives a light blur and a dissolve:
            // the fastest turn is also the least photographed (turned clay smears, noir's key
            // light flares on the back of the neck), so there the head thins out to a third
            const sp = (u < 0.5 ? 12 * u * u : 12 * (1 - u) * (1 - u)) / 3;
            cv.style.filter = u < 1 ? `blur(${(1.5 * sp ** 1.4).toFixed(2)}px)` : "";
            cv.style.opacity = u < 1 ? (1 - 0.68 * sp ** 1.3).toFixed(3) : "";
            if (u >= 1) { resolve(); return; }
            mm.renderAt(1, { yaw: e * Math.PI * 2 });
            blit(glc);
            spinRaf = requestAnimationFrame(tick);
          };
          spinRaf = requestAnimationFrame(tick);
        });
        cv.style.filter = ""; cv.style.opacity = "";
        if (alive && m) settle(mm, to);
      } finally {
        spinning = false;
        cv.style.filter = "";
        if (!reduce) cv.style.opacity = "";
        btn.removeAttribute("aria-busy");
        if (em) em.unpause();
        syncTheme(); // the theme may have changed during a turn
      }
    };
    const syncTheme = () => {
      if (!done || !alive) return;
      btn.hidden = !isDark();
      if (!isDark() && style === "noir" && !spinning) swap({ toLight: true });
    };
    const themeObs = new MutationObserver(syncTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    btn.addEventListener("click", swap);
    btn.addEventListener("focus", preload);
    wrap.addEventListener("mouseenter", preload, { once: true });

    // THE CLAY'S EMOTES (Agam, 2026-10-11: "once the face has turned [3D], remove the wave
    // animation, and instead animate one of the emotes we have built in"). FaceSV's emotes
    // (figures/faces/morph/emotes.js) on the held clay: a wink as the hold begins, then one
    // now and then (8-15 s, not while the head is off-screen or the tab hidden), and a quick
    // one on hover in place of the wave. Each frame is the timeline's last frame with the
    // emote's pose on top; nothing draws between emotes. The framing does not move.
    let em = null;
    // THE PERFORMANCE (Agam, 2026-10-12: "a little more dramatic... more dynamic and complex
    // movement of the face itself"). figures/faces/morph/emoteEngine.js: springs on every channel,
    // anticipation, overlapping action, chains, and an ambient layer (breathing, sway, eye darts,
    // blinks). One loop drives it: about 60 fps while an emote plays, about 25 at rest for the
    // ambient layer; it steps back if frames get expensive, stops off-screen or in a hidden tab,
    // and is paused while the head turns (the click).
    const startEmotes = async (mm, glc) => {
      const EN = await import("../figures/faces/morph/emoteEngine");
      if (!alive || m !== mm) return;
      const engine = EN.createEmoteEngine();
      em = { engine, paused: false, seen: true, raf: 0, last: 0, cost: 0, gap: 40, timers: [], lastName: "" };
      const pick = (pool) => { let n; do { n = pool[(Math.random() * pool.length) | 0]; } while (n === em.lastName && pool.length > 1); em.lastName = n; return n; };
      const loop = (now) => {
        if (!em) return;
        em.raf = 0;
        if (!alive || em.paused || m !== mm) return;
        if (document.hidden || !em.seen) { em.last = 0; return; } // resumes on visibility / intersection
        const playing = engine.active();
        if (!playing && em.cost > 40) { em.last = 0; return; } // too heavy for the ambient layer: rest until the next emote
        if (em.last && now - em.last < (playing ? 14 : em.gap)) { em.raf = requestAnimationFrame(loop); return; }
        const dt = em.last ? Math.min(50, now - em.last) : 16;
        em.last = now;
        const t0 = performance.now();
        mm.renderAt(1, EN.toPose(engine.tick(dt, mm.MR.rigName)));
        blit(glc);
        em.cost = em.cost * 0.9 + (performance.now() - t0) * 0.1;
        if (!playing) em.gap = em.cost > 22 ? 120 : em.cost > 10 ? 80 : 40;
        em.raf = requestAnimationFrame(loop);
      };
      const resume = () => { if (em && !em.raf && !em.paused && alive && !document.hidden && em.seen) { em.last = 0; em.raf = requestAnimationFrame(loop); } };
      em.pause = () => { if (!em) return; em.paused = true; cancelAnimationFrame(em.raf); em.raf = 0; engine.reset(); };
      em.unpause = () => { if (!em) return; em.paused = false; resume(); };
      const play = (name, opts) => { if (!em || em.paused || !m) return; if (engine.play(name, opts)) resume(); };
      const io = new IntersectionObserver(([e]) => { if (em) { em.seen = e.isIntersecting; if (em.seen) resume(); } });
      io.observe(cv);
      const onVis = () => resume();
      document.addEventListener("visibilitychange", onVis);
      const idle = () => {
        em.timers.push(setTimeout(() => {
          if (!em) return;
          if (!document.hidden && em.seen) play(pick(EN.IDLE));
          idle();
        }, 8000 + Math.random() * 7000));
      };
      em.timers.push(setTimeout(() => play(EN.FIRST), 450));
      idle();
      resume(); // the ambient layer starts at once
      const onEnter = () => play(pick(EN.HOVER), { quick: true });
      wrap.addEventListener("mouseenter", onEnter);
      em.stop = () => {
        em.timers.forEach(clearTimeout);
        cancelAnimationFrame(em.raf);
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        wrap.removeEventListener("mouseenter", onEnter);
        em = null;
      };
    };
    // the hero can change size (breakpoints, zoom): re-place and redraw the held frame
    const onResize = () => {
      if (!pose) return;
      layout();
      if (done && frameSrc) blit(frameSrc);
    };
    const ro = new ResizeObserver(onResize);
    // the browser can drop a 2D canvas's pixels (GPU reset, a long time in the background):
    // the held frame is redrawn when it hands the canvas back
    cv.addEventListener("contextrestored", onResize);

    const start = async () => {
      try {
        if (lastFrame) {
          // played earlier in this visit: the clay, still, without WebGL
          const mod = await import("../figures/faces/morph/handoff.json");
          if (!alive) return;
          pose = mod.default.pose;
          layout();
          frameSrc = (style === "noir" && lastNoir) || lastFrame;
          frame(1);
          blit(frameSrc);
          done = true;
          wrap.dataset.clay = "on";
          btn.hidden = !isDark();
          btn.setAttribute("aria-pressed", String(style === "noir"));
          raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => alive && show())));
          ro.observe(wrap);
          settleHeroMorph();
          if (!reduce) {
            // the emotes need the live head: the one shared build (ensureLive, a still render of
            // the last frame; on noir it wears noir). One builder only: a hover arriving
            // meanwhile (the pointer rests where the head was) joins it rather than starting a second
            const mm = await ensureLive();
            if (mm && alive) startEmotes(mm, mm.MR.renderer.domElement);
          }
          return;
        }
        const lost = () => {
          if (done) { em?.stop(); m = null; return; } // the held frame stays in the 2D canvas
          alive = false;
          cancelAnimationFrame(raf);
          m = null;
          giveUp();
        };
        // only a fresh build: a ref outlives a remount (a hot reload), and the one it held then
        // was already released, so taking it fell back to the drawing for good
        const b = !still && build.current && !build.current.taken && !build.current.lost ? build.current : null;
        let gl;
        if (b) {
          // the build from the intro (still loading, or ready)
          b.taken = true;
          gl = b.gl;
          b.onLost = lost;
          m = await b.p;
          if (!alive) { release(); return; }
          if (b.lost) { m = null; giveUp(); return; }
          // the theme may have changed since: the ink is only a colour, the fields hold
          m.MR.comp.uniforms.uInk.value.setStyle(getComputedStyle(svg).color);
          m.render(0);
        } else {
          const { createMascotMorph } = await import("../figures/faces/morph/mascotMorph");
          if (!alive) return;
          gl = document.createElement("canvas");
          gl.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost(); });
          m = await createMascotMorph(gl, { clear: true, ink: getComputedStyle(svg).color, still });
          if (!alive) { release(); return; }
        }
        pose = m.pose;
        layout();
        ro.observe(wrap);
        if (still) {
          finish();
          raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => alive && show())));
          return;
        }
        // the canvas draws frame 0 (the drawing itself) over the SVG and holds it for a short
        // pre-roll; the SVG steps aside part way in, while the two are the same picture.
        // (Hiding it with the first draw left one blank frame on screen: the canvas's first
        // content lands a frame or two after it is drawn. The ramp's quick start leaves the
        // timeline's own opening only ~80 ms, so the pre-roll carries the swap instead.)
        blit(gl);
        // the page's reveal rides this clock (Hello.jsx): "heromorph:t" carries the timeline's t (0..1)
        const tell = (v) => window.dispatchEvent(new CustomEvent("heromorph:t", { detail: v }));
        tell(0);
        const t1 = performance.now(), t0 = t1 + PREROLL;
        const step = () => {
          if (!alive || !m) return;
          const now = performance.now();
          t = ramp(Math.min(1, Math.max(0, now - t0) / DURATION));
          if (now - t1 >= SWAP && !wrap.dataset.morph) show();
          tell(t);
          if (t >= 1) { finish(); return; }
          m.render(t);
          frame(grow(t));
          blit(gl);
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      } catch (err) {
        if (import.meta.env.DEV) console.warn("[hero morph] kept the line drawing:", err);
        release();
        if (alive) giveUp();
      }
    };
    // a beat past the reveal
    if (still) start();
    else timer = setTimeout(() => alive && start(), BEAT);
    return () => {
      alive = false;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("contextrestored", onResize);
      em?.stop();
      cancelAnimationFrame(spinRaf);
      themeObs.disconnect();
      btn.removeEventListener("click", swap);
      btn.removeEventListener("focus", preload);
      wrap.removeEventListener("mouseenter", preload);
      btn.hidden = true;
      cv.style.filter = ""; cv.style.opacity = ""; cv.style.transition = "";
      delete wrap.dataset.clay;
      // unmounted (mid-play, or a hot reload remounting it): this canvas goes with it, so the
      // SVG comes back at once, whether or not the morph had finished. Keeping data-morph on
      // after a finished morph hid the SVG behind a new, still empty canvas: no face at all
      release();
      delete wrap.dataset.morph;
      settleHeroMorph();
    };
  }, [ready]);

  // the canvas, and over the head a transparent button (the click swaps clay and noir): both in
  // one box that HeroMorph places over the drawing. Hidden until the head is clay
  return (
    <span ref={boxRef} className="hero-morph">
      <canvas ref={ref} className="hero-morph__cv" aria-hidden />
      <button ref={btnRef} type="button" className="hero-morph__btn" aria-label="Switch face style" aria-pressed="false" hidden>
        <span className="hero-morph__hit" />
      </button>
    </span>
  );
}
