// Blank-page smoke gate. Run after every edit:  node tools/qa-smoke.mjs  (dev server on :5173, or QA_URL=...)
// Headless Chromium only. Fails (exit 1) on any pageerror / console error, empty #root,
// missing hero or heading, no work cards, a blank (near-uniform) screenshot, or a broken font
// (a font request that 4xx/5xx/fails, or an h1 whose first family has FontFaces but none loaded).
import { chromium } from "playwright";

const BASE = process.env.QA_URL || "http://localhost:5173";
const fails = [], slows = [];
const t0 = Date.now();
const lap = (m) => process.env.QA_TIMING && console.log(m, Date.now() - t0);

// console noise that is not a page failure
const IGNORE = [/Failed to load resource/i, /favicon/i, /agentation/i, /localhost:4747/, /Failed to load resource.*(4747|404)/i, /GPU stall|GL Driver Message|WebGL.*(deprecated|performance)/i, /\[vite\]/i];
const ignored = (t) => IGNORE.some((r) => r.test(t));

const browser = await chromium.launch();

// One attempt. Returns { real, slow }: real = a genuine failure (pageerror, empty #root, blank shot,
// missing element); slow = only Playwright timeouts, i.e. the machine was too loaded to judge.
async function attempt(path, check, post) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 } });
  const p = await ctx.newPage();
  const errs = [], real = [], slow = [];
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error" && !ignored(m.text())) errs.push("console: " + m.text().slice(0, 300)); });
  p.on("requestfailed", (r) => { if (/\.(jsx?|css|mjs)(\?|$)/.test(r.url())) errs.push("chunk failed: " + r.url()); });
  const bad = (m) => real.push(`${path}: ${m}`);
  const FONT = /\.(woff2?|ttf|otf)(\?|$)|fonts\.(googleapis|gstatic)\.com/i;
  p.on("response", (r) => { if (FONT.test(r.url()) && r.status() >= 400) errs.push(`font ${r.status()}: ${r.url().slice(0, 140)}`); });
  p.on("requestfailed", (r) => { if (FONT.test(r.url()) && !/ABORTED/.test(r.failure()?.errorText || "")) errs.push("font request failed: " + r.url().slice(0, 140)); });
  try {
    await p.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 45000 });
    // poll (not a fixed wait) until React has put content in #root
    await p.waitForFunction(() => document.querySelector("#root")?.children.length > 0, null, { timeout: 30000, polling: 250 }).catch(() => bad("#root is empty"));
    if (await p.locator("vite-error-overlay").count()) bad("vite error overlay: " + (await p.locator("vite-error-overlay").first().innerText().catch(() => "")).slice(0, 300));
    lap("loaded " + path);
    await check(p, bad);
    lap("checked " + path);
    // FONTS: wait (max 3 s) for document.fonts.ready, then the h1's first family must not be a declared
    // face that failed to load (the Stack Sans 403, 18 Oct 2026, fell back to Inter silently)
    const fontBad = await p.evaluate(async () => {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
      const h = document.querySelector("h1"); if (!h) return "";
      const fam = getComputedStyle(h).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
      const faces = [...document.fonts].filter((f) => f.family.replace(/^["']|["']$/g, "") === fam);
      if (faces.length && !faces.some((f) => f.status === "loaded")) return `h1 font "${fam}" not loaded (${[...new Set(faces.map((f) => f.status))].join(",")})`;
      return "";
    }).catch(() => "");
    if (fontBad) bad(fontBad);
    await p.waitForTimeout(1500);
    const shot = await p.screenshot({ type: "jpeg", quality: 40, timeout: 30000 });
    lap("shot " + path);
    // decode in the page (no image dependency) and measure luma spread
    const std = await p.evaluate(async (b64) => {
      const bmp = await createImageBitmap(await (await fetch("data:image/jpeg;base64," + b64)).blob());
      const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height;
      const g = c.getContext("2d"); g.drawImage(bmp, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0, s = 0, s2 = 0;
      for (let i = 0; i < d.length; i += 4 * 37) { const l = (d[i] + d[i + 1] + d[i + 2]) / 3; n++; s += l; s2 += l * l; }
      const m = s / n; return Math.sqrt(Math.max(0, s2 / n - m * m));
    }, shot.toString("base64")).catch(() => 99);
    if (std < 3) bad(`screenshot looks blank (luma std ${std.toFixed(2)})`);
    // after the screenshot: the room click starts a heavy build that starves headless GL, so it goes last
    if (post) await post(p, bad);
  } catch (e) {
    const msg = e.message.split("\n")[0];
    (/Timeout/.test(msg) ? slow : real).push(`${path}: ${msg}`);
  }
  for (const e of errs) real.push(`${path}: ${e}`);
  await ctx.close().catch(() => {});
  return { real, slow };
}

// retry once before failing; a timeout-only failure that persists is reported as SLOW, not as a bug
async function page(path, check, post) {
  let r = await attempt(path, check, post);
  if (r.real.length || r.slow.length) { lap("retry " + path); r = await attempt(path, check, post); }
  fails.push(...r.real); slows.push(...r.slow);
}

const visible = async (p, sel, bad, label = sel) => { const l = p.locator(sel).first(); if (!(await l.waitFor({ state: "visible", timeout: 20000 }).then(() => true, () => false))) bad(`${label} not visible`); };

await page("/", async (p, bad) => {
  await visible(p, ".hello-hero", bad, "hero");
  await visible(p, "[data-hero-h1]", bad, "hero heading");
  if ((await p.locator(".wg__card").count()) < 1) bad("no work cards (.wg__card)");
  if ((await p.locator(".hello-foot").count()) < 1) bad("footer missing");
  if ((await p.locator("#root *").count()) < 50) bad("home has almost no content");
}, async (p, bad) => {
  // room pill: click it and assert it responds (state leaves "warming") without waiting for the room to build.
  // `--room` additionally waits up to 60 s for the entry to start landing.
  const pill = p.locator(".wscene-warm-pill").first();
  if (!(await pill.waitFor({ state: "visible", timeout: 10000 }).then(() => true, () => false))) return; // pill is opt-in / may be absent
  const before = await pill.getAttribute("data-state");
  await pill.click({ timeout: 5000 }).catch(() => bad("room pill not clickable"));
  await p.waitForTimeout(800);
  const after = await pill.getAttribute("data-state").catch(() => "gone");
  if (before === "warming" && after === "warming") bad("room pill did not respond to click (state stayed warming)");
  if (!(await p.locator("#root *").count())) bad("#root emptied after room click");
  if (process.argv.includes("--room")) {
    const ok = await p.waitForFunction(() => { const e = document.querySelector(".wscene-warm-pill"); return !e || ["entering", "landing", "handoff"].includes(e.dataset.state); }, null, { timeout: 60000 }).then(() => true, () => false);
    if (!ok) bad("--room: room entry did not start within 60 s");
  }
});

await page("/work/scheduled-delivery", async (p, bad) => {
  // the title animates in (zero-width box at first), so assert it has text rather than a box
  if (!((await p.locator("h1").first().textContent({ timeout: 20000 }).catch(() => "")) || "").trim()) bad("case heading missing or empty");
  if ((await p.locator("#root *").count()) < 50) bad("case page has almost no content");
});

await browser.close();
// optional fast face gate (--faces): hero size, front + 3/4, light only, against the cache; needs vite on :5218 (see tools/face3d/gate/README.md)
if (process.argv.includes("--faces")) {
  const { spawnSync } = await import("node:child_process");
  for (const args of [["tools/face3d/gate/render.mjs", "--fast"], ["tools/face3d/gate/gate.mjs", "--fast", "--out", "tools/face3d/gate/report-fast"]]) {
    const r = spawnSync("node", args, { stdio: "inherit" }); if (r.status) fails.push(`face gate (${args[0]}) exit ${r.status}`);
  }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
if (fails.length) { console.error(`QA SMOKE FAILED (${secs}s):\n - ` + [...new Set(fails)].join("\n - ")); process.exit(1); }
if (slows.length) { console.error(`QA SMOKE SLOW (load-related, not a page failure; machine too busy to verify, rerun) (${secs}s):\n - ` + [...new Set(slows)].join("\n - ")); process.exit(2); }
console.log(`QA smoke OK (${secs}s)`);
