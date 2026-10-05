import { useState } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure 2: the intent classifier as a router. Signals feed one classifier, the
// classifier fans into the five intent-states the occasion work mapped, four of
// them carry a rail and the emergency branch drops straight to checkout with
// nothing on it. The five states and their descriptions are the same five as
// /work/occasion-buying; the moves under each are the framework's, mapped on. Click a branch for what
// fires and what is held back. The framework's trip-share percentages are
// omitted: they were placeholders in the source, and this case carries no
// internal number either way.

const SIGNALS = [
  "Time of day",
  "Basket size at the moment of suggestion",
  "Searched or browsed",
  "Age-gated or medicinal items present",
  "Time since the last order",
];

const TRIPS = [
  { t: "The Restocker", who: "Knows exactly what they want, types it, wants out.", m: "Replenishment completers, the forgotten staples, and pack-size upsells. Decisive sessions stay calm, still and fast, so the rail waits until the buying decision is made.", k: "Trial items and anything that slows the path. Overload risk on an already busy basket." },
  { t: "The Mission Shopper", who: "Shopping an occasion they can name, guests, movie night, the lunchbox, but forced to assemble it one search at a time.", m: "Pair completers, and the occasion added as one object rather than SKU by SKU. Chips to dip, beer to ice.", k: "Daily replenishment items. Right item, wrong moment." },
  { t: "The Wanderer", who: "Browsing, open, often late at night. Intent but no query, so search can't serve them.", m: "The discovery slot: labelled, category-level, and allowed to be wrong. The one shopper a miss costs least with.", k: "Same-session pressure. The slot is judged on whether they buy the category again, never on this tap." },
  { t: "The Forgetter", who: "Wanted three things and will remember the fourth only when they see it.", m: "Replenishment completers, the forgotten staples. The exact job the end-cap was invented for.", k: "Cross-category jumps. Stay inside the zone." },
  { t: "The Emergency", who: "Needs one thing fast.", zero: true, m: "Nothing in the checkout path. The adjacent buy is real, and often bigger than the trigger one, so it goes to the post-order wait window, after the promise is kept.", k: "Everything in-session. Get them through checkout.", why: "A missed cross-sell on an emergency trip costs a little. A slowed checkout on the same trip costs a lot, and it's charged against the one promise the whole company is built on." },
];

function Router({ sel, setSel, full, onFull }) {
  const cur = TRIPS.find((r) => r.t === sel);
  return (
    <div className="fc xr">
      <div className="fc__bar">
        <span className="fc__bar-t">The intent classifier runs first. Five states, one of them gets nothing until the promise is kept.</span>
        <FullButton full={full} onFull={onFull} />
      </div>

      <div className="xr__grid">
        <div className="xr__in">
          <div className="xr__in-h">What it reads</div>
          {SIGNALS.map((s) => (
            <div className="xr__sig" key={s}>{s}</div>
          ))}
          <div className="xr__in-f">Rules plus logistic. Retrained weekly. Good enough.</div>
        </div>

        <div className="xr__node">
          <div className="xr__node-t">Intent classifier</div>
          <div className="xr__node-s">before ranking, on every trip</div>
        </div>

        <div className="xr__branches">
          {TRIPS.map((r) => {
            const on = sel === r.t;
            return (
              <button
                type="button"
                className="xr__branch"
                key={r.t}
                data-zero={r.zero ? "1" : "0"}
                aria-pressed={on}
                onClick={() => setSel(on ? null : r.t)}
              >
                <span className="xr__branch-t">{r.t}<span className="xr__branch-s">{r.who}</span></span>
                {r.zero ? (
                  <span className="xr__end">
                    <span className="xr__end-z">0 in checkout</span>
                    <span className="xr__end-c">adjacent buy waits for the wait window</span>
                  </span>
                ) : (
                  <span className="xr__rail" aria-label="A cross-sell rail fires">
                    <i /><i /><i /><i data-disc="1" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="xr__panel" data-zero={cur?.zero ? "1" : "0"}>
        {cur ? (
          cur.zero ? (
            <>
              <div className="xr__panel-t">{cur.t}: nothing fires in the checkout path</div>
              <p>{cur.why}</p>
              <p><b>Fires later.</b> {cur.m}</p>
              <p><b>Held back.</b> {cur.k}</p>
            </>
          ) : (
            <>
              <div className="xr__panel-t">{cur.t}</div>
              <p><b>Fires.</b> {cur.m}</p>
              <p><b>Held back.</b> {cur.k}</p>
            </>
          )
        ) : (
          <p className="xo__hint">Click a branch for what fires on it and what is held back. The empty one is the point.</p>
        )}
      </div>

      <div className="xf__cap">Designing the suppression first says the surface is a guest in someone else's errand. The classifier's most consequential output is which surface never fires.</div>
    </div>
  );
}

export default function XsTrips() {
  const [sel, setSel] = useState("The Emergency");
  return (
    <XsFull
      label="The trip classifier, full screen"
      render={({ full, onFull }) => <Router sel={sel} setSel={setSel} full={full} onFull={onFull} />}
    />
  );
}
