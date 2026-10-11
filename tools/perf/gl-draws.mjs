// Which canvases draw while a section is in view? node gl-draws.mjs <url> [selector-to-scroll-to]
import { chromium } from "playwright-core";
const [url, sel = ".ap"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(() => {
  window.__draws = new Map();
  for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
    const o = C.prototype[fn]; C.prototype[fn] = function (...a) { const c = this.canvas; window.__draws.set(c, (window.__draws.get(c) || 0) + 1); if (c.width === 1024 && !window.__stack && window.__go) window.__stack = new Error().stack; return o.apply(this, a); };
  }
});
await p.goto(url, { waitUntil: "load" });
await p.waitForFunction(() => document.documentElement.dataset.wsceneDrawn, null, { timeout: 90000, polling: 500 }).catch(() => console.log("no handover"));
await p.waitForTimeout(2000);
await p.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: "center", behavior: "instant" }), sel);
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__draws.clear(); window.__go = true; }); await p.waitForTimeout(5000);
console.log(await p.evaluate(() => [...document.querySelectorAll("canvas")].map((c) => { const r = c.getBoundingClientRect(); return `${c.className || c.parentElement?.className || "?"} ${c.width}x${c.height} top=${Math.round(r.top)} hidden=${c.dataset.hidden} draws/5s=${window.__draws.get(c) || 0}`; }).join("\n")));
console.log((await p.evaluate(() => window.__stack || "")).split("\n").slice(0, 9).join("\n"));
console.log("all canvases drawn:", await p.evaluate(() => [...window.__draws].map(([c, n]) => `${c.width}x${c.height} inDOM=${c.isConnected} n=${n}`).join(" | ")));
await b.close();
