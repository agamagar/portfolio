import { useState, useRef } from "react";
import D from "./xsReviewData.json";
import "./crosssell.css";

// Figure: the review instrument. Four panels on the adjudication of every
// search_term x seed_l3 x theme row across Head, Head of Tail, Torso and Tail
// (1,021,654 rows), run 4 September 2026. Engine, aggregates and the source
// workbooks live in Active - Zepto/Ads & Strategy/Cross-Sell/theme-review/;
// session note 2026-09-04_cross-sell-theme-review-four-segments.md.
//
// !! These ARE internal Zepto numbers, and they go further than XsNotebook:
// panel 4 is aggregate, but the underlying tables carry named seed categories.
// The entry's hard rule (2026-08-23) bans internal numbers; Agam extended the
// xsNotebook exception to cover this figure on 2026-09-04. Nothing here ships
// publicly until that call is settled. Logged in the entry's todo.
//
// Form, per the dataviz method - each panel is the form the data's structure
// actually calls for, not a decoration:
//   1 UpSet plot. Rows fail COMBINATIONS of rules; a Venn collapses past three
//     sets and a stacked bar hides intersections. UpSet is the correct form.
//   2 Unlock curve. One monotone series, one axis: threshold -> rows shipped.
//   3 Arc diagram. Co-occurrence between eight rules; cleaner than a chord in a
//     wide panel, and redundancy reads as one thick arc.
//   4 Dose-response. Ship rate against families spanned. Monotone, so it argues
//     a mechanism rather than a correlation.
// Tones reuse the pair already validated for XsNotebook (light #118a63/#b8322a,
// dark #1a8f6a/#c9483f) - no new hues introduced, so no re-validation needed.

const fmt = (n) => n.toLocaleString("en-US");
const pct = (n, d = 0) => `${(n * 100).toFixed(d)}%`;

const TABS = [
  { k: "overlap", t: "The overlap", h: "74% of the pile fails exactly one rule" },
  { k: "dial", t: "The dial", h: "One threshold holds 242,997 rows" },
  { k: "redundancy", t: "The redundancy", h: "Two rules measure the same thing" },
  { k: "mechanism", t: "The mechanism", h: "Every extra product world halves the ship rate" },
];

function useTip() {
  const [tip, setTip] = useState(null);
  const box = useRef(null);
  const show = (e, text) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, text });
  };
  return { tip, box, show, hide: () => setTip(null) };
}
const Tip = ({ tip }) =>
  tip ? <div className="xn__tip" style={{ left: tip.x, top: tip.y }} role="status">{tip.text}</div> : null;

function Table({ head, rows, label }) {
  return (
    <details className="xv__table">
      <summary>Table view</summary>
      <table>
        <caption className="xv__sr">{label}</caption>
        <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr>
        ))}</tbody>
      </table>
    </details>
  );
}

