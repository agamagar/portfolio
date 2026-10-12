// Click-switch through every skin on /faces (the face's own next(), as a click does), twice
// round, then the auto-cycle: each switch's time, whether the fitted rig is drawing, errors.
//   node tools/face3d/audit/switch.mjs OUT_DIR [BASE=http://127.0.0.1:5173]
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "switch-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 760, height: 1100 } });
const errs = [];
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|agentation|4747/i.test(m.text())) errs.push(m.text().slice(0, 240)); });
page.on("pageerror", (e) => errs.push("pageerror " + e.message));
await page.goto(base + "/faces", { timeout: 120000, waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face?.state, null, { timeout: 120000 });
const st = () => page.evaluate(() => document.querySelector(".face-sv").__face.state());
const rows = [];
for (let lap = 0; lap < 2; lap++) {
  for (let i = 0; i < 10; i++) {
    const before = (await st()).skin, t0 = Date.now();
    await page.evaluate(() => document.querySelector(".face-sv").__face.next());
    // the switch: the spin, then an emote; it's done when the skin changed and the face is idle again
    await page.waitForFunction((b) => document.querySelector(".face-sv").__face.state().skin !== b, before, { timeout: 180000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const s = await st();
    rows.push({ lap, from: before, to: s.skin, fitted: s.fitOn, ms: Date.now() - t0 });
    console.log(JSON.stringify(rows.at(-1)));
    if (lap === 0) { const png = await page.evaluate(() => document.querySelector(".face-sv").__face.snapshot()); fs.writeFileSync(`${out}/sw_${s.skin}.png`, Buffer.from(png.split(",")[1], "base64")); }
  }
}
fs.writeFileSync(`${out}/switch.json`, JSON.stringify({ rows, errs }, null, 1));
console.log("errors", errs.length, errs.slice(0, 5));
await browser.close();
