// Public build only (amplify.yml): delete private case material that Vite copied
// from public/ into dist/. Everything listed is served by URL, so leaving it in
// would defeat the lock screen. (Card visuals the homepage shows stay.)
import { rmSync } from "node:fs";
const dist = process.argv[2] || "dist";
const gone = ["prd", "away-research", "narration", "xs", "data/xs", "zepiris-capture.png", "zepiris-classifiers.png", "zepiris-contexts.png", "zepiris-stack.png",
  "dj", "ekam-content-system", "shader-viewer", "feedback-voice-harness.html", "mobile-check.html", "data/sd", "data/sd_slot_availability_daily_2026.csv", "sd-playground", "sd-story-posters"];
for (const p of gone) rmSync(`${dist}/${p}`, { recursive: true, force: true });
console.log("pruned", gone.length, "private paths from", dist);

// Locked case studies (public build): their figure files are served by URL, so the lock screen would only hide them.
// Keep the files the homepage itself references (card visuals, side-quests, the phone marquee, the along-path) and
// everything under figures/marquee; delete the rest of figures/. The keep list is read from the homepage's own source
// (every "/figures/..." string in src/hello3 and src/hello), so a new homepage asset is kept without editing this file.
// A path with a ${...} in it keeps its whole directory.
import { readdirSync, readFileSync, statSync, existsSync, rmdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
const walk = (dir, f) => { for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? walk(p, f) : f(p); } };
const keepFiles = new Set(), keepDirs = new Set(["figures/marquee"]);
for (const root of ["src/hello3", "src/hello"]) {
  if (!existsSync(root)) continue;
  walk(root, (p) => {
    if (!/\.(jsx?|css)$/.test(p)) return;
    for (const m of readFileSync(p, "utf8").matchAll(/\/(figures\/[^"'`)\s?#]+)/g)) {
      const ref = m[1];
      if (ref.includes("${")) keepDirs.add(ref.slice(0, ref.indexOf("${")).replace(/\/[^/]*$/, ""));
      else keepFiles.add(ref);
    }
  });
}
let removed = 0, bytes = 0;
if (existsSync(`${dist}/figures`)) {
  const sweep = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n), rel = p.slice(dist.length + 1);
      if (statSync(p).isDirectory()) { sweep(p); if (!readdirSync(p).length) rmdirSync(p); continue; }
      if (keepFiles.has(rel) || [...keepDirs].some((d) => rel === d || rel.startsWith(d + "/"))) continue;
      bytes += statSync(p).size; removed++; unlinkSync(p);
    }
  };
  sweep(`${dist}/figures`);
}
console.log(`pruned ${removed} figure files (${(bytes / 1e6).toFixed(0)} MB) the homepage does not use; kept ${keepFiles.size} referenced files`);
// the case-only chunks (never fetched by the homepage or any public route) and the case videos they pull in
for (const f of readdirSync(`${dist}/assets`)) if (/^(PlaygroundEmbed|SdAvailability)-.*\.(js|css)$|^(commute|dinner|occasion|peak)-.*\.webm$/.test(f)) { rmSync(`${dist}/assets/${f}`); console.log("pruned chunk", f); }
