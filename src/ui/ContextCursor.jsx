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
import "./contextCursor.css";

// glyphs: two polylines of 5 points (x,y)*5 each; "z" collapses to the centre
const Z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const G = {
  none: [Z, Z],
  ext: [[-4, 4, 4, -4, -1, -4, 4, -4, 4, 1], Z],
  view: [[-4, 4, 4, -4, -1, -4, 4, -4, 4, 1], Z],
  play: [[-3, -4.5, 4.5, 0, -3, 4.5, -3, -4.5, -3, -4.5], Z],
  up: [[-4, 1.5, 0, -3.5, 4, 1.5, 0, -3.5, 0, 4.5], Z],
  rotate: [[-5, 1, -3.5, -3.5, 0, -5, 3.5, -3.5, 5, 1], [5, 1, 3, 2.5, 5, 1, 5, 1, 5, 1]],
  lock: [[-4, -1, 4, -1, 4, 5, -4, 5, -4, -1], [-2.5, -1, -2.5, -3.5, 0, -5, 2.5, -3.5, 2.5, -1]],
};
// state -> target shape. label null = none. w:null = fit the label.
const S = {
  dot: { w: 10, h: 10, r: 5, g: "none" },
  link: { w: 26, h: 26, r: 13, g: "none" },
  ext: { w: 34, h: 34, r: 17, g: "ext" },
  view: { w: null, h: 34, r: 17, g: "view", label: "View" },
  lock: { w: null, h: 34, r: 17, g: "lock", label: "Locked" },
  drag: { w: null, h: 34, r: 17, g: "none", label: "Drag" },
  grab: { w: 22, h: 22, r: 11, g: "none" },
  play: { w: 44, h: 44, r: 22, g: "play" },
  text: { w: 2, h: 24, r: 1, g: "none" },
  rotate: { w: 44, h: 44, r: 22, g: "rotate" },
  up: { w: 44, h: 44, r: 22, g: "up" },
};
const PAD_L = 12; // label pills: glyph slot + gap on the left when a glyph is present

