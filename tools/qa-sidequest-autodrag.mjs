// Side Quests scroll-in demo drag (mv847jvw). node tools/qa-sidequest-autodrag.mjs  (dev server on :5173, or QA_URL=...)
// 1. Frame strips of the demo at 1440x900 and 390x844 -> tools/frames/sq-autodrag-<w>.png
// 2. A trace over the demo: fails on any main-thread task over 50 ms while it runs, and reports frame times
// 3. Cancel: a pointerdown mid-demo stops it at once, with no jump in the run's position, and the run
//    lands on the nearest card (not the demo's target two cards on)
// 4. Reduced motion: no demo at all
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.QA_URL || "http://localhost:5173";
// the hero's WebGL scene runs on SwiftShader in headless Chromium and starves the main thread for
// seconds at a time, which says nothing about this section; QA_PATH=/ measures with it on
const PATH = process.env.QA_PATH || "/?scene=off";
// Likewise the two fixed full-window WebGL backdrops (.tex-bg, .hello-sky): on SwiftShader they hold
// every frame of the whole page at ~400 ms, section or no section. They are hidden for the measurement
// (QA_BG=1 keeps them), so the frame times and long tasks below are the section's own.
const HIDE_BG = !process.env.QA_BG;
const OUT = new URL("./frames/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const fails = [];
const browser = await chromium.launch({ args: ["--ignore-gpu-blocklist"] });

// per-frame record of the run's shared position (the first card's animation progress) and demo state
const RECORDER = () => {
  window.__sq = [];
  const tick = (now) => {
    const pm = document.querySelector(".ap__run");
    const a = pm?.querySelector(".pm__item")?.getAnimations()[0];
    const p = a?.effect?.getComputedTiming().progress;
    const demo = pm?.dataset.demo || "";
    // stamp the demo's edges into the trace, so long tasks can be scoped to it
    if (demo !== window.__sqLast) { console.timeStamp?.("sq-demo:" + demo); window.__sqLast = demo; }
    if (pm) window.__sq.push({ t: now, p: typeof p === "number" ? p : null, demo });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

async function open(w, h, { reduce = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fails.push(`${w}: pageerror ${e.message}`));
  await p.addInitScript(RECORDER);
  if (HIDE_BG) await p.addInitScript(() => document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = ".tex-bg,.hello-sky{display:none!important}"; document.head.append(s); }));
  await p.goto(BASE + PATH, { waitUntil: "load" });
  await p.waitForSelector(".ap__run .pm__item", { timeout: 60000 });
  // let the carousel align and reach its first rest, off screen
  await p.waitForFunction(() => document.querySelector(".ap__run .pm__item[data-focus]"), null, { timeout: 30000 });
  await p.waitForTimeout(800);
  return { ctx, p };
}
// bring the run into view (centred), the way a scroll would
const scrollIn = (p) => p.evaluate(() => {
  const r = document.querySelector(".ap__run").getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: "instant" });
});
const focusIdx = (p) => p.evaluate(() => [...document.querySelectorAll(".ap__run .pm__item")].findIndex((e) => e.dataset.focus));
// largest single-frame step of the run, in cards (the phase gap between two cards)
const gap = (p) => p.evaluate(() => {
  const its = [...document.querySelectorAll(".ap__run .pm__item")].filter((e) => e.style.display !== "none");
  const ps = its.map((e) => e.getAnimations()[0]?.effect?.getComputedTiming().progress).filter((x) => typeof x === "number").sort((a, b) => a - b);
  let g = 1; for (let i = 1; i < ps.length; i++) g = Math.min(g, ps[i] - ps[i - 1]);
  return g;
});
const dp = (a, b) => { const d = (((b - a) % 1) + 1.5) % 1 - 0.5; return d; };

