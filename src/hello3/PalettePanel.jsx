// DEV-ONLY palette panel (mvgeiwfl, Agam: "add a button to open the palette for the project ... the pink and purple one we
// built earlier ... in tabs"). A round glass button above the eye, in the left stack, opens a panel with:
//   Combinations  every text-on-background pairing the stylesheets declare in green or purple (mvgep9ji), with its contrast
//   Case palette  every colour custom property the case study's own stylesheets declare (--sd-*, --sdc-*, --rv-*, --rex-*,
//                 --ig-*), read live, with a pink / purple filter; click a swatch to copy its hex
//   Site colours  /system's Colour section (tokens, light and dark, WCAG contrast), reused as is
//   Type          /system's Type section
//   Components    /system's Components section (buttons, banners, tags, cards, cursors)
// Esc and a click outside close it. Mounted from main.jsx under import.meta.env.DEV, like Inspect.
import { useEffect, useMemo, useRef, useState } from "react";
import { Colour, Type, Components } from "../system/SystemPage";
import "../system/system.css";
import "./palettePanel.css";

const PREFIXES = ["--sd-", "--sdc-", "--rv-", "--rex-", "--ig-", "--sdr-"];
const noop = () => {};

function* rules(list) {
  for (const r of list) { yield r; if (r.cssRules && !(r instanceof CSSStyleRule)) yield* rules(r.cssRules); }
}
function readCaseTokens() {
  const out = new Map();
  for (const ss of document.styleSheets) {
    let list; try { list = ss.cssRules; } catch { continue; }
    for (const r of rules(list)) {
      if (!(r instanceof CSSStyleRule)) continue;
      for (let i = 0; i < r.style.length; i++) {
        const n = r.style[i];
        if (!PREFIXES.some((p) => n.startsWith(p))) continue;
        const v = r.style.getPropertyValue(n).trim();
        if (!out.has(n)) out.set(n, { name: n, values: [] });
        out.get(n).values.push({ v, sel: r.selectorText });
      }
    }
  }
  return [...out.values()];
}
const probe = (() => { let el; return (raw) => {
  if (!el) { el = document.createElement("i"); el.style.cssText = "position:fixed;left:-9999px;top:0;"; document.body.appendChild(el); }
  el.style.color = ""; el.style.color = raw;
  if (!el.style.color) return null;
  const m = getComputedStyle(el).color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r, g, b, a };
}; })();
const hex2 = (c) => "#" + [c.r, c.g, c.b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("") + (c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, "0") : "");
function hue(c) {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 0.08) return null; // grey
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
const isPinkPurple = (c) => { const h = c && hue(c); return h != null && h >= 255 && h <= 345; };

function CasePalette() {
  const [only, setOnly] = useState(true);
  const [copied, setCopied] = useState("");
  const rows = useMemo(() => readCaseTokens().map((t) => {
    const first = t.values[0], c = probe(first.v);
    return { ...t, c, raw: first.v, more: t.values.slice(1) };
  }).filter((r) => r.c), []);
  const shown = only ? rows.filter((r) => isPinkPurple(r.c)) : rows;
  const copy = (txt) => { try { navigator.clipboard.writeText(txt); } catch { /* clipboard blocked */ } setCopied(txt); setTimeout(() => setCopied((x) => (x === txt ? "" : x)), 1200); };
  return (
    <>
      <p className="sys-note">Every colour custom property the case study's own stylesheets declare, read live ({PREFIXES.join(" ")}). Click a swatch to copy its hex.</p>
      <label className="pal__only"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Pink and purple only <small>{shown.length} of {rows.length}</small></label>
      <div className="pal__grid">
        {shown.map((r) => (
          <button key={r.name} type="button" className="pal__sw" onClick={() => copy(hex2(r.c))} title={`${r.name}: ${r.raw}${r.more.length ? ` (+${r.more.length} more in other rules)` : ""}`}>
            <i style={{ background: `rgba(${r.c.r},${r.c.g},${r.c.b},${r.c.a})` }} />
            <b>{copied === hex2(r.c) ? "Copied" : hex2(r.c)}</b>
            <code>{r.name}</code>
          </button>
        ))}
      </div>
    </>
  );
}

