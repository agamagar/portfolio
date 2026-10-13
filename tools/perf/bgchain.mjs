// Debug: ancestor chain (class, bg, border, padding) of the element containing some text. node bgchain.mjs <url> "<text>"
import { chromium } from "playwright-core";
const [url, text] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(3000);
const r = await p.evaluate((text) => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.includes(text)) break;
  const out = []; let e = n?.parentElement;
  for (let i = 0; e && i < 9; i++, e = e.parentElement) { const c = getComputedStyle(e); out.push(`${e.tagName}.${String(e.className).slice(0, 50)} bg=${c.backgroundColor} bd=${c.borderTopWidth} pad=${c.paddingTop} sh=${c.boxShadow !== "none"}`); }
  return out;
}, text);
console.log(r.join("\n")); await b.close();
