/**
 * Library CRUD.
 *   GET    /api/library            → { items }
 *   GET    /api/library?id=…       → { item, spec }
 *   POST   /api/library            → save (after the files are uploaded via /api/upload)
 *   PATCH  /api/library            → rename / retag
 *   DELETE /api/library?id=…       → delete item + files
 *   PUT    /api/upload?id=…&name=… → raw file body (source image, GLB, thumbnail)
 */
import { parseSpec, SpecError, STYLES, type Style } from "../../shared/spec.js";
import { requireAuth } from "../auth.js";
import { requireStore, type Deps } from "../deps.js";
import { HttpError, json, readBody, readJson } from "../http.js";
import { itemFiles, itemPrefix, mutateIndex, readIndex, UUID_RE, type LibraryItem } from "../library.js";

/** Reads are gated too, unless PUBLIC_GALLERY=true makes the gallery read-only public. */
function requireRead(req: Request, d: Deps) {
  if (!d.env.publicGallery) requireAuth(d.env, req);
}

function uuid(v: unknown): string {
  if (typeof v !== "string" || !UUID_RE.test(v)) throw new HttpError(400, "id must be a UUID v4", "bad_id");
  return v;
}

function cleanTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((t): t is string => typeof t === "string").map((t) => t.trim().toLowerCase().slice(0, 24)).filter(Boolean))].slice(0, 12);
}

function cleanTitle(v: unknown, fallback = "Untitled"): string {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : fallback;
}

export async function getLibrary(req: Request, d: Deps): Promise<Response> {
  requireRead(req, d);
  const store = requireStore(d);
  const id = new URL(req.url).searchParams.get("id");
  const { doc } = await readIndex(store);
  if (!id) {
    const items = doc.items.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return json({ items });
  }
  const item = doc.items.find((i) => i.id === uuid(id));
  if (!item) throw new HttpError(404, "Model not found", "not_found");
  const files = await itemFiles(store, item.id);
  const spec = files.spec ? JSON.parse(new TextDecoder().decode(await store.read(files.spec))) : null;
  return json({ item, spec });
}

export async function saveItem(req: Request, d: Deps): Promise<Response> {
  requireAuth(d.env, req);
  const store = requireStore(d);
  const body = await readJson<Record<string, unknown>>(req, 2_000_000);
  const id = uuid(body.id);

  let spec;
  try {
    spec = parseSpec(body.spec).spec;
  } catch (err) {
    if (err instanceof SpecError) throw new HttpError(400, `spec is invalid: ${err.issues.join("; ") || err.message}`, "bad_spec");
    throw err;
  }
  const files = await itemFiles(store, id);
  if (!files.model || !files.thumb) throw new HttpError(400, "Upload model.glb and thumb.png before saving", "missing_files");
  const specFile = files.spec ?? (await store.put(`${itemPrefix(id)}spec.json`, JSON.stringify(spec), "application/json", { randomSuffix: true }));

  const now = new Date().toISOString();
  const num = (x: unknown, lo: number, hi: number) => (typeof x === "number" && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null);
  const style: Style = (STYLES as readonly string[]).includes(body.style as string) ? (body.style as Style) : spec.style;

  const item: LibraryItem = {
    id,
    title: cleanTitle(body.title, spec.title || "Untitled"),
    tags: cleanTags(body.tags ?? spec.tags),
    style,
    subjectKind: spec.subjectKind,
    model: typeof body.model === "string" ? body.model.slice(0, 40) : "",
    createdAt: now,
    updatedAt: now,
    score: num(body.score, 0, 10),
    passes: num(body.passes, 0, 10) ?? 0,
    costUsd: num(body.costUsd, 0, 1000) ?? 0,
    triangles: num(body.triangles, 0, 1e8) ?? 0,
    files: { source: files.source?.url, glb: files.model.url, thumb: files.thumb.url, spec: specFile.url },
    sizes: { glb: files.model.size, source: files.source?.size, thumb: files.thumb.size },
  };
  await mutateIndex(store, (items) => [item, ...items.filter((i) => i.id !== id)]);
  return json({ item }, 201);
}

export async function patchItem(req: Request, d: Deps): Promise<Response> {
  requireAuth(d.env, req);
  const store = requireStore(d);
  const body = await readJson<Record<string, unknown>>(req, 16_000);
  const id = uuid(body.id);
  let updated: LibraryItem | undefined;
  await mutateIndex(store, (items) =>
    items.map((i) => {
      if (i.id !== id) return i;
      updated = {
        ...i,
        title: body.title !== undefined ? cleanTitle(body.title, i.title) : i.title,
        tags: body.tags !== undefined ? cleanTags(body.tags) : i.tags,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    }),
  );
  if (!updated) throw new HttpError(404, "Model not found", "not_found");
  return json({ item: updated });
}

export async function deleteItem(req: Request, d: Deps): Promise<Response> {
  requireAuth(d.env, req);
  const store = requireStore(d);
  const id = uuid(new URL(req.url).searchParams.get("id"));
  let found = false;
  await mutateIndex(store, (items) => items.filter((i) => (i.id === id ? ((found = true), false) : true)));
  await store.del(await store.list(itemPrefix(id)));
  if (!found) throw new HttpError(404, "Model not found", "not_found");
  return json({ ok: true });
}

// --- uploads ---------------------------------------------------------------

const UPLOADS: Record<string, { types: Record<string, (b: Uint8Array) => boolean>; max: number }> = {
  source: {
    types: {
      "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8,
      "image/png": isPng,
      "image/webp": (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
    },
    max: 4_000_000,
  },
  thumb: { types: { "image/png": isPng, "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 }, max: 2_000_000 },
  model: { types: { "model/gltf-binary": (b) => ascii(b, 0, 4) === "glTF" }, max: 4_200_000 },
};
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "model/gltf-binary": "glb" };

function ascii(b: Uint8Array, s: number, e: number) {
  return String.fromCharCode(...b.subarray(s, e));
}
function isPng(b: Uint8Array) {
  return b[0] === 0x89 && ascii(b, 1, 4) === "PNG";
}

export async function upload(req: Request, d: Deps): Promise<Response> {
  requireAuth(d.env, req);
  const store = requireStore(d);
  const url = new URL(req.url);
  const id = uuid(url.searchParams.get("id"));
  const name = url.searchParams.get("name") ?? "";
  const rule = UPLOADS[name];
  if (!rule) throw new HttpError(400, "name must be source, thumb or model", "bad_name");
  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim();
  const check = rule.types[type];
  if (!check) throw new HttpError(415, `${name} must be ${Object.keys(rule.types).join(", ")}`, "bad_content_type");
  const body = await readBody(req, rule.max);
  if (body.byteLength < 12 || !check(body)) throw new HttpError(400, `${name} content doesn't match ${type}`, "bad_file");
  const file = await store.put(`${itemPrefix(id)}${name}.${EXT[type]}`, body, type, { randomSuffix: true });
  return json({ url: file.url, size: file.size }, 201);
}
