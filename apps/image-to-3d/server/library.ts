import { randomBytes } from "node:crypto";
import type { Env } from "./env.js";
import type { Style } from "../shared/spec.js";
import { signFile } from "./signing.js";
import { ROOT, type Store, type StoredFile } from "./store/types.js";

/** What a user can open. `files` holds storage pathnames, never URLs: see presentItem(). */
export interface LibraryItem {
  id: string;
  title: string;
  tags: string[];
  style: Style;
  subjectKind: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  score: number | null;
  passes: number;
  costUsd: number;
  triangles: number;
  files: { source?: string; left?: string; right?: string; glb?: string; thumb?: string; spec?: string };
  sizes: { glb?: number; source?: number; left?: number; right?: number; thumb?: number };
  /** Set while the model is shared by link: the token in /s/<token>. */
  shareToken?: string;
}

interface IndexDoc {
  version: 1;
  updatedAt: string;
  items: LibraryItem[];
}

const KEEP_INDEX_VERSIONS = 5;

/** Everything a user owns lives under one prefix: i3d/users/<uid>/ */
export const userPrefix = (uid: string) => `${ROOT}/users/${uid}/`;
export const itemPrefix = (uid: string, id: string) => `${userPrefix(uid)}items/${id}/`;
const indexPrefix = (uid: string) => `${userPrefix(uid)}index/`;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * The library index is a JSON document stored under a new, versioned pathname
 * on every write (i3d/users/<uid>/index/<ms>-<rand>.json). Reads list the prefix (an API
 * call, always fresh) and take the newest, so CDN caching of blob URLs can
 * never serve a stale index. Old versions are pruned.
 */
export async function readIndex(store: Store, uid: string): Promise<{ doc: IndexDoc; versions: StoredFile[] }> {
  const versions = (await store.list(indexPrefix(uid))).filter((f) => f.pathname.endsWith(".json"));
  const newest = versions[versions.length - 1];
  if (!newest) return { doc: { version: 1, updatedAt: new Date(0).toISOString(), items: [] }, versions };
  const raw = JSON.parse(new TextDecoder().decode(await store.read(newest))) as IndexDoc;
  return { doc: { version: 1, updatedAt: raw.updatedAt, items: Array.isArray(raw.items) ? raw.items : [] }, versions };
}

export async function mutateIndex(store: Store, uid: string, fn: (items: LibraryItem[]) => LibraryItem[]): Promise<LibraryItem[]> {
  const { doc, versions } = await readIndex(store, uid);
  const items = fn(doc.items.slice());
  const ts = String(Date.now()).padStart(15, "0");
  const next: IndexDoc = { version: 1, updatedAt: new Date().toISOString(), items };
  await store.put(`${indexPrefix(uid)}${ts}-${randomBytes(4).toString("hex")}.json`, JSON.stringify(next), "application/json");
  const stale = versions.slice(0, Math.max(0, versions.length + 1 - KEEP_INDEX_VERSIONS));
  if (stale.length) await store.del(stale).catch(() => {});
  return items;
}

/** Files uploaded for an item, newest per logical name (source/model/thumb/spec). */
export async function itemFiles(store: Store, uid: string, id: string): Promise<Record<string, StoredFile>> {
  const prefix = itemPrefix(uid, id);
  const files = await store.list(prefix);
  const out: Record<string, StoredFile> = {};
  for (const f of files) {
    const base = f.pathname.slice(prefix.length).split(/[-.]/)[0];
    const prev = out[base];
    if (!prev || prev.uploadedAt <= f.uploadedAt) out[base] = f;
  }
  return out;
}

export async function findFile(store: Store, pathname: string): Promise<StoredFile | null> {
  return (await store.list(pathname)).find((f) => f.pathname === pathname) ?? null;
}

/** Source photos are deleted after 24 hours, models after 30 days (retention.ts). */
export const SOURCE_TTL_MS = 24 * 3600_000;
export const MODEL_TTL_MS = 30 * 24 * 3600_000;
export const SOURCE_KEYS = ["source", "left", "right"] as const;

/**
 * The item as the browser sees it: pathnames become expiring signed links, and anything past
 * its retention window is left out even if the cron hasn't deleted it yet.
 */
export function presentItem(env: Env, item: LibraryItem, opts: { ttlS?: number; includeSources?: boolean; now?: number } = {}) {
  const now = opts.now ?? Date.now();
  const created = Date.parse(item.createdAt);
  const sourcesAlive = (opts.includeSources ?? true) && now - created < SOURCE_TTL_MS;
  const files: Record<string, string> = {};
  for (const [k, v] of Object.entries(item.files)) {
    if (!v) continue;
    if ((SOURCE_KEYS as readonly string[]).includes(k) && !sourcesAlive) continue;
    files[k] = signFile(env, v, opts.ttlS, now);
  }
  return { ...item, files, expiresAt: new Date(created + MODEL_TTL_MS).toISOString(), sourcesExpireAt: new Date(created + SOURCE_TTL_MS).toISOString() };
}
export type PresentedItem = ReturnType<typeof presentItem>;
