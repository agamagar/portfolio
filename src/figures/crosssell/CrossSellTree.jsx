import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./crosssell.css";

// The exploration set, resolved. Every cross-sell approach that got built, argued
// for, or killed, sorted by the area of the app it lives in, then tiered, with
// the metrics that judge each best-suited approach and the evidence that ranked
// it. Drawn as an actual tree: a root gate, a trunk, one branch per area of the
// app, three tiers off each branch, and the metrics hanging off the best-suited
// tier. The connectors are real, so the descent from root to area to tier to
// metric is visible rather than implied.
//
// Built on the SITE design system, not the figure DS. The other figures in this
// case are Dassh-token islands on a fixed 660px canvas, which is right for a
// miniature of a product surface. This is not a miniature: it is a full-width
// interactive surface the reader treats as part of the page, so it takes the
// site tokens (--bg, --fg, --muted, --line, --hover), the site type scale in
// rem, the site M3 motion tokens, and the global squircle. It follows light and
// dark with the rest of the page, with no theme code of its own.
//
// A fixed canvas also gave this chart two bad options: clip at the frame edge
// (.ds-fit is overflow:hidden) or scale the type down until nobody can read it.
//
// Interactive in three ways, all of which exist to manage the density rather
// than to decorate it: collapse any branch you are not reading, click any node
// to get the one line that earned it its tier, and expand the whole chart to a
// full-bleed view when the article column is too narrow to think in. Nothing
// auto-plays.
//
// The expanded view is a PORTAL to document.body, not a class on the figure.
// Inside the article the chart sits under ancestors with their own overflow and
// stacking contexts, and a fixed-position child of a transformed ancestor is
// positioned against that ancestor rather than the viewport, so an in-place
// overlay would be clipped or mis-anchored. The portal escapes both.
//
// The same chart also renders standalone, edge to edge, at /cross-sell-tree.
//
// Provenance is tagged on every approach, because "we explored this" and "the
// framework scored this" and "the literature says this" are three different
// kinds of claim and a reviewer is entitled to tell them apart:
//   FW    the Cross-Sell Framework v1 (15 May 2026) + its surface score out of 5
//   FIG   a real section on the Concept Designs board, named as it is named there
//   IDEA  the July 2026 ideation thread
//   REJ   rejected in review
//   RES   the discover-phase evidence dossier (public sources, tiered)
//
// Two structural arguments the figure is making:
//   1. The trip classifier is the ROOT, not a guardrail. On an emergency trip
//      none of these branches are reachable at all.
//   2. Everything that got DESIGNED converged on one surface. Search holds nine
//      approaches; the wait window, which the framework scored joint-highest,
//      holds three and none of them were ever drawn.
//
// Every number here is public: company filings, engineering blogs, the CCPA
// order, or peer-reviewed work. No internal Zepto figure appears in this figure.

const TAG_LABEL = {
  fw: "Framework v1",
  fig: "Figma board",
  idea: "Ideation",
  rej: "Rejected in review",
  res: "Evidence dossier",
};

