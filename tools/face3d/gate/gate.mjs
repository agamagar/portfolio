// gate.mjs: certify every face. Reads the render cache, runs the checks, writes report/ (index.html, summary.json, crops/)
// and exits non-zero if any face fails.   usage: node gate.mjs [--cache cache] [--out report] [--fast] [--faces a,b] [--raw]
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
import { loadCase, writeCrop, bbox, W, H, encode, boxDown, composite } from "./imgops.mjs"; import { CHECKS, eyeAnchor } from "./checks.mjs"; import { writeReport } from "./report.mjs";
const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : (i + 1 >= process.argv.length || process.argv[i + 1].startsWith("--")) ? true : process.argv[i + 1]; };
const cache = path.resolve(arg("cache", path.join(process.env.HOME, ".cache/face-gate/cache"))), out = path.resolve(arg("out", path.join(here, "report"))), fast = !!arg("fast", false), only = arg("faces", null);
const TH = JSON.parse(fs.readFileSync(path.join(here, "thresholds.json"), "utf8"));
const FAST_CHECKS = ["holes", "blackpix", "symmetry", "lidcover", "framing", "edges83", "errors"];
const dirs = fs.readdirSync(cache).filter((d) => fs.existsSync(path.join(cache, d, "meta.json")) && (!only || only.split(",").some((o) => d === o.replace(/[^\w.-]/g, "_"))));
const metas = Object.fromEntries(dirs.map((d) => [d, JSON.parse(fs.readFileSync(path.join(cache, d, "meta.json"), "utf8"))]));
fs.rmSync(path.join(out, "crops"), { recursive: true, force: true }); fs.mkdirSync(path.join(out, "crops"), { recursive: true }); fs.mkdirSync(path.join(out, "thumbs"), { recursive: true });
const grade = (check, face, v) => { const t = { ...TH[check], ...(TH.overrides[face.skin]?.[check] || {}), ...(TH.overrides[face.id]?.[check] || {}) }; if (v == null || Number.isNaN(v)) return "n/a";
  return t.min ? (v < t.fail ? "fail" : v < t.warn ? "warn" : "pass") : (v > t.fail ? "fail" : v > t.warn ? "warn" : "pass"); };
// framing base per family: clay for fitted skins, the plast default for the soft-clay presets
const baseOf = {};
for (const base of ["clay", "plast"]) { const d = path.join(cache, base); if (!fs.existsSync(d)) continue; const img = loadCase(d, "rest_front"); if (!img) continue;
  const m = new Uint8Array(W * H); for (let i = 0; i < m.length; i++) m[i] = (img.id[i] === 1 || img.id[i] === 8) && img.rgba[i * 4 + 3] > 128 ? 1 : 0; baseOf[base] = { framing: bbox(m, W, H), eyes: eyeAnchor(img), sil: bbox(Uint8Array.from({ length: W * H }, (_, i) => img.rgba[i * 4 + 3] >= 128 ? 1 : 0), W, H) }; }
const summary = { generated: new Date().toISOString(), fast, thresholds: TH, faces: {} };
for (const d of dirs) {
  const meta = metas[d], dir = path.join(cache, d), memo = new Map();
  const ctx = { meta, dir, face: meta, get: (n) => { if (!memo.has(n)) { if (memo.size > 8) memo.delete(memo.keys().next().value); memo.set(n, loadCase(dir, n)); } return memo.get(n); }, has: (n) => meta.cases.includes(n),
    base: baseOf[meta.skin === "plast" ? "plast" : "clay"] };
  ctx.meta = { ...meta, declaredSkinLuma: meta.declaredSkinLuma };
  const res = {};
  for (const [name, fn] of Object.entries(CHECKS)) { if (fast && !FAST_CHECKS.includes(name)) continue;
    let r = null; try { r = fn(ctx); } catch (e) { r = { value: NaN, unit: "", note: "check crashed: " + e.message }; }
    if (!r) continue;
    const status = grade(name, meta, r.value); const entry = { value: r.value, unit: r.unit, status, worst: r.worst || null, note: r.note || "", extra: r.extra && Object.fromEntries(Object.entries(r.extra).filter(([k, v]) => typeof v !== "object" || v === null || k === "box")) };
    if (status !== "pass" && status !== "n/a" && r.worst && r.mask) { const img = ctx.get(r.worst), b = bbox(r.mask, W, H);
      if (b) { const f = `crops/${d}__${name}.png`; writeCrop(path.join(out, f), img, r.mask, b); entry.crop = f; } }
    res[name] = entry; }
  // thumbnails for the gallery (256 px, light ground and dark ground)
  for (const c of ["rest_front", "rest_q3L", "rest_q3R", "blinkclosed_front", "emote_grin", "emote_surprised"]) { if (!ctx.has(c)) continue; const im = ctx.get(c), s = boxDown(im, 256);
    for (const [t, bg] of [["l", [242, 242, 242]], ["d", [18, 18, 18]]]) { const cm = composite(s, bg); fs.writeFileSync(path.join(out, "thumbs", `${d}__${c}__${t}.png`), encode(cm.rgba, cm.w, cm.h)); } }
  const worstStatus = Object.values(res).some((r) => r.status === "fail") ? "fail" : Object.values(res).some((r) => r.status === "warn") ? "warn" : "pass";
  summary.faces[meta.id] = { dir: d, skin: meta.skin, preset: meta.preset, status: worstStatus, checks: res };
  console.log(`${worstStatus.toUpperCase().padEnd(5)} ${meta.id.padEnd(30)} ` + Object.entries(res).map(([k, v]) => `${k}=${typeof v.value === "number" ? v.value.toFixed(2) : v.value}${v.status === "pass" ? "" : v.status === "warn" ? "~" : "!"}`).join(" "));
}
fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(summary, null, 1));
writeReport(out, summary);
const fails = Object.values(summary.faces).filter((f) => f.status === "fail"), warns = Object.values(summary.faces).filter((f) => f.status === "warn");
console.log(`\nface gate: ${Object.keys(summary.faces).length} faces, ${fails.length} fail, ${warns.length} warn. report: ${path.join(out, "index.html")}`);
process.exit(fails.length ? 1 : 0);
