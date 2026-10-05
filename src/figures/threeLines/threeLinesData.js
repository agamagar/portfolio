// Three Lines (/three-lines) · the icon set where EVERY glyph is the same
// three strokes. RULES + QA LOOP: THREE_LINES_SYSTEM.md (this folder); run
// the contact-sheet QA whenever this file changes. Each icon is exactly 3 line segments [x1, y1, x2, y2] in a
// 24-unit box (content roughly 4..20), stroke 2, round caps. Morphing between
// any two icons is therefore trivial and always clean: same element count,
// same point count per element, just interpolate the four endpoints.
//
// Line ORDER is a design decision, not an accident. The three slots keep
// stable roles across the whole set (a = top stroke, b = middle stroke,
// c = bottom stroke of the hamburger skeleton), so every morph reads as the
// menu lines rearranging themselves rather than random segments jumping.
// Icons that only need 2 visible strokes let the spare line ride along on
// top of another (an exact duplicate), and "more" collapses each line to a
// near-zero length so the round caps render as three dots.
//
// A stroke may also be a closed curve: `{ cx, cy, rx, ry, start }` (an
// ellipse, start angle in degrees). Every stroke, straight or curved, is
// resampled to the same SAMPLES points before morphing, so a menu bar can
// unroll into a circle with the same clean point-for-point interpolation.
//
// ROTATION GROUPS (learned from benji.org/morphing-icons-with-claude): icons
// that are the same glyph at different orientations carry
// `rot: { group, angle }` and MUST be exact rotations of the group's base
// shape about the box center (12,12). Morphing within a group rotates the
// whole glyph rigidly instead of lerping endpoints; a coordinate morph
// between two orientations of the same shape bends and warps strokes that
// should just turn.

export const VIEWBOX = 24;
export const STROKE = 2;
export const SAMPLES = 48;

