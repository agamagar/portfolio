// slices.mjs GLB MESH [BASE] : per-y x/z extent of one mesh
import { chromium } from "playwright";
const [glb, name, base = "http://127.0.0.1:5173"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 180000 });
const r = await page.evaluate(([g, n]) => import("/tools/face3d/audit/seamlib.js").then((m) => m.slices(g, n)), [glb, name]);
for (const [y, v] of Object.entries(r).sort((a, b) => b[0] - a[0])) console.log(y, JSON.stringify(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, +x.toFixed(2)]))));
await browser.close();
