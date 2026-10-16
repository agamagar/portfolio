import { randomBytes } from "node:crypto";
import type { Style } from "../shared/spec.js";
import { ROOT, type Store, type StoredFile } from "./store/types.js";

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
}

interface IndexDoc {
  version: 1;
  updatedAt: string;
  items: LibraryItem[];
}

const INDEX_PREFIX = `${ROOT}/index/`;
const KEEP_INDEX_VERSIONS = 5;

export const itemPrefix = (id: string) => `${ROOT}/items/${id}/`;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * The library index is a JSON document stored under a new, versioned pathname
 * on every write (i3d/index/<ms>-<rand>.json). Reads list the prefix (an API
 * call, always fresh) and take the newest, so CDN caching of blob URLs can
 * never serve a stale index. Old versions are pruned.
 */
export async function readIndex(store: Store): Promise<{ doc: IndexDoc; versions: StoredFile[] }> {
  const versions = (await store.list(INDEX_PREFIX)).filter((f) => f.pathname.endsWith(".json"));
  const newest = versions[versions.length - 1];
  if (!newest) return { doc: { version: 1, updatedAt: new Date(0).toISOString(), items: [] }, versions };
  const raw = JSON.parse(new TextDecoder().decode(await store.read(newest))) as IndexDoc;
  return { doc: { version: 1, updatedAt: raw.updatedAt, items: Array.isArray(raw.items) ? raw.items : [] }, versions };
}

export async function mutateIndex(store: Store, fn: (items: LibraryItem[]) => LibraryItem[]): Promise<LibraryItem[]> {
  const { doc, versions } = await readIndex(store);
  const items = fn(doc.items.slice());
  const ts = String(Date.now()).padStart(15, "0");
  const next: IndexDoc = { version: 1, updatedAt: new Date().toISOString(), items };
  await store.put(`${INDEX_PREFIX}${ts}-${randomBytes(4).toString("hex")}.json`, JSON.stringify(next), "application/json");
  const stale = versions.slice(0, Math.max(0, versions.length + 1 - KEEP_INDEX_VERSIONS));
  if (stale.length) await store.del(stale).catch(() => {});
  return items;
}

/** Files uploaded for an item, newest per logical name (source/model/thumb/spec). */
export async function itemFiles(store: Store, id: string): Promise<Record<string, StoredFile>> {
  const files = await store.list(itemPrefix(id));
  const out: Record<string, StoredFile> = {};
  for (const f of files) {
    const base = f.pathname.slice(itemPrefix(id).length).split(/[-.]/)[0];
    const prev = out[base];
    if (!prev || prev.uploadedAt <= f.uploadedAt) out[base] = f;
  }
  return out;
}