// ---- 1: strips (frames by screencast, so this pass's frame times are not the measurement; 3b is) ---------------------------------------------------------------
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const { ctx, p } = await open(w, h);
  const g = await gap(p);
  const f0 = await focusIdx(p);
  const cdp = await ctx.newCDPSession(p);
  await scrollIn(p);
  const box = await p.evaluate(() => { const r = document.querySelector(".ap").getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top), width: innerWidth, height: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) }; });
  const shots = [];
  const tStart = Date.now();
  // frames by screencast so the strip does not slow the demo it records
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 80, everyNthFrame: 1 });
  cdp.on("Page.screencastFrame", async (f) => { shots.push({ t: Date.now() - tStart, data: f.data }); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  await p.waitForFunction(() => document.querySelector(".ap__run")?.dataset.demo === "done", null, { timeout: 8000 }).catch(() => fails.push(`${w}: demo never finished (state ${"?"})`));
  const tDone = Date.now() - tStart;
  await p.waitForTimeout(700);
  await cdp.send("Page.stopScreencast");
  const rec = await p.evaluate(() => window.__sq);
  const run = rec.filter((r) => r.demo === "running");
  const dur = run.length ? run.at(-1).t - run[0].t : 0;
  const frames = run.slice(1).map((r, i) => r.t - run[i].t);
  const maxStep = Math.max(0, ...run.slice(1).map((r, i) => Math.abs(dp(run[i].p, r.p)) / g));
  // main-thread long tasks inside the demo's window (trace clock is microseconds, monotonic like rAF's ms)

  const f1 = await focusIdx(p);
  // the same section at rest after the demo, for comparison (its video is playing)
  const restF = await p.evaluate(() => new Promise((res) => { const a = []; let l = 0; const t = (n) => { if (l) a.push(n - l); l = n; if (a.length < 60) requestAnimationFrame(t); else res(a); }; requestAnimationFrame(t); }));
  // cards passed: upstream steps from the old focus to the new one (item i sits one card ahead of i - 1)
  const shown = await p.evaluate(() => [...document.querySelectorAll(".ap__run .pm__item")].filter((e) => e.style.display !== "none").length);
  const travelled = (((f0 - f1) % shown) + shown) % shown;
  const stat = (f) => { const s = [...f].sort((a, b) => a - b); return { n: f.length, p50: +(s[Math.floor(s.length * 0.5)] || 0).toFixed(1), p95: +(s[Math.floor(s.length * 0.95)] || 0).toFixed(1), max: +(s.at(-1) || 0).toFixed(1) }; };
  console.log(`${w}x${h}: demo ${dur.toFixed(0)} ms, travelled ${travelled} cards, focus ${f0} -> ${f1}, max step/frame ${maxStep.toFixed(3)} cards, frames ${JSON.stringify(stat(frames))}, at rest ${JSON.stringify(stat(restF))}`);
  if (dur < 1500 || dur > 2600) fails.push(`${w}: demo took ${dur.toFixed(0)} ms (want ~1.6-2.4 s)`);
  if (travelled !== 2) fails.push(`${w}: demo travelled ${travelled} cards (want 2)`);

  if (!shots.length) { fails.push(`${w}: no screencast frames`); await ctx.close(); continue; }
  // the strip: 8 frames across the demo, laid side by side, cropped to the section
  // from the demo's take-off (its measured length before it reported done) to just after the landing
  // (frames painted before the scroll landed show the hero, so the strip starts after them)
  const after = shots.filter((x) => x.t > 120);
  const t1 = Math.min(shots.at(-1).t, tDone + 300), t0 = Math.max(after[0]?.t ?? 0, tDone - dur - 50);
  const pick = Array.from({ length: 8 }, (_, i) => after.reduce((b, s) => (Math.abs(s.t - (t0 + ((t1 - t0) * i) / 7)) < Math.abs(b.t - (t0 + ((t1 - t0) * i) / 7)) ? s : b), after[0]));
  const png = await p.evaluate(async ({ pick, box, w }) => {
    const imgs = await Promise.all(pick.map((s) => createImageBitmap(new Blob([Uint8Array.from(atob(s.data), (c) => c.charCodeAt(0))], { type: "image/jpeg" }))));
    const k = imgs[0].width / innerWidth; // screencast may be scaled
    const sw = box.width * k, sh = box.height * k;
    const cols = w > 800 ? 2 : 4, rows = Math.ceil(imgs.length / cols);
    const cw = Math.round(w > 800 ? 900 : 300), ch = Math.round((cw * sh) / sw);
    const c = document.createElement("canvas"); c.width = cols * cw; c.height = rows * (ch + 24);
    const g = c.getContext("2d"); g.fillStyle = "#111"; g.fillRect(0, 0, c.width, c.height);
    imgs.forEach((im, i) => {
      const x = (i % cols) * cw, y = Math.floor(i / cols) * (ch + 24);
      g.drawImage(im, box.x * k, box.y * k, sw, sh, x, y + 24, cw, ch);
      g.fillStyle = "#fff"; g.font = "14px monospace"; g.fillText(`${(pick[i].t - pick[0].t).toFixed(0)} ms`, x + 8, y + 17);
    });
    return c.toDataURL("image/png").split(",")[1];
  }, { pick: pick.map((s) => ({ t: s.t, data: s.data })), box, w });
  writeFileSync(`${OUT}sq-autodrag-${w}.png`, Buffer.from(png, "base64"));
  console.log(`  strip: tools/frames/sq-autodrag-${w}.png (${shots.length} frames captured)`);
  await ctx.close();
}

// ---- 3: a pointerdown mid-demo cancels it --------------------------------------------------------
// Pressed on the run in the fast middle and held still: the demo must stop on that press (state
// "cancelled"), with no frame stepping more than 0.15 of a card at 60 Hz (no jump), and the
// run must glide to the nearest card on the drag's snap. The press then turns into a short drag and is
// released (a plain click on a card opens its poster, which is a different test).
{
  const { ctx, p } = await open(1440, 900);
  await scrollIn(p);
  await p.waitForFunction(() => document.querySelector(".ap__run")?.dataset.demo === "running", null, { timeout: 8000 });
  await p.waitForTimeout(700); // into the fast middle
  const r = await p.evaluate(() => { const b = document.querySelector(".ap__run").getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await p.mouse.move(r.x, r.y);
  const tDown = await p.evaluate(() => performance.now());
  await p.mouse.down();
  const state = await p.evaluate(() => document.querySelector(".ap__run").dataset.demo);
  await p.waitForTimeout(900); // held still: the snap glide lands
  const heldFocus = await focusIdx(p);
  await p.mouse.move(r.x - 40, r.y, { steps: 6 }); // now a drag
  await p.mouse.up();
  await p.waitForTimeout(1200);
  const g = await gap(p);
  const rec = await p.evaluate(() => window.__sq);
  // speed, in cards per 60 Hz frame, so one slow frame at the press does not read as a jump
  const steps = (xs) => xs.slice(1).map((x, i) => (Math.abs(dp(xs[i].p, x.p)) / g) * (16.7 / Math.max(1, x.t - xs[i].t)));
  const before = rec.filter((x) => x.t < tDown && x.demo === "running");
  const around = rec.filter((x) => x.t > tDown - 100 && x.t < tDown + 400);
  const fastest = Math.max(0, ...steps(before)), jump = Math.max(0, ...steps(around));
  const f1 = await focusIdx(p);
  await p.waitForTimeout(2500);
  const again = (await p.evaluate(() => window.__sq)).filter((x) => x.t > tDown + 300 && x.demo === "running").length;
  const poster = await p.locator(".ap-poster, [class*=poster][role=dialog]").count();
  console.log(`cancel: state on pointerdown "${state}", focus while held ${heldFocus}, after drag ${f1}, demo's fastest frame ${fastest.toFixed(3)} cards, largest frame around the press ${jump.toFixed(3)} cards, demo frames after cancel ${again}`);
  if (state !== "cancelled") fails.push(`cancel: state after pointerdown was "${state}"`);
  // a jump would be a skip to another card (0.5+ in one frame); the snap glide that takes over may
  // start a little faster than the demo was moving (it covers up to half a card in 520 ms), so the
  // bar is an absolute one, well under a skip and well over either motion
  if (jump > 0.15) fails.push(`cancel: the run jumped ${jump.toFixed(3)} cards in one frame (demo's fastest ${fastest.toFixed(3)})`);
  if (heldFocus < 0) fails.push("cancel: the run did not settle on a card under the held press");
  if (f1 < 0) fails.push("cancel: the run did not settle on a card after the drag");
  if (again) fails.push("cancel: the demo restarted");
  if (poster) fails.push("cancel: a poster opened");
  await ctx.close();
}

// ---- 2: frame pacing and a trace with no screencast: long tasks inside the demo (fails on any over
// 50 ms), and the demo's frame times against an ordinary carousel hop on the same page, which is the
// motion the run already makes every few seconds
for (const [w, h] of [[1440, 900], [390, 844]]) {
  {
  const { ctx, p } = await open(w, h);
  await browser.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline"] });
  await scrollIn(p);
  await p.waitForFunction(() => document.querySelector(".ap__run")?.dataset.demo === "done", null, { timeout: 8000 });
  await p.waitForTimeout(100);
  const ev = JSON.parse((await browser.stopTracing()).toString()).traceEvents;
  const stamp = (n) => ev.find((e) => e.name === "TimeStamp" && e.args?.data?.message === n)?.ts;
  const a0 = stamp("sq-demo:running"), a1 = stamp("sq-demo:done");
  const inDemo = (e) => a0 && a1 && e.ts + e.dur > a0 && e.ts < a1;
  const tasks = ev.filter((e) => e.ph === "X" && e.name === "RunTask" && inDemo(e));
  const longs = tasks.filter((e) => e.dur > 50000);
  // what a long task was made of, if there is one
  for (const t of longs) {
    const kids = ev.filter((e) => e.ph === "X" && e.tid === t.tid && e.pid === t.pid && e !== t && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e.dur > 5000 && !/RunTask/.test(e.name));
    console.log(`  long task ${(t.dur / 1000).toFixed(1)} ms: ` + kids.map((e) => `${e.name}${e.args?.data?.functionName ? ":" + e.args.data.functionName : ""} ${(e.dur / 1000).toFixed(0)}`).slice(0, 6).join(", "));
  }
  if (!a0 || !a1) fails.push(`${w}: demo edges not found in the trace`);
  console.log(`trace ${w}: ${tasks.length} tasks in the demo, longest ${(Math.max(0, ...tasks.map((e) => e.dur)) / 1000).toFixed(1)} ms, over 50 ms: ${longs.length}`);
  if (longs.length) fails.push(`trace ${w}: ${longs.length} long task(s) during the demo`);
  await ctx.close();
  }
  // a fresh, untraced page for the frame times
  const { ctx, p } = await open(w, h);
  await scrollIn(p);
  await p.waitForFunction(() => document.querySelector(".ap__run")?.dataset.demo === "done", null, { timeout: 8000 });
  // the next hop: focus leaves (travel) and comes back (rest); a video card rests for its own length
  await p.waitForFunction(() => !document.querySelector(".ap__run .pm__item[data-focus]"), null, { timeout: 60000, polling: 16 }).catch(() => {});
  await p.waitForFunction(() => document.querySelector(".ap__run .pm__item[data-focus]"), null, { timeout: 8000, polling: 100 }).catch(() => {});
  const rec = await p.evaluate(() => window.__sq);
  const demo = rec.filter((r) => r.demo === "running");
  const fr = (xs) => xs.slice(1).map((r, i) => r.t - xs[i].t);
  // hop frames: those after the demo where the position moved
  const after = rec.filter((r) => r.t > demo.at(-1).t + 300);
  const hop = after.filter((r, i) => i && Math.abs(dp(after[i - 1].p, r.p)) > 1e-5);
  const st = (f) => { const s = [...f].sort((a, b) => a - b); return { n: f.length, p50: +(s[Math.floor(s.length / 2)] || 0).toFixed(1), p95: +(s[Math.floor(s.length * 0.95)] || 0).toFixed(1), over20: f.filter((x) => x > 20).length }; };
  const d = st(fr(demo)), hp = st(fr(hop));
  console.log(`pacing ${w}: demo ${JSON.stringify(d)}, carousel hop ${JSON.stringify(hp)}`);
  if (hp.n > 10 && d.p50 > hp.p50 + 1) fails.push(`pacing ${w}: demo frames slower than a hop (${d.p50} vs ${hp.p50} ms)`);
  await ctx.close();
}

// ---- 4: reduced motion: nothing ------------------------------------------------------------------
{
  const { ctx, p } = await open(1440, 900, { reduce: true }).catch(async () => {
    // under reduce the carousel never rests (no data-focus), so open without waiting for it
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(BASE + PATH, { waitUntil: "load" });
    await p.waitForSelector(".ap__run .pm__item", { timeout: 60000 });
    return { ctx, p };
  });
  await scrollIn(p);
  await p.waitForTimeout(2500);
  const st = await p.evaluate(() => document.querySelector(".ap__run").dataset.demo || "none");
  console.log(`reduced motion: demo state ${st}`);
  if (st !== "none") fails.push(`reduced motion: demo ran (${st})`);
  await ctx.close();
}

await browser.close();
if (fails.length) { console.log("FAIL\n" + fails.join("\n")); process.exit(1); }
console.log("PASS");
