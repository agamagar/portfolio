// WHERE THE GUIDE LOOKS (the Agam cursor once it is activated, SiteCursor.jsx + siteGuide.js).
// Any element can opt in by itself:   data-guide="3"   (priority, higher wins; empty = 1)
//                                     data-guide-label="This doubled AOV"   (the word on the cursor's pill)
// These rules tag elements by route without touching the page code. Labels come only from text that is already
// on the page (a heading, a caption, an aria-label); with none the pill just says "Agam".
const cut = (s, n = 38) => { s = (s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s; };
const h2s = () => [...document.querySelectorAll("h2")];
// the heading just above an element, in document order
const prevH2 = (el) => { let best = null; for (const h of h2s()) { if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) best = h; else break; } return best ? cut(best.textContent) : ""; };
// the first match of sel that follows the anchor in document order
const firstAfter = (anchorSel, sel) => { const a = document.querySelector(anchorSel); if (!a) return []; const m = [...document.querySelectorAll(sel)].find((e) => a.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING && !a.contains(e)); return m ? [m] : []; };
const text = (sel, re) => [...document.querySelectorAll(sel)].filter((e) => re.test((e.textContent || "").trim()));

export const GUIDE_RULES = [
  {
    path: /^\/work\/scheduled-delivery/,
    items: [
      { find: () => [...document.querySelectorAll(".article__figure")].slice(0, 1), p: 5, label: () => cut(document.querySelector("h1")?.textContent) }, // the hero visual
      { find: () => [...document.querySelectorAll("video.std__video")], p: 4, label: prevH2 }, // the key phone videos
      { find: () => [...document.querySelectorAll(".rex__sec")], p: 4, label: prevH2 }, // the Impact numbers
      { find: () => firstAfter("#sec-11", ".article__figure, figure"), p: 4, label: () => cut(document.querySelector("#sec-11")?.textContent) }, // the explorations board
      { find: () => text("section.rwf", /^Timeline/).slice(0, 1), p: 3, label: () => "Timeline" }, // the timeline
      { find: () => firstAfter("#sec-15", ".article__figure, figure, video"), p: 4, label: () => cut(document.querySelector("#sec-15")?.textContent) }, // the go-to-market screens
    ],
  },
  {
    path: /^\/$/,
    items: [
      { find: () => [...document.querySelectorAll(".wg__card")], p: 1, label: (e) => cut(e.getAttribute("aria-label") || e.querySelector("img")?.alt) }, // project cards
      { find: () => [...document.querySelectorAll(".sq__card")], p: 1, label: (e) => cut(e.getAttribute("aria-label") || e.querySelector("h3, h4, .sq__name")?.textContent) }, // side quests
    ],
  },
];

// stamps data-guide / data-guide-label for the current route (never overrides an attribute that is already there)
export function applyGuideRules(pathname = location.pathname) {
  for (const g of GUIDE_RULES) {
    if (!g.path.test(pathname)) continue;
    for (const it of g.items) {
      let els = [];
      try { els = it.find(); } catch { /* a selector that does not exist here */ }
      for (const e of els) {
        if (!e.hasAttribute("data-guide")) e.setAttribute("data-guide", String(it.p));
        if (!e.hasAttribute("data-guide-label")) { const l = it.label?.(e); if (l) e.setAttribute("data-guide-label", l); }
      }
    }
  }
}
