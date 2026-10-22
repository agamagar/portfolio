// cases.mjs OUT [BASE] : every face preset (features/presets) on the soft-clay rig: rest, grin and a turn, for the cases sheet.
//   PRESETS=a,b limits. Sequential, one page.
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "cases-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error" && !/agentation|4747/.test(m.text())) errs.push(m.text().slice(0, 300)); });
await page.goto(base + "/faces", { timeout: 180000 });
await page.evaluate(() => import("/tools/face3d/audit/rigshot-lib.js").then((m) => (window.RS = m)));
await page.evaluate(() => window.RS.load("plast"));
const names = process.env.PRESETS ? process.env.PRESETS.split(",") : await page.evaluate(() => Object.keys(window.RS.PRESETS));
for (const n of names) {
  await page.evaluate((n) => window.RS.useFace("plast", n), n);
  for (const [v, e, t, yaw] of [["rest", null, 0, 0], ["grin", "grin", 0.4, 0], ["turn", null, 0, 0.35]]) {
    const png = await page.evaluate(([e, t, yaw]) => window.RS.shot("plast", e, t, yaw, 0), [e, t, yaw]);
    fs.writeFileSync(`${out}/${n}_${v}.png`, Buffer.from(png.split(",")[1], "base64"));
  }
  console.log(n);
}
console.log("errors:", errs.length ? errs.join(" | ") : "none");
await browser.close();
