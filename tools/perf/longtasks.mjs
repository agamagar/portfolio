// What are the long main-thread tasks (>14 ms) while a section idles in view? node longtasks.mjs <url> [selector]
import { chromium } from "playwright-core";
const [url, sel = ".ap"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: !process.env.HEADED, args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(6000);
await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center", behavior: "instant" }), sel); await p.waitForTimeout(3000);
await b.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "v8", "cc"] });
await p.waitForTimeout(5000);
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents;
const main = ev.filter((e) => e.ph === "X" && e.name === "RunTask" && e.dur > 14000);
console.log("long tasks >14ms:", main.length);
const names = {};
for (const t of main) for (const e of ev) if (e.ph === "X" && e.tid === t.tid && e.pid === t.pid && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e !== t && e.dur > 3000 && !["RunTask", "ThreadControllerImpl::RunTask"].includes(e.name)) { const k = e.name + (e.args?.data?.functionName ? ":" + e.args.data.functionName : ""); names[k] = (names[k] || 0) + e.dur / 1000; }
console.log(Object.entries(names).sort((a, c) => c[1] - a[1]).slice(0, 12).map(([k, v]) => `${v.toFixed(0).padStart(6)}ms ${k}`).join("\n"));
await b.close();
