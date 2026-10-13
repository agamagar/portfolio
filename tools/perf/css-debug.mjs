import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome" });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion:"reduce" })).newPage();
p.on("requestfailed", r=>console.log("FAILED", r.url()));
p.on("console", m=>{ if(m.type()==="error") console.log("err", m.text().slice(0,200))});
await p.goto("http://127.0.0.1:4310/work/dassh", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>({sheets:[...document.styleSheets].map(s=>s.href||'inline').length, links:[...document.querySelectorAll('link[rel=stylesheet],link[rel=modulepreload]')].map(l=>l.href.split('/').pop()), win:!!document.querySelector('.ds-win'), c: getComputedStyle(document.querySelector('.ds-win')||document.body).borderRadius})));
await b.close();
