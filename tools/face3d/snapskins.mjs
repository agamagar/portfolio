// one page load, every skin: node snapskins.mjs OUTDIR [poses...]
import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
import fs from "node:fs";
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const pose = process.argv[3] || "";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"], timeout: 180000 });
const page = await browser.newPage({ viewport: { width: 700, height: 760 } });
page.setDefaultTimeout(240000);
await page.goto("http://localhost:58710/faces", { timeout: 240000 });
await page.waitForFunction(() => document.querySelector(".face-sv")?.__face, null, { timeout: 240000 });
await page.waitForTimeout(8000); // the GLB
const ids = ["clay", "noir", "hose", "cel", "claySun", "pixel", "felt", "stone", "riso", "print"];
for (const id of ids) {
  const r = await page.evaluate(async ([id, pose]) => {
    const f = document.querySelector(".face-sv").__face;
    f.applySkin(id); f.pose(pose || 'blink', pose ? 0.3 : 0);
    await new Promise((r) => setTimeout(r, 300));
    return { png: f.snapshot(), bg: getComputedStyle(document.querySelector(".face-sv")).backgroundColor };
  }, [id, pose]);
  fs.writeFileSync(`${out}/${id}.png`, Buffer.from(r.png.split(",")[1], "base64"));
  fs.writeFileSync(`${out}/${id}.bg`, r.bg);
  console.log("ok", id, r.bg);
}
await browser.close();
