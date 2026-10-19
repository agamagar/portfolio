// Hero v4 / v5: the headline with the live 3D face inline in it, spanning two lines with the words flowing
// around it (the reference's shells). v4 is centred, v5 ranged left.
//
// THE FACE CAN BE DRAGGED ANYWHERE IN THE HEADLINE and the text adapts. Layout is done here, not by CSS: the
// headline is 12 absolutely positioned words and the face, each placed with a transform from one pure function
// (layoutHeadline). That is what makes a reserved two-line slot at ANY word gap possible (CSS cannot flow
// words around a box that sits mid-paragraph), and it makes the reflow animation free: a drop sets new
// transforms and a CSS transition (the FLIP) carries every word and the face to them.
//  - the word widths are measured once (and again on a font load or a resize), never during a drag
//  - a drag only moves the face (transform) and a caret at the nearest word gap; the reflow runs once, on drop
//  - a click (under 6 px of travel) is untouched: the face's own button (HeroMorph) gets it, style swap and all
//  - keyboard: arrow keys on the focused face move it a word; touch: long-press, then drag
//  - the slot is remembered for the visit (sessionStorage); reduced motion: no springs, the layout snaps
// The face is v1's stack verbatim (MorphFace + HeroMorph + the wave hand); the words join the load sequence
// as .hv4__t.
import { useEffect, useLayoutEffect, useRef } from "react";
import MorphFace from "../MorphFace";
import HeroMorph from "./HeroMorph";
import { Guard } from "../ui/Guard";
import "./heroV4.css";

export const HERO_V4_COPY = "Hello! I’m Agam, a designer at the intersection of play and tech.";
const WORDS = HERO_V4_COPY.split(" ");
const N = WORDS.length;
// metrics as ratios of the font size (heroV4.css: line-height 1.15, face 2.14 x 2.3)
const LH = 1.15, FW = 2.14, FH = 2.3, SPACE = 0.25, GAP = 0.3, TOL = 0.6;
const DRAG_PX = 6, LONG_PRESS = 350;
const SLOT_KEY = "hv4-slot";

const readSlot = () => {
  try { const v = sessionStorage.getItem(SLOT_KEY); if (v !== null) { const n = +v; if (Number.isInteger(n) && n >= 0 && n <= N) return n; } } catch { /* storage blocked */ }
  return null;
};
const saveSlot = (g) => { try { sessionStorage.setItem(SLOT_KEY, String(g)); } catch { /* storage blocked */ } };

/** Pure: positions for every word and the face. Units are px.
 *  widths: word widths; g: the face sits before word g; hints: word indices that start a row (the designed
 *  default breaks, only until the visitor moves the face); center: v4's centred rows. */
function layoutHeadline({ widths, g, W, fs, hints, center }) {
  const space = SPACE * fs, gap = GAP * fs, F = FW * fs, lh = LH * fs, tol = TOL * fs;
  const span = (list) => list.reduce((s, i) => s + widths[i], 0) + Math.max(0, list.length - 1) * space;
  let i = 0;
  // take words from i while they fit in `max` (a word alone in a full row is taken even if too wide), stopping at
  // `limit` and before a hinted row start
  const fill = (max, { limit = N, force = false } = {}) => {
    const out = [];
    while (i < limit) {
      if (out.length && hints.has(i)) break;
      const w = out.length ? span(out) + space + widths[i] : widths[i];
      if (w > max && !(force && !out.length)) break;
      out.push(i++);
    }
    return out;
  };
  const rows = []; // { items:[idx], kind } for normal rows; the face rows are one entry with a/b/c/d
  let faceRow = null;
  while (i < N || !faceRow) {
    if (!faceRow) {
      const A = fill(W, { limit: g, force: true });
      if (i < g) { rows.push({ words: A }); continue; } // a full row of words before the face
      const wA = A.length ? span(A) : 0;
      let placeA = A, x = A.length ? wA + gap : 0;
      if (x + F > W && A.length) { rows.push({ words: A }); placeA = []; x = 0; } // no room: the face starts a row
      const wa = placeA.length ? span(placeA) : 0;
      const Rest = W - (wa + tol) - 2 * gap - F; // right-hand room, assuming the left may reach wA + tol
      const B = fill(Math.max(0, Rest));
      const C = fill(Math.max(0, wa + tol));
      const D = fill(Math.max(0, Rest));
      faceRow = { A: placeA, B, C, D };
      rows.push(faceRow);
      rows.push(null); // the face's second row is part of the same entry
      continue;
    }
    rows.push({ words: fill(W, { force: true }) });
  }
  const pos = new Array(N), out = { pos, face: { x: 0, y: 0 } };
  let y = 0;
  for (const r of rows) {
    if (r === null) { y += lh; continue; }
    if (!r.words) { // the face rows
      const wL = Math.max(r.A.length ? span(r.A) : 0, r.C.length ? span(r.C) : 0);
      const wR = Math.max(r.B.length ? span(r.B) : 0, r.D.length ? span(r.D) : 0);
      let fx, rx;
      if (center) {
        const T = Math.max(wL, wR), x0 = (W - (2 * T + F + 2 * gap)) / 2;
        fx = x0 + T + gap; rx = fx + F + gap;
        const put = (list, yy) => { let x = x0 + T - (list.length ? span(list) : 0); for (const k of list) { pos[k] = { x, y: yy }; x += widths[k] + space; } };
        put(r.A, y); put(r.C, y + lh);
      } else {
        fx = wL + (wL ? gap : 0); rx = fx + F + gap;
        for (const [list, yy] of [[r.A, y], [r.C, y + lh]]) { let x = 0; for (const k of list) { pos[k] = { x, y: yy }; x += widths[k] + space; } }
      }
      for (const [list, yy] of [[r.B, y], [r.D, y + lh]]) { let x = rx; for (const k of list) { pos[k] = { x, y: yy }; x += widths[k] + space; } }
      out.face = { x: fx, y };
      y += lh; // the face rows: this one, then the null entry's
      continue;
    }
    let x = center ? (W - (r.words.length ? span(r.words) : 0)) / 2 : 0;
    for (const k of r.words) { pos[k] = { x, y }; x += widths[k] + space; }
    y += lh;
  }
  out.height = Math.max(y, lh) + 0.1 * fs;
  return out;
}

