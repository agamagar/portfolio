// OPENING A PROJECT (project-transition, 11 Oct 2026; Agam: "when I open my projects
// the transition should be smooth; if it takes time, plan for a shimmer").
//
// One entry point, runRouteTransition(to, commit), called by App's router for every
// route change (link, side-quest caption, back/forward). Between the home page and a
// case study it does three things:
//
// 1. WAITS A BEAT FOR WHAT THE PAGE NEEDS, BEFORE THE SWAP. The hero asset (image,
//    poster, the SD heart chunk) and the fonts are usually already warm, because a
//    hover or focus on any /work/ link prefetched them (prefetchProject). The swap
//    waits for them up to READY_MS. Inside a View Transition the old page is held as
//    a frozen snapshot meanwhile, so the wait never shows as a blank frame.
// 2. MOVES the clicked card into the case's hero (a shared-element View Transition),
//    fades the home page back and lets the case's own staggered entrance follow. Back
//    reverses it: the hero shrinks back into its card, at the scroll you left from.
// 3. IF THE PAGE IS STILL NOT READY after READY_MS, the new page opens on a shimmer
//    skeleton shaped like its real layout (square blocks measured from the hidden
//    page, one diagonal light sweeping across them: the home page's load language,
//    shimmer-glow's tokens). When the page is ready every block warms into the
//    bloom and the content resolves out of it, the same hand-off the home page uses.
//    Ready quickly means no skeleton at all, so it never flashes.
//
// Reduced motion: no moves, no sweep; the swap is instant with a 160 ms fade, and a
// slow page shows still blocks that cross-fade to the content.
// Browsers without View Transitions: the same wait, skeleton and entrance, minus the
// shared-element move.

const READY_MS = 150;
const NO_SKELETON_BEAT_MS = 700; // a case that opts out of the skeleton: the old page is held (View Transition snapshot) this long for its hero
const SKELETON_CAP_MS = 2600; // the skeleton never outlives this: the page shows regardless
const isCase = (p) => p.startsWith("/work/") && p !== "/work/resume";
const isHome = (p) => p === "/" || p === "/portfolio";
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const frame = () => new Promise((r) => requestAnimationFrame(() => r()));

/* ---------- prefetch: hover or focus on a project link warms its hero ---------- */

let eagerSlugs = []; // cases whose hero is warmed at idle, so opening them never waits (no skeleton)
let assetsFor = () => null; // App supplies: slug -> { images: [], warm: () => Promise }
const warmed = new Map(); // slug -> Promise (settles when the hero's assets are decoded)

export function configureProjectTransition(opts) {
  if (opts.assetsFor) assetsFor = opts.assetsFor;
  if (opts.eagerSlugs) eagerSlugs = opts.eagerSlugs;
}

const slugOf = (path) => path.slice("/work/".length).split(/[?#]/)[0];

function decodeImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.fetchPriority = "high";
    img.src = src;
    (img.decode ? img.decode() : new Promise((r, j) => { img.onload = r; img.onerror = j; })).then(resolve, resolve);
  });
}

export function prefetchProject(path) {
  if (!isCase(path)) return Promise.resolve();
  const slug = slugOf(path);
  if (warmed.has(slug)) return warmed.get(slug);
  const a = assetsFor(slug) || {};
  const p = Promise.all([
    ...(a.images || []).filter(Boolean).map(decodeImage),
    a.warm ? Promise.resolve(a.warm()).catch(() => {}) : null,
  ]).then(() => {});
  warmed.set(slug, p);
  return p;
}

const fontsReady = () => (document.fonts && document.fonts.status !== "loaded" ? document.fonts.ready : Promise.resolve());

/* ---------- the clicked link, and the scroll it was clicked at ---------- */

