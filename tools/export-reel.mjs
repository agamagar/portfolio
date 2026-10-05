#!/usr/bin/env node
// Reel -> MP4 export. Renders a Presentation-Mode reel frame by frame in the
// system Chrome (house pattern, no puppeteer) and muxes the frames with ffmpeg.
//
//   node tools/export-reel.mjs                          # brandPage, 1080p30
//   node tools/export-reel.mjs --reel brandPage --fps 60
//   node tools/export-reel.mjs --scale 3 --out exports/video/brand-page-4k.mp4
//   node tools/export-reel.mjs --no-build               # reuse the existing dist/
//   node tools/export-reel.mjs --gif                    # also write a GIF beside it
//
// Why frame-stepping and not a screen recording: the reel's motion is an analytic
// function of one clock (BrandPageReel's `frameAt`), exposed on the export route
// as `window.__reel.seek(ms)`. So each frame is rendered at its exact timestamp,
// which means no dropped frames, no capture jitter, and a file that is identical
// every run. A CSS-transition figure could not be exported this way.
//
// How it works:
// 1. `vite build` (unless --no-build), then `vite preview` serves dist/.
// 2. Chrome --headless=new with a remote debugging port; one CDP session over
//    Node's built-in WebSocket (Node 22+), so there is no browser-driver dep.
// 3. Navigate to /reel-export?reel=<name>, size the viewport to the reel's design
//    frame at `--scale` device pixels, wait for fonts + the page image to decode.
// 4. For each frame: Runtime.evaluate("__reel.seek(t)") then Page.captureScreenshot,
//    piped straight into ffmpeg. Nothing is written to disk but the MP4 itself: a
//    40s 1080p loop is around 1200 PNGs, which is roughly 2GB of frames if they
//    are staged on disk first, and that filled the volume the first time round.
// 5. ffmpeg -> H.264 MP4 (yuv420p, so it plays everywhere including Keynote).
//
// The clip runs exactly one loop of the reel and starts on the same instant it
// ends, so it loops seamlessly when set to repeat.

import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, renameSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import net from "node:net";
import os from "node:os";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// The local binary, not `npx vite`: npx resolution alone can take longer than
// the old 20s server wait, which made --no-build fail ("did not come up") purely
// because the preceding build was no longer there to warm it.
const VITE = path.join(ROOT, "node_modules", ".bin", "vite");
const DESIGN = { w: 960, h: 600 };   // the reel's design frame

const args = process.argv.slice(2);
const flag = (f) => { const i = args.indexOf(f); return i === -1 ? false : (args.splice(i, 1), true); };
const opt = (f, d) => { const i = args.indexOf(f); return i === -1 ? d : args.splice(i, 2)[1]; };

const noBuild = flag("--no-build");
const wantGif = flag("--gif");
const keepFrames = flag("--keep-frames");
const reel = opt("--reel", "brandPage");
const fps = Number(opt("--fps", "30"));
const scale = Number(opt("--scale", "2"));                 // 2 -> 1920x1200
const crf = opt("--crf", "17");
const out = path.resolve(ROOT, opt("--out", `exports/video/${kebab(reel)}.mp4`));

function kebab(s) { return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(); }

const freePort = () =>
  new Promise((res) => {
    const s = net.createServer();
    s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); });
  });

const waitFor = async (url, ms = 20000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`${url} did not come up in ${ms}ms`);
};

// kill() only sends the signal. Resolves once the child has actually gone, so a
// caller can touch the files it was holding open. Resolves anyway after `ms` so
// cleanup can never hang the process.
const exited = (child, ms = 5000) =>
  new Promise((res) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) return res();
    const t = setTimeout(res, ms);
    child.once("exit", () => { clearTimeout(t); res(); });
  });

