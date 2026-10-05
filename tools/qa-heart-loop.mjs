// QA for the Schedule hero loop: every track, 60fps steps over one loop + the wrap.
// Flags (1) single-frame jumps that read as hard cuts, (2) loop-wrap mismatches.
import { build } from "esbuild";
import { interpolate, cubicBezier } from "motion";
const out = await build({ entryPoints: ["src/figures/scheduled/SchedHeartLoop.jsx"], bundle: true, write: false,
  format: "esm", platform: "node", jsx: "automatic", loader: { ".css": "empty" }, external: ["react", "react-dom", "motion", "motion/react"], logLevel: "silent" });
import { writeFileSync, unlinkSync } from "node:fs";
const tmp = new URL("./.qa-heart-loop.bundle.mjs", import.meta.url);
writeFileSync(tmp, out.outputFiles[0].text);
const { __QA } = await import(tmp.href);
unlinkSync(tmp);
const ez = (e) => (typeof e === "function" ? e : e === "linear" ? (x) => x : cubicBezier(...e));
const f = (t) => interpolate(t.times, t.values, { ease: t.ease.map(ez), clamp: true });
const tracks = [];
const logT = (t) => t && ({ ...t, values: t.values.map((v) => Math.log(v)) }); // scale is animated in log space
const add = (name, t, _unit, vis) => { if (!t) return; const fn = f(t); let lo = Infinity, hi = -Infinity; for (let i = 0; i <= 400; i++) { const v = fn(i / 400); lo = Math.min(lo, v); hi = Math.max(hi, v); } tracks.push({ name, fn, unit: Math.max(hi - lo, 1e-6), vis }); };
__QA.HEARTS.forEach((h, i) => { const hv = f(h.opacity); add(`heart${i + 1}.opacity`, h.opacity, 1); add(`heart${i + 1}.scale`, logT(h.scale || h.scaleX), 1, hv); if (h.scaleY) add(`heart${i + 1}.scaleY`, logT(h.scaleY), 1, hv); add(`heart${i + 1}.blur`, __QA.blurTrack(h), 14, hv); if (h.rotate) add(`heart${i + 1}.rotate`, h.rotate, 1, hv); });
__QA.BOLTS.forEach((b, i) => { const bv = f(b.opacity); add(`bolt${i + 1}.opacity`, b.opacity, 1); add(`bolt${i + 1}.scale`, logT(b.scale || b.scaleX), 1, bv); add(`bolt${i + 1}.blur`, __QA.blurTrack(b), 14, bv); if (b.rotate) add(`bolt${i + 1}.rotate`, b.rotate, 1, bv); });
const iv = f(__QA.ICON.opacity); for (const [k, t] of Object.entries(__QA.ICON)) add(`icon.${k}`, t, 1, k === "opacity" ? undefined : iv);
const letter = (w, [ch, , , s], from, to) => { const t = __QA.letterTimes(s), n = t.length; const e = __QA.LETTER_EASE.slice(0, n - 1);
  const ot = { times: t, values: n === 5 ? [0, 0, 1, 1, 0] : [0, 0, 1, 1, 0, 0], ease: e }; add(`${w}.${ch}.opacity`, ot, 1);
  add(`${w}.${ch}.x`, { times: t, values: n === 5 ? [from, from, 0, 0, to] : [from, from, 0, 0, to, to], ease: e }, 1, f(ot)); };
__QA.SCHEDULE.forEach((l) => letter("Schedule", l, -40, -175.5));
__QA.DELIVERY.forEach((l) => letter("Delivery", l, 40, 233.5));
// ORDER: keyframe times must strictly increase, or a track jumps
const allT = []; const chk = (n, t) => t && t.times && allT.push([n, t.times]);
__QA.HEARTS.forEach((h, i) => ["opacity", "scale", "scaleX", "scaleY", "rotate"].forEach((k) => chk(`heart${i + 1}.${k}`, h[k])));
__QA.BOLTS.forEach((b, i) => ["opacity", "scale", "scaleX", "rotate"].forEach((k) => chk(`bolt${i + 1}.${k}`, b[k])));
for (const [k, t] of Object.entries(__QA.ICON)) chk(`icon.${k}`, t);
__QA.SCHEDULE.concat(__QA.DELIVERY).forEach(([ch, , , s]) => chk(`letter ${ch}`, { times: __QA.letterTimes(s) }));
const order = allT.filter(([, t]) => t.some((v, i) => i && v <= t[i - 1]) || t[0] !== 0 || Math.abs(t[t.length - 1] - 1) > 1e-9);
console.log(order.length ? "ORDER PROBLEMS: " + order.map(([n, t]) => n + " " + t.map((x) => x.toFixed(3)).join(",")).join(" | ") : `order ok: ${allT.length} tracks strictly increasing, 0 -> 1`);
const N = Math.round(__QA.D * 60), CUT = 0.25; // a step over 25% of the track's own range in ONE frame = a hard cut
const bad = [];
for (const tr of tracks) {
  let worst = 0, at = 0;
  for (let i = 0; i < N; i++) {
    const a = tr.fn(i / N), b = tr.fn(i + 1 === N ? 0 : (i + 1) / N); // the last step wraps to frame 0
    // a move on an invisible layer cannot be seen: skip steps where it is hidden at both ends
    if (tr.vis && tr.vis(i / N) < 0.02 && tr.vis(i + 1 === N ? 0 : (i + 1) / N) < 0.02) continue;
    const d = Math.abs(b - a) / tr.unit;
    if (d > worst) { worst = d; at = i / N; }
  }
  const opacityVisible = !tr.name.endsWith(".x") && !tr.name.endsWith(".y");
  if (worst > CUT) bad.push(`${tr.name}: jump ${(worst * 100).toFixed(0)}% of range in one frame at p=${at.toFixed(3)}`);
}
console.log(`${tracks.length} tracks, ${N} frames per loop`);
console.log(bad.length ? "HARD CUTS:\n" + bad.join("\n") : "no hard cuts: every track moves < 25% of its range per frame, including the loop wrap");
