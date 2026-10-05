import { useState, useRef } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure: the second pull (2026-09-04). Five panels from the 3 September 2026
// Databricks export, sections 2, 5, 6 and 7: the live L3 cross-sell table
// (data_science.public.prod_l3_cross_sell_ads) joined to the catalogue. Every
// number is computed from those result tables in the session note
// Claude/2026-09-04_scheduled-delivery-annotation-marathon.md.
//
// !! Internal recommendation counts and lifts. The entry's no-internal-numbers
// rule (2026-08-23) is still open; same status as XsNotebook.
//
// Form, per the dataviz method: 1 = part-to-whole (one stacked bar, emphasis
// on the crossing share), 2 = ranked bars with emphasis (the one real
// crossing), 3 = ranked bars, one hue, 4 = small-multiple histograms on a
// shared log axis (sequential, one hue), 5 = range bars (median + quartiles).
// Bars 12px, 4px rounded data-end, 2px surface gaps, labels at the tip only
// where the story needs them, everything else on hover and in the table view.
// Same tones as XsNotebook (validated): pos #118a63 / neg #b8322a, greys.

const fmt = (n) => n.toLocaleString("en-US");

// Panel 1: 200 rows by lift, in-category vs crossing; 66 pairs by name, 10 crossing.
const P1 = { rows: [158, 42], pairs: [56, 10] };
const P1_CROSS = [
  ["Glue gun, glue gun & hot gun", 9267, "quirk", "one item, two trees"],
  ["Saree, blouse", 3589, "quirk", "saree filed under Home Needs"],
  ["Arm sleeve, biking sleeves", 2955, "quirk", "the same sleeve in two trees"],
  ["Yoga mat, yoga mat bag", 2616, "accessory", "an accessory to itself"],
  ["Humidifier, scented oil", 2605, "real", "the one that reads like a different errand"],
  ["Resistance band, resistance tube", 2530, "quirk", "split across Pharma and Toys"],
  ["Swim shorts, swimming cap", 1959, "accessory", "one kit, two trees"],
  ["Handbags, tote bag", 1886, "quirk", "tote filed under Home Needs"],
  ["Chopsticks, disposable chopsticks", 1827, "quirk", "Kitchen and Home Needs"],
  ["Kurta, pyjamas", 1791, "quirk", "kurta filed under Home Needs"],
];

// Panel 2: top pairs by lift (distinct by name), plus the one real crossing pinned.
const P2 = [
  ["Leash, pet collar", 14527, "in"],
  ["Charcoal burner, hookah chillum", 9808, "in"],
  ["Glue gun, glue gun & hot gun", 9267, "quirk"],
  ["Lancet, test strips", 8788, "in"],
  ["Kite, kite thread", 8306, "in"],
  ["Eyelash glue, eyelashes", 7465, "in"],
  ["Hookah foil, hookah pot", 6403, "in"],
  ["Carrom accessories, carrom board", 5415, "in"],
  ["Hawan samagri, pooja wood", 5361, "in"],
  ["Glucometer, test strips", 5231, "in"],
  ["Cushion, cushion cover", 4542, "in"],
  ["Baby dress, baby gift set", 4050, "in"],
  ["Humidifier, scented oil", 2605, "real"],
];

// Panel 3: where the 507 rows pointed into Skincare come from.
const P3 = [
  ["Skincare", 235], ["Pharma & Wellness", 37], ["Makeup & Beauty", 33], ["Bath & Body", 31],
  ["Feminine Hygiene", 26], ["Packaged Food", 20], ["Hair Care", 20], ["Electronics & Appliances", 19], ["Fragrances & Grooming", 18],
];
const P3_TOTAL = 507;
const P3_ESSENCE = [["Baking powder", 197], ["Cake mould", 167], ["Choco chips", 149], ["Whipping cream", 132], ["Measuring cup", 127], ["Cocoa powder", 119]];