// every rule that sets BOTH a text colour and a background to literal colours, kept when either is green or purple/pink
function readCombos() {
  const seen = new Map();
  for (const ss of document.styleSheets) {
    let list; try { list = ss.cssRules; } catch { continue; }
    for (const r of rules(list)) {
      if (!(r instanceof CSSStyleRule)) continue;
      const st = r.style, fg = st.getPropertyValue("color"), bg = st.getPropertyValue("background-color") || (/^(#|rgb|hsl)/i.test(st.getPropertyValue("background")) ? st.getPropertyValue("background") : "");
      if (!fg || !bg || /var\(|inherit|currentcolor|transparent|gradient/i.test(fg + bg)) continue;
      const f = probe(fg), b = probe(bg);
      if (!f || !b || b.a < 0.5) continue;
      const hf = hue(f), hb = hue(b);
      const fam = (h) => (h == null ? null : h >= 100 && h <= 175 ? "green" : h >= 255 && h <= 345 ? "purple" : null);
      const family = fam(hb) || fam(hf);
      if (!family) continue;
      const key = hex2(f) + hex2(b);
      if (!seen.has(key)) seen.set(key, { f, b, family, sels: [] });
      const e = seen.get(key); if (e.sels.length < 3) e.sels.push(r.selectorText);
    }
  }
  const lum = (c) => { const ch = [c.r, c.g, c.b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]; };
  return [...seen.values()].map((e) => { const a = lum(e.f), b = lum(e.b); return { ...e, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }; });
}
function Combos() {
  const [fam, setFam] = useState("both");
  const [copied, setCopied] = useState("");
  const all = useMemo(() => readCombos(), []);
  const shown = all.filter((c) => fam === "both" || c.family === fam).sort((x, y) => y.ratio - x.ratio);
  const copy = (t) => { try { navigator.clipboard.writeText(t); } catch { /* clipboard blocked */ } setCopied(t); setTimeout(() => setCopied(""), 1200); };
  return (
    <>
      <p className="sys-note">Every text-on-background pairing the stylesheets declare with literal colours, kept where either side is green or purple. Sample, ratio, and the rules that use it. Click one to copy "fg on bg".</p>
      <div className="pal__tabs pal__tabs--sub">
        {[["both", "Green and purple"], ["green", "Green"], ["purple", "Purple"]].map(([k, l]) => <button key={k} type="button" className={fam === k ? "is-on" : ""} onClick={() => setFam(k)}>{l}</button>)}
        <small>{shown.length} pairs</small>
      </div>
      <div className="pal__combos">
        {shown.map((c) => {
          const t = `${hex2(c.f)} on ${hex2(c.b)}`;
          return (
            <button key={t} type="button" className="pal__combo" onClick={() => copy(t)} title={c.sels.join("\n")}>
              <span className="pal__combo-s" style={{ color: `rgb(${c.f.r},${c.f.g},${c.f.b})`, background: `rgba(${c.b.r},${c.b.g},${c.b.b},${c.b.a})` }}>Aa Scheduled</span>
              <b>{copied === t ? "Copied" : t}</b>
              <em className={c.ratio >= 4.5 ? "ok" : c.ratio >= 3 ? "mid" : "low"}>{c.ratio.toFixed(2)}:1 {c.ratio >= 4.5 ? "AA" : c.ratio >= 3 ? "large only" : "fails"}</em>
              <code>{c.sels[0]}</code>
            </button>
          );
        })}
      </div>
    </>
  );
}

const TABS = [["case", "Case palette"], ["combos", "Combinations"], ["site", "Site colours"], ["type", "Type"], ["comp", "Components"]];

export default function PalettePanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("case");
  const box = useRef(null), btn = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => { if (e.key === "Escape") setOpen(false); };
    const out = (e) => { if (box.current && !box.current.contains(e.target) && !btn.current?.contains(e.target)) setOpen(false); };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", out, true);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("pointerdown", out, true); };
  }, [open]);
  const theme = typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light";
  return (
    <>
      <button ref={btn} type="button" className="theme-toggle dev-glass pal__btn" data-inspect-ui="" aria-label="Palette and components" aria-pressed={open} title="Palette and components" onClick={() => setOpen((v) => !v)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.8 1.7-1.6 0-.5-.3-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4-4-7-9-7z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="14.5" cy="7" r="1" /></svg>
      </button>
      {open && (
        <div ref={box} className="pal" data-inspect-ui="" role="dialog" aria-label="Palette and components">
          <div className="pal__tabs" role="tablist">
            {TABS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "is-on" : ""} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          <div className="pal__body sys">
            {tab === "case" && <CasePalette />}
            {tab === "combos" && <Combos />}
            {tab === "site" && <Colour />}
            {tab === "type" && <Type />}
            {tab === "comp" && <Components theme={theme} onToggleTheme={noop} />}
          </div>
        </div>
      )}
    </>
  );
}
