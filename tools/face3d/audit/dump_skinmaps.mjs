// dump_skinmaps.mjs OUTDIR [BASE] : each fitted skin's GLB skin map to OUTDIR/<skin>.png (input of make_clean_skin.py)
import { chromium } from "playwright";
import fs from "node:fs";
const [out, base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 180000 });
for (const s of ["hose", "cel", "claySun", "pixel", "felt", "stone", "riso", "noir"]) {
  const d = await page.evaluate((s) => import("/tools/face3d/audit/seamlib.js").then((m) => m.skinMapPng(`/faces/face-${s}.glb`)), s);
  fs.writeFileSync(`${out}/${s}.png`, Buffer.from(d.split(",")[1], "base64")); console.log(s);
}
await browser.close();
