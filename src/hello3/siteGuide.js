// THE GUIDE'S EYES: which [data-guide] elements are on screen, and where they are, without per-frame layout reads.
//  - an IntersectionObserver says which targets are at least half in view (or fill half the viewport);
//  - their rects are cached (from the observer entry, then refreshed after a scroll ends, on resize and on a slow
//    rescan) and shifted by the scroll delta, which is a plain number read, so a moving target is tracked exactly
//    while the page scrolls;
//  - "best" picks the highest priority, ties by distance to the viewport centre, skipping targets it released
//    recently so it never ping-pongs.
import { applyGuideRules } from "./guideTargets";

export function createGuide() {
  const T = new Map(); // el -> { el, pr, label, vis, rect, sy, rel }
  let io = null, scanTimer = 0, scrollTimer = 0, active = false;
  const prOf = (el) => { const n = parseFloat(el.getAttribute("data-guide")); return Number.isFinite(n) ? n : 1; };
  const read = (t) => { const r = t.el.getBoundingClientRect(); t.rect = { l: r.left, t: r.top, r: r.right, b: r.bottom }; t.sy = window.scrollY; };
  const refresh = () => { for (const t of T.values()) if (t.vis) read(t); };
  const scan = () => {
    applyGuideRules();
    const live = new Set(document.querySelectorAll("[data-guide]"));
    for (const el of live) {
      let t = T.get(el);
      if (!t) { t = { el, pr: 1, label: "", vis: false, rect: { l: 0, t: 0, r: 0, b: 0 }, sy: window.scrollY, rel: -1e9 }; T.set(el, t); io?.observe(el); }
      t.pr = prOf(el); t.label = el.getAttribute("data-guide-label") || "";
    }
    for (const [el] of T) if (!live.has(el)) { io?.unobserve(el); T.delete(el); }
  };
  const onIO = (entries) => {
    for (const e of entries) {
      const t = T.get(e.target); if (!t) continue;
      t.vis = e.isIntersecting && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= window.innerHeight * 0.5);
      const r = e.boundingClientRect; t.rect = { l: r.left, t: r.top, r: r.right, b: r.bottom }; t.sy = window.scrollY;
    }
  };
  const onScroll = () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(refresh, 140); };
  return {
    start() {
      if (active) return; active = true;
      io = new IntersectionObserver(onIO, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      scan(); scanTimer = setInterval(scan, 2000);
      window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll, { passive: true });
    },
    stop() {
      if (!active) return; active = false;
      io?.disconnect(); io = null; clearInterval(scanTimer); clearTimeout(scrollTimer); T.clear();
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
    },
    // the rect now: the cached one shifted by how far the page has scrolled since it was read
    rect(t) { const dy = t.sy - window.scrollY, r = t.rect; return { l: r.l, t: r.t + dy, r: r.r, b: r.b + dy }; },
    best(now) {
      let b = null, bs = -1e18;
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      for (const t of T.values()) {
        if (!t.vis || now - t.rel < 20000) continue;
        const r = this.rect(t), d = Math.hypot((r.l + r.r) / 2 - cx, (r.t + r.b) / 2 - cy);
        const s = t.pr * 1e4 - d;
        if (s > bs) { bs = s; b = t; }
      }
      return b;
    },
    isVisible: (t) => T.has(t.el) && t.vis,
  };
}

// 1-D gradient noise (Perlin style), about [-1, 1]
const H = (i) => { let x = (i | 0) * 374761393 + 668265263; x = (x ^ (x >>> 13)) * 1274126177; return ((x ^ (x >>> 16)) >>> 0) / 2147483648 - 1; };
export function noise(x) {
  const i = Math.floor(x), f = x - i, u = f * f * f * (f * (f * 6 - 15) + 10);
  const a = H(i) * f, b = H(i + 1) * (f - 1);
  return (a + (b - a) * u) * 2;
}