export const ICONS = [
  {
    // The rest state of the whole set (the pasted three-dot grid
    // construction): the three strokes parked as three solid dots in a
    // triangle. ICONS[0] is the skeleton every tile falls back to and the
    // state every glyph enters from. A stroked circle whose radius equals
    // half the stroke width has a zero-diameter hole, so each ring renders
    // as a solid disc (r 1 at stroke 2 = a filled dot of diameter 4).
    key: "seed",
    name: "Seed",
    lines: [
      { cx: 9, cy: 7, rx: 1, ry: 1, start: 90 },
      { cx: 17.5, cy: 12, rx: 1, ry: 1, start: -90 },
      { cx: 9, cy: 17, rx: 1, ry: 1, start: 90 },
    ],
  },
  {
    key: "menu",
    name: "Menu",
    lines: [
      [4, 7, 20, 7],
      [4, 12, 20, 12],
      [4, 17, 20, 17],
    ],
  },
  {
    // exact 45 degree rotation of Plus (arms 16 long, so the X spans
    // 12 +/- 5.66), which puts Close and Plus in one rotation group: the X
    // SPINS into the + instead of lerping through an awkward crossing.
    key: "close",
    name: "Close",
    rot: { group: "cross", angle: 45 },
    lines: [
      [17.66, 6.34, 6.34, 17.66],
      [6.34, 6.34, 17.66, 17.66],
      [17.66, 6.34, 6.34, 17.66],
    ],
  },
  {
    key: "plus",
    name: "Plus",
    rot: { group: "cross", angle: 0 },
    lines: [
      [12, 4, 12, 20],
      [4, 12, 20, 12],
      [12, 4, 12, 20],
    ],
  },
  {
    key: "minus",
    name: "Minus",
    lines: [
      [5, 12, 19, 12],
      [5, 12, 19, 12],
      [5, 12, 19, 12],
    ],
  },
  {
    key: "chevron-down",
    name: "Chevron down",
    rot: { group: "chevron", angle: 0 },
    lines: [
      [5, 9.5, 12, 16.5],
      [5, 9.5, 12, 16.5],
      [19, 9.5, 12, 16.5],
    ],
  },
  {
    key: "chevron-up",
    name: "Chevron up",
    rot: { group: "chevron", angle: 180 },
    lines: [
      [5, 14.5, 12, 7.5],
      [19, 14.5, 12, 7.5],
      [19, 14.5, 12, 7.5],
    ],
  },
  {
    key: "arrow-left",
    name: "Arrow left",
    rot: { group: "arrow", angle: 180 },
    lines: [
      [11, 6, 5, 12],
      [20, 12, 5, 12],
      [11, 18, 5, 12],
    ],
  },
  {
    key: "arrow-up",
    name: "Arrow up",
    rot: { group: "arrow", angle: -90 },
    lines: [
      [6, 11, 12, 5],
      [12, 20, 12, 5],
      [18, 11, 12, 5],
    ],
  },
  {
    key: "arrow-right",
    name: "Arrow right",
    rot: { group: "arrow", angle: 0 },
    lines: [
      [13, 6, 19, 12],
      [4, 12, 19, 12],
      [13, 18, 19, 12],
    ],
  },
  {
    key: "check",
    name: "Check",
    lines: [
      [5, 12.5, 9.5, 17],
      [9.5, 17, 19, 7.5],
      [5, 12.5, 9.5, 17],
    ],
  },
  {
    key: "play",
    name: "Play",
    lines: [
      [9, 5.5, 20, 12],
      [9, 5.5, 9, 18.5],
      [9, 18.5, 20, 12],
    ],
  },
  {
    key: "more",
    name: "More",
    lines: [
      [4.99, 12, 5.01, 12],
      [11.99, 12, 12.01, 12],
      [18.99, 12, 19.01, 12],
    ],
  },
  {
    // head circle + shoulders ellipse (the pasted icon-grid construction).
    // Start angles face each other (head opens at its bottom, body at its
    // top) so straight strokes unroll toward the seam between the two.
    key: "user",
    name: "User",
    lines: [
      { cx: 12, cy: 7.75, rx: 4.25, ry: 4.25, start: 90 },
      { cx: 12, cy: 16.75, rx: 7.75, ry: 3.5, start: -90 },
      { cx: 12, cy: 16.75, rx: 7.75, ry: 3.5, start: -90 },
    ],
  },
  {
    // two mirrored wedges (pasted solid mark, the V is the negative space
    // between them): tall right triangles hugging the box sides, apexes at
    // the top, bases on the floor. Windings mirror each other (left goes
    // down-right-close, right goes down-left-close) so morphs into and out
    // of this glyph move symmetrically; both seams sit at the top apexes.
    key: "vee",
    name: "Vee",
    lines: [
      { poly: [[4.5, 4.5], [4.5, 19.5], [10.75, 19.5]] },
      { poly: [[4.5, 4.5], [4.5, 19.5], [10.75, 19.5]] },
      { poly: [[19.5, 4.5], [19.5, 19.5], [13.25, 19.5]] },
    ],
  },
  {
    // triangle + square + circle (pasted shapes mark): outline twins of the
    // filled ref, same composition (triangle top-left, square right, circle
    // bottom-center). First polygon vertex is the seam; both face inward.
    key: "shapes",
    name: "Shapes",
    lines: [
      { poly: [[4.5, 3.5], [4.5, 10.5], [11.5, 10.5]] },
      { poly: [[14, 6], [20, 6], [20, 12], [14, 12]] },
      { cx: 9.5, cy: 16.5, rx: 3.5, ry: 3.5, start: -90 },
    ],
  },
];

export const iconByKey = Object.fromEntries(ICONS.map((i) => [i.key, i]));

