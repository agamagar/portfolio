// Repeatable perf bench: node tools/perf/bench.mjs --url http://127.0.0.1:4310 [--idle 60] [--only home-plain,home-room,sd] [--out file.json] [--label x]
// Needs `vite build && vite preview --port N` running. Uses system Chrome through playwright-core + CDP.
import { chromium } from "playwright-core";
import fs from "node:fs";

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("url", "http://127.0.0.1:4310");
const IDLE = Number(arg("idle", 60));
const ONLY = (arg("only", "home-plain,home-room,sd")).split(",");
const OUT = arg("out", "/tmp/bench.json");
const LABEL = arg("label", "run");
const THROTTLE = arg("throttle", ""); // "4g" = 9 Mbps/170 ms (CDP "Regular 4G"-ish); "slow4g" = 1.6 Mbps/150 ms

const SCENARIOS = {
  "home-plain": { path: "/?scene=off", room: false },
  "home-room": { path: "/", room: true },
  sd: { path: "/work/scheduled-delivery", room: false },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(s.length * p))].toFixed(2); };
const round = (n, d = 1) => +n.toFixed(d);

const INIT = `
(() => {
  const w = window.__perf = { lcp: 0, cls: 0, fcp: 0, long: [], frames: [] };
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) w.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) w.cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") w.fcp = e.startTime; }).observe({ type: "paint", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) w.long.push([e.startTime, e.duration]); }).observe({ type: "longtask", buffered: true }); } catch {}
  let last = 0, rec = false;
  w.rec = (on) => { rec = on; last = 0; if (on) w.frames = []; };
  const tick = (t) => { if (rec && last) w.frames.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();`;

async function heapNow(cdp) {
  await cdp.send("HeapProfiler.collectGarbage");
  const m = await cdp.send("Performance.getMetrics");
  const g = Object.fromEntries(m.metrics.map((x) => [x.name, x.value]));
  const c = await cdp.send("Memory.getDOMCounters");
  return { jsHeapMB: round(g.JSHeapUsedSize / 1048576, 1), domNodes: c.nodes, listeners: c.jsEventListeners, documents: c.documents };
}

async function scrollRun(page, steps = 400, dy = 120, dt = 16) {
  await page.evaluate(() => window.__perf.rec(true));
  const t0 = Date.now();
  await page.mouse.move(700, 450);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy);
    await sleep(dt);
    if (i % 20 === 0) {
      const done = await page.evaluate(() => window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4);
      if (done) break;
    }
  }
  await sleep(600);
  return page.evaluate((t0) => { window.__perf.rec(false); return { frames: window.__perf.frames, y: scrollY }; }, t0);
}

function frameStats(f) {
  return { frames: f.length, p50: pct(f, 0.5), p95: pct(f, 0.95), p99: pct(f, 0.99), max: round(Math.max(0, ...f)), over16_7: f.length ? round((f.filter((x) => x > 16.7).length / f.length) * 100) : 0, over50: f.filter((x) => x > 50).length };
}

