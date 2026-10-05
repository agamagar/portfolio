#!/usr/bin/env node
// Restores a prebuilt better-sqlite3 native binary into node_modules.
//
// Why this exists: this project lives under a path WITH SPACES
// ("My Drive/Active - Portfolio"). node-gyp passes that path unquoted to
// /bin/sh, so compiling better-sqlite3 from source fails here
// ("/bin/sh: Drive/Active: No such file or directory"). When the binary is
// missing, agentation-mcp silently falls back to an in-memory store and every
// annotation is lost on server restart.
//
// We vendor a known-good compiled binary in tools/agentation/better-sqlite3-build/
// and copy it into place on postinstall when node_modules is missing one.
// If the binary ever needs regenerating, build it in a space-free directory:
//   mkdir /tmp/bs3 && cd /tmp/bs3 && npm init -y && npm i better-sqlite3@<version>
//   cp -R node_modules/better-sqlite3/build <repo>/tools/agentation/better-sqlite3-build

import { existsSync, mkdirSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const vendored = join(here, "better-sqlite3-build");
const target = join(here, "..", "..", "node_modules", "better-sqlite3", "build");
const targetBinary = join(target, "Release", "better_sqlite3.node");

if (!existsSync(vendored)) {
  // Nothing to restore from; let the normal install path handle it.
  process.exit(0);
}
if (existsSync(targetBinary)) {
  // A binary is already present (freshly compiled or previously restored).
  process.exit(0);
}
if (!existsSync(join(here, "..", "..", "node_modules", "better-sqlite3"))) {
  // Dependency not installed (yet); nothing to do.
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
cpSync(vendored, target, { recursive: true });
console.log("[agentation] restored prebuilt better-sqlite3 binary (path has spaces; source build is unavailable)");
