// DEV-ONLY "Inspect mode" (11 Oct 2026). Shift+I or the pill toggles it. Figma-style spacing redlines
// (gaps, padding, margin) drawn in one fixed overlay from getBoundingClientRect, hover = distances to
// parent edges + siblings, draggable handles (padding / margin / gap) with 4px snap (Alt = 1px, arrows
// nudge, Shift = 10), click a value to type it. Changes apply live through one <style> tag; the panel
// lists them with Copy CSS / Write to file (dev endpoint tools/inspect-overrides-plugin.mjs appends to
// src/hello3/inspect-overrides.css) / Reset. Two modes (keys S / E): Sections (the original page-block
// redlines) and Elements (17 Oct 2026: hover outline + label, click selects, Shift-click = parent, arrows
// walk siblings / parent / child, Esc deselects; padding / margin / gap / width / height handles, redlines
// to siblings + parent, and a floating panel of scrubbable fields incl. font-size, line-height,
// letter-spacing, border-radius). Test hook: window.__inspect. Mounted from main.jsx under import.meta.env.DEV only.
import { useEffect, useRef, useState } from "react";

const camel = (p) => p.replace(/-(\w)/g, (_, c) => c.toUpperCase());

const Z = 2147482000;
const RED = "#ff3b5c", PAD = "rgba(52,199,89,.22)", MAR = "rgba(255,159,10,.25)", HAND = "#0a84ff";
const px = (v) => (parseFloat(v) || 0);
const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
const inFlow = (e) => { const p = getComputedStyle(e).position; return p !== "absolute" && p !== "fixed" && getComputedStyle(e).display !== "none"; };
const kids = (e) => [...e.children].filter((c) => c.tagName !== "SCRIPT" && c.tagName !== "STYLE" && inFlow(c) && vis(c));

function selFor(el) {
  const seg = (e) => {
    const c = [...e.classList].find((k) => !/^(is-|data-)/.test(k));
    return e.tagName.toLowerCase() + (c ? "." + CSS.escape(c) : "");
  };
  let path = "", cur = el;
  while (cur && cur !== document.body) {
    let s = seg(cur);
    const par = cur.parentElement;
    if (par && par.querySelectorAll(":scope > " + s).length > 1) s += `:nth-child(${[...par.children].indexOf(cur) + 1})`;
    path = path ? s + " > " + path : s;
    try { if (document.querySelectorAll(path).length === 1) return path; } catch { /* keep climbing */ }
    cur = par;
  }
  return path;
}

// Measure everything the overlay draws. Pure DOM read; called on a rAF throttle.
const getRoot = () => document.querySelector(".hello") || document.querySelector("article.article") || document.querySelector("main") || document.querySelector("#root");

