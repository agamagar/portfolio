import { useEffect, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import { MODES } from "./modeTokens";
import { Ref } from "./SystemSheet";
import AnnotationDemo from "../scaffold/AnnotationDemo";
import ChooserFigure from "../systemExplainer/ChooserFigure";
import AwayReveal from "../consumer/AwayReveal";
import FanOutDemo from "../systemExplainer/FanOutDemo";
import "./modesGuide.css";

/* The lab, grouped by animation MODE. Each mode is self-documenting in one place:
   what it is, its properties (the token contract, live values, click any to copy),
   and a live example. Transparency + focus. Token sets in modeTokens.js. */

// re-read live token values on theme flip
function useThemeTick() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const bump = () => setN((x) => x + 1);
    const raf = requestAnimationFrame(bump);
    const mo = new MutationObserver(bump);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); };
  }, []);
  return n;
}

const isColor = (v) => /^#|^rgb\(|^rgba\(|^hsl/.test(v || "");
const isGradient = (v) => /gradient/.test(v || "");

function CopyRow({ name, value, swatch }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`mg-row${done ? " is-done" : ""}`}
      title={`Copy ${name}`}
      onClick={() => { try { navigator.clipboard?.writeText(name); } catch (_) {} setDone(true); setTimeout(() => setDone(false), 1100); }}
    >
      <span className="mg-row__sw" style={swatch ? { background: swatch } : { opacity: 0 }} aria-hidden />
      <code className="mg-row__name">{name}</code>
      <span className="mg-row__val">{done ? "copied" : value}</span>
    </button>
  );
}

function TokenPanel({ mode, tick }) {
  const [vals, setVals] = useState({});
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = {};
    mode.tokens.forEach((t) => { v[t.name] = (cs.getPropertyValue(t.name) || t.value || "").trim(); });
    setVals(v);
  }, [mode, tick]);
  return (
    <div className="mg-panel">
      {mode.tokens.length > 0 && (
        <div className="mg-rows">
          {mode.tokens.map((t) => {
            const v = vals[t.name] || t.value;
            const sw = isColor(v) || isGradient(v) ? v : null;
            return <CopyRow key={t.name} name={t.name} value={v} swatch={sw} />;
          })}
        </div>
      )}
      {mode.props.length > 0 && (
        <div className="mg-rows mg-rows--props">
          {mode.props.map((p) => <CopyRow key={p.name} name={p.name} value={p.value} swatch={null} />)}
        </div>
      )}
    </div>
  );
}

// ---- compact live examples (the exported figures, or small inline minis) ----

const M3_CURVES = [
  { n: "spatial-expressive", c: [0.42, 1.67, 0.21, 0.9] },
  { n: "spatial-standard", c: [0.27, 1.06, 0.18, 1] },
  { n: "effects-default", c: [0.34, 0.8, 0.34, 1] },
];
function EaseMini() {
  const W = 70, H = 70, p = 8;
  const px = (x) => p + x * (W - 2 * p), py = (y) => H - p - y * (H - 2 * p);
  return (
    <div className="mg-mini mg-mini--ease">
      {M3_CURVES.map((e) => (
        <div key={e.n} className="mg-ease">
          <svg viewBox={`0 0 ${W} ${H}`}><path d={`M ${px(0)} ${py(0)} C ${px(e.c[0])} ${py(e.c[1])} ${px(e.c[2])} ${py(e.c[3])} ${px(1)} ${py(1)}`} /></svg>
          <code>{e.n}</code>
        </div>
      ))}
    </div>
  );
}

const FFF_TONES = ["blue", "amber", "green"];
function FffMini() {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(0);
  useEffect(() => {
    if (reduce) { setLit(2); return; } // reduced motion: park on the "set" beat, no cycling
    const t = setInterval(() => setLit((n) => (n + 1) % 3), 1400);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <div className="mg-mini mg-mini--fff ds-root">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`mg-fff-bar${i === lit ? ` is-lit mg-fff-bar--${FFF_TONES[i]}` : ""}`} style={{ width: `${[82, 60, 72][i]}%` }} />
      ))}
    </div>
  );
}

const DECK_THUMBS = ["title", "statement", "compare", "impact"];
function DeckMini() {
  return (
    <div className="mg-mini mg-mini--deck">
      {DECK_THUMBS.map((t) => (
        <div key={t} className="mg-slide"><span className={`mg-slide__art mg-slide--${t}`} /><code>{t}</code></div>
      ))}
    </div>
  );
}

function SkinCompare() {
  return (
    <div className="mg-skins">
      <div><p className="mg-skins__cap">default</p><FanOutDemo /></div>
      <div className="se-skin--sched"><p className="mg-skins__cap">.se-skin--sched</p><FanOutDemo /></div>
    </div>
  );
}

function ModeExample({ k }) {
  switch (k) {
    case "annotation": return <AnnotationDemo />;
    case "chooser": return <><ChooserFigure /><SkinCompare /></>;
    case "awayreveal": return <AwayReveal />;
    case "eases": return <EaseMini />;
    case "fffstage": return <FffMini />;
    case "deck": return <DeckMini />;
    default: return null;
  }
}

export default function ModesGuide() {
  const tick = useThemeTick();
  return (
    <section className="mg">
      <header className="mg__head">
        <p className="ss-eyebrow">The system, by mode</p>
        <h2 className="mg__title">Animation modes: properties + live, in one place</h2>
        <p className="mg__lede">
          Every animation mode the portfolio runs on, grouped. For each: what it is, its full property contract (the
          live token values, click any to copy), and a live example. Nothing hidden, nothing scattered.
        </p>
      </header>

      <nav className="mg__rail" aria-label="Modes">
        {MODES.map((m, i) => (
          <a key={m.key} href={`#mg-${m.key}`}><span className="mg__rail-no">{String(i + 1).padStart(2, "0")}</span>{m.label}</a>
        ))}
      </nav>

      <div className="mg__modes">
        {MODES.map((m, i) => (
          <section key={m.key} id={`mg-${m.key}`} className="mg__mode">
            <div className="mg__mode-head">
              <span className="mg__no">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mg__mode-title">{m.label}</h3>
              <span className="mg__count">{m.tokens.length ? `${m.tokens.length} tokens` : "no tokens of its own"}</span>
            </div>
            <p className="mg__oneline">{m.oneLine}</p>
            <div className="mg__cols">
              <div className="mg__col">
                <p className="mg__sub">Properties {m.tokens.length > 0 && <span>· click to copy</span>}</p>
                <TokenPanel mode={m} tick={tick} />
              </div>
              {m.example && (
                <div className="mg__col mg__col--live">
                  <p className="mg__sub">Live</p>
                  <ModeExample k={m.example} />
                </div>
              )}
            </div>
            <Ref label={`${m.label} reference`} src={m.docRef} />
          </section>
        ))}
      </div>
    </section>
  );
}
