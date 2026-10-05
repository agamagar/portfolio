import { useState, useRef } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure: the first pull. Five panels from one Databricks notebook ("pv_id and
// cross sell info", cells run 31 Aug to 3 Sep 2026), each a real count from
// the table named on the panel. Decoded and analysed in
// Claude/2026-09-03_cross-sell-notebook-analysis.md; the five facts in Fadell
// register in Claude/2026-09-03_cross-sell-notebook-five-facts.md.
//
// !! These ARE internal Zepto numbers. The entry's hard rule (2026-08-23) bans
// them; this figure was added at Agam's request on 2026-09-03 and the conflict
// is logged in the entry's todo. Nothing here ships publicly until that call
// is made.
//
// Form, per the dataviz method: every panel is one job. 1 = emphasis (one hue
// against greys), 2 = emphasis, 3 = single series, 4 = diverging, 5 =
// sequential. Bars 12px thick, 4px rounded data-end, square at the baseline,
// 2px surface gap between touching segments, values labelled at the tip only
// where the story needs them, the rest on hover and in the table view.
// Colours validated with scripts/validate_palette.js: light #118a63/#b8322a,
// dark #1a8f6a/#c9483f (CVD dE 7.5 / 7.0, legal with the direct labels).

// Western grouping (595,405,865), matching the prose, not lakh grouping.
const fmt = (n) => n.toLocaleString("en-US");
const pct = (n, d = 0) => `${(n * 100).toFixed(d)}%`;

// Panel 1: distinct terms vs searches, four buckets. Head is the emphasis.
const P1 = {
  cols: ["Head", "Torso", "Head of tail", "Tail"],
  terms: [4496, 17547, 308679, 30818274],
  searches: [392963642, 83360528, 59541100, 59540595],
};
P1.termsTotal = P1.terms.reduce((a, b) => a + b, 0);
P1.searchTotal = P1.searches.reduce((a, b) => a + b, 0);

// Panel 2: search terms behind a Cheese Slice add-to-cart, 30 Aug 2026.
const P2 = [
  ["cheese", 18990, "cheese"],
  ["cheese slice", 11184, "cheese"],
  ["amul cheese", 608, "cheese"],
  ["amul cheese slices", 593, "cheese"],
  ["cheese slices", 260, "cheese"],
  ["bread", 238, "complement"],
  ["butter", 110, "complement"],
  ["burger bun", 82, "complement"],
  ["eggs", 68, "complement"],
  ["milk", 63, "complement"],
  ["pasta", 57, "complement"],
];
const P2_TOTAL = 36393;
const P2_TERMS = 1201;

// Panel 3: terms the themes table labelled torso / tail / head-of-tail that
// the central categorisation calls Head. Top ten by 30-day searches.
const P3 = [
  ["rakhi gift", "head-of-tail", 199068],
  ["kids rakhi", "torso", 166375],
  ["1947", "tail", 150146],
  ["silver rakhi", "torso", 117345],
  ["newspaper", "torso", 101262],
  ["the hindu", "head-of-tail", 89782],
  ["rakhi for bhaiya", "head-of-tail", 71696],
  ["rakhi for bhabhi", "head-of-tail", 64334],
  ["indian flag", "torso", 64049],
  ["evil eye rakhi", "head-of-tail", 63786],
];
const P3_TERMS = 706;
const P3_SEARCHES = 14064845;

// Panel 4: the themes table, row counts per segment, 1 Sep vs 3 Sep 2026.
const P4 = [
  ["Head of tail", 726360, 851593],
  ["Torso", 64748, 78166],
  ["Head", 16113, 18659],
  ["Tail", 187118, 143390],
  ["No segment", 98570, 893],
];

// Panel 5: seed-category share of add-to-cart intents, torso terms with 6,000
// or more searches, 3,100 rows.
const P5 = [
  ["under 0.1", 713],
  ["0.1 to 0.3", 805],
  ["0.3 to 0.6", 458],
  ["0.6 and over", 1122],
];
const P5_TOTAL = 3100;
const P5_EX = [
  ["10 rupees", "Cardiac", "12.6%", "Health Monitoring Essentials", "weak"],
  ["waist chain", "Chain", "", "Jewellery Care Essentials", "weak"],
  ["bingo nachos", "Nachos", "", "Movie Night Snacks", "fine"],
];

const TABS = [
  { k: "peak", t: "The peak", h: "4,496 terms carry 66% of all searches" },
  { k: "cheese", t: "Cheese", h: "Two search terms are 83% of Cheese Slice adds" },
  { k: "drift", t: "The drift", h: "706 labels went stale when the festivals landed" },
  { k: "rebuild", t: "The rebuild", h: "The table changed under the notebook" },
  { k: "seed", t: "The seed", h: "23% of the themes stand on a guess under 10%" },
];

function useTip() {
  const [tip, setTip] = useState(null);
  const box = useRef(null);
  const show = (e, text) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, text });
  };
  const hide = () => setTip(null);
  return { tip, box, show, hide };
}

