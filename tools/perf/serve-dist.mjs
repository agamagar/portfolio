// Static server for a production build, with the same Cache-Control rules customHttp.yml gives
// Amplify (parsed from it when present, else none) + SPA fallback.  node tools/perf/serve-dist.mjs <dir> <port> [--headers]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const [dir, port] = [process.argv[2], +process.argv[3]];
const useHeaders = process.argv.includes("--headers");
const rules = [];
if (useHeaders) {
  const y = fs.readFileSync(new URL("../../customHttp.yml", import.meta.url), "utf8");
  let cur = null;
  for (const line of y.split("\n")) {
    const pat = line.match(/pattern:\s*'?"?([^'"\n]+)/);
    if (pat) { cur = { re: new RegExp("^" + pat[1].trim().replace(/[.+^$()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\0").replace(/\*/g, "[^/]*").replace(/\0/g, ".*") + "$"), h: {} }; rules.push(cur); }
    const k = line.match(/key:\s*'?"?([^'"\n]+)/), v = line.match(/value:\s*'?"?(.+?)'?"?\s*$/);
    if (k && cur) cur._k = k[1].trim();
    if (v && cur && cur._k) { cur.h[cur._k] = v[1]; cur._k = null; }
  }
}
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm", ".csv": "text/csv" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(dir, p);
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dir, "index.html");
  const rel = "/" + path.relative(dir, f);
  const st = fs.statSync(f);
  const h = { "Last-Modified": st.mtime.toUTCString(), ETag: `"${st.size}-${st.mtimeMs}"`, "Content-Type": types[path.extname(f)] || "application/octet-stream" };
  for (const r of rules) if (r.re.test(rel)) Object.assign(h, r.h);
  res.writeHead(200, h);
  fs.createReadStream(f).pipe(res);
}).listen(port, "127.0.0.1");
