// ══════════════════════════════════════════════════════════════════════════
// VERTICAL TIMELINE v1 — A FROZEN SNAPSHOT, parked 2026-08-13 (Agam: "save the
// current timeline version [in the lab page] and make it [horizontal]").
//
// This is the vertical, top-to-bottom touch timeline as it read the moment the
// horizontal redesign began — the .tlv column (years | glass spine | cards)
// with the sticky year wheel and the scroll-driven magnifier. Kept so the
// horizontal v2 has the shipped version to be compared against.
//
// WHAT IS FROZEN AND WHAT IS NOT — worth knowing before trusting it:
//
//   FROZEN   nothing is COPIED here. The freeze is a CONTRACT instead: v2 is
//            built as a NEW component with NEW class names, and RailColumn.jsx
//            plus every `.tlv*` rule in timeline.css are left untouched. As long
//            as that holds, the live RailColumn this file imports IS v1, so
//            importing it is faithful rather than a drifting copy.
//
//   SHARED   RailColumn.jsx, the `.tlv*` CSS, and the model builders
//            (scrubModel / detailsById, exported from Timeline.jsx). They are
//            the engine and the record, not the horizontal design.
//
//   NOTE     the magnifier wave is driven by page scroll, so in this specimen
//            the spine sits at rest until you scroll it into the reading line —
//            same as it behaves in the live section.
//
// If v2 ever needs to edit `.tlv*` or RailColumn.jsx, freeze this for real first
// (byte-copy the component + namespace the CSS), or tag the commit.
// ══════════════════════════════════════════════════════════════════════════

import RailColumn from "../../../hello/RailColumn";
import { scrubModel, detailsById } from "../../../hello/Timeline";
import "../../../hello/timeline.css";

export default function TimelineVerticalV1() {
  // Same model + record the live section feeds the vertical rail, built once.
  const model = scrubModel();
  const details = detailsById();
  return (
    // The `.tlx` + `.tlx__rail[data-layout="column"]` wrapper is the exact
    // context RailColumn renders inside on touch, so the shared `.tlv*` rules
    // resolve the same way they do live.
    <div className="tlx" data-style="rail">
      <div className="tlx__rail" data-touch="true" data-layout="column">
        <RailColumn model={model} details={details} />
      </div>
    </div>
  );
}
