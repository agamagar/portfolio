// The site-wide serif. Every serif rule reads var(--font-serif); this module owns the
// four choices, the saved pick, and the lazy Google Fonts load. index.html carries a
// tiny copy of the apply step so a saved pick is in place before first paint (keep the
// two in step: key "serif-font", same stacks).
export const SERIF_KEY = "serif-font";
export const SERIFS = [
  { id: "newsreader", label: "Newsreader", stack: '"Newsreader", Georgia, "Times New Roman", serif', css: null },
  { id: "corben", label: "Corben", stack: '"Corben", Georgia, "Times New Roman", serif', css: "Corben:wght@400;700" },
  { id: "bitter", label: "Bitter", stack: '"Bitter", Georgia, "Times New Roman", serif', css: "Bitter:ital,wght@0,400..700;1,400..500" },
  { id: "brawler", label: "Brawler", stack: '"Brawler", Georgia, "Times New Roman", serif', css: "Brawler:wght@400;700" },
];
const listeners = new Set();

export function getSerif() {
  let id = "newsreader";
  try { id = localStorage.getItem(SERIF_KEY) || id; } catch { /* storage blocked */ }
  return SERIFS.some((s) => s.id === id) ? id : "newsreader";
}

function loadSerif(s) {
  if (!s.css || document.getElementById("serif-" + s.id)) return;
  for (const [rel, href, cors] of [["preconnect", "https://fonts.googleapis.com"], ["preconnect", "https://fonts.gstatic.com", true]]) {
    if (document.head.querySelector(`link[rel=preconnect][href="${href}"]`)) continue;
    const l = document.createElement("link");
    l.rel = rel; l.href = href; if (cors) l.crossOrigin = "";
    document.head.appendChild(l);
  }
  const l = document.createElement("link");
  l.id = "serif-" + s.id; l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${s.css}&display=swap`;
  document.head.appendChild(l);
}

export function applySerif(id) {
  const s = SERIFS.find((x) => x.id === id) || SERIFS[0];
  loadSerif(s);
  document.documentElement.style.setProperty("--font-serif", s.stack);
  document.documentElement.dataset.serif = s.id;
  return s.id;
}

export function setSerif(id) {
  const next = applySerif(id);
  try { localStorage.setItem(SERIF_KEY, next); } catch { /* storage blocked */ }
  listeners.forEach((f) => f(next));
}
export function subscribeSerif(f) { listeners.add(f); return () => listeners.delete(f); }

// ---- the hero heading ("Hello! I’m Agam"): its own pick, "default" = the drawn lettering.
// --font-hero + <html data-hero-font> when a font is chosen; GreetingMark.jsx draws live text then.
export const HERO_KEY = "hero-font";
const heroListeners = new Set();
export function getHero() {
  let id = "default";
  try { id = localStorage.getItem(HERO_KEY) || id; } catch { /* storage blocked */ }
  return SERIFS.some((s) => s.id === id) ? id : "default";
}
export function applyHero(id) {
  const s = SERIFS.find((x) => x.id === id);
  const root = document.documentElement;
  if (!s) { root.style.removeProperty("--font-hero"); delete root.dataset.heroFont; return "default"; }
  loadSerif(s);
  root.style.setProperty("--font-hero", s.stack);
  root.dataset.heroFont = s.id;
  return s.id;
}
export function setHero(id) {
  const next = applyHero(id);
  try { localStorage.setItem(HERO_KEY, next); } catch { /* storage blocked */ }
  heroListeners.forEach((f) => f(next));
}
export function subscribeHero(f) { heroListeners.add(f); return () => heroListeners.delete(f); }

// Fit live text to the drawn lockup: size so the cap height is the outline's 34.2 units, and
// compress (never stretch) a line that comes out wider than the drawn one.
const CAP = 34.2, HELLO_W = 124.1, NAME_W = 208;
export const HERO_SANS = '"Google Sans Flex", "Inter", -apple-system, system-ui, sans-serif';
export async function fitHero(id, words = null) {
  // words: another greeting ({ hello, name }), set at its natural width (no stretch to the drawn "Hello!" span)
  const W = words || { hello: "Hello!", name: "I\u2019m Agam" };
  const s = SERIFS.find((x) => x.id === id) || (words ? { stack: HERO_SANS } : null); // another greeting in the default hero: the site sans
  if (!s) return null;
  const fam = s.stack.split(",")[0];
  try { await document.fonts.load(`700 40px ${fam}`, `${W.hello} ${W.name}`); } catch { /* fall back to metrics as they are */ }
  const c = document.createElement("canvas").getContext("2d");
  c.font = `700 100px ${s.stack}`;
  const fs = CAP / (c.measureText("H").actualBoundingBoxAscent / 100);
  c.font = `700 ${fs}px ${s.stack}`;
  // optical fit: put the INK (not the advance box) on the drawn lockup's edges, so side bearings
  // and width differences between fonts leave no gap beside the face. "Hello!" spans the drawn
  // H..! ink (62.9164..187); a narrower word gets tracking, a wider one is compressed.
  const ink = (t) => { const m = c.measureText(t); return { l: m.actualBoundingBoxLeft, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, adv: m.width }; };
  const h = ink(W.hello), n = ink(W.name);
  const hello = words ? { len: null, ls: 0 } : h.w > HELLO_W ? { len: h.adv * (HELLO_W / h.w), ls: 0 } : { len: null, ls: (HELLO_W - h.w) / 5 };
  const hs = hello.len ? HELLO_W / h.w : 1, ns = n.w > NAME_W ? NAME_W / n.w : 1;
  // where this font's "!" is centred, against the drawn one (181.7): the drag handle that replaces the "!"
  // on hover (HelloFlip.jsx) is drawn there, so it lands on the live glyph, not on the outline's place
  const bang = ink("!");
  const hx = 62.9164 + h.l * hs + (words ? 9 : 0); // another greeting: a gap from the face
  const bAdv = hello.len ? bang.adv * hs : bang.adv;
  const hEnd = hx + (hello.len ?? h.adv + 6 * hello.ls) - (hello.len ? 0 : hello.ls);
  const bangDx = hEnd - bAdv / 2 - 181.7;
  return { fs, hx, hello, nx: n.l * ns, name: ns < 1 ? n.adv * ns : null, bangDx };
}
