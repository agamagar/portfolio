import { createContext, useContext, useEffect, useRef, useState } from "react";
import { watchSection, sectionPlayActive } from "../sectionPlay";

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

// 28.3 (a11y, 25 Oct): a chart's accessible name says its point, never "Values by label". A host that states the
// takeaway (a claim, a card title) provides it through ChartName; the chart adds what its own data says (start,
// end, peak or highest and lowest). An explicit ariaLabel on the chart still wins.
export const ChartName = createContext(null);
export const useChartName = () => useContext(ChartName);
export const nameChart = (head, summary) => {
  const h = (head || "").trim();
  if (!summary) return h;
  return h ? `${h}${/[.!?]$/.test(h) ? "" : "."} ${summary}` : summary;
};
// one series over its categories: "Scheduled orders: 383 in Oct 25 to 1.54M in Aug 26, peak 1.81M in May 26" (a peak
// only when it beats both ends)
export function describeSeries(data, key, xKey, fmt, label) {
  const pts = data.map((r) => [r[xKey], r[key]]).filter(([, v]) => v != null && typeof v !== "object");
  if (!pts.length) return "";
  const [x0, v0] = pts[0], [x1, v1] = pts[pts.length - 1];
  const [xm, vm] = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
  const peak = vm > v1 && vm > v0 ? `, peak ${fmt(vm)} in ${xm}` : "";
  return `${label ? label + ": " : ""}${fmt(v0)} in ${x0} to ${fmt(v1)} in ${x1}${peak}`;
}

export const SEQ5 = ramp(5);
export const SEQ7 = ramp(7);

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
    // the grow-in runs on the section controller: plays when the chart's top reaches the viewport centre,
    // resets off screen, and replays on the Replay button. (No controller under reduced motion: `on` is forced.)
    const off = watchSection(el, { play: () => setIn(true), reset: () => setIn(false) });
    return () => { ro.disconnect(); off(); };
  }, []);
  return { ref, w, on: inView || reduce || !sectionPlayActive, reduce };
}
