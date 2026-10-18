// Room load timeline: node tools/perf/room-load.mjs [url] [--cpu=4] [--runs=3]
// Cold load (fresh context) then warm second load (same context: HTTP cache, IndexedDB, SW),
// reporting ms from navigation: pill "ready", room:* marks, long tasks, slowest room fetches,
// and click -> entered (pill state landing/handoff).
import { chromium } from "playwright-core";
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=")[1] ?? d;
const URL_ = process.argv.find((a) => a.startsWith("http")) || "http://127.0.0.1:5417/";
const CPU = +arg("cpu", 1), RUNS = +arg("runs", 3);
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
async function load(ctx) {
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  if (CPU > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  await p.addInitScript(() => {
    window.__lt = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true });
  });
  const t0 = Date.now();
  await p.goto(URL_, { waitUntil: "load" });
  const pill = p.locator(".wscene-warm-pill__btn").first();
  await p.waitForFunction(() => document.querySelector(".wscene-warm-pill")?.dataset.state === "ready", null, { timeout: 240000, polling: 250 });
  const ready = await p.evaluate(() => Math.round(performance.now()));
  const t1 = Date.now();
  await pill.click();
  await p.waitForFunction(() => ["landing", "handoff"].includes(document.querySelector(".wscene-warm-pill")?.dataset.state), null, { timeout: 120000, polling: 50 });
  const entered = Date.now() - t1;
  const info = await p.evaluate(() => ({
    marks: Object.fromEntries(performance.getEntriesByType("mark").filter((m) => m.name.startsWith("room:")).map((m) => [m.name.slice(5), Math.round(m.startTime)])),
    lt: window.__lt.filter((x) => x[1] >= 100).length, ltMs: window.__lt.reduce((a, x) => a + x[1], 0),
    res: performance.getEntriesByType("resource").filter((r) => /window-scene|room|\.glb|\.hdr|\.jpg|\.webp|worker/i.test(r.name)).map((r) => [r.name.split("/").slice(-2).join("/").slice(0, 50), Math.round(r.responseEnd - r.startTime), r.transferSize]).sort((a, b) => b[1] - a[1]).slice(0, 6),
  }));
  await p.close();
  return { ready, entered, ...info };
}
const out = { cold: [], warm: [] };
const b = await chromium.launch({ args: ["--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--use-angle=metal"] });
for (let i = 0; i < RUNS; i++) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  out.cold.push(await load(ctx));
  out.warm.push(await load(ctx));
  await ctx.close();
  console.error("run", i, JSON.stringify([out.cold[i].ready, out.cold[i].entered, out.warm[i].ready, out.warm[i].entered]));
}
await b.close();
for (const k of ["cold", "warm"]) console.log(k, `cpu x${CPU}`, "ready(ms) median", med(out[k].map((r) => r.ready)), "click->entered", med(out[k].map((r) => r.entered)), "\n marks", JSON.stringify(out[k][RUNS >> 1].marks), "\n longtasks>=100ms", out[k][RUNS >> 1].lt, "total", out[k][RUNS >> 1].ltMs, "\n slowest", JSON.stringify(out[k][RUNS >> 1].res));
