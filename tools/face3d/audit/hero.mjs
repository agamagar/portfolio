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
  // the hero's own 2D canvas (a page screenshot stalls behind software WebGL), and the colour
  // behind it, to judge its edges on that ground
  const grab = async (name) => {
    const r = await page.evaluate(() => {
      const cv = document.querySelector(".hero-morph__cv");
      let el = cv, bg = "rgba(0, 0, 0, 0)";
      while (el && /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { bg = getComputedStyle(el).backgroundColor; el = el.parentElement; }
      return { png: cv ? cv.toDataURL("image/png") : null, bg };
    });
    if (r.png) fs.writeFileSync(`${out}/hero_${theme}_${name}.png`, Buffer.from(r.png.split(",")[1], "base64"));
    fs.writeFileSync(`${out}/hero_${theme}_${name}.bg`, r.bg);
  };
  await grab("clay");
  if (ok) {
    await page.click(".hero-morph__btn", { force: true });
    await page.waitForTimeout(9000);
    await grab("noir");
    await page.click(".hero-morph__btn", { force: true });
    await page.waitForTimeout(9000);
    await grab("back");
  }
  console.log(theme, ok ? "morph held, clicked" : "no morph button", JSON.stringify(box));
  await page.close();
}
fs.writeFileSync(`${out}/console.txt`, errs.join("\n") + "\n");
console.log("errors", errs.length);
await browser.close();