const AREAS = [
  {
    key: "home",
    area: "Home feed",
    sub: "no intent yet, richest disclosed evidence",
    best: [
      { n: "Previously bought, your usuals rail", tags: ["fw", "idea"], m: "3.0", s: "Cadence-built tray on open. Turns cross-sell from an addition task into a subtraction one: the shopper removes what they don't want." },
      { n: "Replenishment tracker, the restock meter", tags: ["fig"], s: "The only concept on the whole board that's a different mechanic, not a different placement. Parked, and it deserved better." },
    ],
    mid: [
      { n: "Occasion and time-of-day shelf", tags: ["fig", "idea"], s: "Cuisine strip, weekend cooking, rainy evening. Real demand, but it competes with paid rail inventory and its attribution is the noisiest on the platform." },
      { n: "Plan your cart, non-obtrusive", tags: ["fig"], s: "Three rounds on the board. Never resolved what triggers it, which is why it never left exploration." },
    ],
    no: [
      { n: "New-category discovery rail at the top", tags: ["idea"], s: "Cold surface, no session signal to read, and explore recall is near zero. It would displace the highest-value slot in the app to guess." },
      { n: "Resurfacing an item inside its own cycle", tags: ["res"], s: "No discovery value once repeat recall is near-total from history alone, and Nagging is a named CCPA dark pattern. An inference, not a documented rule." },
    ],
    metrics: [
      ["Adds before the first search", "primary", "star"],
      ["Replenishment cadence accuracy", "predicted vs actual gap"],
      ["Removed from the tray before checkout", "regret, the gate", "gate"],
      ["Time to checkout", "must not rise", "gate"],
    ],
    ev: [
      { c: "Grofers' Previously Bought converted about 30 percent, against 8 to 10 percent for non-personalised widgets", s: "Blinkit/Grofers eng blog, 2018", t: "T1" },
      { c: "Amazon Buy It Again: over 7 percent product CTR increase, from a Poisson-Gamma timing model, no deep learning", s: "KDD 2018", t: "T1" },
      { c: "Target's SLH-BIA: over 30 percent CTR and about 30 percent revenue, A/B at 20 percent of traffic per arm", s: "Target Tech, Mar 2025", t: "T1" },
      { c: "But a trivial frequency baseline already fills 96.7 percent of a ten-item basket. Benchmark against that, not zero", s: "Reality Check, ACM TOIS 2023", t: "T2" },
    ],
  },
  {
    key: "search",
    area: "Search",
    sub: "highest traffic, where every variant debuts",
    best: [
      { n: "Post-ATC module, anchored to the committed product", tags: ["fig"], s: "Best pairs with Yellow Naturals: the brand-dressed tabbed widget. Commitment already banked, so the ask costs no conversion." },
    ],
    mid: [
      { n: "Pre-ATC, anchored to the query", tags: ["fig"], s: "Best pairs with shampoo. One-to-one slot ad in a single grid cell, or the many-to-many full row. Generic before commitment, specific after." },
      { n: "Product combo as a bundled SKU card", tags: ["fig"], s: "Sits in the grid with a bottom-sheet breakdown of its two constituents. Functionally the rejected add-two idea, re-housed." },
      { n: "Buy Again, expanded inline", tags: ["fig"], s: "See best pairs on a buy-again row, opening underneath it. The only variant in the set with an explicit user-initiated trigger." },
      { n: "More to explore, end of page", tags: ["fig"], s: "After the out-of-stock block. Low displacement and low intent, which makes it the cheapest place to test a discovery slot." },
      { n: "ShopX feedback, hoisted near the top", tags: ["fig"], s: "No trigger, high position. The most intrusive of the five and the hardest to defend on relevance." },
      { n: "Need-shaped and vernacular autosuggest", tags: ["res"], s: "A chocolate brand spent on chocolate and sweets and missed that a fifth of its buyers searched meetha and mithai." },
    ],
    no: [
      { n: "Pinned top-of-grid strip with a combined add-two", tags: ["rej"], s: "Displaces the result that was searched for, and one button adding two items is the exact construct under regulatory scrutiny." },
      { n: "Build your regime, mid-grid", tags: ["rej"], s: "Ruled out on the same board. Worth knowing which reason applied, because it decides whether Product Combo is still alive." },
    ],
    metrics: [
      ["Incremental gross profit per impression", "north star", "star"],
      ["Share of adds that are new-to-user category", "the discovery read", "star"],
      ["Attach rate on the anchor row", "diagnostic"],
      ["Search conversion", "must not fall", "gate"],
      ["Adds removed before checkout", "ratio, not lift", "gate"],
    ],
    ev: [
      { c: "Zepto search runs a mixture-of-experts ranker, three relevancy buckets, buy-again pinned for returning users, under 200ms at over a million requests a minute", s: "Zepto eng blog, Jun 2026", t: "T1" },
      { c: "Semantic retrieval claimed up to 35 percent uplift in search outcomes, but the baseline and metric aren't defined", s: "Zepto eng blog, undated", t: "T1?" },
      { c: "Sponsored results on Amazon.in were costlier than the top organic result in 77 percent of cases and lower-rated in 47 percent", s: "Dash et al., AIES 2024", t: "T1" },
    ],
  },
  {
    key: "pdp",
    area: "Product page",
    sub: "browse-time, deliberate, and unevidenced",
    best: [
      { n: "Frequently bought together, with a reason line", tags: ["fw"], m: "3.25", s: "Ranking-parameter disclosure is already statutory under Rule 5(3)(f), so the honest version costs nothing extra to build." },
    ],
    mid: [
      { n: "Brand Spotlight: best paired with", tags: ["fig"], s: "A single-brand regime on the PDP, with recommended pairings. Clean brand-funded story, narrow candidate pool." },
      { n: "Complete the look", tags: ["fig"], s: "Borrowed wholesale from fashion. Works for BPC, strains everywhere else in a grocery catalogue." },
      { n: "Product pairing listing page", tags: ["fig"], s: "Pairs as their own destination rather than a module. Never resolved how anyone would arrive at it." },
      { n: "The aisle approach", tags: ["fig"], s: "The most literal answer to the showroom problem: rebuild the physical adjacency the search box deleted." },
    ],
    no: [
      { n: "Substitutes while the anchor is in stock", tags: ["fw"], s: "Try this instead on an available item spends the trust the rest of the engine needs. Fallback only, never a ranking strategy." },
      { n: "Gamified regime completion, level up for rewards", tags: ["fig"], s: "Adds a progress economy to a ten-minute errand. The mechanic argues with the promise the company is built on." },
    ],
    metrics: [
      ["Attach rate at PDP", "primary", "star"],
      ["Add-to-cart on the anchor SKU", "must not fall", "gate"],
      ["New-to-brand trial rate", "the sellable signal"],
    ],
    ev: [
      { c: "No entry in the evidence base discloses PDP-level next-intent performance for any Indian quick-commerce platform. A genuine gap, not an oversight", s: "discover-phase dossier", t: "gap" },
      { c: "Category, not brand, is the tractable prediction target: Indian households buy 5.6 soap brands a year, and heavier category buyers buy MORE brands, not fewer", s: "Bain and Kantar, about 80k households", t: "T2" },
    ],
  },
  {
    key: "cart",
    area: "Cart",
    sub: "highest reach, and the one surface with published numbers",
    best: [
      { n: "You forgot: replenishment completers", tags: ["fw"], m: "4.5", s: "Triggers on every cart, cheapest build on the list, and it's genuinely a service, not a pitch." },
      { n: "Post-add modal, goes well with", tags: ["fw"], m: "4.25", s: "Fires on add-to-cart, pairs directly with the top-pairs catalogue, and is the easiest thing here to attribute cleanly." },
    ],
    mid: [
      { n: "Bundle threshold nudge, so far from free delivery", tags: ["fig", "idea"], s: "It works, and it's the closest thing in the set to the mechanism the regulator described. Ship it only with the regret metric already live." },
      { n: "Occasion object: one tap adds the whole night", tags: ["idea"], s: "Meal-solution trips are a tenth of orders. Far higher units per attach than SKU-by-SKU, and brands could bid on occasions rather than keywords." },
      { n: "Surplus and expiry-risk stock from the user's own store", tags: ["idea"], s: "Invert local inventory from a hard filter into the discounted candidate pool. Waste down, margin up, and only quick-commerce can do it." },
    ],
    no: [
      { n: "Speculative new-category slot", tags: ["idea"], s: "A discovery miss here competes with a conversion already mid-flight. The wrong place to be curious." },
      { n: "Silent add, or a pre-selected upsell", tags: ["res"], s: "Not a design risk. A documented regulatory violation for this exact platform, under Rule 4(9) and the CCPA order." },
    ],
    metrics: [
      ["Incremental units per attached order", "primary", "star"],
      ["Incremental gross profit per trip", "not per order", "star"],
      ["Checkout completion", "must not fall", "gate"],
      ["Flagged unwanted on the next order", "regret"],
      ["Lift versus a persistent holdout", "the only credible read"],
    ],
    ev: [
      { c: "Zepto's shipped cart Transformer is 12 layers over cart contents, city, day and hour, and explicitly does NOT read purchase history: plus 23.4 percent add-to-cart, plus 70 paise AOV, plus 10 paise gross profit per order", s: "Zepto eng blog, 1 Jun 2026", t: "T1" },
      { c: "That is the baseline now, and the gap between what it reads and what the brief asked for is the whole opportunity", s: "the pivot in this case", t: "read" },
      { c: "Swiggy's Maxxsaver basket-builder reached over 28 percent of Instamart monthly users in its launch quarter", s: "Swiggy Q1 FY2026 letter", t: "T1" },
    ],
  },
  {
    key: "checkout",
    area: "Checkout",
    sub: "hardest binding constraints in the app",
    best: [
      { n: "Affirmative, unticked, user-initiated add-on", tags: ["res"], s: "The only compliant shape available here. Design the refusal properly and there's still a surface. Design it loosely and there's a penalty." },
    ],
    mid: [
      { n: "One-tap sample, brand-funded, one-tap removal", tags: ["idea"], s: "Converts an impression into an actual trial and digitises the one lever that already works offline. It survives here only because the user adds it, not the system." },
    ],
    no: [
      { n: "Pre-ticked upsell or auto-recorded consent", tags: ["res"], s: "Prohibited outright by Rule 4(9) of the E-Commerce Rules. Not a judgement call." },
      { n: "Colour-coded steering toward one option", tags: ["res"], s: "This is the specific finding against this platform. The uplift it produced was the evidence, not the defence." },
    ],
    metrics: [
      ["Checkout completion", "must not fall", "gate"],
      ["Add-on taken, unticked and user-initiated", "the only countable add"],
      ["Complaints and chargebacks on add-ons", "regret", "gate"],
    ],
    ev: [
      { c: "CCPA final order against Zepto, 4 Dec 2025: a colour-coded payment interface correlated with a spike in basket sneaking, and that engagement uplift was itself treated as evidence of interface interference. Penalty 7,00,000 rupees", s: "CCPA Case Z-10/1/2025", t: "T1" },
      { c: "The same order held that remediation after scrutiny began doesn't excuse the prior violation", s: "same order", t: "T1" },
      { c: "Rule 4(9) prohibits recording consent automatically, including pre-ticked boxes", s: "E-Commerce Rules 2020", t: "T2" },
    ],
  },
  {
    key: "wait",
    area: "The ten-minute wait",
    sub: "joint highest-scored, never designed",
    best: [
      { n: "Merge-window screen carrying the discovery slot", tags: ["fw"], m: "4.5", s: "Order committed, trip dispatched, attention relaxed. A miss costs nothing, which makes it the only right home for the unsolved half." },
    ],
    mid: [
      { n: "Try one new thing", tags: ["fig", "idea"], s: "On the ideas board twice, tagged discovery. Never drawn, never scored against a metric of its own." },
      { n: "Next delivery scheduler", tags: ["fig"], s: "Fits the moment and the mood. Second-order work: it needs the wait screen to exist before it has anywhere to sit." },
    ],
    no: [
      { n: "Urgency beyond the real merge cutoff", tags: ["idea"], s: "The countdown is honest only because the deadline is physical. Anything manufactured on top turns the strongest surface into the weakest defence." },
    ],
    metrics: [
      ["Incremental gross profit per trip", "not per order", "star"],
      ["Thirty and ninety day category repeat", "discovery scoreboard", "star"],
      ["Add rate before the merge cutoff", "diagnostic"],
      ["Same-session add", "explicitly not the goal", "gate"],
    ],
    ev: [
      { c: "No effectiveness or design evidence exists for order-tracking or post-delivery surfacing anywhere in the base. An open gap, and the reason nobody has claimed the surface", s: "discover-phase dossier", t: "gap" },
      { c: "Inventory loss runs about 1.8 percent of net order value, concentrated in perishables, which gives a disclosed unit-economics rationale for steering here. Nobody has published doing it", s: "Zepto filing", t: "T1" },
      { c: "Category widening is steepest in year one: 2.6 categories at acquisition to 18.0 by month 23, so the window that matters most is the first 30 to 90 days", s: "Zepto UDRHP-I, Apr 2024 cohort", t: "T1" },
    ],
  },
  {
    key: "after",
    area: "After delivery",
    sub: "signal capture, not selling",
    best: [
      { n: "The rating tap as training data", tags: ["idea"], s: "Loved it or didn't. Unused inventory that trains the discovery slot and produces the one honest new-to-brand signal nobody in the category discloses." },
      { n: "Negative cross-sell, and keep the log", tags: ["idea"], s: "You already have this arriving Tuesday. Costs real revenue, and is the only documentable evidence the engine acts against its own interest." },
    ],
    mid: [
      { n: "Push completer inside the re-open window", tags: ["fw", "idea"], m: "3.0", s: "A second app open within half an hour is a hard signal of a forgotten item. Lead with completers, skip the ranking theatre, cap frequency hard." },
      { n: "Household mode", tags: ["idea"], s: "Baskets are households, not people. The least creepy route to life-stage signal, because it infers nothing: it asks." },
    ],
    no: [
      { n: "Email and SMS basket builders", tags: ["fw"], m: "1.75", s: "Behaviour in this category is push-led. Parked in the framework and nothing since has argued for reopening it." },
      { n: "Repetitive lifecycle nudging", tags: ["res"], s: "Nagging is one of the thirteen named CCPA dark patterns. Any predicted-intent campaign needs a documented cap and a value case that isn't the engagement rate." },
    ],
    metrics: [
      ["Discovery-slot precision over time", "the payoff", "star"],
      ["New-to-brand orders on a 365-day lookback", "the metric nobody publishes", "star"],
      ["Response rate on the tap", "feasibility"],
      ["Return rate on cross-sold units", "regret, paired", "gate"],
    ],
    ev: [
      { c: "No Zepto, Blinkit or Instamart disclosure defines a new-to-brand incrementality metric the way Amazon Ads does on a rolling 365-day lookback. The sharpest measurement gap in the brief", s: "discover-phase dossier", t: "gap" },
      { c: "Published next-novel-basket models reach Recall@10 of roughly 0.05 to 0.11, and the authors say plainly that limited progress has been made", s: "Ariannezhad et al., RecSys 2023", t: "T2" },
      { c: "Retention is the real prize: about half a cohort still orders at year one, and that half compounds to 279 percent of its first-quarter spend by quarter twelve", s: "Eternal Q1FY27 letter", t: "T1" },
    ],
  },
];


