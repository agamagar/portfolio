// Re-sync the Stella chat prototype that the Dassh case study embeds (4 Nov 2026, case study v2).
//   node tools/sync-stella-chat.mjs                  # build the committed v3 tip of dassh-work
//   DASSH_WORK=/path/to/dassh-work STELLA_REF=<commit> node tools/sync-stella-chat.mjs
// Writes public/stella-chat/ (tracked, like public/sd-flows/): stella-chat.html, its assets and SYNCED.json.
//
// It never touches the dassh-work checkout: the source comes out of git (`git archive <ref>`), so other runs' uncommitted
// edits are left out and nothing is written there. The archive gets a real node_modules folder whose entries link to the
// checkout's own, except .vite, so the checkout's dev-server cache is not shared. Only the chat entry is built.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const work = resolve(process.env.DASSH_WORK || join(homedir(), "Developer/dassh-work"));
const ref = process.env.STELLA_REF || "v3";
const appPath = "Claude/Design System (SDS)/dassh-ui-src";
const out = join(root, "public/stella-chat");

const git = (...args) => {
  const r = spawnSync("git", ["-C", work, ...args], { encoding: "utf8", maxBuffer: 1 << 30 });
  if (r.status !== 0) { console.error(r.stderr || `git ${args.join(" ")} failed`); process.exit(1); }
  return r.stdout.trim();
};
const commit = git("rev-parse", "--short", ref);

const tmp = mkdtempSync(join(tmpdir(), "stella-chat-"));
try {
  const tar = spawnSync("sh", ["-c", `git -C "$0" archive "$1" "$2" | tar -x -C "$3"`, work, commit, appPath, tmp], { stdio: "inherit" });
  if (tar.status !== 0) process.exit(tar.status ?? 1);
  const app = join(tmp, appPath);
  const mods = join(work, appPath, "node_modules");
  mkdirSync(join(app, "node_modules"));
  for (const name of readdirSync(mods)) if (name !== ".vite") symlinkSync(join(mods, name), join(app, "node_modules", name));

  writeFileSync(join(app, "vite.embed.config.ts"), `import { defineConfig, mergeConfig } from "vite";
import path from "path";
import base from "./vite.config";
export default mergeConfig(base, defineConfig({
  base: "./",
  build: {
    outDir: ${JSON.stringify(out)},
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: { input: { "stella-chat": path.resolve(__dirname, "stella-chat.html") } },
  },
}));
`);
  const b = spawnSync("npx", ["vite", "build", "-c", "vite.embed.config.ts", "--logLevel", "warn"], { cwd: app, stdio: "inherit" });
  if (b.status !== 0) process.exit(b.status ?? 1);

  writeFileSync(join(out, "SYNCED.json"), JSON.stringify({
    from: "dassh-work",
    path: appPath,
    ref,
    commit,
    entry: "stella-chat.html",
    note: "built from git archive of the commit (no uncommitted changes); tools/sync-stella-chat.mjs",
    syncedAt: new Date().toISOString(),
  }, null, 2) + "\n");
  console.log(`stella-chat: built ${ref} (${commit}) into public/stella-chat/`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
