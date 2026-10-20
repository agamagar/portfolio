// The visitor's own cursor, in the site's style (Agam, 17 Oct 2026: "make the cursor respond
// to things and change shape accordingly"). It is NOT the blue "Agam" guide cursor
// (hello3/SiteCursor.jsx); it shares its language (link blue, Google Sans, solid pills).
//
// ONE shape that morphs: a rounded rect (width, height, radius) plus two 5-point polylines
// for the glyph, every number on its own spring, so dot -> ring -> pill -> caret and
// arrow -> play -> up -> lock are interpolated paths, never swapped icons. One rAF loop that
// only runs while something is still moving; position by transform, shape by SVG attributes
// (no layout). Fine pointers only (hover: hover and pointer: fine); the native cursor is hidden
// (html.cx-on) only after the first real pointer move. pointer-events: none. Reduced motion:
// the same states, applied instantly.
//
// DATA-CURSOR API. Any element can opt in:
//   data-cursor="dot|link|ext|view|lock|drag|play|text|rotate|up"   the state while it is under the pointer
//   data-cursor-label="Open"                                          optional word inside the pill
// Without the attribute these are recognised automatically: video -> play, input/textarea ->
// text, .is-locked -> lock, the hero face -> rotate, the "!" -> drag, the room pill -> up, the side-quest
// track -> drag (grabbing while pressed), project cards and rows -> view, external links ->
// ext, other links/buttons -> link.
import { useEffect, useRef } from "react";
import { STATES, STATE_NAMES, RULES, ALIAS, INSPECT_SEL, FS } from "./cursorStates";
import "./contextCursor.css";

// glyphs: two polylines of 5 points (x,y)*5 each; "z" collapses to the centre
const Z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
export const G = {
  none: [Z, Z],
  ext: [[-4, 4, 4, -4, -1, -4, 4, -4, 4, 1], Z],
  view: [[-4, 4, 4, -4, -1, -4, 4, -4, 4, 1], Z],
  play: [[-3, -4.5, 4.5, 0, -3, 4.5, -3, -4.5, -3, -4.5], Z],
  up: [[-4, 1.5, 0, -3.5, 4, 1.5, 0, -3.5, 0, 4.5], Z],
  rotate: [[-5, 1, -3.5, -3.5, 0, -5, 3.5, -3.5, 5, 1], [5, 1, 3, 2.5, 5, 1, 5, 1, 5, 1]],
  lock: [[-4, -1, 4, -1, 4, 5, -4, 5, -4, -1], [-2.5, -1, -2.5, -3.5, 0, -5, 2.5, -3.5, 2.5, -1]],
};
// state -> target shape. label null = none. w:null = fit the label.
export const S = {
  dot: { w: 10, h: 10, r: 5, g: "none" },
  // the glass pill: only where a label is needed (data-cursor-label)
  pill: { w: 26, h: 26, r: 13, g: "none" },
  // every other state is an organic shape from cursorStates.js (blended outlines, no pill)
  ...Object.fromEntries(STATE_NAMES.map((n) => [n, { w: 0, h: 0, r: 0, g: STATES[n].glyph || "none", org: n }])),
};
const PAD_L = 12; // label pills: glyph slot + gap on the left when a glyph is present

