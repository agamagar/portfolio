// bboxes.mjs GLB [BASE] : each mesh's bounding box in the GLB's own space
import { chromium } from "playwright";
const [glb, base = "http://127.0.0.1:5173"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 180000 });
console.log(JSON.stringify(await page.evaluate((g) => import("/tools/face3d/audit/seamlib.js").then((m) => m.bboxes(g)), glb), null, 0));
await browser.close();
