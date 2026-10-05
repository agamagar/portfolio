import { Shimmer } from "../ds/Scaffold";

// The animated content of the GTM banner: abstracted copy (shimmer) + a scheduled-
// time motif (a sweeping clock and slot chips popping). Background-less, so it can
// sit inside the coded banner (SchedGtm) OR be composited over the real screen
// plate's empty lavender banner in Design Mode (SchedGtmReal). Pure-CSS motion.

const TICKS = [0, 90, 180, 270];

export default function GtmMotion() {
  return (
    <>
      <div className="gtm-copy">
        <Shimmer w="76%" h={11} r={5} />
        <Shimmer w="54%" h={8} r={4} />
        <span className="gtm-chip" />
      </div>
      <div className="gtm-art">
        <span className="gtm-pill gtm-pill--1" />
        <span className="gtm-pill gtm-pill--2" />
        <span className="gtm-pill gtm-pill--3" />
        <span className="gtm-clock">
          {TICKS.map((d) => (<span className="gtm-clock__tick" key={d} style={{ transform: `rotate(${d}deg)` }} />))}
          <span className="gtm-clock__hand" />
          <span className="gtm-clock__dot" />
        </span>
      </div>
    </>
  );
}