/** The candidate drop points, one or two per word gap (a gap at a line break has an end and a start). */
function gapPoints(L, widths, fs) {
  const lh = LH * fs, pts = [];
  const mid = (k) => L.pos[k].y + lh / 2;
  for (let g = 0; g <= N; g++) {
    const prev = g > 0 ? L.pos[g - 1] : null, next = g < N ? L.pos[g] : null;
    if (prev && next && Math.abs(prev.y - next.y) < 1) pts.push({ g, x: (prev.x + widths[g - 1] + next.x) / 2, y: mid(g - 1) });
    else {
      if (prev) pts.push({ g, x: prev.x + widths[g - 1], y: mid(g - 1) });
      if (next) pts.push({ g, x: next.x, y: mid(g) });
    }
  }
  return pts;
}

export default function HeroV4({ left = false, flyerRef, stage, reduce, replayId, replayGreeting }) {
  const head = useRef(null), face = useRef(null), caret = useRef(null), live = useRef(null);
  const S = useRef({ g: 6, hints: true, widths: null, L: null, fs: 36, drag: null, suppress: false, raf: 0 }).current;
  const wordEls = () => [...head.current.querySelectorAll(".hv4__t")];

  // ---- layout: measure (once, and on font load / resize), place ----
  const place = (animate) => {
    const h = head.current; if (!h) return;
    const els = wordEls();
    if (!S.widths) S.widths = els.map((e) => e.offsetWidth);
    S.fs = parseFloat(getComputedStyle(h).fontSize) || 36;
    const room = h.parentElement.clientWidth || 600;
    const phone = window.matchMedia("(max-width: 720px)").matches;
    const hints = S.hints ? new Set(phone ? [5] : [4]) : new Set();
    S.L = layoutHeadline({ widths: S.widths, g: S.g, W: room, fs: S.fs, hints, center: !left });
    h.style.width = room + "px";
    h.style.height = S.L.height + "px";
    if (animate && !reduce) {
      h.classList.add("hv4--animate");
      clearTimeout(S.t); S.t = setTimeout(() => h.classList.remove("hv4--animate"), 800);
    }
    els.forEach((e, k) => { e.style.transform = `translate(${S.L.pos[k].x.toFixed(1)}px, ${S.L.pos[k].y.toFixed(1)}px)`; });
    face.current.style.transform = `translate(${S.L.face.x.toFixed(1)}px, ${S.L.face.y.toFixed(1)}px)`;
    h.dataset.ready = "";
  };
  // a version's default slot: before "the" (phones: before "intersection"), unless the visitor moved it this visit
  const initSlot = () => {
    const saved = readSlot();
    const phone = window.matchMedia("(max-width: 720px)").matches;
    S.g = saved ?? (phone ? 7 : 6);
    S.hints = saved === null;
  };
  useLayoutEffect(() => { S.widths = null; initSlot(); place(false); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let off = false, raf = 0;
    const redo = (measure) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (off) return; if (measure) S.widths = null; place(false); }); };
    document.fonts?.ready?.then(() => redo(true));
    const ro = new ResizeObserver(() => redo(false));
    ro.observe(head.current.parentElement);
    return () => { off = true; cancelAnimationFrame(raf); ro.disconnect(); };
  }, [left, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const moveTo = (g) => {
    g = Math.max(0, Math.min(N, g));
    S.hints = false; S.g = g; saveSlot(g);
    place(true);
    if (live.current) live.current.textContent = g >= N ? "Face moved to the end" : `Face moved before “${WORDS[g]}”`;
  };

  // ---- drag ----
  const nearest = (cx, cy) => { // the face's centre -> the closest gap (its top row's middle)
    const lh = LH * S.fs; let best = null, bd = Infinity;
    for (const p of S.drag.pts) { const d = (p.x - cx) ** 2 + ((p.y - (cy - lh / 2)) * 1.4) ** 2; if (d < bd) { bd = d; best = p; } }
    return best;
  };
  const frame = (now) => {
    S.raf = 0;
    const d = S.drag; if (!d) return;
    const dt = Math.min(0.05, (now - (d.last || now)) / 1000); d.last = now;
    const k = reduce ? 1 : 1 - Math.exp(-dt / 0.045); // follows the pointer with a short spring-like lag
    d.x += (d.tx - d.x) * k; d.y += (d.ty - d.y) * k;
    face.current.style.transform = `translate(${d.x.toFixed(1)}px, ${d.y.toFixed(1)}px) scale(${reduce ? 1 : 1.06})`;
    if (Math.abs(d.tx - d.x) > 0.3 || Math.abs(d.ty - d.y) > 0.3) S.raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!S.raf) S.raf = requestAnimationFrame(frame); };
  const begin = (e) => {
    const d = S.drag; d.active = true;
    face.current.setPointerCapture?.(d.id);
    head.current.classList.add("hv4--drag");
    document.documentElement.classList.add("hv4-grabbing");
    d.pts = gapPoints(S.L, S.widths, S.fs); // measured once, at drag start
    d.x = d.tx = S.L.face.x; d.y = d.ty = S.L.face.y; d.fx = S.L.face.x; d.fy = S.L.face.y; d.last = performance.now();
    d.p0 = { x: e.clientX, y: e.clientY };
  };
  const end = (cancel) => {
    const d = S.drag; if (!d) return;
    clearTimeout(d.timer);
    S.drag = null;
    if (!d.active) return;
    cancelAnimationFrame(S.raf); S.raf = 0;
    head.current.classList.remove("hv4--drag");
    document.documentElement.classList.remove("hv4-grabbing");
    caret.current.style.opacity = "0";
    S.suppress = true; setTimeout(() => { S.suppress = false; }, 60); // the click the browser sends after a drag
    if (cancel || d.g === undefined) { place(true); return; }
    moveTo(d.g);
  };
  const onDown = (e) => {
    if (e.button > 0 || S.drag) return;
    S.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, type: e.pointerType, active: false, armed: e.pointerType !== "touch" };
    if (e.pointerType === "touch") S.drag.timer = setTimeout(() => { if (S.drag) { S.drag.armed = true; begin({ clientX: S.drag.x0, clientY: S.drag.y0 }); kick(); } }, LONG_PRESS);
  };
  const onMove = (e) => {
    const d = S.drag; if (!d || e.pointerId !== d.id) return;
    const moved = Math.hypot(e.clientX - d.x0, e.clientY - d.y0);
    if (!d.active) {
      if (d.type === "touch") { if (moved > 10 && !d.armed) { clearTimeout(d.timer); S.drag = null; } return; }
      if (moved < DRAG_PX) return;
      begin(e);
    }
    d.tx = d.fx + (e.clientX - d.p0.x); d.ty = d.fy + (e.clientY - d.p0.y);
    const hit = nearest(d.tx + FW * S.fs / 2, d.ty + FH * S.fs / 2);
    if (hit) {
      d.g = hit.g;
      caret.current.style.transform = `translate(${hit.x.toFixed(1)}px, ${(hit.y - LH * S.fs / 2).toFixed(1)}px)`;
      caret.current.style.opacity = "1";
    }
    kick();
  };
  const onKey = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    moveTo(S.g + (e.key === "ArrowRight" ? 1 : -1));
  };
  // a click that ended a drag is not a click on the face (HeroMorph's button would swap the style)
  const onClickCapture = (e) => { if (S.suppress) { e.stopPropagation(); e.preventDefault(); } };

  return (
    <div className={left ? "hv4 hv4--left" : "hv4"}>
      <h1 className="hv4__head" ref={head} data-calm aria-labelledby="hello-hero-title">
        <span className="hello-hero__sr" id="hello-hero-title">{HERO_V4_COPY}</span>
        {WORDS.map((w, i) => <span key={i} className="hv4__t" aria-hidden>{w}</span>)}
        <span className="hv4__caret" ref={caret} aria-hidden />
        <span
          className="hv4__face"
          ref={face}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={() => end(false)}
          onPointerCancel={() => end(true)}
          onKeyDown={onKey}
          onClickCapture={onClickCapture}
          title="Drag me anywhere in the text"
        >
          <span className="hello-hero__flyer hv4__flyer" ref={flyerRef}>
            <span className="header__avatar-wrap" onMouseEnter={replayGreeting}>
              <MorphFace key={`face-${replayId}`} still />
              <Guard name="hero-morph"><HeroMorph ready={stage === "reveal"} /></Guard>
              {!reduce && (
                <span className="header__wave" data-kind="wave" aria-hidden key={`wave-${replayId}`}>
                  <img className="header__wave-img" src="/wave.svg" alt="" width="26" height="26" />
                </span>
              )}
            </span>
          </span>
        </span>
        <span className="hello-hero__sr" role="status" aria-live="polite" ref={live} />
      </h1>
    </div>
  );
}
