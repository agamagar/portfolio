// motionframes.mjs OUTDIR : held frames of several emotes and the bounce, as PNGs
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "node:fs";
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 980 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:58720/?skin=clay", { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 240000 });
await page.waitForTimeout(8000);
const shots = [["blink", 0.45], ["grin", 0.3], ["surprised", 0.2], ["wink", 0.3], ["laugh", 0.15], ["nod", 0.25], ["lookAround", 0.3], ["shy", 0.4], ["sad", 0.5]];
for (const [e, k] of shots) {
  const png = await page.evaluate(async ([e, k]) => {
    const f = document.querySelector(".face-sv").__face; f.pose(e, k);
    await new Promise((r) => setTimeout(r, 300)); return f.snapshot();
  }, [e, k]);
  fs.writeFileSync(`${out}/${e}.png`, Buffer.from(png.split(",")[1], "base64"));
}
await browser.close();
console.log("ok");
