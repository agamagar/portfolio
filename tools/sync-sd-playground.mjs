// Re-sync the Scheduled Delivery story with the design playground.
//   npm run sync:sd-playground            # build + copy the embed bundle, thumbnails, catalog
//   PLAYGROUND_DIR=/path/to/design-playground npm run sync:sd-playground
// Writes public/sd-playground/ (git-ignored) and src/figures/sdStory/embedCatalog.json (tracked).
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pg = resolve(process.env.PLAYGROUND_DIR || join(homedir(), "design-playground"));
const script = join(pg, "scripts", "sync-embed.mjs");
if (!existsSync(script)) {
  console.error(`Playground not found at ${pg}. Set PLAYGROUND_DIR to your design-playground checkout.`);
  process.exit(1);
}
const r = spawnSync(process.execPath, [script, root, "--thumbs"], { stdio: "inherit", cwd: pg });
if (r.status !== 0) process.exit(r.status ?? 1);

// Poster thumbnails for the offline fallback: one per flow embed the story uses (the case it opens on).
const catalog = JSON.parse(readFileSync(join(root, "src/figures/sdStory/embedCatalog.json"), "utf8"));
const story = await import(pathToFileURL(join(root, "src/decks/scheduledDelivery.story.js")).href);
const used = new Map();
for (const s of Object.values(story).flat()) if (s.embed && !used.has(s.embed)) used.set(s.embed, s.caseId);
mkdirSync(join(root, "public/sd-story-posters"), { recursive: true });
let posters = 0;
for (const [id, caseId] of used) {
  const e = catalog.embeds.find((x) => x.id === id);
  if (!e) { console.warn(`WARNING: story uses embed "${id}" which is not in the catalog`); continue; }
  if (e.kind !== "flow") continue;
  const c = (caseId && e.cases.find((x) => x.id === caseId && x.thumb)) || e.cases.find((x) => x.thumb);
  const src = c && join(root, "public/sd-playground", c.thumb.slice(c.thumb.indexOf("thumbs/")));
  if (src && existsSync(src)) { copyFileSync(src, join(root, "public/sd-story-posters", `${id}.png`)); posters++; }
}
console.log(`posters: ${posters}`);

const synced = JSON.parse(readFileSync(join(root, "public/sd-playground/SYNCED.json"), "utf8"));
const head = spawnSync("git", ["-C", pg, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).stdout.trim();
const dirty = spawnSync("git", ["-C", pg, "status", "--porcelain"], { encoding: "utf8" }).stdout.trim();
console.log(`\nSYNCED.json commit ${synced.commit}; playground HEAD ${head}${dirty ? " (working tree has uncommitted changes: the bundle includes them)" : ""}`);
if (synced.commit !== head) console.warn("WARNING: SYNCED.json commit does not match playground HEAD");
console.log("Next: git diff src/figures/sdStory/embedCatalog.json, then check the story (docs/sd-story-sync.md).");
