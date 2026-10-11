// clip.mjs OUTDIR : ~9 s of live motion (sway + emotes), one snapshot every 40 ms
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "node:fs";
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 980 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:58720/?skin=clay", { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 240000 });
await page.waitForTimeout(8000);
const frames = await page.evaluate(async () => {
  const f = document.querySelector(".face-sv").__face;
  const plan = [[0, "lookAround"], [2300, "nod"], [3600, "grin"], [5000, "shy"], [6800, "blink"], [7400, "think"]];
  const shots = []; const t0 = performance.now(); let p = 0;
  while (performance.now() - t0 < 9200) {
    const t = performance.now() - t0;
    while (p < plan.length && t >= plan[p][0]) { f.emote(plan[p][1]); p++; }
    await new Promise((r) => requestAnimationFrame(r));
    shots.push(f.snapshot());
    await new Promise((r) => setTimeout(r, 25));
  }
  return shots;
});
frames.forEach((png, i) => fs.writeFileSync(`${out}/f${String(i).padStart(4, "0")}.png`, Buffer.from(png.split(",")[1], "base64")));
await browser.close();
console.log("frames", frames.length);
