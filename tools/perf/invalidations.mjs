// who invalidates style at idle: node tools/perf/invalidations.mjs [path] [scrollY]
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const BASE = process.env.QA_URL || "http://localhost:5302";
const path = process.argv[2] || "/", sy = +(process.argv[3] || 0);
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(30000);
if (sy) { await p.evaluate((y) => scrollTo(0, y), sy); await p.waitForTimeout(3000); }
await browser.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.invalidationTracking", "disabled-by-default-devtools.timeline.stack", "v8"] });
await p.waitForTimeout(4000);
const buf = await browser.stopTracing();
const ev = JSON.parse(buf.toString()).traceEvents;
const agg = {};
for (const e of ev) {
  if (!/StyleRecalcInvalidationTracking|StyleInvalidatorInvalidationTracking|ScheduleStyleRecalculation/.test(e.name)) continue;
  const a = e.args?.data || {};
  const k = `${e.name} | ${a.reason || ""} | ${a.extraData || ""} | ${(a.nodeName || "").slice(0, 60)} | ${a.invalidationSet || ""}`;
  agg[k] = (agg[k] || 0) + 1;
}
Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 14).forEach(([k, v]) => console.log(String(v).padStart(5), k));
const names = {}; ev.forEach((e) => { if (e.dur) names[e.name] = (names[e.name] || 0) + e.dur / 1000; });
console.log(Object.entries(names).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${k}:${v.toFixed(0)}ms`).join("  "));
await browser.close();
