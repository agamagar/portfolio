// Time-based playback for an animated board SVG. Marks are tagged in the markup:
//   data-k="s"  stroke drawn along its path        data-k="m"  mask stroke revealing a letter
//   data-k="g"  a letter (mask removed when done)  data-k="p"  sticky note pop     data-k="f"  fade-in
// Everything is driven from one clock so play / pause / seek / speed / replay are exact, and a finished
// board is left as plain static paths (no masks, no dashes).

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut = (p) => 1 - Math.pow(1 - p, 1.55);
const easeBack = (p) => {
  const c = 1.9, q = p - 1;
  return 1 + (c + 1) * q * q * q + c * q * q;       // a little overshoot: paper slapped on a board
};

export function createPlayer(svg, scene, { speed = 1, onDone, onTime } = {}) {
  const entries = [...svg.querySelectorAll("[data-k]")].map((el) => {
    const [t0, dur] = el.dataset.t.split(",").map(Number);
    const e = { el, k: el.dataset.k, t0, dur: Math.max(dur, 0.001), last: -1 };
    if (e.k === "p") {
      const [cx, cy] = el.dataset.c.split(",").map(Number);
      e.cx = cx; e.cy = cy; e.rot = +el.dataset.r;
    }
    if (e.k === "g") e.mask = el.dataset.m;
    return e;
  });
  const duration = scene.duration;
  let t = 0, playing = false, raf = 0, prev = 0, spd = speed, done = false;

  function apply(e, tt) {
    const raw = (tt - e.t0) / e.dur;
    const p = clamp(raw, 0, 1);
    if (p === e.last) return;
    e.last = p;
    const el = e.el;
    switch (e.k) {
      case "s":
      case "m":
        if (p <= 0) el.style.visibility = "hidden";
        else {
          el.style.visibility = "";
          if (p >= 1) {
            el.removeAttribute("stroke-dasharray");
            el.removeAttribute("stroke-dashoffset");
          } else {
            // pattern "1 2" over a path normalised to length 1: one dash that grows from the start; the long gap
            // keeps the round cap from leaving a dot at the far end (the classic draw-on artefact)
            el.setAttribute("stroke-dasharray", "1 2");
            el.setAttribute("stroke-dashoffset", String(1 - (e.k === "m" ? p : easeOut(p))));
          }
        }
        break;
      case "g":
        if (p >= 1) el.removeAttribute("mask");
        else el.setAttribute("mask", e.mask);
        break;
      case "p": {
        if (p <= 0) el.style.visibility = "hidden";
        else {
          el.style.visibility = "";
          const s = p >= 1 ? 1 : 0.86 + 0.14 * easeBack(p);
          el.setAttribute("opacity", String(clamp(p * 3, 0, 1)));
          el.setAttribute("transform", `rotate(${e.rot} ${e.cx} ${e.cy}) translate(${e.cx} ${e.cy}) scale(${s}) translate(${-e.cx} ${-e.cy})`);
        }
        break;
      }
      case "f":
        el.style.visibility = p <= 0 ? "hidden" : "";
        el.setAttribute("opacity", String(p));
        break;
      default:
    }
  }

  function render(tt) {
    for (const e of entries) apply(e, tt);
    onTime?.(tt, duration);
  }

  function frame(now) {
    if (!playing) return;
    const dt = Math.min(0.1, (now - prev) / 1000);   // clamp: a backgrounded tab resumes where it left off
    prev = now;
    t += dt * spd;
    if (t >= duration) {
      t = duration;
      playing = false;
      render(t);
      done = true;
      onDone?.();
      return;
    }
    render(t);
    raf = requestAnimationFrame(frame);
  }

  const api = {
    duration,
    get time() { return t; },
    get playing() { return playing; },
    get speed() { return spd; },
    setSpeed(v) { spd = v; },
    play() {
      if (playing) return;
      if (t >= duration) t = 0;
      playing = true;
      done = false;
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(raf);
    },
    seek(tt) {
      t = clamp(tt, 0, duration);
      render(t);
    },
    replay() {
      api.pause();
      t = 0;
      entries.forEach((e) => (e.last = -1));
      render(0);
      api.play();
    },
    finish() {
      api.pause();
      t = duration;
      render(t);
      done = true;
    },
    reset() {
      api.pause();
      t = 0;
      entries.forEach((e) => (e.last = -1));
      render(0);
    },
    destroy() {
      api.pause();
    },
  };
  render(0);
  return api;
}
