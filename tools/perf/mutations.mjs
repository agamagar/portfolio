// which elements get attribute/style mutations during idle, per second
import { chromium } from "playwright";
const BASE = process.env.QA_URL || "http://localhost:5199";
const path = process.argv[2] || "/", scrollY = +(process.argv[3] || 0);
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(25000);
if (scrollY) { await p.evaluate((y) => scrollTo(0, y), scrollY); await p.waitForTimeout(3000); }
const r = await p.evaluate(() => new Promise((res) => {
  const c = {}; const d = (n) => (n.nodeType === 1 ? n.tagName.toLowerCase() + "." + String(n.className?.baseVal ?? n.className).split(" ").slice(0, 2).join(".") : "#text");
  const mo = new MutationObserver((l) => l.forEach((m) => { const k = d(m.target) + " [" + (m.attributeName || m.type) + "]"; c[k] = (c[k] || 0) + 1; }));
  mo.observe(document, { attributes: true, childList: true, subtree: true, characterData: true });
  setTimeout(() => { mo.disconnect(); res(Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${(v / 5).toFixed(0)}/s ${k}`)); }, 5000);
}));
console.log(r.join("\n"));
await browser.close();