let lastPress = { el: null, at: 0 };
let installed = false;
export function installProjectIntent() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
  idle(() => eagerSlugs.forEach((slug) => prefetchProject("/work/" + slug)));
  const linkOf = (e) => {
    const a = e.target?.closest?.("a[href]");
    if (!a) return null;
    const href = a.getAttribute("href");
    return href && isCase(href) ? { a, href } : null;
  };
  const warm = (e) => { const l = linkOf(e); if (l) prefetchProject(l.href); };
  document.addEventListener("pointerover", warm, { passive: true });
  document.addEventListener("focusin", warm);
  document.addEventListener("touchstart", warm, { passive: true });
  // capture: runs before the link's own handler pushes the new history entry, so the
  // scroll is stored on the entry being LEFT (back restores it) and the source is known
  document.addEventListener("click", (e) => {
    const l = linkOf(e);
    if (!l || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    lastPress = { el: l.a, at: performance.now() };
    rememberScroll();
    prefetchProject(l.href);
  }, true);
}

export function rememberScroll() {
  try { history.replaceState({ ...(history.state || {}), ptScroll: Math.round(window.scrollY) }, ""); } catch { /* ignore */ }
}
export const savedScroll = () => history.state?.ptScroll;

/* ---------- readiness of the page that is now on screen ---------- */

function mediaReady(el) {
  if (!el) return true;
  if (el.tagName === "IMG") return el.complete && el.naturalWidth > 0;
  if (el.tagName === "VIDEO") return el.readyState >= 2 || (!!el.poster && posterOk.has(el.poster));
  return true;
}
const posterOk = new Set();
function pageReady() {
  const page = document.querySelector(".page--article");
  if (!page) return true;
  if (page.dataset.loadReveal === "wait") return false; // the case's own gate (fonts + hero) still holding
  if (document.fonts && document.fonts.status !== "loaded") return false;
  const hero = page.querySelector(".article__hero-board");
  if (!hero) return true;
  if (hero.classList.contains("article__hero-board--shader")) return !!hero.querySelector("canvas");
  return mediaReady(hero.querySelector(".article__hero-img"));
}

/* ---------- the skeleton ---------- */

// shimmer-glow's tokens (hello3/Hello.jsx, the home page's load overlay), as CSS
// custom properties so projectTransition.css can mix them
function paintTokens(root) {
  const dark = document.documentElement.classList.contains("dark");
  const set = (k, c) => root.style.setProperty(k, `rgba(${c.join(",")})`);
  set("--pt-base", dark ? [255, 255, 255, 0.07] : [0, 0, 0, 0.065]);
  set("--pt-lit", dark ? [255, 255, 255, 0.22] : [255, 255, 255, 0.85]);
  set("--pt-bloom", dark ? [255, 238, 218, 0.55] : [255, 246, 236, 0.95]);
}

// one block per element the reader will see first, at its real box (the page is laid
// out under the cover, so the blocks sit exactly where the content will resolve)
function measureBlocks() {
  const vh = window.innerHeight;
  const out = [];
  const add = (el, kind) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.top > vh || r.bottom < 0) return;
    out.push({ x: r.left, y: r.top, w: r.width, h: Math.min(r.height, vh - r.top), kind });
  };
  const page = document.querySelector(".page--article");
  if (!page) return out;
  // a hero whose image has not arrived has no height yet (it is sized by the image):
  // stand a 16:9 block in for it, and let the blocks follow once it lands
  const hb = page.querySelector(".article__hero-board");
  if (hb) {
    const r = hb.getBoundingClientRect();
    if (r.height < 40 && r.width > 40 && r.top < vh) out.push({ x: r.left, y: r.top, w: r.width, h: Math.min(r.width * 0.5625, vh - r.top), kind: "hero" });
    else add(hb, "hero");
  }
  // text: one bar per rendered line, so a two-line title gets two bars
  const lines = (el, kind, max = 6) => {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const seen = [];
    for (const r of range.getClientRects()) {
      if (r.width < 8 || r.top > vh || r.bottom < 0) continue;
      const row = seen.find((s) => Math.abs(s.y - r.top) < r.height * 0.5);
      if (row) { row.x0 = Math.min(row.x0, r.left); row.x1 = Math.max(row.x1, r.right); }
      else seen.push({ y: r.top, h: r.height, x0: r.left, x1: r.right });
    }
    seen.slice(0, max).forEach((s) => out.push({ x: s.x0, y: s.y + s.h * 0.18, w: s.x1 - s.x0, h: s.h * 0.64, kind }));
  };
  lines(page.querySelector(".article__title"), "title", 3);
  lines(page.querySelector(".article__eyebrow"), "text", 1);
  lines(page.querySelector(".article__lead--head, .article__meta"), "text", 4);
  page.querySelectorAll(".article__fact").forEach((f) => add(f, "text"));
  page.querySelectorAll(".article__index li > a, .article__index-group-head").forEach((a, i) => { if (i < 14) lines(a, "text", 1); });
  const body = page.querySelector(".article__body");
  if (body) [...body.querySelectorAll("h2, p, figure, img")].slice(0, 12).forEach((el) => (el.tagName === "P" || el.tagName === "H2" ? lines(el, "text", 5) : add(el, "hero")));
  return out;
}

