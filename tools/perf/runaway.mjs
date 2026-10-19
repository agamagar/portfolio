// Runaway-work audit. node tools/perf/runaway.mjs <path> [label]   (QA_URL=http://localhost:5199)
// Idle 20 s after load, then 20 s slow scroll, then 20 s idle at bottom. Samples every 10 s.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
const BASE = process.env.QA_URL || "http://localhost:5199";
const path = process.argv[2] || "/";
const label = process.argv[3] || "run";
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const S = (window.__s = { raf: {}, rafTotal: 0, si: {}, st: {}, lt: [], ctxs: 0 });
  const key = () => (new Error().stack || "").split("\n").slice(2).filter((l) => !/agentation|window\.(requestAnimationFrame|setTimeout|setInterval)/.test(l)).slice(0, 1).join("").replace(/\?t=\d+/g, "").replace(/https?:\/\/[^/]+/, "").trim();
  const oRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { const k = key(); S.raf[k] = (S.raf[k] || 0) + 1; S.rafTotal++; return oRaf(cb); };
  const oSI = window.setInterval.bind(window);
  window.setInterval = (cb, ms, ...a) => { const k = key() + " @" + ms; S.si[k] = (S.si[k] || 0) + 1; return oSI(cb, ms, ...a); };
  const oST = window.setTimeout.bind(window);
  window.setTimeout = (cb, ms, ...a) => { const k = key(); S.st[k] = (S.st[k] || 0) + 1; return oST(cb, ms, ...a); };
  const oGC = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (/webgl/.test(t)) S.ctxs++; return oGC.call(this, t, ...a); };
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => S.lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true }); } catch {}
});
const cdp = await ctx.newCDPSession(p);
await cdp.send("Performance.enable");
await p.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(8000);
const m = async () => { const r = {}; (await cdp.send("Performance.getMetrics")).metrics.forEach((x) => (r[x.name] = x.value)); return r; };
// process-level: CDP cpuTime (s) + RSS per Chromium process of this browser
const procs = async () => {
  const info = (await (await browser.newBrowserCDPSession()).send("SystemInfo.getProcessInfo")).processInfo;
  const rss = {};
  try { execSync("ps -axo pid=,rss=").toString().trim().split("\n").forEach((l) => { const [a, b] = l.trim().split(/\s+/); rss[a] = +b / 1024; }); } catch {}
  const o = {};
  info.forEach((i) => { o[i.type] = o[i.type] || { cpu: 0, rss: 0 }; o[i.type].cpu += i.cpuTime; o[i.type].rss += rss[i.id] || 0; });
  return o;
};
const snap = async (name) => {
  const pr = await procs();
  await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
  const mm = await m();
  const x = await p.evaluate(() => {
    const S = window.__s;
    const vids = [...document.querySelectorAll("video")];
    const inView = (e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    return { rafTotal: S.rafTotal, rafBy: { ...S.raf }, ctxs: S.ctxs, canvases: document.querySelectorAll("canvas").length,
      videos: vids.length, playing: vids.filter((v) => !v.paused).length, playingOff: vids.filter((v) => !v.paused && !inView(v)).length,
      dom: document.getElementsByTagName("*").length, anims: document.getAnimations().length, hidden: document.hidden };
  });
  return { name, pr, heapMB: +(mm.JSHeapUsedSize / 1e6).toFixed(1), nodes: mm.Nodes, listeners: mm.JSEventListeners, layouts: mm.LayoutCount, recalc: mm.RecalcStyleCount,
    task: +mm.TaskDuration.toFixed(2), script: +mm.ScriptDuration.toFixed(2), layoutD: +mm.LayoutDuration.toFixed(2), styleD: +mm.RecalcStyleDuration.toFixed(2), ...x, t: Date.now() };
};
const out = [await snap("t0 load+8s")];
await p.waitForTimeout(20000); out.push(await snap("idle 20s"));
// slow scroll 20 s
const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const t0 = Date.now();
while (Date.now() - t0 < 20000) { await p.mouse.wheel(0, Math.max(8, H / 400)); await p.waitForTimeout(50); }
out.push(await snap("after scroll 20s"));
await p.waitForTimeout(20000); out.push(await snap("idle bottom 20s"));
const S = await p.evaluate(() => window.__s);
const top = (o, n = 12) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
// per-window deltas
for (let i = 1; i < out.length; i++) {
  const a = out[i - 1], b = out[i], dt = (b.t - a.t) / 1000;
  b.procCpu = {}; for (const k of Object.keys(b.pr)) b.procCpu[k] = +(((b.pr[k].cpu - (a.pr[k]?.cpu || 0)) / dt) * 100).toFixed(0);
  b.cpuPct = +(((b.task - a.task) / dt) * 100).toFixed(1);
  b.scriptPct = +(((b.script - a.script) / dt) * 100).toFixed(1);
  b.rafTop = Object.entries(b.rafBy).map(([k, v]) => [k.replace(/^at /, ''), +((v - (a.rafBy[k] || 0)) / dt).toFixed(1)]).filter((x) => x[1] > 0.5).sort((x, y) => y[1] - x[1]).slice(0, 8);
  b.rafPerSec = +((b.rafTotal - a.rafTotal) / dt).toFixed(1);
  b.layoutsPerSec = +((b.layouts - a.layouts) / dt).toFixed(1);
  b.recalcPerSec = +((b.recalc - a.recalc) / dt).toFixed(1);
}
const lt = S.lt.filter((x) => x[1] >= 50);
for (const o of out) delete o.rafBy;
const res = { label, path, out, longTasks: { count: lt.length, over100: lt.filter((x) => x[1] >= 100).length, worst: lt.map((x) => x[1]).sort((a, b) => b - a).slice(0, 8) }, rafCallers: top(S.raf), intervals: top(S.si), timeouts: top(S.st, 8) };
writeFileSync(`qa-out/runaway-${label}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
await browser.close();