const TIERS = [["best", "Best suited"], ["mid", "Could work"], ["no", "Doesn't work"]];

const ALL = AREAS.map((a) => a.key);

const IExpand = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);
const ICollapse = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </svg>
);

// The chart itself, identical in the article, in the expanded overlay, and on
// the standalone page. Only the chrome around it changes.
function Chart({ open, setOpen, node, setNode, full, onFull, standalone }) {
  const allOpen = open.length === ALL.length;
  return (
    <div className="fc">
        <div className="fc__bar">
          <span className="fc__bar-t">Every cross-sell approach, by where it lives and whether it works</span>
          <button type="button" className="fc__btn" onClick={() => setOpen(allOpen ? [] : ALL)}>
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
          {!standalone && (
            <button
              type="button"
              className="fc__btn fc__btn--icon"
              onClick={onFull}
              aria-label={full ? "Exit full screen" : "View full screen"}
              title={full ? "Exit full screen (Esc)" : "View full screen"}
            >
              {full ? <ICollapse /> : <IExpand />}
              <span>{full ? "Exit" : "Full screen"}</span>
            </button>
          )}
        </div>

        <div className="fc__root">
          <div className="fc__root-t">Trip classifier runs first. <b>Emergency trips exit here.</b></div>
          <div className="fc__root-s">
            Zero surfaces fire on an emergency or time-pressed trip, so nothing below is reachable on one. Everything that is reachable is ranked on incremental gross profit per impression, never on click-through and never margin-led.
          </div>
        </div>

        <div className="fc__trunk">
          {AREAS.map((a) => {
            const isOpen = open.includes(a.key);
            const n = a.best.length + a.mid.length + a.no.length;
            return (
              <div className="fc__area" key={a.key}>
                <button
                  type="button"
                  className="fc__areahead"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? open.filter((x) => x !== a.key) : [...open, a.key])}
                >
                  <span className="fc__caret">{isOpen ? "\u2212" : "+"}</span>
                  <span className="fc__area-n">{a.area}</span>
                  <span className="fc__area-s">{a.sub}</span>
                  <span className="fc__area-c">{n} approaches</span>
                </button>

                {isOpen && (
                  <>
                    <div className="fc__tiers">
                      {TIERS.map(([t, label]) => (
                        <div className="fc__tier" key={t} data-t={t}>
                          <div className="fc__tier-h">{label}</div>
                          {a[t].map((ap) => {
                            const id = a.key + ap.n;
                            const shown = node === id;
                            return (
                              <button
                                type="button"
                                className="fc__node"
                                key={ap.n}
                                aria-expanded={shown}
                                onClick={() => setNode(shown ? null : id)}
                              >
                                <span className="fc__node-h">
                                  <span className="fc__node-n">{ap.n}</span>
                                  {ap.tags.map((k) => (
                                    <span className="fc__tag" key={k} data-k={k} title={TAG_LABEL[k]}>
                                      {k === "fw" && ap.m ? `FW ${ap.m}` : k.toUpperCase()}
                                    </span>
                                  ))}
                                </span>
                                {shown && <span className="fc__node-s">{ap.s}</span>}
                              </button>
                            );
                          })}
                          {t === "best" && (
                            <div className="fc__leaf">
                              <div className="fc__leaf-h">Judged on</div>
                              {a.metrics.map(([mn, mr, kind]) => (
                                <div className="fc__m" key={mn}>
                                  <span className="fc__m-n">{mn}</span>
                                  <span className="fc__m-r" data-kind={kind || ""}>{mr}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="fc__ev">
                      <div className="fc__ev-h">What the evidence says</div>
                      {a.ev.map((e) => (
                        <div className="fc__ev-r" key={e.c}>
                          <span className="fc__ev-t" data-t={e.t}>{e.t}</span>
                          <span className="fc__ev-c">{e.c} <span className="fc__ev-s">{e.s}</span></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="fc__legend">
          <span>Click any approach for the reason it sits in that tier</span>
          <span><b>FW</b> framework v1, with its surface score</span>
          <span><b>FIG</b> built on the board</span>
          <span><b>IDEA</b> ideation</span>
          <span><b>REJ</b> ruled out in review</span>
          <span><b>RES</b> from the evidence</span>
      </div>
    </div>
  );
}

export default function CrossSellTree({ standalone = false }) {
  const [open, setOpen] = useState(ALL);
  const [node, setNode] = useState(null);
  const [full, setFull] = useState(false);

  // Escape closes, and the page behind stops scrolling while it is open.
  const close = useCallback(() => setFull(false), []);
  useEffect(() => {
    if (!full) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      // Clear the property rather than restoring a captured value. Several
      // components on this site lock the body with the same save-and-restore
      // pattern, so a value captured while another lock was active restores
      // "hidden" and leaves the page permanently unscrollable. This overlay is
      // the only thing that set it, so removing it is the honest undo.
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", onKey);
    };
  }, [full, close]);

  const props = { open, setOpen, node, setNode, standalone };

  if (standalone) {
    return <div className="fc-page"><Chart {...props} full={false} onFull={undefined} /></div>;
  }

  return (
    <>
      <Chart {...props} full={false} onFull={() => setFull(true)} />
      {full && createPortal(
        <div className="fc-full" role="dialog" aria-modal="true" aria-label="Cross-sell decision tree, full screen">
          <div className="fc-full__inner">
            <Chart {...props} full onFull={close} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
