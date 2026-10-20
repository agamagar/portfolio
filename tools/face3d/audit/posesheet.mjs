// posesheet.mjs OUT BASE ID 'name=json' ... : hand-made poses on the hero rig, e.g.
//   node posesheet.mjs out http://127.0.0.1:5391 clay 'pucker={"keys":{"mouthPucker":0.5}}'
import { chromium } from "playwright";
import fs from "node:fs";
const [out, base, id, ...specs] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto(base + "/faces", { timeout: 180000 });
await page.evaluate(() => import("/tools/face3d/audit/rigshot-lib.js").then((m) => (window.RS = m)));
await page.evaluate((id) => window.RS.load(id), id);
for (const s of specs) {
  const i = s.indexOf("="), name = s.slice(0, i), p = JSON.parse(s.slice(i + 1));
  const png = await page.evaluate(([id, p]) => window.RS.shotPose(id, p), [id, p]);
  fs.writeFileSync(`${out}/${id}_${name}.png`, Buffer.from(png.split(",")[1], "base64"));
}
await browser.close();
