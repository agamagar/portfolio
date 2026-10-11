// Main-thread long tasks in the first N s of a cold open (workers excluded). node coldlong.mjs <url> [seconds] [runs]
import { chromium } from "playwright-core";
const [url, secs = 6, runs = 3] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: !process.env.HEADED, args: ["--ignore-gpu-blocklist"] });
for (let r = 0; r < Number(runs); r++) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.addInitScript(() => { window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true }); });
  await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(Number(secs) * 1000);
  const lt = (await p.evaluate(() => window.__lt)).filter(([s]) => s < Number(secs) * 1000);
  console.log(lt.map(([s,d])=>Math.round(s)+":"+Math.round(d)).join(" ")); console.log(`run ${r + 1}: ${lt.length} long tasks, ${lt.reduce((a, [, d]) => a + d, 0).toFixed(0)} ms, max ${Math.max(0, ...lt.map((x) => x[1])).toFixed(0)} ms`);
  await p.context().close();
}
await b.close();