function Tip({ tip }) {
  if (!tip) return null;
  return (
    <div className="xn__tip" style={{ left: tip.x, top: tip.y }} role="status">
      {tip.text}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div className="xn__legend" aria-label="Legend">
      {items.map(([label, tone]) => (
        <span key={label} className="xn__key"><i data-tone={tone} />{label}</span>
      ))}
    </div>
  );
}

// — Panel 1 —
function Peak({ tipApi }) {
  const tones = ["pos", "g1", "g2", "g3"];
  const row = (label, vals, total, note) => (
    <div className="xn__stackrow">
      <div className="xn__rowlabel">{label}</div>
      <div className="xn__stack" role="img" aria-label={`${label}: ${P1.cols.map((c, i) => `${c} ${pct(vals[i] / total, 2)}`).join(", ")}`}>
        {vals.map((v, i) => {
          const share = v / total;
          const w = Math.max(share * 100, 0.4);
          return (
            <div
              key={P1.cols[i]}
              className="xn__seg"
              data-tone={tones[i]}
              style={{ width: `${w}%` }}
              onMouseMove={(e) => tipApi.show(e, `${P1.cols[i]}: ${fmt(v)} (${pct(share, share < 0.01 ? 2 : 0)})`)}
              onMouseLeave={tipApi.hide}
            >
              {share > 0.08 && <span>{pct(share)}</span>}
            </div>
          );
        })}
      </div>
      {note && <div className="xn__note">{note}</div>}
    </div>
  );
  return (
    <div className="xn__panel">
      {row("Distinct terms", P1.terms, P1.termsTotal, `Head is the sliver on the left: ${fmt(P1.terms[0])} terms, ${pct(P1.terms[0] / P1.termsTotal, 2)} of ${fmt(P1.termsTotal)}.`)}
      {row("Searches, last 30 days", P1.searches, P1.searchTotal, `The same ${fmt(P1.terms[0])} terms: ${fmt(P1.searches[0])} of ${fmt(P1.searchTotal)} searches.`)}
      <Legend items={[["Head", "pos"], ["Torso", "g1"], ["Head of tail", "g2"], ["Tail", "g3"]]} />
      <p className="xn__lesson">Four fifths of everything anyone types is under 22,000 phrases. The themes don't need to cover the long tail. They need to be right for 22,000 terms.</p>
    </div>
  );
}

// — Panel 2 —
function Cheese({ tipApi }) {
  const max = P2[0][1];
  return (
    <div className="xn__panel">
      <div className="xn__bars">
        {P2.map(([term, n, kind]) => (
          <div className="xn__bar" key={term}>
            <div className="xn__rowlabel">{term}</div>
            <div className="xn__track">
              <div
                className="xn__fill"
                data-tone={kind === "complement" ? "pos" : "g2"}
                style={{ width: `${(n / max) * 100}%` }}
                onMouseMove={(e) => tipApi.show(e, `${term}: ${fmt(n)} intents, ${pct(n / P2_TOTAL, 1)}`)}
                onMouseLeave={tipApi.hide}
              />
              {(n === 18990 || n === 11184 || kind === "complement") && <span className="xn__val">{fmt(n)}</span>}
            </div>
          </div>
        ))}
      </div>
      <Legend items={[["Cheese terms", "g2"], ["Complements, the cross-sell signal", "pos"]]} />
      <p className="xn__lesson">On 30 August, {fmt(P2_TERMS)} different searches led to a Cheese Slice add-to-cart, {fmt(P2_TOTAL)} intents in all. The complement signal is real. It's a few hundred a day, not tens of thousands. Design the surface for that number.</p>
    </div>
  );
}

