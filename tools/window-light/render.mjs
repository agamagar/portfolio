#!/usr/bin/env node
// window-light/render.mjs: headless GPU renders of the window scene (or any page) for the
// tuning loop. System Chrome over CDP with Node's built-in WebSocket, no dependencies (the
// house pattern from tools/export-reel.mjs). Full usage and the capture contract are in
// README.md beside this file.
//
//   node tools/window-light/render.mjs --url "/window?shot=ref1741&tod=17.70&capture=1" --w 1600 --h 1200 --out runs/x/a.png
//   node tools/window-light/render.mjs --batch tools/window-light/shots/tooling-test.json --outdir runs/x
//   node tools/window-light/render.mjs --probe
//
// Per shot it writes NAME.png (Page.captureScreenshot at exactly w*dpr x h*dpr), NAME.json
// (url, timings, window.__windowScene.stats(), console counts, GPU, image statistics) and,
// with --console, NAME.log (console errors, warnings and exceptions).
//
// Every run uses a fresh --user-data-dir under the scratchpad's chrome-profiles/ and deletes it
// afterwards: never the default profile, which once opened Agam's real Chrome data.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const TOOL_VERSION = "1";
const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOL_DIR, "..", "..");
const CHROME = process.env.WL_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VITE = path.join(ROOT, "node_modules", ".bin", "vite");
const PROFILE_ROOT = process.env.WL_PROFILES ||
  "/private/tmp/claude-501/-Users-agamagarwal-My-Drive-Active---Portfolio/f6eb71b2-3a66-4ec7-b85d-ffd026e2b335/scratchpad/chrome-profiles";
const DEFAULT_BASE = "http://localhost:5173";
const FALLBACK_PORT = 5175;

// GPU: --use-angle=metal puts WebGL2 on ANGLE's Metal backend (the real Apple GPU, not
// SwiftShader). WebGPU needs nothing extra in headless Chrome 153 on macOS: navigator.gpu
// returns the Metal adapter (vendor "apple", architecture "metal-3") with no flags at all.
// --enable-unsafe-webgpu and --ignore-gpu-blocklist are belt and braces for older builds and
// blocklisted GPUs; neither changes the adapter on this machine (verified with --probe).
const GPU_FLAGS = ["--use-angle=metal", "--enable-unsafe-webgpu", "--ignore-gpu-blocklist"];
const BASE_FLAGS = [
  "--headless=new",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--disable-sync",
  "--hide-scrollbars",           // a 15 px scrollbar would shift the layout under test
  "--mute-audio",
  "--force-color-profile=srgb",  // PNGs in sRGB, comparable with the sRGB references
  "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows",
  "--password-store=basic",      // never touch the macOS keychain
  "--use-mock-keychain",
];

const BOOL = new Set(["console", "strict", "probe", "help", "static", "quiet", "reduced-motion"]);

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Usage(`unexpected argument: ${a}`);
    const eq = a.indexOf("=");
    if (eq > -1) { o[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const k = a.slice(2);
    if (BOOL.has(k)) { o[k] = true; continue; }
    if (i + 1 >= argv.length) throw new Usage(`--${k} needs a value`);
    o[k] = argv[++i];
  }
  return o;
}

class Usage extends Error {}

const USAGE = `window-light render.mjs

  node tools/window-light/render.mjs --url PATH [options]
  node tools/window-light/render.mjs --batch shots.json [--outdir DIR] [options]
  node tools/window-light/render.mjs --probe

Options (a batch entry may carry any per-shot key: name url w h dpr frames settle scheme eval
timeout scene sceneWait waitFor out reducedMotion expect):
  --base URL        server to render from (default ${DEFAULT_BASE}; if unreachable, a Vite dev
                    server is started on :${FALLBACK_PORT} with the local binary and stopped after)
  --static          serve the project root as static files on a free 127.0.0.1 port instead
                    (for plain HTML fixtures such as selftest/scene-stub.html; not for app routes)
  --url PATH        path plus query, or a full http URL
  --w --h --dpr     viewport CSS size and device pixel ratio (default 1440 900 1)
  --out FILE.png    output PNG (default runs/adhoc/<slug>.png); .json and .log go beside it
  --outdir DIR      batch output folder (default runs/<batch file name>)
  --frames N        after __windowScene.ready, renderFrames(N) for TRAA (default 24)
  --settle MS       pages without __windowScene: wait after load + fonts (default 1500)
  --scene MODE      auto | require | skip (default auto)
  --scene-wait MS   how long to look for window.__windowScene after load (default 15000 when
                    the path starts with /window or the query has scene=window, else 2500)
  --wait-for SEL    before settling, wait until a visible element matches this CSS selector
                    (for example canvas: a cold Vite load of a lazy three chunk can take
                    longer than the settle)
  --scheme S        emulate prefers-color-scheme: light | dark
  --reduced-motion  emulate prefers-reduced-motion: reduce
  --eval JS         expression evaluated (and awaited) after ready or settle, before frames;
                    its result (when JSON, under 50 KB) goes in the sidecar as evalResult
  --expect "P=V;Q"  after the shot, assert each params path P is in the sidecar's params
                    (and equals V, JSON or a string, when given); a miss fails the shot,
                    exit 1 (an HMR reload mid-batch can silently drop a look's patch)
  --timeout MS      per shot (default 90000); on timeout the page is still captured
  --console         write console errors, warnings and exceptions to NAME.log
  --strict          exit 1 if any shot logged a console error
  --flags "..."     extra Chrome flags, space separated
  --quiet           less stdout
`;

