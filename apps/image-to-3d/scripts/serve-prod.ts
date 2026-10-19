/**
 * Production-like local server: serves `vite build` output with the exact
 * headers and rewrites from vercel.json, and runs api/*.ts as Vercel would
 * (Web Request → Response). The e2e suite runs against this, so the CSP, the
 * sandbox worker's own CSP and the SPA rewrites are exercised for real.
 *
 *   npm run build && tsx scripts/serve-prod.ts   (PORT=4319 by default)
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { handleApi, type ApiModule } from "./node-adapter";

const root = process.cwd();
const dist = path.join(root, "dist");
const vercel = JSON.parse(readFileSync(path.join(root, "vercel.json"), "utf8")) as {
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const re = (source: string) => new RegExp(`^${source}$`);
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://x");
    for (const rule of vercel.headers) if (re(rule.source).test(url.pathname)) for (const h of rule.headers) res.setHeader(h.key, h.value);
    if (await handleApi(req, res, async (name) => {
      const file = path.join(root, "api", `${name}.ts`);
      return existsSync(file) ? ((await import(pathToFileURL(file).href)) as ApiModule) : null;
    })) return;

    let file = path.join(dist, decodeURIComponent(url.pathname));
    if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) {
      const rewrite = vercel.rewrites.find((r) => re(r.source).test(url.pathname));
      if (!rewrite) {
        res.statusCode = 404;
        return res.end("Not found");
      }
      file = path.join(dist, rewrite.destination);
    }
    res.setHeader("content-type", TYPES[path.extname(file)] ?? "application/octet-stream");
    createReadStream(file).pipe(res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end();
  }
});

const port = Number(process.env.PORT || 4319);
server.listen(port, () => console.log(`serve-prod on http://localhost:${port}`));
