// Monitor preview sweep (mv845ves, "at certain widths the preview of the monitor breaks"):
// enter the room at each viewport size, wait for the landing, and save the monitor's region
// and the full frame. Usage (dev server on :5173, or QA_URL=...):
//   node tools/qa-monitor-sweep.mjs OUTDIR [WxH ...]     default: the full width sweep
//   --resize WxH   after landing, resize the window live and shoot again
//   GL=gpu         the machine's GPU (Metal on a Mac); SwiftShader (the default) needs
//                  minutes per size for the warm-up.  CONC=3  sizes in parallel
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.QA_URL || "http://localhost:5173";
const args = process.argv.slice(2);
const out = args.find((a) => !a.includes("x") && !a.startsWith("--")) || "monitor-sweep";
const ri = args.indexOf("--resize");
const resizeTo = ri >= 0 ? args[ri + 1].split("x").map(Number) : null;
let sizes = args.filter((a, i) => /^\d+x\d+$/.test(a) && i !== ri + 1).map((a) => a.split("x").map(Number));
if (!sizes.length) {
  const set = new Set();
  // below 721 px (sceneFlag.js MOBILE_QUERY) the page offers no room
  for (let w = 760; w <= 2560; w += 40) set.add(`${w}x900`);
  for (const w of [1280, 1366, 1440, 1536, 1680, 1920, 2560]) set.add(`${w}x${w >= 1920 ? 1080 : 900}`);
  for (const s of ["1280x720", "1440x1100", "1920x1200", "768x1024", "1024x1366"]) set.add(s);
  sizes = [...set].map((s) => s.split("x").map(Number));
}
fs.mkdirSync(out, { recursive: true });
// GL=gpu uses the machine's GPU (Metal on a Mac), far faster than SwiftShader for the warm-up
const GL = process.env.GL === "gpu" ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const browser = await chromium.launch({ args: GL });
const QUERY = process.env.QA_QUERY ?? "?backend=webgl2"; // headless WebGPU fails pipeline creation
const conc = +(process.env.CONC || 3);
const report = [];

async function shoot(p, tag) {
  // the monitor's screen where the camera rests now, and the poster texture as drawn
  const info = await p.evaluate(() => {
    const ws = window.__windowScene;
    const e = ws?.engine;
    const c = document.querySelector(".wscene__host canvas, canvas[data-p]");
    const pp = c ? +c.dataset.p : 0.5;
    const rect = e?.screenRectAt?.(pp, 0);
    const r1 = e?.screenRectAt?.(1, 0);
    return { p: pp, rect, r1, vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio };
  });
  const r = info.rect;
  if (r) {
    const xs = [r.tl[0], r.tr[0], r.br[0], r.bl[0]], ys = [r.tl[1], r.tr[1], r.br[1], r.bl[1]];
    const pad = 24;
    const x = Math.max(0, Math.min(...xs) - pad), y = Math.max(0, Math.min(...ys) - pad);
    const w = Math.min(info.vw, Math.max(...xs) + pad) - x, h = Math.min(info.vh, Math.max(...ys) + pad) - y;
    if (w > 4 && h > 4) await p.screenshot({ path: `${out}/${tag}-monitor.png`, clip: { x, y, width: w, height: h } });
  }
  await p.screenshot({ path: `${out}/${tag}-full.jpg`, type: "jpeg", quality: 70 });
  return info;
}

async function one([w, h]) {
  const tag = `${String(w).padStart(4, "0")}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  try {
    await p.goto(BASE + "/" + QUERY, { waitUntil: "domcontentloaded", timeout: 60000 });
    // the pill fades in a moment after load; a click on it while it warms queues the entry
    await p.waitForFunction(() => { const e = document.querySelector(".wscene-warm-pill"); return e && +getComputedStyle(e).opacity > 0.9; }, null, { timeout: 90000, polling: 250 });
    const state = await p.locator(".wscene-warm-pill").getAttribute("data-state");
    await p.locator(state === "ready" ? ".wscene-warm-pill__btn" : ".wscene-warm-pill").first().click({ timeout: 10000 });
    await p.waitForFunction(() => { const e = document.querySelector(".wscene-warm-pill"); return (!e || ["landing", "handoff"].includes(e.dataset.state)) && document.documentElement.dataset.wsceneLanded !== "true"; }, null, { timeout: 240000 });
    await p.waitForTimeout(4000);
    const info = await shoot(p, tag);
    let after = null;
    if (resizeTo) {
      await p.setViewportSize({ width: resizeTo[0], height: resizeTo[1] });
      await p.waitForTimeout(6000);
      after = await shoot(p, `${tag}-to-${resizeTo[0]}x${resizeTo[1]}`);
    }
    report.push({ tag, ok: true, info, after, errs });
    console.log(tag, "ok", info.p, JSON.stringify(info.rect && [Math.round(info.rect.tl[0]), Math.round(info.rect.tl[1]), Math.round(info.rect.br[0]), Math.round(info.rect.br[1])]));
  } catch (e) {
    report.push({ tag, ok: false, err: e.message.split("\n")[0], errs });
    console.log(tag, "FAIL", e.message.split("\n")[0]);
    await p.screenshot({ path: `${out}/${tag}-fail.jpg`, type: "jpeg", quality: 60 }).catch(() => {});
  }
  await ctx.close();
}
const queue = [...sizes];
await Promise.all(Array.from({ length: conc }, async () => { while (queue.length) await one(queue.shift()); }));
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
await browser.close();
