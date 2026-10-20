// RAM probe: node tools/ram-measure.mjs [flow]  (QA_URL, default :5197). Headless Chromium + CDP.
import { chromium } from "playwright";
import { execSync } from "node:child_process";
const BASE = process.env.QA_URL || "http://localhost:5197";
const flow = process.argv[2] || "all";
const browser = await chromium.launch({ args: ["--enable-precise-memory-info", "--js-flags=--expose-gc", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
function rss() { // sum RSS (MB) of all Playwright-launched chromium processes (run one probe at a time)
  const out = execSync("ps -axo rss=,command=").toString().split("\n").filter((l) => /ms-playwright|playwright_chromiumdev/.test(l));
  return Math.round(out.reduce((a, l) => a + (parseInt(l.trim(), 10) || 0), 0) / 1024);
}
const INIT = () => {
  const live = { ctx: 0, tex: 0, buf: 0, fb: 0, rb: 0, prog: 0, vao: 0, lost: 0 };
  window.__gl = live;
  for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {
    const P = C.prototype;
    const pair = (c, d, k) => { const a = P[c], b = P[d]; P[c] = function (...x) { const r = a.apply(this, x); if (r) live[k]++; return r; }; P[d] = function (o) { if (o) live[k]--; return b.call(this, o); }; };
    pair("createTexture", "deleteTexture", "tex"); pair("createBuffer", "deleteBuffer", "buf"); pair("createFramebuffer", "deleteFramebuffer", "fb");
    pair("createRenderbuffer", "deleteRenderbuffer", "rb"); pair("createProgram", "deleteProgram", "prog");
    if (P.createVertexArray) pair("createVertexArray", "deleteVertexArray", "vao");
  }
  const gc = HTMLCanvasElement.prototype.getContext; const set = new Set();
  window.__ctxs = set;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { const c = gc.call(this, t, ...a); if (c && /webgl/.test(t)) set.add(new WeakRef(this)); return c; };
};
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(INIT);
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Performance.enable");
const rows = [];
async function snap(label) {
  await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
  const m = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]));
  const gl = await page.evaluate(() => ({ ...window.__gl, ctxLive: [...window.__ctxs].filter((w) => w.deref()?.isConnected).length, canv: document.querySelectorAll("canvas").length, vid: document.querySelectorAll("video").length, img: document.querySelectorAll("img").length, nodes: document.getElementsByTagName("*").length })).catch(() => ({}));
  const r = { label, heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1), totalMB: rss(), listeners: m.JSEventListeners, nodes: m.Nodes, ...gl };
  rows.push(r); console.log(JSON.stringify(r));
}
const wait = (ms) => page.waitForTimeout(ms);
const go = async (p) => { await page.goto(BASE + p + (process.env.QS || ""), { waitUntil: "domcontentloaded", timeout: 120000 }); await wait(9000); };
if (flow === "all" || flow === "home") { await go("/"); await snap("home loaded"); }
if (flow === "all" || flow === "nav") {
  if (flow === "nav") await go("/");
  for (const slug of ["scheduled-delivery", "away-agent"]) {
    await page.evaluate((s) => { const a = document.querySelector(`a[href="/work/${s}"]`); a ? a.click() : (history.pushState({}, "", "/work/" + s), dispatchEvent(new PopStateEvent("popstate"))); }, slug);
    await wait(7000); await snap("case " + slug);
    await page.goBack(); await wait(5000); await snap("back from " + slug);
  }
}
if (flow === "all" || flow === "idle") { if (flow === "idle") { await go("/"); await snap("idle +0"); } await wait(60000); await snap("idle +60s"); await wait(60000); await snap("idle +120s"); }
if (flow === "away") { // room warmed on home, then 60 s on a case study, then back
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 }); await wait(80000); await snap("home +80s (room warm)");
  await page.evaluate(() => document.querySelector('a[href="/work/scheduled-delivery"]').click()); await wait(60000); await snap("case page +60s");
  await page.goBack(); await wait(8000); await snap("back home +8s");
}
if (flow === "all" || flow === "room") {
  await go("/"); await snap("room: home before");
  const t = Date.now();
  await page.waitForSelector('.wscene-warm-pill[data-state="ready"]', { timeout: 120000 }).catch(() => console.log("room never ready"));
  await snap("room warmed (" + (Date.now() - t) + "ms)");
  await page.click(".wscene-warm-pill").catch((e) => console.log("click fail", e.message)); await wait(15000); await snap("room entered");
  await page.keyboard.press("Escape"); await wait(5000); await snap("room after Esc");
}
console.log("TABLE\n" + rows.map((r) => `${r.label.padEnd(28)} heap ${String(r.heapMB).padStart(6)}  total ${String(r.totalMB).padStart(5)}  ctx ${r.ctxLive} tex ${r.tex} buf ${r.buf} fb ${r.fb} prog ${r.prog} vid ${r.vid}`).join("\n"));
await browser.close();
