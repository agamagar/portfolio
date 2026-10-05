// Zero-dependency shader viewer server.
// Serves the viewer and reads/writes presets as real .frag files in ./presets.
// Run:  node server.mjs   (optional: PORT=4000 node server.mjs)

import { createServer } from "node:http";
import { readFile, readdir, writeFile, unlink, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";
import { buildBundle } from "./build-presets.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRESETS_DIR = join(__dirname, "presets");
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".frag": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// slug a preset name into a safe filename stem
const slug = (name) =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "untitled";

const json = (res, code, body) => {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
  });
  res.end(data);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 2_000_000) reject(new Error("payload too large"));
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });

// ---- preset API ----------------------------------------------------------

async function listPresets() {
  await mkdir(PRESETS_DIR, { recursive: true });
  const files = (await readdir(PRESETS_DIR)).filter((f) => f.endsWith(".frag"));
  const presets = await Promise.all(
    files.sort().map(async (file) => {
      const code = await readFile(join(PRESETS_DIR, file), "utf8");
      // first line "// name: Foo" wins, else derive from filename
      const m = code.match(/^\/\/\s*name:\s*(.+)$/m);
      const g = code.match(/^\/\/\s*group:\s*(.+)$/m);
      const name = m ? m[1].trim() : file.replace(/\.frag$/, "");
      const group = g ? g[1].trim() : "Other";
      return { id: file.replace(/\.frag$/, ""), file, name, group, code };
    })
  );
  return presets;
}

async function savePreset(name, code) {
  await mkdir(PRESETS_DIR, { recursive: true });
  const id = slug(name);
  // stamp the human name on the first line so the file is self-describing
  const header = `// name: ${name}\n`;
  const body = code.replace(/^\/\/\s*name:.*\n/, "");
  await writeFile(join(PRESETS_DIR, `${id}.frag`), header + body, "utf8");
  await buildBundle().catch(() => {}); // keep the static web build in sync
  return { id, file: `${id}.frag`, name };
}

async function deletePreset(id) {
  const safe = slug(id);
  await unlink(join(PRESETS_DIR, `${safe}.frag`));
  await buildBundle().catch(() => {}); // keep the static web build in sync
  return { id: safe };
}

// ---- static files --------------------------------------------------------

async function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (urlPath === "/") urlPath = "/index.html";
  // prevent path traversal
  const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(__dirname, safe);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}

// ---- router --------------------------------------------------------------

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://x");

    if (pathname === "/api/presets" && req.method === "GET") {
      return json(res, 200, { presets: await listPresets() });
    }

    if (pathname === "/api/presets" && req.method === "POST") {
      const { name, code } = JSON.parse((await readBody(req)) || "{}");
      if (!name || !code) return json(res, 400, { error: "name and code required" });
      return json(res, 200, { ok: true, preset: await savePreset(name, code) });
    }

    if (pathname.startsWith("/api/presets/") && req.method === "DELETE") {
      const id = pathname.slice("/api/presets/".length);
      return json(res, 200, { ok: true, deleted: await deletePreset(id) });
    }

    return serveStatic(req, res);
  } catch (err) {
    json(res, 500, { error: String(err && err.message ? err.message : err) });
  }
});

server.listen(PORT, () => {
  console.log(`\n  shader-viewer  →  http://localhost:${PORT}`);
  console.log(`  presets folder →  ${PRESETS_DIR}\n`);
});
