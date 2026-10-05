#!/usr/bin/env node
// Scroll recorder for the window scene on the folio page: drives a real headless
// Chrome (fresh temp profile, GPU on, like render.mjs) with WHEEL events, so the
// site's Lenis smooth scroll, the scroll listeners, the render loop and the hand-offs
// all run as they do for a person, and captures a frame plus the page's state at
// every step. Built after "the transitions in and out of the screen are utterly
// broken" (2026-09-27): single frames at pinned scroll positions cannot show what
// happens BETWEEN them (flashes, stale frames, a canvas that fades while the page
// pops).
//
//   node tools/window-light/scrollrec.mjs --url "/portfolio?scene=window&tod=17.68" \
//     --w 1440 --h 900 --dpr 1 --plan "down:26,up:8,end,up:10" --out DIR
//
// plan: comma list of  down:N | up:N (N wheel steps of --delta px) | end (jump near
// the bottom: the contact section's top) | wait:MS | frames:N | flick:PX (a trackpad
// flick: wheel deltas from PX, negative for up, decaying 8 % a frame as momentum does;
// state only, no frames, so the stream stays unbroken). Writes DIR/f###.jpg,
// DIR/state.json.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const BASE = opt("--base", "http://localhost:5173");
const URL_ = opt("--url", "/portfolio?scene=window&tod=17.68");
const W = +opt("--w", 1440), H = +opt("--h", 900), DPR = +opt("--dpr", 1);
const DELTA = +opt("--delta", 100), STEP_MS = +opt("--step", 70);
const PLAN = opt("--plan", "down:26,up:8");
const OUT = path.resolve(opt("--out", "/tmp/scrollrec"));
const SCALE = +opt("--scale", 0.5);
const PRE = opt("--pre", "");
const CAST = args.includes("--cast"); // also record every composited frame (Page.startScreencast) to DIR/cast/ // JS run once the scene is ready, before recording (for example a theme switch)
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILES = "/private/tmp/claude-501/-Users-agamagarwal-My-Drive-Active---Portfolio/f6eb71b2-3a66-4ec7-b85d-ffd026e2b335/scratchpad/chrome-profiles";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function freePort() {
  return new Promise((res) => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
}
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (m) => {
    const msg = JSON.parse(m.data);
    if (msg.method && api.onEvent) api.onEvent(msg);
    if (msg.id != null && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    }
  });
  const api = {
    onEvent: null,
    send: (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params })); }),
    close: () => { try { ws.close(); } catch {} },
  };
  return api;
}

