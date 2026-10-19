/**
 * Library CRUD. Everything is scoped to the signed-in user: their files live under
 * i3d/users/<uid>/ and no route takes a user id, so there is nothing to tamper with.
 *   GET    /api/library            → { items }          (files are expiring signed links)
 *   GET    /api/library?id=…       → { item, spec }
 *   POST   /api/library            → save (after the files are uploaded via /api/upload)
 *   PATCH  /api/library            → rename / retag / share on or off
 *   DELETE /api/library?id=…       → delete one item and its files
 *   DELETE /api/library?all=1      → delete every item and file of the user
 *   PUT    /api/upload?id=…&name=… → raw file body (source image, GLB, thumbnail)
 */
import { randomBytes } from "node:crypto";
import { parseSpec, SpecError, STYLES, type Style } from "../../shared/spec.js";
import { requireUser } from "../auth.js";
import { requireKv, requireStore, type Deps } from "../deps.js";
import { HttpError, json, readBody, readJson } from "../http.js";
import { IMAGE_LIMITS, sanitizeImage } from "../images.js";
import { setJson } from "../kv.js";
import { itemFiles, itemPrefix, MODEL_TTL_MS, mutateIndex, presentItem, readIndex, userPrefix, UUID_RE, type LibraryItem } from "../library.js";
import { log } from "../log.js";
import type { User } from "../users.js";

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

export interface ShareDoc {
  uid: string;
  id: string;
}

const alive = (i: LibraryItem, now = Date.now()) => now - Date.parse(i.createdAt) < MODEL_TTL_MS;

export async function getLibrary(req: Request, d: Deps): Promise<Response> {
  const user = await requireUser(d, req);
  const store = requireStore(d);
  const id = new URL(req.url).searchParams.get("id");
  const { doc } = await readIndex(store, user.id);
  const items = doc.items.filter((i) => alive(i));
  if (!id) {
    return json({ items: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((i) => presentItem(d.env, i)) });
  }
  const item = items.find((i) => i.id === uuid(id));
  if (!item) throw new HttpError(404, "Model not found", "not_found");
  const specPath = item.files.spec;
  const specFile = specPath ? (await store.list(specPath)).find((f) => f.pathname === specPath) : undefined;
  const spec = specFile ? JSON.parse(new TextDecoder().decode(await store.read(specFile))) : null;
  return json({ item: presentItem(d.env, item), spec });
}

export async function saveItem(req: Request, d: Deps): Promise<Response> {
  const user = await requireUser(d, req);
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
  const files = await itemFiles(store, user.id, id);
  if (!files.model || !files.thumb) throw new HttpError(400, "Upload model.glb and thumb.png before saving", "missing_files");
  const specFile = files.spec ?? (await store.put(`${itemPrefix(user.id, id)}spec.json`, JSON.stringify(spec), "application/json", { randomSuffix: true }));

  const { doc } = await readIndex(store, user.id);
  if (!doc.items.some((i) => i.id === id) && doc.items.length >= d.env.maxItemsPerUser) {
    throw new HttpError(409, `Your library is full (${d.env.maxItemsPerUser} models). Delete one to save another.`, "library_full");
  }

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
    files: { source: files.source?.pathname, left: files.left?.pathname, right: files.right?.pathname, glb: files.model.pathname, thumb: files.thumb.pathname, spec: specFile.pathname },
    sizes: { glb: files.model.size, source: files.source?.size, left: files.left?.size, right: files.right?.size, thumb: files.thumb.size },
  };
  await mutateIndex(store, user.id, (items) => [item, ...items.filter((i) => i.id !== id)]);
  return json({ item: presentItem(d.env, item) }, 201);
}

