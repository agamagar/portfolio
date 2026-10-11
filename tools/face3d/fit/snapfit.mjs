// the clay skin at the reference's pixel size (802 x 862), neutral pose -> PNG
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 980 }, deviceScaleFactor: 2 });
page.on("console", (m) => { if (m.type() === "error" && !/4747|Agentation|CORS|Failed to load resource/.test(m.text())) console.log("console:", m.text()); });
await page.goto("http://localhost:58720/?skin=clay", { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 240000 });
await page.waitForTimeout(9000);
const png = await page.evaluate(async () => {
  const f = document.querySelector(".face-sv").__face;
  f.applySkin("clay"); f.pose("blink", 0);
  await new Promise((r) => setTimeout(r, 600));
  return f.snapshot();
});
const fs = await import("node:fs");
fs.writeFileSync(out, Buffer.from(png.split(",")[1], "base64"));
await browser.close();
console.log("ok", out);
