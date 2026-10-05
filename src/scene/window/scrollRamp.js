// The speed ramp (2026-09-27, Agam: "when I transition into the screen or out of it
// there should be a speed ramp, so I'm not waiting around on a trackpad ... if I get
// stuck where the transition happens, I'm moved forward. The ramp is connected to
// scroll").
//
// The runway has two resting places: the room (raw 0) and the page's top (raw 1).
// Wherever a scroll comes to rest between them, or a trackpad's momentum tails off
// there, the ramp takes the scroll over at the speed it had and finishes the move in
// the direction you were going. It drives the scroll itself (through Lenis), so the
// camera, the hand-off and the page stay one motion; it lets go the moment you scroll
// the other way or touch the screen. A move shorter than COMMIT of the runway falls
// back to where it started (a nudge at the top, an overshoot past the page's top).
//
// The profile is a cubic Hermite: it leaves at the scroll's own speed (no hitch where
// the momentum hands over), speeds up through the middle and eases into the landing.

import { getLenis } from "../../ui/smoothScroll.js";

const COMMIT = 0.05; // of the runway: a shorter move falls back where it came from
const IDLE_WHEEL = 110; // ms with no wheel event: the gesture is over
const IDLE_NATIVE = 160; // ms with no scroll movement (touch momentum, keys, the scrollbar)
const TAIL = 5; // this many decaying wheel events in a row read as a trackpad's momentum...
const TAIL_PX = 8; // ...once the latest is this small, and the ramp takes over there
const LATCH_GAP = 140; // after a ramp, that gesture's leftover momentum is absorbed until a pause
const T_MIN = 350, T_MAX = 900; // ms, for no distance and the whole runway
const START_MAX = 2.5; // the Hermite's start slope, capped (at 3 it would overshoot)

