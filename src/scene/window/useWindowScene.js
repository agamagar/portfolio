// The window scene's page wiring, shared by the /window sandbox (WindowScenePage)
// and the folio page (Hello3 behind ?scene=window, WindowSceneFolio): one canvas in
// `hostRef`, the camera driven by two scroll runways, the render loop on only while
// a runway is on screen.
//
// run1Ref: the main runway. p = how far its top has scrolled past the viewport top,
//   over (its height - one viewport); at p = 1 the screen's light is the page ground
//   and the canvas hides. On the folio page it wraps the hero plus one viewport of
//   spacer, so p reaches 1 exactly as the work grid's top meets the viewport bottom.
// run2Ref: the bookend runway (p2): out of the screen, back into the room.
// heroRef: the element holding the hero text; its [data-calm] children feed the
//   calm field (engine.setCalmBoxes). fadeHero: write --hero-fade on it from p (the
//   sandbox's stand-ins); the folio page fades its own hero, so it passes false.
// Reduced motion: no camera travel, the p = 0 frame drawn once as a still (and the
// closing shot once at the bottom), then a plain cut.

import { useEffect } from "react";
import { createWindowEngine } from "./engine.js";
import { takeWarmScene, returnWarmScene } from "./sceneWarm.js";
import { installHook } from "./capture.js";
import { getLook, subscribeLook } from "./lookStore.js";
import { installScrollRamp } from "./scrollRamp.js";
import { getOutside, subscribeOutside } from "./outsideStore.js";
import "./windowScene.css";

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// a start that never settles (a GPU compile that stalls, a context the browser will
// not give) must not leave the folio page blank: past this the page is given back and
// the scene dropped. WebKit's cold start measured 6.5 to 8.4 s (2026-09-27, 2560 x 1440
// at DPR 2); capture mode never times out
const READY_TIMEOUT_MS = 12000;

