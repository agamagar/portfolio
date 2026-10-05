import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Mapping intents, built to Portfolio 2026 node 395:9425 to the number.
// Panel 1392x1010, r24, pad 60, radial gradient #356959 -> #f7fed4 (50%) ->
// #356959 centred bottom-right. Header row 190 tall (pad 60): "Mapping intents"
// in Playwrite US Trad 36/70, #34695a. Card row: pad 60, gap 60, cards 460x580,
// r24, white at 50% with a glass effect, pad 36, gap 24. Card head: 64px icon +
// title Playwrite 28/54. Claim: Zepto Norms 500 36/44, centred. Evidence rows:
// 20px info glyph + Zepto Norms 450 16/20, 16 between rows. Every Figma px is
// (100cqw / 1392), so the proportions hold at the article width and read 1:1 in
// the full-screen view. The row overflows and scrolls, as the frame does.
//
// The Figma card copy was placeholder (the home-feed evidence repeated), so each
// card carries the evidence the decision tree already cites for that intent.
// All numbers public, none internal.

const Search = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="#34695a" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><circle cx="28" cy="28" r="15" /><path d="M39 39 52 52" /></svg>
);
const Bulb = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="#34695a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M25 48h14M27 55h10M22 39a14 14 0 1 1 20 0c-2 1.6-3.5 3.6-3.5 6h-13c0-2.4-1.5-4.4-3.5-6Z" /></svg>
);
const Gem = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="#34695a" strokeWidth="3" strokeLinejoin="round" aria-hidden="true"><path d="M17 14h30l10 15-25 26L7 29l10-15ZM7 29h50M24 14l8 15 8-15M17 14l7 15M47 14l-7 15M24 29l8 26M40 29l-8 26" /></svg>
);
const Blocks = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="#34695a" strokeWidth="3" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="35" width="20" height="20" rx="3" /><rect x="35" y="35" width="20" height="20" rx="3" /><rect x="22" y="9" width="20" height="20" rx="3" /></svg>
);

const INTENTS = [
  {
    k: "discovery", t: "Discovery", Icon: Search,
    h: "Search serves the shopper who can already name the thing",
    ev: [
      ["Zepto search runs a mixture-of-experts ranker, three relevancy buckets, buy-again pinned for returning users, under 200ms at over a million requests a minute", "Zepto eng blog, Jun 2026"],
      ["Sponsored results on Amazon.in were costlier than the top organic result in 77 percent of cases and lower-rated in 47 percent", "Dash et al., AIES 2024"],
      ["A chocolate brand spent on chocolate and sweets and missed that a fifth of its buyers searched meetha and mithai", "evidence dossier"],
    ],
  },
  {
    k: "explore", t: "Explore", Icon: Bulb,
    h: "The home feed is mostly for buying what you've bought before",
    ev: [
      ["Grofers' Previously Bought converted about 30 percent, against 8 to 10 percent for non-personalised widgets", "Blinkit/Grofers eng blog, 2018"],
      ["Amazon Buy It Again: over 7 percent product CTR increase, from a Poisson-Gamma timing model, no deep learning", "KDD 2018"],
      ["Target's SLH-BIA: over 30 percent CTR and about 30 percent revenue, A/B at 20 percent of traffic per arm", "Target Tech, Mar 2025"],
      ["But a trivial frequency baseline already fills 96.7 percent of a ten-item basket. Benchmark against that, not zero", "Reality Check, ACM TOIS 2023"],
    ],
  },
  {
    k: "new", t: "Buy new", Icon: Gem,
    h: "Introducing someone to a category they've never bought is the half nobody has solved",
    ev: [
      ["Published next-novel-basket models reach Recall@10 of roughly 0.05 to 0.11, and the authors say plainly that limited progress has been made", "Ariannezhad et al., RecSys 2023"],
      ["Category widening is steepest in year one: 2.6 categories at acquisition to 18.0 by month 23, so the window that matters most is the first 30 to 90 days", "Zepto UDRHP-I, Apr 2024 cohort"],
      ["Category, not brand, is the tractable prediction target: Indian households buy 5.6 soap brands a year, and heavier category buyers buy more brands, not fewer", "Bain and Kantar, about 80k households"],
    ],
  },
  {
    k: "build", t: "Build", Icon: Blocks,
    h: "Basket-building reads the cart in front of the shopper, and that half is close to finished",
    ev: [
      ["Zepto's shipped cart Transformer is 12 layers over cart contents, city, day and hour, and explicitly does not read purchase history: plus 23.4 percent add-to-cart, plus 70 paise AOV, plus 10 paise gross profit per order", "Zepto eng blog, 1 Jun 2026"],
      ["Swiggy's Maxxsaver basket-builder reached over 28 percent of Instamart monthly users in its launch quarter", "Swiggy Q1 FY2026 letter"],
      ["Inventory loss runs about 1.8 percent of net order value, concentrated in perishables, a disclosed unit-economics rationale for steering the basket", "Zepto filing"],
    ],
  },
];

function Panel({ full, onFull }) {
  return (
    <div className="fc xi">
      <div className="fc__bar">
        <span className="fc__bar-t">Read the evidence by the intent it serves</span>
        <FullButton full={full} onFull={onFull} />
      </div>
      <div className="xi__panel">
        <div className="xi__head"><div className="xi__title">Mapping intents</div></div>
        <div className="xi__row" tabIndex={0} aria-label="Four shopping intents, scroll sideways">
          {INTENTS.map((x) => (
            <article className="xi__card" key={x.k}>
              <div className="xi__card-h"><span className="xi__icon"><x.Icon /></span><span className="xi__card-t">{x.t}</span></div>
              <div className="xi__claim-w"><h4 className="xi__claim">{x.h}</h4></div>
              <ul className="xi__ev">
                {x.ev.map(([c, s]) => (
                  <li key={c}><span className="xi__i" aria-hidden="true"><i /></span><span>{c} <em>{s}</em></span></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
      <div className="xf__cap">Two of the four are close to finished, and the published numbers say so. The third is the half nobody has solved. Scroll the row sideways.</div>
    </div>
  );
}

export default function XsIntents() {
  return <XsFull label="Mapping intents, full screen" render={({ full, onFull }) => <Panel full={full} onFull={onFull} />} />;
}
