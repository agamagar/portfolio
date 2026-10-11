// node frames.mjs OUTDIR n  -> OUTDIR/f0000.png ... (t = i / (n - 1)), or a list: node frames.mjs OUTDIR "0,0.2,0.5"
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "fs";
const [out, spec] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const ts = spec.includes(",") ? spec.split(",").map(Number) : Array.from({ length: +spec }, (_, i) => i / (+spec - 1));
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.log("ERR", e.message));
p.on("console", (m) => { if (m.type() === "error") console.log("page:", m.text().slice(0, 300)); });
await p.goto("http://localhost:58731/");
await p.waitForFunction(() => window.morph, null, { timeout: 90000 });
let i = 0;
for (const t of ts) {
  const url = await p.evaluate((t) => { window.morph.render(t); return window.morph.MR.renderer.domElement.toDataURL("image/png"); }, t);
  fs.writeFileSync(`${out}/f${String(i++).padStart(4, "0")}.png`, Buffer.from(url.split(",")[1], "base64"));
}
await b.close();
