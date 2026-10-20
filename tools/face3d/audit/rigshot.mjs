// rigshot.mjs OUT [BASE] : the HERO's rig (faceRig3D, clay and noir) for every emote at its peak, plus
// the viewer turned a little each way. Sequential, one page.  RIGS=clay,noir  EMOTES=a,b
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "rigshot-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror", e.message));
page.on("console", (m) => { if (m.type() === "error" && !/agentation|4747/.test(m.text())) console.log("console", m.text().slice(0, 200)); });
await page.goto(base + "/faces", { timeout: 180000 });
await page.evaluate(() => import("/tools/face3d/audit/rigshot-lib.js").then((m) => (window.RS = m)));
const rigs = (process.env.RIGS || "clay,noir").split(",");
const names = process.env.EMOTES ? process.env.EMOTES.split(",") : await page.evaluate(() => window.RS.names);
const peak = await page.evaluate(() => window.RS.peak);
for (const id of rigs) {
  await page.evaluate((id) => window.RS.load(id), id);
  const views = [["rest", null, 0, 0, 0], ["turnL", null, 0, -0.3, 0], ["turnR", null, 0, 0.3, 0], ...names.map((n) => [n, n, peak[n], 0, 0])];
  for (const [v, e, t, yaw, pitch] of views) {
    const png = await page.evaluate(([id, e, t, yaw, pitch]) => window.RS.shot(id, e, t, yaw, pitch), [id, e, t, yaw, pitch]);
    fs.writeFileSync(`${out}/${id}_${v}.png`, Buffer.from(png.split(",")[1], "base64"));
  }
}
console.log("done");
await browser.close();
