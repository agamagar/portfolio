import { useState } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure 7: the claim ledger as a router. Pick a claim the analysis could come
// back with and the three tagging rules sort it into measured, modelled or
// assumed, then the row fills with the attack the brief already wrote for it.
// The claims are the brief's own analyses phrased as findings; no result is
// real and no number is internal.

const COLS = ["Claim", "Measured, modelled or assumed", "Query or source", "Sample", "Confidence", "Strongest argument against it", "What would change my mind"];

const RULES = [
  { k: "because", t: "Anything with the word because in it is modelled", s: "however clean the query was." },
  { k: "freetext", t: "Anything from extracted free text is modelled", s: "a normalised claim tag is an inference about a label." },
  { k: "sizing", t: "All sizing is assumed", s: "until an experiment says otherwise." },
];

const CLAIMS = [
  {
    c: "Category breadth widens fastest in the first year, then stalls.",
    tag: "measured", rule: null,
    src: "Breadth over tenure, on a fixed signup cohort", sample: "Every user who signed up in the window, churned included", conf: "Medium",
    against: "Survivorship. Users with eighteen months of history are, by definition, the ones who didn't churn.",
    change: "Both curves on the same axes, the churned cohort included, and the stall still there.",
  },
  {
    c: "Breadth widens because tenured shoppers trust the platform more.",
    tag: "modelled", rule: "because",
    src: "Same pull, with a causal story attached", sample: "Same cohort", conf: "Low",
    against: "Broad shoppers are heavy shoppers. Control for frequency and spend and report what survives.",
    change: "The effect surviving the frequency-and-spend control.",
  },
  {
    c: "Buying one high-protein item lifts high-protein purchase in a different category.",
    tag: "modelled", rule: "freetext",
    src: "Cross-category attribute affinity, off the product claims fields", sample: "Only the items whose attribute fields are actually filled", conf: "Low until Part A reports the fill rate",
    against: "If the claims and nutrition data are sparse or free-text mush, this is a catalogue project, not a ranking project.",
    change: "A true fill rate on the attribute fields, checked before any analysis.",
  },
  {
    c: "The discovery slot is worth a defensible small number a quarter.",
    tag: "assumed", rule: "sizing",
    src: "The deliberately small sizing model", sample: "None yet", conf: "Assumed",
    against: "Widget adds aren't incremental. The ranker shows the item most likely to be added anyway, then takes credit for the add.",
    change: "The persistent holdout, and the fraction of adds that were plausibly organic.",
  },
];

function Ledger({ sel, setSel, full, onFull }) {
  const cur = CLAIMS[sel];
  const rule = cur && RULES.find((r) => r.k === cur.rule);
  return (
    <div className="fc xg">
      <div className="fc__bar">
        <span className="fc__bar-t">The output contract: every claim has to survive all seven columns</span>
        <FullButton full={full} onFull={onFull} />
      </div>

      <div className="xg__pick">
        <div className="xg__pick-h">Pick a claim the analysis could come back with</div>
        <div className="xg__claims">
          {CLAIMS.map((cl, i) => (
            <button type="button" className="xg__claim" key={cl.c} aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)}>
              {cl.c}
            </button>
          ))}
        </div>
      </div>

      <div className="xg__rules">
        {RULES.map((r) => (
          <div className="xg__rule" key={r.k} data-on={rule?.k === r.k ? "1" : "0"}>
            <b>{r.t}</b>, {r.s}
          </div>
        ))}
      </div>

      <div className="xg__tbl" role="table" aria-label="Claim ledger">
        <div className="xg__row xg__row--h" role="row">
          {COLS.map((c) => <span role="columnheader" key={c}>{c}</span>)}
        </div>
        <div className="xg__row" role="row" data-tag={cur ? cur.tag : ""}>
          {cur ? (
            <>
              <span role="cell">{cur.c}</span>
              <span role="cell"><span className="xg__tag" data-tag={cur.tag}>{cur.tag}</span></span>
              <span role="cell">{cur.src}</span>
              <span role="cell">{cur.sample}</span>
              <span role="cell">{cur.conf}</span>
              <span role="cell">{cur.against}</span>
              <span role="cell">{cur.change}</span>
            </>
          ) : (
            COLS.map((c) => <span role="cell" key={c} className="xg__empty">—</span>)
          )}
        </div>
      </div>

      <div className="xf__cap">A brief where everything comes back high confidence hasn't been audited. The three lists that follow the ledger are what survives unqualified, what survives with the exact sentence to say when challenged, and what doesn't survive and what would fix it.</div>
    </div>
  );
}

export default function XsLedger() {
  const [sel, setSel] = useState(null);
  return (
    <XsFull
      label="The claim ledger, full screen"
      render={({ full, onFull }) => <Ledger sel={sel} setSel={setSel} full={full} onFull={onFull} />}
    />
  );
}
