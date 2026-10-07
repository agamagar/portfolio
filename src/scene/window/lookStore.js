// The window scene's look, chosen from the header (SceneControls.jsx) and followed by
// the scene (useWindowScene.js): Dreamlike by default (30-locked-brief), remembered per
// visitor in localStorage (a convenience; the page renders the default without it).
// A ?look= in the URL pins the scene and wins over this.

import { LOOK_NAMES, DEFAULT_LOOK, normalizeLook } from "./looks.js";

const KEY = "wscene-look";
const subs = new Set();
let current = null;

// unfinished: left out of the public build's menu (VITE_PUBLIC_SITE, amplify.yml) until it
// is done; dev and ?look= still reach it. Cyberpunk's build stopped part way (6 Oct)
const PUBLIC_SITE = import.meta.env.VITE_PUBLIC_SITE === "1";
export const LOOKS = [
  { id: "dreamlike", label: "Dreamlike", hint: "The moon in the window, glowing motes" },
  { id: "heightened", label: "Heightened", hint: "True to the room, light and air pushed" },
  { id: "photo", label: "Photo-true", hint: "As the phone saw it" },
  { id: "cyberpunk", label: "Cyberpunk", hint: "Neon past the bamboo, a pink lamp in the dark", unfinished: true },
].filter((l) => LOOK_NAMES.includes(l.id) && !(PUBLIC_SITE && l.unfinished));

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
