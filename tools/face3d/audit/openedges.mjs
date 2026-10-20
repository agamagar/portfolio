// openedges.mjs GLB MESH [BASE] : boundary edges of one mesh after welding (cracks, holes)
import { chromium } from "playwright";
const [glb, name, base = "http://127.0.0.1:5173"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.goto(base + "/faces", { timeout: 180000 });
console.log(JSON.stringify(await page.evaluate(([g, n]) => import("/tools/face3d/audit/seamlib.js").then((m) => m.openEdges(g, n)), [glb, name])));
await browser.close();