// Resample any stroke (segment, ellipse, or closed polygon) to SAMPLES
// points. First and last point of a closed shape coincide, so the loop has
// no notch and open strokes share the exact same correspondence.
//
// Polygons allocate their samples per edge proportional to edge length and
// force EVERY vertex onto a sample, so corners stay sharp through a morph
// instead of eroding into wobble.
function samplePoly(verts, k) {
  const n = verts.length;
  const edges = verts.map((v, i) => {
    const w = verts[(i + 1) % n];
    return Math.hypot(w[0] - v[0], w[1] - v[1]);
  });
  const total = edges.reduce((a, b) => a + b, 0);
  const counts = edges.map((len) => Math.max(1, Math.round(((k - 1) * len) / total)));
  let diff = k - 1 - counts.reduce((a, b) => a + b, 0);
  const byLength = edges.map((len, i) => i).sort((a, b) => edges[b] - edges[a]);
  let oi = 0;
  while (diff !== 0) {
    const i = byLength[oi % byLength.length];
    if (diff > 0) {
      counts[i] += 1;
      diff -= 1;
    } else if (counts[i] > 1) {
      counts[i] -= 1;
      diff += 1;
    }
    oi += 1;
  }
  const pts = [];
  verts.forEach((v, i) => {
    const w = verts[(i + 1) % n];
    for (let j = 0; j < counts[i]; j++) {
      const t = j / counts[i];
      pts.push([v[0] + (w[0] - v[0]) * t, v[1] + (w[1] - v[1]) * t]);
    }
  });
  pts.push([...pts[0]]);
  return pts;
}

export function samplePoints(stroke, k = SAMPLES) {
  if (Array.isArray(stroke)) {
    const [x1, y1, x2, y2] = stroke;
    const pts = new Array(k);
    for (let i = 0; i < k; i++) {
      const t = i / (k - 1);
      pts[i] = [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    }
    return pts;
  }
  if (stroke.poly) return samplePoly(stroke.poly, k);
  const { cx, cy, rx, ry, start = -90 } = stroke;
  const pts = new Array(k);
  for (let i = 0; i < k; i++) {
    const a = ((start + (i / (k - 1)) * 360) * Math.PI) / 180;
    pts[i] = [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  }
  return pts;
}

// Rigid rotation of sampled points about the box center; the shortest
// signed angle between two group orientations. Both used by the rotation
// morph path (and by the QA contact-sheet script).
export function rotatePoints(pts, deg, cx = VIEWBOX / 2, cy = VIEWBOX / 2) {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return pts.map(([x, y]) => [
    cx + (x - cx) * cos - (y - cy) * sin,
    cy + (x - cx) * sin + (y - cy) * cos,
  ]);
}

export function shortestDelta(fromDeg, toDeg) {
  return ((toDeg - fromDeg + 540) % 360) - 180;
}

export function pathD(points) {
  let d = "";
  for (let i = 0; i < points.length; i++) {
    d += `${i === 0 ? "M" : "L"}${points[i][0].toFixed(2)} ${points[i][1].toFixed(2)}`;
  }
  return d;
}

// Standalone SVG string for click-to-copy (paste into Figma or any file).
// Ink is a literal near-black so the pasted asset is self-contained.
// Segments export as real <line>, ellipses as <ellipse>, polygons as
// <polygon>; never the 48-point polylines.
export function standaloneSvg(icon, { size = 24, ink = "#111111" } = {}) {
  const lines = icon.lines
    .map((stroke) => {
      if (Array.isArray(stroke))
        return `  <line x1="${stroke[0]}" y1="${stroke[1]}" x2="${stroke[2]}" y2="${stroke[3]}" />`;
      if (stroke.poly)
        return `  <polygon points="${stroke.poly.map((p) => p.join(",")).join(" ")}" />`;
      return `  <ellipse cx="${stroke.cx}" cy="${stroke.cy}" rx="${stroke.rx}" ry="${stroke.ry}" />`;
    })
    .join("\n");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" width="${size}" height="${size}" fill="none" stroke="${ink}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">`,
    lines,
    `</svg>`,
  ].join("\n");
}
