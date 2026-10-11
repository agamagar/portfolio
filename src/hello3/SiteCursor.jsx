// The site's own cursor (Agam, 2026-10-11: "a duplicate cursor, assume that is the
// site talking to you ... appears after 3 seconds ... my name tag ... like the Figma
// cursor but in our website's style"). A multiplayer-style cursor (arrow + name tag)
// in the site's glass and fonts that glides to a few things on the landing page and
// says one short line at each, like a person giving a quick tour.
//
// One rAF loop on a virtual clock (it stops while the tab is hidden, so timers do
// not run on), transforms only, pointer-events: none (only the tiny close button
// takes the pointer). It drifts aside when the real pointer comes near. Esc or the
// x dismisses it for good (localStorage, try/catch). Reduced motion: no wandering,
// it sits by the first target with its first line. Touch / no hover: not rendered.
// The lines are guidance, not information, so the whole thing is aria-hidden and
// there is no live region.
import { useEffect, useRef, useState } from "react";
import { introRevealed } from "./useStage";
import { heroMorphSettledOrTimeout } from "./heroMorphGate";
import "./siteCursor.css";

const KEY = "agam-site-cursor-dismissed-v2"; // v2 (12 Oct): old Esc dismissals no longer count
const APPEAR_AFTER = 3000; // ms after the load reveal

// The tour. aim(rect) returns where the arrow TIP lands, beside the thing, never on it.
const TOUR = [
  { sel: ".hello-hero__table", aim: (r) => [r.left - 16, r.top + 50], flip: true, say: "This is my work. Open any row, they're short reads." },
  { sel: ".hf__bang", aim: (r) => [r.right + 10, r.top + r.height * 0.55], say: "Try dragging me. The ! stretches." },
  { sel: ".wscene-warm-pill__btn", aim: (r) => [r.left + r.width * 0.5, r.bottom + 6], say: "There's a little room behind this button. Come in." },
  { sel: null, aim: () => [window.innerWidth - 140, window.innerHeight - 90], say: "That's the tour. Esc sends me away." },
];

const read = () => { try { if (/[?&]cursor=1\b/.test(location.search)) localStorage.removeItem(KEY); } catch { /* ignore */ }
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };
const write = () => { try { localStorage.setItem(KEY, "1"); } catch { /* private mode */ } };

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

const easeOut = (t) => { const s = t - 1; return 1 + 2.2 * s * s * s + 1.2 * s * s; }; // ~4% overshoot
const quad = (a, c, b, u) => { const v = 1 - u; return v * v * a + 2 * v * u * c + u * u * b; };