function measure(root) {
  const lines = [], bands = [], handles = [];
  // Homepage (.hello): only SECTION/FOOTER children. Case pages and other roots: every in-flow block child.
  const home = root.classList.contains("hello");
  const sections = [...root.children].filter((e) => (home ? /^(SECTION|FOOTER)$/.test(e.tagName) : !/^(SCRIPT|STYLE)$/.test(e.tagName)) && inFlow(e) && vis(e));
  const addGap = (a, b, cont, many) => {
    const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    const cs = cont ? getComputedStyle(cont) : null;
    const flexy = cs && /flex|grid/.test(cs.display);
    if (B.top - A.bottom >= 1 && ox > 0) {
      const x = Math.max(A.left, B.left) + ox / 2, d = B.top - A.bottom;
      lines.push({ x1: x, y1: A.bottom, x2: x, y2: B.top, label: Math.round(d * 10) / 10 });
      handles.push({ el: flexy ? cont : b, prop: flexy ? "row-gap" : "margin-top", axis: "y", dir: 1, x, y: B.top - d / 2, val: flexy ? px(cs.rowGap) : px(getComputedStyle(b).marginTop), key: many });
      lines[lines.length - 1].h = handles[handles.length - 1];
    } else if (B.left - A.right >= 1 && oy > 0) {
      const y = Math.max(A.top, B.top) + oy / 2, d = B.left - A.right;
      lines.push({ x1: A.right, y1: y, x2: B.left, y2: y, label: Math.round(d * 10) / 10 });
      handles.push({ el: flexy ? cont : b, prop: flexy ? "column-gap" : "margin-left", axis: "x", dir: 1, x: B.left - d / 2, y, val: flexy ? px(cs.columnGap) : px(getComputedStyle(b).marginLeft), key: many });
      lines[lines.length - 1].h = handles[handles.length - 1];
    }
  };
  sections.forEach((s, i) => {
    const cs = getComputedStyle(s), r = s.getBoundingClientRect();
    const p = ["Top", "Right", "Bottom", "Left"].map((k) => px(cs["padding" + k]));
    const m = ["Top", "Right", "Bottom", "Left"].map((k) => px(cs["margin" + k]));
    if (p[0]) bands.push({ x: r.left, y: r.top, w: r.width, h: p[0], c: PAD, l: p[0], h2: { el: s, prop: "padding-top", val: p[0], min: 0 } });
    if (p[2]) bands.push({ x: r.left, y: r.bottom - p[2], w: r.width, h: p[2], c: PAD, l: p[2], h2: { el: s, prop: "padding-bottom", val: p[2], min: 0 } });
    if (p[1]) bands.push({ x: r.right - p[1], y: r.top + p[0], w: p[1], h: r.height - p[0] - p[2], c: PAD, l: p[1], h2: { el: s, prop: "padding-right", val: p[1], min: 0 } });
    if (p[3]) bands.push({ x: r.left, y: r.top + p[0], w: p[3], h: r.height - p[0] - p[2], c: PAD, l: p[3], h2: { el: s, prop: "padding-left", val: p[3], min: 0 } });
    if (m[0]) bands.push({ x: r.left, y: r.top - m[0], w: r.width, h: m[0], c: MAR, l: m[0], h2: { el: s, prop: "margin-top", val: m[0], min: -1e4 } });
    if (m[2]) bands.push({ x: r.left, y: r.bottom, w: r.width, h: m[2], c: MAR, l: m[2], h2: { el: s, prop: "margin-bottom", val: m[2], min: -1e4 } });
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    handles.push({ el: s, prop: "padding-top", axis: "y", dir: 1, x: cx, y: r.top + p[0], val: p[0] });
    handles.push({ el: s, prop: "padding-bottom", axis: "y", dir: -1, x: cx, y: r.bottom - p[2], val: p[2] });
    handles.push({ el: s, prop: "padding-left", axis: "x", dir: 1, x: r.left + p[3], y: cy, val: p[3] });
    handles.push({ el: s, prop: "padding-right", axis: "x", dir: -1, x: r.right - p[1], y: cy, val: p[1] });
    if (i) addGap(sections[i - 1], s, null, "sec" + i);
    const seen = new Set();
    for (const c of [s, ...kids(s)]) {
      const ks = kids(c);
      for (let j = 1; j < ks.length && j < 12; j++) {
        const before = handles.length;
        addGap(ks[j - 1], ks[j], c, selFor(c) + j);
        const h = handles[handles.length - 1];
        if (handles.length > before && /gap$/.test(h.prop)) { if (seen.has(selFor(c) + h.prop)) handles.pop(); else seen.add(selFor(c) + h.prop); }
      }
    }
  });
  return { lines, bands, handles };
}

