// Save the live favicon at a few moments: node favicon-grab.mjs <url> <outprefix>
import { chromium } from "playwright-core";
import fs from "node:fs";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: !process.env.HEADED, args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
for (let i = 0; i < 3; i++) {
  const data = await p.evaluate(async () => { const h = document.querySelector('link[rel="icon"]').href; const bl = await (await fetch(h)).blob(); const buf = new Uint8Array(await bl.arrayBuffer()); let s = ""; buf.forEach((c) => (s += String.fromCharCode(c))); return btoa(s) + "|" + h.slice(0, 20); });
  fs.writeFileSync(`${out}-${i}.png`, Buffer.from(data.split("|")[0], "base64")); console.log(i, data.split("|")[1]);
  await p.waitForTimeout(2300);
}
await b.close();
