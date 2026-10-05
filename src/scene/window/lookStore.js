// The window scene's look, chosen from the header (SceneControls.jsx) and followed by
// the scene (useWindowScene.js): Dreamlike by default (30-locked-brief), remembered per
// visitor in localStorage (a convenience; the page renders the default without it).
// A ?look= in the URL pins the scene and wins over this.

import { LOOK_NAMES, DEFAULT_LOOK, normalizeLook } from "./looks.js";

const KEY = "wscene-look";
const subs = new Set();
let current = null;

export const LOOKS = [
  { id: "dreamlike", label: "Dreamlike", hint: "The moon in the window, glowing motes" },
  { id: "heightened", label: "Heightened", hint: "True to the room, light and air pushed" },
  { id: "photo", label: "Photo-true", hint: "As the phone saw it" },
].filter((l) => LOOK_NAMES.includes(l.id));

export function getLook() {
  if (current) return current;
  try {
    current = normalizeLook(window.localStorage.getItem(KEY) || DEFAULT_LOOK);
  } catch {
    current = DEFAULT_LOOK;
  }
  return current;
}

export function setLook(name) {
  current = normalizeLook(name);
  try {
    window.localStorage.setItem(KEY, current);
  } catch {
    /* private mode: the choice lasts this visit */
  }
  subs.forEach((fn) => fn(current));
  return current;
}

export function subscribeLook(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