// pFrom: where the scroll starts the camera on the main path (0 = the window close-up;
//   the folio page starts at the pulled-back room view, 2026-09-27). pOver: "viewport"
//   (p over run1's height minus one viewport, the sandbox) or "height" (over its whole
//   height: run1 is a spacer ABOVE the content, so p = 1 exactly as the content's top
//   reaches the viewport's top). The page's landing state goes on <html> as
//   data-wscene-landed, so the page can hold its content back until the hand-off.
// livePoster: the folio page's screen ends on the page's own first viewport, captured
//   live (livePoster.js) and mapped by engine.screenRectAt(1); the hand-off then shows
//   those pixels untonemapped instead of fading to the ground (handoff.toPage).
// endRun: run2 is a spacer AFTER the page's last screen (the folio page's ending):
//   through it the camera runs the main path backwards, from the screen out to pFrom,
//   the page's last screen (captured live) left on the monitor; p2 stays 0.
// sweepDeg: an extra camera turn eased out over the main path (the window travels
//   further left as you scroll in; engine params.camera.sweep).
// ramp: the speed ramp (scrollRamp.js): a scroll that comes to rest inside the main
//   runway is carried on to the room or the page's top. ?ramp=0 turns it off.
export function useWindowScene({ hostRef, run1Ref, run2Ref, heroRef, opts, reduced, fadeHero = true, enabled = true, pFrom = 0, pOver = "viewport", livePoster = false, endRun = false, sweepDeg = 0, ramp = false }) {
  useEffect(() => {
    if (!enabled) return undefined;
    const host = hostRef.current;
    const run1 = run1Ref.current;
    const run2 = run2Ref.current;
    if (!host || !run1 || !run2) return undefined;

    const root = document.documentElement;
    if (opts.capture) root.classList.add("wscene-capture");
    const themeNow = () => opts.theme || (root.classList.contains("dark") ? "dark" : "light");
    // the engine warmed behind the plain page (sceneWarm.js, 2026-10-05) is adopted
    // as it is: its canvas moves into this host and is resized to the viewport, and
    // its ready has already resolved, so nothing compiles twice. Otherwise a fresh
    // canvas per mount, so a StrictMode remount never shares a context
    const warm = opts.capture ? null : takeWarmScene();
    const canvas = warm ? warm.canvas : document.createElement("canvas");
    if (!warm) {
      canvas.className = "wscene__canvas";
      canvas.setAttribute("aria-hidden", "true");
    }
    host.appendChild(canvas);
    const engine = warm ? warm.engine : createWindowEngine({ canvas, opts, theme: themeNow() });
    // the size the engine was last set to (the ResizeObserver below skips the same size)
    let sized = null;
    if (warm) {
      engine.setTheme?.(themeNow());
      // already at this size (primed in sceneWarm.js): a resize reallocates every target
      if (warm.posterSize !== `${window.innerWidth}x${window.innerHeight}`) engine.resize(window.innerWidth, window.innerHeight);
      sized = `${window.innerWidth}x${window.innerHeight}`;
      // shown from the start, as a canvas that ran its own ready is: the landing then
      // only toggles its visibility, on the very frame the page swaps, against the page's
      // own pixels on the monitor. Unmarked, it faded in over 900 ms as the hand-over
      // scroll began while the page had already gone: a blank flash (rec2, 2026-10-05)
      canvas.dataset.shown = "true";
      canvas.dataset.hidden = "true";
    }
    const unhook = installHook(engine);
    let alive = true;
    let ready = false;
    let unlook = null;
    let unramp = null;
    let unoutside = null;
    let gui = null;

    // --- scroll -> progress; runways on screen -> loop on ------------------------------
    let vis1 = true, vis2 = false;
    let p = 0, p2 = 0;
    let landed = false;
    let tEnd = 0; // endRun: 0 at the page's last screen, 1 at the bottom of the spacer
    let rawP = 0; // the main runway's own 0..1, for the page's scroll nudge
    const livePosters = { top: null, end: null }; // livePoster: the page's top and last screen
    let posterShown = null;
    // a warm hand-over brings the landing already captured (sceneWarm prepareWarmScene)
    if (warm?.poster) livePosters.top = warm.poster;
    let posterSize = warm?.posterSize || null;
    let shown = null;
    let stillKey = "";
    // set once the scene has given the page back: from then on it is a plain page, and
    // nothing here may write data-wscene-landed again (a scroll or resize after a failed
    // start re-hid the content for good, the Safari blank page of 2026-09-27)
    let gaveUp = false;
    const read = () => {
      const vh = window.innerHeight;
      const r1 = run1.getBoundingClientRect();
      const r2 = run2.getBoundingClientRect();
      const R1 = pOver === "height" ? run1.offsetHeight : run1.offsetHeight - vh;
      const R2 = run2.offsetHeight - vh;
      if (reduced) {
        p = pFrom;
        p2 = vis2 && !vis1 ? 1 : 0;
        landed = !vis1;
      } else {
        const raw = R1 > 0 ? clamp01(-r1.top / R1) : 0;
        rawP = raw;
        p = pFrom + (1 - pFrom) * raw;
        p2 = R2 > 0 ? clamp01(-r2.top / R2) : 0;
        landed = raw >= 0.999;
        if (endRun) {
          tEnd = run2.offsetHeight > 0 ? clamp01((vh - r2.top) / run2.offsetHeight) : 0;
          p2 = 0;
          if (tEnd > 0.0005) {
            p = 1 - (1 - pFrom) * tEnd;
            landed = false;
          }
        }
      }
    };
    // the hero text stand-ins: their rects feed the calm field; they fade with p
    const hero = heroRef.current;
    // (capture mode hides the runway, so its stand-ins measure 0 x 0: the engine
    // then keeps params.calm.boxes, the same layout, and captures stay scene-only)
    const sendBoxes = () => {
      if (!hero || opts.capture) return;
      const c = canvas.getBoundingClientRect();
      const rects = [...hero.querySelectorAll("[data-calm]")]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 1 && r.height > 1)
        .map((r) => ({ x0: r.left - c.left, y0: r.top - c.top, x1: r.right - c.left, y1: r.bottom - c.top }));
      engine.setCalmBoxes(rects.length ? rects : null);
    };
    const decide = () => {
      if (!alive || gaveUp) return;
      read();
      engine.setScroll(p, p2);
      // for tools and QA: the progress this page computed (the engine's own is in stats())
      canvas.dataset.p = p.toFixed(3);
      canvas.dataset.p2 = p2.toFixed(3);
      root.dataset.wsceneLanded = landed ? "true" : "false";
      // the scroll nudge fades out over the first few percent of the runway
      root.style.setProperty("--wscene-run", rawP.toFixed(3));
      if (fadeHero) hero?.style.setProperty("--hero-fade", String(1 - Math.min(1, p / 0.3)));
      if (opts.capture) return;
      const inEnd = endRun && tEnd > 0.0005;
      // the monitor shows the page's top on the way in, its last screen on the way out
      if (livePoster && ready) {
        const which = inEnd ? "end" : "top";
        if (which !== posterShown && livePosters[which]) {
          posterShown = which;
          engine.setPoster(livePosters[which], themeNow());
        }
      }
      const want = reduced ? vis1 || vis2 : endRun ? (vis1 && p < 1 && !inEnd) || inEnd : (vis1 && p < 1) || (vis2 && p2 > 0);
      const tabOn = !document.hidden;
      if (!ready) return;
      if (want !== shown) {
        shown = want;
        if (want) {
          canvas.dataset.hidden = "false";
          canvas.dataset.shown = "true";
        } else {
          // one last frame at the clamped progress (the page ground), then stop
          engine.setActive(false);
          // hidden on the very frame the page appears: its last frame is the page's
          // own capture, drawn 1:1 (post.js), so the swap is invisible; both at once
          // doubled the text (the crossfade tried first, 2026-09-27)
          canvas.dataset.hidden = "true";
          engine.renderOnce();
        }
      }
      if (reduced) {
        // a still: draw only when the still changes (top frame or closing shot)
        engine.setActive(false);
        const key = `${p}|${p2}`;
        if (want && key !== stillKey) {
          stillKey = key;
          engine.renderOnce();
        }
      } else engine.setActive(want && tabOn);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === run1) vis1 = e.isIntersecting;
          if (e.target === run2) vis2 = e.isIntersecting;
        }
        decide();
      },
      { threshold: 0 }
    );
    io.observe(run1);
    io.observe(run2);
    const onScroll = () => decide();
    window.addEventListener("scroll", onScroll, { passive: true });
    // the cursor, for the bead chain's swing (mouse and pen only: a finger is scrolling),
    // and the grab hand while it is over the chain
    const onPointer = (e) => {
      if (opts.capture || e.pointerType === "touch") return;
      const c = canvas.getBoundingClientRect();
      engine.setPointer(e.clientX - c.left, e.clientY - c.top, e.timeStamp);
    };
    const onPointerOut = () => { engine.setPointer(null); engine.setPointerDown(false); };
    const onChainHover = (e) => root.classList.toggle("wscene-grab", !!e.detail);
    // dragging the bike or the car along the monitor's top (2026-10-05): the button
    // state goes to the engine; a press that lands on a toy (the grab hand is showing)
    // must not start a text selection or a scroll-drag on the page
    const onDown = (e) => {
      if (opts.capture || e.pointerType === "touch" || e.button !== 0) return;
      engine.setPointerDown(true);
      if (root.classList.contains("wscene-grab")) e.preventDefault();
    };
    const onUp = () => engine.setPointerDown(false);
    const onToyDrag = (e) => root.classList.toggle("wscene-grabbing", !!e.detail);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wscene:toydrag", onToyDrag);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerOut);
    window.addEventListener("blur", onPointerOut);
    canvas.addEventListener("wscene:chainhover", onChainHover);
    const onVis = () => {
      decide();
      if (!document.hidden && posterPending) {
        posterTries = 0;
        capturePoster(300);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => {
      // a real change of size only: the hero is observed too (for its boxes), and a
      // resize to the same size still reallocated every target and cleared the canvas
      // (a canvas is blanked whenever its size is set, even to the same value)
      const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      if (`${w}x${h}` !== sized) {
        sized = `${w}x${h}`;
        engine.resize(w, h);
      }
      sendBoxes();
      capturePoster();
      decide();
    });
    ro.observe(canvas);
    if (hero) ro.observe(hero);

    // the site theme (the hand-off colour and the poster), unless ?theme= pins it
    // the live posters (folio page only): the page's top and its last screen,
    // recaptured on resize and theme change
    let posterTimer = 0;
    // a capture that fails (a hidden tab or a zero-size pane: modern-screenshot hands
    // back a 0 x 0 canvas) left the monitor on the static poster, rendered at another
    // width, so its grid sat elsewhere than the page's (2026-09-27): it now retries
    // with a backoff, and again when the tab comes back
    let posterTries = 0, posterPending = false;
    const capturePoster = (delay = 350, force = false) => {
      if (!livePoster || opts.capture) return;
      // nothing to redo: the landing on the monitor was made at this very size (the
      // warm hand-over's, or an earlier capture). Re-capturing is a DOM-to-image render
      // of the whole page on the main thread, which stuttered the hand-over scroll
      if (!force && livePosters.top && posterSize === `${window.innerWidth}x${window.innerHeight}`) return;
      clearTimeout(posterTimer);
      posterPending = true;
      posterTimer = setTimeout(async () => {
        if (!alive || !ready) return;
        const retry = () => {
          if (posterTries++ < 6) capturePoster(Math.min(8000, 1000 * 2 ** (posterTries - 1)));
        };
        if (document.hidden || !window.innerWidth || !window.innerHeight || !host.clientWidth) return retry();
        try {
          const rect = engine.screenRectAt(1);
          const root = host.closest(".hello") || host.parentElement;
          const bg = themeNow() === "dark" ? "#0e0e11" : "#ffffff";
          const { captureLanding, captureEnd } = await import("./livePoster.js");
          const dpr = window.devicePixelRatio || 1;
          const top = await captureLanding({ root, runway: run1, rect, bg, dpr });
          const foot = endRun ? root.querySelector(".hello-foot") : null;
          const end = foot ? await captureEnd({ el: foot, spacer: run2, rect, bg, dpr }) : null;
          if (!alive) return;
          if (!top) return retry();
          livePosters.top = top;
          posterSize = `${window.innerWidth}x${window.innerHeight}`;
          root.dataset.wscenePoster = "true"; // the monitor shows the live page: the hand-over scroll may start (Hello.jsx)
          livePosters.end = end || livePosters.end;
          posterTries = 0;
          posterPending = false;
          posterShown = null;
          decide();
        } catch (e) {
          console.warn("[window] live poster failed, retrying:", e?.message || e);
          retry();
        }
      }, delay);
    };
    // only a real theme change: <html>'s class also flips with every scroll (Lenis's
    // lenis-scrolling), and re-capturing the page on each of those stuttered the scroll
    // and baked a half-faded hero into the monitor (2026-09-27, "utterly broken")
    let lastTheme = themeNow();
    const mo = opts.theme
      ? null
      : new MutationObserver(() => {
          const th = themeNow();
          if (th === lastTheme) return;
          lastTheme = th;
          engine.setTheme(th);
          capturePoster(120, true); // a theme change repaints the page: always re-capture
        });
    mo?.observe(root, { attributes: true, attributeFilter: ["class"] });

    // hold the page's content back from the first paint when the runway starts on
    // screen (no flash of the hero before the scene is ready); if the scene cannot
    // start (no WebGPU or WebGL2, a lost context), give the page back: content shown,
    // the runway collapsed, the canvas gone
    if (pOver === "height" && run1.getBoundingClientRect().bottom > 0) root.dataset.wsceneLanded = "false";
    const giveBack = (why) => {
      if (!alive || gaveUp) return;
      gaveUp = true;
      clearInterval(readyTimer);
      delete root.dataset.wsceneLanded;
      root.dataset.wsceneOff = "true";
      delete root.dataset.wsceneReady;
      root.style.removeProperty("--wscene-run");
      run1.style.height = "0px";
      canvas.dataset.hidden = "true";
      unramp?.();
      unramp = null;
      engine.dispose(); // a slow start stops compiling; the loop never runs unseen
      if (why) console.warn("[window] scene off, page shown:", why);
    };
    // counted only while the tab is visible: a background tab gets no animation frames,
    // so the engine's warm-up frames wait for it to be shown (not a stall)
    let visibleMs = 0;
    const readyTimer = opts.capture
      ? 0
      : setInterval(() => {
          if (ready) return clearInterval(readyTimer);
          if (!document.hidden) visibleMs += 250;
          if (visibleMs >= READY_TIMEOUT_MS) giveBack(`not ready after ${READY_TIMEOUT_MS / 1000} s on screen`);
        }, 250);
    engine.ready
      .then((ok) => {
        if (!alive || gaveUp) return;
        if (!ok) return giveBack("the engine did not start");
        clearInterval(readyTimer);
        ready = true;
        root.dataset.wsceneReady = "true"; // the folio loader and poster crossfade (windowScene.css)
        if (livePosters.top) root.dataset.wscenePoster = "true"; // adopted with the engine: the hand-over scroll may start
        // the header's look (lookStore.js), unless the URL pins one
        if (!new URLSearchParams(window.location.search).has("look")) {
          if (getLook() !== engine.getLook?.()) engine.setLook(getLook());
          unlook = subscribeLook((l) => engine.setLook(l));
        }
        // the header's Outside menu, unless the URL pins the weather or the hour
        {
          const q = new URLSearchParams(window.location.search);
          if (!q.has("wx") && !q.has("tod")) {
            const o = getOutside();
            if (o.wx !== "live" || o.tod !== null) engine.setOutside(o);
            unoutside = subscribeOutside((v) => engine.setOutside(v));
          }
        }
        // a warm engine primed with these very settings (sceneWarm.js prepareWarmScene)
        // keeps them: re-applying each re-renders the sky, right at the hand-over
        const primed = !!warm?.folio && warm.folio.pFrom === pFrom && warm.folio.sweepDeg === sweepDeg;
        if (sweepDeg && !primed) engine.setParams({ camera: { sweep: { deg: sweepDeg, from: pFrom, to: 1 } } });
        // the folio page's screens stay sharp: focus on the monitor, a gentler blur
        if (livePoster && !opts.capture && !primed) engine.setParams({ camera: { folio: { focusScreen: true, bokeh: 0.5 } } });
        if (livePoster && !opts.capture) {
          // the monitor shows the page 1:1 from the first frame: the folio starts at p =
          // 0.5, where handoff.page (from 0.5) had not begun, so the room's look lifted the
          // screen's blacks (Agam, 2026-09-27: "washed out black" in dark mode)
          if (!primed) engine.setParams({ post: { handoff: { toPage: true, page: { from: 0, to: 0.001 } } } });
          (document.fonts?.ready || Promise.resolve()).then(() => capturePoster(600));
        }
        if (opts.capture) {
          canvas.dataset.shown = "true";
          canvas.dataset.instant = "true";
        }
        shown = null;
        decide();
        // an adopted canvas has no frame of its own yet: the move into this host left it
        // blank until it draws again. One frame at the current progress, drawn while it
        // is still hidden, after the ResizeObserver's first pass (two frames on), and
        // only then data-wscene-drawn, which the hand-over waits for (Hello.jsx) before it
        // reveals the canvas. Revealed blank, it showed nothing for about 150 ms after
        // the page had already gone: the dark flash at the switch (rec21, 2026-10-05)
        if (warm) {
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (!alive) return;
              Promise.resolve(engine.renderOnce())
                .catch(() => {})
                .then(() =>
                  requestAnimationFrame(() => {
                    if (alive) root.dataset.wsceneDrawn = "true";
                  })
                );
            })
          );
        } else root.dataset.wsceneDrawn = "true"; // its own canvas fades in on ready
        if (ramp && !reduced && !endRun && !opts.capture && new URLSearchParams(window.location.search).get("ramp") !== "0") {
          unramp = installScrollRamp({
            measure: () => {
              const r1 = run1.getBoundingClientRect();
              const span = pOver === "height" ? run1.offsetHeight : run1.offsetHeight - window.innerHeight;
              if (span <= 0) return null;
              const top = r1.top + window.scrollY;
              // the room: the page's very top when the runway starts in the first screen
              return { raw: clamp01(-r1.top / span), y0: top <= window.innerHeight ? 0 : top, y1: top + span, span };
            },
          });
        }
        if (opts.gui) {
          import("./gui.js").then(({ createGui }) => {
            if (alive) createGui(engine).then((g) => (gui = g));
          });
        }
      })
      .catch((e) => giveBack(e?.message || String(e)));

    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      mo?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onPointerOut);
      window.removeEventListener("blur", onPointerOut);
      canvas.removeEventListener("wscene:chainhover", onChainHover);
      root.classList.remove("wscene-grab");
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wscene:toydrag", onToyDrag);
      root.classList.remove("wscene-grabbing");
      document.removeEventListener("visibilitychange", onVis);
      clearTimeout(posterTimer);
      clearInterval(readyTimer);
      unlook?.();
      unramp?.();
      unoutside?.();
      gui?.destroy();
      unhook();
      // an adopted warm engine goes back to the warm slot (a StrictMode remount, or a
      // quick remount, takes it again at once; nobody does in 3 s: it is disposed)
      if (warm && !gaveUp) returnWarmScene({ canvas, engine, poster: livePosters.top, posterSize, folio: warm.folio || null }); // adopted: already warmed (its ready resolved in sceneWarm)
      else {
        engine.dispose();
        canvas.remove();
      }
      root.classList.remove("wscene-capture");
      delete root.dataset.wsceneLanded;
      delete root.dataset.wsceneOff;
      delete root.dataset.wsceneReady;
      delete root.dataset.wscenePoster;
      delete root.dataset.wsceneDrawn;
      root.style.removeProperty("--wscene-run");
    };
  }, [opts, reduced, enabled, fadeHero]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable
}
