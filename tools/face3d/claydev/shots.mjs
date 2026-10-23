// shots.mjs OUT [BASE] [PARAMS.json] : render the clay head (face-lab's ClayLab) at the turnaround's fitted views via window.__clay. Sequential.
//   VIEWS=1,2,7 (cell indices; poses from tools/face3d/asset/turn_fit.json: yaw/pitch of the fit, mapped to three.js)  N=96
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "clay-out", base = "http://127.0.0.1:5173", paramsFile] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const fit = JSON.parse(fs.readFileSync(new URL("../asset/turn_fit.json", import.meta.url)));
const views = (process.env.VIEWS || "1,2,7").split(",").map(Number);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
page.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 300)));
await page.goto(base + "/face-lab", { timeout: 180000, waitUntil: "domcontentloaded" });
await page.waitForFunction(() => window.__clay, null, { timeout: 240000 });
const over = paramsFile ? JSON.parse(fs.readFileSync(paramsFile, "utf8")) : {};
const meta = await page.evaluate(([o, n]) => window.__clay.set(o, n), [over, +(process.env.N || 96)]); console.log("built", JSON.stringify(meta));
for (const i of views) {
  // fit poses are Blender-frame (yaw about +Z, face toward -Y): three.js yaw is about +Y with the face toward +Z; both turn the face to the viewer's right for positive yaw
  const v = fit.views[i], d = await page.evaluate(([y, p]) => window.__clay.render(y, p), [v.yaw, -v.pitch]);
  fs.writeFileSync(`${out}/v_${String(i).padStart(2, "0")}.png`, Buffer.from(d.split(",")[1], "base64"));
}
await browser.close();
