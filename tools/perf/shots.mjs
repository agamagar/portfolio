// Visual regression: node tools/perf/shots.mjs --url http://127.0.0.1:4310 --out /tmp/shots/new   then compare dirs with tools/perf/diff.py
import { chromium } from "playwright-core";
import fs from "node:fs";
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("url"), OUT = arg("out");
fs.mkdirSync(OUT, { recursive: true });
const PAGES = [["home", "/?scene=off"], ["sd", "/work/scheduled-delivery"], ["xs", "/work/cross-sell"], ["away", "/work/away-agent"], ["zepiris", "/work/zepiris"], ["dassh", "/work/dassh"]];
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [n, p] of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + p, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(4000);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const stops = Math.min(12, Math.ceil(h / 900));
  for (let i = 0; i < stops; i++) {
    const y = Math.round((i * (h - 900)) / Math.max(1, stops - 1));
    await page.evaluate((y) => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, y); }, y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${n}-${String(i).padStart(2, "0")}.png` });
  }
  await ctx.close();
}
await browser.close();
