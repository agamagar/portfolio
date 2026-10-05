import { useState } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure 1: the framework's front page as an in-place accordion. Five pillars,
// each a row that opens to what it decided, and under that a table giving the
// detail behind the row's one-liner. Pillar 1 is lit because intent-state is the
// first decision the model makes and every other pillar is downstream of it.
//
// Every cell is a sentence or a number already in the case: the intent-states
// from the occasion work, the framework's own surface scores (out of 5) and ship
// split, the classifier's signal list, the ranker's terms, the ten refusals. No
// per-dimension sub-score is shown because the case does not carry them, and no
// internal Zepto number appears anywhere.

const PILLARS = [
  {
    n: "01",
    t: "Intent-state",
    s: "Classify intent first. The right move for a Restocker is the wrong one at midnight.",
    d: [
      "Five intent-states, the same five the occasion work mapped. The classifier can be cheap: rules plus logistic over time of day, basket size at the moment of suggestion, searched or browsed, any age-gated or medicinal items, and time since the last order. Retrained weekly.",
    ],
    table: {
      cols: ["Intent-state", "Who", "Fires", "Held back"],
      rows: [
        ["The Restocker", "Knows exactly what they want, types it, wants out.", "Replenishment completers, the forgotten staples, pack-size upsells. After the buying decision.", "Trial items and anything that slows the path."],
        ["The Mission Shopper", "Shopping an occasion they can name, one search at a time.", "Pair completers, and the occasion added as one object rather than SKU by SKU.", "Daily replenishment items. Right item, wrong moment."],
        ["The Wanderer", "Browsing, open, often late at night. Intent but no query.", "The discovery slot: labelled, category-level, allowed to be wrong.", "Same-session pressure. Judged on category repeat, never on this tap."],
        ["The Forgetter", "Wanted three things, will remember the fourth on sight.", "Replenishment completers. The job the end-cap was invented for.", "Cross-category jumps. Stay inside the zone."],
        ["The Emergency", "Needs one thing fast.", "Nothing in the checkout path. The adjacent buy goes to the post-order wait window.", "Everything in-session. Get them through checkout."],
      ],
    },
  },
  {
    n: "02",
    t: "Surface times moment",
    s: "Surfaces scored on reach, intent, inventory match and margin tilt. Three shipped in v1.",
    d: [
      "The post-order wait scored joint-highest and the roadmap put it third. That was wrong. It should've been first. A per-trip cap of three surfaces, because the second exposure is worth half the first.",
    ],
    table: {
      cols: ["Surface", "Moment", "Framework score", "Ship"],
      rows: [
        ["You forgot, replenishment completers", "Cart, on every cart", "4.5 / 5", "v1"],
        ["Merge-window screen", "The ten-minute wait, after the order", "4.5 / 5", "Scored joint-highest, never designed"],
        ["Post-add modal, goes well with", "Cart, on add-to-cart", "4.25 / 5", "v1"],
        ["Frequently bought together, with a reason line", "Product page", "3.25 / 5", "v1.5"],
        ["Previously bought, your usuals rail", "Home feed, on open", "3.0 / 5", "v1.5"],
        ["Push completer in the re-open window", "After delivery", "3.0 / 5", "Later"],
        ["Inline cross-sell in search", "Search results", "Scored in the ship list", "v1.5"],
        ["Email and SMS basket builders", "Off-app", "1.75 / 5", "Deliberately not in v1"],
        ["Sponsored cross-sell", "Any", "Parked to protect relevance", "Deliberately not in v1"],
      ],
    },
  },
  {
    n: "03",
    t: "Signal stack",
    s: "Ordered by priority and deliberately short. Ship the surface, then layer.",
    d: ["Availability is a hard filter, not a ranking signal. Suggesting out-of-stock breaks the speed promise even when the cart goes through."],
    table: {
      cols: ["Signal", "Role", "Note"],
      rows: [
        ["Availability at the shopper's own dark store", "Hard filter, zero or one", "Runs before ranking. Out of stock means the whole score is zero."],
        ["Current cart contents", "Ranking input", "What the shipped model reads. The basket in front of the shopper, not the history behind them."],
        ["Time of day", "Classifier input", "Weekly stock-up and paracetamol at midnight are different trips."],
        ["Basket size at the moment of suggestion", "Classifier input", "Decides the cap: no more than three surfaces on one trip."],
        ["Searched or browsed", "Classifier input", "Separates the Restocker from the Wanderer."],
        ["Age-gated or medicinal items present", "Classifier input and gate", "Gating enforced before serving, not after."],
        ["Time since the last order", "Classifier input", "A second open within half an hour is a hard signal of a forgotten item."],
        ["Purchase history", "Deliberately not in v1", "The discovery slot reads it later, at category level, judged on 30 and 90 day repeat."],
      ],
    },
  },
  {
    n: "04",
    t: "Ranking objective",
    s: "Incremental gross profit per impression. Margin as a tie-break, never a lead.",
    d: ["score = relevance × availability × (1 + margin_tilt × margin_z). The tilt lives in a named cell with a written escalation trigger. Its starting value stays out of this case on purpose."],
    table: {
      cols: ["Term", "Role", "What it protects"],
      rows: [
        ["Relevance", "Leads", "The lift estimate from pair-purchase data, ranked by lift rather than raw co-order volume. Bought-together is not belongs-together."],
        ["Availability", "Hard filter", "A zero-or-one against the shopper's own dark store. Suggesting something out of stock breaks the speed promise."],
        ["Margin tilt", "Tie-break only", "A tunable bias with a written escalation trigger. Past a threshold, the answer is a different objective, not a bigger number in this one."],
        ["Click-through", "Ruled out", "A rail can post a beautiful click rate and cause nothing. It measures whether the widget was noticed, not whether it helped."],
        ["Margin-led ranking", "Ruled out", "Lead with margin and the catalogue collapses to detergent and house-brand staples within a quarter."],
      ],
    },
  },
  {
    n: "05",
    t: "Guardrails",
    s: "Ten refusals, written as things we would not do.",
    d: ["They're the only part of the judgement that runs every time, because a recommender runs millions of times with no designer present."],
    table: {
      cols: ["#", "Refusal", "Reason"],
      rows: [
        ["01", "Don't dilute the ten-minute promise.", "A slowed checkout is charged against the one promise the whole company is built on."],
        ["02", "Don't cross-sell inside an emergency checkout.", "Nothing in the checkout path. The adjacent buy is real and goes to the post-order wait window instead."],
        ["03", "Don't fire more than three surfaces on one trip.", "The second exposure is worth half the first."],
        ["04", "Don't let margin lead the ranking.", "Relevance goes, and the rail becomes furniture people learn to scroll past."],
        ["05", "Don't suggest a substitute while the anchor is in stock.", "Enforced in the product, before serving. Substitute-led recommendations stay out of v1 entirely."],
        ["06", "Don't guess at a first-order user.", "First-order users get category heuristics, not pseudo-personalised noise."],
        ["07", "Don't ship without a holdout.", "Without it, lift claims are unfalsifiable, and an unfalsifiable claim is worth nothing in a review room and less in a hearing."],
        ["08", "No individual-level inference about a child, a health condition or a pregnancy.", "Ever, at any confidence, for any uplift. Aggregates only, and no cell under fifty users."],
        ["09", "Gate age-gated and medicinal categories before serving.", "Enforced in the product, before ranking."],
        ["10", "Neutral copy on sensitive categories, reviewed before ship.", "Enforced in the product, before ranking."],
      ],
    },
  },
];

