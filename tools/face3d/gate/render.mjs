// render.mjs: render the matrix through the production rig into tools/face3d/gate/cache/<face>/ (PNGs + meta.json).
// Incremental: a face re-renders only when its input hash changed (shared face code + its own assets + its preset).
// usage: node render.mjs [--base http://127.0.0.1:5218] [--faces a,b] [--fast] [--force] [--fixes frame,lid]
import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { encode } from "./png.mjs"; import { cases, FAST } from "./matrix.mjs";
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, "../../..");
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : (process.argv[i + 1]?.startsWith("--") || i + 1 >= process.argv.length) ? true : process.argv[i + 1]; };
// the cache lives outside the repo (vite watches the repo: html or js writes inside it reload the page mid-run)
export const CACHE = path.resolve(arg("cache", path.join(process.env.HOME, ".cache/face-gate/cache")));
const base = arg("base", "http://127.0.0.1:5218"), only = arg("faces", null), fast = !!arg("fast", false), force = !!arg("force", false), fixes = arg("fixes", null);
const W = 802, H = 862;

const hashFiles = (files) => { const h = crypto.createHash("sha1"); for (const f of files.sort()) { try { h.update(f); h.update(fs.readFileSync(f)); } catch {} } return h.digest("hex").slice(0, 16); };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const codeHash = hashFiles([...walk(path.join(root, "src/figures/faces/morph")).filter((f) => /\.(js|json)$/.test(f)), ...walk(path.join(root, "src/figures/faces/features")).filter((f) => !/\.(md|jsx)$/.test(f)), path.join(root, "src/figures/faces/faceSkins.js"), path.join(here, "gate-lib.js"), path.join(here, "matrix.mjs")]);

fs.mkdirSync(CACHE, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
const errs = []; page.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 300)));
await page.goto(base + "/tools/face3d/gate/gate.html", { timeout: 180000 });
await page.waitForFunction(() => window.GATE_READY, null, { timeout: 120000 });
const faces = await page.evaluate(() => window.G.faces());
const emotes = await page.evaluate(() => window.G.emoteNames), peaks = await page.evaluate(() => window.G.emotePeak);
let matrix = cases(emotes, peaks);
if (fast) matrix = Object.fromEntries(FAST.map((k) => [k, matrix[k]]));
let fixObj = null;
if (fixes && fixes !== true) {
  fixObj = Object.fromEntries(fixes.split(",").map((k) => [k, true]));
  if (fixObj.frame) { // targets: the family bases' skin boxes from the baseline cache (same definition as the framing check)
    const { loadCase, bbox } = await import("./imgops.mjs"); fixObj.frame = { targets: {} };
    for (const b of ["clay", "plast"]) { const img = loadCase(path.resolve(arg("baseline", path.join(process.env.HOME, ".cache/face-gate/cache")), b), "rest_front"); if (!img) continue;
      const m = new Uint8Array(W * H); for (let i = 0; i < m.length; i++) m[i] = (img.id[i] === 1 || img.id[i] === 8) && img.rgba[i * 4 + 3] > 128 ? 1 : 0; fixObj.frame.targets[b] = bbox(m, W, H); }
  }
  await page.evaluate((f) => window.G.setFixes(f), fixObj);
}
const t0 = Date.now(); let done = 0, skipped = 0;
for (const f of faces) {
  // (a vite HMR reload while we edit the lib drops window.G: come back to it)
  if (!(await page.evaluate(() => !!window.G).catch(() => false))) { await page.goto(base + "/tools/face3d/gate/gate.html"); await page.waitForFunction(() => window.GATE_READY, null, { timeout: 120000 }); if (fixes && fixes !== true) await page.evaluate((f) => window.G.setFixes(f), fixObj); }
  if (only && !only.split(",").includes(f.id)) continue;
  if (arg("skin", null) && f.skin !== arg("skin", null)) continue;
  const assets = await page.evaluate((s) => window.G.assetsOf(s), f.skin);
  const presetStr = f.preset ? await page.evaluate((p) => window.G.presetJson(p), f.preset) : "";
  const dir = path.join(CACHE, f.id.replace(/[^\w.-]/g, "_"));
  const hash = codeHash + hashFiles(assets.map((a) => path.join(root, "public", a))) + crypto.createHash("sha1").update(presetStr + (fixes || "") + JSON.stringify(Object.keys(matrix))).digest("hex").slice(0, 8);
  const metaP = path.join(dir, "meta.json");
  if (!force && fs.existsSync(metaP) && JSON.parse(fs.readFileSync(metaP, "utf8")).hash === hash) { skipped++; continue; }
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const meta = { id: f.id, skin: f.skin, preset: f.preset, hash, cases: Object.keys(matrix), glErrors: [], logs: [] };
  for (let attempt = 0; attempt < 3; attempt++) {
    // a fresh page per attempt: software GL loses its context after long runs (CONTEXT_LOST_WEBGL 37442), which blanks every later render
    if (true) { await page.goto(base + "/tools/face3d/gate/gate.html"); await page.waitForFunction(() => window.GATE_READY, null, { timeout: 120000 }); if (fixObj) await page.evaluate((f) => window.G.setFixes(f), fixObj); }
    meta.fatal = null; meta.logs = []; meta.glErrors = [];
  try {
    meta.load = await page.evaluate((id) => window.G.load(id), f.id); meta.declaredSkinLuma = meta.load.declaredSkinLuma;
    meta.logs.push(...await page.evaluate(() => window.G.takeLogs()));
    for (const [name, c] of Object.entries(matrix)) {
      const r = await page.evaluate(([c]) => window.G.shot(c, !c.noIds), [c]);
      fs.writeFileSync(path.join(dir, name + ".png"), encode(Buffer.from(r.rgba, "base64"), W, H));
      if (r.ids) fs.writeFileSync(path.join(dir, name + ".ids.png"), encode(Buffer.from(r.ids, "base64"), W, H));
      if (r.glError) meta.glErrors.push(name + ":" + r.glError);
    }
    meta.logs.push(...await page.evaluate(() => window.G.takeLogs()));
  } catch (e) { meta.fatal = String(e.message).slice(0, 400); }
    if (!meta.fatal && meta.glErrors.some((e) => /:37442$/.test(e))) meta.fatal = "webgl context lost";
    if (!meta.fatal || !/context lost|context was destroyed|window\.G|undefined/.test(meta.fatal)) break;
  }
  fs.writeFileSync(metaP, JSON.stringify(meta));
  done++; console.log(`rendered ${f.id} (${((Date.now() - t0) / 1000).toFixed(0)}s)${meta.fatal ? " FATAL " + meta.fatal : ""}`);
}
console.log(`render: ${done} rendered, ${skipped} cached, ${errs.length} page errors`);
if (errs.length) console.log(errs.slice(0, 5).join("\n"));
await browser.close();