const hit = (sel, x, y) => { const n = document.querySelector(sel); if (!n) return false; const r = n.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
function resolve(t, down, x, y) {
  if (document.documentElement.matches(INSPECT_SEL)) return { s: "inspect" };
  if (!(t instanceof Element)) return { s: "arrow" };
  const xe = t.closest("[data-cursor]");
  if (xe) {
    const label = xe.getAttribute("data-cursor-label") || undefined;
    if (label) return { s: "pill", label };
    const n = xe.getAttribute("data-cursor") || "";
    return { s: S[ALIAS[n] || n] ? ALIAS[n] || n : "arrow" };
  }
  const ctx = { down };
  for (const r of RULES) {
    const el = t.closest(r.sel);
    if (el) return { s: r.s(ctx, el) };
    if (r.rect && hit(r.rect, x, y)) return { s: r.s(ctx, document.querySelector(r.rect)) };
  }
  return { s: "arrow" };
}

// THE MORPH (see cursorStates.js): every state part is sampled ONCE into NPT points that correspond between all
// shapes, so any blend is a plain weighted sum with no shards. The parameter is (angle swept around the centroid)
// plus a little arc length: for star-shaped parts that is the angular sampling (arrow <-> scroll morph cleanly),
// and parts with notches (the double arrows) still keep their notches because arc length keeps advancing where the
// angle doubles back. All start at the west direction, all wind the same way. Coordinates are px about the hotspot.
export const NPT = 96;
const NSVG = "http://www.w3.org/2000/svg";
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; };
function samplePart(svg, d, scale, hot) {
  const p = document.createElementNS(NSVG, "path");
  p.setAttribute("d", d); svg.appendChild(p);
  const L = p.getTotalLength(), M = 300;
  let xs = new Float32Array(M), ys = new Float32Array(M), cx = 0, cy = 0;
  for (let i = 0; i < M; i++) { const q = p.getPointAtLength((L * i) / M); xs[i] = q.x; ys[i] = q.y; cx += q.x; cy += q.y; }
  svg.removeChild(p);
  cx /= M; cy /= M;
  let ang = Array.from(xs, (x, i) => Math.atan2(ys[i] - cy, x - cx)), sweep = 0;
  for (let i = 0; i < M; i++) sweep += wrap(ang[(i + 1) % M] - ang[i]);
  let idx = Array.from({ length: M }, (_, i) => i);
  if (sweep < 0) idx.reverse(); // one winding for every shape
  ang = idx.map((i) => ang[i]);
  const X = idx.map((i) => xs[i]), Y = idx.map((i) => ys[i]);
  let s0 = 0, best = 1e9; // start where the point's angle is closest to west (-pi); the farther one on ties
  for (let i = 0; i < M; i++) { const e = Math.abs(wrap(ang[i] + Math.PI)) - Math.hypot(X[i] - cx, Y[i] - cy) * 1e-4; if (e < best) { best = e; s0 = i; } }
  const U = new Float32Array(M + 1);
  for (let j = 0; j < M; j++) {
    const i = (s0 + j) % M, n = (s0 + j + 1) % M;
    U[j + 1] = U[j] + Math.abs(wrap(ang[n] - ang[i])) + 0.04 * Math.hypot(X[n] - X[i], Y[n] - Y[i]);
  }
  const out = new Float32Array(NPT * 2);
  let j = 0;
  for (let k = 0; k < NPT; k++) {
    const u = (U[M] * k) / NPT;
    while (j < M - 1 && U[j + 1] < u) j++;
    const t = (u - U[j]) / Math.max(1e-6, U[j + 1] - U[j]), i = (s0 + j) % M, n = (s0 + j + 1) % M;
    out[k * 2] = (X[i] + (X[n] - X[i]) * t - hot[0]) * scale;
    out[k * 2 + 1] = (Y[i] + (Y[n] - Y[i]) * t - hot[1]) * scale;
  }
  return out;
}
export function buildShape(svg, n) {
  const st = STATES[n];
  const ds = st.fig ? st.fig.parts : st.parts, scale = st.fig ? FS : 1, hot = st.fig ? st.fig.hot : [0, 0];
  const a = samplePart(svg, ds[0], scale, hot);
  let b;
  if (ds[1]) b = samplePart(svg, ds[1], scale, hot);
  else { // a second blob that is a point at the first one's centre: it can grow out of nothing
    let x = 0, y = 0; for (let i = 0; i < NPT; i++) { x += a[i * 2]; y += a[i * 2 + 1]; }
    b = new Float32Array(NPT * 2); for (let i = 0; i < NPT; i++) { b[i * 2] = x / NPT; b[i * 2 + 1] = y / NPT; }
  }
  return [a, b];
}
export function buildShapes(svg) {
  const out = {};
  for (const n of STATE_NAMES) out[n] = buildShape(svg, n);
  return out;
}