let skel = null; // { root, gated }
function placeBlocks(root, blocks) {
  while (root.children.length > blocks.length) root.lastChild.remove();
  blocks.forEach((b, i) => {
    const d = root.children[i] || root.appendChild(document.createElement("i"));
    d.className = "pt-skel__b pt-skel__b--" + b.kind;
    // placed by transform, so gliding to a new box is not a layout shift
    d.style.cssText = `transform:translate(${b.x}px,${b.y}px);width:${b.w}px;height:${b.h}px`;
  });
}
function showSkeleton() {
  hideSkeleton(true);
  const root = document.createElement("div");
  root.className = "pt-skel";
  root.setAttribute("aria-hidden", "true");
  paintTokens(root);
  placeBlocks(root, measureBlocks());
  document.body.appendChild(root);
  document.documentElement.dataset.ptHold = "";
  skel = { root, gated: !!document.querySelector('.page--article[data-load-reveal]') };
  return skel;
}

// the hand-off: each block warms into the bloom, the content resolves out of it,
// then the light fades under it (projectTransition.css, pt-skel--glow)
function resolveSkeleton() {
  if (!skel) return;
  const { root } = skel;
  delete document.documentElement.dataset.ptHold;
  document.documentElement.dataset.ptResolve = skel.gated ? "gated" : "";
  root.classList.add("pt-skel--glow");
  const end = () => {
    if (skel?.root === root) skel = null;
    root.remove();
    if (!skel) delete document.documentElement.dataset.ptResolve;
  };
  setTimeout(end, reduced() ? 260 : 900);
}
function hideSkeleton(now) {
  if (!skel) return;
  if (now) {
    skel.root.remove();
    delete document.documentElement.dataset.ptHold;
    delete document.documentElement.dataset.ptResolve;
    skel = null;
  } else resolveSkeleton();
}

// polls (one cheap check per frame) until the page on screen is ready, then hands off
async function watchUntilReady(token) {
  const start = performance.now();
  // a video hero is ready as soon as its poster is: warm that too
  const v = document.querySelector(".page--article .article__hero-board video[poster]");
  if (v && !posterOk.has(v.poster)) decodeImage(v.poster).then(() => posterOk.add(v.poster));
  // the page keeps laying out under the cover (a hero image arriving gives the hero
  // its height): the blocks glide to the new boxes, so the light lands where the
  // content will be
  const page = document.querySelector(".page--article");
  let h = page?.scrollHeight;
  while (token === navToken && !pageReady() && performance.now() - start < SKELETON_CAP_MS) {
    await frame();
    if (skel && page && page.scrollHeight !== h) { h = page.scrollHeight; placeBlocks(skel.root, measureBlocks()); }
  }
  if (skel && page && page.scrollHeight !== h) {
    placeBlocks(skel.root, measureBlocks());
    if (!reduced()) await sleep(320); // let them land before the light hands off
  }
  if (token !== navToken) return;
  resolveSkeleton();
}

/* ---------- the route change itself ---------- */

let navToken = 0;
let running = null; // the View Transition in flight, if any

