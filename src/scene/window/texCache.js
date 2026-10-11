// The room's generated textures, remembered across reloads (annotation mv3v3k00-o9in87:
// "cache the generated scene so that the loader does not appear again"). The textures
// are pure seeded noise (roomTextures.js), the same on every load, about 12 MB of pixels
// that took a worker ~0.5 s to make; a reload reads them back from IndexedDB instead.
// Keyed by quality tier and a hash of roomTextures.js's own source, so editing the
// generator (or a deploy that changes it) drops the old copy by itself. Every call is
// wrapped: storage blocked, a private window, a quota error, a slow disk (1.5 s limit)
// all mean "no cache", and the worker generates as before. Browser only (materials.js
// loads this lazily, after its Worker check, so the node fit tools never see it).
import generatorSource from "./roomTextures.js?raw";

const DB_NAME = "portfolio-room";
const STORE = "textures";
let hash = "";
{
  let h = 2166136261;
  for (let i = 0; i < generatorSource.length; i++) h = Math.imul(h ^ generatorSource.charCodeAt(i), 16777619) >>> 0;
  hash = h.toString(36);
}
const keyFor = (quality) => `${quality}:${hash}`;

const open = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("blocked"));
  });
const request = (r) =>
  new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
const withTimeout = (promise, ms) => Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);

export function readTextures(quality) {
  return withTimeout(
    (async () => {
      const db = await open();
      try {
        const v = await request(db.transaction(STORE).objectStore(STORE).get(keyFor(quality)));
        return v && v.tree && v.quality === quality ? v : null;
      } finally {
        db.close();
      }
    })().catch(() => null),
    1500
  );
}

// fire and forget; replaces every other entry (older hashes) in the same transaction
export function writeTextures(data) {
  (async () => {
    const db = await open();
    try {
      const store = db.transaction(STORE, "readwrite").objectStore(STORE);
      const keys = await request(store.getAllKeys());
      for (const k of keys) if (typeof k === "string" && k.startsWith(data.quality + ":") && k !== keyFor(data.quality)) store.delete(k);
      await request(store.put({ quality: data.quality, tree: data.tree, speckMean: data.speckMean }, keyFor(data.quality)));
    } finally {
      db.close();
    }
  })().catch(() => {});
}
