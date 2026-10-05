import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useReducedMotion, useStepSequence } from "../ds/hooks";
import { Panel, Track, ScoreMeter, Mark, FactRow } from "../ds/SystemExplainer";
import ChooserFigure from "../systemExplainer/ChooserFigure";
import { SE_UNIVERSE_META } from "./chooserData";
import {
  HERO, ASIDES, INTROS, FIGURES, ASSET_MODES, SE_ARCHETYPES, DECK,
  TOKEN_FAMILIES, HOOKS, SE_KIT, SCAFFOLD_FOCAL, PRIMITIVES, TOOLS,
} from "./sheetData";
// the three icon families, gathered under one roof for No.13
import * as HouseIcons from "../ds/Primitives";
import * as ZeptoIcons from "../scheduled/icons";
import * as AwayIcons from "../awayAgent/icons";
import "./systemSheet.css";

/* The Specimen Sheet. A self-documenting field guide to the system this site is
   built from: every entry renders as a live specimen of itself, in the site's own
   tokens, squircle corners, and type. Content lives in sheetData.js (derived from
   the inventory workflow); this file is layout + motion. Entry No. 43 is the page. */

// ---- small utilities --------------------------------------------------------

// lookup a voice section-intro by a fragment of its (verbose) group key
const intro = (frag) => {
  const k = Object.keys(INTROS).find((x) => x.includes(frag));
  return k ? INTROS[k] : "";
};
const aside = (name) => ASIDES[name] || null;

// live page controls (the control bench): visitors operate the system. Specimens
// read this to respect the on-page reduce + register switches, not just the OS.
const SheetCtx = createContext({ reduce: false, register: "expressive" });
const useControls = () => useContext(SheetCtx);

// re-render tick on theme flip or reduced-motion change, so live readouts refresh
function useThemeTick() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const bump = () => setN((x) => x + 1);
    // the theme class is applied by a parent effect that runs after this child's
    // mount, so read once more after the first paint to catch the settled theme.
    const raf = requestAnimationFrame(bump);
    const mo = new MutationObserver(bump);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", bump);
    return () => { cancelAnimationFrame(raf); mo.disconnect(); mq.removeEventListener("change", bump); };
  }, []);
  return n;
}

// entrance: add .is-in once on screen (skips animation under reduced motion)
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

// scrollspy: which entry is active, for the contents rail
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function Cite({ path }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`ss-cite${done ? " is-done" : ""}`}
      onClick={() => {
        try { navigator.clipboard?.writeText(path); setDone(true); setTimeout(() => setDone(false), 1100); } catch (_) {}
      }}
      title="Copy path"
    >
      {done ? "copied" : path}
    </button>
  );
}

function FieldNote({ children }) {
  return <p className="ss-note"><span className="ss-note__mark">¶</span>{children}</p>;
}

// A copiable reference under each element: click to copy a paste-ready handle for a
// new Claude chat (source path + label + what), so the next session knows the exact
// thing you mean. Shows the path; copies the full line.
export function Ref({ label, what, src }) {
  const [done, setDone] = useState(false);
  const shown = (src || "").replace(/^.*?\/Portfolio\//, ""); // repo-relative
  const payload = `[Portfolio /lab] ${shown ? shown + " · " : ""}${label}${what ? ": " + what : ""}`;
  return (
    <button
      type="button"
      className={`ss-ref${done ? " is-done" : ""}`}
      title="Copy reference for a new chat"
      onClick={() => { try { navigator.clipboard?.writeText(payload); } catch (_) {} setDone(true); setTimeout(() => setDone(false), 1300); }}
    >
      <svg className="ss-ref__ic" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <span>{done ? "copied" : (shown || label)}</span>
    </button>
  );
}

function Entry({ id, n, label, count, lead, children }) {
  const [ref, seen] = useInView(0.12);
  return (
    <section id={id} ref={ref} className={`ss-entry${seen ? " is-in" : ""}`}>
      <header className="ss-entry__head">
        <span className="ss-entry__no" data-tok="--fg">No. {n}</span>
        <div className="ss-entry__heading">
          <h2 className="ss-entry__title">{label}</h2>
          {count != null && <span className="ss-count" data-tok="--fg">{count}</span>}
        </div>
        {lead && <p className="ss-entry__lead">{lead}</p>}
      </header>
      {children}
    </section>
  );
}

// ---- live specimens ---------------------------------------------------------

// No.01 token swatch with a live-read computed value
function Swatch({ token, role, tick }) {
  const [val, setVal] = useState("");
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    setVal(v);
  }, [token, tick]);
  return (
    <div className="ss-swatch">
      <span className="ss-swatch__chip" style={{ background: `var(${token})` }} data-tok={token} />
      <span className="ss-swatch__body">
        <code className="ss-swatch__token">{token}</code>
        <span className="ss-swatch__meta"><span className="ss-swatch__role">{role}</span><span className="ss-swatch__val">{val || "…"}</span></span>
      </span>
    </div>
  );
}

const TYPE_SPECIMENS = [
  { s: "30px", w: 600, t: "Display, the masthead voice", sans: true },
  { s: "22px", w: 600, t: "Section title, where you are", sans: true },
  { s: "15px", w: 460, t: "An aside set in Newsreader, the editorial throat-clear", sans: false },
  { s: "13.5px", w: 600, t: "Specimen name, the working label", sans: true },
  { s: "11px", w: 500, t: "ui-monospace citation, file:line", mono: true },
];

// No.03 a faithful mini Page Control that morphs across the three route variants
const PC_STATES = [
  { route: "/", variant: "toggle", note: "home: read and scan, side by side" },
  { route: "/work/:slug", variant: "play", note: "case study: collapses to a single play" },
  { route: "/lab", variant: "none", note: "the lab: it steps out of frame entirely" },
];
function PageControlSpecimen() {
  const cReduce = useControls().reduce;
  const reduce = useReducedMotion() || cReduce;
  const [i, setI] = useState(0);
  const st = PC_STATES[i];
  return (
    <div className="ss-pc">
      <div className="ss-pc__stage">
        <div className={`ss-pcm ss-pcm--${st.variant}`} role="img" aria-label="Page control">
          <span className="ss-pcm__thumb" data-variant={st.variant} />
          <span className="ss-pcm__icons">
            <span className="ss-pcm__btn is-active" aria-hidden>{BookGlyph}</span>
            <span className="ss-pcm__btn" aria-hidden>{GridGlyph}</span>
          </span>
          <span className="ss-pcm__play" aria-hidden>{PlayGlyph}</span>
        </div>
      </div>
      <div className="ss-pc__routes" role="tablist" aria-label="Route">
        {PC_STATES.map((s, k) => (
          <button key={s.route} type="button" role="tab" aria-selected={k === i}
            className={`ss-pc__route${k === i ? " is-on" : ""}`} onClick={() => setI(k)}>
            <code>{s.route}</code>
          </button>
        ))}
      </div>
      <p className="ss-pc__caption">{st.note}{reduce ? " (motion reduced: it snaps, it does not slide)" : ""}</p>
    </div>
  );
}