// Panel 4: lift distributions on one log axis. Bins are half-decades.
const BINS = ["1-2", "2-5", "5-10", "10-20", "20-50", "50-100", "100-200", "200-500", "500-1k", "1k-2k", "2k-5k"];
const P4 = [
  { k: "Milk sources", n: 293, median: 3.8, c: [73, 91, 58, 20, 32, 9, 9, 1, 0, 0, 0] },
  { k: "Into skincare", n: 507, median: 23.7, c: [8, 22, 54, 138, 173, 74, 26, 4, 6, 2, 0] },
  { k: "Baby care, both ways", n: 330, median: 76, c: [1, 12, 11, 46, 77, 58, 57, 38, 18, 6, 6] },
];
// Baby care median across both directions is not in the prose; panel 5 carries the split medians.

// Panel 5: baby care, in and out: median with quartiles.
const P5 = [
  { k: "Baby care to baby care", n: 151, p25: 27.9, med: 115.3, p75: 278.4 },
  { k: "Baby care to another aisle", n: 82, p25: 20.2, med: 54.4, p75: 104.7 },
  { k: "Another aisle into baby care", n: 97, p25: 19.3, med: 49.7, p75: 96.0 },
  { k: "Plain milk to anything", n: 61, p25: 1.6, med: 1.7, p75: 2.0 },
];

const TABS = [
  { k: "aisle", t: "The aisle", h: "Four in five rows never leave the source's own category" },
  { k: "pairs", t: "The pairs", h: "The strongest pairs are the ones a shopkeeper would guess" },
  { k: "skin", t: "Skincare", h: "Half of skincare's recommendations start outside it, and it's next door" },
  { k: "lift", t: "Lift by aisle", h: "The universal item lifts nothing; the errand item lifts a lot" },
  { k: "baby", t: "Baby care", h: "The clearest discovery category cross-sells hardest into itself" },
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
  return tip ? <div className="xn__tip" style={{ left: tip.x, top: tip.y }} role="status">{tip.text}</div> : null;
}
function Legend({ items }) {
  return (
    <div className="xn__legend" aria-label="Legend">
      {items.map(([label, tone]) => <span key={label} className="xn__key"><i data-tone={tone} />{label}</span>)}
    </div>
  );
}
const TONE = { in: "g1", quirk: "g2", accessory: "g2", real: "pos" };

function Aisle({ tipApi }) {
  const stack = (label, vals, note) => {
    const total = vals[0] + vals[1];
    return (
      <div className="xp__row">
        <div className="xp__rowlabel">{label}</div>
        <div className="xp__stack" role="img" aria-label={`${label}: inside ${vals[0]}, crossing ${vals[1]}`}>
          <div className="xp__seg" data-tone="g1" style={{ width: `${(100 * vals[0]) / total}%` }} onPointerMove={(e) => tipApi.show(e, `${fmt(vals[0])} inside the source's category`)} onPointerLeave={tipApi.hide} />
          <div className="xp__seg" data-tone="pos" style={{ width: `${(100 * vals[1]) / total}%` }} onPointerMove={(e) => tipApi.show(e, `${fmt(vals[1])} crossing a category line`)} onPointerLeave={tipApi.hide} />
        </div>
        <div className="xp__rowval">{note}</div>
      </div>
    );
  };
  return (
    <div className="xp">
      <Legend items={[["Inside the category", "g1"], ["Crossing a category line", "pos"]]} />
      {stack("Rows, top 200 by lift", P1.rows, "158 of 200")}
      {stack("Pairs, by name", P1.pairs, "56 of 66")}
      <div className="xp__list">
        <div className="xp__listh">The ten that cross, read one by one</div>
        {P1_CROSS.map(([pair, lift, kind, why]) => (
          <div className="xp__item" key={pair} onPointerMove={(e) => tipApi.show(e, `lift ${fmt(lift)}: ${why}`)} onPointerLeave={tipApi.hide}>
            <i data-tone={TONE[kind]} />
            <span className="xp__itemk">{pair}</span>
            <span className="xp__itemv">{fmt(lift)}</span>
            <span className="xp__itemw">{why}</span>
          </div>
        ))}
      </div>
      <p className="xn__lesson">Nine of the ten crossings are the catalogue tree, not the shopper: one item filed in two places, or an accessory to itself. Humidifier to scented oil is the one different errand in a hundred.</p>
    </div>
  );
}

