import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import inspectOverrides from "./tools/inspect-overrides-plugin.mjs";
import scrollHover from "./tools/postcss-scroll-hover.mjs";
import { fileURLToPath, URL } from "node:url";
import { realpathSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

// Public build (VITE_SITE unset or "public"): mark the lazy() component declarations pure, so a
// lazy chunk that only a private case study references is dropped instead of emitted. The
// private build, and `vite dev`, are left alone.
const PUBLIC_BUILD = process.env.VITE_SITE !== "private";
const pureLazy = () => ({
  name: "pure-lazy",
  apply: "build",
  enforce: "pre",
  transform(code, id) {
    if (!PUBLIC_BUILD || !/\.jsx$/.test(id) || id.includes("node_modules")) return null;
    const out = code.replace(/(=\s*)(lazy|lazyFig)\(/g, "$1/* @__PURE__ */ $2(");
    return out === code ? null : { code: out, map: null };
  },
});


// Public build: the room monitor draws the homepage's own source as a wall of code (src/scene/window/room/codeScreen.js,
// raw imports). Ship it as code only: no comments (they carry dev notes and internal tool names) and no URLs (a Figma
// prototype link lived in WorkGrid.jsx). The monitor shows it at 6 px, so it still reads as dense code.
const RAW_SCREEN = /\/src\/hello3\/(Hello\.jsx|WorkGrid\.jsx|helloData\.js|hello3\.css)\?raw$/;
const sanitizeRaw = () => ({
  name: "sanitize-raw-screen-source",
  apply: "build",
  enforce: "pre",
  load(id) {
    if (!PUBLIC_BUILD || !RAW_SCREEN.test(id.replace(/\\/g, "/"))) return null;
    const text = readFileSync(id.replace(/\?raw$/, ""), "utf8")
      .replace(/(?:https?:)?\/\/[A-Za-z0-9.-]+\.[a-z]{2,}[^\s"'`)<>]*/g, "#")  // URLs first, so their // is not read as a comment
      .replace(/\/\*[\s\S]*?\*\//g, "")                                          // block comments (JS, JSX, CSS)
      .replace(/(^|\s)\/\/[^\n]*/g, "$1")                                          // line comments
      .replace(/\{\s*\}/g, "")                                                       // what is left of {/* ... */}
      .replace(/[ \t]+$/gm, "").replace(/\n{2,}/g, "\n");
    return `export default ${JSON.stringify(text)};`;
  },
});

export default defineConfig(({ command }) => ({
  // one literal per build, so the bundler can fold PRIVATE_SITE (src/lib/site.js): unset = private on dev, public on build
  define: { "import.meta.env.VITE_SITE": JSON.stringify(process.env.VITE_SITE || (command === "serve" ? "private" : "public")) },
  plugins: [pureLazy(), sanitizeRaw(), react(), tailwindcss(), inspectOverrides()],
  css: { postcss: { plugins: [scrollHover()] } },
  // the synced design-playground bundle (public/sd-playground) is prebuilt: keep the dependency scan out of it
  optimizeDeps: { entries: ["**/*.html", "!public/sd-playground/**"] },
  // IPv4 loopback: Node resolved "localhost" to ::1 only, so http://127.0.0.1:5173
  // refused connections (2026-09-27); browsers still reach it as localhost
  // PORT (set by the desktop app's preview when 5173 is taken by another chat's
  // server) wins; without it Vite keeps its default 5173
  // fs.allow: a worktree's node_modules is a symlink into the main checkout; Vite serves the real path
  // (/@fs/...) and 403s it as outside the root, which broke the Stack Sans font on :5173 (18 Oct 2026).
  server: { host: "127.0.0.1", fs: { allow: [".", (() => { try { return dirname(realpathSync("node_modules")); } catch { return "."; } })()] }, ...(process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : {}) },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
