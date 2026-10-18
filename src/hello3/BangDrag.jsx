// The draggable "!" of the v2 headline, live Prociono text (the v1 one, HelloFlip.jsx, redraws "Hello!" as
// SVG outlines with hard-coded glyph coordinates, so it cannot be attached here). Same feel, own code:
//  - hover (fine pointers) grows the mark 1.12, a press sets it to 0.94: one spring, K 340, damping 0.62
//  - drag starts after 4 px; the mark follows the pointer with a 28 ms lag, and on release eases home with
//    a 90 ms one (HelloFlip's bang tau)
//  - one "!" is spawned per glyph width of travel, popping in over 180 ms (scale .55 -> 1) and leaving over
//    140 ms; nearer the handle = stronger, each step further decays the opacity
//  - the marks are overlays (absolute, transforms only): the text never reflows
//  - keyboard: a slider (arrows step one mark, Home/End, Escape home); touch: horizontal drags only
//    (touch-action: pan-y); reduced motion: the mark follows without spring and leaves no trail
import { useEffect, useRef, useState } from "react";

const MAX = 7; // marks each side
const DECAY = 0.62; // opacity per step away from the handle
const TAU_FOLLOW = 28, TAU_HOME = 90; // ms
const POP = 180, OUT = 140; // ms
const K = 340, C = 2 * Math.sqrt(K) * 0.62; // the grow/press spring

export default function BangDrag({ reduce }) {
  const root = useRef(null), handle = useRef(null), trail = useRef(null);
  const [val, setVal] = useState(0); // announced value: signed marks spawned
  const S = useRef({ x: 0, target: 0, tau: TAU_HOME, down: false, hover: false, focus: false, drag: null, step: 14, raf: 0, last: 0, sc: 1, vs: 0, marks: [] }).current;

  useEffect(() => {
    const el = root.current;
    const measure = () => { const w = handle.current?.getBoundingClientRect().width; if (w) S.step = Math.max(10, w); };
    measure();
    document.fonts?.ready?.then(measure);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const marks = [...trail.current.children];
    S.marks = marks.map((node, i) => ({ node, j: i < MAX ? i + 1 : -(i - MAX + 1), shown: false, t: 0, out: 0 }));
    const frame = (now) => {
      S.raf = 0;
      const dt = Math.min(0.032, Math.max(0.001, (now - S.last) / 1000));
      S.last = now;
      let busy = false;
      // the handle follows its target (lagged), the grow/press spring runs
      if (reduce) { S.x = S.target; S.sc = 1; S.vs = 0; }
      else {
        const k = 1 - Math.exp(-(dt * 1000) / S.tau);
        S.x += (S.target - S.x) * k;
        const tsc = S.down ? 0.94 : (S.hover && fine.matches) || S.focus ? 1.12 : 1;
        const a = K * (tsc - S.sc) - C * S.vs;
        S.vs += a * dt; S.sc += S.vs * dt;
        if (Math.abs(S.target - S.x) > 0.05 || Math.abs(tsc - S.sc) > 0.002 || Math.abs(S.vs) > 0.01) busy = true;
      }
      handle.current.style.transform = `translateX(${S.x.toFixed(2)}px) scale(${S.sc.toFixed(3)})`;
      // the trail: mark j (steps from home) shows while the handle has passed it
      const n = Math.floor(Math.abs(S.x) / S.step + 0.0001), dir = Math.sign(S.x);
      const near = reduce ? 0 : n;
      for (const m of S.marks) {
        const want = !reduce && dir !== 0 && Math.sign(m.j) === dir && Math.abs(m.j) <= n;
        if (want && !m.shown) { m.shown = true; m.t = now; m.out = 0; }
        if (!want && m.shown) { m.shown = false; m.out = now; }
        const p = m.shown ? Math.min(1, (now - m.t) / POP) : m.out ? Math.min(1, (now - m.out) / OUT) : 1;
        if (m.shown ? p < 1 : m.out && p < 1) busy = true;
        let sc = 1, op = 0;
        if (m.shown) { sc = 0.55 + 0.45 * (1 - (1 - p) ** 3); op = p * DECAY ** (near - Math.abs(m.j) + 1); }
        else if (m.out && p < 1) { sc = 1 - 0.45 * p; op = (1 - p) * DECAY ** Math.max(0, near - Math.abs(m.j) + 1); }
        else m.out = 0;
        m.node.style.opacity = op > 0.003 ? op.toFixed(3) : "0";
        m.node.style.transform = `translateX(${(m.j * S.step).toFixed(2)}px) scale(${sc.toFixed(3)})`;
      }
      if (busy || S.drag) S.raf = requestAnimationFrame(frame);
    };
    S.kick = () => { if (!S.raf) { S.last = performance.now(); S.raf = requestAnimationFrame(frame); } };
    S.kick();
    return () => { cancelAnimationFrame(S.raf); S.raf = 0; };
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const clampX = (x) => Math.max(-MAX * S.step, Math.min(MAX * S.step, x));
  const home = () => { S.tau = reduce ? 1 : TAU_HOME; S.target = 0; setVal(0); S.kick?.(); };
  const announce = () => setVal(Math.round(S.target / S.step));

  const onDown = (e) => {
    if (e.button > 0) return;
    S.drag = { id: e.pointerId, x0: e.clientX, base: S.target, moved: false };
    S.down = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    S.kick?.();
  };
  const onMove = (e) => {
    const d = S.drag;
    if (!d || e.pointerId !== d.id) return;
    if (!d.moved) { if (Math.abs(e.clientX - d.x0) < 4) return; d.moved = true; document.documentElement.classList.add("hv2-grabbing"); }
    S.tau = reduce ? 1 : TAU_FOLLOW;
    S.target = clampX(d.base + (e.clientX - d.x0));
    announce();
    S.kick?.();
  };
  const onUp = (e) => {
    const d = S.drag;
    if (!d || e.pointerId !== d.id) return;
    S.drag = null; S.down = false;
    document.documentElement.classList.remove("hv2-grabbing");
    home();
  };
  const onKey = (e) => {
    const k = e.key, cur = Math.round(S.target / S.step);
    let n = null;
    if (k === "ArrowRight" || k === "ArrowUp") n = cur + 1;
    else if (k === "ArrowLeft" || k === "ArrowDown") n = cur - 1;
    else if (k === "Home") n = -MAX;
    else if (k === "End") n = MAX;
    else if (k === "Escape" || k === "Enter" || k === " ") { e.preventDefault(); home(); return; }
    if (n === null) return;
    e.preventDefault();
    S.tau = reduce ? 1 : TAU_FOLLOW;
    S.target = clampX(n * S.step);
    announce();
    S.kick?.();
  };

  return (
    <span className="hv2__bang-root" ref={root}>
      <span className="hv2__bang-trail" ref={trail} aria-hidden>
        {[...Array(MAX * 2)].map((_, i) => <span key={i} className="hv2__bang-mark">!</span>)}
      </span>
      <span
        ref={handle}
        className="hv2__bang"
        role="slider"
        tabIndex={0}
        aria-label="Drag the exclamation mark"
        aria-orientation="horizontal"
        aria-valuemin={-MAX}
        aria-valuemax={MAX}
        aria-valuenow={val}
        data-hf-skip
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => { S.hover = true; S.kick?.(); }}
        onPointerLeave={() => { S.hover = false; S.kick?.(); }}
        onFocus={() => { S.focus = true; S.kick?.(); }}
        onBlur={() => { S.focus = false; S.kick?.(); home(); }}
        onKeyDown={onKey}
      >!</span>
    </span>
  );
}
