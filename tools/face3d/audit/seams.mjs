// seams.mjs GLB_URL [BASE] : vertices that share a position (a split seam) but whose morph deltas
// differ, so a key opens a crack there. Vite must be up.  node tools/face3d/audit/seams.mjs /faces/face-clay.glb http://127.0.0.1:5391
import { chromium } from "playwright";
const [glb = "/faces/face.glb", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 120000 });
console.log(JSON.stringify(await page.evaluate(async (glb) => (await import("/tools/face3d/audit/seamlib.js")).seams(glb), glb), null, 1));
await browser.close();