// ── one writer per output file ───────────────────────────────────────────────
// Two runs started a minute apart both default to exports/video/brand-page.mp4,
// and because each one spawns its own ffmpeg the two write the same path at the
// same time. The result still probes as a valid MP4 (correct duration, correct
// frame count) and only falls apart on decode ("Error splitting the input into
// NAL units"), so a corrupt export is easy to ship without noticing. The lock
// makes the second run fail immediately instead, and the frames are encoded to a
// temp file that is renamed over the target only after ffmpeg exits 0, so an
// interrupted run leaves the previous good MP4 untouched.
function acquireLock(file) {
  const lock = file + ".lock";
  try {
    writeFileSync(lock, JSON.stringify({ pid: process.pid }), { flag: "wx" });
    return lock;
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
    let held = null;
    try { held = JSON.parse(readFileSync(lock, "utf8")).pid; } catch {}
    // A run that was killed leaves its lock behind; only refuse to a live pid.
    if (held != null) {
      try { process.kill(held, 0); }
      catch { rmSync(lock, { force: true }); return acquireLock(file); }
      throw new Error(
        `another export (pid ${held}) is already writing ${path.basename(file)}.\n` +
        `Wait for it, or pass --out to write somewhere else.`
      );
    }
    rmSync(lock, { force: true });
    return acquireLock(file);
  }
}

// ── the smallest CDP client that does the job ────────────────────────────────
async function connect(port) {
  await waitFor(`http://127.0.0.1:${port}/json/version`);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("no page target in Chrome");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", () => rej(new Error("CDP socket failed")), { once: true });
  });
  let id = 0;
  const pending = new Map();
  const events = new Map();
  ws.addEventListener("message", (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id != null && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method && events.has(msg.method)) {
      events.get(msg.method).forEach((fn) => fn(msg.params));
    }
  });
  return {
    send: (method, params = {}) =>
      new Promise((res, rej) => {
        const n = ++id;
        pending.set(n, { res, rej });
        ws.send(JSON.stringify({ id: n, method, params }));
      }),
    on: (method, fn) => {
      if (!events.has(method)) events.set(method, []);
      events.get(method).push(fn);
    },
    close: () => ws.close(),
  };
}

// Evaluate an expression, awaiting it if it returns a promise, and unwrap it.
async function evaluate(cdp, expression) {
  const r = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " :: " + expression);
  return r.result.value;
}

