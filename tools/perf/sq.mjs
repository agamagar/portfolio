// Side-quests section frame times at 1440: node tools/perf/sq.mjs <url> [seconds]. Scrolls to .pm / .along-path section, records idle and scrolling frames, plus trace totals.
import { chromium } from "playwright-core";
const url = process.argv[2]; const secs = Number(process.argv[3] || 6);
const b = await chromium.launch({ channel: "chrome", headless: !process.env.HEADED, args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(() => { window.__f = []; let l = 0, on = false; window.__rec = (v) => { on = v; l = 0; if (v) window.__f = []; }; const t = (n) => { if (on && l) window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(5000);
if (!url.includes("scene=off")) { await p.waitForFunction(() => document.documentElement.dataset.wsceneDrawn, null, { timeout: 90000, polling: 500 }).catch(() => console.log("no handover")); await p.waitForTimeout(10000); }
const sel = await p.evaluate(() => { const e = document.querySelector(".pm, [class*=along], [class*=ap-stage], .ap"); if (!e) return null; e.scrollIntoView({ block: "center", behavior: "instant" }); return e.className; });
console.log("section:", sel);
await p.waitForTimeout(2500);
const stat = (f) => { const s = [...f].sort((a, b) => a - b); const q = (x) => +(s[Math.floor(s.length * x)] || 0).toFixed(1); return { n: f.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), over16_7: +((f.filter((x) => x > 16.7).length / f.length) * 100).toFixed(1), fps: +(1000 / (f.reduce((a, c) => a + c, 0) / f.length)).toFixed(1) }; };
await p.evaluate(() => window.__rec(true)); await p.waitForTimeout(secs * 1000);
console.log("idle in view:", JSON.stringify(stat(await p.evaluate(() => { window.__rec(false); return window.__f; }))));
await b.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "cc", "gpu"] });
await p.evaluate(() => window.__rec(true)); await p.mouse.move(700, 450);
const t0 = Date.now(); while (Date.now() - t0 < secs * 1000) { await p.mouse.move(300 + ((Date.now() - t0) / 8) % 800, 450); await p.waitForTimeout(16); }
console.log("pointer moving over it:", JSON.stringify(stat(await p.evaluate(() => { window.__rec(false); return window.__f; }))));
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents; const tot = {};
for (const e of ev) if (e.ph === "X" && e.dur) { (tot[e.name] ||= { ms: 0, n: 0 }); tot[e.name].ms += e.dur / 1000; tot[e.name].n++; }
const fc = {}; for (const e of ev) if (e.name === "FunctionCall" && e.dur) { const k = (e.args?.data?.functionName || "?") + " " + (e.args?.data?.url || "").split("/").pop() + ":" + (e.args?.data?.lineNumber ?? ""); (fc[k] ||= { ms: 0, n: 0 }); fc[k].ms += e.dur / 1000; fc[k].n++; }
console.log(Object.entries(fc).sort((a, b) => b[1].ms - a[1].ms).slice(0, 8).map(([k, v]) => `${v.ms.toFixed(0).padStart(6)}ms ${String(v.n).padStart(5)}x ${k}`).join("\n"));
console.log(["FunctionCall", "UpdateLayoutTree", "Layout", "PrePaint", "Paint", "Layerize", "Commit", "RasterTask", "ImageDecodeTask", "GPUTask", "FireAnimationFrame", "VideoFrameCompositor::UpdateCurrentFrame", "DrawFrame", "BeginMainThreadFrame", "Animation", "Decode Video Frame", "VideoRenderer::Render"].filter((k) => tot[k]).map((k) => `${tot[k].ms.toFixed(0).padStart(6)}ms ${String(tot[k].n).padStart(5)}x ${k}`).join("\n"));
console.log("videos playing:", await p.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.paused).length + "/" + document.querySelectorAll("video").length), "cards:", await p.evaluate(() => document.querySelectorAll(".pm__item, [class*=pm__item]").length));
await b.close();