function Pairs({ tipApi }) {
  const max = P2[0][1];
  return (
    <div className="xp">
      <Legend items={[["Inside the category", "g1"], ["A taxonomy quirk", "g2"], ["The one real crossing", "pos"]]} />
      <div className="xp__bars">
        {P2.map(([pair, lift, kind]) => (
          <div className="xp__bar" key={pair} onPointerMove={(e) => tipApi.show(e, `${pair}: lift ${fmt(lift)}`)} onPointerLeave={tipApi.hide}>
            <span className="xp__barlabel">{pair}</span>
            <span className="xp__track"><span className="xp__fill" data-tone={TONE[kind]} style={{ width: `${(100 * lift) / max}%` }} /></span>
            <span className="xp__barval">{fmt(lift)}</span>
          </div>
        ))}
      </div>
      <p className="xn__lesson">Leash to collar. Lancet to test strips. Kite to thread. The engine finishes errands and it's spectacular at it. The one pair that starts a different one sits twelve places down.</p>
    </div>
  );
}

function Skin({ tipApi }) {
  const max = P3[0][1];
  return (
    <div className="xp">
      <Legend items={[["Skincare itself", "pos"], ["Every other source", "g1"]]} />
      <div className="xp__bars">
        {P3.map(([cat, n], i) => (
          <div className="xp__bar" key={cat} onPointerMove={(e) => tipApi.show(e, `${cat}: ${n} of ${P3_TOTAL} rows`)} onPointerLeave={tipApi.hide}>
            <span className="xp__barlabel">{cat}</span>
            <span className="xp__track"><span className="xp__fill" data-tone={i === 0 ? "pos" : "g1"} style={{ width: `${(100 * n) / max}%` }} /></span>
            <span className="xp__barval">{n}</span>
          </div>
        ))}
      </div>
      <div className="xp__list">
        <div className="xp__listh">Thirty-three of the outside rows recommend one thing: Essence</div>
        {P3_ESSENCE.map(([src, lift]) => (
          <div className="xp__item" key={src} onPointerMove={(e) => tipApi.show(e, `${src} recommends Essence at lift ${lift}`)} onPointerLeave={tipApi.hide}>
            <i data-tone="g2" /><span className="xp__itemk">{src}</span><span className="xp__itemv">{lift}</span><span className="xp__itemw">to Essence, filed under skincare</span>
          </div>
        ))}
      </div>
      <p className="xn__lesson">272 of 507 rows start outside skincare. The top of that list is foot filer to foot scrub and acne treatment to spot corrector: next-door shelves with a line drawn through them. And baking recommends Essence, because Essence is filed under skincare. The engine is right and the tree is wrong.</p>
    </div>
  );
}