// Elements mode: everything drawn for one selected element.
function measureEl(el) {
  const lines = [], bands = [], handles = [];
  const r = el.getBoundingClientRect(), cs = getComputedStyle(el), par = el.parentElement;
  const p = ["Top", "Right", "Bottom", "Left"].map((k) => px(cs["padding" + k]));
  const m = ["Top", "Right", "Bottom", "Left"].map((k) => px(cs["margin" + k]));
  const midY = r.top + r.height / 2, midX = r.left + r.width / 2, L = 24, O = 28;
  const band = (x, y, w, h, c, l, prop) => { if (l) bands.push({ x, y, w, h, c, l, h2: { el, prop, val: l, min: c === MAR ? -1e4 : 0 } }); };
  band(r.left, r.top, r.width, p[0], PAD, p[0], "padding-top"); band(r.left, r.bottom - p[2], r.width, p[2], PAD, p[2], "padding-bottom");
  band(r.right - p[1], r.top + p[0], p[1], r.height - p[0] - p[2], PAD, p[1], "padding-right"); band(r.left, r.top + p[0], p[3], r.height - p[0] - p[2], PAD, p[3], "padding-left");
  band(r.left, r.top - m[0], r.width, m[0], MAR, m[0], "margin-top"); band(r.left, r.bottom, r.width, m[2], MAR, m[2], "margin-bottom");
  band(r.left - m[3], r.top, m[3], r.height, MAR, m[3], "margin-left"); band(r.right, r.top, m[1], r.height, MAR, m[1], "margin-right");
  const H = (prop, axis, dir, x, y, val, min = 0, hel = el) => handles.push({ el: hel, prop, axis, dir, x, y, val, min, len: L });
  H("padding-top", "y", 1, midX - O, r.top + p[0], p[0]); H("padding-bottom", "y", -1, midX - O, r.bottom - p[2], p[2]);
  H("padding-left", "x", 1, r.left + p[3], midY - O, p[3]); H("padding-right", "x", -1, r.right - p[1], midY - O, p[1]);
  H("margin-top", "y", -1, midX + O, r.top - m[0], m[0], -1e4); H("margin-bottom", "y", 1, midX + O, r.bottom + m[2], m[2], -1e4);
  H("margin-left", "x", -1, r.left - m[3], midY + O, m[3], -1e4); H("margin-right", "x", 1, r.right + m[1], midY + O, m[1], -1e4);
  H("width", "x", 1, r.right, midY, px(cs.width)); H("height", "y", 1, midX, r.bottom, px(cs.height));
  // gaps to siblings (redlines only; the margin handles above edit the spacing) and to the parent's edges
  const flexPar = par && /flex|grid/.test(getComputedStyle(par).display);
  const gap = (A, B, bEl) => {
    const lh = (v) => (flexPar ? { el: par, prop: v ? "row-gap" : "column-gap", val: px(getComputedStyle(par)[v ? "rowGap" : "columnGap"]) } : { el: bEl, prop: v ? "margin-top" : "margin-left", val: px(getComputedStyle(bEl)[v ? "marginTop" : "marginLeft"]), min: -1e4 });
    const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (B.top - A.bottom >= 1 && ox > 0) { const x = Math.max(A.left, B.left) + ox / 2; lines.push({ x1: x, y1: A.bottom, x2: x, y2: B.top, label: Math.round((B.top - A.bottom) * 10) / 10, h: lh(1) }); }
    else if (B.left - A.right >= 1 && oy > 0) { const y = Math.max(A.top, B.top) + oy / 2; lines.push({ x1: A.right, y1: y, x2: B.left, y2: y, label: Math.round((B.left - A.right) * 10) / 10, h: lh(0) }); }
  };
  if (par) {
    const sib = kids(par), i = sib.indexOf(el);
    if (i > 0) gap(sib[i - 1].getBoundingClientRect(), r, el);
    if (i >= 0 && i < sib.length - 1) gap(r, sib[i + 1].getBoundingClientRect(), sib[i + 1]);
    lines.push(...hoverLines(el).out);
  }
  if (/flex|grid/.test(cs.display)) {
    const ks = kids(el), seen = new Set();
    for (let j = 1; j < ks.length && j < 12; j++) {
      const A = ks[j - 1].getBoundingClientRect(), B = ks[j].getBoundingClientRect();
      const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (B.top - A.bottom >= 1 && ox > 0 && !seen.has("row")) { seen.add("row"); const d = B.top - A.bottom; lines.push({ x1: Math.max(A.left, B.left) + ox / 2, y1: A.bottom, x2: Math.max(A.left, B.left) + ox / 2, y2: B.top, label: Math.round(d * 10) / 10, h: { el, prop: "row-gap", val: px(cs.rowGap) } }); H("row-gap", "y", 1, Math.max(A.left, B.left) + ox / 2, B.top - d / 2, px(cs.rowGap)); }
      else if (B.left - A.right >= 1 && oy > 0 && !seen.has("col")) { seen.add("col"); const d = B.left - A.right; lines.push({ x1: A.right, y1: Math.max(A.top, B.top) + oy / 2, x2: B.left, y2: Math.max(A.top, B.top) + oy / 2, label: Math.round(d * 10) / 10, h: { el, prop: "column-gap", val: px(cs.columnGap) } }); H("column-gap", "x", 1, B.left - d / 2, Math.max(A.top, B.top) + oy / 2, px(cs.columnGap)); }
    }
  }
  return { lines, bands, handles };
}

