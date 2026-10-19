import { chromium } from "playwright";
const BASE = process.env.QA_URL || "http://localhost:5199";
const path = process.argv[2] || "/";
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"] });
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(20000);
const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (const f of [0, 0.5, 1]) {
  await p.evaluate((y) => scrollTo(0, y), H * f); await p.waitForTimeout(4000);
  console.log("scroll", f, await p.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.paused).map((v) => { const r = v.getBoundingClientRect(); const on = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; return `${on ? "ON " : "OFF"} ${(v.currentSrc || v.src).split("/").pop()} ${Math.round(r.left)},${Math.round(r.top)} ${v.videoWidth}x${v.videoHeight} cls=${v.className} par=${v.parentElement?.className}`; })));
}
await browser.close();
