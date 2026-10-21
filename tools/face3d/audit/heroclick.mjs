// heroclick.mjs OUT [BASE] : the REAL hero (HeroMorph) clicked through every head: after each click the 2D canvas at rest,
// the id the page reports (agam:face-skin), console errors, and (MID=1) a few frames during the first spin.
//   node tools/face3d/audit/heroclick.mjs OUT http://127.0.0.1:5173      CLICKS=12  THEME=light|dark
import { chromium } from "playwright";
import fs from "node:fs";
const [out = "heroclick-out", base = "http://127.0.0.1:5173"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|agentation|4747/i.test(m.text())) errs.push(m.text().slice(0, 200)); });
const theme = process.env.THEME || "light";
await page.goto(`${base}/?morph=on&theme=${theme}`, { timeout: 180000, waitUntil: "domcontentloaded" });
await page.evaluate((t) => { document.documentElement.classList.toggle("dark", t === "dark"); window.__skins = []; window.addEventListener("agam:face-skin", (e) => window.__skins.push(e.detail.id)); }, theme);
await page.waitForFunction(() => { const b = document.querySelector(".hero-morph__btn"); return b && !b.hidden; }, null, { timeout: 300000 });
await page.waitForTimeout(3000);
const grab = async (name) => { for (let k = 0; k < 20; k++) { const d = await page.evaluate(() => document.querySelector(".hero-morph__cv")?.toDataURL("image/png")); if (d) { fs.writeFileSync(`${out}/${name}.png`, Buffer.from(d.split(",")[1], "base64")); return; } await page.waitForTimeout(500); } errs.push("no canvas for " + name); };
await grab("00_start");
const n = +(process.env.CLICKS || 12);
for (let i = 1; i <= n; i++) {
  await page.evaluate(() => document.querySelector(".hero-morph__btn").click());
  if (i === 1 && process.env.MID) for (let k = 0; k < 8; k++) { await page.waitForTimeout(90); await grab(`mid_${k}`); }
  await page.waitForFunction((cnt) => window.__skins.length >= cnt && !document.querySelector(".hero-morph__btn").hasAttribute("aria-busy"), i, { timeout: 240000 }).catch(() => errs.push("timeout waiting for skin " + i));
  await page.waitForTimeout(1200);
  const id = await page.evaluate(() => window.__skins.at(-1));
  await grab(`${String(i).padStart(2, "0")}_${id}`);
  console.log(i, id);
}
console.log("errors:", errs.length ? errs.join(" | ") : "none");
await browser.close();
