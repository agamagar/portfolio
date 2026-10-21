// /system: the design system, read live from the code (private/dev builds only).
// Colours come from the :root / html.dark rules, scales are histograms of what the stylesheets
// declare, components are the real ones. Nothing is typed in twice. See readCss.js.
import SectionIndex from "../ui/SectionIndex";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SERIFS } from "../lib/serifFont";
import { StackedBars, Bars, LineChart, Legend, ramp, STATUS, fmtPct0, fmtPct1, fmtK } from "../ui/charts";
import FontSwitch from "../ui/FontSwitch";
import ViewMenu from "../ui/ViewMenu";
import HeroChips from "../hello3/HeroChips";
import NewTag from "../hello3/NewTag";
import LockedLink from "../hello3/LockedLink";
import SideQuests from "../hello3/SideQuests";
import { LOCK_COPY } from "../hello3/workMeta";
import { PHONE_QUERY } from "../hello3/usePhone";
import { SNAP, PHI } from "../hello3/AlongPath";
import { S as CX_STATES, G as CX_GLYPHS } from "../ui/ContextCursor";
import { readTokens, resolveAll, isColourValue, histogram, breakpoints, parseRgb, over, hex, oklch, contrast } from "./readCss";
import "./system.css";

const WorkGrid = lazy(() => import("../hello3/WorkGrid"));

const SECTIONS = [
  ["colour", "Colour"], ["type", "Type"], ["space", "Spacing and layout"], ["glass", "Glass"], ["components", "Components"], ["charts", "Charts"], ["motion", "Motion"],
];
const noop = () => {};
const PILL = { position: "static", display: "inline-flex", alignItems: "center", translate: "none", transform: "none", margin: 0, inset: "auto", opacity: 1, visibility: "visible" };

/* ---------------------------------------------------------------- charts */
const CH_MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const CH_STACK = CH_MONTHS.map((label, i) => ({ label, am: 11 + i * 2, mid: 20 + (i % 3), pm: 24 - i, eve: 36 - i * 2.2, night: 8 + (i % 2) }));
const CH_STACK_S = [{ key: "am", label: "6 to 10 AM" }, { key: "mid", label: "10 to 2" }, { key: "pm", label: "2 to 6" }, { key: "eve", label: "6 to 10 PM" }, { key: "night", label: "Night" }];
const CH_BARS = CH_MONTHS.map((label, i) => ({ label, orders: 80000 + i * i * 9000 + (i % 3) * 20000 }));
const CH_LINES = CH_MONTHS.map((label, i) => ({ label, a: 28 + Math.sin(i) * 3 + i, b: 14 + Math.cos(i / 2) * 2 }));
const CH_H = [{ label: "Customer changed mind", v: 71.4, sub: "before the slot" }, { label: "Out of stock", v: 18.2 }, { label: "Operations", v: 10.4 }];
function Chart({ name, note, children }) {
  return <div style={{ margin: "28px 0 0", maxWidth: 680 }}><h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{name}</h3><p className="sys-note" style={{ margin: "0 0 14px", fontSize: 13 }}>{note}</p>{children}</div>;
}
function Charts() {
  return (
    <>
      <p className="sys-note">Chart components in <code>src/ui/charts</code>. Segments of 3px radius with a 2px gap, a faint baseline instead of a heavy grid, the hovered bar lifts while the rest dim, bars and lines draw in once on scroll, and every chart carries a hidden data table. Sample data.</p>
      <Chart name="StackedBars" note="percent, 5-step violet ramp, legend and tooltip."><StackedBars percent data={CH_STACK} series={CH_STACK_S} colors={ramp(5)} yFormat={fmtPct0} valueFormat={fmtPct1} height={210} ariaLabel="Slot mix by month, sample" /></Chart>
      <Chart name="StackedBars, horizontal" note="Same component, orientation flipped."><StackedBars horizontal percent data={CH_STACK.slice(0, 4)} series={CH_STACK_S.slice(0, 3)} yFormat={fmtPct0} valueFormat={fmtPct1} ariaLabel="Slot mix, horizontal, sample" /></Chart>
      <Chart name="Bars" note="One series, vertical, with an emphasised bar."><Bars data={CH_BARS} valueKey="orders" label="Orders" yFormat={fmtK} emphasis={9} height={200} ariaLabel="Orders by month, sample" /></Chart>
      <Chart name="Bars, horizontal" note="Value labels at the bar end, optional sub caption."><Bars horizontal data={CH_H} valueKey="v" label="Share" yFormat={fmtPct1} max={100} ariaLabel="Cancellations by cause, sample" /></Chart>
      <Chart name="LineChart" note="Direct end labels, crosshair on hover, arrow keys when focused."><LineChart data={CH_LINES} series={[{ key: "a", label: "Scheduled" }, { key: "b", label: "All orders" }]} yFormat={fmtPct0} height={200} ariaLabel="Two lines, sample" /></Chart>
      <Chart name="LineChart, area" note="area adds a soft fade under the line."><LineChart area data={CH_LINES} series={[{ key: "a", label: "Scheduled" }]} yFormat={fmtPct0} height={170} ariaLabel="One area, sample" /></Chart>
      <Chart name="Legend" note="Box or line swatch; also built into the charts above."><Legend items={[{ label: "Within slot", color: STATUS[0] }, { label: "Early", color: STATUS[1] }, { label: "Late", color: STATUS[2] }]} /></Chart>
    </>
  );
}