function Lift({ tipApi }) {
  const max = Math.max(...P4.flatMap((d) => d.c));
  return (
    <div className="xp">
      <div className="xp__hist">
        {P4.map((d) => (
          <div className="xp__histrow" key={d.k}>
            <div className="xp__histlabel"><b>{d.k}</b><span>{d.n} rows, median lift {d.median}</span></div>
            <div className="xp__histbars" role="img" aria-label={`${d.k}: ${BINS.map((b, i) => `${b}: ${d.c[i]}`).join(", ")}`}>
              {d.c.map((n, i) => (
                <span className="xp__histcol" key={i} onPointerMove={(e) => tipApi.show(e, `${d.k}, lift ${BINS[i]}: ${n} rows`)} onPointerLeave={tipApi.hide}>
                  <span className="xp__histfill" data-tone="pos" style={{ height: `${n ? Math.max(4, (100 * n) / max) : 0}%` }} />
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="xp__axis">{BINS.map((b) => <span key={b}>{b}</span>)}</div>
        <div className="xp__axisname">lift, log bins</div>
      </div>
      <p className="xn__lesson">Milk lives at the left edge: in every basket, so it lifts nothing. Baby care lives at the right: an errand with parts, so every part predicts the next. Same table, same maths, and the shape of the aisle is the whole story.</p>
    </div>
  );
}

function Baby({ tipApi }) {
  const L = (v) => Math.log10(v);
  const lo = 0, hi = L(300);
  const x = (v) => `${(100 * (L(v) - lo)) / (hi - lo)}%`;
  return (
    <div className="xp">
      <Legend items={[["Median", "pos"], ["Middle half of rows", "s1"]]} />
      <div className="xp__ranges">
        {P5.map((d) => (
          <div className="xp__range" key={d.k} onPointerMove={(e) => tipApi.show(e, `${d.k}: median ${d.med}, middle half ${d.p25} to ${d.p75}, ${d.n} rows`)} onPointerLeave={tipApi.hide}>
            <span className="xp__rangelabel">{d.k}</span>
            <span className="xp__rangetrack">
              <span className="xp__rangeband" data-tone="s1" style={{ left: x(d.p25), width: `calc(${x(d.p75)} - ${x(d.p25)})` }} />
              <span className="xp__rangedot" data-tone="pos" style={{ left: x(d.med) }} />
            </span>
            <span className="xp__rangeval">{d.med}</span>
          </div>
        ))}
        <div className="xp__axis xp__axis--log">{[1, 3, 10, 30, 100, 300].map((v) => <span key={v} style={{ left: x(v) }}>{v}</span>)}</div>
        <div className="xp__axisname">median lift, log scale</div>
      </div>
      <p className="xn__lesson">Inside baby care the median lift is 115. Leaving it, 54. Arriving from outside, 50, and every arrival is the same errand continued: bottle cleaner, rattle, clothing set. Plain milk sits at 1.7 for scale. Nobody arrives from outside the errand.</p>
    </div>
  );
}

function TableView({ tab }) {
  const T = ({ cols, rows }) => (
    <div className="xn__tablewrap">
      <table className="xn__table">
        <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
  if (tab === "aisle") return <T cols={["Pair", "Lift", "What it is"]} rows={P1_CROSS.map(([p, l, k, w]) => [p, fmt(l), w])} />;
  if (tab === "pairs") return <T cols={["Pair", "Lift", "Kind"]} rows={P2.map(([p, l, k]) => [p, fmt(l), k === "in" ? "inside the category" : k === "quirk" ? "taxonomy quirk" : "real crossing"])} />;
  if (tab === "skin") return <T cols={["Source category", "Rows into skincare"]} rows={P3.map(([c, n]) => [c, n])} />;
  if (tab === "lift") return <T cols={["Aisle", ...BINS]} rows={P4.map((d) => [d.k, ...d.c])} />;
  return <T cols={["Direction", "Rows", "Lower quartile", "Median", "Upper quartile"]} rows={P5.map((d) => [d.k, d.n, d.p25, d.med, d.p75])} />;
}

function Pull({ tab, setTab, table, setTable, full, onFull }) {
  const tipApi = useTip();
  const cur = TABS.find((t) => t.k === tab);
  return (
    <div className="fc xn">
      <div className="fc__bar">
        <span className="fc__bar-t">Five things the second pull said</span>
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
            {tab === "aisle" && <Aisle tipApi={tipApi} />}
            {tab === "pairs" && <Pairs tipApi={tipApi} />}
            {tab === "skin" && <Skin tipApi={tipApi} />}
            {tab === "lift" && <Lift tipApi={tipApi} />}
            {tab === "baby" && <Baby tipApi={tipApi} />}
            <Tip tip={tipApi.tip} />
          </>
        )}
      </div>
      <div className="xf__cap">Export dated 3 September 2026. Hover a mark for the exact value, or switch to the table.</div>
    </div>
  );
}

export default function XsSecondPull() {
  const [tab, setTab] = useState("aisle");
  const [table, setTable] = useState(false);
  return (
    <XsFull
      label="The second pull, full screen"
      render={({ full, onFull }) => <Pull tab={tab} setTab={setTab} table={table} setTable={setTable} full={full} onFull={onFull} />}
    />
  );
}
