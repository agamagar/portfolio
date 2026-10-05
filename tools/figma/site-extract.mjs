#!/usr/bin/env node
/**
 * Extract the site's design language from the LIVE page, for the code -> Figma
 * half of the bridge.
 *
 * Reading the CSS files would mean re-implementing the cascade: the tokens that
 * matter are the COMPUTED ones, after every override, in both themes. So this
 * drives a headless Chrome over CDP, toggles the theme, and reads what the
 * browser actually resolved - the same method used to verify every change on
 * this page.
 *
 * Writes tools/figma/site-design.json:
 *   tokens : { light: {...}, dark: {...} }   the :root custom properties
 *   type   : { key: {family,size,weight,lh,ls} }  measured off real elements
 *   radii  : { selector: value }
 *   icons  : { name: "<svg .../>" }           the site's own markup, verbatim
 *
 * The Figma side consumes that file and upserts variables, text styles and
 * components BY NAME, so re-running updates in place instead of duplicating.
 *
 * Run: node tools/figma/site-extract.mjs [url]
 *   default url http://localhost:5173/portfolio
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "site-design.json");
const URL_ = process.argv[2] || "http://localhost:5173/portfolio";
const PROFILE = process.env.TMPDIR + "figma-extract-profile";
const PORT = 9455;

const TOKENS = ["bg", "fg", "muted", "muted-2", "line", "hover", "accent", "link", "green", "tl-axis-ink", "max"];
// each entry is [key, selector] - measured on a real element so the value is
// what the page ships, not what a stylesheet hoped for
const TYPE = [
  ["row-year", ".work__year"], ["row-title", ".work__title"], ["row-meta", ".work__meta"],
  ["link", ".hello-hero__link--out"], ["bubble", ".hello-foot__bubble-text"],
  ["foot-title", ".hello-foot__title"], ["tip", ".tip"], ["chip-label", ".hello-chip__label"],
];
const RADII = [".wg__card", ".ap__card", ".hello-foot__bubble", ".hello-chip__body", ".tip", ".ap__cinema-video"];
const ICONS = [
  ["chip-theme", ".hello-chip--theme svg"], ["chip-sound", ".hello-chip--sound svg"],
  ["arrow-ne", ".hello-hero__link-ne"], ["arrow-row", ".work__arrow"],
  ["mail", ".hello-foot__bubble-icon svg"], ["copy", ".hello-foot__copy-ic"], ["check", ".hello-foot__copy-ok"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
   "--hide-scrollbars", "--window-size=1440,900", "--no-first-run", "--disable-gpu", "about:blank"],
  { stdio: "ignore" });

let ws;
try {
  let target;
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === "page");
      if (p) { target = p.webSocketDebuggerUrl; break; }
    } catch {}
    await sleep(250);
  }
  if (!target) throw new Error("chrome never came up");
  ws = new WebSocket(target);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) {
      const p = pending.get(d.id); pending.delete(d.id);
      d.error ? p.rej(new Error(d.error.message)) : p.res(d.result);
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const ev = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };

  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
  await send("Page.navigate", { url: URL_ });
  await sleep(8000);

  const out = { source: URL_, extractedAt: new Date().toISOString(), tokens: {}, type: {}, radii: {}, icons: {} };

  for (const dark of [false, true]) {
    await ev(`document.documentElement.classList.toggle('dark', ${dark});1`);
    await sleep(500);
    out.tokens[dark ? "dark" : "light"] = await ev(
      `(()=>{const cs=getComputedStyle(document.documentElement);const o={};for(const n of ${JSON.stringify(TOKENS)})o[n]=cs.getPropertyValue('--'+n).trim();return o})()`);
  }
  await ev("document.documentElement.classList.remove('dark');1");
  await sleep(400);

  out.type = await ev(`(()=>{const o={};for(const [k,sel] of ${JSON.stringify(TYPE)}){const e=document.querySelector(sel);if(!e)continue;const c=getComputedStyle(e);o[k]={family:c.fontFamily.split(',')[0].replace(/["']/g,''),size:parseFloat(c.fontSize),weight:+c.fontWeight,lh:parseFloat(c.lineHeight)||null,ls:parseFloat(c.letterSpacing)||0};}return o})()`);
  out.radii = await ev(`(()=>{const o={};for(const s of ${JSON.stringify(RADII)}){const e=document.querySelector(s);if(e)o[s]=getComputedStyle(e).borderRadius;}return o})()`);

  // the footer has to be in view before its icons exist in the DOM
  await ev("document.querySelector('.hello-foot')?.scrollIntoView({block:'center'});1");
  await sleep(900);
  out.icons = await ev(`(()=>{const o={};for(const [k,sel] of ${JSON.stringify(ICONS)}){const e=document.querySelector(sel);if(e)o[k]=e.outerHTML;}return o})()`);

  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  const counts = Object.fromEntries(Object.entries(out).filter(([, v]) => v && typeof v === "object").map(([k, v]) => [k, Object.keys(v).length]));
  console.log("wrote", path.relative(process.cwd(), OUT), JSON.stringify(counts));
} catch (e) {
  console.error("ERR", e.message);
  process.exitCode = 1;
} finally {
  try { ws && ws.close(); } catch {}
  chrome.kill();
}
