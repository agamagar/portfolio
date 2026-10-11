// turnframes.mjs OUTDIR : held frames with the head turned, nodded and tilted
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "node:fs";
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 980 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:58720/?skin=clay", { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 240000 });
await page.waitForTimeout(8000);
const shots = [["rest", "blink", 0], ["turn-left", "lookAround", 0.3], ["turn-right", "lookAround", 0.7], ["nod-down", "nod", 0.25],
  ["look-up", "think", 0.5], ["shy", "shy", 0.5]];
for (const [label, e, k] of shots) {
  const png = await page.evaluate(async ([e, k]) => {
    const f = document.querySelector(".face-sv").__face; f.pose(e, k);
    await new Promise((r) => setTimeout(r, 300)); return f.snapshot();
  }, [e, k]);
  fs.writeFileSync(`${out}/${label}.png`, Buffer.from(png.split(",")[1], "base64"));
}
await browser.close();
console.log("ok");
