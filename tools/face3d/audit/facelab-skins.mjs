// facelab-skins.mjs OUT [BASE] : every skin the hero's renderer can wear (MR.listSkins), 3D at rest, through /face-lab's first
// cell (which calls MR.loadSkin lazily, as the click-cycle will). Console errors reported.
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "skins-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 200)));
page.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !/agentation|4747|Failed to load resource|GPU stall|swiftshader/i.test(m.text())) errs.push(m.type() + " " + m.text().slice(0, 200)); });
await page.goto(base + "/face-lab", { timeout: 180000, waitUntil: "domcontentloaded" });
await page.waitForSelector(".fl-cell select", { timeout: 240000 });
await page.waitForSelector(".fl-stage canvas", { timeout: 180000 });
await page.waitForFunction(() => !document.querySelector(".fl-wait"), null, { timeout: 240000 });
// (plain DOM calls in the page: no locator waits)
const dom = (fn, arg) => page.evaluate(fn, arg);
const pick = (n, v) => dom(([n, v]) => { const el = document.querySelector(".fl-cell").querySelectorAll("select")[n]; const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set; set.call(el, v); el.dispatchEvent(new Event("change", { bubbles: true })); }, [n, v]);
const ids = await dom(() => [...document.querySelector(".fl-cell select").options].map((o) => o.value));
await pick(1, "none");
await dom(() => { const el = document.querySelector(".fl-cell input[type=range]"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(el, 1); el.dispatchEvent(new Event("input", { bubbles: true })); });
for (const id of (process.env.SKINS ? process.env.SKINS.split(",") : ids)) {
  await pick(0, id);
  await page.waitForTimeout(id === ids[0] ? 3000 : +(process.env.WAIT || 14000)); // a rig streams in the first time it is worn
  const d = await dom(() => document.querySelector(".fl-cell .fl-stage canvas").toDataURL("image/png"));
  fs.writeFileSync(`${out}/${id}.png`, Buffer.from(d.split(",")[1], "base64"));
}
console.log("skins", ids.join(" "), "| errors:", errs.length ? errs.join(" | ") : "none");
await browser.close();
