// Layout generators: content in, primitive items out. Each one lays things out the way a person at a
// whiteboard would (a centre topic with branches, boxes joined by arrows, columns under headings,
// sticky-note clusters) and leaves the "hand" (wobble, overshoot, handwriting) to the engine.

import { blockSize, sizeOf, measureLine } from "./text.js";
import { clamp, edgePoint, center } from "./geom.js";
import { BRANCH_COLORS } from "./palette.js";

// ---------------------------------------------------------------- input helpers

const MARKS = { "*": "star", "!": "bulb", "+": "check", "✓": "check", "x": "cross", "✗": "cross", "?": "question" };

/** "  indented outline" -> tree. First line at the lowest indent is the root. Leading "* ! + x" become marks. */
export function parseOutline(text) {
  const rows = String(text).split("\n").map((l) => l.replace(/\t/g, "  ")).filter((l) => l.trim());
  if (!rows.length) return { text: "", children: [] };
  const base = Math.min(...rows.map((l) => l.match(/^ */)[0].length));
  const unit = Math.min(...rows.map((l) => l.match(/^ */)[0].length - base).filter((n) => n > 0), 2) || 2;
  const mk = (raw) => {
    let t = raw.trim().replace(/^[-•]\s+/, "");
    let mark;
    const m = t.match(/^(\*|!|\+|✓|✗|x|\?)\s+(.*)$/);
    if (m && (m[1] !== "x" || m[2])) { mark = MARKS[m[1]]; t = m[2]; }
    return { text: t, mark, children: [] };
  };
  const root = { text: "", children: [], depth: -1 };
  const stack = [root];
  for (const row of rows) {
    const depth = Math.round((row.match(/^ */)[0].length - base) / unit);
    const node = { ...mk(row), depth };
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root.children.length === 1 ? root.children[0] : { text: "", children: root.children };
}

const asNode = (n) => (typeof n === "string" ? { text: n, children: [] } : { ...n, children: (n.children ?? []).map(asNode) });
const treeOf = (spec) => {
  if (spec.outline) return parseOutline(spec.outline);
  if (spec.tree) return asNode(spec.tree);
  return asNode({ text: spec.root ?? spec.title ?? "Ideas", children: spec.branches ?? [] });
};

const T = (text, at, size, o = {}) => ({ type: "text", text, at, size, ...o });
const markPrim = (mark, at, color, s = 1) => {
  if (mark === "star") return { type: "star", at, r: 18 * s, color: "orange", w: 4 };
  if (mark === "bulb") return { type: "bulb", at, s: 46 * s, color: "orange", w: 4 };
  if (mark === "check") return { type: "check", at, s: 28 * s, color: "green", w: 5 };
  if (mark === "cross") return { type: "cross", at, s: 24 * s, color: "red", w: 5 };
  if (mark === "question") return { type: "text", text: "?", at: [at[0] - 9 * s, at[1] - 22 * s], size: 40 * s, color: "purple" };
  return null;
};

// ---------------------------------------------------------------- mind map

function mindmap(spec) {
  const W = spec.w, H = spec.h;
  const root = treeOf(spec);
  const M = 56;
  const branches = root.children;
  // balance the two sides by weight (leaf count + 1), keeping input order inside each side
  const sides = [[], []];
  const weight = [0, 0];
  branches.forEach((b, i) => {
    const wgt = 1 + b.children.length;
    const s = weight[0] <= weight[1] ? 0 : 1;
    sides[s].push({ b, i });
    weight[s] += wgt;
  });

  const attempt = (f, wrap = 1) => {
    const rootS = 76 * f, brS = 54 * f, lfS = 40 * f;
    const rb = blockSize(root.text || spec.title || "Ideas", rootS, { maxW: 400 * f });
    const rootRx = rb.w / 2 + 64 * f, rootRy = rb.h / 2 + 40 * f;
    const cx = W / 2, cy = H / 2;
    let ok = true;
    const placed = [];
    sides.forEach((list, si) => {
      if (!list.length) return;
      const dir = si === 0 ? 1 : -1;
      const items = list.map(({ b, i }) => {
        const bb = blockSize(b.text, brS, { maxW: 300 * f * wrap });
        const leaves = b.children.map((l) => ({ node: l, bl: blockSize(l.text, lfS, { maxW: 310 * f * wrap }) }));
        const stackH = leaves.reduce((s, l) => s + l.bl.h, 0) + Math.max(0, leaves.length - 1) * 12 * f;
        return { b, i, bb, leaves, stackH, h: Math.max(bb.h + 14 * f, stackH) };
      });
      const gapB = 34 * f;
      const sideH = items.reduce((s, it) => s + it.h, 0) + (items.length - 1) * gapB;
      const bw = Math.max(...items.map((it) => it.bb.w));
      const lw = Math.max(0, ...items.flatMap((it) => it.leaves.map((l) => l.bl.w)));
      const hasLeaves = items.some((it) => it.leaves.length);
      const need = rootRx + 72 * f + 16 * f + bw + (hasLeaves ? 112 * f + lw : 0);
      if (need > W / 2 - M || sideH > H - 2 * M) ok = false;
      placed.push({ dir, items, sideH, bw, lw, gapB });
    });
    return { ok, f, wrap, rootS, brS, lfS, rb, rootRx, rootRy, cx, cy, placed };
  };

  // largest text that fits, but prefer roomier wraps (fewer ugly line breaks) unless they cost real size
  let L = null, best = -1;
  for (const wrap of [0.8, 1, 1.35]) {
    for (let f = 1.7; f >= 0.45; f -= 0.05) {
      const t = attempt(f, wrap);
      if (t.ok) {
        const score = t.f * (wrap >= 1.35 ? 1.16 : wrap >= 1 ? 1.07 : 1);
        if (score > best) { best = score; L = t; }
        break;
      }
    }
  }
  L = L ?? attempt(0.45, 1);
  const { f, wrap, rootS, brS, lfS, rootRx, rootRy, cx, cy, placed } = L;
  const out = [];
  const pen = spec.pen ?? 5.4;
  out.push({ type: "cloud", rect: { x: cx - rootRx, y: cy - rootRy, w: rootRx * 2, h: rootRy * 2 }, color: "black", w: pen * 1.3 * f, id: "root" });
  out.push(T(root.text || spec.title || "Ideas", [cx, cy], rootS, { anchor: "middle", align: "center", maxW: 400 * f, color: "black", id: "root-text" }));

  // draw in input order so the board grows the way it was thought about
  const flat = [];
  placed.forEach((side) => {
    let y = cy - side.sideH / 2;
    side.items.forEach((it) => {
      flat.push({ side, it, y });
      y += it.h + side.gapB;
    });
  });
  flat.sort((a, b) => a.it.i - b.it.i);

  flat.forEach(({ side, it, y }, n) => {
    const { dir } = side;
    const color = it.b.color ?? BRANCH_COLORS[it.i % BRANCH_COLORS.length];
    const yb = y + it.h / 2;
    const x0 = cx + dir * (rootRx + 72 * f);                   // where branch labels start
    const labelX = x0 + dir * 16 * f;
    const uy = yb + it.bb.h / 2 + 2 * f;
    const near = [labelX - dir * 10 * f, uy - brS * 0.12];
    const rootBox = { x: cx - rootRx, y: cy - rootRy, w: rootRx * 2, h: rootRy * 2 };
    const start = edgePoint(rootBox, near, 6);
    out.push({ type: "curve", from: start, to: near, color, w: pen * 1.15 * f, bend: 0.55 });
    out.push(T(it.b.text, [labelX, yb], brS, { anchor: "middle", align: dir > 0 ? "left" : "right", maxW: 300 * f * wrap, color, id: `b${it.i}` }));
    out.push({ type: "underline", of: `b${it.i}`, color, w: pen * 1.0 * f, gap: brS * 0.08 });
    if (it.b.mark) { const m = markPrim(it.b.mark, [labelX + dir * (it.bb.w + 30 * f), yb], color, f); if (m) out.push(m); }
    let ly = y + (it.h - it.stackH) / 2;
    const far = [labelX + dir * (it.bb.w + 4 * f), uy - brS * 0.12];
    const leafX = x0 + dir * (16 * f + side.bw + 112 * f);
    it.leaves.forEach((lf, k) => {
      const cyL = ly + lf.bl.h / 2;
      out.push({ type: "curve", from: far, to: [leafX - dir * 12 * f, cyL], color, w: pen * 0.8 * f, bend: 0.5 });
      out.push(T(lf.node.text, [leafX, cyL], lfS, { anchor: "middle", align: dir > 0 ? "left" : "right", maxW: 310 * f * wrap, color }));
      if (lf.node.mark) { const m = markPrim(lf.node.mark, [leafX + dir * (lf.bl.w + 28 * f), cyL], color, f * 0.8); if (m) out.push(m); }
      ly += lf.bl.h + 12 * f;
    });
  });
  return out;
}

// ---------------------------------------------------------------- flow

function flow(spec) {
  const W = spec.w, H = spec.h, M = 70;
  const steps = (spec.steps ?? []).map((s) => (typeof s === "string" ? { text: s } : s));
  const n = steps.length;
  const out = [];
  let top = M;
  if (spec.title) {
    out.push(T(spec.title, [M, M - 10], "l", { color: "black", id: "title" }));
    out.push({ type: "underline", of: "title", color: "black", style: "double" });
    top = M + 120;
  }
  const cols = n <= 4 ? Math.max(1, n) : n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const gapX = 96;
  const boxW = Math.min(380, (W - 2 * M - (cols - 1) * gapX) / cols);
  const sz = clamp((54 * boxW) / 380, 32, 54);
  const blocks = steps.map((s) => blockSize(s.text, sz, { maxW: boxW - 58 }));
  const rowH = Array.from({ length: rows }, (_, r) => Math.max(...blocks.slice(r * cols, r * cols + cols).map((b) => b.h)) + 64);
  const availH = H - top - M;
  const gapY = rows > 1 ? clamp((availH - rowH.reduce((a, b) => a + b, 0)) / (rows - 1), 60, 150) : 0;
  const total = rowH.reduce((a, b) => a + b, 0) + gapY * (rows - 1);
  let y = top + Math.max(0, (availH - total) / 2);
  const rowY = rowH.map((h) => { const v = y; y += h + gapY; return v; });
  const gridW = cols * boxW + (cols - 1) * gapX;
  const x0 = (W - gridW) / 2;
  steps.forEach((s, i) => {
    const r = Math.floor(i / cols), k = i % cols;
    const col = r % 2 === 0 ? k : cols - 1 - k;
    const x = x0 + col * (boxW + gapX), h = rowH[r];
    const color = s.color ?? BRANCH_COLORS[i % BRANCH_COLORS.length];
    const term = (i === 0 || i === n - 1) && n >= 3 && spec.terminators !== false;
    const rect = { x, y: rowY[r], w: boxW, h };
    out.push(term
      ? { type: "ellipse", rect: { x: rect.x - 10, y: rect.y - 6, w: rect.w + 20, h: rect.h + 12 }, k: 0.5, ky: 0.5, pad: 0, color, id: `s${i}`, w: 5.8 }
      : { type: "box", rect, color, id: `s${i}`, radius: 14, w: 5.8 });
    out.push(T(s.text, [x + boxW / 2, rowY[r] + h / 2], sz, { anchor: "middle", align: "center", maxW: boxW - 58, color: "black" }));
    out.push({ type: "dot", at: [x + 6, rowY[r] + 4], r: 25, color: "white" });
    out.push({ type: "ellipse", at: [x + 6, rowY[r] + 4], r: 23, color, w: 4.5 });
    out.push(T(String(i + 1), [x + 6, rowY[r] + 4], 34, { anchor: "middle", align: "center", color }));
    if (s.note) out.push(T(s.note, [x + boxW / 2, rowY[r] + h + 14], "xs", { align: "center", maxW: boxW + gapX - 20, color: "grey" }));
    if (s.mark) { const m = markPrim(s.mark, [x + boxW - 6, rowY[r] - 6], color, 1); if (m) out.push(m); }
    if (i > 0) out.push({ type: "arrow", from: `s${i - 1}`, to: `s${i}`, color: "black", w: 5, curve: 0.06 });
  });
  return out;
}

// ---------------------------------------------------------------- columns (pros/cons, kanban, comparisons)

const POS = /^(pro|pros|good|do|dos|yes|keep|start|win|upside|benefit|works|likes?)\b/i;
const NEG = /^(con|cons|bad|don'?ts?|no|stop|risk|risks|downside|problem|issues?|fix|dislikes?)\b/i;

function columns(spec) {
  const W = spec.w, H = spec.h, M = 70;
  const cols = spec.columns ?? [];
  const n = cols.length;
  const out = [];
  let top = M;
  if (spec.title) {
    out.push(T(spec.title, [M, M - 10], "l", { color: "black", id: "title" }));
    out.push({ type: "underline", of: "title", color: "black" });
    top = M + 125;
  }
  const colW = (W - 2 * M) / n;
  // fit: shrink item size until the tallest column fits
  let sz = 46;
  const heightFor = (s) => Math.max(...cols.map((c) => (c.items ?? []).reduce((a, it) => a + blockSize(typeof it === "string" ? it : it.text, s, { maxW: colW - 96 }).h + 22, 0)));
  const headRoom = Math.max(...cols.map((c) => blockSize(c.title, 54, { maxW: colW - 40 }).h)) + 40;
  while (sz > 26 && heightFor(sz) > H - top - M - headRoom) sz -= 2;
  const headH = Math.max(...cols.map((c) => blockSize(c.title, 54, { maxW: colW - 40 }).h));
  cols.forEach((c, i) => {
    const x = M + i * colW;
    const kind = c.mark ?? (POS.test(c.title) ? "check" : NEG.test(c.title) ? "cross" : "dot");
    const color = c.color ?? (kind === "check" ? "green" : kind === "cross" ? "red" : BRANCH_COLORS[i % BRANCH_COLORS.length]);
    out.push(T(c.title, [x + colW / 2, top], "m", { align: "center", color, id: `h${i}`, maxW: colW - 40 }));
    out.push({ type: "underline", of: `h${i}`, color, style: "double", w: 5 });
    if (i > 0) out.push({ type: "line", from: [x - 10, top - 6], to: [x - 10, H - M], color: "grey", w: 3.6, op: 0.45 });
    let y = top + headH + 40;                                   // items start below the (possibly wrapped) header
    (c.items ?? []).forEach((raw, k) => {
      const text = typeof raw === "string" ? raw : raw.text;
      const b = blockSize(text, sz, { maxW: colW - 96 });
      const mk = typeof raw === "string" ? kind : raw.mark ?? kind;
      const mx = x + 34, my = y + sz * 0.5;                       // mark the first line, the way a list is written
      if (mk === "check") out.push({ type: "check", at: [mx, my], s: 30, color: "green", w: 5.4 });
      else if (mk === "cross") out.push({ type: "cross", at: [mx, my], s: 24, color: "red", w: 5.4 });
      else if (mk === "star") out.push({ type: "star", at: [mx, my], r: 17, color: "orange", w: 4 });
      else if (mk === "num") out.push(T(`${k + 1}.`, [mx - 6, y], sz, { color }));
      else out.push({ type: "dot", at: [mx, my], r: 7, color });
      out.push(T(text, [x + 66, y], sz, { maxW: colW - 96, color: "black" }));
      y += b.h + 22;
    });
  });
  return out;
}

// ---------------------------------------------------------------- 2x2 matrix

function matrix(spec) {
  const W = spec.w, H = spec.h, M = 70;
  const out = [];
  let top = M;
  if (spec.title) {
    out.push(T(spec.title, [M, M - 10], "l", { color: "black", id: "title" }));
    out.push({ type: "underline", of: "title", color: "black" });
    top = M + 110;
  }
  const px0 = M + 70, px1 = W - M, py0 = top + 20, py1 = H - M - 40;
  const cx = (px0 + px1) / 2, cy = (py0 + py1) / 2;
  const xl = spec.x ?? { low: "low", high: "high" }, yl = spec.y ?? { low: "low", high: "high" };
  const xs = typeof xl === "string" ? { low: "", high: xl } : xl, ys = typeof yl === "string" ? { low: "", high: yl } : yl;
  out.push({ type: "arrow", from: [px0, cy], to: [px1, cy], color: "black", head: "both", curve: 0.01, w: 5.4 });
  out.push({ type: "arrow", from: [cx, py1], to: [cx, py0], color: "black", head: "both", curve: 0.01, w: 5.4 });
  if (xs.low) out.push(T(xs.low, [px0 + 4, cy + 20], "xs", { color: "grey" }));
  if (xs.high) out.push(T(xs.high, [px1 - 4, cy + 20], "xs", { align: "right", color: "grey" }));
  if (ys.high) out.push(T(ys.high, [cx + 22, py0 - 6], "xs", { color: "grey" }));
  if (ys.low) out.push(T(ys.low, [cx + 22, py1 - 30], "xs", { color: "grey" }));
  const q = spec.quadrants ?? [];
  const qpos = [[px0 + 24, py0 + 8, "left"], [px1 - 24, py0 + 8, "right"], [px0 + 24, py1 - 46, "left"], [px1 - 24, py1 - 46, "right"]];
  q.forEach((t, i) => t && out.push(T(t, [qpos[i][0], qpos[i][1]], "s", { align: qpos[i][2], color: BRANCH_COLORS[i], maxW: 360 })));
  (spec.items ?? []).forEach((it, i) => {
    const x = px0 + clamp(it.x, 0.06, 0.94) * (px1 - px0), y = py1 - clamp(it.y, 0.08, 0.92) * (py1 - py0);
    const color = it.color ?? ["yellow", "pink", "blue", "green", "orange"][i % 5];
    const w = 226, h = 132;
    out.push({ type: "sticky", rect: { x: x - w / 2, y: y - h / 2, w, h }, color });
    out.push(T(it.text, [x, y], "xs", { anchor: "middle", align: "center", maxW: w - 34, color: STICKY_INK[color] }));
  });
  return out;
}

const STICKY_INK = { yellow: "#3a3320", pink: "#4a2430", blue: "#1f3550", green: "#1f4020", orange: "#4a2f12" };

// ---------------------------------------------------------------- timeline

function timeline(spec) {
  const W = spec.w, H = spec.h, M = 80;
  const ev = spec.events ?? [];
  const n = ev.length;
  const out = [];
  if (spec.title) {
    out.push(T(spec.title, [M, M - 20], "l", { color: "black", id: "title" }));
    out.push({ type: "underline", of: "title", color: "black" });
  }
  const y = H / 2 + (spec.title ? 50 : 0);
  out.push({ type: "arrow", from: [M, y], to: [W - M + 20, y], color: "black", curve: 0.005, w: 6.4 });
  const usable = W - 2 * M - 160;
  const step = n > 1 ? usable / (n - 1) : usable;
  const bw = Math.min(330, Math.max(200, step * 1.6));
  const capSize = 38, whenSize = 54;
  ev.forEach((e, i) => {
    const up = i % 2 === 0;
    const color = e.color ?? BRANCH_COLORS[i % BRANCH_COLORS.length];
    const x = M + 80 + (n === 1 ? usable / 2 : step * i);
    const tx = clamp(x, M + bw / 2, W - M - bw / 2);          // keep the caption on the board
    out.push({ type: "line", from: [x, y - 18], to: [x, y + 18], color: "black", w: 5.4 });
    const cap = blockSize(e.text, capSize, { maxW: bw });
    if (up) {
      const whenTop = y - 42 - whenSize * 0.95;
      out.push(T(e.when, [x, whenTop], whenSize, { align: "center", color, id: `w${i}` }));
      out.push(T(e.text, [tx, whenTop - 30 - cap.h], capSize, { align: "center", maxW: bw, color: "black" }));
    } else {
      const whenTop = y + 38;
      out.push(T(e.when, [x, whenTop], whenSize, { align: "center", color, id: `w${i}` }));
      out.push(T(e.text, [tx, whenTop + whenSize * 1.05 + 26], capSize, { align: "center", maxW: bw, color: "black" }));
    }
    out.push({ type: "underline", of: `w${i}`, color, w: 4.6 });
  });
  return out;
}

// ---------------------------------------------------------------- sticky-note clusters (affinity map)

function stickies(spec) {
  const W = spec.w, H = spec.h, M = 60;
  const out = [];
  let top = M;
  if (spec.title) {
    out.push(T(spec.title, [M, M - 14], "l", { color: "black", id: "title" }));
    out.push({ type: "underline", of: "title", color: "black" });
    top = M + 110;
  }
  const groups = spec.groups ?? [{ title: "", notes: spec.notes ?? [] }];
  const g = groups.length;
  const gcols = g <= 2 ? g : g <= 4 ? 2 : 3;
  const grows = Math.ceil(g / gcols);
  const cw = (W - 2 * M) / gcols, ch = (H - top - M) / grows;
  const colors = ["yellow", "pink", "blue", "green", "orange"];
  groups.forEach((grp, gi) => {
    const gx = M + (gi % gcols) * cw, gy = top + Math.floor(gi / gcols) * ch;
    const hasTitle = !!grp.title;
    const notes = grp.notes ?? [];
    const ncols = notes.length <= 2 ? notes.length : cw > 640 ? 3 : 2;
    const nrows = Math.ceil(notes.length / Math.max(1, ncols));
    const availW = cw - 56, availH = ch - (hasTitle ? 110 : 40) - 28;
    const nw = Math.min(210, (availW - (ncols - 1) * 22) / Math.max(1, ncols)), nh = Math.min(168, (availH - (nrows - 1) * 22) / Math.max(1, nrows));
    const gridW = ncols * nw + (ncols - 1) * 22, gridH = nrows * nh + (nrows - 1) * 22;
    const startX = gx + (cw - gridW) / 2, startY = gy + (hasTitle ? 96 : 28) + Math.max(0, (availH - gridH) / 2);
    const color = grp.color ?? BRANCH_COLORS[gi % BRANCH_COLORS.length];
    out.push({ type: "box", rect: { x: gx + 14, y: gy + 8, w: cw - 28, h: ch - 16 }, color, radius: 34, w: 4.6, op: 0.9, id: `g${gi}` });
    if (hasTitle) {
      out.push(T(grp.title, [gx + cw / 2, gy + 30], "m", { align: "center", color, id: `gt${gi}`, maxW: cw - 80 }));
      out.push({ type: "underline", of: `gt${gi}`, color, w: 4.8 });
    }
    notes.forEach((nt, k) => {
      const text = typeof nt === "string" ? nt : nt.text;
      const x = startX + (k % ncols) * (nw + 22), y = startY + Math.floor(k / ncols) * (nh + 22);
      const sc = (typeof nt === "object" && nt.color) || colors[(gi + k) % colors.length];
      let sizeFor = 40;
      while (sizeFor > 22 && blockSize(text, sizeFor, { maxW: nw - 30 }).h > nh - 34) sizeFor -= 2;
      out.push({ type: "sticky", rect: { x, y, w: nw, h: nh }, color: sc });
      out.push(T(text, [x + nw / 2, y + nh / 2], sizeFor, { anchor: "middle", align: "center", maxW: nw - 30, color: STICKY_INK[sc] ?? "#1f2430", jitter: 0.8 }));
    });
  });
  return out;
}

// ---------------------------------------------------------------- annotate anything

/**
 * Put an image (or a blank "target" area for an overlay) in the middle of the board and write notes around
 * it in the free margin space, each with an arrow to what it is about and a mark on the thing itself.
 *  spec.image  { href, w, h }  natural size (for aspect). With spec.overlay, no image is drawn.
 *  spec.notes  [{ text, at:[fx,fy] | rect:[fx,fy,fw,fh] (fractions of the image), kind, color, side }]
 *  kind: circle (default for a point), box (default for a rect), underline, highlight, star, check, cross, none
 */
function annotate(spec) {
  const W = spec.w, H = spec.h;
  const out = [];
  const notes = spec.notes ?? [];
  const iw = spec.image?.w ?? W, ih = spec.image?.h ?? H;
  const mx = spec.marginX ?? 340, my = spec.marginY ?? 120;
  const areaW = W - 2 * mx, areaH = H - 2 * my;
  const sc = Math.min(areaW / iw, areaH / ih);
  // spec.target pins the annotated thing to an exact rect (used by annotateElement: 1 board unit = 1 CSS px)
  const img = spec.target ?? { x: (W - iw * sc) / 2, y: (H - ih * sc) / 2, w: iw * sc, h: ih * sc };
  if (!spec.overlay && spec.image?.href) out.push({ type: "image", href: spec.image.href, rect: img });
  if (spec.title) out.push(T(spec.title, [W / 2, 28], "m", { align: "center", color: "black", id: "title" }));

  const toBoard = (fx, fy) => [img.x + fx * img.w, img.y + fy * img.h];
  const prep = notes.map((n, i) => {
    const rect = n.rect ? { x: img.x + n.rect[0] * img.w, y: img.y + n.rect[1] * img.h, w: n.rect[2] * img.w, h: n.rect[3] * img.h } : null;
    const pt = rect ? [rect.x + rect.w / 2, rect.y + rect.h / 2] : toBoard(n.at[0], n.at[1]);
    const kind = n.kind ?? (rect ? "box" : "circle");
    const color = n.color ?? ["red", "blue", "green", "orange", "purple", "pink"][i % 6];
    const shapeBox = rect ?? { x: pt[0] - 34, y: pt[1] - 34, w: 68, h: 68 };
    // pick the side with the most room that is closest to the anchor
    const dl = pt[0] - img.x, dr = img.x + img.w - pt[0], dt = pt[1] - img.y, db = img.y + img.h - pt[1];
    let side = n.side;
    if (!side || side === "auto") {
      const horizOk = mx > 140;
      const nearX = dl < dr ? "left" : "right", nearY = dt < db ? "top" : "bottom";
      const dX = Math.min(dl, dr) / img.w, dY = Math.min(dt, db) / img.h;
      side = horizOk && dX * 1.1 <= dY + 0.15 ? nearX : my > 90 ? nearY : nearX;
      if (!horizOk) side = nearY;
    }
    return { n, i, rect, pt, kind, color, shapeBox, side };
  });

  let sizeN = spec.noteSize ?? 38;
  const measure = (size) => {
    let worst = 0;
    for (const side of ["left", "right"]) {
      const list = prep.filter((p) => p.side === side);
      const hs = list.map((p) => blockSize(p.n.text, size, { maxW: mx - 80 }).h);
      worst = Math.max(worst, hs.reduce((a, b) => a + b, 0) + Math.max(0, hs.length - 1) * 26 - (H - 60));
    }
    return worst;
  };
  while (sizeN > 24 && measure(sizeN) > 0) sizeN -= 2;
  for (const side of ["left", "right", "top", "bottom"]) {
    const list = prep.filter((p) => p.side === side);
    if (!list.length) continue;
    const horiz = side === "left" || side === "right";
    const maxW = horiz ? mx - 80 : 520;
    list.forEach((p) => { p.b = blockSize(p.n.text, sizeN, { maxW }); });
    list.sort((a, b) => (horiz ? a.pt[1] - b.pt[1] : a.pt[0] - b.pt[0]));
    if (horiz) {
      const gap = 26, lo = 30, hi = H - 30;
      let cursor = lo;
      list.forEach((p) => { p.y = Math.max(cursor, p.pt[1] - p.b.h / 2); cursor = p.y + p.b.h + gap; });
      const over = cursor - gap - hi;
      if (over > 0) { let ycur = hi; for (let k = list.length - 1; k >= 0; k--) { const p = list[k]; p.y = Math.min(p.y, ycur - p.b.h); ycur = p.y - gap; } }
      list.forEach((p) => { p.x = side === "left" ? img.x - 64 : img.x + img.w + 64; p.align = side === "left" ? "right" : "left"; });
    } else {
      const gap = 30, lo = 20, hi = W - 20;
      let cursor = lo;
      list.forEach((p) => { p.w2 = p.b.w; p.x0 = Math.max(cursor, p.pt[0] - p.w2 / 2); cursor = p.x0 + p.w2 + gap; });
      const over = cursor - gap - hi;
      if (over > 0) { let xcur = hi; for (let k = list.length - 1; k >= 0; k--) { const p = list[k]; p.x0 = Math.min(p.x0, xcur - p.w2); xcur = p.x0 - gap; } }
      list.forEach((p) => { p.x = p.x0 + p.w2 / 2; p.y = side === "top" ? img.y - 56 - p.b.h : img.y + img.h + 50; p.align = "center"; });
    }
  }

  prep.forEach((p) => {
    const sb = p.shapeBox, col = p.color;
    // 1) the mark on the thing itself
    if (p.kind === "circle") out.push({ type: "ellipse", rect: { x: sb.x, y: sb.y, w: sb.w, h: sb.h }, k: 0.62, ky: 0.62, pad: 8, color: col });
    else if (p.kind === "box") out.push({ type: "box", rect: { x: sb.x - 6, y: sb.y - 6, w: sb.w + 12, h: sb.h + 12 }, color: col, radius: 10 });
    else if (p.kind === "underline") out.push({ type: "underline", span: [sb.x, sb.x + sb.w, sb.y + sb.h + 8], color: col });
    else if (p.kind === "highlight") out.push({ type: "highlight", rect: sb, color: col === "red" ? "orange" : col });
    else if (p.kind === "star") out.push({ type: "star", at: p.pt, r: 24, color: col });
    else if (p.kind === "check") out.push({ type: "check", at: p.pt, s: 44, color: col });
    else if (p.kind === "cross") out.push({ type: "cross", at: p.pt, s: 36, color: col });
    // 2) the label
    const horiz = p.side === "left" || p.side === "right";
    const anchorY = p.side === "top" ? p.y + p.b.h : p.y;
    out.push(T(p.n.text, [p.x, p.y], sizeN, { align: p.align, maxW: horiz ? mx - 80 : 520, color: col, id: `n${p.i}`, anchor: "top" }));
    // 3) the arrow from label to mark
    const labelBox = { x: p.align === "right" ? p.x - p.b.w : p.align === "center" ? p.x - p.b.w / 2 : p.x, y: p.y, w: p.b.w, h: p.b.h };
    const from = edgePoint(labelBox, center(sb), 14);
    const to = edgePoint(p.kind === "circle" ? { x: sb.x - 8, y: sb.y - 8, w: sb.w + 16, h: sb.h + 16 } : { x: sb.x - 8, y: sb.y - 8, w: sb.w + 16, h: sb.h + 16 }, from, 6);
    if (p.kind !== "none" || true) out.push({ type: "arrow", from, to, color: col, curve: horiz ? (p.pt[1] < from[1] ? -0.14 : 0.14) : 0.12 });
  });
  return out;
}

export const LAYOUTS = { mindmap, flow, columns, matrix, timeline, stickies, annotate };
