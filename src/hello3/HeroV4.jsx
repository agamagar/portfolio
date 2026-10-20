// Hero v4 / v5: the headline with the live 3D face inline in it, spanning two lines with the words flowing
// around it (the reference's shells). v4 is centred, v5 ranged left.
//
// THE FACE CAN BE DRAGGED ANYWHERE IN THE HEADLINE and the text adapts. Layout is done here, not by CSS: the
// headline is 12 absolutely positioned words and the face, each placed with a transform from one pure function
// (layoutHeadline). That is what makes a reserved two-line slot at ANY word gap possible (CSS cannot flow
// words around a box that sits mid-paragraph), and it makes the reflow animation free: a drop sets new
// transforms and a CSS transition (the FLIP) carries every word and the face to them.
//  - the word widths are measured once (and again on a font load or a resize), never during a drag; the gap points are
//    cached per layout (recomputed only after a reflow, 12 words)
//  - while dragging, the face tracks the pointer (transform) and its reserved slot moves LIVE to the nearest word gap:
//    the reflow runs only when that gap changes (a light 130 ms FLIP keeps the re-wrap from jittering); on release the
//    face settles into the slot (260 ms)
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
// the ripple: characters within RANGE px of the face's centre are pushed away (PUSH px at the face, falloff^1.6),
// tilted and scaled, with the face's velocity added; each one springs back to rest
const RANGE = 280, PUSH = 56, TILT = 22, GROW = 0.2, VEL = 0.012, SK = 240, SC = 2 * Math.sqrt(240) * 0.55;
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
  const head = useRef(null), face = useRef(null), live = useRef(null);
  const S = useRef({ chars: null, act: new Set(), st: null, rip: 0, fc: { x: 0, y: 0, vx: 0, vy: 0, on: false }, g: 6, hints: true, widths: null, L: null, fs: 36, drag: null, suppress: false, raf: 0 }).current;
  const wordEls = () => [...head.current.querySelectorAll(".hv4__t")];

  // ---- layout: measure (once, and on font load / resize), place ----
  const place = (animate, mode = "animate") => {
    const h = head.current; if (!h) return;
    const els = wordEls();
    if (!S.widths) {
      S.widths = els.map((e) => e.offsetWidth);
      // each character's centre inside its word, read once here (never in a frame)
      S.chars = els.flatMap((e, wi) => [...e.children].map((c) => ({ el: c, wi, dx: c.offsetLeft + c.offsetWidth / 2 })));
      S.st = new Float32Array(S.chars.length * 8); // per char: ox oy rot sc, then their velocities
      S.chars.forEach((_, k) => { S.st[k * 8 + 3] = 1; });
    }
    S.fs = parseFloat(getComputedStyle(h).fontSize) || 36;
    const room = h.parentElement.clientWidth || 600;
    const phone = window.matchMedia("(max-width: 720px)").matches;
    const hints = S.hints ? new Set(phone ? [5] : [4]) : new Set();
    S.L = layoutHeadline({ widths: S.widths, g: S.g, W: room, fs: S.fs, hints, center: !left });
    h.style.width = room + "px";
    h.style.height = S.L.height + "px";
    if (animate && !reduce) {
      const cls = mode === "live" ? "hv4--live" : "hv4--animate";
      h.classList.add(cls);
      clearTimeout(S[cls]); S[cls] = setTimeout(() => h.classList.remove(cls), mode === "live" ? 220 : 800);
    }
    els.forEach((e, k) => { e.style.transform = `translate(${S.L.pos[k].x.toFixed(1)}px, ${S.L.pos[k].y.toFixed(1)}px)`; });
    if (!S.drag?.active) face.current.style.transform = `translate(${S.L.face.x.toFixed(1)}px, ${S.L.face.y.toFixed(1)}px)`; // a dragged face follows the pointer
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

  const moveTo = (g, mode) => {
    g = Math.max(0, Math.min(N, g));
    S.hints = false; S.g = g; saveSlot(g);
    place(true, mode);
    if (mode !== "live" && live.current) live.current.textContent = g >= N ? "Face moved to the end" : `Face moved before “${WORDS[g]}”`;
  };

  // ---- the ripple (one rAF while dragging, then until every spring has settled; no layout reads) ----
  const ripple = (now) => {
    S.rip = 0;
    const m = S.ripT ? Math.min(0.05, (now - S.ripT) / 1000) : 0.016; S.ripT = now;
    const L = S.L, fc = S.fc, st = S.st; if (!L || !st) return;
    const fcx = fc.x + FW * S.fs / 2, fcy = fc.y + FH * S.fs / 2, lh = LH * S.fs;
    const speed = Math.hypot(fc.vx, fc.vy);
    S.chars.forEach((c, k) => {
      const b = k * 8, p = L.pos[c.wi];
      let tx = 0, ty = 0, tr = 0, ts = 1;
      if (fc.on) {
        const dx = p.x + c.dx - fcx, dy = p.y + lh / 2 - fcy, dist = Math.hypot(dx, dy);
        if (dist < RANGE) {
          // letters inside the face's footprint are pushed out past its edge; a soft tail reaches further, so
          // neighbours at different distances separate and a word splits around the face
          const r0 = FW * S.fs * 0.5, ux = dx / (dist || 1), uy = dy / (dist || 1);
          const f = 1 - dist / RANGE, s = f * f;
          const m = Math.max(0, r0 - dist) + PUSH * s;
          tx = ux * m + fc.vx * s * VEL * 12; ty = uy * m * 0.8 + fc.vy * s * VEL * 12;
          tr = (ux >= 0 ? 1 : -1) * s * TILT * (0.5 + Math.min(1, speed / 900) * 0.5); ts = 1 + s * GROW;
        }
      }
      const rest = !tx && !ty && !tr && ts === 1;
      if (rest && !S.act.has(k)) return;
      S.act.add(k);
      const tg = [tx, ty, tr, ts];
      let still = rest;
      for (let j = 0; j < 4; j++) {
        const v = st[b + 4 + j] + (SK * (tg[j] - st[b + j]) - SC * st[b + 4 + j]) * m;
        st[b + 4 + j] = v; st[b + j] += v * m;
        if (Math.abs(v) > 0.02 || Math.abs(st[b + j] - tg[j]) > 0.02) still = false;
      }
      if (still) { S.act.delete(k); c.el.style.transform = ""; return; }
      c.el.style.transform = `translate(${st[b].toFixed(2)}px, ${st[b + 1].toFixed(2)}px) rotate(${st[b + 2].toFixed(2)}deg) scale(${st[b + 3].toFixed(3)})`;
    });
    if (fc.on || S.act.size) S.rip = requestAnimationFrame(ripple); else S.ripT = 0;
  };
  const kickRipple = () => { if (!reduce && !S.rip) { S.ripT = 0; S.rip = requestAnimationFrame(ripple); } };

  // ---- drag ----
  // the face's centre -> the closest gap (measured against its top row's middle). The current gap must lose by 10 px
  // to be left, so a reflow under a still pointer cannot flip-flop
  const nearest = (cx, cy) => {
    const lh = LH * S.fs; let best = null, bd = Infinity, cur = Infinity;
    for (const p of S.drag.pts) {
      const d = Math.hypot(p.x - cx, (p.y - (cy - lh / 2)) * 1.4);
      if (d < bd) { bd = d; best = p; }
      if (p.g === S.g && d < cur) cur = d;
    }
    return best && (best.g === S.g || bd + 10 < cur) ? best : null;
  };
  const frame = (now) => {
    S.raf = 0;
    const d = S.drag; if (!d) return;
    const dt = Math.min(0.05, (now - (d.last || now)) / 1000); d.last = now;
    const k = reduce ? 1 : 1 - Math.exp(-dt / 0.045); // follows the pointer with a short spring-like lag
    const px = d.x, py = d.y;
    d.x += (d.tx - d.x) * k; d.y += (d.ty - d.y) * k;
    if (dt > 0) { S.fc.vx += ((d.x - px) / dt - S.fc.vx) * 0.4; S.fc.vy += ((d.y - py) / dt - S.fc.vy) * 0.4; }
    S.fc.x = d.x; S.fc.y = d.y;
    face.current.style.transform = `translate(${d.x.toFixed(1)}px, ${d.y.toFixed(1)}px) scale(${reduce ? 1 : 1.06})`;
    if (Math.abs(d.tx - d.x) > 0.3 || Math.abs(d.ty - d.y) > 0.3) S.raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!S.raf) S.raf = requestAnimationFrame(frame); };
  const begin = (e) => {
    const d = S.drag; d.active = true;
    face.current.setPointerCapture?.(d.id);
    head.current.classList.add("hv4--drag");
    S.hints = false; // from here the headline wraps freely
    document.documentElement.classList.add("hv4-grabbing");
    d.pts = gapPoints(S.L, S.widths, S.fs); // measured at drag start, and again after each reflow
    d.x = d.tx = S.L.face.x; d.y = d.ty = S.L.face.y; d.fx = S.L.face.x; d.fy = S.L.face.y; d.last = performance.now();
    d.p0 = { x: e.clientX, y: e.clientY };
    S.fc.on = true; S.fc.x = d.x; S.fc.y = d.y; S.fc.vx = S.fc.vy = 0;
    kickRipple();
  };
  const end = (cancel) => {
    const d = S.drag; if (!d) return;
    clearTimeout(d.timer);
    S.drag = null;
    if (!d.active) return;
    let drop = null;
    if (!cancel && d.pts) { // the gap closest to where the face was let go (same measure as nearest())
      const cx = d.tx + FW * S.fs / 2, cy = d.ty + FH * S.fs / 2, lh = LH * S.fs; let bd = Infinity;
      for (const p of d.pts) { const q = Math.hypot(p.x - cx, (p.y - (cy - lh / 2)) * 1.4); if (q < bd) { bd = q; drop = p; } }
    }
    if (drop && drop.g !== S.g) S.g = drop.g;
    S.fc.on = false; S.fc.vx = S.fc.vy = 0; // the springs carry the characters home
    cancelAnimationFrame(S.raf); S.raf = 0;
    head.current.classList.remove("hv4--drag");
    document.documentElement.classList.remove("hv4-grabbing");
    S.suppress = true; setTimeout(() => { S.suppress = false; }, 60); // the click the browser sends after a drag
    // the face settles into the slot it has been holding open
    const h = head.current; h.classList.add("hv4--settle"); setTimeout(() => h.classList.remove("hv4--settle"), 320);
    saveSlot(S.g);
    place(!!drop);
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
    // the words hold still while dragging: only the characters move aside. The face drops into the nearest gap on release
    kick(); kickRipple();
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
      <h1 className="hv4__head" data-hero-h1 ref={head} data-calm aria-labelledby="hello-hero-title">
        <span className="hello-hero__sr" id="hello-hero-title">{HERO_V4_COPY}</span>
        {WORDS.map((w, i) => <span key={i} className="hv4__t" aria-hidden>{[...w].map((c, j) => <span key={j} className="hv4__c">{c}</span>)}</span>)}
        <span
          className="hv4__face"
          ref={face}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={() => end(false)}
          onPointerCancel={() => end(true)}
          onKeyDown={onKey}
          onClickCapture={onClickCapture}
          title="Drag me through the text"
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
