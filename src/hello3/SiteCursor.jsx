// The site's own cursor (Agam, 2026-10-11/12): a multiplayer-style cursor (arrow + solid
// blue "Agam" tag) that is the site keeping the visitor company. It appears 3 s after the
// load reveal and DEMONSTRATES the page (hovers two work rows, whose real linked spotlight
// reacts to the same pointerover/pointerout events a mouse sends; then presses the "!",
// drags it right so extra o's appear, drags it back to exactly where it started and
// releases, so the word is "Hello!" again and no language flip fires). Then it STAYS as a
// quiet co-browser: pinned to a document point so it lags along with scrolling like a
// second person, now and then drifting to something in view, keeping its distance from the
// real pointer.
//
// HUMAN MOTION: curved S-ish paths (cubic, uneven bends), a fast ballistic start that
// slows into the target, duration by Fitts-like distance with random speed, sometimes an
// overshoot, then one or two small corrective moves; micro-jitter and a slow idle drift
// (visual only, never in the coordinates sent to the page); reading pauses between moves.
//
// SAFETY: demos send no clicks and leave nothing changed (settle() releases the hover and,
// mid-drag, returns the "!" to its start before the pointerup). During the tour any REAL
// (isTrusted) pointer move near the cursor, press, wheel or key stops the demos (settled)
// and it goes straight to resting. Esc hides it for the visit (sessionStorage), the small x
// for good (localStorage). One rAF loop on a virtual clock (stops while the tab is hidden),
// transforms only, pointer-events: none (only the x takes the pointer), aria-hidden,
// desktop pointer only, not rendered under reduced motion. Synthetic events: pointerId 77.
import { useEffect, useRef, useState } from "react";
import { introRevealed } from "./useStage";
import { heroMorphSettledOrTimeout } from "./heroMorphGate";
import "./siteCursor.css";

const KEY = "agam-site-cursor-dismissed";
const APPEAR_AFTER = 3000; // ms after the load reveal
const PID = 77;
const O_STEP = 29.3; // HelloFlip's o to o, in its viewBox units

const read = () => {
  try { if (/[?&]cursor=1\b/.test(location.search)) { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } } catch { /* ignore */ }
  try { return sessionStorage.getItem(KEY) === "1" || localStorage.getItem(KEY) === "1"; } catch { return false; }
};
const write = (forever) => { try { (forever ? localStorage : sessionStorage).setItem(KEY, "1"); } catch { /* private mode */ } };

// a soft pop when it joins, only if the site's sound toggle is on and the browser has
// already had a user gesture (otherwise audio would be blocked): silent no-op, no errors
function pop() {
  try {
    if (document.documentElement.dataset.sound !== "on" || !navigator.userActivation?.hasBeenActive) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = new AC(), t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(640, t); o.frequency.exponentialRampToValueAtTime(240, t + 0.11);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.18);
    o.onended = () => c.close().catch(() => {});
  } catch { /* no sound is fine */ }
}

const rnd = (a, b) => a + Math.random() * (b - a);
// fast ballistic start, long slowing tail (not symmetric, not constant velocity)
const ballistic = (t) => 0.75 * (1 - Math.pow(1 - t, 3.2)) + 0.25 * t * t * (3 - 2 * t);
const smooth = (t) => t * t * (3 - 2 * t);
const cubic = (a, c1, c2, b, u) => { const v = 1 - u; return v * v * v * a + 3 * v * v * u * c1 + 3 * v * u * u * c2 + u * u * u * b; };
const pev = (el, type, x, y, extra) => el.dispatchEvent(new PointerEvent(type, {
  bubbles: true, cancelable: true, composed: true, pointerId: PID, pointerType: "mouse", isPrimary: true,
  clientX: x, clientY: y, button: 0, buttons: type === "pointermove" || type === "pointerdown" ? 1 : 0, ...extra,
}));
const onScreen = (r) => r && r.width > 4 && r.bottom > 60 && r.top < window.innerHeight - 60;

