// Mid-sweep frames at 1440x900, light + dark: node tools/qa-sweep-frames.mjs URL OUTDIR
import { chromium } from "playwright";
import fs from "fs";
const [URL, OUT] = [process.argv[2], process.argv[3]]; fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chromium", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const scheme of ["light", "dark"]) {
  const tod = scheme === "light" ? 12 : 22;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  // slow motion after stage->reveal (performance.now x0.06) so a screenshot lands mid-sweep
  await p.addInitScript((TH) => {
    window.__t = 0; window.addEventListener("heromorph:t", (e) => (window.__t = e.detail));
    try { localStorage.setItem("theme-manual", JSON.stringify({ theme: TH, at: Date.now(), clock: TH })); } catch {}
    const st = window.setTimeout.bind(window); let slow = false;
    window.setTimeout = (f, ms, ...a) => st(f, slow && ms >= 3000 ? ms / 0.06 : ms, ...a); // long safety timers follow the slow clock
    const real = performance.now.bind(performance); let on = false, b0 = 0, v0 = 0;
    performance.now = () => (on ? v0 + (real() - b0) * 0.06 : real());
    new MutationObserver(() => { if (!on && document.querySelector('[data-stage="reveal"]')) { slow = true; v0 = real(); b0 = v0; on = true; } }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-stage"] });
  }, scheme);
  await p.goto(URL + "?tod=" + tod, { waitUntil: "domcontentloaded" });
  for (const at of (process.env.AT || "0.2,0.35,0.5,0.65").split(",").map(Number)) {
    await p.waitForFunction((a) => window.__t >= a, at, { timeout: 90000, polling: 8 });
    if (process.env.DBG) console.log(scheme, at, await p.evaluate(() => ({ t: window.__t, a: [...document.querySelector(".hello").getAttributeNames()].join(" "), fr: (window.__fr || []).slice(-1)[0] })));
    await p.screenshot({ path: `${OUT}/${scheme}-${at}.png` });
  }
  await ctx.close();
}
await browser.close();
