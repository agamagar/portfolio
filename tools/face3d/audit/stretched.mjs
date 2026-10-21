// stretched.mjs GLB MESH [THR=0.2] [BASE] : triangles whose UVs span more than THR of the texture
import { chromium } from "playwright";
const [glb, name, thr = "0.2", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 180000 });
console.log(JSON.stringify(await page.evaluate(([g, n, t]) => import("/tools/face3d/audit/seamlib.js").then((m) => m.stretched(g, n, +t)), [glb, name, thr])));
await browser.close();
