// Live WebGL contexts and JS heap on the home page after the hand-over. node contexts.mjs <url> [seconds]
import { chromium } from "playwright-core";
const [url, secs = 40] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(() => { window.__ctx = []; const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { const c = o.call(this, t, ...a); if (c && /webgl/.test(t)) window.__ctx.push({ c: this, t, at: Math.round(performance.now()) }); return c; }; const oc = OffscreenCanvas.prototype.getContext; OffscreenCanvas.prototype.getContext = function (t, ...a) { const c = oc.call(this, t, ...a); if (c && /webgl/.test(t)) window.__ctx.push({ c: this, t, at: Math.round(performance.now()), off: true }); return c; }; });
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(Number(secs) * 1000);
const cdp = await p.context().newCDPSession(p); await cdp.send("HeapProfiler.collectGarbage"); await cdp.send("Performance.enable");
const m = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]));
console.log(await p.evaluate(() => window.__ctx.map((x) => { const lost = x.c.getContext?.(x.t)?.isContextLost?.(); return `${x.t} ${x.c.width}x${x.c.height} created@${x.at}ms ${x.off ? "offscreen " : ""}${x.c.isConnected === false && !x.off ? "detached " : ""}${lost ? "LOST" : ""}`; }).join("\n")));
console.log("JS heap MB", (m.JSHeapUsedSize / 1048576).toFixed(1), "nodes", m.Nodes);
await b.close();
