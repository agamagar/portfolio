// Where do the favicon's main-thread milliseconds go? node favicon-cost.mjs <url>
import { chromium } from "playwright-core";
const url = process.argv[2];
const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
await p.addInitScript(() => {
  const T = (window.__t = {});
  const wrap = (obj, name, key) => { const o = obj[name]; obj[name] = function (...a) { const t0 = performance.now(); try { return o.apply(this, a); } finally { const e = (T[key] ||= { ms: 0, n: 0 }); e.ms += performance.now() - t0; e.n++; } }; };
  wrap(HTMLCanvasElement.prototype, "toBlob", "toBlob");
  for (const fn of ["drawArrays", "texImage2D", "texSubImage2D", "uniform1f", "uniform2f", "uniform3f", "useProgram", "readPixels", "finish", "flush", "getBufferSubData", "clientWaitSync", "fenceSync"]) wrap(WebGL2RenderingContext.prototype, fn, "gl." + fn);
});
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(3000);
await p.evaluate(() => { for (const k in window.__t) delete window.__t[k]; }); await p.waitForTimeout(5000);
console.log(Object.entries(await p.evaluate(() => window.__t)).sort((a, b) => b[1].ms - a[1].ms).slice(0, 8).map(([k, v]) => `${v.ms.toFixed(0).padStart(6)}ms ${String(v.n).padStart(6)}x  ${(v.ms / v.n).toFixed(2)}ms each  ${k}`).join("\n"));
await b.close();
