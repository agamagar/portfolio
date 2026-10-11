// DEV-ONLY Vite plugin: POST /__inspect/write {css} appends to src/hello3/inspect-overrides.css
// (the file Inspect mode's "Write to file" targets). apply: "serve" so it never exists in a build.
import fs from "node:fs";
import path from "node:path";

export default function inspectOverrides() {
  return {
    name: "inspect-overrides",
    apply: "serve",
    configureServer(server) {
      const file = path.resolve(server.config.root, "src/hello3/inspect-overrides.css");
      server.middlewares.use("/__inspect/write", (req, res) => {
        if (req.method !== "POST") { res.statusCode = 405; return res.end(); }
        let body = "";
        req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
        req.on("end", () => {
          try {
            const { css } = JSON.parse(body);
            if (typeof css !== "string" || !css.trim()) throw new Error("no css");
            fs.appendFileSync(file, `\n/* ${new Date().toISOString()} */\n${css.trim()}\n`);
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (e) { res.statusCode = 400; res.end(JSON.stringify({ ok: false, error: String(e.message) })); }
        });
      });
    },
  };
}
