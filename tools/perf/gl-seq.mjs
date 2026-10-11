import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext()).newPage();
await p.addInitScript(() => { window.__s = []; const P = WebGL2RenderingContext.prototype; for (const f of ["readPixels", "getBufferSubData", "fenceSync", "clientWaitSync", "bufferData"]) { const o = P[f]; P[f] = function (...a) { if (window.__s.length < 40) window.__s.push(f + (f === "clientWaitSync" ? "" : "")); const r = o.apply(this, a); if (f === "clientWaitSync" && window.__s.length < 40) window.__s[window.__s.length - 1] += "=" + r; return r; }; } });
await p.goto(process.argv[2], { waitUntil: "load" }); await p.waitForTimeout(2500);
console.log((await p.evaluate(() => window.__s)).join(" ")); await b.close();
