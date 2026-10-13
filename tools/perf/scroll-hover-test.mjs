// Headless check of the scroll hover guard. node scroll-hover-test.mjs <url>
import { chromium } from "playwright-core";
const url = process.argv[2];
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(4000);
await p.evaluate(() => { window.__over = 0; window.addEventListener("pointerover", () => window.__over++, false); window.__clicks = 0; document.addEventListener("click", () => window.__clicks++, true); });
await p.mouse.move(700, 500);
const cls = () => p.evaluate(() => document.documentElement.classList.contains("is-scrolling"));
console.log("idle:", await cls());
let seen = false;
await p.evaluate(() => (window.__over = 0));
for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 140); await p.waitForTimeout(30); if (await cls()) seen = true; }
console.log("class set while scrolling:", seen, "| pointerover seen by page handlers during scroll:", await p.evaluate(() => window.__over));
await p.waitForTimeout(900);
console.log("class cleared after stop:", !(await cls()));
await p.evaluate(() => (window.__clicks = 0));
await p.mouse.click(700, 500);
console.log("click right after scroll delivered:", await p.evaluate(() => window.__clicks));
await b.close();
