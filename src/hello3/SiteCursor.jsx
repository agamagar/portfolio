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
// and it goes straight to resting. Esc hides it for the visit (sessionStorage); the small x
// (for good) was removed, 19 Oct 2026. One rAF loop on a virtual clock (stops while the tab is hidden),
// transforms only, pointer-events: none, aria-hidden,
// desktop pointer only, not rendered under reduced motion. Synthetic events: pointerId 77.
import { useEffect, useRef, useState } from "react";
import { introRevealed } from "./useStage";
import { heroMorphSettledOrTimeout } from "./heroMorphGate";
import { createGuide, noise } from "./siteGuide";
import { headlineEnd, headlineEl } from "./lineEnd";
import { STATES, FS } from "../ui/cursorStates"; // the main pointer's own silhouette
import { subscribeHeroVersion } from "./heroVersions";
import "./siteCursor.css";

const KEY = "agam-site-cursor-dismissed";
const APPEAR_AFTER = 3000; // ms after the load reveal
const PID = 77;
const O_STEP = 29.3; // HelloFlip's o to o, in its viewBox units

const read = () => {
  try { if (/[?&]cursor=1\b/.test(location.search)) { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } } catch { /* ignore */ }
  try {
    if (sessionStorage.getItem(KEY) === "1") return true;
    // the x hides it for 3 days, not for ever (a forgotten x once left it gone for good: 18 Oct)
    const t = Number(localStorage.getItem(KEY)); // legacy "1" reads as 1 ms since 1970: long expired
    return t > 1 && Date.now() - t < 3 * 864e5;
  } catch { return false; }
};
const write = (forever) => { try { (forever ? localStorage : sessionStorage).setItem(KEY, forever ? String(Date.now()) : "1"); } catch { /* private mode */ } };

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

const FLAG = "agam-cursor-active"; // set while the face has activated it; case pages (GuideHost) pick it up
const flag = (on) => { try { if (on) sessionStorage.setItem(FLAG, "1"); else sessionStorage.removeItem(FLAG); } catch { /* private mode */ } };

