// Hero load QA: N cold loads of the Scheduled Delivery page in real (headed-like)
// Chromium. Per load: when the reveal flips, when the clock starts, whether the
// bolts have SVG while they are visible, the mist opacity at clock start, and
// frame times across the first 8 s. Run from ~/portfolio so playwright resolves.
import { chromium } from "playwright";

const URL = process.argv[2] || "http://localhost:5173/work/scheduled-delivery";
const RUNS = +(process.argv[3] || 5);
// full Chromium's new headless, on the Metal GPU: the headless shell renders in
// software and every frame of this hero takes 300+ ms there, which says nothing
const browser = await chromium.launch({ channel: "chromium", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
const results = [];
for (let r = 0; r < RUNS; r++) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  // r odd: hold the bolt SVGs back 1.8 s, the race that left the green layer empty
  if (r % 2 === 1) {
    await page.route("**/heart-v2/bolt-*.svg", async (route) => { await new Promise((ok) => setTimeout(ok, 1800)); await route.continue(); });
  }
  await page.addInitScript(() => {
    window.__hq = { frames: [], log: [], t0: performance.now() };
    let last = performance.now();
    const tick = (t) => { window.__hq.frames.push([t, t - last]); last = t; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const poll = () => {
      const pg = document.querySelector(".page--article");
      const root = document.querySelector(".shl");
      const bolts = [...document.querySelectorAll(".shl__bolt")];
      const mist = pg ? getComputedStyle(pg, "::before") : null;
      window.__hq.log.push({
        t: Math.round(performance.now()),
        rev: pg?.dataset.loadReveal || "-",
        p: root?.dataset.p ? +root.dataset.p : null,
        boltSvg: bolts.map((b) => !!b.querySelector("svg")),
        boltOp: bolts.map((b) => +getComputedStyle(b).opacity),
        mist: mist ? +mist.opacity : null,
      });
      if (performance.now() < 60000) setTimeout(poll, 50);
    };
    setTimeout(poll, 50);
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  page.on("response", (res) => { if (res.status() >= 400) errors.push(res.status() + " " + res.url().replace(/^https?:\/\/[^/]+/, "")); });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForFunction(() => document.querySelector(".shl"), null, { timeout: 120000 });
  await page.waitForTimeout(r % 2 ? 11000 : 9000);
  const hq = await page.evaluate(() => window.__hq);
  // the hero alone: replay once the page is idle, and time those 6.5 s
  await page.waitForTimeout(3000);
  const replay = await page.evaluate(async () => {
    const btn = document.querySelector(".shl .article__hero-replay");
    if (!btn) return null;
    window.scrollTo(0, 0);
    await new Promise((ok) => setTimeout(ok, 300));
    const fr = []; let last = performance.now(); let on = true;
    const tick = (t) => { fr.push(t - last); last = t; if (on) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    btn.click();
    const seen = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 6500) {
      const bolts = [...document.querySelectorAll(".shl__bolt")];
      seen.push(bolts.some((b) => +getComputedStyle(b).opacity > 0.05 && !b.querySelector("svg")));
      await new Promise((ok) => setTimeout(ok, 100));
    }
    on = false;
    const s = [...fr].sort((a, b) => a - b);
    return { frames: fr.length, fps: +(fr.length / 6.5).toFixed(1), long: fr.filter((d) => d > 34).length, worst: Math.round(s[s.length - 1]), p95: Math.round(s[Math.floor(s.length * 0.95)]), emptyBolt: seen.filter(Boolean).length };
  });
  const revIn = hq.log.find((l) => l.rev === "in");
  const clock = hq.log.find((l) => l.p > 0);
  // bolt visible but without svg = the missing green layer
  const emptyVisible = hq.log.filter((l) => l.boltOp.some((o, i) => o > 0.05 && !l.boltSvg[i])).length;
  const peakBolt = Math.max(0, ...hq.log.map((l) => Math.max(0, ...l.boltOp)));
  const after = clock ? hq.frames.filter(([t]) => t >= clock.t && t <= clock.t + 6500).map(([, d]) => d) : [];
  const long = after.filter((d) => d > 34);
  results.push({
    run: r, throttled: r % 2 === 1,
    revealAt: revIn?.t ?? null, clockAt: clock?.t ?? null,
    clockAfterReveal: revIn && clock ? clock.t - revIn.t : null,
    mistAtClock: clock?.mist ?? null,
    peakBoltOpacity: +peakBolt.toFixed(2),
    emptyVisibleBoltSamples: emptyVisible,
    framesDuringHero: after.length, longFrames: long.length, worstFrame: Math.round(Math.max(0, ...after)),
    p95: after.length ? Math.round([...after].sort((a, b) => a - b)[Math.floor(after.length * 0.95)]) : null,
    replay,
    errors: [...new Set(errors)].filter((e) => !/proto\/71cZSn|status of 404/.test(e)).slice(0, 4),
  });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