const EXT = (a) => a.target === "_blank" || (a.host && a.host !== location.host);
const hit = (sel, x, y) => { const n = document.querySelector(sel); if (!n) return false; const r = n.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
function resolve(t, down, x, y) {
  if (!(t instanceof Element)) return { s: "dot" };
  const xe = t.closest("[data-cursor]");
  if (xe) {
    const s = xe.getAttribute("data-cursor");
    return { s: S[s] ? s : "dot", label: xe.getAttribute("data-cursor-label") || undefined };
  }
  if (t.closest("video")) { const v = t.closest("video"); return { s: "play", label: v.paused ? "Play" : "Pause" }; }
  if (t.closest("input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable=true]")) return { s: "text" };
  if (t.closest(".is-locked")) return { s: "lock" };
  if (t.closest(".hf__bang")) return { s: down ? "grab" : "drag" };
  if (t.closest(".hero-morph__btn, .hero-morph__cv") || hit(".hero-morph__cv", x, y)) return { s: "rotate" }; // the 3D face: the glyph only, no text
  if (t.closest(".wscene-warm-pill__btn") || hit(".wscene-warm-pill__btn", x, y)) return { s: "up" };
  if (t.closest(".sq__track")) return { s: down ? "grab" : "drag" };
  if (t.closest("[data-project], .wg__card, .work__item")) return { s: "view" };
  const a = t.closest("a[href]");
  if (a) return { s: EXT(a) ? "ext" : "link" };
  if (t.closest("button, [role=button], [role=link], summary, label, select")) return { s: "link" };
  return { s: "dot" };
}

export default function ContextCursor() {
  const root = useRef(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    const el = root.current;
    if (!el) return undefined;
    const body = el.querySelector(".cx__body"), p1 = el.querySelector(".cx__g1"), p2 = el.querySelector(".cx__g2"), lab = el.querySelector(".cx__label");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const KEYS = ["x", "y", "w", "h", "r", "sc", "ga", "g2a", "la", ...Array.from({ length: 20 }, (_, i) => "p" + i)];
    const V = {}, T = {}, D = {};
    KEYS.forEach((k) => { V[k] = 0; T[k] = 0; D[k] = 0; });
    V.w = T.w = 10; V.h = T.h = 10; V.r = T.r = 5;
    let raf = 0, last = 0, shown = false, down = false, state = "dot", lstate = "", mx = 0, my = 0, native = false;
    const widths = {};
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
      const gx = lstate ? -(w / 2) + PAD_L + 2 : 0;
      const pts = (o) => { let s = ""; for (let i = 0; i < 5; i++) s += (V["p" + (o + i * 2)] + gx).toFixed(2) + "," + V["p" + (o + i * 2 + 1)].toFixed(2) + " "; return s; };
      p1.setAttribute("points", pts(0)); p2.setAttribute("points", pts(10));
      p1.style.opacity = Math.max(0, Math.min(1, V.ga)).toFixed(3); p2.style.opacity = Math.max(0, Math.min(1, V.g2a)).toFixed(3);
      lab.style.opacity = Math.max(0, Math.min(1, V.la)).toFixed(3);
      lab.style.transform = `translate3d(${(gx + 9).toFixed(1)}px,-50%,0)`;
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
      const text = label || sp.label || "";
      const gl = G[sp.g];
      const hasG = sp.g !== "none";
      lstate = text;
      if (text) lab.textContent = text;
      T.w = sp.w ?? Math.round(measure(text) + (hasG ? PAD_L + 14 + 8 : 28));
      T.h = sp.h; T.r = sp.r;
      for (let i = 0; i < 10; i++) { T["p" + i] = gl[0][i]; T["p" + (10 + i)] = gl[1][i]; }
      T.ga = hasG ? 1 : 0; T.g2a = gl[1] !== Z ? 1 : 0; T.la = text ? 1 : 0;
      kick();
    };
    let key = "";
    const refresh = (t) => { const r = resolve(t, down, mx, my); const k = r.s + "|" + (r.label || ""); if (k !== key) { key = k; apply(r.s, r.label); } };
    const show = (on) => { shown = on; T.sc = on ? (down ? 0.88 : 1) : 0; if (on && !native) { native = true; document.documentElement.classList.add("cx-on"); } kick(); };

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      mx = e.clientX; my = e.clientY; T.x = mx; T.y = my;
      if (!shown) { V.x = mx; V.y = my; D.x = D.y = 0; show(true); }
      refresh(e.target); kick();
    };
    const onDown = (e) => { down = true; T.sc = shown ? 0.88 : 0; refresh(e.target); kick(); };
    const onUp = (e) => { down = false; T.sc = shown ? 1 : 0; refresh(document.elementFromPoint(mx, my) || e.target); kick(); };
    const onLeave = (e) => { if (!e.relatedTarget && !e.toElement) show(false); };
    const onEnter = () => { /* the next pointermove shows it */ };
    const onTouch = () => { show(false); };
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } };
    // content under a stationary pointer changes when the page scrolls
    let st = 0;
    const onScroll = () => { if (!shown || st) return; st = requestAnimationFrame(() => { st = 0; const t = document.elementFromPoint(mx, my); if (t) refresh(t); }); };

    T.sc = 0; V.sc = 0; apply("dot");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    document.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(st);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("touchstart", onTouch);
      document.documentElement.classList.remove("cx-on");
    };
  }, []);
  return (
    <div className="cx" ref={root} aria-hidden="true" data-s="dot">
      <svg className="cx__svg" width="1" height="1" overflow="visible">
        <rect className="cx__body" />
        <polyline className="cx__g1" fill="none" />
        <polyline className="cx__g2" fill="none" />
      </svg>
      <span className="cx__label" />
    </div>
  );
}
