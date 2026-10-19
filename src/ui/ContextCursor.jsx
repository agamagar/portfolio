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
  // the organic arrow scenarios (shape drawn from FIG, no pill)
  arrow: { w: 0, h: 0, r: 0, g: "none", org: "arrow" },
  hover: { w: 0, h: 0, r: 0, g: "none", org: "hover" },
  scroll: { w: 0, h: 0, r: 0, g: "none", org: "scroll" },
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
  if (!(t instanceof Element)) return { s: "arrow" };
  const xe = t.closest("[data-cursor]");
  if (xe) {
    const s = xe.getAttribute("data-cursor");
    return { s: s === "link" ? "hover" : S[s] ? s : "arrow", label: xe.getAttribute("data-cursor-label") || undefined };
  }
  if (t.closest("video")) { const v = t.closest("video"); return { s: "play", label: v.paused ? "Play" : "Pause" }; }
  if (t.closest("input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable=true]")) return { s: "text" };
  if (t.closest(".is-locked")) return { s: "lock" };
  if (t.closest(".hf__bang, .hv2__bang")) return { s: down ? "grab" : "drag" };
  if (t.closest(".hero-morph__btn, .hero-morph__cv") || hit(".hero-morph__cv", x, y)) return { s: "rotate" }; // the 3D face: the glyph only, no text
  if (t.closest(".wscene-warm-pill__btn") || hit(".wscene-warm-pill__btn", x, y)) return { s: "up" };
  if (t.closest(".sq__track")) return { s: down ? "grab" : "drag" };
  if (t.closest("[data-project], .wg__card, .work__item")) return { s: "view" };
  const a = t.closest("a[href]");
  if (a) return { s: EXT(a) ? "ext" : "hover" };
  if (t.closest("button, [role=button], [role=link], summary, label, select")) return { s: "hover" };
  return { s: "arrow" };
}


// AGAM'S ORGANIC CURSOR (Figma Portfolio-2026, section 1647:5325, three 360 x 360 scenarios): DEFAULT is a
// chunky rounded pointer arrow; HOVER the same arrow with its tail swept into one curve; SCROLL splits it into
// two opposed spikes. They are morphed as outlines: each is sampled once into NPT evenly spaced points
// (starting at the tip, same winding), so any blend of the three is just a weighted sum of point arrays, with
// every weight on its own spring (gentle overshoot = the organic feel). Coordinates are relative to each
// shape's hotspot (the arrow tip; the centre for scroll) and scaled by FS to cursor size.
const FIG = {
  arrow: "M153.852 295.071L56.2051 73.7915C51.755 63.707 62.1147 53.4612 72.1494 58.0224L292.058 157.981C302.471 162.714 300.987 177.948 289.857 180.583L201.5 201.5L176.406 293.388C173.43 304.287 158.413 305.408 153.852 295.071Z",
  hover: "M152.321 264.257L88.4511 88.6154C84.9417 78.9648 94.3869 69.6512 103.987 73.2956L276.28 138.699C287.068 142.795 286.423 158.268 275.332 161.452L254.132 167.539C223.556 176.316 198.981 199.118 187.941 228.952L174.853 264.321C170.975 274.8 156.139 274.758 152.321 264.257Z",
  top: "M129.673 156.103L171.224 44.3109C173.171 39.074 180.491 38.8391 182.769 43.9406L231.643 153.383C233.695 157.976 228.687 162.52 224.314 160.033C197.756 144.927 165.067 145.538 139.093 161.627L137.571 162.57C133.202 165.276 127.882 160.921 129.673 156.103Z",
  bot: "M231.162 215.447L185.914 316.491C183.696 321.444 176.649 321.399 174.494 316.419L130.382 214.471C128.379 209.843 133.528 205.39 137.82 208.038C163.556 223.921 195.913 224.474 222.176 209.478L223.651 208.636C228.131 206.078 233.271 210.738 231.162 215.447Z",
};
const NPT = 72, FS = 0.075;
function outline(svg, d, start, hot) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d); svg.appendChild(p);
  const L = p.getTotalLength();
  let pts = Array.from({ length: NPT }, (_, i) => { const q = p.getPointAtLength((L * i) / NPT); return [q.x, q.y]; });
  svg.removeChild(p);
  let area = 0; // one winding for every shape, so points correspond
  for (let i = 0; i < NPT; i++) { const a = pts[i], b = pts[(i + 1) % NPT]; area += a[0] * b[1] - b[0] * a[1]; }
  if (area < 0) pts.reverse();
  let k = 0, best = 1e9; // rotate to start at the tip
  pts.forEach((q, i) => { const dd = (q[0] - start[0]) ** 2 + (q[1] - start[1]) ** 2; if (dd < best) { best = dd; k = i; } });
  pts = pts.slice(k).concat(pts.slice(0, k));
  const out = new Float32Array(NPT * 2);
  pts.forEach((q, i) => { out[i * 2] = (q[0] - hot[0]) * FS; out[i * 2 + 1] = (q[1] - hot[1]) * FS; });
  return out;
}
function buildShapes(svg) {
  const A = outline(svg, FIG.arrow, [62, 62], [62, 62]), Hh = outline(svg, FIG.hover, [92, 75], [92, 75]);
  const T = outline(svg, FIG.top, [177, 41], [180, 180]), B = outline(svg, FIG.bot, [180, 318], [180, 180]);
  const mid = (P) => { let x = 0, y = 0; for (let i = 0; i < NPT; i++) { x += P[i * 2]; y += P[i * 2 + 1]; } const o = new Float32Array(NPT * 2); for (let i = 0; i < NPT; i++) { o[i * 2] = x / NPT; o[i * 2 + 1] = y / NPT; } return o; };
  // the second blob of the arrow shapes is a point inside the arrow: it grows into the lower spike on scroll
  return { arrow: [A, mid(A)], hover: [Hh, mid(Hh)], scroll: [T, B] };
}

export default function ContextCursor() {
  const root = useRef(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    const el = root.current;
    if (!el) return undefined;
    const glass = el.querySelector(".cx__glass"), body = el.querySelector(".cx__body"), p1 = el.querySelector(".cx__g1"), p2 = el.querySelector(".cx__g2"), lab = el.querySelector(".cx__label"), orgG = el.querySelector(".cx__org"), orgP = el.querySelector(".cx__arrow");
    const SH = buildShapes(el.querySelector(".cx__svg"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const KEYS = ["x", "y", "w", "h", "r", "sc", "ga", "g2a", "la", "wa", "wh", "ws", "aa", "lean", "st", ...Array.from({ length: 20 }, (_, i) => "p" + i)];
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
        let d = "";
        for (let sub = 0; sub < 2; sub++) {
          const a = SH.arrow[sub], h = SH.hover[sub], c = SH.scroll[sub];
          for (let i = 0; i < NPT * 2; i += 2) {
            d += (i ? "L" : "M") + (V.wa * a[i] + V.wh * h[i] + V.ws * c[i]).toFixed(2) + " " + (V.wa * a[i + 1] + V.wh * h[i + 1] + V.ws * c[i + 1]).toFixed(2);
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
      const text = label || sp.label || "";
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
      T.wa = sp.org === "arrow" ? 1 : 0; T.wh = sp.org === "hover" ? 1 : 0; T.ws = sp.org === "scroll" ? 1 : 0; T.aa = sp.org ? 1 : 0;
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
      cancelAnimationFrame(raf); cancelAnimationFrame(st);
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
