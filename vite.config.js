import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import inspectOverrides from "./tools/inspect-overrides-plugin.mjs";
import scrollHover from "./tools/postcss-scroll-hover.mjs";
import { fileURLToPath, URL } from "node:url";
import { realpathSync } from "node:fs";
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

export default defineConfig(({ command }) => ({
  // one literal per build, so the bundler can fold PRIVATE_SITE (src/lib/site.js): unset = private on dev, public on build
  define: { "import.meta.env.VITE_SITE": JSON.stringify(process.env.VITE_SITE || (command === "serve" ? "private" : "public")) },
  plugins: [pureLazy(), react(), tailwindcss(), inspectOverrides()],
  css: { postcss: { plugins: [scrollHover()] } },
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
