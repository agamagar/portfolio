// The room's cache (2026-10-18, "keep it in cache and load it immediately"). Scope: only the
// files the room needs; every other request goes straight to the network, untouched.
//  - /assets/*  Vite's hashed bundles and chunks: cache-first (a name never changes content)
//  - /window-scene/, /room/, /faces/  the room's stills, posters and models (names do not
//    change with content): stale-while-revalidate, so a return visit is served from disk and
//    a changed file arrives one visit later
//  - the page sends {type:"precache", urls} once the home page is idle, so the room's files
//    are already stored when the visitor first clicks
// Bump VERSION to drop everything stored (the old caches are deleted on activate).
const VERSION = "room-v1";
const ROOM = /^\/(window-scene|room|faces)\//;
const HASHED = /^\/assets\//;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith("room-") && k !== VERSION) await caches.delete(k);
      await self.clients.claim();
    })()
  )
);

self.addEventListener("message", (e) => {
  if (!e.data || e.data.type !== "precache" || !Array.isArray(e.data.urls)) return;
  e.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      for (const u of e.data.urls) {
        try {
          const url = new URL(u, self.location.origin);
          if (url.origin !== self.location.origin || !(ROOM.test(url.pathname) || HASHED.test(url.pathname))) continue;
          if (await cache.match(url.pathname)) continue;
          const r = await fetch(url.pathname);
          if (r.ok) await cache.put(url.pathname, r);
        } catch {
          /* offline or missing: the page fetches it itself */
        }
      }
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const hashed = HASHED.test(url.pathname);
  if (!hashed && !ROOM.test(url.pathname)) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(url.pathname);
      if (hit && hashed) return hit;
      const net = fetch(req).then((r) => {
        if (r.ok && r.status === 200) cache.put(url.pathname, r.clone());
        return r;
      });
      if (hit) {
        net.catch(() => {});
        return hit;
      }
      return net;
    })()
  );
});
