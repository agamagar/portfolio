import { chromium } from "playwright";
const BASE = process.env.QA_URL || "http://localhost:5199";
const path = process.argv[2] || "/";
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(() => {
  window.__gl = [];
  const o = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { const c = o.call(this, t, ...a); if (/webgl/.test(t)) window.__gl.push({ t: Math.round(performance.now()), type: t, cv: this, stack: (new Error().stack || "").split("\n").slice(2, 5).map((s) => s.replace(/https?:\/\/[^/]+/, "").replace(/\?[^:]*/, "").trim()).join(" < ") }); return c; };
  const oo = window.OffscreenCanvas && OffscreenCanvas.prototype.getContext;
});
await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(40000);
const r = await p.evaluate(() => window.__gl.map((g) => `${g.t}ms ${g.type} ${g.cv.width}x${g.cv.height} inDOM=${g.cv.isConnected} lost=${g.cv.getContext(g.type)?.isContextLost?.()} ${g.stack}`));
console.log(r.join("\n"));
await browser.close();
