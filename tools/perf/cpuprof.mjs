// node tools/perf/cpuprof.mjs <path> [idleMs] [scroll]  -> top self-time functions by file
import { chromium } from "playwright";
const BASE = process.env.QA_URL || "http://localhost:5199";
const path = process.argv[2] || "/", ms = +(process.argv[3] || 20000), scroll = process.argv[4] === "scroll";
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(30000);
await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 500 }); await cdp.send("Profiler.start");
if (scroll) { const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight); const t0 = Date.now(); while (Date.now() - t0 < ms) { await p.mouse.wheel(0, Math.max(8, H / 400)); await p.waitForTimeout(50); } }
else await p.waitForTimeout(ms);
const { profile } = await cdp.send("Profiler.stop");
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map(); const dt = profile.timeDeltas;
profile.samples.forEach((id, i) => self.set(id, (self.get(id) || 0) + (dt[i] || 0)));
const agg = new Map(); let total = 0;
for (const [id, t] of self) { const c = byId.get(id).callFrame; const k = `${c.functionName || "(anon)"} ${c.url.replace(/https?:\/\/[^/]+/, "").replace(/\?.*/, "")}:${c.lineNumber + 1}`; agg.set(k, (agg.get(k) || 0) + t); total += t; }
const idle = [...agg].filter(([k]) => /\(idle\)/.test(k)).reduce((a, [, t]) => a + t, 0);
console.log("window ms", ms, "sampled ms", (total / 1000) | 0, "idle ms", (idle / 1000) | 0);
[...agg].filter(([k]) => !/\(idle\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, t]) => console.log((t / 1000).toFixed(0).padStart(6), "ms", k));
await browser.close();