export default function ContextCursor() {
  const root = useRef(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    const el = root.current;
    if (!el) return undefined;
    const glass = el.querySelector(".cx__glass"), body = el.querySelector(".cx__body"), p1 = el.querySelector(".cx__g1"), p2 = el.querySelector(".cx__g2"), lab = el.querySelector(".cx__label"), orgG = el.querySelector(".cx__org"), orgP = el.querySelector(".cx__arrow");
    // Each state's outline is measured once (~700 path measurements, a few ms to ~100 ms each): one state per idle
    // slice, so the page never freezes for the whole ~16k; a paint that needs a state not built yet builds just that one.
    const SH = {};
    const svgEl = el.querySelector(".cx__svg");
    const shapeOf = (n) => SH[n] || (SH[n] = buildShape(svgEl, n));
    let alive = true, qi = 0, idleBuild = 0;
    const idleStep = () => {
      idleBuild = 0;
      if (!alive) return;
      while (qi < STATE_NAMES.length && SH[STATE_NAMES[qi]]) qi++;
      if (qi >= STATE_NAMES.length) return;
      shapeOf(STATE_NAMES[qi++]);
      idleBuild = window.requestIdleCallback ? window.requestIdleCallback(idleStep, { timeout: 2500 }) : setTimeout(idleStep, 120);
    };
    idleBuild = window.requestIdleCallback ? window.requestIdleCallback(idleStep, { timeout: 2500 }) : setTimeout(idleStep, 600);
    const NAMES = STATE_NAMES;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const KEYS = ["x", "y", "w", "h", "r", "sc", "ga", "g2a", "la", ...STATE_NAMES.map((n) => "w_" + n), "aa", "lean", "st", ...Array.from({ length: 20 }, (_, i) => "p" + i)];
    const V = {}, T = {}, D = {};
    KEYS.forEach((k) => { V[k] = 0; T[k] = 0; D[k] = 0; });
    V.w = T.w = 10; V.h = T.h = 10; V.r = T.r = 5;
    let raf = 0, last = 0, shown = false, down = false, state = "arrow", lstate = "", mx = 0, my = 0, native = false;
    let widths = {};
    document.fonts?.ready?.then(() => { widths = {}; }); // text measured before the web font loaded is wrong
    const measure = (text) => {
      if (widths[text] == null) { lab.textContent = text; widths[text] = lab.offsetWidth; }
      return widths[text];
    };
    const spring = (k, kk, c, dt) => { // semi-implicit, stiffness kk, damping c
      D[k] += ((T[k] - V[k]) * kk - D[k] * c) * dt; V[k] += D[k] * dt;
    };
    const paint = () => {
      el.style.transform = `translate3d(${V.x.toFixed(2)}px,${V.y.toFixed(2)}px,0) scale(${Math.max(0, V.sc).toFixed(3)})`;
      const w = Math.max(0, V.w), h = Math.max(0, V.h);
      body.setAttribute("x", (-w / 2).toFixed(2)); body.setAttribute("y", (-h / 2).toFixed(2));
      body.setAttribute("width", w.toFixed(2)); body.setAttribute("height", h.toFixed(2));
      body.setAttribute("rx", Math.max(0, Math.min(V.r, w / 2, h / 2)).toFixed(2));
      glass.style.width = w.toFixed(1) + "px"; glass.style.height = h.toFixed(1) + "px";
      glass.style.transform = `translate3d(${(-w / 2).toFixed(1)}px,${(-h / 2).toFixed(1)}px,0)`;
      glass.style.borderRadius = Math.max(0, Math.min(V.r, w / 2, h / 2)).toFixed(1) + "px";
      const gx = lstate ? -(w / 2) + PAD_L + 2 : 0;
      const pts = (o) => { let s = ""; for (let i = 0; i < 5; i++) s += (V["p" + (o + i * 2)] + gx).toFixed(2) + "," + V["p" + (o + i * 2 + 1)].toFixed(2) + " "; return s; };
      p1.setAttribute("points", pts(0)); p2.setAttribute("points", pts(10));
      p1.style.opacity = Math.max(0, Math.min(1, V.ga)).toFixed(3); p2.style.opacity = Math.max(0, Math.min(1, V.g2a)).toFixed(3);
      lab.style.opacity = Math.max(0, Math.min(1, V.la)).toFixed(3);
      lab.style.transform = `translate3d(${(gx + 9).toFixed(1)}px,-50%,0)`;
      // the organic arrow: a weighted sum of the three outlines (weights are springs), leaning and
      // stretching a little with pointer speed; skipped entirely when it is not the visible shape
      if (V.aa > 0.01 || T.aa > 0) {
        const act = []; // only the states with weight right now (usually one or two)
        for (const n of NAMES) { const w = V["w_" + n]; if (w > 0.004 || w < -0.004) act.push([shapeOf(n), w]); }
        let d = "";
        for (let sub = 0; sub < 2; sub++) {
          for (let i = 0; i < NPT * 2; i += 2) {
            let x = 0, y = 0;
            for (let j = 0; j < act.length; j++) { const P = act[j][0][sub], w = act[j][1]; x += w * P[i]; y += w * P[i + 1]; }
            d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
          }
          d += "Z";
        }
        orgP.setAttribute("d", d);
        orgG.setAttribute("transform", `rotate(${V.lean.toFixed(2)}) scale(${(Math.max(0, V.aa) * (1 + V.st * 0.6)).toFixed(3)} ${(Math.max(0, V.aa) * (1 - V.st * 0.35)).toFixed(3)})`);
      }
    };
    const frame = (now) => {
      let left = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      let busy = false;
      const H = 1 / 240; // fixed sub-steps keep the stiff position spring stable at any frame rate
      while (left > 1e-6) {
        const dt = Math.min(H, left); left -= dt;
        for (const k of KEYS) { const pos = k === "x" || k === "y"; spring(k, pos ? 1300 : 420, pos ? 62 : 27, dt); }
      }
      for (const k of KEYS) if (Math.abs(T[k] - V[k]) > 0.02 || Math.abs(D[k]) > 0.05) busy = true;
      paint();
      raf = busy ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => { if (reduce) { for (const k of KEYS) { V[k] = T[k]; D[k] = 0; } paint(); } else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const apply = (s, label) => {
      const sp = S[s];
      state = s;
      el.setAttribute("data-s", s);
      const text = label || "";
      const gl = G[sp.g];
      const hasG = sp.g !== "none";
      lstate = text;
      if (text) lab.textContent = text;
      // a label sizes the pill to its text (measured once per string, capped at 180 px by the CSS
      // ellipsis); height stays constant and the radius a full pill. No label: the state's own size.
      if (text) { T.w = Math.round(measure(text) + (hasG ? PAD_L + 14 + 8 : 28)); T.h = 34; T.r = 17; }
      else { T.w = sp.w; T.h = sp.h; T.r = sp.r; }
      for (let i = 0; i < 10; i++) { T["p" + i] = gl[0][i]; T["p" + (10 + i)] = gl[1][i]; }
      T.ga = hasG ? 1 : 0; T.g2a = gl[1] !== Z ? 1 : 0; T.la = text ? 1 : 0;
      for (const n of NAMES) T["w_" + n] = sp.org === n ? 1 : 0;
      T.aa = sp.org ? 1 : 0;
      if (sp.org) el.setAttribute("data-org", ""); else el.removeAttribute("data-org");
      if (STATES[sp.org]?.spin) el.setAttribute("data-spin", ""); else el.removeAttribute("data-spin");
      kick();
    };
    let key = "", scrolling = false, scrollT = 0, calmT = 0, lx = 0, ly = 0, lt = 0;
    const refresh = (t) => { const r = resolve(t, down, mx, my); if (scrolling && (r.s === "arrow" || r.s === "hover")) r.s = "scroll"; const k = r.s + "|" + (r.label || ""); if (k !== key) { key = k; apply(r.s, r.label); } };
    const show = (on) => { shown = on; T.sc = on ? (down ? 0.88 : 1) : 0; if (on && !native) { native = true; document.documentElement.classList.add("cx-on"); } kick(); };

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const nowT = e.timeStamp, dtm = Math.max(1, nowT - lt);
      if (lt && dtm < 80) { // pointer velocity -> a little lean and stretch (reset when the pointer stops)
        const vx = (e.clientX - lx) / dtm, vy = (e.clientY - ly) / dtm;
        T.lean = Math.max(-14, Math.min(14, vx * 7)); T.st = Math.min(0.16, Math.hypot(vx, vy) * 0.07);
        clearTimeout(calmT); calmT = setTimeout(() => { T.lean = 0; T.st = 0; kick(); }, 90);
      }
      lx = e.clientX; ly = e.clientY; lt = nowT;
      mx = e.clientX; my = e.clientY; T.x = mx; T.y = my;
      if (!shown) { V.x = mx; V.y = my; D.x = D.y = 0; show(true); }
      refresh(e.target); kick();
    };
    const onDown = (e) => { down = true; T.sc = shown ? 0.88 : 0; refresh(e.target); kick(); };
    const onUp = (e) => { down = false; T.sc = shown ? 1 : 0; refresh(document.elementFromPoint(mx, my) || e.target); kick(); };
    // hide only when the pointer really leaves the window: while the page scrolls, scrollHover.js (endHover) dispatches
    // synthetic mouseouts with no relatedTarget to drop hover states; those must not hide the cursor (isTrusted)
    const onLeave = (e) => { if (e.isTrusted && !e.relatedTarget && (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth - 1 || e.clientY >= window.innerHeight - 1)) show(false); };
    const onEnter = () => { /* the next pointermove shows it */ };
    const onTouch = () => { show(false); };
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } };
    // content under a stationary pointer changes when the page scrolls
    let st = 0;
    // the SCROLL shape while the page is being scrolled (document scroll or wheel, not inner carousels)
    const markScroll = () => {
      if (!shown) return;
      if (!scrolling) { scrolling = true; if (state === "arrow" || state === "hover") { key = "scroll|"; apply("scroll"); } }
      clearTimeout(scrollT);
      scrollT = setTimeout(() => { scrolling = false; key = ""; const t = document.elementFromPoint(mx, my); if (t) refresh(t); }, 220);
    };
    const onWheel = () => markScroll();
    const onScroll = (e) => { if (e && (e.target === document || e.target === document.scrollingElement)) markScroll(); if (!shown || st) return; st = requestAnimationFrame(() => { st = 0; const t = document.elementFromPoint(mx, my); if (t) refresh(t); }); };

    T.sc = 0; V.sc = 0; apply("arrow");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    document.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      alive = false; cancelAnimationFrame(raf); cancelAnimationFrame(st); if (window.cancelIdleCallback) window.cancelIdleCallback(idleBuild); else clearTimeout(idleBuild);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("wheel", onWheel); clearTimeout(scrollT); clearTimeout(calmT);
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("touchstart", onTouch);
      document.documentElement.classList.remove("cx-on");
    };
  }, []);
  return (
    <div className="cx" ref={root} aria-hidden="true" data-s="arrow">
      <span className="cx__glass" />
      <svg className="cx__svg" width="1" height="1" overflow="visible">
        <rect className="cx__body" />
        <g className="cx__org"><g className="cx__org-in"><path className="cx__arrow" /></g></g>
        <polyline className="cx__g1" fill="none" />
        <polyline className="cx__g2" fill="none" />
      </svg>
      <span className="cx__label" />
    </div>
  );
}