// measure(): { raw, y0, y1, span } for the runway now (y0 / y1 are the scroll positions
// of the room and the page's top, span is the runway's length in px), or null
export function installScrollRamp({ measure }) {
  let raf = 0;
  let ramp = null; // { dir, a } while the ramp drives the scroll
  let latch = null; // { dir, t, a } after it: momentum from the same gesture is absorbed
  let touching = false;
  let lastWheel = -1e9, lastMove = -1e9;
  let lastY = null, lastT = 0, dir = 0, vel = 0; // vel in px per ms, smoothed
  let driveRaf = 0; // the fallback driver when Lenis is not running
  const wheels = []; // the latest wheel events: { a: |deltaY|, s: sign, t }
  const now = () => performance.now();
  const posY = () => {
    const L = getLenis();
    return L ? L.animatedScroll : window.scrollY;
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const cancel = () => {
    if (!ramp) return;
    ramp = null;
    cancelAnimationFrame(driveRaf);
    driveRaf = 0;
    // stop Lenis's tween where it is; the event that cancelled scrolls on from here
    getLenis()?.reset?.();
  };
  const done = () => {
    if (!ramp) return;
    latch = { dir: ramp.dir, t: now(), a: ramp.a };
    ramp = null;
    lastMove = now();
    kick();
  };

  // a run of same-direction wheel events, each no larger than the one before, arriving
  // back to back and now small: the trackpad has let go and its momentum is fading
  const tailing = (t) => {
    if (wheels.length < TAIL) return false;
    const w = wheels.slice(-TAIL);
    if (t - w[TAIL - 1].t > 80) return false;
    for (let i = 1; i < TAIL; i++) {
      if (w[i].s !== w[0].s || w[i].a > w[i - 1].a + 0.5 || w[i].t - w[i - 1].t > 60) return false;
    }
    return w[TAIL - 1].a <= TAIL_PX;
  };
  const shouldGo = (t, L) => {
    if (L?.isScrolling === "smooth") {
      // Lenis is easing: from the wheel (ours to take over) or a programmatic scroll
      // such as an anchor link (never ours to hijack)
      if (t - lastWheel > 1200) return false;
      return t - lastWheel > IDLE_WHEEL || tailing(t);
    }
    return t - lastMove > IDLE_NATIVE && t - lastWheel > IDLE_WHEEL;
  };

  const start = (m, y, L) => {
    // judge the move by where the scroll is headed (Lenis's target, mid-ease), not where
    // it is: one mouse notch up at the page's top is aimed 100 px out, though only 40 px
    // have played when the ramp takes over
    const aim = L?.isScrolling === "smooth" ? m.raw + (L.targetScroll - y) / m.span : m.raw;
    const toEnd = dir > 0 ? aim >= COMMIT : dir < 0 ? aim > 1 - COMMIT : aim >= 0.5;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const target = Math.min(maxY, toEnd ? m.y1 : m.y0);
    const D = Math.abs(target - y);
    if (D < 1) return;
    const s = Math.sign(target - y);
    let T = T_MIN + (T_MAX - T_MIN) * Math.min(1, D / m.span);
    const v0 = Math.max(0, vel * s);
    if ((v0 * T) / D > START_MAX) T = Math.max(220, (START_MAX * D) / v0);
    const s0 = Math.min(START_MAX, (v0 * T) / D);
    const ease = (u) => s0 * (u * u * u - 2 * u * u + u) + (3 * u * u - 2 * u * u * u);
    ramp = { dir: s, a: wheels.length ? wheels[wheels.length - 1].a : 0 };
    if (L) {
      L.scrollTo(target, { duration: T / 1000, easing: ease, onComplete: done });
      return;
    }
    // no Lenis (it is off under reduced motion, where the runway is off too): drive it
    const from = y, t0 = now();
    const step = () => {
      if (!ramp) return;
      const u = Math.min(1, (now() - t0) / T);
      window.scrollTo(0, from + (target - from) * ease(u));
      if (u < 1) driveRaf = requestAnimationFrame(step);
      else done();
    };
    driveRaf = requestAnimationFrame(step);
  };

  function tick() {
    raf = 0;
    const t = now();
    const L = getLenis();
    const y = posY();
    if (lastY != null && !ramp) {
      const dy = y - lastY;
      const v = dy / Math.max(1, t - lastT);
      vel = vel * 0.5 + v * 0.5;
      if (Math.abs(dy) > 0.01) lastMove = t;
      // the direction from real travel only: when Lenis settles it rounds the scroll a
      // fraction of a pixel back, which read as a turn and sent a flick back to the room
      if (Math.abs(dy) >= 1) dir = Math.sign(dy);
    }
    lastY = y;
    lastT = t;
    if (latch && t - latch.t > LATCH_GAP) latch = null;
    const m = measure();
    const inZone = !!m && m.raw > 0.0015 && m.raw < 0.999;
    if (inZone && !ramp && !touching && !document.hidden && !L?.isStopped && shouldGo(t, L)) start(m, y, L);
    if (inZone || ramp || latch) kick();
  }

  const swallow = (e) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
  };
  // capture on window: this runs before Lenis's own wheel listener (window, bubbling)
  const onWheel = (e) => {
    if (e.ctrlKey) return; // a pinch
    const s = Math.sign(e.deltaY);
    if (!s) return;
    const a = Math.abs(e.deltaY);
    const t = now();
    if (ramp) {
      if (s === ramp.dir) {
        ramp.a = a;
        swallow(e);
        return;
      }
      cancel();
    } else if (latch) {
      const fresh = s !== latch.dir || t - latch.t > LATCH_GAP || a > Math.max(12, latch.a * 1.6);
      if (!fresh) {
        latch.t = t;
        latch.a = a;
        swallow(e);
        return;
      }
      latch = null;
    }
    lastWheel = t;
    dir = s;
    wheels.push({ a, s, t });
    if (wheels.length > 8) wheels.shift();
    kick();
  };
  const onTouchStart = () => {
    touching = true;
    latch = null;
    cancel();
  };
  const onTouchEnd = () => {
    touching = false;
    lastMove = now();
    kick();
  };
  const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);
  const onKey = (e) => {
    if (SCROLL_KEYS.has(e.key)) {
      latch = null;
      cancel();
      lastMove = now();
      kick();
    }
  };
  const onScroll = () => kick();

  window.addEventListener("wheel", onWheel, { capture: true, passive: false });
  window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
  window.addEventListener("touchend", onTouchEnd, { capture: true, passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { capture: true, passive: true });
  window.addEventListener("keydown", onKey, { capture: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  kick();

  return () => {
    cancel();
    cancelAnimationFrame(raf);
    window.removeEventListener("wheel", onWheel, { capture: true });
    window.removeEventListener("touchstart", onTouchStart, { capture: true });
    window.removeEventListener("touchend", onTouchEnd, { capture: true });
    window.removeEventListener("touchcancel", onTouchEnd, { capture: true });
    window.removeEventListener("keydown", onKey, { capture: true });
    window.removeEventListener("scroll", onScroll);
  };
}