const STATE = `(() => {
  const c = document.querySelector('.wscene__canvas');
  const s = window.__windowScene?.stats?.() || {};
  const hero = document.querySelector('.hello-hero');
  const hr = hero ? hero.getBoundingClientRect() : null;
  return {
    y: Math.round(scrollY),
    landed: document.documentElement.dataset.wsceneLanded ?? null,
    shown: c?.dataset.shown ?? null, hidden: c?.dataset.hidden ?? null,
    canvasOpacity: c ? +getComputedStyle(c).opacity : null,
    pagePct: c?.dataset.p ?? null, engineP: s.p ?? null, frame: s.frame ?? null,
    heroTop: hr ? Math.round(hr.top) : null,
    heroOpacity: hero ? +getComputedStyle(hero).opacity : null,
  };
})()`;

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILES, { recursive: true });
const profile = fs.mkdtempSync(path.join(PROFILES, "wl-scroll-"));
const port = await freePort();
const proc = spawn(CHROME, ["--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--hide-scrollbars", "--mute-audio",
  "--use-angle=metal", "--enable-unsafe-webgpu", "--ignore-gpu-blocklist", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let cdp;
try {
  let info = null;
  for (let i = 0; i < 100 && !info; i++) { try { info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(150); } }
  const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
  cdp = await connect(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: false });
  await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
  await cdp.send("Page.navigate", { url: BASE + URL_ });
  const ev = async (expr) => (await cdp.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;
  // wait for the scene, then a settled moment
  for (let i = 0; i < 200; i++) { if (await ev("!!(window.__windowScene)")) break; await sleep(100); }
  await ev("Promise.resolve(window.__windowScene?.ready).then(() => true)");
  if (PRE) { await ev(`(async () => { ${PRE}; return true; })()`); await sleep(1500); }
  await sleep(2500);
  const states = [];
  let f = 0;
  const shot = async (label) => {
    const st = await ev(STATE);
    // the VIEWPORT (a clip is in document coordinates: at y 0 it captured the page's
    // top, off screen once scrolled, and made working transitions look broken)
    const img = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: false });
    const name = `f${String(f).padStart(3, "0")}.jpg`;
    fs.writeFileSync(path.join(OUT, name), Buffer.from(img.data, "base64"));
    states.push({ f, label, ...st, t: Date.now() });
    f++;
  };
  const wheel = async (dy) => {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: W / 2, y: H / 2, deltaX: 0, deltaY: dy });
  };
  let castN = 0;
  if (CAST) {
    fs.mkdirSync(path.join(OUT, "cast"), { recursive: true });
    cdp.onEvent = async (msg) => {
      if (msg.method !== "Page.screencastFrame") return;
      const { data, sessionId, metadata } = msg.params;
      fs.writeFileSync(path.join(OUT, "cast", `c${String(castN++).padStart(4, "0")}_${Math.round(metadata.timestamp * 1000)}.jpg`), Buffer.from(data, "base64"));
      cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    };
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, everyNthFrame: 1 });
  }
  await shot("start");
  for (const step of PLAN.split(",")) {
    const [kind, nStr] = step.split(":");
    const n = +nStr || 0;
    if (kind === "down" || kind === "up") {
      for (let i = 0; i < n; i++) { await wheel(kind === "down" ? DELTA : -DELTA); await sleep(STEP_MS); await shot(`${kind} ${i + 1}/${n}`); }
    } else if (kind === "swipe") {
      // swipe:x0:y0:x1:y1:steps  a mouse drag-free swipe across the page (hover physics)
      const [x0, y0, x1, y1, st] = nStr.split(":").slice(0).concat(step.split(":").slice(2)).map(Number);
      const steps = st || 12;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u });
        await sleep(12);
      }
      await shot(`swipe ${x0},${y0} -> ${x1},${y1}`);
    } else if (kind === "flick") {
      let d = n || 40, i = 0;
      while (Math.abs(d) >= 0.6) {
        // not awaited: a round trip per event spaced them 66 ms apart, a trackpad sends
        // one every frame
        cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: W / 2, y: H / 2, deltaX: 0, deltaY: d });
        await sleep(16);
        d *= 0.92;
        if (++i % 8 === 0) states.push({ f: null, label: `flick ${i} d=${d.toFixed(1)}`, ...(await ev(STATE)), t: Date.now() });
      }
      await shot(`flick ${n} end`);
    } else if (kind === "goto") {
      // goto:Y  jump the scroll to Y (px) at once, settle, capture
      await ev(`(async () => { const L = (await import('/src/ui/smoothScroll.js')).getLenis(); L ? L.scrollTo(${n}, { immediate: true, force: true }) : scrollTo(0, ${n}); return true; })()`);
      await sleep(400); await shot(`goto ${n}`);
    } else if (kind === "toggle") {
      // click the header's theme toggle, as a person does (the view-transition reveal runs)
      await ev("document.querySelector('.theme-toggle')?.click(), true");
      await shot("theme toggled");
    } else if (kind === "frames") {
      for (let i = 0; i < n; i++) { await sleep(STEP_MS); await shot(`frame ${i + 1}/${n}`); }
    } else if (kind === "wait") {
      await sleep(n); await shot(`wait ${n}`);
    } else if (kind === "end") {
      // jump (as a person would fling) to just above the contact section's top
      await ev(`(async () => { const L = (await import('/src/ui/smoothScroll.js')).getLenis(); const f = document.querySelector('.hello-foot'); const y = f.getBoundingClientRect().top + scrollY - innerHeight * 0.6; L ? L.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); return true; })()`);
      await sleep(600); await shot("jump to the contact section");
    }
  }
  fs.writeFileSync(path.join(OUT, "state.json"), JSON.stringify(states, null, 1));
  // a per-frame log a --pre script kept in window.__log, if any
  const log = await ev("window.__log || null");
  if (log) fs.writeFileSync(path.join(OUT, "log.json"), JSON.stringify(log));
  console.log(`${states.length} frames -> ${OUT}`);
} finally {
  cdp?.close();
  proc.kill("SIGTERM");
  await sleep(500);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