const main = async () => {
  if (!existsSync(CHROME)) throw new Error("Chrome not found at " + CHROME);
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); }
  catch { throw new Error("ffmpeg not on PATH (brew install ffmpeg)"); }

  mkdirSync(path.dirname(out), { recursive: true });
  const lock = acquireLock(out);
  const tmpOut = out.replace(/\.mp4$/, "") + `.partial-${process.pid}.mp4`;
  // Only materialised with --keep-frames (for pulling stills); the normal path
  // pipes every frame into ffmpeg and writes nothing but the MP4.
  const frameDir = path.join(path.dirname(out), `frames-${kebab(reel)}`);
  if (keepFrames) {
    rmSync(frameDir, { recursive: true, force: true });
    mkdirSync(frameDir, { recursive: true });
  }

  if (!noBuild) {
    console.log("building...");
    execFileSync(VITE, ["build"], { cwd: ROOT, stdio: "inherit" });
  }

  const port = await freePort();
  const cdpPort = await freePort();
  console.log(`serving dist/ on :${port}`);
  const server = spawn(VITE, ["preview", "--port", String(port), "--strictPort"], {
    cwd: ROOT,
    stdio: "ignore",
  });

  const profile = path.join(os.tmpdir(), `reel-chrome-${process.pid}`);
  let chrome, cdp;
  try {
    await waitFor(`http://localhost:${port}/`, 60000);

    chrome = spawn(CHROME, [
      "--headless=new",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--no-first-run",
      "--disable-extensions",
      // Deterministic capture: never let the compositor hand back a half-drawn
      // frame, and never throttle the background renderer we are stepping.
      "--run-all-compositor-stages-before-draw",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--force-color-profile=srgb",
      "about:blank",
    ], { stdio: "ignore" });

    cdp = await connect(cdpPort);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: DESIGN.w,
      height: DESIGN.h,
      deviceScaleFactor: scale,
      mobile: false,
    });

    const url = `http://localhost:${port}/reel-export?reel=${encodeURIComponent(reel)}`;
    console.log(`rendering ${reel} at ${DESIGN.w * scale}x${DESIGN.h * scale}, ${fps}fps`);
    const loaded = new Promise((res) => cdp.on("Page.loadEventFired", res));
    await cdp.send("Page.navigate", { url });
    await loaded;

    // Wait for the reel to register its clock, then for fonts + the page image.
    const t0 = Date.now();
    while (!(await evaluate(cdp, "!!window.__reel"))) {
      if (Date.now() - t0 > 15000) throw new Error(`no window.__reel on ${url} (is "${reel}" registered?)`);
      await new Promise((r) => setTimeout(r, 120));
    }
    await evaluate(cdp, "window.__reel.ready()");
    const duration = await evaluate(cdp, "window.__reel.duration");
    const frames = Math.round((duration / 1000) * fps);
    console.log(`  loop is ${(duration / 1000).toFixed(2)}s -> ${frames} frames`);

    // ffmpeg reads the PNG stream on stdin, so no frame ever touches the disk.
    const ff = spawn("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-vcodec", "png", "-framerate", String(fps),
      "-i", "-",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", String(crf),
      "-pix_fmt", "yuv420p",        // required for QuickTime / Keynote / Slides
      "-movflags", "+faststart",
      tmpOut,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const ffDone = new Promise((res, rej) => {
      ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
      ff.on("error", rej);
    });

    for (let f = 0; f < frames; f++) {
      await evaluate(cdp, `window.__reel.seek(${((f / fps) * 1000).toFixed(3)})`);
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
        fromSurface: true,
      });
      const buf = Buffer.from(shot.data, "base64");
      if (keepFrames) writeFileSync(path.join(frameDir, `f${String(f).padStart(5, "0")}.png`), buf);
      if (!ff.stdin.write(buf)) {
        await new Promise((res) => ff.stdin.once("drain", res));
      }
      if (f % 30 === 0 || f === frames - 1) process.stdout.write(`\r  frame ${f + 1}/${frames}`);
    }
    process.stdout.write("\n");

    console.log("encoding...");
    ff.stdin.end();
    await ffDone;
    renameSync(tmpOut, out);          // only now does the old export get replaced
    console.log(`-> ${path.relative(ROOT, out)}`);

    if (wantGif) {
      const gif = out.replace(/\.mp4$/, ".gif");
      const palette = path.join(path.dirname(out), `.palette-${kebab(reel)}.png`);
      const vf = "fps=20,scale=960:-1:flags=lanczos";
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", out, "-vf", `${vf},palettegen=stats_mode=diff`, palette], { stdio: "inherit" });
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", out, "-i", palette, "-lavfi", `${vf} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3`, gif], { stdio: "inherit" });
      rmSync(palette, { force: true });
      console.log(`-> ${path.relative(ROOT, gif)}`);
    }
  } finally {
    try { cdp?.close(); } catch {}
    chrome?.kill();
    server.kill();
    // Chrome's --user-data-dir is ~100MB a run and it is ours to clean up:
    // killing the process leaves the profile behind, and four stale ones had
    // already accumulated in TMPDIR.
    //
    // But kill() above only signals. Chrome goes on writing its profile while we
    // unlink it, so this threw ENOTEMPTY straight out of the finally block: the
    // two cleanups below never ran, every run leaked its .lock, and a completed
    // export exited 1. Wait for the process to actually go, retry the unlink for
    // the tail of it, and treat a profile we cannot delete as what it is:
    // wasted disk, not a failed export.
    await exited(chrome);
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    } catch (e) {
      console.warn(`could not remove temp profile ${profile} (${e.code || e.message})`);
    }
    rmSync(tmpOut, { force: true });
    rmSync(lock, { force: true });
    if (keepFrames) console.log(`frames kept in ${path.relative(ROOT, frameDir)}`);
  }
};

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
