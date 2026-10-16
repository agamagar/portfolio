// Side-quests auto-drag gate (mv847jvw). Dev server on :5173, or QA_URL=...
//   node tools/qa-sidequest-autodrag.mjs [outDir]
// For 1440x900 and 390x844:
//   1. plays: scrolled to the run, the demo starts (data-demo="running"), travels and
//      lands (data-demo="done") on a resting card, in 1.6-2.4 s, with no long task and
//      no frame gap over 50 ms while it moves. Position is sampled every frame.
//   2. cancels: a real pointerdown mid-demo stops it at once (data-demo="cancelled")
//      and the card nearest the centre does not jump on the press.
//   3. reduced motion: no demo at all.
//   4. a video of the demo (recordVideo) for the frame strip (outDir/<w>x<h>.webm).
// Exits 1 on any failure.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.QA_URL || "http://localhost:5173";
const OUT = process.argv[2] || "qa-out/sidequest-autodrag";
mkdirSync(OUT, { recursive: true });
const VIEWS = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const fails = [];
// a real GPU: without it headless Chromium software-renders the room's WebGL and
// every frame on the page is a long task, demo or not
const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
// The room scene builds its geometry and shaders in the background for ~20 s after
// load (three.js node builder, far trees, bamboo: 100-700 ms tasks, measured). The
// timing check waits for that to finish so it measures the demo, not the room.
const SETTLE = +(process.env.QA_SETTLE || 30000);

async function open(view, opts = {}) {
  const ctx = await browser.newContext({ viewport: view, hasTouch: view.width < 500, isMobile: view.width < 500, reducedMotion: opts.reduce ? "reduce" : "no-preference", ...(opts.video ? { recordVideo: { dir: OUT, size: view } } : {}) });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fails.push(`${view.width}: pageerror ${e.message}`));
  // instrument before any page script: long tasks and a per-frame sampler
  await p.addInitScript(() => {
    window.__lt = [];
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push({ t: e.startTime, d: e.duration }))).observe({ type: "longtask", buffered: true }); } catch { /* none */ }
  });
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForSelector(".ap__run.pm .pm__item", { timeout: 60000 });
  // park just above the run, so it is not in view yet, and let the page settle
  await p.evaluate(() => { const r = document.querySelector(".ap__run.pm").getBoundingClientRect(); scrollBy(0, r.top - innerHeight - 200); });
  await p.waitForTimeout(opts.settle || 2500);
  return { ctx, p };
}

