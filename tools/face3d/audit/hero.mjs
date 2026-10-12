// The homepage hero's morph, headless: the clay hold and click-to-noir (and back), light and dark,
// cropped round the head. Software WebGL needs ?morph=on (HeroMorph keeps the drawing otherwise).
//   node tools/face3d/audit/hero.mjs OUT_DIR [BASE=http://127.0.0.1:5173]
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "hero-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const errs = [];
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|agentation|4747/i.test(m.text())) errs.push(`[${theme}] ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => errs.push(`[${theme}] pageerror ${e.message}`));
  await page.goto(`${base}/?morph=on&theme=${theme}`, { timeout: 120000, waitUntil: "domcontentloaded" });
  await page.evaluate((t) => { document.documentElement.classList.toggle("dark", t === "dark"); }, theme);
  // the morph plays once after the intro; wait for its button (shown on the hold)
  const ok = await page.waitForFunction(() => { const b = document.querySelector(".hero-morph__btn"); return b && !b.hidden; }, null, { timeout: 180000 }).then(() => true, () => false);
  await page.waitForTimeout(3000);
  const box = await page.evaluate(() => { const r = document.querySelector(".hero-morph")?.getBoundingClientRect(); return r && { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const clip = box && { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 40), width: box.w + 80, height: box.h + 80 };
  await page.screenshot({ path: `${out}/hero_${theme}_clay.png`, clip: clip || undefined });
  if (ok) {
    await page.click(".hero-morph__btn", { force: true });
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${out}/hero_${theme}_noir.png`, clip: clip || undefined });
    await page.click(".hero-morph__btn", { force: true });
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${out}/hero_${theme}_back.png`, clip: clip || undefined });
  }
  console.log(theme, ok ? "morph held, clicked" : "no morph button", JSON.stringify(box));
  await page.close();
}
fs.writeFileSync(`${out}/console.txt`, errs.join("\n") + "\n");
console.log("errors", errs.length);
await browser.close();