// ---------------------------------------------------------------- small utilities

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {
  const s = net.createServer();
  s.on("error", rej);
  s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); });
});
const withTimeout = (p, ms, what) => {
  let t;
  return Promise.race([
    p.finally(() => clearTimeout(t)),
    new Promise((_, rej) => { t = setTimeout(() => rej(new TimeoutError(`${what} timed out after ${ms} ms`)), ms); }),
  ]);
};
class TimeoutError extends Error {}

async function reachable(url, ms = 3000) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(ms) }); await r.arrayBuffer(); return true; }
  catch { return false; }
}
async function isVite(url) {
  try { const r = await fetch(url + "/@vite/client", { signal: AbortSignal.timeout(3000) }); await r.arrayBuffer(); return r.ok; }
  catch { return false; }
}
async function waitReachable(url, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await reachable(url, 2000)) return true; await sleep(250); }
  return false;
}
const exited = (child, ms = 5000) => new Promise((res) => {
  if (!child || child.exitCode !== null || child.signalCode !== null) return res(true);
  const t = setTimeout(() => res(false), ms);
  child.once("exit", () => { clearTimeout(t); res(true); });
});
const slug = (s) => s.replace(/^https?:\/\/[^/]+/, "").replace(/[^a-zA-Z0-9.=_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "root";
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");

// ---------------------------------------------------------------- PNG decode (8 bit RGB/RGBA)

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let off = 8, width = 0, height = 0, depth = 0, ctype = 0, inter = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; inter = data[12]; }
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  if (depth !== 8 || inter !== 0 || (ctype !== 2 && ctype !== 6)) return { width, height, data: null };
  const ch = ctype === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const out = new Uint8Array(height * stride);
  let p = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[p++], row = y * stride, prev = row - stride;
    for (let x = 0; x < stride; x++) {
      const r = raw[p++];
      const a = x >= ch ? out[row + x - ch] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = x >= ch && y > 0 ? out[prev + x - ch] : 0;
      let v;
      if (f === 0) v = r;
      else if (f === 1) v = r + a;
      else if (f === 2) v = r + b;
      else if (f === 3) v = r + ((a + b) >> 1);
      else { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      out[row + x] = v & 255;
    }
  }
  return { width, height, ch, data: out };
}

// Luma statistics of a PNG, optionally inside a rect in image pixels. "blank" flags a frame
// that is nearly one flat colour (the classic black WebGL capture).
function imageStats(img, rect) {
  if (!img.data) return null;
  const { width, height, ch, data } = img;
  const x0 = Math.max(0, Math.floor(rect?.x ?? 0)), y0 = Math.max(0, Math.floor(rect?.y ?? 0));
  const x1 = Math.min(width, Math.ceil(rect ? rect.x + rect.w : width)), y1 = Math.min(height, Math.ceil(rect ? rect.y + rect.h : height));
  if (x1 <= x0 || y1 <= y0) return null;
  const step = Math.max(1, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 250000)));
  let n = 0, s = 0, s2 = 0, black = 0, white = 0;
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
    const i = (y * width + x) * ch;
    const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    n++; s += l; s2 += l * l; if (l < 8) black++; if (l > 247) white++;
  }
  const mean = s / n, std = Math.sqrt(Math.max(0, s2 / n - mean * mean));
  return { meanLuma: +mean.toFixed(2), stdLuma: +std.toFixed(2), blackFrac: +(black / n).toFixed(4), whiteFrac: +(white / n).toFixed(4), blank: std < 3 };
}

