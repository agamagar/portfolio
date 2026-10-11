// the felt skin at the site canvas size (802 x 862), held pose -> PNG (canvas only: the
// backdrop plate is composited by feltdiff.py the way the page layers it)
//   node snapfelt.mjs OUT.png [PORT] [SKIN] [POSE] [K]
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
const [out, port = "58741", skin = "felt", pose = "blink", k = "0"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 980 }, deviceScaleFactor: 2 });
page.on("console", (m) => { if (m.type() === "error" && !/4747|Agentation|CORS|Failed to load resource/.test(m.text())) console.log("console:", m.text()); });
await page.goto(`http://localhost:${port}/?skin=${skin}`, { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 240000 });
await page.waitForTimeout(9000);
const png = await page.evaluate(async ([skin, pose, k]) => {
  const f = document.querySelector(".face-sv").__face;
  f.applySkin(skin); f.pose(pose, Number(k));
  await new Promise((r) => setTimeout(r, 900));
  return f.snapshot();
}, [skin, pose, k]);
const fs = await import("node:fs");
fs.writeFileSync(out, Buffer.from(png.split(",")[1], "base64"));
await page.screenshot({ path: out.replace(".png", "_page.png") });
await browser.close();
console.log("ok", out);
