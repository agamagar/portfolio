// DEV-ONLY "Inspect mode" (11 Oct 2026). Shift+I or the pill toggles it. Figma-style spacing redlines
// (gaps, padding, margin) drawn in one fixed overlay from getBoundingClientRect, hover = distances to
// parent edges + siblings, draggable handles (padding / margin / gap) with 4px snap (Alt = 1px, arrows
// nudge, Shift = 10), click a value to type it. Changes apply live through one <style> tag; the panel
// lists them with Copy CSS / Write to file (dev endpoint tools/inspect-overrides-plugin.mjs appends to
// src/hello3/inspect-overrides.css) / Reset. Mounted from main.jsx under import.meta.env.DEV only.
import { useEffect, useRef, useState } from "react";

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
function measure(root) {
  const lines = [], bands = [], handles = [];
  const sections = [...root.children].filter((e) => /^(SECTION|FOOTER)$/.test(e.tagName) && inFlow(e) && vis(e));
  const addGap = (a, b, cont, many) => {
    const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    const cs = cont ? getComputedStyle(cont) : null;
    const flexy = cs && /flex|grid/.test(cs.display);
    if (B.top - A.bottom >= 1 && ox > 0) {
      const x = Math.max(A.left, B.left) + ox / 2, d = B.top - A.bottom;
      lines.push({ x1: x, y1: A.bottom, x2: x, y2: B.top, label: Math.round(d * 10) / 10 });
      handles.push({ el: flexy ? cont : b, prop: flexy ? "row-gap" : "margin-top", axis: "y", dir: 1, x, y: B.top - d / 2, val: flexy ? px(cs.rowGap) : px(getComputedStyle(b).marginTop), key: many });
    } else if (B.left - A.right >= 1 && oy > 0) {
      const y = Math.max(A.top, B.top) + oy / 2, d = B.left - A.right;
      lines.push({ x1: A.right, y1: y, x2: B.left, y2: y, label: Math.round(d * 10) / 10 });
      handles.push({ el: flexy ? cont : b, prop: flexy ? "column-gap" : "margin-left", axis: "x", dir: 1, x: B.left - d / 2, y, val: flexy ? px(cs.columnGap) : px(getComputedStyle(b).marginLeft), key: many });
    }
  };
  sections.forEach((s, i) => {
    const cs = getComputedStyle(s), r = s.getBoundingClientRect();
    const p = ["Top", "Right", "Bottom", "Left"].map((k) => px(cs["padding" + k]));
    const m = ["Top", "Right", "Bottom", "Left"].map((k) => px(cs["margin" + k]));
    if (p[0]) bands.push({ x: r.left, y: r.top, w: r.width, h: p[0], c: PAD, l: p[0] });
    if (p[2]) bands.push({ x: r.left, y: r.bottom - p[2], w: r.width, h: p[2], c: PAD, l: p[2] });
    if (p[1]) bands.push({ x: r.right - p[1], y: r.top + p[0], w: p[1], h: r.height - p[0] - p[2], c: PAD, l: p[1] });
    if (p[3]) bands.push({ x: r.left, y: r.top + p[0], w: p[3], h: r.height - p[0] - p[2], c: PAD, l: p[3] });
    if (m[0]) bands.push({ x: r.left, y: r.top - m[0], w: r.width, h: m[0], c: MAR, l: m[0] });
    if (m[2]) bands.push({ x: r.left, y: r.bottom, w: r.width, h: m[2], c: MAR, l: m[2] });
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

function hoverLines(el) {
  const r = el.getBoundingClientRect(), par = el.parentElement, out = [];
  if (par) {
    const P = par.getBoundingClientRect();
    const cy = r.top + r.height / 2, cx = r.left + r.width / 2;
    [[cx, P.top, cx, r.top, r.top - P.top], [cx, r.bottom, cx, P.bottom, P.bottom - r.bottom], [P.left, cy, r.left, cy, r.left - P.left], [r.right, cy, P.right, cy, P.right - r.right]]
      .forEach(([x1, y1, x2, y2, d]) => { if (d >= 1) out.push({ x1, y1, x2, y2, label: Math.round(d * 10) / 10 }); });
  }
  return { r, out, cls: el.tagName.toLowerCase() + (el.classList[0] ? "." + el.classList[0] : "") };
}

const cssText = (o) => Object.values(o).map((v) => `${v.sel} { ${v.prop}: ${v.val}px !important; }`).join("\n");

export default function InspectMode() {
  const [on, setOn] = useState(false);
  const [model, setModel] = useState({ lines: [], bands: [], handles: [] });
  const [hover, setHover] = useState(null);
  const [ov, setOv] = useState({});
  const [sel, setSel] = useState(null);
  const [typing, setTyping] = useState(null);
  const [msg, setMsg] = useState("");
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
    return () => { window.removeEventListener("keydown", key); st.remove(); };
  }, []);
  useEffect(() => { if (styleRef.current) styleRef.current.textContent = cssText(ov); }, [ov]);

  const refresh = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => { const root = document.querySelector(".hello"); if (root) setModel(measure(root)); });
  };
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
      const root = document.querySelector(".hello");
      if (!t || !root || t === root || !root.contains(t) || t.closest("[data-inspect-ui]")) return setHover(null);
      setHover(hoverLines(t));
    };
    window.addEventListener("mousemove", mv, { passive: true });
    return () => { ro.disconnect(); clearInterval(iv); cancelAnimationFrame(raf.current); window.removeEventListener("scroll", refresh); window.removeEventListener("resize", refresh); window.removeEventListener("mousemove", mv); setHover(null); };
  }, [on]);

  const setVal = (h, v) => {
    v = Math.max(0, Math.round(v * 10) / 10);
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
      if (!sel || typing || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const dir = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const cur = ovRef.current[hkey(sel)]?.val ?? sel.val;
      setVal(sel, cur + dir * sel.dir * (e.shiftKey ? 10 : 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const write = async () => {
    try {
      const r = await fetch("/__inspect/write", { method: "POST", body: JSON.stringify({ css: cssText(ov) }) });
      if (!r.ok) throw new Error(r.status);
      setMsg(`written ${Object.keys(ov).length}`); setOv({});
    } catch (er) { setMsg("write failed: " + er.message); }
  };
  const copy = () => { navigator.clipboard?.writeText(cssText(ov)); setMsg("copied"); };

  const font = "600 11px/1 ui-monospace,Menlo,monospace";
  const chip = (x, y, text, color = RED) => (
    <div style={{ position: "fixed", left: x, top: y, transform: "translate(-50%,-50%)", background: color, color: "#fff", font, padding: "3px 5px", borderRadius: 4, pointerEvents: "none", whiteSpace: "nowrap" }}>{text}</div>
  );
  const ui = { "data-inspect-ui": "" };
  const n = Object.keys(ov).length;

  return (
    <>
      <button {...ui} onClick={() => setOn((v) => !v)} style={{ position: "fixed", left: 12, bottom: 12, zIndex: Z + 5, font, padding: "8px 10px", borderRadius: 999, border: "1px solid #0003", background: on ? HAND : "#111", color: "#fff", cursor: "pointer", opacity: on ? 1 : 0.55 }}>
        Inspect{n ? ` · ${n}` : ""} <span style={{ opacity: 0.6 }}>⇧I</span>
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
          {model.bands.map((b, i) => (b.w > 24 && b.h > 14 ? <div key={"bl" + i}>{chip(b.x + b.w / 2, b.y + b.h / 2, Math.round(b.l * 10) / 10, b.c === PAD ? "#1f9d47" : "#d9820a")}</div> : null))}
          {model.lines.map((l, i) => <div key={"ll" + i}>{chip((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2, l.label)}</div>)}
          {hover && hover.out.map((l, i) => <div key={"hl" + i}>{chip((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2, l.label, HAND)}</div>)}
          {hover && chip(hover.r.left + hover.r.width / 2, hover.r.bottom + 12, `${hover.cls} ${Math.round(hover.r.width)}×${Math.round(hover.r.height)}`, HAND)}
          {model.handles.map((h, i) => {
            const o = ov[hkey(h)], v = o ? o.val : h.val, isSel = sel && hkey(sel) === hkey(h);
            const horiz = h.axis === "y";
            return (
              <div key={i}>
                <div onPointerDown={(e) => down(e, h)} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
                  style={{ position: "fixed", left: h.x, top: h.y, width: horiz ? 44 : 8, height: horiz ? 8 : 44, transform: "translate(-50%,-50%)", background: isSel ? HAND : "#fff", border: `2px solid ${HAND}`, borderRadius: 4, cursor: horiz ? "ns-resize" : "ew-resize", pointerEvents: "auto", touchAction: "none", boxSizing: "border-box" }} />
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
              <b style={{ flex: 1 }}>Changes ({n}) {msg && <span style={{ opacity: 0.6 }}>· {msg}</span>}</b>
              {[["Copy CSS", copy], ["Write to file", write], ["Reset", () => { setOv({}); setMsg("reset"); }]].map(([t, f]) => (
                <button key={t} disabled={!n} onClick={f} style={{ font, padding: "5px 7px", borderRadius: 6, border: 0, background: "#333", color: "#fff", cursor: n ? "pointer" : "default", opacity: n ? 1 : 0.4 }}>{t}</button>
              ))}
            </div>
            {n === 0 && <div style={{ opacity: 0.6, lineHeight: 1.5 }}>Drag a blue handle, click its number to type, or select one and use arrows (Shift = 10, Alt-drag = 1px).</div>}
            {Object.values(ov).map((c) => <div key={c.sel + c.prop} style={{ margin: "4px 0", lineHeight: 1.4, wordBreak: "break-all" }}>{c.sel} <span style={{ color: "#8ab4ff" }}>{c.prop}</span> {Math.round(c.old * 10) / 10} → {c.val}</div>)}
          </div>
        </div>
      )}
    </>
  );
}
