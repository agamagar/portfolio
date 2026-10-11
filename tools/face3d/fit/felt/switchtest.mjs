// clay -> felt -> noir -> felt -> clay through setSkin (the hop), page screenshots after each:
// each rig swaps in with its own camera and plates, nothing errors
//   node switchtest.mjs [PORT] [OUTDIR]
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
const [port = "58741", dir = "."] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 560, height: 620 } });
const errs = [];
page.on("requestfailed", (r) => errs.push("requestfailed " + r.url() + " " + r.failure()?.errorText));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
page.on("pageerror", (e) => errs.push(String(e)));
await page.goto(`http://localhost:${port}/?skin=clay`);
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 120000 });
await page.waitForTimeout(6000);
for (const [i, s] of ["felt", "noir", "felt", "clay"].entries()) {
  await page.evaluate((s) => document.querySelector(".face-sv").__face.switchSkin(s), s);
  await page.waitForTimeout(i < 2 ? 9000 : 4000);
  const st = await page.evaluate(() => { const el = document.querySelector(".face-sv"); return { bg: el.style.background.slice(0, 50), front: el.querySelector("img").style.display, rain: el.querySelectorAll("div")[0]?.style.display }; });
  console.log(s, JSON.stringify(st));
  await page.screenshot({ path: `${dir}/sw${i}_${s}.png` });
}
console.log("errors", errs.length, errs.slice(0, 3));
await browser.close();