const BookGlyph = (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
const GridGlyph = (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
const PlayGlyph = (<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>);

// No.07 three live grammar stages, each its own self-contained figure vitrine
function ScaffoldStage() {
  return (
    <div className="ds-root ss-gram ss-gram--scaffold">
      <div className="ss-win">
        <span className="ss-win__dots"><i /><i /><i /></span>
        <span className="ss-win__url">localhost:3000</span>
      </div>
      <div className="ss-gram__body">
        {[68, 92, 80].map((w, i) => <span key={i} className="ss-shim" style={{ width: `${w}%` }} />)}
        <div className="ss-anno">
          <span className="ss-anno__pin">1</span>
          <span className="ss-shim ss-shim--real" style={{ width: "54%" }} />
        </div>
        {[88, 60].map((w, i) => <span key={i} className="ss-shim" style={{ width: `${w}%` }} />)}
      </div>
    </div>
  );
}
function FFFStage() {
  const cReduce = useControls().reduce;
  const reduce = useReducedMotion() || cReduce;
  const [lit, setLit] = useState(2);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setLit((n) => (n + 1) % 3), 1500);
    return () => clearInterval(t);
  }, [reduce]);
  const tones = ["blue", "amber", "green"];
  const labels = ["working", "needs you", "set"];
  return (
    <div className="ds-root ss-gram ss-gram--fff">
      <div className="ss-win"><span className="ss-win__dots"><i /><i /><i /></span><span className="ss-win__url">localhost:3000/report</span></div>
      <div className="ss-gram__body">
        {[0, 1, 2].map((i) => (
          <div key={i} className="ss-fffrow">
            <span className={`ss-shim${i === lit ? ` ss-focal ss-focal--${tones[i]}` : ""}`} style={{ width: `${[82, 64, 74][i]}%` }} data-tok={i === lit ? `--ds-focal-${tones[i]}` : undefined} />
            {i === lit && <span className={`ss-cap ss-cap--${tones[i]}`}><i />{labels[i]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
const SE_STEPS = [
  { label: "Reading the brief", sub: "11 constraints" },
  { label: "Scanning suppliers", sub: "Riya, Akbar, TBO" },
  { label: "Scoring options", sub: "on what you asked" },
];
const SE_SCORES = [
  { label: "Price", value: 0.86 },
  { label: "Total time", value: 0.72 },
  { label: "Stops", value: 0.9 },
];
function SystemExplainerStage() {
  const cReduce = useControls().reduce;
  const osReduce = useReducedMotion();
  const { ref, step: liveStep } = useStepSequence(SE_STEPS.length, { beat: 700, hold: 2600 });
  // the on-page reduce switch freezes the clock to its resolved end-state
  const step = (cReduce || osReduce) ? SE_STEPS.length : liveStep;
  const done = step >= SE_STEPS.length;
  return (
    <div className="ds-root ds-root--away ss-gram ss-gram--se" ref={ref}>
      <div className="ss-se">
        <Panel title="Doing" tone="raw" grow><Track steps={SE_STEPS} step={step} /></Panel>
        <Panel title="Found" tone="built" width={150}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {SE_SCORES.map((s) => <ScoreMeter key={s.label} {...s} shown={done} tone="good" />)}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// No.08 an easing curve drawn from its real cubic-bezier, with a one-shot runner
function EaseCard({ name, c, dur, active }) {
  const [x1, y1, x2, y2] = c;
  const W = 120, H = 120, pad = 14;
  const px = (x) => pad + x * (W - 2 * pad);
  const py = (y) => H - pad - y * (H - 2 * pad);
  const path = `M ${px(0)} ${py(0)} C ${px(x1)} ${py(y1)} ${px(x2)} ${py(y2)} ${px(1)} ${py(1)}`;
  const [ref, seen] = useInView(0.4);
  return (
    <div className={`ss-ease${active ? " is-active" : ""}`} ref={ref}>
      {active && <span className="ss-ease__badge">active register</span>}
      <svg viewBox={`0 0 ${W} ${H}`} className="ss-ease__svg">
        <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(0)} className="ss-ease__grid" />
        <line x1={px(0)} y1={py(1)} x2={px(1)} y2={py(1)} className="ss-ease__grid" />
        <path d={path} className="ss-ease__curve" />
      </svg>
      <div className="ss-ease__run"><span className={`ss-ease__ball${seen ? " is-go" : ""}`} style={{ "--e": `cubic-bezier(${c.join(",")})`, "--d": `${dur}ms` }} /></div>
      <code className="ss-ease__name">{name}</code>
      <code className="ss-ease__val">cubic-bezier({c.join(", ")})</code>
    </div>
  );
}
const EASES = [
  { name: "spatial · expressive", c: [0.38, 1.21, 0.22, 1], dur: 500 },
  { name: "spatial · standard", c: [0.27, 1.06, 0.18, 1], dur: 500 },
  { name: "effects · default", c: [0.34, 0.8, 0.34, 1], dur: 200 },
];

// No.09 a tiny tokenised thumbnail per deck archetype
function DeckThumb({ name, src, what }) {
  return (
    <div className="ss-slide">
      <div className={`ss-slide__art ss-slide--${name}`} aria-hidden>
        {name === "title" && <><span className="ss-sk ss-sk--eyebrow" /><span className="ss-sk ss-sk--h" /></>}
        {name === "statement" && <span className="ss-sk ss-sk--statement" />}
        {name === "splitLabeled" && <><span className="ss-sk ss-sk--half" /><span className="ss-sk ss-sk--half" /></>}
        {name === "numbered" && <><span className="ss-sk ss-sk--row" /><span className="ss-sk ss-sk--row" /><span className="ss-sk ss-sk--row" /></>}
        {name === "phaseDivider" && <span className="ss-sk ss-sk--big" />}
        {name === "phaseIntro" && <><span className="ss-sk ss-sk--big" /><span className="ss-sk ss-sk--row" /></>}
        {name === "figure" && <span className="ss-sk ss-sk--fig" />}
        {name === "methodFinding" && <><span className="ss-sk ss-sk--half" /><span className="ss-sk ss-sk--half ss-sk--accent" /></>}
        {name === "gallery" && <span className="ss-sk ss-sk--grid"><i /><i /><i /><i /></span>}
        {name === "compare" && <><span className="ss-sk ss-sk--half" /><span className="ss-sk ss-sk--half ss-sk--accent" /></>}
        {name === "impact" && <span className="ss-sk ss-sk--metric" />}
        {name === "closing" && <span className="ss-sk ss-sk--statement" />}
      </div>
      <code className="ss-slide__name">{name}</code>
      <Ref label={`deck:${name}`} what={what} src={src} />
    </div>
  );
}

// No.06 registry as a live FILTER/FUNNEL (the §12 filter archetype): facet chips
// narrow the 42 figures, a funnel bar shows the count dropping.
function RegistrySpecimen({ groups: FIG_GROUPS }) {
  const [facet, setFacet] = useState("all");
  const shown = facet === "all" ? FIGURES : FIGURES.filter((f) => f.group === facet);
  const visibleGroups = facet === "all" ? FIG_GROUPS : [facet];
  const pct = Math.round((shown.length / FIGURES.length) * 100);
  return (
    <div className="ss-reg">
      <aside className="ss-reg__index" role="tablist" aria-label="Filter by case study">
        <button type="button" role="tab" aria-selected={facet === "all"} className={`ss-fgrp${facet === "all" ? " is-on" : ""}`} onClick={() => setFacet("all")}>
          <span>All figures</span><span className="ss-count">{FIGURES.length}</span>
        </button>
        {FIG_GROUPS.map((g) => (
          <button key={g} type="button" role="tab" aria-selected={facet === g} className={`ss-fgrp${facet === g ? " is-on" : ""}`} onClick={() => setFacet(g)}>
            <span>{g}</span><span className="ss-count">{FIGURES.filter((f) => f.group === g).length}</span>
          </button>
        ))}
      </aside>
      <div className="ss-reg__list">
        <div className="ss-funnel" aria-hidden>
          <span className="ss-funnel__bar"><span className="ss-funnel__fill" style={{ width: `${pct}%` }} /></span>
          <span className="ss-funnel__label"><b>{FIGURES.length}</b> figures, narrowed to <b>{shown.length}</b></span>
        </div>
        {visibleGroups.map((g) => (
          <div key={g} className="ss-reg__sec">
            <p className="ss-reg__sechead">{g}</p>
            {FIGURES.filter((f) => f.group === g).map((f) => (
              <div key={f.name} className="ss-row">
                <div className="ss-row__top"><code className="ss-row__name">{f.name}</code></div>
                <p className="ss-row__what">{f.what}</p>
                {aside(f.name) && <p className="ss-row__aside">{aside(f.name)}</p>}
                <Ref label={f.name} what={f.what} src={f.ref} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// No.11a the RELATE archetype (§12): a composition graph of what builds what.
const GRAPH_NODES = [
  { id: "uiv", label: "useInViewLoop", x: 72, y: 70, layer: "hook" },
  { id: "usl", label: "useStepSequence", x: 72, y: 140, layer: "hook" },
  { id: "ufs", label: "useFitScale", x: 72, y: 210, layer: "hook" },
  { id: "sek", label: "SE kit", x: 250, y: 100, layer: "kit" },
  { id: "scf", label: "Scaffold + Focal", x: 250, y: 200, layer: "kit" },
  { id: "f12", label: "§12 Explainer", x: 430, y: 70, layer: "fw" },
  { id: "f11", label: "§11 FFF", x: 430, y: 140, layer: "fw" },
  { id: "f10", label: "§10 Scaffold", x: 430, y: 210, layer: "fw" },
  { id: "figs", label: "42 figures", x: 600, y: 140, layer: "out" },
  { id: "page", label: "This page", x: 710, y: 140, layer: "page" },
];
const GRAPH_EDGES = [["uiv", "usl"], ["usl", "sek"], ["sek", "f12"], ["scf", "f11"], ["scf", "f10"], ["ufs", "figs"], ["f12", "figs"], ["f11", "figs"], ["f10", "figs"], ["figs", "page"]];
function RelateGraph() {
  const [ref, seen] = useInView(0.3);
  const byId = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n]));
  const w = (label) => Math.max(56, label.length * 5.6 + 16);
  return (
    <div className="ss-graph" ref={ref}>
      <svg viewBox="0 0 770 270" className={`ss-graph__svg${seen ? " is-in" : ""}`} role="img" aria-label="Composition graph: hooks build kits build frameworks build figures build this page">
        <g className="ss-graph__edges">
          {GRAPH_EDGES.map(([a, b], i) => {
            const A = byId[a], B = byId[b];
            return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} pathLength="1" className="ss-graph__edge" style={{ transitionDelay: `${i * 70}ms` }} />;
          })}
        </g>
        {GRAPH_NODES.map((n, i) => {
          const ww = w(n.label);
          return (
            <g key={n.id} className="ss-graph__node" data-layer={n.layer} style={{ transitionDelay: `${300 + i * 50}ms` }}>
              <rect x={n.x - ww / 2} y={n.y - 15} width={ww} height={30} rx="9" />
              <text x={n.x} y={n.y + 3.5} textAnchor="middle">{n.label}</text>
            </g>
          );
        })}
      </svg>
      <p className="ss-graph__legend"><span className="ss-graph__key" data-layer="hook" />hooks <span className="ss-graph__key" data-layer="kit" />kits <span className="ss-graph__key" data-layer="fw" />frameworks <span className="ss-graph__key" data-layer="out" />output <span className="ss-graph__key" data-layer="page" />this page</p>
    </div>
  );
}

// No.11b the COMPARE archetype (§12): the same component, with the system and without.
function CompareSpecimen() {
  const [run, setRun] = useState(0);
  const Card = ({ kind, label }) => (
    <figure className={`ss-cmp__card ss-cmp__card--${kind}`} key={`${kind}-${run}`}>
      <div className="ss-cmp__win">
        <span className="ss-cmp__chip">Verdict</span>
        <span className="ss-cmp__bar" />
        <span className="ss-cmp__bar ss-cmp__bar--short" />
        <button type="button" className="ss-cmp__btn" tabIndex={-1}>Book this one</button>
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  );
  return (
    <div className="ss-cmp">
      <div className="ss-cmp__pair">
        <Card kind="sys" label="with the system" />
        <Card kind="raw" label="without" />
      </div>
      <button type="button" className="ss-cmp__run" onClick={() => setRun((n) => n + 1)}>Run the same entrance</button>
      <p className="ss-cmp__note">Left: squircle corners, real tokens, the expressive spring. Right: a circular radius, hardcoded hex, a flat linear ease. Same markup, one reads composed, the other reads off the shelf.</p>
    </div>
  );
}

// No.12 SCROLL IS THE CLOCK: the same extract mapping, but the step is driven by
// scroll position instead of a timer. The timer becomes the scrollbar.
const SC_FIELDS = [
  { k: "Passengers", v: "2 adults" },
  { k: "Route", v: "BLR → GOI" },
  { k: "When", v: "this weekend" },
  { k: "Stops", v: "direct only" },
  { k: "Budget", v: "under 8k" },
  { k: "Seat", v: "window" },
];
const SC_N = SC_FIELDS.length;
function ScrollClockStage() {
  const cReduce = useControls().reduce;
  const reduce = useReducedMotion() || cReduce;
  const wrapRef = useRef(null);
  const [step, setStep] = useState(SC_N);
  useEffect(() => {
    if (reduce) { setStep(SC_N); return; }
    const el = wrapRef.current;
    if (!el) return;
    // compute directly on scroll (cheap rect read, passive listener); no rAF so it
    // stays responsive even where rAF is throttled.
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-r.top, 0), Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;
      setStep((prev) => {
        const next = Math.max(0, Math.min(SC_N, Math.round(p * SC_N)));
        return next === prev ? prev : next;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);
  return (
    <div className="ss-sc" ref={wrapRef}>
      <div className="ss-sc__sticky">
        <div className="ds-root ds-root--away ss-gram ss-gram--se ss-sc__stage">
          <div className="ss-se">
            <Panel title="What you said" tone="raw" grow>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.95, color: "#cbcbd4" }}>
                Book for <Mark on={step >= 1}>2 of us</Mark>, <Mark on={step >= 2}>Bangalore to Goa</Mark>, <Mark on={step >= 3}>this weekend</Mark>, <Mark on={step >= 4}>direct only</Mark>, <Mark on={step >= 5}>under 8k</Mark>, and I want a <Mark on={step >= 6}>window seat</Mark>.
              </p>
            </Panel>
            <Panel title="What it heard" tone="built" width={210}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {SC_FIELDS.map((f, i) => <FactRow key={f.k} k={f.k} v={f.v} shown={step >= i + 1} />)}
              </div>
            </Panel>
          </div>
          <div className="ss-sc__progress"><span style={{ width: `${(step / SC_N) * 100}%` }} /></div>
          <p className="ss-sc__hint">{reduce ? "reduced motion: the mapping is shown complete" : `scroll drives the clock · step ${step} of ${SC_N}`}</p>
        </div>
      </div>
    </div>
  );
}

// No.13 the icon sets, gathered. Three families that grew up apart, the house line
// set and the two case-study sets, shown on one bench in the same grid so the
// shared DNA (24px box, 2px stroke, round caps, currentColor) reads at a glance.
const pickIcons = (mod, names) =>
  names.map((n) => ({ n, C: mod[n] })).filter((x) => typeof x.C === "function");

const ICON_SETS = [
  {
    key: "house",
    label: "House line set",
    src: "src/figures/ds/Primitives.jsx",
    note: "The design-system set every Dassh and concept figure composes from.",
    icons: pickIcons(HouseIcons, [
      "IconChevron", "IconCaret", "IconEye", "IconPlus", "IconMagic", "IconArrowR",
      "IconDatabase", "IconExpand", "IconUpload", "IconLink", "IconPhone",
      "IconCheckUser", "IconChat", "IconGlobe", "IconShield", "IconHelp", "IconBell",
    ]),
  },
  {
    key: "zepto",
    label: "Zepto, scheduled delivery",
    src: "src/figures/scheduled/icons.jsx",
    note: "The compact set the scheduled-delivery figures draw on: hubs, slots, shipments.",
    icons: pickIcons(ZeptoIcons, [
      "ICheck", "IBox", "IClock", "IBolt", "ICal", "IAlert", "IStore", "IPin",
      "IUser", "IWarehouse",
    ]),
  },
  {
    key: "away",
    label: "Away, the agent",
    src: "src/figures/awayAgent/icons.jsx",
    note: "The widest set: travel, search, comms, and trust glyphs for the Away agent.",
    icons: pickIcons(AwayIcons, [
      "ICheck", "IPlane", "ISearch", "IMic", "IImage", "ICal", "IClock", "IAlert",
      "IShield", "ISend", "IArrow", "ISpark", "IBell", "IPin", "IDoc", "ICard",
      "ISun", "ITrend", "IRoute", "IWifi", "IX", "ICoin",
    ]),
  },
];
const ICON_TOTAL = ICON_SETS.reduce((s, set) => s + set.icons.length, 0);

// one icon cell: glyph in a squircle tile, export name in mono. Click copies the
// name (matching the page's grab-and-reuse ethos).
function IconCell({ name, C }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`ss-ico${done ? " is-copied" : ""}`}
      title={`Copy ${name}`}
      onClick={() => { try { navigator.clipboard?.writeText(name); } catch (_) {} setDone(true); setTimeout(() => setDone(false), 1100); }}
    >
      <span className="ss-ico__glyph" aria-hidden><C /></span>
      <code className="ss-ico__name">{done ? "copied" : name}</code>
    </button>
  );
}

function IconSetsSpecimen() {
  return (
    <div className="ss-icos">
      {ICON_SETS.map((set) => (
        <section key={set.key} className="ss-icoset">
          <header className="ss-icoset__head">
            <p className="ss-icoset__name">{set.label}<span className="ss-count">{set.icons.length}</span></p>
            <p className="ss-icoset__note">{set.note}</p>
          </header>
          <div className="ss-icogrid">
            {set.icons.map((ic) => <IconCell key={ic.n} name={ic.n} C={ic.C} />)}
          </div>
          <Ref label={`Icon set · ${set.label}`} what={`${set.icons.length} line/solid glyphs`} src={set.src} />
        </section>
      ))}
    </div>
  );
}

// ---- the control bench + X-ray (idea: operate the system) -------------------

// X-ray: hover any element tagged with data-tok to read (and copy) the token that
// paints it. Resolves the var on the hovered element first (so .ds-root-scoped
// tokens work), falling back to :root. A single delegated listener while enabled.
// Read the React component name + JSX source location for any DOM element, via the
// dev fiber (_debugSource / _debugOwner — present in Vite dev). This is what makes
// the inspector universal: it works on EVERY rendered component, not just tagged ones.
function inspectEl(el) {
  // 1) token painting it (if tagged)
  let token = null, tokenVal = "";
  const tokEl = el.closest && el.closest("[data-tok]");
  if (tokEl) {
    token = tokEl.getAttribute("data-tok");
    tokenVal = (getComputedStyle(tokEl).getPropertyValue(token) || getComputedStyle(document.documentElement).getPropertyValue(token)).trim();
  }
  // 2) nearest component + its source file:line
  let comp = null;
  let node = el;
  while (node && !comp) {
    const key = Object.keys(node).find((k) => k.startsWith("__reactFiber$"));
    if (key) {
      let fiber = node[key];
      while (fiber) {
        const src = fiber._debugSource;
        const owner = fiber._debugOwner;
        const name = owner && owner.type && (owner.type.displayName || owner.type.name);
        if (src && name) {
          comp = { name, file: src.fileName.replace(/^.*?\/Portfolio\//, "") + ":" + src.lineNumber };
          break;
        }
        fiber = fiber.return;
      }
    }
    node = node.parentElement;
  }
  return { token, tokenVal, comp };
}
function refPayload(info) {
  const parts = [];
  if (info.comp) parts.push(`<${info.comp.name}> · ${info.comp.file}`);
  if (info.token) parts.push(`${info.token}: ${info.tokenVal}`);
  return parts.length ? `[Portfolio /lab] ${parts.join(" · ")}` : "";
}

function useXray(enabled) {
  const [tip, setTip] = useState(null);
  useEffect(() => {
    if (!enabled) { setTip(null); return; }
    const move = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) { setTip((t) => (t ? null : t)); return; }
      const info = inspectEl(el);
      if (!info.comp && !info.token) { setTip((t) => (t ? null : t)); return; }
      setTip({ x: e.clientX, y: e.clientY, ...info, copied: false });
    };
    const click = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      const payload = refPayload(inspectEl(el));
      if (!payload) return;
      try { navigator.clipboard?.writeText(payload); } catch (_) {}
      setTip((t) => (t ? { ...t, copied: true } : t));
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("click", click, true);
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("click", click, true); };
  }, [enabled]);
  return tip;
}

function ControlBench({ controls, set }) {
  const flip = (k) => set((c) => ({ ...c, [k]: !c[k] }));
  return (
    <div className="ss-cb" role="group" aria-label="Specimen controls">
      <span className="ss-cb__grip" aria-hidden>controls</span>
      <button type="button" className={`ss-cb__btn${controls.xray ? " is-on" : ""}`} aria-pressed={controls.xray} onClick={() => flip("xray")} title="Point at any component to copy its source reference">Inspect</button>
      <button type="button" className={`ss-cb__btn${controls.reduce ? " is-on" : ""}`} aria-pressed={controls.reduce} onClick={() => flip("reduce")}>Reduce motion</button>
      <button type="button" className="ss-cb__btn ss-cb__reg" onClick={() => set((c) => ({ ...c, register: c.register === "expressive" ? "standard" : "expressive" }))}>
        Register: <b>{controls.register}</b>
      </button>
    </div>
  );
}

// ---- page -------------------------------------------------------------------

const NAV = [
  { id: "ss-masthead", n: "00", t: "Masthead" },
  { id: "ss-foundations", n: "01", t: "Foundations" },
  { id: "ss-theme", n: "02", t: "Theme" },
  { id: "ss-control", n: "03", t: "Page control" },
  { id: "ss-modes", n: "04", t: "View modes" },
  { id: "ss-assets", n: "05", t: "Asset modes" },
  { id: "ss-registry", n: "06", t: "The registry" },
  { id: "ss-grammars", n: "07", t: "Grammars" },
  { id: "ss-motion", n: "08", t: "Motion rack" },
  { id: "ss-deck", n: "09", t: "The deck" },
  { id: "ss-backhouse", n: "10", t: "Back of house" },
  { id: "ss-mapped", n: "11", t: "The system, mapped" },
  { id: "ss-scroll", n: "12", t: "Scroll is the clock" },
  { id: "ss-icons", n: "13", t: "Icon sets" },
  { id: "ss-colophon", n: "43", t: "Colophon" },
];
const NAV_IDS = NAV.map((x) => x.id);

const TOKENS_BENCH = [
  { token: "--bg", role: "page ground" },
  { token: "--fg", role: "ink + accent" },
  { token: "--muted", role: "secondary text" },
  { token: "--muted-2", role: "mono, meta" },
  { token: "--line", role: "hairlines" },
  { token: "--hover", role: "soft fill" },
  { token: "--link", role: "the one blue" },
];

const FIG_GROUPS = ["Away, the agent", "Scheduled delivery, Zepto", "Dassh, the concepts", "Wizard and onboarding", "System demos"];

export default function SystemSheet() {
  const tick = useThemeTick(); // bumps on theme flip so live readouts re-read
  const active = useScrollSpy(NAV_IDS);
  const osReduce = useReducedMotion();

  const [controls, setControls] = useState({ xray: false, reduce: false, register: "expressive" });
  const xrayTip = useXray(controls.xray);
  const reduce = osReduce || controls.reduce;

  // live status line, read post-paint (the theme class lands after this mounts)
  const [env, setEnv] = useState({ dark: false, route: "/lab" });
  useEffect(() => {
    setEnv({ dark: document.documentElement.classList.contains("dark"), route: window.location.pathname });
  }, [tick]);
  const isDark = env.dark;
  const route = env.route;

  return (
    <SheetCtx.Provider value={{ reduce: controls.reduce, register: controls.register }}>
    <div className={`syssheet${controls.xray ? " is-xray" : ""}${controls.reduce ? " is-reduced" : ""}`} data-register={controls.register}>
      <ControlBench controls={controls} set={setControls} />
      {xrayTip && (
        <div className="ss-xray-tip" style={{ left: xrayTip.x + 14, top: xrayTip.y + 16 }}>
          {xrayTip.copied ? <span className="ss-xray-tip__ok">copied, paste into a new chat</span> : (
            <>
              {xrayTip.comp && <><code>&lt;{xrayTip.comp.name}&gt;</code><span>{xrayTip.comp.file}</span></>}
              {xrayTip.token && <code className="ss-xray-tip__tok">{xrayTip.token}</code>}
              <span className="ss-xray-tip__hint">click to copy</span>
            </>
          )}
        </div>
      )}
      <div className="syssheet__wrap">

        {/* contents rail (>=1100) */}
        <nav className="syssheet__rail" aria-label="Contents">
          <p className="syssheet__rail-title">Field guide</p>
          <ol>
            {NAV.map((x) => (
              <li key={x.id}>
                <a href={`#${x.id}`} className={active === x.id ? "is-active" : undefined}>
                  <span className="syssheet__rail-no">{x.n}</span>{x.t}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="syssheet__main">

          {/* No.00 masthead */}
          <section id="ss-masthead" className="ss-masthead">
            <p className="ss-eyebrow">{HERO.eyebrow}</p>
            <h1 className="ss-title">{HERO.title}</h1>
            <p className="ss-lede">{HERO.lede}</p>
            <code className="ss-status">
              theme: {isDark ? "dark" : "light"} · route: {route} · reduced-motion: {reduce ? "on" : "off"} · 43 specimens
            </code>
            <p className="ss-howto">
              Three devices recur below. A serif <em>aside</em> in the margin (the site's own editorial voice).
              A squircle field note (<span className="ss-note__mark">¶</span>) carrying the quick line. And the
              hairline specimen list for the dense inventory. Everything here is rendered by the system it documents.
            </p>
            <p className="ss-howto">
              Every catalogued element carries a <em>copiable reference</em> (the quiet monospace line under it):
              click to copy a paste-ready handle for a new chat. For anything else, anywhere on the page, turn on
              <em> Inspect</em> in the control bench and point at any component to copy its <code>&lt;Component&gt; · src/file:line</code>.
            </p>
          </section>

          {/* No.01 foundations */}
          <Entry id="ss-foundations" n="01" label="Foundations bench" count="3 benches"
            lead={intro("Foundations")}>
            <div className="ss-benches">
              <div className="ss-bench">
                <p className="ss-bench__cap">Seven tokens. The whole palette.</p>
                <div className="ss-swatches">
                  {TOKENS_BENCH.map((t) => <Swatch key={t.token} token={t.token} role={t.role} tick={tick} />)}
                </div>
                <p className="ss-bench__foot">Contrast tuned to AA: muted reads 4.95:1, not a vibe. <code>--accent</code> is aliased to <code>--fg</code>, so the page owns no colour of its own.</p>
              </div>
              <div className="ss-bench">
                <p className="ss-bench__cap">One scale, two voices.</p>
                <div className="ss-type">
                  {TYPE_SPECIMENS.map((t, i) => (
                    <p key={i} className={`ss-type__line${t.mono ? " ss-mono" : t.sans ? " ss-sans" : " ss-serif"}`} style={{ fontSize: t.s, fontWeight: t.w }}>{t.t}</p>
                  ))}
                </div>
              </div>
              <div className="ss-bench">
                <p className="ss-bench__cap">corner-shape: squircle, on everything.</p>
                <div className="ss-corners">
                  <span className="ss-corner ss-corner--sq" />
                  <span className="ss-corner ss-corner--ci" />
                </div>
                <p className="ss-bench__foot">Left, the iOS superellipse the whole site uses (about Figma 60%). Right, a plain circular arc, for contrast only. Set once on the universal selector, never per element.</p>
              </div>
            </div>
            {aside("Corner-shape: squircle (iOS superellipse)") && <FieldNote>{aside("Corner-shape: squircle (iOS superellipse)")}</FieldNote>}
            <Ref label="Foundations: tokens, type, squircle" src="src/figures/ds/tokens.css + src/index.css (:root, corner-shape)" />
          </Entry>

          {/* No.02 theme */}
          <Entry id="ss-theme" n="02" label="Theme system" count="light + dark"
            lead={intro("Theme System")}>
            <div className="ss-pressings">
              {[
                { name: "light", bg: "#ffffff", fg: "#111111", link: "#1a6fd0", note: "the default pressing" },
                { name: "dark", bg: "#0e0e11", fg: "#ededed", link: "#6db1ff", note: "lifted, never inverted" },
              ].map((p) => (
                <div key={p.name} className="ss-pressing" style={{ background: p.bg, color: p.fg, borderColor: "rgba(128,128,128,0.25)" }}>
                  <span className="ss-pressing__name">{p.name}</span>
                  <div className="ss-pressing__row">
                    <span className="ss-pressing__sw" style={{ background: p.bg, outline: "1px solid rgba(128,128,128,0.3)" }} /> <code>bg {p.bg}</code>
                  </div>
                  <div className="ss-pressing__row"><span className="ss-pressing__sw" style={{ background: p.fg }} /> <code>fg {p.fg}</code></div>
                  <div className="ss-pressing__row"><span className="ss-pressing__sw" style={{ background: p.link }} /> <code>link {p.link}</code></div>
                </div>
              ))}
            </div>
            <p className="ss-body">Flip the toggle, top right, and the swatch values above re-read live: this entry demonstrates the dark theme instead of describing it. The choice persists to <code>localStorage</code>, set with <code>flushSync</code> before the snapshot so the View Transitions reveal sweeps from the click.</p>
            <div className="ss-chips">
              {aside("Theme Toggle Animation") && <span className="ss-chip">{aside("Theme Toggle Animation")}</span>}
              {aside("Persistent Theme State") && <span className="ss-chip">{aside("Persistent Theme State")}</span>}
              {aside("Accent Color System") && <span className="ss-chip">{aside("Accent Color System")}</span>}
            </div>
            <Ref label="Theme system (light/dark, toggle, persistence)" src="src/index.css (:root.dark) + src/App.jsx (ThemeToggle, toggleTheme)" />
          </Entry>

          {/* No.03 page control */}
          <Entry id="ss-control" n="03" label="Specimen of the day: the Page Control" count="1 component, 3 states"
            lead={intro("Page Control")}>
            <PageControlSpecimen />
            <FieldNote>{aside("Sliding Thumb (Selection Indicator)") || "Mid-switch the thumb goes to glass, then settles."}</FieldNote>
            <Ref label="Page Control (read/scan/present morph)" src="src/App.jsx (PageControl) + src/index.css (.page-control)" />
          </Entry>

          {/* No.04 view modes */}
          <Entry id="ss-modes" n="04" label="Three ways to read the same work" count="3 modes"
            lead={intro("View Modes")}>
            <div className="ss-modes">
              <figure className="ss-mode">
                <div className="ss-mode__art ss-mode__read">{[1, 2, 3].map((i) => <span key={i} className="ss-mode__bar" style={{ width: `${90 - i * 12}%` }} />)}</div>
                <figcaption>Read: the chronological stack.</figcaption>
                <Ref label="Read mode" src="src/App.jsx (mode='read')" />
              </figure>
              <figure className="ss-mode">
                <div className="ss-mode__art ss-mode__scan">{[0, 1, 2, 3].map((i) => <span key={i} className="ss-mode__tile" />)}</div>
                <figcaption>Scan: a masonry grid, hover dims the rest to 0.4.</figcaption>
                <Ref label="Scan mode" src="src/App.jsx (Home, mode='scan')" />
              </figure>
              <figure className="ss-mode">
                <div className="ss-mode__art ss-mode__present"><span className="ss-mode__slide" /></div>
                <figcaption>Present: the case study becomes a deck.</figcaption>
                <Ref label="Present mode" src="src/App.jsx (Presentation) + buildSlides" />
              </figure>
            </div>
            <div className="ss-chips">
              {["Read Mode", "Scan Mode", "Present Mode"].map((k) => aside(k) && <span key={k} className="ss-chip">{aside(k)}</span>)}
            </div>
          </Entry>

          {/* No.05 asset modes */}
          <Entry id="ss-assets" n="05" label="Eight ways to carry a figure" count={`${ASSET_MODES.length} modes`}
            lead={intro("asset modes")}>
            <div className="ss-film">
              {ASSET_MODES.map((m) => (
                <div key={m.name} className="ss-film__cell">
                  <span className="ss-film__name">{m.name}</span>
                  <p className="ss-film__what">{m.what}</p>
                  <span className="ss-kind">{m.kind || "mode"}</span>
                  {aside(m.name) && <p className="ss-film__aside">{aside(m.name)}</p>}
                  <Ref label={m.name} what={m.what} src={m.where} />
                </div>
              ))}
            </div>
            <FieldNote>Spec and Screen are honest about themselves: they are CSS-only placeholders (<code>.article__spec</code>, <code>.article__screen</code>), not resolver branches. A system that documents its own scaffolding.</FieldNote>
          </Entry>

          {/* No.06 registry */}
          <Entry id="ss-registry" n="06" label="The registry" count={`${FIGURES.length} self-players`}
            lead={intro("coded figure library")}>
            <RegistrySpecimen groups={FIG_GROUPS} />
            <FieldNote>The chips are the <b>filter/funnel</b> archetype (§12) pointed at the page itself: pick a case study, watch 42 narrow to its slice. {aside("useInViewLoop (play on scroll into view)")}</FieldNote>
          </Entry>

          {/* No.07 grammars */}
          <Entry id="ss-grammars" n="07" label="Three grammars, lit one beat at a time" count="3 live"
            lead="Every figure is built on one of three motion grammars. Here they are, running, each its own self-contained vitrine.">
            <div className="ss-grams">
              <figure><ScaffoldStage /><figcaption><b>§10 Scaffold.</b> Shimmer the room, keep one act real.<Ref label="§10 Information-sensitive scaffold" src="Claude/animation-base-layer.md §10 + src/figures/scaffold/" /></figcaption></figure>
              <figure><FFFStage /><figcaption><b>§11 Frozen-Frame Focal.</b> One lit element per frame, the rest stay gray.<Ref label="§11 Frozen-Frame Focal" src="Claude/animation-base-layer.md §11 + src/figures/ds/Scaffold.jsx" /></figcaption></figure>
              <figure><SystemExplainerStage /><figcaption><b>§12 System-Explainer.</b> A thought process, on one clock.<Ref label="§12 System-Explainer" src="Claude/animation-base-layer.md §12 + src/figures/ds/SystemExplainer.jsx" /></figcaption></figure>
            </div>
            <div className="ss-chips">
              {aside("FFF core rule: one-coloured-event") && <span className="ss-chip">{aside("FFF core rule: one-coloured-event")}</span>}
              {aside("useStepSequence clock (12a shared grammar #1)") && <span className="ss-chip">{aside("useStepSequence clock (12a shared grammar #1)")}</span>}
            </div>
            <div className="ss-arch">
              <p className="ss-arch__title">The universe + the chooser: pick an archetype for your thought ({SE_UNIVERSE_META.total} archetypes, {SE_UNIVERSE_META.families} families, {SE_UNIVERSE_META.counts.built} built live)</p>
              <ChooserFigure />
              <Ref label="System-Explainer universe + chooser" src="Claude/2026-06-25_system-explainer-universe.md + src/figures/systemExplainer/ChooserFigure.jsx" />
            </div>
          </Entry>

          {/* No.08 motion rack */}
          <Entry id="ss-motion" n="08" label="The motion rack" count="M3 tokens"
            lead={intro("Motion craft")}>
            <div className="ss-eases">
              {EASES.map((e) => <EaseCard key={e.name} {...e} active={e.name.includes(controls.register)} />)}
            </div>
            <p className="ss-body">The register switch in the control bench swaps which spatial curve the page itself moves on. Flip it and the entrance reveals and the Page Control morph change character: expressive overshoots, standard settles.</p>
            <FieldNote>{aside("Spatial tokens (movement/scale)") || "Spatial curves overshoot, effects curves do not, and never the twain shall cross."}</FieldNote>
            <Ref label="M3 motion tokens (the site's only motion system)" src="src/index.css (:root --m3-*) + src/figures/ds/tokens.css" />
          </Entry>

          {/* No.09 deck */}
          <Entry id="ss-deck" n="09" label="The deck" count="12 archetypes"
            lead={intro("deck framework")}>
            <div className="ss-slides">
              {DECK.filter((d) => d.kind === "archetype").map((d) => <DeckThumb key={d.name} name={d.name} src={d.where} what={d.what} />)}
            </div>
            <FieldNote>{aside("buildSlides()") || "Hand-author a deck, or fall back to one slide per section."}</FieldNote>
          </Entry>

          {/* No.10 back of house */}
          <Entry id="ss-backhouse" n="10" label="Back of house" count={`${SE_KIT.length + SCAFFOLD_FOCAL.length + PRIMITIVES.length} components · ${HOOKS.length} hooks · ${TOOLS.length} tools`}
            lead="The composable kit, the harness every figure depends on, and the tools built around the project. Each row copies a reference, so you can grab any component and reuse it.">
            <p className="ss-bh__head">The kit: composable ds/ components</p>
            <div className="ss-bh ss-bh--kit">
              <div className="ss-bh__col">
                <p className="ss-bh__sub">System-Explainer kit</p>
                {SE_KIT.map((c) => (
                  <div key={c.name} className="ss-bh__row"><code className="ss-bh__name">{c.name}</code><span className="ss-bh__what">{c.what}</span><Ref label={`ds kit · ${c.name}`} what={c.what} src={c.where} /></div>
                ))}
              </div>
              <div className="ss-bh__col">
                <p className="ss-bh__sub">Scaffold & focal</p>
                {SCAFFOLD_FOCAL.map((c) => (
                  <div key={c.name} className="ss-bh__row"><code className="ss-bh__name">{c.name}</code><span className="ss-bh__what">{c.what}</span><Ref label={`ds scaffold · ${c.name}`} what={c.what} src={c.where} /></div>
                ))}
              </div>
              <div className="ss-bh__col">
                <p className="ss-bh__sub">Primitives</p>
                {PRIMITIVES.map((c) => (
                  <div key={c.name} className="ss-bh__row"><code className="ss-bh__name">{c.name}</code><span className="ss-bh__what">{c.what}</span><Ref label={`ds primitive · ${c.name}`} what={c.what} src={c.where} /></div>
                ))}
              </div>
              <div className="ss-bh__col">
                <p className="ss-bh__sub">Token families</p>
                {TOKEN_FAMILIES.map((t) => (
                  <div key={t.name} className="ss-bh__row"><code className="ss-bh__name">{t.name}</code><span className="ss-bh__what">{t.what}</span><Ref label={`ds token · ${t.name}`} what={t.what} src={t.where} /></div>
                ))}
              </div>
            </div>
            <div className="ss-bh" style={{ marginTop: "26px" }}>
              <div className="ss-bh__col">
                <p className="ss-bh__head">The harness</p>
                {HOOKS.map((h) => (
                  <div key={h.name} className="ss-bh__row"><code className="ss-bh__name">{h.name}</code><span className="ss-bh__what">{h.what}</span><Ref label={h.name} what={h.what} src={h.where} /></div>
                ))}
              </div>
              <div className="ss-bh__col">
                <p className="ss-bh__head">Build and workflow tools</p>
                {TOOLS.map((t) => (
                  <div key={t.name} className="ss-bh__row"><code className="ss-bh__name">{t.name}</code><span className="ss-bh__what">{t.what}</span>{aside(t.name) && <span className="ss-bh__aside">{aside(t.name)}</span>}<Ref label={t.name} what={t.what} src={t.where} /></div>
                ))}
              </div>
            </div>
            <FieldNote>The annotated <code>Panel</code> lives here: System-Explainer kit, <code>src/figures/ds/SystemExplainer.jsx</code>. Copy its ref and paste it into a new chat to reuse it.</FieldNote>
          </Entry>

          {/* No.11 the system, mapped: relate + compare archetypes, on the page itself */}
          <Entry id="ss-mapped" n="11" label="The system, mapped" count="2 archetypes, live"
            lead="The §12 archetypes we only spec'd, built here and pointed at the page itself: how it composes, and why the composition is worth the trouble.">
            <p className="ss-bench__cap" style={{ marginBottom: 10 }}>Relate: what builds what.</p>
            <RelateGraph />
            <Ref label="§12 Relate/map archetype (composition graph)" src="src/figures/lab/SystemSheet.jsx (RelateGraph)" />
            <p className="ss-bench__cap" style={{ margin: "30px 0 12px" }}>Compare: the same component, with the system and without.</p>
            <CompareSpecimen />
            <Ref label="§12 Compare archetype (with/without the system)" src="src/figures/lab/SystemSheet.jsx (CompareSpecimen)" />
            <FieldNote>That is two more archetypes off the spec sheet and into the library. Relate and compare were rows in a table an hour ago. Now they run.</FieldNote>
          </Entry>

          {/* No.12 scroll is the clock */}
          <Entry id="ss-scroll" n="12" label="Scroll is the clock" count="1 specimen"
            lead="Most figures run on a timer. This one runs on you: the same extract mapping, but your scroll position is the step. Scroll down, the agent untangles the brief one constraint at a time, and you can stop on any beat.">
            <ScrollClockStage />
            <FieldNote>Same idea as the clock, different driver. The timer becomes the scrollbar, so you set the pace.</FieldNote>
            <Ref label="Scroll-as-clock (extract scrubbed by scroll)" src="src/figures/lab/SystemSheet.jsx (ScrollClockStage)" />
          </Entry>

          {/* No.13 the icon sets, gathered under one roof */}
          <Entry id="ss-icons" n="13" label="The icon sets, gathered" count={`3 sets · ${ICON_TOTAL} glyphs`}
            lead="Three icon families that grew up apart: the house line set, and the two case-study sets for Zepto and Away. Here they share one bench and one grid, so the common DNA reads at a glance: a 24px box, a 2px stroke, round caps and joins, painted by currentColor. Click any glyph to copy its export name.">
            <IconSetsSpecimen />
            <FieldNote>One grammar, three dialects. Same box, same stroke, same <code>currentColor</code>, so any glyph drops into any figure and inherits its colour and size. The overlaps (a check, a clock, a pin) are deliberate: shared verbs, drawn once per set to stay self-contained.</FieldNote>
          </Entry>

          {/* colophon */}
          <section id="ss-colophon" className="ss-colophon">
            <p className="ss-colophon__no">No. 43</p>
            <p className="ss-colophon__body">This page is a specimen of itself. It is rendered by the system it documents: the same tokens, the same squircle corners, the same play-on-view, the same clock. Which makes it the forty-third entry in its own field guide.</p>
            <p className="ss-colophon__rule">No tilde, no em dash. En dash for ranges only. The punctuation is part of the brand.</p>
          </section>

        </main>
      </div>
    </div>
    </SheetCtx.Provider>
  );
}