// one frame sample: the progress of every item and the screen centre of the one nearest the middle
const SAMPLER = () => {
  window.__fr = [];
  const run = document.querySelector(".ap__run.pm");
  const tick = (now) => {
    const items = [...run.querySelectorAll(".pm__item")].filter((el) => el.style.display !== "none");
    const mid = document.documentElement.clientWidth / 2;
    let near = Infinity;
    for (const el of items) { const r = el.getBoundingClientRect(); if (r.width) near = Math.min(near, Math.abs(r.left + r.width / 2 - mid)); }
    const pr = items[0]?.getAnimations()[0]?.effect?.getComputedTiming().progress;
    window.__fr.push({ t: now, demo: run.dataset.demo || "", p: pr, near });
    if (window.__fr.length < 2000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const scrollIn = (p) => p.evaluate(() => document.querySelector(".ap__run.pm").scrollIntoView({ block: "center" }));

for (const view of VIEWS) {
  const tag = `${view.width}x${view.height}`;

  // 1. plays, with timing and smoothness
  {
    const { ctx, p } = await open(view, { settle: SETTLE });
    await p.evaluate(SAMPLER);
    await scrollIn(p);
    const started = await p.waitForFunction(() => document.querySelector(".ap__run.pm").dataset.demo === "running", null, { timeout: 8000 }).then(() => true, () => false);
    if (!started) fails.push(`${tag}: demo never started`);
    else {
      const ended = await p.waitForFunction(() => document.querySelector(".ap__run.pm").dataset.demo !== "running", null, { timeout: 6000 }).then(() => true, () => false);
      if (!ended) fails.push(`${tag}: demo never ended`);
      await p.waitForTimeout(300);
      const r = await p.evaluate(() => {
        const fr = window.__fr.filter((f) => f.demo === "running");
        const t0 = fr[0]?.t, t1 = fr[fr.length - 1]?.t;
        let gap = 0;
        for (let i = 1; i < fr.length; i++) gap = Math.max(gap, fr[i].t - fr[i - 1].t);
        // speed profile: progress moved per frame, unwrapped
        const v = [];
        for (let i = 1; i < fr.length; i++) { let d = fr[i].p - fr[i - 1].p; if (d < -0.5) d += 1; if (d > 0.5) d -= 1; v.push({ t: fr[i].t - t0, d: Math.abs(d) / Math.max(1, fr[i].t - fr[i - 1].t) }); }
        const peak = v.reduce((a, b) => (b.d > a.d ? b : a), { d: 0, t: 0 });
        const lt = window.__lt.filter((e) => e.t + e.d > t0 && e.t < t1);
        const after = window.__fr[window.__fr.length - 1];
        return { ms: t1 - t0, frames: fr.length, gap, peakAt: peak.t, firstV: v.slice(0, 5).map((x) => x.d), lt, state: document.querySelector(".ap__run.pm").dataset.demo, near: after.near, focus: !!document.querySelector(".ap__run [data-focus]"), card: (() => { const c = document.querySelector(".ap__run [data-focus] .ap__card")?.getBoundingClientRect(); return c ? c.left + c.width / 2 - document.documentElement.clientWidth / 2 : null; })() };
      });
      console.log(tag, "play", JSON.stringify({ ms: Math.round(r.ms), frames: r.frames, maxFrameGap: Math.round(r.gap), peakSpeedAt: Math.round(r.peakAt), longTasks: r.lt, state: r.state, restingCardOffCentrePx: r.card == null ? null : Math.round(r.card), resting: r.focus }));
      if (r.state !== "done") fails.push(`${tag}: ended as ${r.state}`);
      if (r.ms < 1600 || r.ms > 2400) fails.push(`${tag}: duration ${Math.round(r.ms)} ms outside 1.6-2.4 s`);
      if (r.lt.length) fails.push(`${tag}: ${r.lt.length} long task(s) during the demo`);
      if (r.gap > 50) fails.push(`${tag}: a ${Math.round(r.gap)} ms frame gap during the demo`);
      if (!(r.peakAt > 0.25 * r.ms && r.peakAt < 0.75 * r.ms)) fails.push(`${tag}: speed peak at ${Math.round(r.peakAt)} ms is not mid-demo (no ramp)`);
      if (!r.focus) fails.push(`${tag}: no card resting after the demo`);
      else if (r.card == null || Math.abs(r.card) > 4) fails.push(`${tag}: the resting card is ${Math.round(r.card)} px off the centre`);
    }
    await ctx.close();
  }

  // 2. a pointerdown mid-demo cancels it without a jump
  {
    const { ctx, p } = await open(view);
    await scrollIn(p);
    await p.waitForFunction(() => document.querySelector(".ap__run.pm").dataset.demo === "running", null, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(700);
    const box = await p.locator(".ap__run.pm").boundingBox();
    const before = await p.evaluate(() => {
      const it = [...document.querySelectorAll(".ap__run .pm__item")].filter((el) => el.style.display !== "none");
      return it.map((el) => el.getBoundingClientRect().left);
    });
    // press on empty space at the run's lower edge, so no link is involved
    await p.mouse.move(box.x + 8, box.y + box.height - 4);
    await p.mouse.down();
    const at = await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => {
      const it = [...document.querySelectorAll(".ap__run .pm__item")].filter((el) => el.style.display !== "none");
      res({ state: document.querySelector(".ap__run.pm").dataset.demo, x: it.map((el) => el.getBoundingClientRect().left) });
    })));
    await p.mouse.up();
    const jump = Math.max(...at.x.map((x, i) => Math.abs(x - before[i])));
    console.log(tag, "cancel", JSON.stringify({ state: at.state, maxShiftAcrossPressPx: Math.round(jump) }));
    if (at.state !== "cancelled") fails.push(`${tag}: pointerdown did not cancel (state ${at.state})`);
    // one frame of motion at peak speed is < 60 px on these sizes; a jump would be a card gap
    if (jump > 60) fails.push(`${tag}: cards jumped ${Math.round(jump)} px on the press`);
    await p.waitForTimeout(900);
    const settled = await p.evaluate(() => !!document.querySelector(".ap__run [data-focus]"));
    if (!settled) fails.push(`${tag}: no card rested after the cancel`);
    await ctx.close();
  }

  // 3. reduced motion: nothing plays
  {
    const { ctx, p } = await open(view, { reduce: true });
    await scrollIn(p);
    await p.waitForTimeout(2000);
    const st = await p.evaluate(() => document.querySelector(".ap__run.pm").dataset.demo || "");
    console.log(tag, "reduced-motion", JSON.stringify({ state: st || "none" }));
    if (st) fails.push(`${tag}: demo ran under reduced motion`);
    await ctx.close();
  }

  // 4. the video
  {
    const { ctx, p } = await open(view, { video: true, settle: SETTLE });
    await scrollIn(p);
    await p.waitForFunction(() => document.querySelector(".ap__run.pm").dataset.demo === "running", null, { timeout: 8000 }).catch(() => {});
    const t = await p.evaluate(() => performance.now());
    await p.waitForTimeout(3200);
    const v = p.video();
    await ctx.close();
    if (v) { const f = `${OUT}/${tag}.webm`; await v.saveAs(f); console.log(tag, "video", f, "demo started at page ms", Math.round(t)); }
  }
}

await browser.close();
if (fails.length) { console.error("FAIL\n" + fails.join("\n")); process.exit(1); }
console.log("PASS");