export default function SiteCursor() {
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined" || read()) return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });
  const [msg, setMsg] = useState("");
  const [flip, setFlip] = useState(false);
  const root = useRef(null);
  const dismiss = useRef(() => {});
  dismiss.current = () => { write(); setOn(false); };

  useEffect(() => {
    if (!on) return undefined;
    const el = root.current;
    if (!el) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dead = false, raf = 0, timer = 0;
    let vt = 0, last = 0;
    const ptr = { x: -999, y: -999 };
    const evade = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let seg = null, hold = 0, idx = -1, anchor = [0, 0];

    const place = (x, y) => { pos.x = x; pos.y = y; el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; };
    const targetFor = (s) => {
      if (!s.sel) return s.aim(null);
      const n = document.querySelector(s.sel);
      if (!n) return null;
      const r = n.getBoundingClientRect();
      if (r.width < 4 || r.bottom < 40 || r.top > window.innerHeight - 40) return null; // not on screen: skip it
      return s.aim(r);
    };
    const next = () => {
      el.removeAttribute("data-said");
      while (++idx < TOUR.length) {
        const to = targetFor(TOUR[idx]);
        if (!to) continue;
        const [fx, fy] = anchor;
        const d = Math.hypot(to[0] - fx, to[1] - fy);
        const nx = -(to[1] - fy) / (d || 1), ny = (to[0] - fx) / (d || 1);
        const bend = (idx % 2 ? 1 : -1) * Math.min(110, d * 0.2); // a gentle arc, not a straight line
        seg = { from: [fx, fy], to, c: [(fx + to[0]) / 2 + nx * bend, (fy + to[1]) / 2 + ny * bend], t0: vt, dur: 1700 + Math.min(1900, d * 2.4), i: idx };
        return;
      }
      seg = null; hold = -1; // tour over
    };
    const arrive = (i) => { setFlip(!!TOUR[i].flip || anchor[0] > window.innerWidth - 330); setMsg(TOUR[i].say); el.setAttribute("data-said", ""); hold = vt + 3200 + TOUR[i].say.length * 45; };

    const frame = (now) => {
      if (dead) return;
      const dt = Math.min(50, now - last || 16); last = now; vt += dt;
      if (seg) {
        const t = Math.min(1, (vt - seg.t0) / seg.dur), u = easeOut(t);
        place(quad(seg.from[0], seg.c[0], seg.to[0], u), quad(seg.from[1], seg.c[1], seg.to[1], u));
        if (t >= 1) { anchor = seg.to; arrive(seg.i); seg = null; }
      } else if (hold > 0) {
        // a slow breathing drift while it talks (sub-pixel-smooth, no jitter)
        place(anchor[0] + Math.sin(vt / 900) * 2.5, anchor[1] + Math.cos(vt / 1100) * 2);
        if (vt > hold) { hold = 0; if (idx >= TOUR.length - 1) { hold = -1; el.setAttribute("data-leave", ""); timer = window.setTimeout(() => setOn(false), 600); } else next(); }
      }
      // get out of the way: ease an offset away from the real pointer when it is close
      // (but never while it is over the bubble itself, so the x stays reachable)
      const dx = pos.x - ptr.x, dy = pos.y - ptr.y, d = Math.hypot(dx, dy) || 1;
      const over = el.matches(":hover") || !!document.querySelector(".sc__bubble:hover");
      const push = !over && d < 120 ? (120 - d) * 0.9 : 0;
      evade.x += ((dx / d) * push - evade.x) * 0.08;
      evade.y += ((dy / d) * push - evade.y) * 0.08;
      if (Math.abs(evade.x) + Math.abs(evade.y) > 0.05) el.style.transform = `translate3d(${(pos.x + evade.x).toFixed(1)}px,${(pos.y + evade.y).toFixed(1)}px,0)`;
      if (hold !== -1 || !el.hasAttribute("data-leave")) raf = requestAnimationFrame(frame);
    };
    const start = () => { last = performance.now(); raf = requestAnimationFrame(frame); };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden && !dead) start(); };
    const onMove = (e) => { ptr.x = e.clientX; ptr.y = e.clientY; };
    const onKey = (e) => { if (e.key === "Escape") setOn(false); }; // Esc hides for this visit only (Agentation also uses Esc); the × dismisses for good

    Promise.race([
      Promise.all([introRevealed, heroMorphSettledOrTimeout(4000)]),
      new Promise((r) => setTimeout(r, 7000)),
    ]).then(() => {
      if (dead) return;
      timer = window.setTimeout(() => {
        if (dead) return;
        el.setAttribute("data-live", ""); if (!reduce) pop();
        if (reduce) {
          const i = TOUR.findIndex((s) => targetFor(s));
          const to = targetFor(TOUR[Math.max(0, i)]) || [window.innerWidth / 2, window.innerHeight / 2];
          anchor = to; place(to[0], to[1]); idx = Math.max(0, i); arrive(idx); hold = 0;
          return;
        }
        anchor = [window.innerWidth + 40, -40]; place(anchor[0], anchor[1]); // glide in from off-screen
        next(); start();
      }, APPEAR_AFTER);
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      dead = true; cancelAnimationFrame(raf); clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div className="sc" ref={root} data-flip={flip || undefined} aria-hidden="true">
      <svg className="sc__arrow" viewBox="0 0 16 16" width="18" height="18">
        <path d="M2 1.5 L2 14.2 L5.6 10.8 L8.1 15 L10.3 13.9 L7.9 9.8 L12.8 9.8 Z" />
      </svg>
      <span className="sc__tag">Agam</span>
      <span className="sc__bubble">
        <span className="sc__say">{msg}</span>
        <button type="button" className="sc__x" tabIndex={-1} onClick={() => dismiss.current()} title="Send me away (Esc)">×</button>
      </span>
    </div>
  );
}
