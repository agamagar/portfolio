// A Figma export names its clipPaths, masks, gradients and layers with short,
// reused ids (clip0_..., paint0_linear..., Vector). Pasted inline more than once
// they collide: url(#id) resolves to the FIRST copy on the page, and a gradient or
// clip can render from the wrong SVG. This rewrites every id in one SVG string to
// carry a per-instance prefix, and every reference to it (url(#id), href="#id",
// xlink:href="#id") with it. mv4h4hhf (12 Oct, QA pin "Duplicate SVG ids").
export function uniqueSvgIds(svg, prefix) {
  if (!svg) return svg;
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  if (!ids.length) return svg;
  const safe = prefix.replace(/[^A-Za-z0-9_-]/g, "");
  const map = new Map(ids.map((id) => [id, `${safe}-${id.replace(/\s+/g, "_")}`]));
  return svg
    .replace(/(\sid=")([^"]+)(")/g, (m, a, id, c) => a + (map.get(id) || id) + c)
    .replace(/url\(\s*(['"]?)#([^)'"]+)\1\s*\)/g, (m, q, id) => (map.has(id) ? `url(${q}#${map.get(id)}${q})` : m))
    .replace(/((?:xlink:)?href=")#([^"]+)(")/g, (m, a, id, c) => (map.has(id) ? `${a}#${map.get(id)}${c}` : m));
}
