/**
 * GET /api/file?p=<pathname>&e=<expiry>&s=<signature>
 * Streams one stored file if the link is signed and unexpired and the file is inside its
 * retention window. The only way a browser ever reads storage.
 */
import { HttpError } from "../http.js";
import type { Deps } from "../deps.js";
import { requireStore } from "../deps.js";
import { findFile, MODEL_TTL_MS, SOURCE_KEYS, SOURCE_TTL_MS } from "../library.js";
import { verifyFile } from "../signing.js";

const TYPES: Record<string, string> = { glb: "model/gltf-binary", png: "image/png", jpg: "image/jpeg", webp: "image/webp", json: "application/json" };

export async function getFile(req: Request, d: Deps): Promise<Response> {
  const pathname = verifyFile(d.env, new URL(req.url).searchParams);
  if (!pathname || !pathname.startsWith("i3d/users/") || pathname.includes("..")) throw new HttpError(403, "This link is invalid or has expired.", "bad_link");
  const store = requireStore(d);
  const file = await findFile(store, pathname);
  if (!file) throw new HttpError(404, "File not found.", "not_found");
  const name = /\/items\/[^/]+\/([^/.-]+)/.exec(pathname)?.[1] ?? "";
  const age = Date.now() - Date.parse(file.uploadedAt);
  const ttl = (SOURCE_KEYS as readonly string[]).includes(name) ? SOURCE_TTL_MS : MODEL_TTL_MS;
  if (age > ttl) throw new HttpError(410, "This file has passed its retention period and was deleted.", "expired");
  const ext = pathname.slice(pathname.lastIndexOf(".") + 1);
  const bytes = await store.read(file);
  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": TYPES[ext] ?? "application/octet-stream",
      "content-length": String(bytes.byteLength),
      "cache-control": "private, max-age=300",
      "x-content-type-options": "nosniff",
      "cross-origin-resource-policy": "same-origin",
    },
  });
}
