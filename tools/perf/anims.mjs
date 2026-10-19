import { chromium } from "playwright";
const BASE = process.env.QA_URL || "http://localhost:5199";
const path = process.argv[2] || "/", scrollY = +(process.argv[3] || 0);
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(25000);
if (scrollY) { await p.evaluate((y) => scrollTo(0, y), scrollY); await p.waitForTimeout(3000); }
const r = await p.evaluate(() => {
  const c = {};
  document.getAnimations().forEach((a) => {
    const t = a.effect?.target; const n = a.animationName || a.id || a.constructor.name;
    const props = a.effect?.getKeyframes?.().flatMap((k) => Object.keys(k)).filter((k) => !["offset", "easing", "composite", "computedOffset"].includes(k));
    const r = t?.getBoundingClientRect?.(); const vis = r && r.bottom > 0 && r.top < innerHeight;
    const k = `${n} <${t?.tagName?.toLowerCase()}.${String(t?.className?.baseVal ?? t?.className).split(" ")[0]}> [${[...new Set(props)].join(",")}] ${a.playState} ${vis ? "ONSCREEN" : "off"}`;
    c[k] = (c[k] || 0) + 1;
  });
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => v + "x " + k);
});
console.log(r.join("\n"));
await browser.close();