// ---------------------------------------------------------------- CDP client

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", () => rej(new Error("CDP socket failed")), { once: true });
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener("message", (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id != null && pending.has(msg.id)) {
      const { res, rej, method } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(`${method}: ${msg.error.message}`)) : res(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      for (const fn of [...listeners.get(msg.method)]) fn(msg.params);
    }
  });
  ws.addEventListener("close", () => {
    for (const { rej, method } of pending.values()) rej(new Error(`${method}: CDP socket closed`));
    pending.clear();
  });
  const on = (method, fn) => {
    if (!listeners.has(method)) listeners.set(method, new Set());
    listeners.get(method).add(fn);
    return () => listeners.get(method).delete(fn);
  };
  return {
    send: (method, params = {}) => new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, { res, rej, method });
      ws.send(JSON.stringify({ id: n, method, params }));
    }),
    on,
    once: (method, ms) => {
      let off, t;
      return new Promise((res, rej) => {
        off = on(method, (p) => { clearTimeout(t); off(); res(p); });
        t = setTimeout(() => { off(); rej(new TimeoutError(`waiting for ${method} timed out after ${ms} ms`)); }, ms);
      });
    },
    close: () => { try { ws.close(); } catch {} },
  };
}

async function evaluate(cdp, expression, ms = 30000, what = "evaluate") {
  const r = await withTimeout(cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), ms, what);
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    throw new Error(`${what}: ${d.exception?.description || d.text}`);
  }
  return r.result.value;
}

// ---------------------------------------------------------------- servers

async function resolveBase(a, log) {
  if (a.static) return startStatic(log);
  const base = String(a.base || DEFAULT_BASE).replace(/\/$/, "");
  if (await reachable(base)) return { base, source: "existing", stop: async () => {} };
  const host = new URL(base).hostname;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) throw new Error(`${base} is unreachable`);
  // Reuse :5175 only if it is really a Vite dev server (another agent may run a plain static
  // server there, which would serve 404s for app routes). Otherwise start Vite: on :5175 when it
  // is free, else on any free port.
  let port = FALLBACK_PORT;
  const at = (p) => `http://localhost:${p}`;
  if (await reachable(at(port))) {
    if (await isVite(at(port))) {
      log(`${base} unreachable; using the Vite server already running on :${port}`);
      return { base: at(port), source: `existing:${port}`, stop: async () => {} };
    }
    port = await freePort();
    log(`${base} unreachable and :${FALLBACK_PORT} is taken by something that is not Vite; starting vite on :${port}`);
  } else {
    log(`${base} unreachable; starting vite on :${port}`);
  }
  const fb = at(port);
  // Own dependency cache (vite.fallback.config.mjs) so Agam's server's deps are never rewritten.
  const vite = spawn(VITE, ["--config", path.join(TOOL_DIR, "vite.fallback.config.mjs"), "--port", String(port), "--strictPort"],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
  let tail = "";
  const keep = (d) => { tail = (tail + d.toString()).slice(-4000); };
  vite.stdout.on("data", keep); vite.stderr.on("data", keep);
  if (!(await waitReachable(fb, 120000))) {
    vite.kill("SIGTERM");
    throw new Error(`vite did not come up on :${port}\n${tail}`);
  }
  return {
    base: fb, source: `spawned:${port}`,
    stop: async () => { vite.kill("SIGTERM"); if (!(await exited(vite, 5000))) vite.kill("SIGKILL"); },
  };
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".wasm": "application/wasm", ".glb": "model/gltf-binary", ".bin": "application/octet-stream", ".ktx2": "image/ktx2",
  ".hdr": "application/octet-stream", ".frag": "text/plain", ".txt": "text/plain",
};

async function startStatic(log) {
  const port = await freePort();
  const server = createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    if (u.pathname === "/favicon.ico") { res.writeHead(204); return res.end(); }
    const p = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname)));
    if (!p.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
    fs.stat(p, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "content-type": MIME[path.extname(p).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
      fs.createReadStream(p).pipe(res);
    });
  });
  await new Promise((r) => server.listen(port, "127.0.0.1", r));
  const base = `http://127.0.0.1:${port}`;
  log(`static server for the project root on ${base}`);
  return { base, source: "static", stop: () => new Promise((r) => server.close(() => r())) };
}

// ---------------------------------------------------------------- Chrome