const tagCls = (el) => el.tagName.toLowerCase() + (el.classList[0] ? "." + el.classList[0] : "");
const propNow = (el, prop) => {
  const cs = getComputedStyle(el);
  if (prop === "line-height") return cs.lineHeight === "normal" ? Math.round(px(cs.fontSize) * 12) / 10 : px(cs.lineHeight);
  return px(cs[camel(prop)]);
};
const FIELDS = [
  ["Padding", [["T", "padding-top"], ["R", "padding-right"], ["B", "padding-bottom"], ["L", "padding-left"]]],
  ["Margin", [["T", "margin-top", -1e4], ["R", "margin-right", -1e4], ["B", "margin-bottom", -1e4], ["L", "margin-left", -1e4]]],
  ["Size", [["W", "width"], ["H", "height"], ["row gap", "row-gap"], ["col gap", "column-gap"]]],
  ["Type", [["size", "font-size"], ["line", "line-height"], ["track", "letter-spacing", -1e4], ["radius", "border-radius"]]],
];

// Numeric field; dragging the label scrubs it (1 px = 1 unit, Shift x10, Alt x0.1).
function Field({ label, value, min = 0, onSet }) {
  const [d, setD] = useState(null);
  const sc = useRef(null);
  const r1 = (v) => Math.round(v * 10) / 10;
  const set = (v) => onSet(Math.max(min, r1(v)));
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 4, margin: "2px 0" }}>
      <span style={{ width: 44, cursor: "ew-resize", opacity: 0.75, touchAction: "none", userSelect: "none" }}
        onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); sc.current = { x: e.clientX, v: value }; }}
        onPointerMove={(e) => { const s = sc.current; if (s) set(s.v + (e.clientX - s.x) * (e.shiftKey ? 10 : e.altKey ? 0.1 : 1)); }}
        onPointerUp={() => { sc.current = null; }} onPointerCancel={() => { sc.current = null; }}>{label}</span>
      <input value={d ?? r1(value)} onFocus={(e) => { setD(String(r1(value))); e.target.select(); }} onBlur={() => setD(null)}
        onChange={(e) => { setD(e.target.value); const n = parseFloat(e.target.value); if (isFinite(n)) set(n); }}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
          if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); const n = (parseFloat(e.currentTarget.value) || 0) + (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1); setD(String(r1(n))); set(n); } }}
        style={{ width: 52, font: "inherit", background: "#222", color: "#fff", border: "1px solid #444", borderRadius: 4, padding: "3px 4px" }} />
    </label>
  );
}

// Overlay value label that edits through the override path: click = type (Enter applies, Esc cancels),
// drag = scrub (Shift x10, Alt x0.1), arrows nudge by 1 (Shift 10) while focused.
function EditChip({ x, y, text, color, h, setVal, font }) {
  const [ed, setEd] = useState(false);
  const dr = useRef(null);
  const base = () => parseFloat(text) || 0;
  const wrap = { position: "fixed", left: x, top: y, transform: "translate(-50%,-50%)", background: color, color: "#fff", font, padding: "3px 5px", borderRadius: 4, whiteSpace: "nowrap", pointerEvents: "auto", zIndex: 2, cursor: "ew-resize", touchAction: "none", userSelect: "none", outlineOffset: 1 };
  if (!h) return <div style={{ ...wrap, pointerEvents: "none" }}>{text}</div>;
  if (ed) return (
    <div data-im-chip style={{ ...wrap, cursor: "text" }}>
      <input autoFocus onFocus={(e) => e.target.select()} defaultValue={text} style={{ width: 44, font, border: 0, borderRadius: 2 }}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { const n = parseFloat(e.currentTarget.value); if (isFinite(n)) setVal(h, n); setEd(false); } if (e.key === "Escape") setEd(false); }}
        onBlur={() => setEd(false)} />
    </div>
  );
  return (
    <div data-im-chip tabIndex={0} style={wrap}
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); dr.current = { x: e.clientX, v: base(), moved: false }; }}
      onPointerMove={(e) => { const d = dr.current; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 3) d.moved = true; if (d.moved) { const m = e.shiftKey ? 10 : e.altKey ? 0.1 : 1; setVal(h, d.v + dx * m); } }}
      onPointerUp={() => { const d = dr.current; dr.current = null; if (d && !d.moved) setEd(true); }} onPointerCancel={() => { dr.current = null; }}
      onKeyDown={(e) => { const dir = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]; if (dir) { e.preventDefault(); e.stopPropagation(); setVal(h, base() + dir * (e.shiftKey ? 10 : 1)); } if (e.key === "Enter") setEd(true); }}>{text}</div>
  );
}