export default function SiteCursor() {
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined" || read()) return false;
    const m = window.matchMedia;
    return m("(hover: hover) and (pointer: fine)").matches && !m("(prefers-reduced-motion: reduce)").matches;
  });
  const root = useRef(null);
  const forever = useRef(() => {});
  forever.current = () => { write(true); setOn(false); };

  useEffect(() => {
    if (!on) return undefined;
    const el = root.current;
    if (!el) return undefined;
    let dead = false, raf = 0, timer = 0, vt = 0, last = 0, mode = "tour";
    const cp = { x: 0, y: 0 }; // the arrow tip (what the page is told about)
    const ptr = { x: -999, y: -999 }, ev = { x: 0, y: 0 };
    let cur = null, queue = [], groups = [], over = null, drag = null;
    let A = null, nextAt = 0, still = 0;

    // visual only: micro-jitter, a slow idle drift while it waits, and the pointer-shy offset
    const paint = () => {
      const j = Math.sin(vt / 137) * 0.45 + Math.sin(vt / 47 + 1.3) * 0.25;
      const k = Math.cos(vt / 119 + 0.6) * 0.45 + Math.sin(vt / 53) * 0.25;
      const dx = Math.sin(vt / 1900) * 2.6 * still, dy = Math.cos(vt / 2300 + 1) * 2 * still;
      el.style.transform = `translate3d(${(cp.x + j + dx + ev.x).toFixed(2)}px,${(cp.y + k + dy + ev.y).toFixed(2)}px,0)`;
    };
    const place = (x, y) => { cp.x = x; cp.y = y; };
    const settle = () => {
      if (drag) {
        pev(drag.el, "pointermove", drag.x0, drag.y);
        pev(drag.el, "pointerup", drag.x0, drag.y);
        delete drag.el.setPointerCapture;
        drag = null; el.removeAttribute("data-press");
      }
      if (el.hasAttribute("data-morph")) { const b = document.querySelector(".hf__bang"); if (b) pev(b, "pointerout", cp.x, cp.y, { relatedTarget: null }); el.removeAttribute("data-morph"); }
      if (over) { pev(over, "pointerout", cp.x, cp.y, { relatedTarget: null }); over = null; }
    };
    const leave = () => {
      dead = true; settle(); cancelAnimationFrame(raf);
      el.setAttribute("data-leave", "");
      timer = window.setTimeout(() => setOn(false), 500);
    };
    const toRest = () => { // hand the page back: release everything, then just keep company
      settle(); queue = []; groups = []; cur = null; A = null; mode = "rest";
      el.setAttribute("data-rest", ""); nextAt = vt + 2500;
    };

    // ---- the demo tour, as groups built when reached (a missing target skips its group)
    const rows = () => {
      const all = [...document.querySelectorAll(".hello-hero__table .work__item[data-project]")].filter((n) => onScreen(n.getBoundingClientRect()));
      const pick = [all[1], all[3] || all[2]].filter(Boolean);
      if (!pick.length) return null;
      const steps = [];
      pick.forEach((row) => {
        steps.push({ k: "move", to: () => { const r = row.getBoundingClientRect(); return [r.left + r.width * rnd(0.4, 0.6), r.top + r.height * 0.5]; } });
        steps.push({ k: "call", fn: () => { if (over && over !== row) pev(over, "pointerout", cp.x, cp.y, { relatedTarget: row }); over = row; pev(row, "pointerover", cp.x, cp.y, { relatedTarget: null }); } });
        steps.push({ k: "wait", ms: rnd(1500, 2300) });
      });
      steps.push({ k: "call", fn: () => { if (over) { pev(over, "pointerout", cp.x, cp.y, { relatedTarget: null }); over = null; } } });
      steps.push({ k: "wait", ms: rnd(500, 900) });
      return steps;
    };
    const bang = () => {
      const b = document.querySelector(".hf__bang");
      const svg = b?.ownerSVGElement;
      const r = b?.getBoundingClientRect();
      if (!b || !onScreen(r)) return null;
      const px = (O_STEP * 1.6 * svg.getBoundingClientRect().width) / svg.viewBox.baseVal.width; // ~two o's of travel
      let x0 = 0, y0 = 0;
      return [
        { k: "move", to: () => { const q = b.getBoundingClientRect(); x0 = q.left + q.width * 0.5; y0 = q.top + q.height * 0.55; return [x0, y0]; } },
        // reaching the "!": the arrow becomes the page's drag handle (the "!" itself, HelloFlip.jsx, which reads
        // these same synthetic events); data-morph hides the arrow and tag while it is there
        { k: "call", fn: () => { el.setAttribute("data-morph", ""); pev(b, "pointerover", x0, y0, { relatedTarget: null }); pev(b, "pointermove", x0, y0, { buttons: 0 }); } },
        { k: "wait", ms: rnd(400, 700) },
        { k: "call", fn: () => { b.setPointerCapture = () => {}; drag = { el: b, x0, y: y0 }; el.setAttribute("data-press", ""); pev(b, "pointerdown", x0, y0); } },
        { k: "wait", ms: 260 },
        { k: "move", ease: "io", to: () => [x0 + px, y0 + 3], tick: (x, y) => pev(b, "pointermove", x, y), dur: rnd(1300, 1800) },
        { k: "wait", ms: rnd(900, 1300) },
        { k: "move", ease: "io", to: () => [x0, y0], tick: (x, y) => pev(b, "pointermove", x, y), dur: rnd(1300, 1800) },
        { k: "call", fn: () => { pev(b, "pointermove", x0, y0); pev(b, "pointerup", x0, y0); delete b.setPointerCapture; drag = null; el.removeAttribute("data-press"); } },
        { k: "wait", ms: 380 },
        { k: "call", fn: () => { pev(b, "pointerout", x0, y0, { relatedTarget: null }); el.removeAttribute("data-morph"); } },
        { k: "wait", ms: rnd(700, 1100) },
      ];
    };
    groups = [rows, bang];

    // ---- resting
    // PARKED (Agam, 12 Oct): after the tour it glides to the top-left corner of the viewport
    // and stays there (position: fixed, so it does not follow the scroll), drifting a little.
    const PARK = [30, 30];
    const restTick = () => {
      if (!A) {
        A = true;
        queue = [{ k: "wait", ms: rnd(500, 900) }, { k: "move", to: () => PARK }];
        return;
      }
      if (!queue.length) { cp.x = PARK[0]; cp.y = PARK[1]; }
    };

    // ---- one human move: curved cubic, ballistic profile, Fitts-ish time, overshoot + corrections
    const begin = (st) => {
      cur = st; st.t0 = vt;
      if (st.k === "call") { st.fn(); cur = null; return; }
      if (st.k !== "move") return;
      let to = st.to();
      const dx = to[0] - cp.x, dy = to[1] - cp.y, d = Math.hypot(dx, dy) || 1;
      const human = !st.ease && !st.sub;
      if (human) {
        const exact = to;
        let ox = 0, oy = 0;
        if (d > 140 && Math.random() < 0.4) { const o = rnd(7, 16); ox = (dx / d) * o; oy = (dy / d) * o; } // overshoot
        else if (d > 60) { ox = rnd(-3.5, 3.5); oy = rnd(-3.5, 3.5); }                                      // a near miss
        if (ox || oy) {
          const fix = [{ k: "move", sub: true, to: () => exact, dur: rnd(240, 420) }];
          if (Math.random() < 0.3) fix.unshift({ k: "move", sub: true, to: () => [exact[0] + rnd(-1.5, 1.5), exact[1] + rnd(-1.5, 1.5)], dur: rnd(160, 260) }, { k: "wait", ms: rnd(60, 140) });
          queue.unshift(...fix);
          to = [exact[0] + ox, exact[1] + oy];
        }
      }
      st.from = [cp.x, cp.y]; st.dest = to;
      const nx = -dy / d, ny = dx / d, sgn = Math.random() < 0.5 ? -1 : 1;
      const b1 = sgn * d * rnd(0.06, 0.2), b2 = -sgn * d * rnd(0, 0.12); // uneven S-bend, never a true arc
      st.c1 = [cp.x + dx * 0.28 + nx * b1, cp.y + dy * 0.28 + ny * b1];
      st.c2 = [cp.x + dx * 0.72 + nx * b2, cp.y + dy * 0.72 + ny * b2];
      if (!st.dur) st.dur = (450 + 240 * Math.log2(d / 20 + 1)) * rnd(0.85, 1.35); // Fitts-like, varied
      st.prof = st.ease ? smooth : st.sub ? smooth : ballistic;
    };
    const advance = () => {
      while (!cur) {
        if (!queue.length) {
          const g = groups.shift();
          if (g) { const q = g(); if (q) queue = q; continue; }
          if (mode === "tour") { mode = "rest"; el.setAttribute("data-rest", ""); nextAt = vt + 1500; }
          return;
        }
        begin(queue.shift());
      }
    };

    const frame = (now) => {
      if (dead) return;
      const dt = Math.min(120, now - last || 16); last = now; vt += dt;
      if (!cur) advance();
      if (cur) {
        if (cur.k === "wait") { if (vt - cur.t0 >= cur.ms) cur = null; }
        else if (cur.k === "move") {
          const t = Math.min(1, (vt - cur.t0) / cur.dur), u = cur.prof(t);
          const x = cubic(cur.from[0], cur.c1[0], cur.c2[0], cur.dest[0], u), y = cubic(cur.from[1], cur.c1[1], cur.c2[1], cur.dest[1], u);
          place(x, y); cur.tick?.(x, y);
          if (t >= 1) cur = null;
        }
      }
      if (mode === "rest" && !cur) restTick();
      // idle drift only while it is waiting; a pointer-shy nudge away from the real pointer
      still += ((cur && cur.k === "move" ? 0 : 1) - still) * 0.04;
      let tx = 0, ty = 0;
      if (mode === "rest") {
        const dx = cp.x - ptr.x, dy = cp.y - ptr.y, d = Math.hypot(dx, dy) || 1;
        if (d < 170 && !el.querySelector(".sc__x:hover")) { const m = (170 - d) * 0.3; tx = (dx / d) * m; ty = (dy / d) * m; }
      }
      ev.x += (tx - ev.x) * 0.06; ev.y += (ty - ev.y) * 0.06;
      paint();
      if (!dead) raf = requestAnimationFrame(frame);
    };
    const start = () => { last = performance.now(); raf = requestAnimationFrame(frame); };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden && !dead) start(); };
    const onMove = (e) => {
      ptr.x = e.clientX; ptr.y = e.clientY;
      if (mode === "tour" && e.isTrusted && Math.hypot(e.clientX - cp.x, e.clientY - cp.y) < 160) toRest();
    };
    const onTouch = (e) => { if (mode === "tour" && e.isTrusted) toRest(); };
    const onKey = (e) => {
      if (!e.isTrusted) return;
      if (e.key === "Escape") { write(false); leave(); }
      else if (mode === "tour" && !["Shift", "Control", "Alt", "Meta"].includes(e.key)) toRest();
    };

    Promise.race([
      Promise.all([introRevealed, heroMorphSettledOrTimeout(4000)]),
      new Promise((r) => setTimeout(r, 7000)),
    ]).then(() => {
      if (dead) return;
      timer = window.setTimeout(() => {
        if (dead) return;
        el.setAttribute("data-live", ""); pop();
        place(window.innerWidth + 40, -40); // glide in from off-screen
        start();
      }, APPEAR_AFTER);
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onTouch, { passive: true });
    window.addEventListener("wheel", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      dead = true; cancelAnimationFrame(raf); clearTimeout(timer); settle();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onTouch);
      window.removeEventListener("wheel", onTouch);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div className="sc" ref={root} aria-hidden="true">
      <svg className="sc__arrow" viewBox="0 0 16 16" width="18" height="18">
        <path d="M2 1.5 L2 14.2 L5.6 10.8 L8.1 15 L10.3 13.9 L7.9 9.8 L12.8 9.8 Z" />
      </svg>
      <span className="sc__tag">Agam</span>
      <button type="button" className="sc__x" tabIndex={-1} title="Hide me for good" onClick={() => forever.current()}>×</button>
    </div>
  );
}
