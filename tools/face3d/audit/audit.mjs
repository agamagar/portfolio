// Every skin in /faces, headless: rest, an emote held, turned three-quarters away (the far
// ear), from behind, in a page screenshot (plates and all). Console errors per skin.
//   node tools/face3d/audit/audit.mjs OUT_DIR [BASE=http://127.0.0.1:5173]   (SKINS=noir,felt: only those)
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "audit-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 1100 }, deviceScaleFactor: 1 });
const errs = [];
let cur = "load";
page.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !/agentation|4747|vite|React DevTools/i.test(m.text())) errs.push(`[${cur}] ${m.type()}: ${m.text().slice(0, 240)}`); });
page.on("pageerror", (e) => errs.push(`[${cur}] pageerror: ${e.message}`));
await page.goto(base + "/faces", { timeout: 120000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 120000 });
await page.waitForTimeout(4000);
let ids = await page.evaluate(async () => (await import("/src/figures/faces/faceSkins.js")).SKINS.map((s) => s.id)).catch(() => null);
if (process.env.SKINS) ids = process.env.SKINS.split(",");
const VIEWS = [["rest", null, 0, 0], ["grin", "grin", 0.4, 0], ["blink", "blink", 0.45, 0], ["turnL", null, 0, -1.0], ["turnR", null, 0, 1.1], ["back", null, 0, 3.14]];
const views = process.env.VIEWS ? VIEWS.filter((v) => process.env.VIEWS.split(",").includes(v[0])) : VIEWS;
for (const id of ids) {
  cur = id;
  await page.evaluate((id) => document.querySelector(".face-sv").__face.applySkin(id), id);
  await page.waitForTimeout(id === ids[0] ? 1500 : 6000); // a rig loads the first time it is worn
  for (const [v, emote, k, yaw] of views) {
    await page.evaluate(([e, k, yaw]) => { const f = document.querySelector(".face-sv").__face; f.pose(e, k); f.setView(yaw, 0); }, [emote, k, yaw]);
    await page.waitForTimeout(700);
    const png = await page.evaluate(() => document.querySelector(".face-sv").__face.snapshot());
    fs.writeFileSync(`${out}/${id}_${v}.png`, Buffer.from(png.split(",")[1], "base64"));
    if (v === "rest") await (await page.$(".face-sv")).screenshot({ path: `${out}/${id}_page.png` });
  }
  await page.evaluate(() => { const f = document.querySelector(".face-sv").__face; f.pose(null); f.setView(0, 0); });
}
fs.writeFileSync(`${out}/console.txt`, errs.join("\n") + "\n");
console.log("skins", ids.join(" "), "errors", errs.length);
await browser.close();
