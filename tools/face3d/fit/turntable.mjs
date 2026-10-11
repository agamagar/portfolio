// turntable.mjs OUTDIR : the clay face from yaw 0..315 (every 45 deg) and pitch +-45, held still
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "node:fs";
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 980 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:58720/?skin=clay", { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face?.setView, null, { timeout: 240000 });
await page.waitForTimeout(8000);
const D = Math.PI / 180;
const views = [[0, 0], [45, 0], [90, 0], [135, 0], [180, 0], [225, 0], [270, 0], [315, 0], [0, 45], [0, -45]];
for (const [y, p] of views) {
  const png = await page.evaluate(async ([y, p]) => {
    const f = document.querySelector(".face-sv").__face;
    f.pose("blink", 0); f.setView(y, p);
    await new Promise((r) => setTimeout(r, 500));
    return f.snapshot();
  }, [y * D, p * D]);
  fs.writeFileSync(`${out}/y${y}_p${p}.png`, Buffer.from(png.split(",")[1], "base64"));
}
await browser.close();
console.log("ok");
