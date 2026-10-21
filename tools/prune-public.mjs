// Public build only (amplify.yml): delete private case material that Vite copied
// from public/ into dist/. Everything listed is served by URL, so leaving it in
// would defeat the lock screen. (Card visuals the homepage shows stay.)
import { rmSync } from "node:fs";
const dist = process.argv[2] || "dist";
const gone = ["prd", "away-research", "narration", "xs", "data/xs", "zepiris-capture.png", "zepiris-classifiers.png", "zepiris-contexts.png", "zepiris-stack.png",
  "dj", "ekam-content-system", "shader-viewer", "feedback-voice-harness.html", "mobile-check.html", "data/sd", "data/sd_slot_availability_daily_2026.csv", "sd-playground", "sd-story-posters"];
for (const p of gone) rmSync(`${dist}/${p}`, { recursive: true, force: true });
console.log("pruned", gone.length, "private paths from", dist);
