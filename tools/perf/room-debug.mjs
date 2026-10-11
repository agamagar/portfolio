import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist","--enable-unsafe-webgpu"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
p.on("console", m => { if (["error","warning"].includes(m.type())) console.log("console", m.type(), m.text().slice(0,160)); });
p.on("pageerror", e => console.log("pageerror", String(e).slice(0,200)));
await p.goto("http://127.0.0.1:4312/", { waitUntil: "load" });
for (let i=0;i<14;i++){ await p.waitForTimeout(3000); console.log(i*3, await p.evaluate(()=>JSON.stringify({c:document.documentElement.className, d:{...document.documentElement.dataset}, y:scrollY}))); }
await b.close();
