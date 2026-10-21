// screenshots of /face-maker: node tools/face-maker-shots.mjs <outDir> (vite on QA_URL, default :5206)
import { chromium } from "playwright";
const base = process.env.QA_URL || "http://localhost:5206", out = process.argv[2] || ".";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const shot = async (page, name) => { await page.waitForTimeout(900); await page.screenshot({ path: `${out}/${name}.png` }); };
for (const [w, h, tag] of [[1440, 900, "1440"], [390, 844, "390"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: "light", deviceScaleFactor: 1 });
  const page = await ctx.newPage(); page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await page.goto(base + "/face-maker", { waitUntil: "load" });
  await page.waitForSelector(".fm__canvas"); await page.waitForSelector(".fm__loading", { state: "detached", timeout: 60000 });
  await shot(page, `facemaker-${tag}`);
  if (tag === "1440") {
    for (let i = 0; i < 3; i++) { await page.click("text=Randomize"); await page.waitForTimeout(1500); await shot(page, `random-${i}`); console.log("random", i, await page.textContent(".fm__score")); }
    // before / after a suggestion: an angry-reading face, then the first suggestion applied
    await page.goto(base + "/face-maker", { waitUntil: "load" });
    await page.waitForSelector(".fm__canvas"); await page.waitForSelector(".fm__loading", { state: "detached", timeout: 60000 });
    await page.evaluate(() => document.querySelectorAll("details.fm__group").forEach((d) => (d.open = true)));
    for (const [id, v] of [["fm-brows.angle", "0.7"], ["fm-eyes.openness", "-0.7"], ["fm-mouth.smile", "-0.2"]]) await page.locator(`[id="${id}"]`).fill(v);
    await shot(page, "suggest-before"); console.log("before", await page.textContent(".fm__score"), await page.locator(".fm__tip").first().innerText());
    await page.locator(".fm__tip").first().click(); await shot(page, "suggest-after"); console.log("after", await page.textContent(".fm__score"));
  }
  await ctx.close();
}
await browser.close();
