// uvmask.mjs GLB MESH W H OUT.png [BASE] : the mesh's UV coverage (for padding its textures: tools/face3d/audit/pad_tex.py)
import { chromium } from "playwright";
import fs from "node:fs";
const [glb, name, W, H, out, base = "http://127.0.0.1:5173"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 180000 });
const d = await page.evaluate(([g, n, W, H]) => import("/tools/face3d/audit/seamlib.js").then((m) => m.uvMask(g, n, +W, +H)), [glb, name, W, H]);
fs.writeFileSync(out, Buffer.from(d.split(",")[1], "base64"));
await browser.close();
