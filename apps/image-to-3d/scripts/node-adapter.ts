/**
 * Runs the Vercel-style Web handlers (api/*.ts exporting GET/POST/...) behind a
 * plain Node http server: used by the Vite dev middleware and by
 * scripts/serve-prod.ts (the production-like server the e2e suite runs against).
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { createReadStream, statSync } from "node:fs";
import path from "node:path";

export type ApiModule = Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", (req: Request) => Promise<Response>>>;

export function toWebRequest(req: IncomingMessage, abort: AbortController): Request {
  const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v !== undefined) headers.set(k, v);
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? (Readable.toWeb(req) as unknown as ReadableStream<Uint8Array>) : undefined,
    signal: abort.signal,
    // @ts-expect-error Node's fetch needs this for streaming bodies
    duplex: "half",
  });
}

export async function sendWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") res.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie?.() ?? [];
  if (cookies.length) res.setHeader("set-cookie", cookies);
  if (!response.body) return void res.end();
  res.flushHeaders?.();
  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
  res.end();
}

/** Dispatch /api/<name> to api/<name>.ts. `load` imports the module (ssrLoadModule in dev, import() in prod-like). */
export async function handleApi(req: IncomingMessage, res: ServerResponse, load: (name: string) => Promise<ApiModule | null>): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://x");
  const m = /^\/api\/([a-z-]+)\/?$/.exec(url.pathname);
  if (!m) return false;
  const mod = await load(m[1]).catch((e) => {
    console.error(e);
    return null;
  });
  const fn = mod?.[(req.method ?? "GET") as keyof ApiModule];
  if (!fn) {
    res.statusCode = mod ? 405 : 404;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: mod ? "Method not allowed" : "Not found" }));
    return true;
  }
  const abort = new AbortController();
  res.on("close", () => !res.writableFinished && abort.abort());
  await sendWebResponse(res, await fn(toWebRequest(req, abort)));
  return true;
}

const TYPES: Record<string, string> = {
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
};

/** Serves the local FsStore at /files/* (Vercel Blob URLs replace this in production). */
export function handleFiles(req: IncomingMessage, res: ServerResponse, dataDir: string): boolean {
  const url = new URL(req.url ?? "/", "http://x");
  if (!url.pathname.startsWith("/files/")) return false;
  const root = path.resolve(dataDir);
  const abs = path.resolve(root, decodeURIComponent(url.pathname.slice("/files/".length)));
  if (!abs.startsWith(root + path.sep)) {
    res.statusCode = 400;
    res.end();
    return true;
  }
  try {
    const s = statSync(abs);
    res.setHeader("content-type", TYPES[path.extname(abs)] ?? "application/octet-stream");
    res.setHeader("content-length", s.size);
    res.setHeader("access-control-allow-origin", "*");
    createReadStream(abs).pipe(res);
  } catch {
    res.statusCode = 404;
    res.end();
  }
  return true;
}
