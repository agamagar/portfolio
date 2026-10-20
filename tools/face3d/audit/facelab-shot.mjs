// facelab-shot.mjs OUT [BASE] : the /face-lab first cell on the soft clay: 2D drawing, mid-morph, 3D at rest, and a grin.
//   SKIN=plast (default)  node tools/face3d/audit/facelab-shot.mjs OUT http://127.0.0.1:5173
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "facelab-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const skin = process.env.SKIN || "plast";
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror " + e.message));
page.on("console", (m) => { if (m.type() === "error" && !/agentation|4747|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await page.goto(base + "/face-lab", { timeout: 180000, waitUntil: "domcontentloaded" });
await page.waitForSelector(".fl-cell select", { timeout: 240000 });
await page.waitForSelector(".fl-stage canvas", { timeout: 180000 });
await page.waitForFunction(() => !document.querySelector(".fl-wait"), null, { timeout: 240000 });
const cell = page.locator(".fl-cell").first();
const pick = (n, v) => cell.locator("select").nth(n).evaluate((el, v) => { const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set; set.call(el, v); el.dispatchEvent(new Event("change", { bubbles: true })); }, v);
await pick(0, skin);
const setT = (t) => cell.locator('input[type="range"]').first().evaluate((el, t) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(el, t); el.dispatchEvent(new Event("input", { bubbles: true })); }, t);
const shot = async (name) => {
  await page.waitForTimeout(2500);
  // (the cell's own canvas: a page screenshot stalls behind software WebGL)
  const d = await cell.locator(".fl-stage canvas").evaluate((c) => c.toDataURL("image/png"));
  fs.writeFileSync(`${out}/${skin}_${name}.png`, Buffer.from(d.split(",")[1], "base64"));
};
for (const [name, t] of [["2d", 0], ["morph", 0.55], ["3d", 1]]) { await setT(t); await shot(name); }
await pick(1, "grin");
await shot("grin");
// the Features panel: pause the loop (a page screenshot stalls while WebGL redraws), then shoot the cell
await pick(1, "none");
await cell.getByRole("button", { name: "Pause" }).click().catch(() => {});
await page.waitForTimeout(1500);
await cell.screenshot({ path: `${out}/${skin}_panel.png`, timeout: 120000 }).catch((e) => console.log("panel shot failed", e.message.split("\n")[0]));
console.log("errors:", errs.length ? errs.join(" | ") : "none");
await browser.close();