async function run(name, sc, browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(INIT);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable"); await cdp.send("Performance.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (THROTTLE) { const t = THROTTLE === "slow4g" ? [1.6e6, 0.75e6, 150] : [9e6, 1.5e6, 170]; await cdp.send("Network.emulateNetworkConditions", { offline: false, downloadThroughput: t[0] / 8, uploadThroughput: t[1] / 8, latency: t[2] }); }
  const reqs = new Map(); let total = 0;
  cdp.on("Network.requestWillBeSent", (e) => reqs.set(e.requestId, { url: e.request.url, type: e.type, bytes: 0 }));
  cdp.on("Network.loadingFinished", (e) => { const r = reqs.get(e.requestId); if (r) { r.bytes = e.encodedDataLength; total += e.encodedDataLength; } });
  const errors = []; page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

  const out = { name, path: sc.path };
  const t0 = Date.now();
  await page.goto(BASE + sc.path, { waitUntil: "load", timeout: 60000 });
  await sleep(4000); // settle
  const m = await page.evaluate(() => { const p = window.__perf; const nav = performance.getEntriesByType("navigation")[0]; return { lcp: p.lcp, fcp: p.fcp, cls: p.cls, long: p.long, loadEvt: nav.loadEventEnd, dcl: nav.domContentLoadedEventEnd }; });
  const tbt = m.long.filter(([s]) => s >= m.fcp && s < m.fcp + 15000).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
  const byType = (re) => [...reqs.values()].filter((r) => re.test(r.url.split("?")[0])).reduce((a, r) => a + r.bytes, 0);
  out.load = { fcp: round(m.fcp), lcp: round(m.lcp), tbt: round(tbt), cls: +m.cls.toFixed(4), dcl: round(m.dcl), loadEvent: round(m.loadEvt), jsKB: round(byType(/\.m?js$/) / 1024), cssKB: round(byType(/\.css$/) / 1024), imgKB: round(byType(/\.(png|jpe?g|webp|avif|gif|svg)$/i) / 1024), fontKB: round(byType(/\.(woff2?|ttf|otf)$/i) / 1024), mediaKB: round(byType(/\.(mp4|webm|mov|glb|ktx2|mp3|m4a|wav)$/i) / 1024), totalKB: round(total / 1024), requests: reqs.size, longTasks: m.long.length };

  if (sc.room) {
    const ok = await page.waitForFunction(() => document.documentElement.classList.contains("wscene-handover") || document.documentElement.dataset.wsceneDrawn, null, { timeout: 90000, polling: 500 }).then(() => true).catch(() => false);
    await sleep(4000);
    out.room = { handedOver: ok };
    out.room.heap = await heapNow(cdp);
    // fps in the scene while scrolling through the runway
    const r = await scrollRun(page, 140, 90, 16);
    out.room.scrollFrames = frameStats(r.frames);
    // idle fps in scene
    await page.evaluate(() => window.__perf.rec(true)); await sleep(5000);
    const idle = await page.evaluate(() => { window.__perf.rec(false); return window.__perf.frames; });
    out.room.idleFrames = frameStats(idle);
    out.room.fpsIdle = round(1000 / (idle.reduce((a, b) => a + b, 0) / Math.max(1, idle.length)));
    await page.evaluate(() => scrollTo(0, 0)); await sleep(800);
  }

  out.memStart = await heapNow(cdp);
  await page.evaluate(() => window.__perf.long.length = 0);
  const down = await scrollRun(page, 700, 140, 16);
  out.scrollDown = { ...frameStats(down.frames), reachedY: Math.round(down.y), longTasks: await page.evaluate(() => window.__perf.long.length), longTaskMs: await page.evaluate(() => Math.round(window.__perf.long.reduce((a, [, d]) => a + d, 0))) };
  out.memBottom = await heapNow(cdp);
  const up = await scrollRun(page, 700, -140, 16);
  out.scrollUp = frameStats(up.frames);
  out.memBack = await heapNow(cdp);
  if (IDLE > 0) { await sleep(IDLE * 1000); out.memIdle = await heapNow(cdp); }
  out.pageErrors = errors;
  out.totalSec = round((Date.now() - t0) / 1000);
  out.topRequests = [...reqs.values()].sort((a, b) => b.bytes - a.bytes).slice(0, 12).map((r) => [Math.round(r.bytes / 1024), r.url.replace(BASE, "")]);
  await ctx.close();
  return out;
}

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--js-flags=--expose-gc"] });
const res = { label: LABEL, base: BASE, when: new Date().toISOString(), chrome: browser.version(), scenarios: {} };
for (const n of ONLY) { if (SCENARIOS[n]) { console.error("running", n); res.scenarios[n] = await run(n, SCENARIOS[n], browser); } }
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log(JSON.stringify(Object.fromEntries(Object.entries(res.scenarios).map(([k, v]) => [k, { load: v.load, scroll: v.scrollDown, room: v.room, mem: [v.memStart?.jsHeapMB, v.memBottom?.jsHeapMB, v.memBack?.jsHeapMB, v.memIdle?.jsHeapMB], dom: v.memStart?.domNodes }])), null, 1));