const ALL_P = PILLARS.map((p) => p.n);

function View({ open, setOpen, full, onFull }) {
  const allOpen = open.length === ALL_P.length;
  const toggle = (n) => setOpen(open.includes(n) ? open.filter((x) => x !== n) : [...open, n]);
  return (
    <div className="fc xf">
      <div className="fc__bar">
        <span className="fc__bar-t">Cross-sell framework v1, the one-page brief</span>
        <button type="button" className="fc__btn" onClick={() => setOpen(allOpen ? [] : ALL_P)}>
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
        <FullButton full={full} onFull={onFull} />
      </div>

      <p className="xf__intro">
        This is the one-page brief I wrote before any screen existed, dated 15 May 2026 and paired with a model whose assumptions all sat in one tab. It set the terms an ML engine and a review room would be judged by. Five pillars, each a decision the engine has to answer before it can rank anything, and the fifth carries the ten refusals. Open a pillar for what it decided and the table behind it.
      </p>

      <div className="xf__h">Five pillars</div>
      <div className="xf__pillars">
        {PILLARS.map((p, i) => {
          const isOpen = open.includes(p.n);
          return (
            <div className="xf__p" key={p.n} data-key={i === 0 ? "1" : ""} data-open={isOpen ? "1" : "0"}>
              <button type="button" className="xf__p-head" aria-expanded={isOpen} onClick={() => toggle(p.n)}>
                <span className="xf__n">{p.n}</span>
                <span className="xf__t">{p.t}</span>
                <span className="xf__s">{p.s}</span>
                <span className="xf__caret">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="xf__p-body">
                  {p.d.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <div className="xf__tbl-w">
                    <table className="xf__tbl" data-cols={p.table.cols.length}>
                      <thead>
                        <tr>{p.table.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {p.table.rows.map((r) => (
                          <tr key={r[0] + r[1]}>{r.map((cell, k) => (k === 0 ? <th key={k} scope="row">{cell}</th> : <td key={k}>{cell}</td>))}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="xf__cap">
        A recommender is a policy, not a screen. The objective and the refusals are the two parts no interface craft downstream can argue with, which is why they were written before anything was drawn.
      </div>
    </div>
  );
}

export default function XsFramework() {
  const [open, setOpen] = useState(["01"]);
  return (
    <XsFull
      label="Cross-sell framework, full screen"
      render={({ full, onFull }) => <View open={open} setOpen={setOpen} full={full} onFull={onFull} />}
    />
  );
}