function hoverLines(el) {
  const r = el.getBoundingClientRect(), par = el.parentElement, out = [];
  if (par) {
    const P = par.getBoundingClientRect();
    const cy = r.top + r.height / 2, cx = r.left + r.width / 2;
    [[cx, P.top, cx, r.top, r.top - P.top], [cx, r.bottom, cx, P.bottom, P.bottom - r.bottom], [P.left, cy, r.left, cy, r.left - P.left], [r.right, cy, P.right, cy, P.right - r.right]]
      .forEach(([x1, y1, x2, y2, d]) => { if (d >= 1) out.push({ x1, y1, x2, y2, label: Math.round(d * 10) / 10 }); });
  }
  return { r, out, cls: tagCls(el) };
}

const itemCss = (v) => `${v.sel} { ${v.prop}: ${v.val}px !important; }`;
const cssText = (o) => Object.values(o).map(itemCss).join("\n");

export default function InspectMode() {
  const [on, setOn] = useState(false);
  const [model, setModel] = useState({ lines: [], bands: [], handles: [] });
  const [hover, setHover] = useState(null);
  const [ov, setOv] = useState({});
  const [sel, setSel] = useState(null);
  const [typing, setTyping] = useState(null);
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState("sections");
  const [selEl, setSelEl] = useState(null);
  const modeRef = useRef(mode); modeRef.current = mode;
  const selElRef = useRef(null); selElRef.current = selEl;
  const ovRef = useRef(ov); ovRef.current = ov;
  const styleRef = useRef(null);
  const raf = useRef(0);
  const drag = useRef(null);

  useEffect(() => {
    const st = document.createElement("style");
    st.id = "inspect-live"; document.head.appendChild(st); styleRef.current = st;
    const key = (e) => {
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "i" && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && !e.target.isContentEditable) { e.preventDefault(); setOn((v) => !v); }
    };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); st.remove(); delete window.__inspect; };
  }, []);
  useEffect(() => { if (styleRef.current) styleRef.current.textContent = cssText(ov); }, [ov]);

  const refresh = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (modeRef.current === "elements") { const e = selElRef.current; return setModel(e && e.isConnected ? measureEl(e) : { lines: [], bands: [], handles: [] }); }
      const root = getRoot(); if (root) setModel(measure(root));
    });
  };
  useEffect(() => { refresh(); }, [mode, selEl]);
  useEffect(() => {
    if (!on) return;
    refresh();
    const ro = new ResizeObserver(refresh); ro.observe(document.body);
    const iv = setInterval(refresh, 600);
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    const mv = (e) => {
      if (drag.current) return;
      const t = document.elementFromPoint(e.clientX, e.clientY);
      const root = getRoot(), els = modeRef.current === "elements";
      if (!t || !root || t.closest("[data-inspect-ui]") || (els ? t === document.body || t === document.documentElement : t === root || !root.contains(t))) return setHover(null);
      setHover(hoverLines(t));
    };
    window.addEventListener("mousemove", mv, { passive: true });
    // Elements mode: the page is inert while inspecting; a click selects (Shift = its parent).
    const swallow = (e) => { if (modeRef.current === "elements" && !e.target.closest?.("[data-inspect-ui]")) { e.preventDefault(); e.stopPropagation(); return true; } };
    const click = (e) => {
      if (!swallow(e)) return;
      const t = e.target; if (t === document.body || t === document.documentElement) return;
      setSel(null); setSelEl(e.shiftKey && t.parentElement && t.parentElement !== document.body ? t.parentElement : t);
    };
    const evs = ["pointerdown", "pointerup", "mousedown", "mouseup", "dblclick", "contextmenu"];
    evs.forEach((n) => window.addEventListener(n, swallow, true));
    window.addEventListener("click", click, true);
    return () => {
      evs.forEach((n) => window.removeEventListener(n, swallow, true)); window.removeEventListener("click", click, true); ro.disconnect(); clearInterval(iv); cancelAnimationFrame(raf.current); window.removeEventListener("scroll", refresh); window.removeEventListener("resize", refresh); window.removeEventListener("mousemove", mv); setHover(null); };
  }, [on]);

  const setVal = (h, v) => {
    v = Math.max(h.min ?? 0, Math.round(v * 10) / 10);
    const sel = selFor(h.el), k = sel + "|" + h.prop;
    setOv((o) => ({ ...o, [k]: { sel, prop: h.prop, old: o[k]?.old ?? h.val, val: v } }));
    requestAnimationFrame(refresh);
  };
  const hkey = (h) => selFor(h.el) + "|" + h.prop;

  const down = (e, h) => {
    e.preventDefault(); e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { h, start: h.axis === "x" ? e.clientX : e.clientY, v0: h.val };
    setSel(h);
  };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    let v = d.v0 + d.h.dir * ((d.h.axis === "x" ? e.clientX : e.clientY) - d.start);
    v = e.altKey ? Math.round(v) : Math.round(v / 4) * 4;
    setVal(d.h, v);
  };
  const up = () => { drag.current = null; };

  useEffect(() => {
    if (!on) return;
    const k = (e) => {
      if (typing || /INPUT|TEXTAREA/.test(e.target.tagName) || e.target.closest?.("[data-im-chip]")) return;
      const els = modeRef.current === "elements", cur0 = selElRef.current;
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const kk = e.key.toLowerCase();
        if (kk === "s" || kk === "e") { setMode(kk === "s" ? "sections" : "elements"); setSel(null); return; }
      }
      if (els && e.key === "Escape") { if (sel) setSel(null); else setSelEl(null); return; }
      if (els && cur0 && !sel && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const par = cur0.parentElement, sib = par ? kids(par) : [], i = sib.indexOf(cur0);
        const nx = { ArrowUp: par !== document.body ? par : null, ArrowDown: kids(cur0)[0], ArrowLeft: sib[i - 1], ArrowRight: sib[i + 1] }[e.key];
        if (nx) setSelEl(nx);
        return;
      }
      if (!sel) return;
      const dir = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const cur = ovRef.current[hkey(sel)]?.val ?? sel.val;
      setVal(sel, cur + dir * sel.dir * (e.shiftKey ? 10 : 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const write = async (keys = Object.keys(ovRef.current)) => {
    try {
      const pick = keys.map((k) => ovRef.current[k]).filter(Boolean);
      const r = await fetch("/__inspect/write", { method: "POST", body: JSON.stringify({ css: cssText(pick) }) });
      if (!r.ok) throw new Error(r.status);
      setMsg(`written ${pick.length}`); setOv((o) => { const c = { ...o }; keys.forEach((k) => delete c[k]); return c; });
    } catch (er) { setMsg("write failed: " + er.message); }
  };
  const copy = (keys = Object.keys(ov)) => { navigator.clipboard?.writeText(cssText(keys.map((k) => ov[k]).filter(Boolean))); setMsg("copied"); };
  const drop = (k) => setOv((o) => { const c = { ...o }; delete c[k]; return c; });
  const setProp = (el, prop, val, min = 0) => setVal({ el, prop, val: propNow(el, prop), min }, val);
  // Dev/test hook (headless checks drive Elements mode through this).
  window.__inspect = { on: () => on, toggle: () => setOn((v) => !v), mode: setMode, select: setSelEl, set: setProp, overrides: () => ovRef.current, selected: () => selElRef.current };
  const segBtn = (m, t) => <button key={m} onClick={() => { setMode(m); setSel(null); }} style={{ font, padding: "5px 8px", borderRadius: 6, border: 0, background: mode === m ? HAND : "#333", color: "#fff", cursor: "pointer" }}>{t}</button>;

  const font = "600 11px/1 ui-monospace,Menlo,monospace";
  const chip = (x, y, text, color = RED) => (
    <div style={{ position: "fixed", left: x, top: y, transform: "translate(-50%,-50%)", background: color, color: "#fff", font, padding: "3px 5px", borderRadius: 4, pointerEvents: "none", whiteSpace: "nowrap" }}>{text}</div>
  );
  const ui = { "data-inspect-ui": "" };
  const n = Object.keys(ov).length;
  const selR = mode === "elements" && selEl?.isConnected ? selEl.getBoundingClientRect() : null;

  return (
    <>
      <button {...ui} type="button" className="theme-toggle" onClick={() => setOn((v) => !v)} aria-label="Inspect (Shift+I)" aria-pressed={on} title={`Inspect (⇧I)${n ? ` · ${n} edits` : ""}`} style={{ position: "fixed", left: 16, bottom: 16, zIndex: Z + 5, cursor: "pointer", color: on ? HAND : undefined, boxShadow: on ? `0 0 0 2px ${HAND}` : undefined }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="6" /><path d="M12 2v5M12 17v5M2 12h5M17 12h5" /></svg>
      </button>
      {on && (
        <div {...ui} style={{ position: "fixed", inset: 0, zIndex: Z, pointerEvents: "none" }}>
          {model.bands.map((b, i) => (
            <div key={"b" + i} style={{ position: "fixed", left: b.x, top: b.y, width: b.w, height: b.h, background: b.c, pointerEvents: "none" }} />
          ))}
          <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
            {model.lines.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={RED} strokeWidth="1" />)}
            {hover && <rect x={hover.r.left} y={hover.r.top} width={hover.r.width} height={hover.r.height} fill="rgba(10,132,255,.08)" stroke={HAND} strokeWidth="1" />}
            {hover && hover.out.map((l, i) => <line key={"h" + i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={HAND} strokeWidth="1" />)}
          </svg>
          {model.bands.map((b, i) => (b.w > 24 && b.h > 14 ? <EditChip key={"bl" + i} x={b.x + b.w / 2} y={b.y + b.h / 2} text={Math.round(b.l * 10) / 10} color={b.c === PAD ? "#1f9d47" : "#d9820a"} h={b.h2 || b.h} setVal={setVal} font={font} /> : null))}
          {model.lines.map((l, i) => <EditChip key={"ll" + i} x={(l.x1 + l.x2) / 2} y={(l.y1 + l.y2) / 2} text={l.label} color={RED} h={l.h} setVal={setVal} font={font} />)}
          {hover && hover.out.map((l, i) => <div key={"hl" + i}>{chip((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2, l.label, HAND)}</div>)}
          {hover && chip(hover.r.left + hover.r.width / 2, hover.r.bottom + 12, `${hover.cls} ${Math.round(hover.r.width)}×${Math.round(hover.r.height)}`, HAND)}
          {selR && <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}><rect x={selR.left} y={selR.top} width={selR.width} height={selR.height} fill="none" stroke={HAND} strokeWidth="2" /></svg>}
          {selR && chip(selR.left + 4, Math.max(10, selR.top - 12), `${tagCls(selEl)} ${Math.round(selR.width)}×${Math.round(selR.height)}`, HAND)}
          {model.handles.map((h, i) => {
            const o = ov[hkey(h)], v = o ? o.val : h.val, isSel = sel && hkey(sel) === hkey(h);
            const horiz = h.axis === "y";
            return (
              <div key={i}>
                <div onPointerDown={(e) => down(e, h)} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
                  style={{ position: "fixed", left: h.x, top: h.y, width: horiz ? (h.len || 44) : 8, height: horiz ? 8 : (h.len || 44), transform: "translate(-50%,-50%)", background: isSel ? HAND : "#fff", border: `2px solid ${HAND}`, borderRadius: 4, cursor: horiz ? "ns-resize" : "ew-resize", pointerEvents: "auto", touchAction: "none", boxSizing: "border-box" }} />
                <div onClick={() => setTyping({ h, v })}
                  style={{ position: "fixed", left: h.x + (horiz ? 40 : 0), top: h.y + (horiz ? 0 : 36), transform: "translate(-50%,-50%)", background: HAND, color: "#fff", font, padding: "3px 5px", borderRadius: 4, cursor: "text", pointerEvents: "auto", whiteSpace: "nowrap" }}>
                  {typing && hkey(typing.h) === hkey(h) ? (
                    <input autoFocus defaultValue={v} style={{ width: 44, font, border: 0, borderRadius: 2 }}
                      onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { setVal(h, parseFloat(e.currentTarget.value) || 0); setTyping(null); } if (e.key === "Escape") setTyping(null); }}
                      onBlur={() => setTyping(null)} />
                  ) : `${Math.round(v * 10) / 10}`}
                </div>
              </div>
            );
          })}
          <div {...ui} style={{ position: "fixed", left: 12, bottom: 52, width: 340, maxHeight: "40vh", overflow: "auto", background: "#111e", color: "#fff", font, padding: 10, borderRadius: 10, pointerEvents: "auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
              {segBtn("sections", "Sections S")}{segBtn("elements", "Elements E")}
              <b style={{ flex: 1 }}>({n}) {msg && <span style={{ opacity: 0.6 }}>· {msg}</span>}</b>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {[["Copy CSS", () => copy()], ["Write to file", () => write()], ["Reset", () => { setOv({}); setMsg("reset"); }]].map(([t, f]) => (
                <button key={t} disabled={!n} onClick={f} style={{ font, padding: "5px 7px", borderRadius: 6, border: 0, background: "#333", color: "#fff", cursor: n ? "pointer" : "default", opacity: n ? 1 : 0.4 }}>{t}</button>
              ))}
            </div>
            {n === 0 && mode === "elements" && <div style={{ opacity: 0.6, lineHeight: 1.5 }}>Click an element (Shift = parent). Arrows: ← → siblings, ↑ parent, ↓ child. Esc deselects.</div>}
            {n === 0 && mode === "sections" && <div style={{ opacity: 0.6, lineHeight: 1.5 }}>Drag a blue handle, click its number to type, or select one and use arrows (Shift = 10, Alt-drag = 1px).</div>}
            {Object.entries(ov).map(([k, c]) => (
              <div key={k} data-ov-item style={{ margin: "4px 0", lineHeight: 1.4, wordBreak: "break-all" }}>{c.sel} <span style={{ color: "#8ab4ff" }}>{c.prop}</span> {Math.round(c.old * 10) / 10} → {c.val}
                {[["copy", () => copy([k])], ["write", () => write([k])], ["reset", () => drop(k)]].map(([t, f]) => (
                  <button key={t} onClick={f} style={{ font, marginLeft: 4, padding: "2px 5px", borderRadius: 4, border: 0, background: "#333", color: "#fff", cursor: "pointer" }}>{t}</button>
                ))}
              </div>
            ))}
          </div>
          {selR && (
            <div {...ui} data-inspect-panel style={{ position: "fixed", right: 12, top: 12, width: 190, maxHeight: "calc(100vh - 24px)", overflow: "auto", background: "#111e", color: "#fff", font, padding: 10, borderRadius: 10, pointerEvents: "auto" }}>
              <div style={{ marginBottom: 6, color: "#8ab4ff", wordBreak: "break-all" }}>{tagCls(selEl)}</div>
              {FIELDS.map(([g, fs]) => (
                <div key={g} style={{ marginBottom: 6 }}>
                  <div style={{ opacity: 0.5, margin: "4px 0 2px" }}>{g}</div>
                  {fs.filter(([, p]) => !/gap/.test(p) || /flex|grid/.test(getComputedStyle(selEl).display)).map(([l, p, mn]) => (
                    <Field key={p} label={l} value={propNow(selEl, p)} min={mn ?? 0} onSet={(v) => setProp(selEl, p, v, mn ?? 0)} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
