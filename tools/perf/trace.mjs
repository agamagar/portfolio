// Chrome trace summary of a scripted scroll: node tools/perf/trace.mjs <url> [seconds]
import { chromium } from "playwright-core";
const url = process.argv[2]; const secs = Number(process.argv[3] || 8);
const b = await chromium.launch({ channel: "chrome" });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(3000);
await b.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink", "cc", "gpu"] });
await p.mouse.move(700, 450);
const t0 = Date.now(); while (Date.now() - t0 < secs * 1000) { await p.mouse.wheel(0, 120); await p.waitForTimeout(16); }
const buf = await b.stopTracing();
const ev = JSON.parse(buf.toString()).traceEvents;
const tot = {};
for (const e of ev) if (e.ph === "X" && e.dur) { const k = e.name; (tot[k] ||= { ms: 0, n: 0 }); tot[k].ms += e.dur / 1000; tot[k].n++; }
const want = ["FunctionCall", "UpdateLayoutTree", "Layout", "PrePaint", "Paint", "Layerize", "Commit", "RasterTask", "ImageDecodeTask", "Decode LazyPixelRef", "EvaluateScript", "ParseHTML", "RunTask", "GPUTask", "HitTest", "IntersectionObserverController::computeIntersections", "UpdateLayer", "ScheduleStyleRecalculation", "FireAnimationFrame", "TimerFire", "MinorGC", "MajorGC"];
console.log(want.filter((k) => tot[k]).map((k) => `${tot[k].ms.toFixed(0).padStart(7)}ms ${String(tot[k].n).padStart(6)}x ${k}`).join("\n"));
await b.close();