function sourceFor(to) {
  // a card's whole face is the shared element; a text row has no picture to grow,
  // so it gets the page cross-fade only
  const el = lastPress.el && performance.now() - lastPress.at < 2000 ? lastPress.el : null;
  if (!el || el.getAttribute("href") !== to || !el.isConnected) return null;
  if (el.classList.contains("wg__card")) return el;
  if (el.classList.contains("wg__item")) return el.querySelector(".wg__card"); // phones: the card's visual inside its captioned link
  const media = el.closest(".ap__card")?.querySelector(".ap__plate, video, img"); // a side quest: its plate
  return media || null;
}
function inView(el) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

/**
 * commit(): applies the route change synchronously (pushState if needed, set the path
 * in React state via flushSync, scroll). Returns nothing.
 */
export async function runRouteTransition(from, to, commit) {
  const token = ++navToken;
  performance.mark("pt:route");
  const opening = isHome(from) && isCase(to);
  const closing = isCase(from) && isHome(to);
  const html = document.documentElement;
  if (!opening && !closing) {
    hideSkeleton(true);
    commit();
    return;
  }
  hideSkeleton(true);
  running?.skipTransition?.();

  // 1. the beat: the hero's assets + fonts, capped (opening only; home is warm)
  const assets = opening ? prefetchProject(to) : Promise.resolve();
  let readyBefore = await Promise.race([
    Promise.all([assets, fontsReady()]).then(() => true),
    sleep(opening ? (assetsFor(slugOf(to))?.noSkeleton ? NO_SKELETON_BEAT_MS : READY_MS) : 0).then(() => false),
  ]);
  if (token !== navToken) return;

  const afterCommit = () => {
    if (opening) {
      // ready before the swap: open straight onto the content (the SD page's own
      // gate then clears in a frame or two, inside its de-mist). Not ready: the
      // skeleton, from the new page's first frame, until it is.
      if (!readyBefore && !assetsFor(slugOf(to))?.noSkeleton) {
        showSkeleton();
        watchUntilReady(token);
      }
    }
  };

  const vt = typeof document.startViewTransition === "function" && !reduced();
  if (!vt) {
    html.dataset.pt = reduced() ? "fade" : closing ? "back" : "open";
    commit();
    afterCommit();
    setTimeout(() => { if (token === navToken) delete html.dataset.pt; }, 400);
    return;
  }

  // 2. the move. Name the shared pair: card (old) -> hero (new), or the reverse.
  // A case with its own load reveal (SD: the heart rises out of a de-mist) keeps it as
  // its entrance: moving its live, blurred, scaled hero as a shared element as well
  // doubled the animation and stalled the GPU for ~0.5 s twice (measured, prod).
  const ownReveal = isCase(to) ? !!assetsFor(slugOf(to))?.ownReveal : !!assetsFor(slugOf(from))?.ownReveal;
  const src = ownReveal ? null : opening ? sourceFor(to) : document.querySelector(".page--article .article__hero-board");
  const shared = !!(src && inView(src));
  if (shared) src.style.viewTransitionName = "pt-hero";
  html.dataset.pt = closing ? "back" : "open";
  let dst = null;
  performance.mark("pt:vt-start");
  const t = document.startViewTransition(async () => {
    if (shared) src.style.viewTransitionName = "";
    performance.mark("pt:commit-start");
    commit();
    performance.mark("pt:commit-end");
    // a case with its own reveal opens on its wait cover (one flat field), and its gate
    // needs a few rendered frames, which are held while this callback runs: it always
    // opens on the skeleton, which hands off as its reveal begins
    if (opening && ownReveal) readyBefore = false;
    if (shared) {
      dst = opening
        ? document.querySelector(".page--article .article__hero-board")
        : document.querySelector(`.wg__card[data-project="${from}"], .wg__item[data-project="${from}"] > .wg__card`);
      if (dst && inView(dst)) dst.style.viewTransitionName = "pt-hero";
      else dst = null;
    }
    afterCommit();
  });
  running = t;
  t.ready.then(() => performance.mark("pt:animating"), () => {});
  const clean = () => {
    if (dst) dst.style.viewTransitionName = "";
    if (src) src.style.viewTransitionName = "";
    if (running === t) running = null;
    if (token === navToken) delete html.dataset.pt;
  };
  t.finished.then(clean, clean);
}
