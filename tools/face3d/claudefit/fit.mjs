// fit.mjs: Claude as the critic in the clay-head fit loop. Renders the three.js clay head (face-lab's window.__clay) at the turnaround's views,
// shows Claude each render NEXT TO its reference cell, asks for JSON parameter deltas against a strict rubric, clamps and applies them,
// re-renders, scores (IoU / SSIM / LPIPS via tools/face3d/asset/turn_compare.py) and logs every step. The API key comes ONLY from the environment
// (ANTHROPIC_API_KEY, loaded from a git-ignored .env.local at the repo root); it is never printed, logged or committed.
//   node tools/face3d/claudefit/fit.mjs [--base http://127.0.0.1:5173] [--iters 6] [--views 1,7,2] [--dry] [--params start.json]
// --dry: skips the API call (uses no deltas) to check the render / compare / log pipeline. Cost cap: --max-calls (default 8), images at 360 px.
import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : (i + 1 >= process.argv.length || process.argv[i + 1].startsWith("--")) ? true : process.argv[i + 1]; };
const root = path.resolve(new URL("../../..", import.meta.url).pathname), here = path.dirname(new URL(import.meta.url).pathname);
const base = arg("base", "http://127.0.0.1:5173"), iters = +arg("iters", 6), views = String(arg("views", "1,7,2")).split(",").map(Number), dry = !!arg("dry", false), maxCalls = +arg("max-calls", 8), MODEL = arg("model", "claude-opus-5-5");
const PY = process.env.PY || "/opt/anaconda3/bin/python3";
// .env.local: KEY=VALUE lines; only ANTHROPIC_API_KEY is read
let KEY = process.env.ANTHROPIC_API_KEY || ""; try { for (const l of fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) { const m = l.match(/^\s*ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$/); if (m && !KEY) KEY = m[1].replace(/^["']|["']$/g, ""); } } catch {}
if (!KEY && !dry) { console.error("ANTHROPIC_API_KEY is not set (environment or a git-ignored .env.local). Stopping: Agam needs to add it. (Use --dry to test the pipeline without it.)"); process.exit(2); }
const out = path.join(here, "runs", new Date().toISOString().replace(/[:.]/g, "-")); fs.mkdirSync(out, { recursive: true });
const log = (o) => fs.appendFileSync(path.join(out, "log.jsonl"), JSON.stringify(o) + "\n");
// the parameters Claude may change, with hard limits (path -> [min, max]); anything else in its reply is ignored
const LIM = { "head.cranium.r.0": [0.7, 1.1], "head.cranium.r.1": [0.65, 1.1], "head.cranium.r.2": [0.7, 1.1], "head.cranium.c.1": [0.1, 0.6], "head.jaw.r.0": [0.6, 1.0], "head.jaw.r.1": [0.4, 0.9], "head.jaw.r.2": [0.6, 1.0], "head.jaw.c.1": [-0.7, -0.15], "head.blend": [0.2, 0.9], "head.taper": [0, 0.3], "head.cheek.r": [0.2, 0.6], "head.cheek.x": [0.3, 0.7], "head.cheek.y": [-0.5, -0.1],
  "ear.x": [0.85, 1.25], "ear.y": [-0.2, 0.2], "ear.z": [-0.3, 0.1], "ear.ry": [0.3, 0.7], "ear.rz": [0.25, 0.55], "ear.rx": [0.06, 0.2], "ear.toeIn": [0, 45], "ear.bowl": [0.2, 1.5], "ear.fold": [0.3, 2], "ear.lobe": [0.5, 1.8],
  "nose.bridgeY": [0.1, 0.45], "nose.tipY": [-0.5, -0.1], "nose.tipZ": [0.1, 0.5], "nose.r0": [0.04, 0.14], "nose.r1": [0.08, 0.26], "nose.width": [0.6, 1.5],
  "eye.x": [0.28, 0.55], "eye.y": [-0.05, 0.4], "eye.r": [0.06, 0.15], "brow.x": [0.28, 0.55], "brow.y": [0.3, 0.75], "brow.len": [0.25, 0.6], "brow.thick": [0.04, 0.1], "brow.arch": [0, 0.15], "brow.tilt": [-15, 25],
  "mouth.y": [-0.85, -0.45], "mouth.width": [0.3, 0.8], "mouth.curve": [0, 1.4], "mouth.depth": [0.02, 0.09],
  "hair.cap.thick": [0.03, 0.14], "hair.swooshBlend": [0.15, 0.5], "hair.edgeBlend": [0.02, 0.15] };
for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { const k = ["cx", "cy", "cz", "rx", "ry", "rz"][j]; LIM[`hair.swoosh.${i}.${j}`] = j < 3 ? [-1.6, 1.8] : [0.15, 0.9]; }
const getp = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const setp = (o, p, v) => { const ks = p.split("."); let a = o; for (let i = 0; i < ks.length - 1; i++) a = a[ks[i]]; a[ks[ks.length - 1]] = v; };
const RUBRIC = `You are the art critic in an optimisation loop that sculpts a soft plasticine ("clay") character head in three.js to match a reference. For each view you get TWO images side by side: LEFT = the reference (the target look), RIGHT = our current render, at the same camera angle. Judge only the head's SHAPE and features, not colour or lighting. Rubric: (1) head proportions: a broad soft block, big rounded cranium, full rounded jaw and cheeks; (2) ears: large, round, with a C-shaped inner fold, set at the middle of the head; (3) nose: one soft rounded form that bulges off the face, long bridge, rounded tip; (4) brows: thick rounded pills standing proud of the forehead; (5) eyes: small glossy beads, set low-ish and wide; (6) mouth: a carved smile arc with soft ends; (7) hair mass: one big smooth swoosh up and to the side with a clean hairline, hugging the head down the back and sides; (8) material: matte, soft. Reply with ONLY a JSON object: {"scores": {"proportions": 0-10, "ears": 0-10, "nose": 0-10, "brows": 0-10, "eyes": 0-10, "mouth": 0-10, "hair": 0-10}, "deltas": {"<param path>": <new numeric value>, ...}, "reasons": {"<param path>": "short reason"}}. Use ONLY these param paths (current values are given); change at most 8 per round, in small steps (about 10 to 25 percent), and only where the images show a clear difference.`;
const png = (p) => fs.readFileSync(p).toString("base64");
async function callClaude(content) {
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: RUBRIC, messages: [{ role: "user", content }] }) });
  const j = await r.json(); if (!r.ok) throw new Error(`API ${r.status}: ${JSON.stringify(j).slice(0, 300).replace(KEY, "***")}`);
  return { text: j.content.map((c) => c.text || "").join(""), usage: j.usage };
}
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(base + "/face-lab", { timeout: 180000, waitUntil: "domcontentloaded" }); await page.waitForFunction(() => window.__clay, null, { timeout: 240000 }); await page.waitForTimeout(1500);
const fit = JSON.parse(fs.readFileSync(path.join(root, "tools/face3d/asset/turn_fit.json")));
let over = arg("params", null) ? JSON.parse(fs.readFileSync(arg("params"), "utf8")) : {}; let calls = 0, best = { score: -1 };
const DEFAULT = await page.evaluate(async () => (await import("/src/figures/faces/clay/params.js")).DEFAULT);
const merge = (b, o) => { const r = JSON.parse(JSON.stringify(b)); const m = (x, y) => { for (const k of Object.keys(y)) x[k] = y[k] && typeof y[k] === "object" && !Array.isArray(y[k]) ? m(x[k] || {}, y[k]) : y[k]; return x; }; return m(r, o); };
for (let it = 0; it <= iters; it++) {
  const P = merge(DEFAULT, over); await page.evaluate(([o, n]) => window.__clay.set(o, n), [over, 96]);
  const dir = path.join(out, `it${it}`); fs.mkdirSync(dir, { recursive: true });
  for (const i of views) { const v = fit.views[i], d = await page.evaluate(([y, p]) => window.__clay.render(y, p), [v.yaw, -v.pitch]); fs.writeFileSync(path.join(dir, `v_${String(i).padStart(2, "0")}.png`), Buffer.from(d.split(",")[1], "base64")); }
  const cmp = path.join(dir, "compare.png"); let scoreTxt = "";
  try { scoreTxt = execFileSync(PY, [path.join(root, "tools/face3d/asset/turn_compare.py"), dir, cmp, views.join(",")], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch (e) { scoreTxt = String(e.stdout || e.message); }
  const mean = (scoreTxt.match(/mean: IoU ([\d.]+) SSIM ([\d.]+) LPIPS ([\d.]+)/) || []).slice(1).map(Number); const sc = mean.length ? mean[0] + mean[1] - mean[2] : 0;
  log({ it, mean, calls }); console.log(`it ${it}: IoU ${mean[0]} SSIM ${mean[1]} LPIPS ${mean[2]}`);
  if (sc > best.score) { best = { score: sc, it, over: JSON.parse(JSON.stringify(over)) }; fs.writeFileSync(path.join(out, "best.json"), JSON.stringify(best.over, null, 1)); }
  if (it === iters || dry || calls >= maxCalls) break;
  // one side-by-side image per view (the compare sheet is 2 views per row: cut it per view), then ask Claude
  const content = [{ type: "text", text: `Iteration ${it}. Numeric scores so far (mean over views): IoU ${mean[0]}, SSIM ${mean[1]}, LPIPS ${mean[2]} (lower LPIPS is closer). Views, in order, left=reference right=ours:` }];
  content.push({ type: "image", source: { type: "base64", media_type: "image/png", data: png(cmp) } });
  const cur = {}; for (const k of Object.keys(LIM)) { const v = getp(P, k.replace(/\.(\d+)$/, (m, d) => "." + d).replace(/hair\.swoosh\.(\d+)\.(\d+)/, "hair.swoosh.$1.$2")); if (v !== undefined) cur[k] = +(+v).toFixed(3); }
  content.push({ type: "text", text: "Current parameter values (allowed paths):\n" + JSON.stringify(cur) + "\nReply with the JSON only." });
  let rep; try { rep = await callClaude(content); calls++; } catch (e) { console.error("API error:", String(e.message)); log({ it, error: String(e.message) }); break; }
  fs.writeFileSync(path.join(dir, "claude.txt"), rep.text); log({ it, usage: rep.usage });
  let j; try { j = JSON.parse(rep.text.slice(rep.text.indexOf("{"), rep.text.lastIndexOf("}") + 1)); } catch { console.error("unparseable reply; stopping"); break; }
  let applied = 0; for (const [k, v] of Object.entries(j.deltas || {}).slice(0, 8)) { if (!LIM[k] || typeof v !== "number" || !isFinite(v)) continue; const val = Math.min(LIM[k][1], Math.max(LIM[k][0], v)); const ks = k.split("."); let tgt = over; for (let q = 0; q < ks.length - 1; q++) { const key = ks[q]; if (tgt[key] === undefined) tgt[key] = Array.isArray(getp(DEFAULT, ks.slice(0, q + 1).join("."))) ? JSON.parse(JSON.stringify(getp(DEFAULT, ks.slice(0, q + 1).join(".")))) : {}; tgt = tgt[key]; } tgt[ks[ks.length - 1]] = val; applied++; }
  log({ it, scores: j.scores, applied, reasons: j.reasons }); console.log("  claude scores", JSON.stringify(j.scores), "applied", applied);
}
console.log("best iteration", best.it, "-> " + path.join(out, "best.json")); await browser.close();
