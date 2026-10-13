// Ablation: inject css to switch features off and compare idle frame stats in the side-quests section. node sq-ablate.mjs <url>
import { chromium } from "playwright-core";
const url = process.argv[2];
const ONLY = process.argv[4]?.split(","); const CASES = { noFavicon: "", pauseHalf: "", pauseDup: "", wcTransform: ".pm__item{will-change:transform}", containPaint: ".pm__item{contain:layout paint}", wcOffset: ".pm__item{will-change:offset-distance}", plateWc: ".ap__plate{will-change:transform;transform:translateZ(0)}", noPlateRadius: ".ap__plate,.ap__card{border-radius:0!important}", noObjFit: ".ap__plate{object-fit:fill!important}", pauseAll: "", preloadNone: "", noHost: ".wscene__host,canvas{display:none!important}", noHostNoTex: ".wscene__host,canvas,.tex-bg{display:none!important}", noPoster: ".wscene__poster{display:none!important}", noBodyFx: ".hello[data-page=\"3\"]::before,.hello[data-page=\"3\"]::after{display:none!important}", hideFollow: "video[src*=follow]{visibility:hidden!important}", hideOdin: "video[src*=odineye]{visibility:hidden!important}", hideAway: ".ap__plate[src*=away]{visibility:hidden!important}", hide3: "video.ap__plate:nth-of-type(n){visibility:hidden!important}.ap__card--dwell:nth-child(n+4) video{visibility:hidden!important}", allFx: ".pm__item{filter:none!important;opacity:1!important;scale:1!important}.ap__card,.ap__card *{box-shadow:none!important}", fxNoVideoScale: ".pm__item{filter:none!important;opacity:1!important}", videoFirstFrame: "video{animation:none}", noFade: ".pm__layer,.pm,.ap__stage{mask:none!important;-webkit-mask:none!important}", noRadius: ".ap__card,.ap__plate{border-radius:0!important;overflow:visible!important}", noCanvas: "canvas{visibility:hidden!important}", baseline: "", noBlur: ".pm__item{filter:none!important}", noShadow: ".ap__card,.pm__item,.ap__card *{box-shadow:none!important;text-shadow:none!important}", noOpacity: ".pm__item{opacity:1!important}", noBackdrop: "*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}", noScale: ".pm__item{scale:1!important}", hideVideos: "video{visibility:hidden!important}", noBlurNoShadow: ".pm__item{filter:none!important}.ap__card,.pm__item,.ap__card *{box-shadow:none!important}", noCards: ".pm__item{display:none!important}" };
const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--ignore-gpu-blocklist"] });
for (const [name, css] of Object.entries(CASES)) {
  if (ONLY && !ONLY.includes(name)) continue;
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  if (name === "noFavicon") await p.addInitScript(() => { window.Worker = class { postMessage() {} terminate() {} addEventListener() {} set onmessage(v) {} }; });
  await p.addInitScript(() => { window.__f = []; let l = 0, on = false; window.__rec = (v) => { on = v; l = 0; if (v) window.__f = []; }; const t = (n) => { if (on && l) window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
  await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(4000);
  if (process.argv[3] === "wait") await p.waitForFunction(() => document.documentElement.dataset.wsceneDrawn, null, { timeout: 90000, polling: 500 }).catch(() => console.log("no handover")); await p.waitForTimeout(10000);
  await p.evaluate(() => document.querySelector(".ap").scrollIntoView({ block: "center", behavior: "instant" }));
  if (css) await p.addStyleTag({ content: css });
  if (name === "pauseHalf") await p.evaluate(() => { [...document.querySelectorAll("video.ap__plate")].filter((v, i) => i % 2).forEach((v) => v.pause()); });
  if (name === "pauseDup") await p.evaluate(() => { [...document.querySelectorAll("video.ap__plate")].slice(3).forEach((v) => v.pause()); });
  if (name === "pauseAll") await p.evaluate(() => { document.querySelectorAll("video").forEach((v) => { v.pause(); }); });
  if (name === "preloadNone") await p.evaluate(() => { document.querySelectorAll("video").forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); }); });
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__rec(true)); await p.waitForTimeout(5000);
  const f = await p.evaluate(() => { window.__rec(false); return window.__f; });
  const s = [...f].sort((a, b) => a - b); const q = (x) => +(s[Math.floor(s.length * x)] || 0).toFixed(1);
  console.log(name.padEnd(16), `fps ${(1000 / (f.reduce((a, c) => a + c, 0) / f.length)).toFixed(1)}  p50 ${q(0.5)} p95 ${q(0.95)}  >16.7: ${((f.filter((x) => x > 16.7).length / f.length) * 100).toFixed(0)}%`);
  await p.context().close();
}
await b.close();
