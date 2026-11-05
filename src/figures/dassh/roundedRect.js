// A rounded rectangle as one SVG subpath, so two of them make a band with evenodd. Used by CornerNest and StellaLive's overlay.
export function rr(x, y, w, h, r) {
  const q = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + q},${y}h${w - 2 * q}a${q},${q} 0 0 1 ${q},${q}v${h - 2 * q}a${q},${q} 0 0 1 ${-q},${q}h${-(w - 2 * q)}a${q},${q} 0 0 1 ${-q},${-q}v${-(h - 2 * q)}a${q},${q} 0 0 1 ${q},${-q}z`;
}
