import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "fs";
const jobs = JSON.parse(process.argv[2]);
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.log("ERR", e.message));
await p.goto("http://localhost:58731/?r");
await p.waitForFunction(() => window.MR, null, { timeout: 60000 });
for (const [out, pose, u, seedU] of jobs) {
  const url = await p.evaluate(([pose, u, seedU]) => { for (const m of window.MR.seeds) for (const k in seedU || {}) m.uniforms[k].value = seedU[k]; window.MR.frame(pose, u); return window.MR.renderer.domElement.toDataURL("image/png"); }, [pose, u, seedU]);
  fs.writeFileSync(out, Buffer.from(url.split(",")[1], "base64"));
}
await b.close();
