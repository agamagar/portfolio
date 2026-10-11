// Which rAF callbacks / scroll listeners cost the most? node tools/perf/raf-profile.mjs <url> [seconds]
import { chromium } from "playwright-core";
const url = process.argv[2]; const secs = Number(process.argv[3] || 8);
const b = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const tally = (window.__raf = {});
  const key = (fn) => { const s = (fn.name || "") + ":" + String(fn).replace(/\s+/g, " ").slice(0, 70); return s; };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => { const k = key(cb); const t0 = performance.now(); try { return cb(t); } finally { const e = (tally[k] ||= { n: 0, ms: 0 }); e.n++; e.ms += performance.now() - t0; } });
  const add = EventTarget.prototype.addEventListener;
  const L = (window.__listeners = {});
  EventTarget.prototype.addEventListener = function (type, fn, o) {
    if (["scroll", "wheel", "pointermove", "mousemove", "resize"].includes(type) && typeof fn === "function") {
      const k = type + ":" + key(fn); const wrapped = function (...a) { const t0 = performance.now(); try { return fn.apply(this, a); } finally { const e = (L[k] ||= { n: 0, ms: 0 }); e.n++; e.ms += performance.now() - t0; } };
      return add.call(this, type, wrapped, o);
    }
    return add.call(this, type, fn, o);
  };
});
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(3000);
await p.evaluate(() => { for (const k in window.__raf) delete window.__raf[k]; });
await p.mouse.move(700, 450);
const t0 = Date.now();
while (Date.now() - t0 < secs * 1000) { await p.mouse.wheel(0, 120); await p.waitForTimeout(16); }
const r = await p.evaluate(() => ({ raf: window.__raf, lis: window.__listeners }));
const show = (o) => Object.entries(o).sort((a, b) => b[1].ms - a[1].ms).slice(0, 12).map(([k, v]) => `${v.ms.toFixed(0).padStart(6)}ms ${String(v.n).padStart(5)}x  ${k}`).join("\n");
console.log("rAF callbacks:\n" + show(r.raf) + "\n\nlisteners:\n" + show(r.lis));
await b.close();
