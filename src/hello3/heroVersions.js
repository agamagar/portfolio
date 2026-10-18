// Hero versions: a small registry so the eye menu (ui/HeroSwitch.jsx) and the page (Hello.jsx)
// share one list. To add a version: add a row here and render it in Hello.jsx's hero.
// The pick lives in localStorage, a ?hero=<id> URL param wins for the visit, v1 is the default.
import { useSyncExternalStore } from "react";

export const HERO_VERSIONS = [
  { id: "v1", label: "v1", note: "Hello! I'm Agam" },
  { id: "v2", label: "v2", note: "Tagline + small face" },
  { id: "v3", label: "v3", note: "Hi, I'm Agam + tagline" },
  { id: "v4", label: "v4", note: "Centred, face in the text" },
];
const KEY = "hero-version";
const DEFAULT = "v1";
const valid = (id) => HERO_VERSIONS.some((v) => v.id === id);
const listeners = new Set();

function read() {
  try {
    const q = new URLSearchParams(window.location.search).get("hero");
    if (valid(q)) return q;
  } catch { /* no window */ }
  try {
    const s = window.localStorage.getItem(KEY);
    if (valid(s)) return s;
  } catch { /* storage blocked */ }
  return DEFAULT;
}

let current = typeof window === "undefined" ? DEFAULT : read();

export const getHeroVersion = () => current;

export function setHeroVersion(id) {
  if (!valid(id) || id === current) return;
  current = id;
  try { window.localStorage.setItem(KEY, id); } catch { /* storage blocked */ }
  try { // the explicit pick supersedes a ?hero= param
    const u = new URL(window.location.href);
    if (u.searchParams.has("hero")) { u.searchParams.set("hero", id); window.history.replaceState(window.history.state, "", u); }
  } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const useHeroVersion = () => useSyncExternalStore(subscribe, getHeroVersion, () => DEFAULT);

// v3's copy: the greeting is two lines in v1's lockup (the face sits beside line one), then the tagline
export const HERO_V3_COPY = { hello: "Hi,", name: "I\u2019m Agam" };
export const HERO_V3_TAG = "Designing at the intersection of people and tech";
