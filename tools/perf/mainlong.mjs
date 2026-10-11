// Main-thread long tasks (PerformanceObserver, so workers are excluded) in the section while idle. node mainlong.mjs <url> [selector]
import { chromium } from "playwright-core";
const [url, sel = ".ap"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: !process.env.HEADED, args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(() => { window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(e.duration))).observe({ type: "longtask", buffered: true }); });
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(5000);
await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center", behavior: "instant" }), sel); await p.waitForTimeout(2500);
await p.evaluate(() => (window.__lt = [])); await p.waitForTimeout(8000);
const lt = await p.evaluate(() => window.__lt);
console.log(`long tasks in 8s: ${lt.length}, total ${lt.reduce((a, c) => a + c, 0).toFixed(0)} ms, max ${Math.max(0, ...lt).toFixed(0)} ms`);
await b.close();
