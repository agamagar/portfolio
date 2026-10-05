// Makes the figure LayerMap live INSIDE Agentation, with no separate control.
//
// Agentation injects a `<style id="feedback-cursor-styles">` into <head> the
// moment its annotate mode turns on, and removes it the moment it turns off
// (page-toolbar source: the cursor effect is gated on `isActive`). That style's
// presence is therefore an exact, version-stable boolean for "annotate mode on."
// We watch <head> for it and drive the hotspots off it — so entering annotate
// mode reveals a figure's layers, exiting hides them. Nothing to toggle.
//
// But "annotate mode on" is slightly broader than "the element picker is live":
// while a comment popup is open the picker is suspended (page-toolbar bails on
// `pendingAnnotation`). Agentation marks that popup with a stable
// `[data-annotation-popup]` attribute, so we additionally treat the picker as
// inactive whenever a popup is mounted — the hotspots don't sit there inert mid-
// annotation. (Draw/Layout sub-modes render their own full-screen canvas in
// Agentation's body portal at very high z-index, above the figure's hotspots, so
// they neither steal clicks nor need handling here.)
//
// We also read Agentation's currently-selected annotation accent off its portal
// root (`[data-agentation-root][data-agentation-accent]`) and map it to the
// global `--agentation-color-<id>` token Agentation publishes on :root, so the
// hotspots wear the same colour as the annotations they create — and follow it
// live if you change it (root-scoped attribute observer).
//
// Agentation is mounted only in dev, so this whole module no-ops in production.

import { useSyncExternalStore } from "react";

const CURSOR_STYLE_ID = "feedback-cursor-styles"; // present iff annotate mode on
const POPUP_SELECTOR = "[data-annotation-popup]"; // present while a comment popup is open
const ROOT_SELECTOR = "[data-agentation-root]";
const ACCENT_ATTR = "data-agentation-accent";

const DEV =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV;

let active = false;
let accentId = null;
const subs = new Set();
let headObs = null;
let rootObs = null;
let observedRoot = null;

function readActive() {
  if (typeof document === "undefined") return false;
  if (!document.getElementById(CURSOR_STYLE_ID)) return false; // annotate mode off
  if (document.querySelector(POPUP_SELECTOR)) return false; // mid-annotation popup
  return true;
}

function readAccent() {
  if (typeof document === "undefined") return null;
  const root = document.querySelector(ROOT_SELECTOR);
  return root ? root.getAttribute(ACCENT_ATTR) : null;
}

function emit() {
  for (const f of subs) f();
}

// Scope the heavier (childList + attribute) observer to Agentation's own portal
// subtree, so it sees popup mount/unmount and accent changes without watching the
// whole document. The root is stable once Agentation mounts.
function ensureRootObserver() {
  if (typeof document === "undefined") return;
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root || root === observedRoot) return;
  if (rootObs) rootObs.disconnect();
  rootObs = new MutationObserver(recompute);
  rootObs.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [ACCENT_ATTR],
  });
  observedRoot = root;
}

function recompute() {
  ensureRootObserver();
  const nextActive = readActive();
  // keep the last-known accent while inactive; refresh it only when live
  const nextAccent = nextActive ? readAccent() : accentId;
  if (nextActive === active && nextAccent === accentId) return;
  active = nextActive;
  accentId = nextAccent;
  emit();
}

function start() {
  if (headObs || typeof document === "undefined" || !document.head) return;
  headObs = new MutationObserver(recompute); // cursor style add/remove
  headObs.observe(document.head, { childList: true });
  recompute();
}

function stop() {
  if (headObs) headObs.disconnect();
  if (rootObs) rootObs.disconnect();
  headObs = rootObs = observedRoot = null;
  active = false;
  accentId = null;
}

export function subscribeAgentation(cb) {
  if (!DEV) return () => {}; // Agentation never mounts in prod → nothing to watch
  subs.add(cb);
  start();
  return () => {
    subs.delete(cb);
    if (subs.size === 0) stop();
  };
}

export function getAgentationActive() {
  return active;
}

export function getAgentationAccentId() {
  return accentId;
}

// True exactly while Agentation's element picker is live (annotate mode on, no
// open comment popup).
export function useAgentationActive() {
  return useSyncExternalStore(subscribeAgentation, getAgentationActive, () => false);
}

// The id of Agentation's currently-selected annotation colour (e.g. "blue"), or
// null. Maps to the global `--agentation-color-<id>` token.
export function useAgentationAccentId() {
  return useSyncExternalStore(subscribeAgentation, getAgentationAccentId, () => null);
}