// caseMode: mounted by GuideHost on /work/* pages after the visitor activated it on the home page: no tour, no
// face, it simply carries on as the guide (and leaves instead of returning to a perch)
export default function SiteCursor({ caseMode = false } = {}) {
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined" || read()) return false;
    const m = window.matchMedia;
    return m("(hover: hover) and (pointer: fine)").matches && !m("(prefers-reduced-motion: reduce)").matches;
  });
  const root = useRef(null);

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
      const live = mode === "follow"; // static while parked: no jitter, no drift
      const j = live ? Math.sin(vt / 137) * 0.45 + Math.sin(vt / 47 + 1.3) * 0.25 : 0;
      const k = live ? Math.cos(vt / 119 + 0.6) * 0.45 + Math.sin(vt / 53) * 0.25 : 0;
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
      flag(false);
      dead = true; settle(); cancelAnimationFrame(raf);
      el.setAttribute("data-leave", "");
      timer = window.setTimeout(() => setOn(false), 500);
    };
    const toRest = () => { // hand the page back: release everything, then just keep company
      settle(); queue = []; groups = []; cur = null; A = null; mode = "rest"; restSettled = false;
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
    groups = []; // 19 Oct 2026 (Agam): no demo tour; the cursor stays parked on the face until it is clicked (rows/bang kept for reference)

    // ---- resting: PERCHED on the 3D face (Agam, 18 Oct); a click on the face changes its style and sends
    // the cursor off to follow the visitor's pointer (below). With no face (other hero versions) it parks
    // top-left as before.
    const PARK = [30, 30];
    let restSettled = false; // parked and still: the loop goes to sleep (wake() on scroll, resize, click, key, pointer)
    // PERCH: the very end of the hero headline's last line (lineEnd.js), cached in page coordinates and re-measured
    // when it can have moved: resize, font load, hero version switch, and any change inside the headline (the v4/v5
    // live re-wrap while the face is dragged). With no headline yet it falls back to beside the face, then the corner.
    let eol = null, eolDirty = true, obsEl = null, ro = null, mo = null;
    const dirty = () => { eolDirty = true; wake(); };
    const watch = () => {
      const c = headlineEl();
      if (c === obsEl) return;
      ro?.disconnect(); mo?.disconnect(); obsEl = c;
      if (!c) return;
      ro = new ResizeObserver(dirty); ro.observe(c);
      mo = new MutationObserver(dirty); mo.observe(c, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class"] });
    };
    // BESIDE THE FACE (Agam, 20 Oct: "close to the face but not overlapping the text"): the cursor's box is tried on the
    // face's right, left, below, above; the first spot clear of every headline text rect (and on screen) wins, else the
    // least-overlapping one. Text rects are re-collected only when dirty (resize, reflow, font load); the face rect is
    // one cheap read per tick, and the spot is re-picked only when it moved, so a dragged face carries the cursor.
    let spot = null, spotKey = "", lastHk = "", textRects = [];
    const faceRect = () => {
      for (const sel of [".hv4__face", ".hero-morph__cv", ".header__avatar-wrap"]) { // v4/v5 face, the morph canvas once placed, the 2D head before
        const r = document.querySelector(sel)?.getBoundingClientRect();
        if (r && r.width > 20 && r.height > 20) return r;
      }
      return null;
    };
    const collectText = () => {
      const c = headlineEl(), out = [];
      if (!c) return out;
      for (const root of [c, document.querySelector(".hello-hero__links")]) { // the headline and the Resume / LinkedIn row
      if (!root) continue;
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) {
        const pe = n.parentElement;
        if (!n.nodeValue.trim() || !pe || pe.closest(".sr-only, .hello-hero__sr, [hidden]")) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) if (q.width > 0 && q.height > 0) out.push([q.left, q.top, q.right, q.bottom]);
      }
      }
      if (!out.length && c instanceof SVGElement) for (const e of c.querySelectorAll("path, text, tspan")) { const q = e.getBoundingClientRect(); if (q.width > 0 && q.height > 0) out.push([q.left, q.top, q.right, q.bottom]); }
      return out;
    };
    const perch = () => {
      const fr = faceRect();
      if (!fr) { watch(); const e2 = headlineEnd(); return e2 ? [e2[0] - window.scrollX, e2[1] - window.scrollY] : PARK; }
      const hr = headlineEl()?.getBoundingClientRect(); // reflow without a mutation (font swap, face moving) shows up here
      const hk = hr ? hr.left.toFixed(0) + "," + hr.top.toFixed(0) + "," + hr.width.toFixed(0) + "," + hr.height.toFixed(0) : "";
      if (eolDirty || hk !== lastHk) { watch(); textRects = collectText(); eolDirty = false; lastHk = hk; spotKey = ""; }
      const key = fr.left.toFixed(0) + "," + fr.top.toFixed(0) + "," + fr.width.toFixed(0) + "," + window.innerWidth + "," + window.innerHeight;
      if (key !== spotKey) {
        spotKey = key;
        const tag = el.querySelector(".sc__tag");
        const ar = el.querySelector(".sc__arrow");
        const bw = 16 + (tag?.offsetWidth || 150) + 4, bh = Math.max((ar?.clientHeight || 18), 18) + (tag?.offsetHeight || 24) + 4; // arrow + hanging tag
        const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2, pad = 6;
        // boxes ringed around the face, nearest rings first (right, left, below, above lead each ring): the first clear one wins
        const cands = [];
        for (const d of [10, 26, 46, 70]) for (const ang of [0, 180, 90, 270, 30, 330, 150, 210, 60, 300, 120, 240, 45, 315, 135, 225]) {
          const t = (ang * Math.PI) / 180, ux = Math.cos(t), uy = Math.sin(t);
          const ex = (fr.width / 2 + d + bw / 2) * ux, ey = (fr.height / 2 + d + bh / 2) * uy; // box centre
          cands.push([cx + ex - bw / 2, cy + ey - bh / 2]);
        }
        const W = window.innerWidth, H = window.innerHeight;
        let best = null, bestScore = 1e12;
        for (const [x, y] of cands) {
          let ov = 0;
          for (const t of textRects) {
            const w2 = Math.min(x + bw + pad, t[2]) - Math.max(x - pad, t[0]), h2 = Math.min(y + bh + pad, t[3]) - Math.max(y - pad, t[1]);
            if (w2 > 0 && h2 > 0) ov += w2 * h2;
          }
          const off = Math.max(0, 8 - x) + Math.max(0, x + bw - (W - 8)) + Math.max(0, 8 - y) + Math.max(0, y + bh - (H - 8));
          const score = ov + off * 400 + (ov || off ? 1e6 : 0) * 0 + Math.hypot(x + bw / 2 - cx, y + bh / 2 - cy) * 0.01;
          if (score < bestScore) { bestScore = score; best = [x, y]; }
          if (ov === 0 && off === 0) break;
        }
        spot = best;
        const hb = el.querySelector(".sc__hit"); if (hb) { hb.style.width = bw + "px"; hb.style.height = bh + "px"; }
      }
      return spot;
    };
    const offVersion = subscribeHeroVersion(() => setTimeout(dirty, 120)); // the new hero mounts a beat later
    window.addEventListener("resize", dirty, { passive: true });
    document.fonts?.ready?.then(dirty);
    const restTick = (dt) => {
      if (!A) {
        A = true;
        queue = [{ k: "wait", ms: rnd(500, 900) }, { k: "move", to: perch }];
        return;
      }
      if (!queue.length) {
        const q = perch(), k = 1 - Math.exp(-dt / 140);
        cp.x += (q[0] - cp.x) * k; cp.y += (q[1] - cp.y) * k;
        if (Math.abs(q[0] - cp.x) + Math.abs(q[1] - cp.y) < 0.25) { cp.x = q[0]; cp.y = q[1]; restSettled = true; }
      }
    };

    // ---- the GUIDE (Agam, 19 Oct: "follow me around randomly, not closely ... guide someone to the important
    // parts"). Activated by the face, it has three phases:
    //   loose   wanders 120-260 px from the pointer on slow Perlin noise, with glancing pauses, never on the pointer;
    //   travel  a human arc (the same move machinery as the tour) to the highest-priority visible [data-guide] target;
    //   orbit   a slow ellipse around that target's edge, pausing at corners, the pill showing the target's label.
    // It releases when the target leaves the view or the pointer has been far away for a while, rests 6 s, and a
    // target it just left is skipped for 20 s (siteGuide.js), plus a 3 s minimum dwell: no ping-pong.
    const guide = createGuide();
    const labEl = el.querySelector(".sc__t-live");
    let tagW = 80; // the pill's width, measured when the label changes (not per frame), so it is kept inside the viewport
    const setLabel = (txt) => { if (labEl.textContent !== txt) { labEl.textContent = txt; tagW = labEl.parentElement.offsetWidth || 80; } };
    let gmode = "loose", cap = null, capAt = 0, coolUntil = 0, farSince = 0, decideAt = 0;
    let nt = 0, holdUntil = 0, nextHold = 0, th = 0, thPause = 0, corner = 0;
    const vel = { x: 0, y: 0 };
    let lastMove = 0;
    const clampPt = (x, y) => [Math.max(24, Math.min(window.innerWidth - 24 - tagW, x)), Math.max(24, Math.min(window.innerHeight - 24, y))];
    const orbitGeom = () => { // the visible slice of the target, so a tall visual is orbited where it can be seen
      const r = guide.rect(cap), l = Math.max(r.l, 16), t = Math.max(r.t, 16), rr = Math.min(r.r, window.innerWidth - 16), b = Math.min(r.b, window.innerHeight - 16);
      return { cx: (l + rr) / 2, cy: (t + b) / 2, rx: Math.min((rr - l) / 2 + 30, window.innerWidth / 2 - 30), ry: Math.min((b - t) / 2 + 30, window.innerHeight / 2 - 30) };
    };
    const orbitPt = (a) => { const g = orbitGeom(); return clampPt(g.cx + g.rx * Math.cos(a), g.cy + g.ry * Math.sin(a)); };
    const release = (why) => {
      if (cap) cap.rel = vt;
      gmode = "loose"; cap = null; coolUntil = vt + 6000; farSince = 0; queue = []; cur = null; setLabel("Agam");
    };
    const capture = (t) => {
      if (cap) cap.rel = vt;
      cap = t; capAt = vt; gmode = "travel"; farSince = 0; setLabel(t.label || "Agam");
      const g = orbitGeom(); th = Math.atan2(cp.y - g.cy, cp.x - g.cx); // arrive on the side it is already on
      queue = [{ k: "move", to: () => orbitPt(th) }]; cur = null; vel.x = vel.y = 0;
    };
    const decide = () => {
      if (gmode === "loose") { if (vt > coolUntil) { const b = guide.best(vt); if (b) capture(b); } return; }
      if (!guide.isVisible(cap)) { release("left view"); return; }
      const g = orbitGeom();
      if (Math.hypot(ptr.x - g.cx, ptr.y - g.cy) > 950) { if (!farSince) farSince = vt; else if (vt - farSince > 5000) { release("pointer far"); return; } } else farSince = 0;
      if (vt - capAt > 3000) { const b = guide.best(vt); if (b && b !== cap && b.pr > cap.pr) capture(b); }
    };
    const chase = (tx, ty, dt, W, Z) => {
      let left = Math.min(dt, 0.1);
      while (left > 1e-6) {
        const h = Math.min(1 / 120, left); left -= h;
        vel.x += (W * W * (tx - cp.x) - 2 * Z * W * vel.x) * h; vel.y += (W * W * (ty - cp.y) - 2 * Z * W * vel.y) * h;
        cp.x += vel.x * h; cp.y += vel.y * h;
      }
    };
    const followTick = (dt) => {
      if (vt - lastMove > 20000) { toPerch(); return; } // nobody has moved for 20 s: back to the face
      if (vt - decideAt > 250) { decideAt = vt; decide(); }
      if (gmode === "travel") { if (!cur && !queue.length) { gmode = "orbit"; corner = 0; thPause = 0; } return; }
      if (gmode === "orbit") {
        if (vt > thPause) {
          const prev = th; th += ((Math.PI * 2) / 22) * dt; // one slow lap every ~22 s
          const c = (Math.floor(prev / (Math.PI / 2) + 0.5) + 0.5) * (Math.PI / 2); // the diagonal corners
          if (prev < c && th >= c && Math.random() < 0.6) thPause = vt + rnd(900, 1500); // a pause at a corner
        }
        const q = orbitPt(th); chase(q[0], q[1], dt, 3.4, 0.95); return;
      }
      // loose: wander around the pointer, slowly, with glancing pauses
      if (ptr.x < -900) return;
      if (vt > holdUntil) { nt += dt; if (vt > nextHold) { holdUntil = vt + rnd(1000, 2000); nextHold = holdUntil + rnd(5000, 9000); } }
      const ang = noise(nt * 0.09) * Math.PI * 1.6 + 0.6, rad = 190 + noise(nt * 0.12 + 40) * 70; // 120..260 px
      const q = clampPt(ptr.x + Math.cos(ang) * rad, ptr.y + Math.sin(ang) * rad);
      chase(q[0], q[1], dt, 2.0, 0.95);
    };
    const hitBtn = el.querySelector(".sc__hit");
    const onHit = (e) => { if (e.isTrusted && mode !== "follow" && el.hasAttribute("data-live")) activate(); };
    hitBtn?.addEventListener("click", onHit);
    const activate = () => {
      if (mode === "tour") { settle(); queue = []; groups = []; cur = null; }
      queue = []; cur = null; mode = "follow"; lastMove = vt;
      gmode = "loose"; cap = null; coolUntil = vt + 3000; nt = Math.random() * 100; nextHold = vt + 4000; holdUntil = 0; setLabel("Agam");
      guide.start(); flag(true);
      el.setAttribute("data-rest", ""); el.setAttribute("data-follow", "");
      vel.x = 0; vel.y = -520; // a small hop as it lets go of the face
    };
    function toPerch() {
      if (caseMode) { guide.stop(); leave(); return; } // no face on a case page: it just leaves
      flag(false);
      guide.stop(); setLabel("Agam");
      mode = "rest"; restSettled = false; el.removeAttribute("data-follow"); cur = null; A = true;
      queue = [{ k: "move", to: perch }];
    }

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
          if (mode === "tour") { mode = "rest"; restSettled = false; el.setAttribute("data-rest", ""); nextAt = vt + 1500; }
          return;
        }
        begin(queue.shift());
      }
    };

    const hit = { x: NaN, y: NaN, at: 0, over: false };
    const frame = (now) => {
      if (dead) return;
      const dt = Math.min(120, now - last || 16); last = now; vt += dt;
      if (!cur) advance();
      const md = mode === "follow" ? "follow-" + gmode : mode; // (gmode is declared with the guide below)
      if (el.dataset.mode !== md) el.dataset.mode = md;
      // glass while it hovers something: the row the demo is on, or a link/button/row under the real pointer
      // (elementFromPoint is a hit test that flushes style and layout: only when the tip has moved
      // or 120 ms have passed, not on every frame of a cursor that is following the pointer)
      if (mode === "follow" && (cp.x !== hit.x || cp.y !== hit.y || vt - hit.at > 120)) {
        hit.x = cp.x; hit.y = cp.y; hit.at = vt;
        hit.over = !!document.elementFromPoint(cp.x, cp.y)?.closest("a, button, [data-project]");
      }
      const hov = !!over || (mode === "follow" && hit.over);
      if (el.hasAttribute("data-hover") !== hov) el.toggleAttribute("data-hover", hov);
      if (cur) {
        if (cur.k === "wait") { if (vt - cur.t0 >= cur.ms) cur = null; }
        else if (cur.k === "move") {
          const t = Math.min(1, (vt - cur.t0) / cur.dur), u = cur.prof(t);
          const x = cubic(cur.from[0], cur.c1[0], cur.c2[0], cur.dest[0], u), y = cubic(cur.from[1], cur.c1[1], cur.c2[1], cur.dest[1], u);
          place(x, y); cur.tick?.(x, y);
          if (t >= 1) cur = null;
        }
      }
      if (mode === "rest" && !cur) restTick(dt);
      else if (mode === "follow") followTick(dt / 1000);
      // idle drift only while it is waiting; a pointer-shy nudge away from the real pointer
      still = 0; // no idle drift (parked is static, following is the pointer's)
      let tx = 0, ty = 0;
      if (false) { // the pointer-shy nudge: off, the parked cursor does not move
        const dx = cp.x - ptr.x, dy = cp.y - ptr.y, d = Math.hypot(dx, dy) || 1;
        if (d < 170) { const m = (170 - d) * 0.3; tx = (dx / d) * m; ty = (dy / d) * m; }
      }
      ev.x += (tx - ev.x) * 0.06; ev.y += (ty - ev.y) * 0.06;
      paint();
      // parked and settled: no more frames until something wakes it (one rAF only while there is motion)
      if (!dead) raf = mode === "rest" && !cur && !queue.length && restSettled ? 0 : requestAnimationFrame(frame);
    };
    const start = () => { if (raf) return; last = performance.now(); raf = requestAnimationFrame(frame); };
    const wake = () => { if (!raf && !dead && el.hasAttribute("data-live")) { restSettled = false; start(); } };
    const onVis = () => { cancelAnimationFrame(raf); raf = 0; if (!document.hidden && !dead) start(); };
    const onMove = (e) => {
      wake();
      ptr.x = e.clientX; ptr.y = e.clientY; if (e.isTrusted) lastMove = vt;
      if (mode === "tour" && e.isTrusted && Math.hypot(e.clientX - cp.x, e.clientY - cp.y) < 160) toRest();
    };
    const onClick = (e) => {
      wake(); // the face's own button (HeroMorph) swaps its style; hidden in light mode, so no click arrives there
      if (!e.isTrusted || !el.hasAttribute("data-live") || !e.target.closest?.(".hero-morph__btn, .hero-morph__cv")) return;
      if (mode === "follow") toPerch(); else activate();
    };
    const onTouch = (e) => { if (mode === "tour" && e.isTrusted) toRest(); };
    const onKey = (e) => {
      wake();
      if (!e.isTrusted) return;
      if (e.key === "Escape") { if (mode === "follow") toPerch(); else { write(false); leave(); } }
      else if (mode === "tour" && !["Shift", "Control", "Alt", "Meta"].includes(e.key)) toRest();
    };

    Promise.race([
      Promise.all([introRevealed, heroMorphSettledOrTimeout(4000)]),
      new Promise((r) => setTimeout(r, 7000)),
    ]).then(() => {
      if (dead) return;
      if (caseMode) { // already activated on the home page: straight into the guide
        el.setAttribute("data-live", ""); place(window.innerWidth + 40, -40); start(); activate(); return;
      }
      timer = window.setTimeout(() => {
        if (dead) return;
        el.setAttribute("data-live", ""); pop();
        place(window.innerWidth + 40, -40); // glide in from off-screen
        start();
      }, APPEAR_AFTER);
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", wake, { passive: true, capture: true });
    window.addEventListener("resize", wake, { passive: true });
    window.addEventListener("pointerdown", onTouch, { passive: true });
    window.addEventListener("wheel", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      dead = true; cancelAnimationFrame(raf); clearTimeout(timer); settle(); guide.stop();
      offVersion(); ro?.disconnect(); mo?.disconnect(); window.removeEventListener("resize", dirty);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", wake, { capture: true });
      window.removeEventListener("resize", wake);
      window.removeEventListener("pointerdown", onTouch);
      window.removeEventListener("wheel", onTouch);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
      hitBtn?.removeEventListener("click", onHit);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div className="sc" ref={root}>
      <button type="button" className="sc__hit" aria-label="Activate the Agam cursor" />
      <svg className="sc__arrow" width="1" height="1" overflow="visible" aria-hidden="true">
        <path d={STATES.arrow.fig.parts[0]} transform={`scale(${FS}) translate(${-STATES.arrow.fig.hot[0]} ${-STATES.arrow.fig.hot[1]})`} />
      </svg>
      <span className="sc__tag" aria-hidden="true"><span className="sc__t-rest">Click to activate</span><span className="sc__t-live">Agam</span></span>
    </div>
  );
}
