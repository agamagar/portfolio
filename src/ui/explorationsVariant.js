// Variant switch for "The explorations" on the Scheduled Delivery case study. "original" is the board alone;
// "detour" also mounts the hand-drawn copy (SchedExplorationsDetour) right after it so the two can be compared.
// The pick lives in localStorage; ?explorations=detour (or original) wins for the visit. Original is the default.
import { useSyncExternalStore } from "react";

export const EXPLORATION_VARIANTS = [
  { id: "original", label: "Original", note: "Chip board" },
  { id: "detour", label: "Detour", note: "Hand-drawn, below the original" },
];
const KEY = "explorations-variant";
const DEFAULT = "original";
const valid = (id) => EXPLORATION_VARIANTS.some((v) => v.id === id);
const listeners = new Set();

function read() {
  try { const q = new URLSearchParams(window.location.search).get("explorations"); if (valid(q)) return q; } catch { /* no window */ }
  try { const s = window.localStorage.getItem(KEY); if (valid(s)) return s; } catch { /* storage blocked */ }
  return DEFAULT;
}
let current = typeof window === "undefined" ? DEFAULT : read();

export const getExplorationsVariant = () => current;
export function setExplorationsVariant(id) {
  if (!valid(id) || id === current) return;
  current = id;
  try { window.localStorage.setItem(KEY, id); } catch { /* storage blocked */ }
  try {
    const u = new URL(window.location.href);
    if (u.searchParams.has("explorations")) { u.searchParams.set("explorations", id); window.history.replaceState(window.history.state, "", u); }
  } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const useExplorationsVariant = () => useSyncExternalStore(subscribe, getExplorationsVariant, () => DEFAULT);
