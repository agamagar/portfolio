// SD load strip: CDP screencast of the first ~2.6 s of opening the Scheduled
// Delivery case study, three ways: cold direct load, warm reload, and arriving
// from the homepage link. Writes frames + a timeline (reveal state, CLS shifts,
// scroll, visible opacity) per scenario. Run from ~/portfolio.
//   node tools/qa-sd-load-strip.mjs <origin> <outdir>
import { chromium } from "playwright";
import fs from "node:fs";
const ORIGIN = process.argv[2] || "http://localhost:5173";
const OUT = process.argv[3] || "/tmp/sd-strip";
const browser = await chromium.launch({ channel: "chromium", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const init = () => {
  window.__sd = { log: [], shifts: [] };
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__sd.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: e.sources?.map((s) => s.node?.className || s.node?.nodeName).join(",") }))).observe({ type: "layout-shift", buffered: true });
  } catch {}
  window.__sd.loaf = [];
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__sd.loaf.push({ t: Math.round(e.startTime), d: Math.round(e.duration), block: Math.round(e.blockingDuration || 0), render: Math.round(e.renderStart ? e.startTime + e.duration - e.renderStart : 0), style: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), scripts: (e.scripts || []).map((x) => `${Math.round(x.duration)}ms ${x.invoker} ${(x.sourceURL || "").split("/").pop()}:${x.sourceFunctionName || ""}`).slice(0, 4) }))).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
  const poll = () => {
    const pg = document.querySelector(".page--article");
    const vis = (sel) => { const el = document.querySelector(sel); return el ? +getComputedStyle(el).opacity : null; };
    window.__sd.log.push({ t: Math.round(performance.now()), path: location.pathname, rev: pg?.dataset.loadReveal ?? (pg ? "none" : "-"), y: Math.round(scrollY), root: vis("#root"), head: vis(".article__head"), hero: vis(".article__hero-board"), body: vis(".article__body"), fonts: document.fonts?.status });
    if (performance.now() < 30000) requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
};
async function record(name, go) {
  const dir = `${OUT}/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const { ctx, page } = go.ctx;
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (f) => { frames.push({ ts: f.metadata.timestamp, data: f.data }); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 640, maxHeight: 430, everyNthFrame: 1 });
  const perf0 = go.spa ? await page.evaluate(() => performance.now()) : 0; // log times are page-perf ms; frames are ms from here
  const t0 = Date.now() / 1000;
  await go.run(page);
  await page.waitForTimeout(2800);
  await cdp.send("Page.stopScreencast");
  const sd = await page.evaluate(() => window.__sd).catch(() => null);
  frames.forEach((f, i) => fs.writeFileSync(`${dir}/${String(i).padStart(3, "0")}_${Math.round((f.ts - t0) * 1000)}ms.jpg`, Buffer.from(f.data, "base64")));
  if (sd) sd.perf0 = Math.round(perf0);
  fs.writeFileSync(`${dir}/timeline.json`, JSON.stringify(sd, null, 1));
  console.log(name, "frames", frames.length, "shifts", JSON.stringify(sd?.shifts));
}
// NOFAV=1: stub Worker so the 3D favicon (lib/favicon3d.js) never ticks, for an A/B
const nofav = () => { window.Worker = class { postMessage() {} terminate() {} }; };
async function fresh() { const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" }); await ctx.addInitScript(init); if (process.env.NOFAV) await ctx.addInitScript(nofav); const page = await ctx.newPage(); return { ctx, page }; }
// 1 cold direct
let c = await fresh();
await record("cold", { ctx: c, run: (p) => p.goto(`${ORIGIN}/work/scheduled-delivery`) });
// 2 warm reload (same context, cache warm)
await record("warm", { ctx: c, run: (p) => p.reload() });
await c.ctx.close();
// 3 from homepage link
c = await fresh();
await c.page.goto(ORIGIN + "/"); await c.page.waitForTimeout(2500);
await c.page.evaluate(() => { window.__sd.log = []; window.__sd.shifts = []; window.__sd.loaf = []; });
await record("fromhome", { ctx: c, spa: true, run: async (p) => {
  // the first VISIBLE link to the case study (some homepage links sit in hidden layers)
  const ok = await p.evaluate(() => {
    const a = [...document.querySelectorAll('a[href="/work/scheduled-delivery"]')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== "hidden"; });
    const card = a || [...document.querySelectorAll('[data-project="/work/scheduled-delivery"]')].find((x) => x.getBoundingClientRect().width > 0);
    if (card) { card.click(); return card.outerHTML.slice(0, 100); }
    // no visible link in this homepage build: the router's own SPA path (pushState + popstate)
    history.pushState({}, "", "/work/scheduled-delivery"); dispatchEvent(new PopStateEvent("popstate")); return "popstate";
  });
  console.log("clicked", ok);
} });
await browser.close();