/* ── 1. UpSet ───────────────────────────────────────────────────────────── */
function Overlap({ tipApi }) {
  const sets = D.upset.slice(0, 9);
  const rules = D.rules.slice(0, 5);
  const max = sets[0][1];
  const shown = sets.filter((s) => s[0].every((r) => rules.includes(r)));
  // every single-rule row, not just the combinations plotted below
  const single = Object.values(D.single).reduce((a, n) => a + n, 0);
  return (
    <div className="xv__panel" ref={tipApi.box}>
      <p className="xv__claim">
        <b>{fmt(single)}</b> of the {fmt(D.tot.Debatable)} rows in review fail one rule and nothing else.
        Those are one decision from shipping. The columns below are the nine commonest combinations.
      </p>
      <div className="xv__upset" role="img"
        aria-label={`Rule combinations. ${shown.map((s) => `${s[0].join(" plus ")}: ${fmt(s[1])} rows`).join(". ")}`}>
        <div className="xv__ubars">
          {shown.map(([set, n]) => (
            <div className="xv__ucol" key={set.join("|")}
              onMouseMove={(e) => tipApi.show(e, `${set.join(" + ")} — ${fmt(n)} rows (${pct(n / D.tot.Debatable, 1)} of review)`)}
              onMouseLeave={tipApi.hide}>
              <span className="xv__uval">{n >= 20000 ? fmt(n) : ""}</span>
              <i className="xv__ubar" data-tone={set.length === 1 ? "pos" : "g2"}
                 style={{ height: `${Math.max((n / max) * 100, 1.5)}%` }} />
            </div>
          ))}
        </div>
        <div className="xv__umatrix">
          {rules.map((r) => (
            <div className="xv__urow" key={r}>
              <span className="xv__ulabel">{r}</span>
              <div className="xv__udots">
                {shown.map(([set]) => (
                  <span key={set.join("|")} className="xv__udot" data-on={set.includes(r) ? "1" : "0"} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="xv__foot">
        Each column is an exact combination of rules, not a rule total. Filled dots say which rules fired.
        Single-dot columns are the unlockable pile.
      </p>
      <Table label="Rule combinations by row count"
        head={["Combination", "Rows", "Share of review"]}
        rows={shown.map(([s, n]) => [s.join(" + "), fmt(n), pct(n / D.tot.Debatable, 1)])} />
    </div>
  );
}

/* ── 2. Unlock curve ────────────────────────────────────────────────────── */
function Dial({ tipApi }) {
  const { approved, only_low } = D.share;
  const BASE = D.tot.Approved;
  const at = (t) => {
    let u = 0, a = 0;
    for (let i = t; i <= 100; i++) u += only_low[i];
    for (let i = 0; i < t; i++) a += approved[i];
    return { u, a, raw: u - a };
  };
  const A34 = at(34);
  const pts = Array.from({ length: 101 }, (_, t) => {
    const r = at(t);
    return { t, ship: BASE + (r.raw - A34.raw) };
  });
  const lo = Math.min(...pts.map((p) => p.ship)), hi = Math.max(...pts.map((p) => p.ship));
  const W = 100, H = 60;
  const X = (t) => (t / 100) * W;
  const Y = (v) => H - ((v - lo) / (hi - lo || 1)) * H;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p.t).toFixed(2)},${Y(p.ship).toFixed(2)}`).join("");
  const here = pts[34];
  return (
    <div className="xv__panel" ref={tipApi.box}>
      <p className="xv__claim">
        Move the intent-share cut-off and <b>{fmt(D.single["low intent share"])}</b> rows move with it.
        Every other rule stays where it is.
      </p>
      <svg className="xv__svg" viewBox={`-2 -6 ${W + 12} ${H + 16}`} role="img"
        aria-label={`Rows that would ship against the intent-share threshold. At today's 34 percent, ${fmt(here.ship)} rows ship. At 20 percent, ${fmt(pts[20].ship)}. At 50 percent, ${fmt(pts[50].ship)}.`}>
        <path className="xv__area" d={`${d}L${X(100)},${H}L${X(0)},${H}Z`} />
        <path className="xv__line" d={d} />
        <line className="xv__rule" x1={X(34)} y1="-4" x2={X(34)} y2={H} />
        <circle className="xv__dot" cx={X(34)} cy={Y(here.ship)} r="1.4" />
        <text className="xv__note" x={X(34) + 2} y="-1">today · 34%</text>
        {[0, 25, 50, 75, 100].map((t) => (
          <text key={t} className="xv__tick" x={X(t)} y={H + 6} textAnchor={t === 0 ? "start" : t === 100 ? "end" : "middle"}>{t}%</text>
        ))}
        {pts.filter((p) => p.t % 2 === 0).map((p) => (
          <rect key={p.t} x={X(p.t) - 1} y="-6" width="2" height={H + 6} fill="transparent"
            onMouseMove={(e) => tipApi.show(e, `Threshold ${p.t}% — ${fmt(p.ship)} rows ship (${p.ship > here.ship ? "+" : ""}${fmt(p.ship - here.ship)})`)}
            onMouseLeave={tipApi.hide} />
        ))}
      </svg>
      <p className="xv__foot">
        Modelled, not rerun: it moves only rows whose verdict turns on this one rule. Lowering the bar
        ships rows whose supporting evidence really is thinner, so the curve is a risk dial, not a free win.
      </p>
      <Table label="Rows shipped at selected thresholds" head={["Threshold", "Rows shipped", "vs today"]}
        rows={[10, 20, 34, 50, 75].map((t) => [`${t}%`, fmt(pts[t].ship), `${pts[t].ship > here.ship ? "+" : ""}${fmt(pts[t].ship - here.ship)}`])} />
    </div>
  );
}

/* ── 3. Arc diagram ─────────────────────────────────────────────────────── */
function Redundancy({ tipApi }) {
  const rules = D.rules.slice(0, 6);
  const arcs = D.cooc.filter(([a, b]) => rules.includes(a) && rules.includes(b)).slice(0, 10);
  const max = Math.max(...arcs.map((a) => a[2]));
  const W = 100, H = 34;
  const X = (r) => 6 + (rules.indexOf(r) / (rules.length - 1)) * (W - 12);
  const pair = arcs.find(([a, b]) =>
    (a === "intruder tab" && b === "spans 4+ domains") || (a === "spans 4+ domains" && b === "intruder tab"));
  return (
    <div className="xv__panel" ref={tipApi.box}>
      <p className="xv__claim">
        <b>intruder tab</b> and <b>spans 4+ domains</b> fire together {pair ? fmt(pair[2]) : "16,857"} times
        while asking the same question: do these products belong in one basket?
      </p>
      <svg className="xv__svg xv__svg--arc" viewBox={`0 0 ${W} ${H + 16}`} role="img"
        aria-label={`Rules that fire together. ${arcs.map(([a, b, n]) => `${a} with ${b}, ${fmt(n)} rows`).join(". ")}`}>
        {arcs.map(([a, b, n]) => {
          const x1 = X(a), x2 = X(b), r = Math.abs(x2 - x1) / 2, cx = (x1 + x2) / 2;
          const hot = pair && ((a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]));
          return (
            <path key={a + b} className={`xv__arc${hot ? " xv__arc--hot" : ""}`}
              d={`M${x1},${H} A${r},${Math.min(r * 1.15, H - 2)} 0 0 1 ${x2},${H}`}
              strokeWidth={Math.max((n / max) * 3.4, 0.35)}
              onMouseMove={(e) => tipApi.show(e, `${a} + ${b} — ${fmt(n)} rows`)}
              onMouseLeave={tipApi.hide} />
          );
        })}
        {rules.map((r) => (
          <g key={r}>
            <circle className="xv__node" cx={X(r)} cy={H} r="1.1" />
            <text className="xv__nodelabel" x={X(r)} y={H + 6} textAnchor="middle">{r}</text>
            <text className="xv__nodeval" x={X(r)} y={H + 11} textAnchor="middle">{fmt(D.rule_totals[r])}</text>
          </g>
        ))}
      </svg>
      <p className="xv__foot">
        Arc weight is rows where both fired; the figure under each rule is its own total. Intent share
        touches everything because it is the commonest rule, which is not the same as being redundant.
      </p>
      <Table label="Rules firing together" head={["Rule A", "Rule B", "Rows"]}
        rows={arcs.map(([a, b, n]) => [a, b, fmt(n)])} />
    </div>
  );
}

/* ── 4. Dose-response ───────────────────────────────────────────────────── */
function Mechanism({ tipApi }) {
  // Counter omits keys it never saw: no 4-world theme was ever approved, so
  // "Approved" is simply absent there rather than zero. Default it.
  const rows = [1, 2, 3, 4].map((k) => {
    const f = D.fams[String(k)] || {};
    return { k, n: f.n || 0, ok: f.Approved || 0, no: f.Rejected || 0 };
  });
  const un = D.fams["0"];
  const max = Math.max(...rows.map((r) => r.n));
  return (
    <div className="xv__panel" ref={tipApi.box}>
      <p className="xv__claim">
        A theme reaching into one product world ships {pct(rows[0].ok / rows[0].n)} of the time.
        Reaching into four, <b>nothing ships at all</b>.
      </p>
      <div className="xv__dose" role="img"
        aria-label={rows.map((r) => `${r.k} ${r.k === 1 ? "family" : "families"}: ${pct(r.ok / r.n, 1)} ship rate on ${fmt(r.n)} rows`).join(". ")}>
        {rows.map((r) => {
          const rate = r.n ? r.ok / r.n : 0;
          return (
            <div className="xv__dosecol" key={r.k}
              onMouseMove={(e) => tipApi.show(e, `${r.k} ${r.k === 1 ? "world" : "worlds"} — ${pct(rate, 1)} ship on ${fmt(r.n)} rows`)}
              onMouseLeave={tipApi.hide}>
              <div className="xv__dosetrack">
                <i className="xv__dosefill" data-tone={rate < 0.15 ? "neg" : "pos"}
                   style={{ height: `${Math.max(rate * 100, 0.8)}%` }} />
              </div>
              <span className="xv__doseval">{pct(rate, rate < 0.02 ? 1 : 0)}</span>
              <span className="xv__doselab">{r.k} {r.k === 1 ? "world" : "worlds"}</span>
              <span className="xv__dosen" style={{ opacity: 0.35 + 0.65 * (r.n / max) }}>{fmt(r.n)} rows</span>
            </div>
          );
        })}
      </div>
      <p className="xv__foot">
        Worlds are food, personal care, home and general goods. The fall is monotone across
        {" "}{fmt(rows.reduce((a, r) => a + r.n, 0))} rows, which is what makes it a mechanism rather than
        a correlation: coherence predicts quality. Held out separately, {fmt(un.n)} rows whose products the
        lexicon cannot read at all — a blind spot, not a finding.
      </p>
      <Table label="Ship rate by product worlds spanned"
        head={["Worlds spanned", "Rows", "Ship rate", "Pull rate"]}
        rows={rows.map((r) => [String(r.k), fmt(r.n), pct(r.n ? r.ok / r.n : 0, 1), pct(r.n ? r.no / r.n : 0, 2)])} />
    </div>
  );
}

const PANELS = { overlap: Overlap, dial: Dial, redundancy: Redundancy, mechanism: Mechanism };

export default function XsReview() {
  const [tab, setTab] = useState("overlap");
  const tipApi = useTip();
  const Panel = PANELS[tab];
  return (
    <figure className="xn xv">
      <div className="xn__tabs" role="tablist" aria-label="The review instrument">
        {TABS.map((t) => (
          <button key={t.k} role="tab" aria-selected={tab === t.k} className="xn__tab"
            onClick={() => { setTab(t.k); tipApi.hide(); }}>{t.t}</button>
        ))}
      </div>
      <p className="xv__head">{TABS.find((t) => t.k === tab).h}</p>
      <Panel tipApi={tipApi} />
      <Tip tip={tipApi.tip} />
    </figure>
  );
}
