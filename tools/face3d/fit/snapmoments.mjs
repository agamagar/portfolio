// every moment held at its peak on the harness (clay), one PNG each
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "node:fs";
const out = process.argv[2];
const M = [["rest", null, 0], ["blink", "blink", 0.45], ["grin", "grin", 0.4], ["surprised", "surprised", 0.3], ["wink", "wink", 0.4], ["laugh", "laugh", 0.15], ["shy", "shy", 0.5], ["think", "think", 0.5], ["look", "lookAround", 0.3], ["sad", "sad", 0.5], ["angry", "angry", 0.25], ["puff", "puff", 0.5]];
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 980 }, deviceScaleFactor: 1.5 });
await page.goto("http://localhost:58720/?skin=clay", { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 240000 });
await page.waitForTimeout(8000);
for (const [label, name, k] of M) {
  const png = await page.evaluate(async ([name, k]) => {
    const f = document.querySelector(".face-sv").__face;
    f.pose(name || "blink", name ? k : 0);
    await new Promise((r) => setTimeout(r, 400));
    return f.snapshot();
  }, [name, k]);
  fs.writeFileSync(`${out}/${label}.png`, Buffer.from(png.split(",")[1], "base64"));
}
await browser.close();
console.log("ok");