async function launchChrome(extra, log) {
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME} (set WL_CHROME)`);
  fs.mkdirSync(PROFILE_ROOT, { recursive: true });
  const profile = fs.mkdtempSync(path.join(PROFILE_ROOT, "wl-render-"));
  const port = await freePort();
  const flags = [...BASE_FLAGS, ...GPU_FLAGS, ...extra, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`];
  const proc = spawn(CHROME, [...flags, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  proc.stderr.on("data", (d) => { stderr = (stderr + d.toString()).slice(-6000); });
  const b = { proc, profile, port, flags, stderr: () => stderr, cdp: null, version: null, gpu: null };
  try {
    let info = null;
    const t0 = Date.now();
    while (!info && Date.now() - t0 < 20000) {
      try { info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(150); }
    }
    if (!info) throw new Error(`Chrome did not open its debugging port\n${stderr}`);
    b.version = info.Browser;
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = targets.find((t) => t.type === "page");
    if (!page) throw new Error("no page target in Chrome");
    b.cdp = await connect(page.webSocketDebuggerUrl);
    await b.cdp.send("Page.enable");
    await b.cdp.send("Runtime.enable");
    await b.cdp.send("Log.enable");
    await b.cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
    log(`chrome ${b.version}, profile ${profile}`);
    return b;
  } catch (e) {
    await closeChrome(b);
    throw e;
  }
}

async function closeChrome(b) {
  if (!b) return;
  b.cdp?.close();
  if (b.proc && b.proc.exitCode === null) {
    b.proc.kill("SIGTERM");
    if (!(await exited(b.proc, 5000))) { b.proc.kill("SIGKILL"); await exited(b.proc, 3000); }
  }
  // Chrome can still be flushing into the profile for a moment after exit.
  for (let i = 0; i < 5; i++) {
    try { fs.rmSync(b.profile, { recursive: true, force: true }); break; } catch { await sleep(300); }
  }
}

const GPU_PROBE = `(async () => {
  const out = { userAgent: navigator.userAgent, webgl2: null, webgpu: null };
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    if (gl) {
      const e = gl.getExtension("WEBGL_debug_renderer_info");
      out.webgl2 = e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch (e) { out.webgl2 = "error: " + e.message; }
  try {
    if (!navigator.gpu) out.webgpu = "navigator.gpu missing";
    else {
      const ad = await navigator.gpu.requestAdapter();
      if (!ad) out.webgpu = "no adapter";
      else { const i = ad.info || {}; out.webgpu = { vendor: i.vendor, architecture: i.architecture, description: i.description, isFallbackAdapter: !!i.isFallbackAdapter, features: ad.features.size }; }
    }
  } catch (e) { out.webgpu = "error: " + e.message; }
  return out;
})()`;

// ---------------------------------------------------------------- one shot

const CANVASES = `[...document.querySelectorAll("canvas")].map((c) => {
  const r = c.getBoundingClientRect();
  const cs = getComputedStyle(c);
  return { w: c.width, h: c.height, x: r.x, y: r.y, cw: r.width, ch: r.height,
           visible: cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0 && r.width > 0 && r.height > 0 };
})`;

const TWO_RAF = "new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))";

function formatArgs(args = []) {
  return args.map((a) => a.value !== undefined ? (typeof a.value === "string" ? a.value : JSON.stringify(a.value))
    : a.unserializableValue ?? a.description ?? a.type).join(" ");
}

async function runShot(b, shot, ctx) {
  const t0 = Date.now();
  const deadline = t0 + shot.timeout;
  const left = () => Math.max(1, deadline - Date.now());
  const url = /^https?:\/\//.test(shot.url) ? shot.url : ctx.base + (shot.url.startsWith("/") ? "" : "/") + shot.url;
  const rec = {
    tool: "window-light/render.mjs", toolVersion: TOOL_VERSION,
    name: shot.name, url, base: ctx.base, baseSource: ctx.baseSource,
    requested: { w: shot.w, h: shot.h, dpr: shot.dpr, frames: shot.frames, settle: shot.settle, scheme: shot.scheme || null, reducedMotion: !!shot.reducedMotion, eval: shot.eval || null, expect: shot.expect || null, scene: shot.scene, sceneWait: shot.sceneWait, waitFor: shot.waitFor },
    png: null, image: null, canvas: null,
    timing: { startedAt: new Date(t0).toISOString() },
    scene: { present: false },
    console: { errors: 0, warnings: 0, exceptions: 0, log: null, first: [] },
    gpu: null, chrome: { version: b.version, flags: b.flags.filter((f) => !f.startsWith("--user-data-dir") && !f.startsWith("--remote-debugging-port")) },
    status: "ok", error: null, warnings: [],
  };
  const logs = [];
  const push = (level, kind, text, where) => {
    logs.push({ t: Date.now() - t0, level, kind, text, where });
    if (level === "error") { rec.console.errors++; if (rec.console.first.length < 5) rec.console.first.push(text.slice(0, 300)); }
    if (level === "warning") rec.console.warnings++;
  };
  const offs = [
    b.cdp.on("Runtime.consoleAPICalled", (p) => {
      const level = p.type === "error" || p.type === "assert" ? "error" : p.type === "warning" ? "warning" : null;
      if (!level) return;
      const f = p.stackTrace?.callFrames?.[0];
      push(level, "console", formatArgs(p.args), f ? `${f.url}:${f.lineNumber + 1}` : "");
    }),
    b.cdp.on("Runtime.exceptionThrown", (p) => {
      const d = p.exceptionDetails;
      rec.console.exceptions++;
      push("error", "exception", d.exception?.description || d.text, d.url ? `${d.url}:${d.lineNumber + 1}` : "");
    }),
    b.cdp.on("Log.entryAdded", ({ entry }) => {
      if (entry.level !== "error" && entry.level !== "warning") return;
      push(entry.level, `log.${entry.source}`, entry.text, entry.url || "");
    }),
  ];

  let captured = false;
  const capture = async () => {
    const r = await withTimeout(b.cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false }), 30000, "captureScreenshot");
    const buf = Buffer.from(r.data, "base64");
    fs.mkdirSync(path.dirname(shot.out), { recursive: true });
    fs.writeFileSync(shot.out, buf);
    captured = true;
    rec.timing.capturedMs = Date.now() - t0;
    const img = decodePng(buf);
    const want = { w: Math.round(shot.w * shot.dpr), h: Math.round(shot.h * shot.dpr) };
    rec.png = { path: shot.out, width: img.width, height: img.height, bytes: buf.length, sizeOk: img.width === want.w && img.height === want.h };
    if (!rec.png.sizeOk) rec.warnings.push(`PNG is ${img.width}x${img.height}, expected ${want.w}x${want.h}`);
    rec.image = imageStats(img);
    if (rec.image?.blank) rec.warnings.push("the frame is nearly one flat colour (blank or black?)");
    return img;
  };

  try {
    const { w, h, dpr } = shot;
    await b.cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile: false, screenWidth: w, screenHeight: h });
    await b.cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: shot.scheme || "" }, { name: "prefers-reduced-motion", value: shot.reducedMotion ? "reduce" : "" }] });

    // A full load every time: about:blank first, so even a same-path URL is never a same-document jump.
    const blank = b.cdp.once("Page.loadEventFired", 10000);
    await b.cdp.send("Page.navigate", { url: "about:blank" });
    await blank.catch(() => {});

    const loaded = b.cdp.once("Page.loadEventFired", left());
    const nav = await b.cdp.send("Page.navigate", { url });
    if (nav.errorText) throw new Error(`navigation to ${url} failed: ${nav.errorText}`);
    await loaded;
    rec.timing.loadMs = Date.now() - t0;
    rec.httpStatus = await evaluate(b.cdp, "performance.getEntriesByType('navigation')[0]?.responseStatus ?? null", 5000, "http status").catch(() => null);
    if (rec.httpStatus >= 400) rec.warnings.push(`the page answered HTTP ${rec.httpStatus}`);

    const u = new URL(url);
    if (u.pathname.startsWith("/window") && u.searchParams.get("capture") !== "1") {
      rec.warnings.push("a /window URL without capture=1: DOM chrome, random seeds and live time stay on");
    }

    const sceneWait = shot.sceneWait ?? (u.pathname.startsWith("/window") || u.searchParams.get("scene") === "window" ? 15000 : 2500);
    let hasScene = false;
    if (shot.scene !== "skip") {
      const tEnd = Date.now() + Math.min(sceneWait, left());
      while (Date.now() < tEnd) {
        // a page busy past 5 s (a cold module graph on a throttled machine: on battery
        // the first evaluate waited 20 s) is not yet a failure: keep looking until
        // sceneWait runs out
        let seen = false;
        try {
          seen = await evaluate(b.cdp, "!!window.__windowScene", 5000, "scene check");
        } catch (e) {
          if (!/timed out/.test(String(e?.message))) throw e;
        }
        if (seen) { hasScene = true; break; }
        await sleep(100);
      }
    }
    if (shot.scene === "require" && !hasScene) throw new Error(`no window.__windowScene after ${sceneWait} ms`);
    rec.scene.present = hasScene;

    if (hasScene) {
      rec.timing.sceneFoundMs = Date.now() - t0;
      await evaluate(b.cdp, `(async () => { const s = window.__windowScene; await (typeof s.ready === "function" ? s.ready() : s.ready); return true; })()`, left(), "__windowScene.ready");
      rec.timing.readyMs = Date.now() - t0;
      rec.scene.version = await evaluate(b.cdp, "String(window.__windowScene.version ?? '')", 5000);
      if (shot.eval) rec.evalResult = keepResult(await evaluate(b.cdp, shot.eval, left(), "--eval"));
      const tf = Date.now();
      await evaluate(b.cdp, `Promise.resolve(window.__windowScene.renderFrames(${Number(shot.frames)})).then(() => true)`, left(), `renderFrames(${shot.frames})`);
      rec.timing.framesMs = Date.now() - tf;
      rec.scene.framesRendered = Number(shot.frames);
    } else {
      if (shot.waitFor) {
        const sel = JSON.stringify(shot.waitFor);
        const probe = `(() => { const el = document.querySelector(${sel}); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })()`;
        const tw = Date.now();
        let found = false;
        while (!found && Date.now() < deadline) { found = await evaluate(b.cdp, probe, 5000, "--wait-for"); if (!found) await sleep(150); }
        if (!found) throw new TimeoutError(`--wait-for ${shot.waitFor}: nothing visible before the timeout`);
        rec.timing.waitForMs = Date.now() - tw;
      }
      await evaluate(b.cdp, "document.fonts ? document.fonts.ready.then(() => true) : true", Math.min(10000, left()), "document.fonts.ready").catch((e) => rec.warnings.push(e.message));
      if (shot.eval) rec.evalResult = keepResult(await evaluate(b.cdp, shot.eval, left(), "--eval"));
      await sleep(Math.min(shot.settle, left()));
    }
    await evaluate(b.cdp, TWO_RAF, Math.min(5000, left()), "two animation frames").catch((e) => rec.warnings.push(e.message));
    if (Date.now() >= deadline) throw new TimeoutError(`shot timed out after ${shot.timeout} ms`);
    await capture();
  } catch (e) {
    rec.status = e instanceof TimeoutError ? "timeout" : "error";
    rec.error = e.message;
    if (!captured) { try { await capture(); rec.warnings.push("captured after the failure, in whatever state the page was in"); } catch (e2) { rec.warnings.push(`capture after failure failed: ${e2.message}`); } }
  }

  // Everything below is read after the capture so it cannot disturb the frame.
  try {
    if (rec.scene.present) {
      rec.scene.stats = await evaluate(b.cdp, "Promise.resolve(window.__windowScene.stats ? window.__windowScene.stats() : null)", 5000, "stats()");
      rec.scene.params = await evaluate(b.cdp, `(() => { try { const s = JSON.stringify(window.__windowScene.params); return s && s.length < 200000 ? JSON.parse(s) : "(too large)"; } catch (e) { return "(not serialisable: " + e.message + ")"; } })()`, 5000, "params");
    }
  } catch (e) { rec.warnings.push(`scene stats: ${e.message}`); }
  // --expect: the params the shot must have carried (a silent HMR reload drops a patch)
  if (shot.expect) {
    const misses = checkExpect(rec.scene.params, shot.expect);
    rec.expect = { spec: shot.expect, misses };
    if (misses.length) {
      rec.status = "error";
      rec.error = (rec.error ? rec.error + "; " : "") + `--expect failed: ${misses.join("; ")}`;
    }
  }
  try {
    const canvases = await evaluate(b.cdp, CANVASES, 5000, "canvas list");
    rec.canvas = { count: canvases.length, list: canvases.slice(0, 12) };
    // Clip each canvas rect to the viewport; "largest" = most on-screen area. Its stats are of
    // the captured pixels inside that rect, so DOM drawn over the canvas is included.
    for (const c of canvases) {
      const ix = Math.max(0, Math.min(shot.w, c.x + c.cw) - Math.max(0, c.x));
      const iy = Math.max(0, Math.min(shot.h, c.y + c.ch) - Math.max(0, c.y));
      c.onScreen = { x: Math.max(0, c.x), y: Math.max(0, c.y), w: ix, h: iy };
      c.visibleFrac = c.cw * c.ch > 0 ? +((ix * iy) / (c.cw * c.ch)).toFixed(3) : 0;
    }
    const big = canvases.filter((c) => c.visible && c.onScreen.w * c.onScreen.h > 0)
      .sort((p, q) => q.onScreen.w * q.onScreen.h - p.onScreen.w * p.onScreen.h)[0];
    if (!canvases.some((c) => c.visible && c.onScreen.w * c.onScreen.h > 0) && canvases.length) rec.warnings.push("no canvas is visible on screen");
    if (big && rec.png && fs.existsSync(shot.out)) {
      const img = decodePng(fs.readFileSync(shot.out));
      const d = shot.dpr, o = big.onScreen;
      rec.canvas.largest = { ...big, stats: imageStats(img, { x: o.x * d, y: o.y * d, w: o.w * d, h: o.h * d }) };
      if (rec.canvas.largest.stats?.blank) rec.warnings.push("the largest on-screen canvas is nearly one flat colour in the capture (black WebGL/WebGPU frame?)");
    }
  } catch (e) { rec.warnings.push(`canvas stats: ${e.message}`); }
  try {
    if (!ctx.gpu) ctx.gpu = await evaluate(b.cdp, GPU_PROBE, 10000, "gpu probe");
    rec.gpu = ctx.gpu;
  } catch (e) { rec.warnings.push(`gpu probe: ${e.message}`); }

  for (const off of offs) off();
  rec.timing.finishedAt = new Date().toISOString();
  rec.timing.totalMs = Date.now() - t0;
  const stem = shot.out.replace(/\.png$/i, "");
  if (ctx.console) {
    rec.console.log = stem + ".log";
    const lines = logs.map((l) => `[+${l.t}ms] ${l.level} ${l.kind}: ${l.text}${l.where ? `  (${l.where})` : ""}`);
    fs.mkdirSync(path.dirname(rec.console.log), { recursive: true });
    fs.writeFileSync(rec.console.log, lines.join("\n") + (lines.length ? "\n" : ""));
  }
  if (rec.status !== "ok") rec.chromeStderrTail = b.stderr().split("\n").slice(-30).join("\n");
  fs.mkdirSync(path.dirname(stem), { recursive: true });
  fs.writeFileSync(stem + ".json", JSON.stringify(rec, null, 1));
  return rec;
}

