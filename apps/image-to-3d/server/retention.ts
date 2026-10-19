/**
 * Retention: source photos are deleted 24 hours after upload, models (GLB, thumbnail, spec and
 * the library entry) after 30 days, and uploads that never became a saved model after 24 hours.
 *
 * Reads already refuse expired files (library.ts presentItem, handlers/file.ts), so the data
 * is unreachable the moment it expires; this sweep physically deletes it. It runs from the
 * cron route (vercel.json crons) and is safe to run as often as you like.
 */
import type { Deps } from "./deps.js";
import { requireKv, requireStore } from "./deps.js";
import { log } from "./log.js";
import { MODEL_TTL_MS, mutateIndex, readIndex, SOURCE_KEYS, SOURCE_TTL_MS, userPrefix } from "./library.js";
import { ROOT, type StoredFile } from "./store/types.js";

export interface SweepResult {
  users: number;
  filesDeleted: number;
  itemsExpired: number;
  sourcesCleared: number;
}

const USERS_ROOT = `${ROOT}/users/`;

/** i3d/users/<uid>/items/<id>/<name>-xxxx.ext → { uid, id, name } */
function parse(f: StoredFile): { uid: string; id: string; name: string } | null {
  const m = /^i3d\/users\/([^/]+)\/items\/([^/]+)\/([^/.-]+)/.exec(f.pathname);
  return m ? { uid: m[1], id: m[2], name: m[3] } : null;
}

export async function sweep(d: Deps, now = Date.now()): Promise<SweepResult> {
  const store = requireStore(d);
  const kv = requireKv(d);
  const all = await store.list(USERS_ROOT);
  const uids = new Set<string>();
  for (const f of all) {
    const m = /^i3d\/users\/([^/]+)\//.exec(f.pathname);
    if (m) uids.add(m[1]);
  }
  const result: SweepResult = { users: uids.size, filesDeleted: 0, itemsExpired: 0, sourcesCleared: 0 };

  for (const uid of uids) {
    const { doc } = await readIndex(store, uid);
    const byId = new Map(doc.items.map((i) => [i.id, i]));
    const doomed: StoredFile[] = [];
    for (const f of all.filter((x) => x.pathname.startsWith(userPrefix(uid)))) {
      const p = parse(f);
      if (!p) continue; // index files are rewritten below
      const age = now - Date.parse(f.uploadedAt);
      const item = byId.get(p.id);
      const created = item ? Date.parse(item.createdAt) : null;
      if (!item) {
        if (age > SOURCE_TTL_MS) doomed.push(f); // an upload that was never saved
      } else if (now - created! > MODEL_TTL_MS) {
        doomed.push(f);
      } else if ((SOURCE_KEYS as readonly string[]).includes(p.name) && now - created! > SOURCE_TTL_MS) {
        doomed.push(f);
      }
    }

    const expired = doc.items.filter((i) => now - Date.parse(i.createdAt) > MODEL_TTL_MS);
    const needsClear = doc.items.filter((i) => now - Date.parse(i.createdAt) > SOURCE_TTL_MS && SOURCE_KEYS.some((k) => i.files[k]));
    if (expired.length || needsClear.length) {
      for (const i of expired) if (i.shareToken) await kv.del(`share:${i.shareToken}`);
      await mutateIndex(store, uid, (items) =>
        items
          .filter((i) => now - Date.parse(i.createdAt) <= MODEL_TTL_MS)
          .map((i) => {
            if (now - Date.parse(i.createdAt) <= SOURCE_TTL_MS) return i;
            const next = { ...i, files: { ...i.files }, sizes: { ...i.sizes } };
            for (const k of SOURCE_KEYS) {
              delete next.files[k];
              delete next.sizes[k];
            }
            return next;
          }),
      );
      result.itemsExpired += expired.length;
      result.sourcesCleared += needsClear.length;
    }
    if (doomed.length) {
      await store.del(doomed);
      result.filesDeleted += doomed.length;
    }
  }
  log("retention_sweep", { ...result });
  return result;
}