/* ---------------------------------------------------------------- colour */
const TEXT_ON_BG = ["--fg", "--muted", "--muted-2", "--link", "--green", "--accent", "--sdc-accent", "--sdc-ok-within", "--sdc-ok-late"];

function useColours() {
  const [d, setD] = useState(null);
  useLayoutEffect(() => {
    const { light, dark } = readTokens();
    const isCol = (map, k, seen = 0) => {
      const v = map[k]; if (!v || seen > 6) return false;
      const m = v.match(/^var\((--[a-z0-9-]+)/i);
      return m ? isCol(map, m[1], seen + 1) : isColourValue(v);
    };
    const names = Object.keys(light).filter((k) => isCol(light, k) || isCol(dark, k));
    const mk = (map) => {
      const rgb = resolveAll(map, "color"), bg = parseRgb(rgb["--bg"] || "#fff");
      const o = {};
      for (const k of names) { if (!(k in map)) continue; const c = parseRgb(rgb[k]); o[k] = { raw: map[k], c, flat: over(c, bg) }; }
      return { o, bg };
    };
    const L = mk(light), D = mk(dark);
    setD({ names: names.filter((k) => L.o[k] || D.o[k]), L, D });
  }, []);
  return d;
}

function groupOf(k) {
  if (/^--(bg|fg|muted|muted-2|line|hover|accent|link|green|tl-axis-ink)$/.test(k)) return "Site";
  if (k.startsWith("--glass")) return "Glass";
  if (k.startsWith("--sdc")) return "Charts";
  if (k.startsWith("--ds-")) return "Figure kit (ds)";
  return "Other";
}

function Swatch({ t }) {
  if (!t) return <div className="sys-sw sys-sw--none">not set</div>;
  const a = t.c.a;
  return (
    <div className="sys-sw">
      <i className="sys-sw__chip" style={{ background: `rgba(${t.c.r},${t.c.g},${t.c.b},${a})` }} />
      <span className="sys-sw__v"><b>{hex(t.c)}</b><br />{oklch(t.c)}</span>
    </div>
  );
}

function Colour() {
  const d = useColours();
  if (!d) return null;
  const groups = {};
  for (const k of d.names) (groups[groupOf(k)] ||= []).push(k);
  const order = ["Site", "Glass", "Charts", "Figure kit (ds)", "Other"].filter((g) => groups[g]);
  return (
    <>
      <p className="sys-note">Each row is one custom property. Light is the <code>:root</code> value; dark is <code>:root.dark</code> over it. Values are the computed result, alpha shown as the hex suffix.</p>
      <h3 className="sys-h3">Text on background (WCAG AA)</h3>
      <div className="sys-contrast">
        {["L", "D"].map((th) => (
          <div key={th} className="sys-contrast__col" style={{ background: hex(d[th].bg), color: hex(d[th].o["--fg"]?.flat || d[th].bg) }}>
            <b>{th === "L" ? "Light" : "Dark"} · {hex(d[th].bg)}</b>
            {TEXT_ON_BG.filter((k) => d[th].o[k]).map((k) => {
              const r = contrast(d[th].o[k].flat, d[th].bg);
              return (
                <div key={k} className="sys-contrast__row">
                  <span style={{ color: hex(d[th].o[k].flat) }}>Aa  {k}</span>
                  <em>{r.toFixed(2)}:1 · {r >= 4.5 ? "AA" : r >= 3 ? "AA large only" : "fails"}</em>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {order.map((g) => (
        <div key={g}>
          <h3 className="sys-h3">{g} <small>{groups[g].length}</small></h3>
          <div className="sys-tokens">
            <div className="sys-tokens__head"><span>token</span><span>light</span><span>dark</span></div>
            {groups[g].map((k) => (
              <div key={k} className="sys-tokens__row">
                <code>{k}</code>
                <Swatch t={d.L.o[k]} />
                <Swatch t={d.D.o[k]} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------------------------------------------------------------- type */
const FAMILIES = [
  { name: "Display", token: "--type-display-family", css: "var(--type-display-family)", note: ".t-display, the one big line a section leads with" },
  { name: "Serif", token: "--font-serif", css: "var(--font-serif)", note: "prose; the Aa menu switches it" },
  { name: "Sans (Google Sans Flex)", css: '"Google Sans Flex", "Inter", -apple-system, sans-serif', note: "pills, chips, tags, tooltips" },
  { name: "Sans (Inter)", css: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', note: "body default" },
  { name: "Stack Sans Headline", css: '"Stack Sans Headline Variable", "Stack Sans Headline", sans-serif', note: "case header and case-study figures" },
  { name: "Prociono", css: '"Prociono", var(--font-serif)', note: "the hero headline, 36px" },
  { name: "Mono", css: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace', note: "code, labels" },
];

function Type() {
  const [scale, setScale] = useState([]);
  useEffect(() => {
    const toPx = (v) => { const m = v.match(/^([\d.]+)(px|rem)$/); return m ? +m[1] * (m[2] === "rem" ? 16 : 1) : null; };
    const h = histogram("font-size", (v) => (toPx(v) ? `${toPx(v)}px` : null));
    setScale([...h].map(([k, n]) => [parseFloat(k), n]).filter(([px, n]) => px >= 10 && px <= 64 && n >= 3).sort((a, b) => a[0] - b[0]));
  }, []);
  return (
    <>
      <h3 className="sys-h3">Families</h3>
      <div className="sys-fam">
        {FAMILIES.map((f) => (
          <div key={f.name} className="sys-fam__row">
            <div><b>{f.name}</b><br /><code>{f.token || f.css.split(",")[0]}</code><br /><small>{f.note}</small></div>
            <div className="sys-fam__spec" style={{ fontFamily: f.css }}>Agam designs things people use.<br /><span>ABCDEFG abcdefg 0123456789 → ✦</span></div>
          </div>
        ))}
      </div>
      <h3 className="sys-h3">FontSwitch options <small>lib/serifFont.js</small></h3>
      <div className="sys-fam">
        {SERIFS.map((s) => (
          <div key={s.id} className="sys-fam__row">
            <div><b>{s.label}</b><br /><code>{s.id}</code></div>
            <div className="sys-fam__spec" style={{ fontFamily: s.stack }}>Hello! I'm Agam, a designer.</div>
          </div>
        ))}
        <div className="sys-fam__row"><div><b>Live switch</b></div><div className="sys-demo"><FontSwitch /></div></div>
      </div>
      <h3 className="sys-h3">Scale in use <small>font-size values declared 3+ times, smallest to largest</small></h3>
      <div className="sys-scale">
        {scale.map(([px, n]) => (
          <div key={px} className="sys-scale__row">
            <code>{px}px · {px / 16}rem</code>
            <span className="sys-scale__s" style={{ fontSize: px }}>The quick brown fox</span>
            <em>{n}×</em>
          </div>
        ))}
      </div>
      <h3 className="sys-h3">Real text from the site</h3>
      <div className="sys-real">
        <p className="t-display">A question or a claim, in .t-display</p>
        <div className="page--article"><div className="article__body"><h2>Section heading (.article__body h2)</h2><p>Body paragraph as the case studies set it. Product design, research and a lot of motion, built end to end.</p></div></div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- spacing */
function Hist({ items, render, unit = "px" }) {
  const max = Math.max(1, ...items.map((i) => i[1]));
  return (
    <div className="sys-hist">
      {items.map(([k, n]) => (
        <div key={k} className="sys-hist__row">
          <code>{k}{unit}</code>
          <span className="sys-hist__bar" style={{ width: `${(n / max) * 100}%` }} />
          {render?.(k)}
          <em>{n}×</em>
        </div>
      ))}
    </div>
  );
}

function Space() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const px = (v) => { const m = v.match(/^([\d.]+)(px|rem)$/); return m ? `${+m[1] * (m[2] === "rem" ? 16 : 1)}` : null; };
    const gap = [...histogram("gap", px)].filter(([, n]) => n >= 4).map(([k, n]) => [+k, n]).sort((a, b) => a[0] - b[0]);
    const rad = [...histogram("border-radius", (v) => (/^[\d.]+px$/.test(v) ? String(parseFloat(v)) : null))].filter(([, n]) => n >= 4).map(([k, n]) => [+k, n]).sort((a, b) => a[0] - b[0]);
    const bp = [...breakpoints()].filter(([, n]) => n >= 3).map(([k, n]) => [k, n]).sort((a, b) => parseInt(a[0].split(": ")[1]) - parseInt(b[0].split(": ")[1]));
    const cs = getComputedStyle(document.body);
    const vars = ["--home-gutter", "--home-inset", "--max", "--case-study-frame-default-padding", "--wp-btn"].map((k) => [k, cs.getPropertyValue(k).trim() || getComputedStyle(document.documentElement).getPropertyValue(k).trim()]);
    setD({ gap, rad, bp, vars });
  }, []);
  if (!d) return null;
  return (
    <>
      <h3 className="sys-h3">Layout variables</h3>
      <div className="sys-tokens">
        {d.vars.map(([k, v]) => <div key={k} className="sys-tokens__row sys-tokens__row--2"><code>{k}</code><span>{v || "unset on this page"}</span></div>)}
        <div className="sys-tokens__row sys-tokens__row--2"><code>--home-inset</code><span>the card-grid inset: max(gutter, 50% − 696px), so the grid is 1392 wide and centred, never under 60px from the edge</span></div>
      </div>
      <h3 className="sys-h3">Breakpoints <small>@media width conditions declared 3+ times</small></h3>
      <p className="sys-note">Phone/tablet layout switch (usePhone.js): <code>{PHONE_QUERY}</code> for captioned cards; 720px is the phone layout used in the CSS.</p>
      <Hist items={d.bp} unit="" />
      <h3 className="sys-h3">Spacing steps <small>gap values declared 4+ times (there is no spacing token scale; this is what is in use)</small></h3>
      <Hist items={d.gap} render={(k) => <i className="sys-step" style={{ width: k, height: 12 }} />} />
      <h3 className="sys-h3">Radii <small>border-radius px values declared 4+ times</small></h3>
      <Hist items={d.rad} render={(k) => <i className="sys-rad" style={{ borderRadius: k }} />} />
    </>
  );
}

/* ---------------------------------------------------------------- glass */
function Glass({ theme, onToggleTheme }) {
  const [vars, setVars] = useState([]);
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setVars(["--glass-film", "--glass-film-hover", "--glass-blur"].map((k) => [k, cs.getPropertyValue(k).trim()]));
  }, [theme]);
  return (
    <>
      <p className="sys-note">One film, one blur, one edge (index.css <code>--glass-*</code>). Backdrop is a stand-in photo so the blur is visible.</p>
      <div className="sys-tokens">{vars.map(([k, v]) => <div key={k} className="sys-tokens__row sys-tokens__row--2"><code>{k}</code><span>{v}</span></div>)}</div>
      <div className="sys-glassbox">
        <div className="sys-glassbox__item">
          <span className="wscene-warm-pill" style={PILL}>Workspace is ready</span>
          <code>.wscene-warm-pill · the room pill</code>
        </div>
        <div className="sys-glassbox__item">
          <span className="wscene-warm-pill" style={PILL}>Setting up workspace…</span>
          <code>.wscene-nudge / .wscene-back-pill share it</code>
        </div>
        <div className="sys-glassbox__item hello" data-page="3" data-stage="reveal" data-stage="reveal">
          <div className="sys-demo"><FontSwitch /></div>
          <code>.theme-toggle.font-ctl · nav bubble</code>
        </div>
        <div className="sys-glassbox__item sys-glassbox__item--menu">
          <div className="sys-viewmenu"><ViewMenu feedback={noop}><span /></ViewMenu></div>
          <code>ViewMenu · the eye bubble (click it)</code>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- components */
function CursorShape({ s }) {
  const st = CX_STATES[s];
  const label = st.label || (s === "view" ? "View" : "");
  const w = st.w ?? (label.length * 7 + 28 + (st.g !== "none" ? 12 : 0));
  const gl = CX_GLYPHS[st.g] || CX_GLYPHS.none;
  const gx = st.w === null && st.g !== "none" ? -w / 2 + 16 : 0;
  const pts = (a) => a.reduce((o, v, i) => (i % 2 ? o : [...o, `${a[i] + gx},${a[i + 1]}`]), []).join(" ");
  return (
    <span className="cx sys-cx" data-s={s} style={{ position: "relative", left: "auto", top: "auto" }}>
      <svg width="110" height="54" viewBox="-55 -27 110 54" overflow="visible">
        <rect className="cx__body" x={-w / 2} y={-st.h / 2} width={w} height={st.h} rx={st.r} />
        <polyline className="cx__g1" fill="none" points={pts(gl[0])} />
        <polyline className="cx__g2" fill="none" points={pts(gl[1])} />
        {label && <text className="sys-cx__t" x={st.g !== "none" ? 8 : 0} y="4.5" textAnchor="middle">{label}</text>}
      </svg>
      <code>{s} · {st.w ?? "fit"}×{st.h}</code>
    </span>
  );
}

function Components({ theme, onToggleTheme }) {
  const [grid, setGrid] = useState(false);
  return (
    <>
      <h3 className="sys-h3">Buttons and links</h3>
      <div className="sys-demo hello" data-page="3" data-stage="reveal">
        <HeroChips placement="hero" onNavigate={noop} theme={theme} onToggleTheme={onToggleTheme} sound={false} onToggleSound={noop} />
        <code>HeroChips · .hello-chip--resume / --linkedin (--chip-bg, --chip-ink)</code>
      </div>
      <h3 className="sys-h3">New tag</h3>
      <div className="sys-demo hello" data-page="3" data-stage="reveal"><span>Scheduled delivery <NewTag /></span><code>NewTag · .new-tag</code></div>
      <h3 className="sys-h3">Lock badge and LockedLink</h3>
      <div className="sys-demo hello" data-page="3" data-stage="reveal">
        <div className="hello-hero__table sys-locked"><LockedLink className="work__item" tip="below"><span>Away agent</span></LockedLink></div>
        <code>LockedLink · hover, focus or click · "{LOCK_COPY}"</code>
      </div>
      <h3 className="sys-h3">Tooltip</h3>
      <div className="sys-demo">
        <span className="tip" data-show style={{ position: "static", display: "inline-block" }}>Click to copy</span>
        <code>.tip · always dark, 7px radius, 260 max</code>
      </div>
      <h3 className="sys-h3">Work cards</h3>
      <div className="sys-demo sys-demo--wide hello" data-page="3" data-stage="reveal">
        {grid ? <Suspense fallback={<p>Loading…</p>}><WorkGrid onNavigate={noop} /></Suspense> : <button type="button" className="sys-btn" onClick={() => setGrid(true)}>Mount the live WorkGrid</button>}
        <code>WorkGrid.jsx · .wg__card (captioned under 1024px)</code>
      </div>
      <h3 className="sys-h3">Side-quest card</h3>
      <div className="sys-demo sys-demo--wide hello" data-page="3" data-stage="reveal"><SideQuests layout="grid" onNavigate={noop} /><code>SideQuests.jsx · .sq__card</code></div>
      <h3 className="sys-h3">Context cursor states</h3>
      <p className="sys-note">The visitor's morphing cursor, drawn statically from the same state table and glyph paths (ui/ContextCursor.jsx).</p>
      <div className="sys-cxgrid">{Object.keys(CX_STATES).map((s) => <CursorShape key={s} s={s} />)}</div>
      <h3 className="sys-h3">Agam cursor and name pill</h3>
      <div className="sys-demo">
        <div className="sc" data-live style={{ position: "relative", left: "auto", top: "auto", opacity: 1, scale: 1, height: 44, width: 90 }}>
          <svg className="sc__arrow" viewBox="0 0 16 16" width="18" height="18"><path d="M2 1.5 L2 14.2 L5.6 10.8 L8.1 15 L10.3 13.9 L7.9 9.8 L12.8 9.8 Z" /></svg>
          <span className="sc__tag">Agam</span>
        </div>
        <code>SiteCursor.jsx · .sc / .sc__arrow / .sc__tag · --sc-cur #1a6fd0</code>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- motion */
function curvePath(c) {
  const m = c.match(/cubic-bezier\(([^)]+)\)/); if (!m) return null;
  const [a, b, d, e] = m[1].split(",").map(Number);
  let p = "M0,40";
  const X = (t) => 3 * a * t * (1 - t) ** 2 + 3 * d * t * t * (1 - t) + t ** 3, Y = (t) => 3 * b * t * (1 - t) ** 2 + 3 * e * t * t * (1 - t) + t ** 3;
  for (let i = 1; i <= 30; i++) p += ` L${(X(i / 30) * 100).toFixed(1)},${(40 - Y(i / 30) * 40 + 0).toFixed(1)}`;
  return p;
}

function EaseDemo({ name, curve, ms = 900 }) {
  const dot = useRef(null);
  const play = () => {
    const el = dot.current; if (!el) return;
    el.animate([{ translate: "0 0" }, { translate: "var(--sys-run) 0" }], { duration: ms, easing: curve, fill: "both" });
  };
  return (
    <div className="sys-ease">
      <code>{name}</code>
      <svg viewBox="-4 -6 108 52" className="sys-ease__c"><path d={curvePath(curve)} fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
      <div className="sys-ease__track"><i ref={dot} /></div>
      <button type="button" className="sys-btn" onClick={play}>Replay</button>
      <em>{curve}</em>
    </div>
  );
}

function SpringDemo({ name, k, c }) {
  const dot = useRef(null), raf = useRef(0);
  const play = () => {
    cancelAnimationFrame(raf.current);
    let x = 0, v = 0, t0 = performance.now(), last = t0;
    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000); last = now;
      v += (-k * (x - 1) - c * v) * dt; x += v * dt;
      if (dot.current) dot.current.style.translate = `calc(var(--sys-run) * ${x}) 0`;
      if (now - t0 < 2500 && (Math.abs(x - 1) > 0.001 || Math.abs(v) > 0.01)) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <div className="sys-ease">
      <code>{name}</code>
      <span className="sys-ease__c" />
      <div className="sys-ease__track"><i ref={dot} /></div>
      <button type="button" className="sys-btn" onClick={play}>Replay</button>
      <em>stiffness {k} · damping {c} · ζ {(c / (2 * Math.sqrt(k))).toFixed(2)}</em>
    </div>
  );
}

function Motion({ theme }) {
  const [t, setT] = useState(null);
  useEffect(() => {
    const { light } = readTokens();
    const curves = Object.entries(light).filter(([k, v]) => /^cubic-bezier/.test(v) || /^var\(--m3.*\)$/.test(v) && /ease|emphasized|accelerate/.test(k));
    const cs = getComputedStyle(document.documentElement);
    const ease = Object.keys(light).filter((k) => /^cubic-bezier/.test(cs.getPropertyValue(k).trim()) || /^cubic-bezier/.test(light[k])).map((k) => [k, (/^cubic-bezier/.test(light[k]) ? light[k] : cs.getPropertyValue(k).trim())]);
    const dur = Object.entries(light).filter(([k, v]) => /^[\d.]+ms$/.test(v) && /dur|hold|stagger/.test(k)).map(([k, v]) => [k, parseFloat(v)]).sort((a, b) => a[1] - b[1]);
    const sp = {};
    for (const [k, v] of Object.entries(light)) { const m = k.match(/^--ds-spring-(.+)-(stiffness|damping)$/); if (m) (sp[m[1]] ||= {})[m[2]] = parseFloat(v); }
    setT({ ease, dur, sp, curves });
  }, []);
  if (!t) return null;
  const snapCss = (a) => `cubic-bezier(${a.map((n) => +n.toFixed(3)).join(", ")})`;
  const cssRun = { "--sys-run": "calc(100% - 14px)" };
  return (
    <div style={cssRun}>
      <h3 className="sys-h3">Easing curves <small>all cubic-bezier custom properties</small></h3>
      {t.ease.map(([k, v]) => <EaseDemo key={k} name={k} curve={v} ms={900} />)}
      <h3 className="sys-h3">Golden-ratio snap <small>AlongPath.jsx SNAP, φ = {PHI.toFixed(3)}</small></h3>
      <EaseDemo name="SNAP.easeIn · card arrives (1/φ², 0, 1/φ³, 1)" curve={snapCss(SNAP.easeIn)} />
      <EaseDemo name="SNAP.easeOut · card leaves" curve={snapCss(SNAP.easeOut)} />
      <EaseDemo name="SNAP.demo.ease · auto-drag" curve={snapCss(SNAP.demo.ease)} ms={SNAP.demo.ms} />
      <SpringDemo name={`SNAP.spring · hop (ζ ${SNAP.spring.zeta}, ω ${SNAP.spring.omega})`} k={SNAP.spring.omega ** 2} c={2 * SNAP.spring.zeta * SNAP.spring.omega} />
      <h3 className="sys-h3">Springs <small>--ds-spring-*</small></h3>
      {Object.entries(t.sp).map(([n, s]) => <SpringDemo key={n} name={`--ds-spring-${n}`} k={s.stiffness} c={s.damping} />)}
      <h3 className="sys-h3">Durations, holds and staggers</h3>
      <DurBars items={t.dur} />
    </div>
  );
}

function DurBars({ items }) {
  const [n, setN] = useState(0);
  const max = Math.max(...items.map((i) => i[1]));
  return (
    <>
      <button type="button" className="sys-btn" onClick={() => setN((x) => x + 1)}>Replay all</button>
      <div className="sys-hist">
        {items.map(([k, ms]) => (
          <div key={k + n} className="sys-hist__row">
            <code>{k}</code>
            <span className="sys-dur" style={{ width: `${(ms / max) * 100}%`, animation: n ? `sys-fill ${ms}ms linear both` : undefined }} />
            <em>{ms}ms</em>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- page */
export default function SystemPage({ theme, onToggleTheme }) {
  const [active, setActive] = useState("colour");
  useEffect(() => {
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: "-10% 0px -80% 0px" });
    SECTIONS.forEach(([id]) => { const n = document.getElementById(id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, []);
  const body = useMemo(() => ({ colour: <Colour />, type: <Type />, space: <Space />, glass: <Glass theme={theme} onToggleTheme={onToggleTheme} />, components: <Components theme={theme} onToggleTheme={onToggleTheme} />, charts: <Charts />, motion: <Motion theme={theme} /> }), [theme, onToggleTheme]);
  return (
    <div className="sys">
      <header className="sys-top">
        <b>System</b>
        <button type="button" className="sys-btn" onClick={onToggleTheme} aria-pressed={theme === "dark"}>{theme === "dark" ? "Dark" : "Light"} · switch</button>
      </header>
      <SectionIndex
        className="sys-index"
        entries={SECTIONS.map(([id, label]) => ({ key: id, label }))}
        active={active}
      />
      <main className="sys-main">
        <h1 className="sys-title">Design system</h1>
        <p className="sys-note">Read live from the stylesheets and components on this site. Change the code and this page changes with it. Private and dev builds only.</p>
        {SECTIONS.map(([id, label]) => <section key={id} id={id} className="sys-sec"><h2>{label}</h2>{body[id]}</section>)}
      </main>
    </div>
  );
}

// the dev palette panel (hello3/PalettePanel.jsx) reuses these sections as they are
export { Colour, Type, Components };