export async function patchItem(req: Request, d: Deps): Promise<Response> {
  const user = await requireUser(d, req);
  const store = requireStore(d);
  const kv = requireKv(d);
  const body = await readJson<Record<string, unknown>>(req, 16_000);
  const id = uuid(body.id);
  if (body.shared === true && (await kv.get(`takedown:${user.id}:${id}`))) {
    throw new HttpError(403, "This model was reported and can't be shared.", "taken_down");
  }
  if (!(await readIndex(store, user.id)).doc.items.some((i) => i.id === id)) throw new HttpError(404, "Model not found", "not_found");
  let updated: LibraryItem | undefined;
  let revoke: string | undefined;
  let created: string | undefined;
  await mutateIndex(store, user.id, (items) =>
    items.map((i) => {
      if (i.id !== id) return i;
      let shareToken = i.shareToken;
      if (body.shared === true && !shareToken) shareToken = created = randomBytes(18).toString("base64url");
      if (body.shared === false && shareToken) {
        revoke = shareToken;
        shareToken = undefined;
      }
      updated = {
        ...i,
        title: body.title !== undefined ? cleanTitle(body.title, i.title) : i.title,
        tags: body.tags !== undefined ? cleanTags(body.tags) : i.tags,
        shareToken,
        updatedAt: new Date().toISOString(),
      };
      if (!shareToken) delete updated.shareToken;
      return updated;
    }),
  );
  if (!updated) throw new HttpError(404, "Model not found", "not_found");
  if (created) await setJson(kv, `share:${created}`, { uid: user.id, id } satisfies ShareDoc);
  if (revoke) await kv.del(`share:${revoke}`);
  return json({ item: presentItem(d.env, updated) });
}

/** Deletes everything stored for one item (files, share link). */
async function removeItems(d: Deps, user: User, ids: "all" | string): Promise<number> {
  const store = requireStore(d);
  const kv = requireKv(d);
  const { doc } = await readIndex(store, user.id);
  const gone = ids === "all" ? doc.items : doc.items.filter((i) => i.id === ids);
  for (const i of gone) if (i.shareToken) await kv.del(`share:${i.shareToken}`);
  if (ids === "all") {
    // the whole user prefix: items, abandoned uploads and every index version
    await store.del(await store.list(userPrefix(user.id)));
  } else if (gone.length) {
    await mutateIndex(store, user.id, (items) => items.filter((i) => i.id !== ids));
    await store.del(await store.list(itemPrefix(user.id, ids)));
  }
  log("library_delete", { userId: user.id, scope: ids === "all" ? "all" : "one", items: gone.length });
  return gone.length;
}

export const wipeUserData = (d: Deps, user: User) => removeItems(d, user, "all");

export async function deleteItem(req: Request, d: Deps): Promise<Response> {
  const user = await requireUser(d, req);
  const url = new URL(req.url);
  if (url.searchParams.get("all") === "1") return json({ ok: true, deleted: await removeItems(d, user, "all") });
  const n = await removeItems(d, user, uuid(url.searchParams.get("id")));
  if (!n) throw new HttpError(404, "Model not found", "not_found");
  return json({ ok: true });
}

// --- uploads ---------------------------------------------------------------

const SOURCE_RULE = {
  types: {
    "image/jpeg": (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8,
    "image/png": (b: Uint8Array) => isPng(b),
    "image/webp": (b: Uint8Array) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  },
  max: IMAGE_LIMITS.maxBytes,
};
const UPLOADS: Record<string, { types: Record<string, (b: Uint8Array) => boolean>; max: number }> = {
  source: SOURCE_RULE,
  left: SOURCE_RULE,
  right: SOURCE_RULE,
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
  const user = await requireUser(d, req);
  const store = requireStore(d);
  const url = new URL(req.url);
  const id = uuid(url.searchParams.get("id"));
  const name = url.searchParams.get("name") ?? "";
  const rule = UPLOADS[name];
  if (!rule) throw new HttpError(400, "name must be source, left, right, thumb or model", "bad_name");
  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim();
  const check = rule.types[type];
  if (!check) throw new HttpError(415, `${name} must be ${Object.keys(rule.types).join(", ")}`, "bad_content_type");
  const body = await readBody(req, rule.max);
  if (body.byteLength < 12 || !check(body)) throw new HttpError(400, `${name} content doesn't match ${type}`, "bad_file");
  // images are re-encoded (metadata stripped, size checked); the GLB is stored as is
  let data: Uint8Array = body;
  let storedType = type;
  if (name !== "model") {
    const clean = await sanitizeImage(body, name);
    data = clean.bytes;
    storedType = clean.mediaType;
  }
  const file = await store.put(`${itemPrefix(user.id, id)}${name}.${EXT[storedType]}`, data, storedType, { randomSuffix: true });
  return json({ size: file.size }, 201);
}