// ---------------------------------------------------------------- --eval results, --expect

function keepResult(v) {
  try {
    const s = JSON.stringify(v);
    return s === undefined ? null : s.length < 50000 ? v : "(over 50 KB)";
  } catch { return "(not serialisable)"; }
}

// "a.b.c=value;d.e" -> the misses against a params snapshot (empty: all present)
function checkExpect(params, spec) {
  const items = (Array.isArray(spec) ? spec : String(spec).split(";")).map((x) => String(x).trim()).filter(Boolean);
  const misses = [];
  if (!params || typeof params !== "object") return items.map((it) => `${it} (no params in the sidecar)`);
  for (const it of items) {
    const eq = it.indexOf("=");
    const p = (eq > -1 ? it.slice(0, eq) : it).trim();
    const got = p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), params);
    if (got === undefined) { misses.push(`${p} is missing`); continue; }
    if (eq > -1) {
      const raw = it.slice(eq + 1).trim();
      let want = raw;
      try { want = JSON.parse(raw); } catch { /* a bare string */ }
      if (JSON.stringify(got) !== JSON.stringify(want)) misses.push(`${p} is ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
    }
  }
  return misses;
}

// ---------------------------------------------------------------- main

function num(v, d) { if (v === undefined || v === null || v === "") return d; const n = Number(v); if (!Number.isFinite(n)) throw new Usage(`not a number: ${v}`); return n; }

// Precedence for every per-shot key: the shot itself, then the command line, then the batch
// file's "defaults", then the built-in defaults.
const CLI_KEYS = { url: "url", w: "w", h: "h", dpr: "dpr", frames: "frames", settle: "settle", timeout: "timeout",
  scheme: "scheme", eval: "eval", scene: "scene", "scene-wait": "sceneWait", "wait-for": "waitFor",
  "reduced-motion": "reducedMotion", expect: "expect" };

function cliShotKeys(a) {
  const o = {};
  for (const [flag, key] of Object.entries(CLI_KEYS)) if (a[flag] !== undefined) o[key] = a[flag];
  return o;
}

function normaliseShot(s, a, i, outdir) {
  const shot = {
    name: s.name || `shot-${String(i + 1).padStart(2, "0")}`,
    url: s.url,
    w: num(s.w, 1440), h: num(s.h, 900), dpr: num(s.dpr, 1),
    frames: num(s.frames, 24), settle: num(s.settle, 1500),
    timeout: num(s.timeout, 90000),
    scheme: s.scheme ?? null, eval: s.eval ?? null,
    reducedMotion: !!s.reducedMotion, expect: s.expect ?? null,
    scene: s.scene ?? "auto",
    waitFor: s.waitFor ?? null,
    sceneWait: s.sceneWait !== undefined ? num(s.sceneWait) : undefined,
  };
  if (!shot.url) throw new Usage(`${shot.name}: no url`);
  if (!["auto", "require", "skip"].includes(shot.scene)) throw new Usage(`--scene must be auto, require or skip`);
  if (shot.scheme && !["light", "dark"].includes(shot.scheme)) throw new Usage(`--scheme must be light or dark`);
  if (!/^[a-zA-Z0-9._-]+$/.test(shot.name)) throw new Usage(`shot name "${shot.name}" must be letters, digits, dot, dash or underscore`);
  shot.out = path.resolve(s.out ? s.out : outdir ? path.join(outdir, `${shot.name}.png`) : a.out ? a.out : path.join(TOOL_DIR, "runs", "adhoc", `${slug(shot.url)}-${shot.w}x${shot.h}@${shot.dpr}-${stamp()}.png`));
  return shot;
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.help) { process.stdout.write(USAGE); return 0; }
  const quiet = !!a.quiet;
  const log = (s) => { if (!quiet) console.log(s); };

  let shots = [];
  if (!a.probe) {
    if (a.batch) {
      const raw = JSON.parse(fs.readFileSync(a.batch, "utf8"));
      const list = Array.isArray(raw) ? raw : raw.shots;
      const defaults = Array.isArray(raw) ? {} : raw.defaults || {};
      if (!Array.isArray(list) || !list.length) throw new Usage(`${a.batch}: expected an array of shots (or {defaults, shots})`);
      const outdir = path.resolve(a.outdir || a.out || path.join(TOOL_DIR, "runs", path.basename(a.batch).replace(/\.json$/i, "")));
      shots = list.map((s, i) => normaliseShot({ ...defaults, ...cliShotKeys(a), ...s }, a, i, outdir));
      const names = new Set();
      for (const s of shots) { if (names.has(s.name)) throw new Usage(`duplicate shot name ${s.name}`); names.add(s.name); }
    } else {
      if (!a.url) throw new Usage("--url, --batch or --probe is required");
      shots = [normaliseShot({ ...cliShotKeys(a), name: a.name || (a.out ? path.basename(a.out).replace(/\.png$/i, "") : slug(a.url)) }, a, 0, null)];
    }
  }

  const extra = a.flags ? String(a.flags).split(/\s+/).filter(Boolean) : [];
  let server = null, b = null;
  const cleanup = async () => { await closeChrome(b); b = null; if (server) { await server.stop(); server = null; } };
  const onSignal = (sig) => { cleanup().finally(() => process.exit(sig === "SIGINT" ? 130 : 143)); };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  try {
    if (a.probe) {
      b = await launchChrome(extra, log);
      const loaded = b.cdp.once("Page.loadEventFired", 10000);
      await b.cdp.send("Page.navigate", { url: `http://127.0.0.1:${b.port}/json/version` });
      await loaded.catch(() => {});
      const gpu = await evaluate(b.cdp, GPU_PROBE, 15000, "gpu probe");
      console.log(JSON.stringify({ chrome: b.version, flags: b.flags.filter((f) => !f.startsWith("--user-data-dir") && !f.startsWith("--remote-debugging-port")), gpu }, null, 2));
      return 0;
    }

    server = await resolveBase(a, log);
    b = await launchChrome(extra, log);
    const ctx = { base: server.base, baseSource: server.source, console: !!a.console, gpu: null };
    const results = [];
    for (const shot of shots) {
      const r = await runShot(b, shot, ctx);
      results.push(r);
      const sc = r.scene.present ? `scene ${r.scene.stats?.backend || "?"} v${r.scene.version || "?"} frames ${r.scene.framesRendered ?? 0}` : "no scene";
      const L = r.canvas?.largest;
      const cv = L?.stats ? ` canvas ${Math.round(L.onScreen.w)}x${Math.round(L.onScreen.h)} std ${L.stats.stdLuma}` : "";
      console.log(`${r.status.padEnd(7)} ${shot.name}  ${r.png ? `${r.png.width}x${r.png.height}` : "no png"}  ${sc}  errors ${r.console.errors}  warnings ${r.console.warnings}${cv}  ${(r.timing.totalMs / 1000).toFixed(1)}s  -> ${shot.out}`);
      if (r.error) console.log(`        error: ${r.error}`);
      for (const w of r.warnings) console.log(`        warn: ${w}`);
    }
    const bad = results.filter((r) => r.status !== "ok" || (a.strict && r.console.errors > 0));
    return bad.length ? 1 : 0;
  } finally {
    await cleanup();
  }
}

main().then((code) => process.exit(code), (e) => {
  if (e instanceof Usage) { console.error(`render.mjs: ${e.message}\n\n${USAGE}`); process.exit(2); }
  console.error(`render.mjs: ${e.stack || e.message}`);
  process.exit(1);
});
