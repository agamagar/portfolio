import { useEffect, useRef, useState } from "react";

// Shared chart plumbing: colour ramps (all CSS vars, theme aware), formatters,
// a size + in-view + reduced-motion hook, nice ticks and label de-collision.

export const CAT = ["var(--ch-c1)", "var(--ch-c2)", "var(--ch-c3)", "var(--ch-c4)"];
export const STATUS = ["var(--ch-ok)", "var(--ch-early)", "var(--ch-late)"]; // within / early / late
// n-step sequential ramp from the deep violet to the pale one, via colour-mix
export const ramp = (n) =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 50 : Math.round((i / (n - 1)) * 100);
    return `color-mix(in oklab, var(--ch-seq-hi) ${t}%, var(--ch-seq-lo))`;
  });

export const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(Math.round(n)));
export const fmtInt = (n) => Math.round(n).toLocaleString("en-IN");
export const fmtPct0 = (n) => Math.round(n) + "%";
export const fmtPct1 = (n) => n.toFixed(1) + "%";
export const fmtInr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function niceTicks(max, count = 4) {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const out = [];
  for (let v = 0; v <= max + step * 0.999; v += step) { out.push(+v.toFixed(10)); if (v >= max) break; }
  return out;
}

// push labels apart to a minimum gap, then pull the stack back inside [lo, hi]
export function spread(ys, minGap, lo, hi) {
  const idx = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < idx.length; k++) if (idx[k].y - idx[k - 1].y < minGap) idx[k].y = idx[k - 1].y + minGap;
  const over = idx.length ? idx[idx.length - 1].y - hi : 0;
  if (over > 0) idx.forEach((it) => { it.y -= over; });
  if (idx.length && idx[0].y < lo) { const u = lo - idx[0].y; idx.forEach((it) => { it.y += u; }); }
  const out = [];
  idx.forEach((it) => { out[it.i] = it.y; });
  return out;
}

// width (ResizeObserver), enters view once, reduced motion
export function useChart(initialW = 600) {
  const ref = useRef(null);
  const [w, setW] = useState(initialW);
  const [inView, setIn] = useState(false);
  const [reduce, setReduce] = useState(
    () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(160, Math.round(e.contentRect.width))));
    ro.observe(el);
    let io;
    if (typeof IntersectionObserver === "undefined") setIn(true);
    else {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { threshold: 0.25 });
      io.observe(el);
    }
    return () => { ro.disconnect(); io?.disconnect(); };
  }, []);
  return { ref, w, on: inView || reduce, reduce };
}
