// WHERE THE AGAM CURSOR PERCHES (Agam, 19 Oct 2026: "the cursor should sit at the very end of the line"): just after the
// last character of the hero headline's last line, like a text cursor that has finished typing it. Measured with a
// Range on the last visible text node of the active hero version's headline (v1's headline is SVG art, so there the
// last line is found from its glyph shapes). Returns PAGE coordinates (viewport + scroll) so a scroll does not
// need a re-measure; the caller re-measures on resize, font load, hero version switch and headline mutations.
import { getHeroVersion } from "./heroVersions";

// the element that holds the headline, per hero version
export const headlineEl = () => {
  const v = getHeroVersion();
  const sel = v === "v2" ? ".hv2__head" : v === "v3" ? ".hv3__tag" : v === "v4" || v === "v5" ? ".hv4__head" : ".hello-hero__mark-art";
  return document.querySelector(sel);
};

function textEnd(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; let n;
  while ((n = w.nextNode())) nodes.push(n);
  for (let i = nodes.length - 1; i >= 0; i--) {
    const t = nodes[i], pe = t.parentElement;
    // the visible headline is often aria-hidden copy (v2, v4/v5 per-letter spans) with a screen-reader twin, so
    // aria-hidden is fine; invisible decorations (opacity 0, the stretchy "!" marks) and the sr twin are not
    if (!t.nodeValue.trim() || !pe || pe.closest("[hidden], .sr-only, .hello-hero__sr")) continue;
    if (pe.checkVisibility ? !pe.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : getComputedStyle(pe).opacity === "0") continue;
    const rg = document.createRange(); rg.selectNodeContents(t);
    const rs = [...rg.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    if (rs.length) { const r = rs[rs.length - 1]; return { x: r.right, y: r.top + r.height / 2 }; }
  }
  return null;
}

// v1: the greeting is SVG; take the glyph shapes of its lower half (the last line) and their right-most edge
function svgLastLineEnd(svg) {
  const box = svg.getBoundingClientRect();
  if (box.width < 20) return null;
  let right = -1, top = 1e9, bottom = -1;
  for (const e of svg.querySelectorAll("path, text, tspan")) {
    const r = e.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0 || r.top + r.height / 2 < box.top + box.height * 0.52) continue;
    if (r.right > right) right = r.right;
    top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom);
  }
  return right < 0 ? { x: box.right - 6, y: box.top + box.height * 0.75 } : { x: right, y: (top + bottom) / 2 };
}

export function headlineEnd() {
  const el = headlineEl();
  if (!el) return null;
  const p = el instanceof SVGElement ? svgLastLineEnd(el) : textEnd(el);
  return p ? [p.x + 6 + window.scrollX, p.y + window.scrollY] : null;
}