// — Panel 3 —
function Drift({ tipApi }) {
  const max = P3[0][2];
  return (
    <div className="xn__panel">
      <div className="xn__bars">
        {P3.map(([term, sw, n]) => (
          <div className="xn__bar xn__bar--tagged" key={term}>
            <div className="xn__rowlabel">{term}</div>
            <div className="xn__tags">
              <span className="xn__tag" data-k="stale">{sw}</span>
              <span className="xn__arrow" aria-hidden="true">→</span>
              <span className="xn__tag" data-k="live">Head</span>
            </div>
            <div className="xn__track">
              <div
                className="xn__fill"
                data-tone="pos"
                style={{ width: `${(n / max) * 100}%` }}
                onMouseMove={(e) => tipApi.show(e, `${term}: ${fmt(n)} searches in 30 days`)}
                onMouseLeave={tipApi.hide}
              />
              {n === max && <span className="xn__val">{fmt(n)}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="xn__note">Left tag: what the themes table stored. Right tag: what the central categorisation says now. Top ten of {fmt(P3_TERMS)} such terms, {fmt(P3_SEARCHES)} searches between them.</div>
      <p className="xn__lesson">Rakhi, the flag, 1947. Festival queries went Head in August, after the label was written. A stored segment is a snapshot. Read it live, or accept it's stale the moment a festival lands.</p>
    </div>
  );
}

// — Panel 4 —
function Rebuild({ tipApi }) {
  const rows = P4.map(([k, a, b]) => [k, a, b, (b - a) / a]);
  const max = Math.max(...rows.map((r) => Math.abs(r[3])));
  return (
    <div className="xn__panel">
      <div className="xn__div">
        {rows.map(([k, a, b, d]) => {
          const w = (Math.abs(d) / max) * 100;
          const grew = d >= 0;
          return (
            <div className="xn__divrow" key={k}>
              <div className="xn__rowlabel">{k}</div>
              <div className="xn__divtrack">
                <div className="xn__half xn__half--neg">
                  {!grew && (
                    <div className="xn__fill xn__fill--neg" data-tone="neg" style={{ width: `${w}%` }}
                      onMouseMove={(e) => tipApi.show(e, `${k}: ${fmt(a)} on 1 Sep, ${fmt(b)} on 3 Sep`)} onMouseLeave={tipApi.hide} />
                  )}
                </div>
                <div className="xn__zero" aria-hidden="true" />
                <div className="xn__half">
                  {grew && (
                    <div className="xn__fill" data-tone="pos" style={{ width: `${w}%` }}
                      onMouseMove={(e) => tipApi.show(e, `${k}: ${fmt(a)} on 1 Sep, ${fmt(b)} on 3 Sep`)} onMouseLeave={tipApi.hide} />
                  )}
                </div>
              </div>
              <div className="xn__delta">{grew ? "+" : "−"}{Math.abs(d * 100).toFixed(0)}% <em>{fmt(a)} → {fmt(b)}</em></div>
            </div>
          );
        })}
      </div>
      <Legend items={[["Grew, 1 Sep to 3 Sep", "pos"], ["Shrank", "neg"]]} />
      <p className="xn__lesson">Same table, same row count within 200, two days apart. The casing changed, the empty labels vanished, and every bucket moved. Nothing in the notebook says so. Date every count you write down.</p>
    </div>
  );
}

// — Panel 5 —
function Seed({ tipApi }) {
  const max = Math.max(...P5.map((r) => r[1]));
  const steps = ["s1", "s2", "s3", "s4"];
  return (
    <div className="xn__panel">
      <div className="xn__cols" role="img" aria-label={`Rows by seed share: ${P5.map(([k, n]) => `${k} ${fmt(n)}`).join(", ")}`}>
        {P5.map(([k, n], i) => (
          <div className="xn__col" key={k}>
            <div className="xn__colval">{i === 0 ? `${fmt(n)} rows, ${pct(n / P5_TOTAL)}` : ""}</div>
            <div className="xn__colslot">
              <div
                className="xn__colfill"
                data-tone={steps[i]}
                style={{ height: `${(n / max) * 100}%` }}
                onMouseMove={(e) => tipApi.show(e, `Seed share ${k}: ${fmt(n)} rows, ${pct(n / P5_TOTAL)}`)}
                onMouseLeave={tipApi.hide}
              />
            </div>
            <div className="xn__collabel">{k}</div>
          </div>
        ))}
      </div>
      <div className="xn__note">Seed category's share of the term's add-to-cart intents, {fmt(P5_TOTAL)} theme rows, torso terms with 6,000 or more searches.</div>
      <ul className="xn__ex">
        {P5_EX.map(([q, seed, share, theme, k]) => (
          <li key={q} data-k={k}>
            <b>{q}</b> seeds to {seed}{share && ` at ${share}`}, and gets <b>{theme}</b>
          </li>
        ))}
      </ul>
      <p className="xn__lesson">Where the share is high, the themes read fine. Where it's low, they fall apart, and you can see it coming from one column. The fix isn't a better prompt. It's a threshold.</p>
    </div>
  );
}

function TableView({ tab }) {
  const T = ({ head, rows }) => (
    <table className="xn__table">
      <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
  if (tab === "peak") return <T head={["Bucket", "Distinct terms", "Share of terms", "Searches, 30 days", "Share of searches"]} rows={P1.cols.map((c, i) => [c, fmt(P1.terms[i]), pct(P1.terms[i] / P1.termsTotal, 2), fmt(P1.searches[i]), pct(P1.searches[i] / P1.searchTotal)])} />;
  if (tab === "cheese") return <T head={["Search term", "Distinct intents", "Share", "Kind"]} rows={P2.map(([t, n, k]) => [t, fmt(n), pct(n / P2_TOTAL, 1), k])} />;
  if (tab === "drift") return <T head={["Term", "Themes table", "Central table", "Searches, 30 days"]} rows={P3.map(([t, s, n]) => [t, s, "Head", fmt(n)])} />;
  if (tab === "rebuild") return <T head={["Segment", "Rows, 1 Sep", "Rows, 3 Sep", "Change"]} rows={P4.map(([k, a, b]) => [k, fmt(a), fmt(b), `${b >= a ? "+" : "−"}${Math.abs(((b - a) / a) * 100).toFixed(1)}%`])} />;
  return <T head={["Seed share", "Rows", "Share of rows"]} rows={P5.map(([k, n]) => [k, fmt(n), pct(n / P5_TOTAL)])} />;
}

function Notebook({ tab, setTab, table, setTable, full, onFull }) {
  const tipApi = useTip();
  const cur = TABS.find((t) => t.k === tab);
  return (
    <div className="fc xn">
      <div className="fc__bar">
        <span className="fc__bar-t">Five things one notebook said</span>
        <button type="button" className="fc__btn" aria-pressed={table} onClick={() => setTable(!table)}>{table ? "Chart" : "Table"}</button>
        <FullButton full={full} onFull={onFull} />
      </div>
      <div className="xn__tabs" role="tablist" aria-label="Five findings">
        {TABS.map((t, i) => (
          <button type="button" role="tab" key={t.k} className="xn__tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)}>
            <span className="xn__tabn">{i + 1}</span>{t.t}
          </button>
        ))}
      </div>
      <h4 className="xn__h">{cur.h}</h4>
      <div className="xn__body" ref={tipApi.box}>
        {table ? <TableView tab={tab} /> : (
          <>
            {tab === "peak" && <Peak tipApi={tipApi} />}
            {tab === "cheese" && <Cheese tipApi={tipApi} />}
            {tab === "drift" && <Drift tipApi={tipApi} />}
            {tab === "rebuild" && <Rebuild tipApi={tipApi} />}
            {tab === "seed" && <Seed tipApi={tipApi} />}
            <Tip tip={tipApi.tip} />
          </>
        )}
      </div>
      <div className="xf__cap">Hover a mark for the exact value, or switch to the table.</div>
    </div>
  );
}

export default function XsNotebook() {
  const [tab, setTab] = useState("peak");
  const [table, setTable] = useState(false);
  return (
    <XsFull
      label="The first pull, full screen"
      render={({ full, onFull }) => <Notebook tab={tab} setTab={setTab} table={table} setTable={setTable} full={full} onFull={onFull} />}
    />
  );
}
