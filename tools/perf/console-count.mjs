import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist"] });
const p = await (await b.newContext()).newPage(); let w = 0, e = 0, first = "";
p.on("console", (m) => { if (m.type() === "warning") { w++; first ||= m.text(); } if (m.type() === "error") e++; });
await p.goto(process.argv[2], { waitUntil: "load" }); await p.waitForTimeout(8000);
console.log("warnings", w, "errors", e); console.log(first.slice(0, 600)); await b.close();
