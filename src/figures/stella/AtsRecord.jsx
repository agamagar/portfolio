import { useRef, useState } from "react";
import { Verdict, FieldRow, Pill, StatusDot, Button } from "../ds/Primitives";
import { FIELDS, computeRecord } from "./stellaFields";
import { ROLE_EN, SITE_EN } from "./stellaGraph";

// What lands in the recruiter's ATS after the call.
//
// This view is the second act of the case study made concrete: job performance, not
// agent performance. So there is deliberately NO agent scoreboard here. No calls
// placed, no minutes saved, no accuracy percentage. A recruiter is not measured on any
// of those. They are measured on whether the role closes and whether the shortlist they
// forward with their own name on it holds up in the room, so this view answers only:
// who is this person, what did they actually say, why does the system think what it
// thinks, and how do I disagree with it.
//
// Three things are load-bearing:
//   1. Provenance. A fact read back and agreed is not the same as a fact heard once
//      over a bad line, and a recruiter about to stake their name on it deserves to
//      see which is which.
//   2. The off-script catch is FIRST CLASS, above the tidy fields. It is the thing the
//      old system lost, so burying it here would repeat the mistake in a new place.
//   3. The override is the same size as the agreement.

const DISPOSITIONS = [
  { key: "advance", label: "Advance" },
  { key: "hold", label: "Hold" },
  { key: "nofit", label: "Not a fit" },
];

export default function AtsRecord({ turns, onBackToCall }) {
  const { byKey, offScript } = computeRecord(turns);
  const [decision, setDecision] = useState(null);
  // Focus follows selection in a radiogroup, so the arrow handler needs to reach the
  // option it just selected. Querying the group beats threading a ref per option, and it
  // keeps <Button> a plain function component rather than forcing ref forwarding on the
  // whole design system for one consumer.
  const rowRef = useRef(null);
  const focusOption = (i) => {
    const opts = rowRef.current?.querySelectorAll('[role="radio"]');
    opts?.[i]?.focus();
  };

  const confirmed = FIELDS.filter((f) => byKey[f.key]?.state === "confirmed");
  const heardOnly = FIELDS.filter((f) => byKey[f.key]?.state === "heard");
  const missing = FIELDS.filter((f) => !byKey[f.key] || byKey[f.key].state === "asked");
  const naFields = FIELDS.filter((f) => byKey[f.key]?.state === "na");

  // "touched" summed confirmed + heard-once + not-applicable into one number, which is
  // exactly the blur (f) exists to prevent. Kept as a spelled-out breakdown instead.
  const breakdown = [
    confirmed.length && `${confirmed.length} confirmed`,
    heardOnly.length && `${heardOnly.length} heard once`,
    naFields.length && `${naFields.length} does not apply`,
  ].filter(Boolean).join(", ");
  const called = turns.length > 1;

  // The recommendation follows the evidence rather than an opinion: enough confirmed
  // facts and a stated intent means advance, a thin record means hold, not a rejection.
  const strong = confirmed.length >= 2 || offScript.length > 0;
  const tone = !called ? "neutral" : strong ? "numbers" : "trust";

  const because = [];
  confirmed.forEach((f) => {
    const c = byKey[f.key];
    because.push(`${f.label}: ${c.value}, read back and agreed`);
  });
  naFields.forEach((f) => because.push(`${f.label}: ${byKey[f.key].value}`));
  offScript.forEach((o) => because.push(`${o.label || o.key}: ${o.value}`));

  const unsure = [];
  heardOnly.forEach((f) => unsure.push(`${f.label}: heard once, never read back`));
  missing.forEach((f) => unsure.push(`${f.label}: not answered on this call`));

  return (
    <div className="ats">
      <div className="ats__head">
        <div>
          {/* No title here. The app header names the view (StellaSim HEAD), and a
              larger heading below it made the subordinate title outrank the app bar. */}
          <p className="ats__meta">
            {ROLE_EN}, {SITE_EN}
            <span className="ats__dot" aria-hidden="true" />
            Screening call by Stella
            <span className="ats__dot" aria-hidden="true" />
            <span className="ats__src">
              <StatusDot tone={called ? "numbers" : "neutral"} off={!called} />
              {called ? "call completed" : "no call yet"}
            </span>
          </p>
        </div>
        <Button onClick={onBackToCall}>
          Back to the call
        </Button>
      </div>

      {!called ? (
        <p className="ats__empty">
          Nothing has landed here yet. Take the call first, and whatever it establishes
          will arrive in this record with its provenance attached.
        </p>
      ) : (
        <div className="ats__body">
          <div className="ats__col">
            <Verdict
              tone={tone}
              label="Recommendation"
              headline={
                strong
                  ? "Advance to a human interview"
                  : "Hold, the record is too thin to advance on"
              }
              because={because.length ? because : ["Nothing was confirmed on this call"]}
              unsure={unsure}
            >
              <div className="ats__decide">
                <p className="ats__decidehead" id="ats-decide-head">You decide</p>
                {/* A radiogroup is ONE tab stop, and its arrow keys MOVE FOCUS.
                    This had neither. Every option carried the default tabIndex, so the
                    group was three stops in a row, and the old handler changed `decision`
                    without moving focus, so a screen reader announced nothing at all: the
                    selection moved silently while the focus ring stayed where it was.
                    It also read `findIndex` and treated -1 as 0, so with nothing selected
                    BOTH arrows landed on the first option. Pressing ArrowLeft from
                    "Not a fit" jumped selection to "Advance to a human interview", which
                    is the one option on this screen with a real consequence.

                    Focus and selection move together here, which is the correct pattern
                    for a radiogroup (unlike a toolbar, where they are separate). */}
                <div
                  className="ats__decidrow"
                  role="radiogroup"
                  aria-labelledby="ats-decide-head"
                  ref={rowRef}
                  onKeyDown={(e) => {
                    const last = DISPOSITIONS.length - 1;
                    const at = DISPOSITIONS.findIndex((d) => d.key === decision);
                    let to = null;
                    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                      // From nothing selected, forward starts at the first option and
                      // backward at the last, rather than both collapsing to index 0.
                      to = at < 0 ? 0 : (at + 1) % DISPOSITIONS.length;
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                      to = at < 0 ? last : (at - 1 + DISPOSITIONS.length) % DISPOSITIONS.length;
                    } else if (e.key === "Home") {
                      to = 0;
                    } else if (e.key === "End") {
                      to = last;
                    }
                    if (to === null) return;
                    e.preventDefault();
                    setDecision(DISPOSITIONS[to].key);
                    focusOption(to);
                  }}
                >
                  {DISPOSITIONS.map((d, i) => (
                    <Button
                      key={d.key}
                      role="radio"
                      aria-checked={decision === d.key}
                      data-on={decision === d.key}
                      // The roving part: exactly one option is reachable by Tab. When
                      // nothing is selected yet the first one holds it, so the group is
                      // never skipped entirely.
                      tabIndex={decision === d.key || (!decision && i === 0) ? 0 : -1}
                      // Press again to return to none. The one genuinely reversible act
                      // on this screen was one-way.
                      onClick={() => setDecision(decision === d.key ? null : d.key)}
                    >
                      {decision === d.key && (
                        <span className="ats__btncheck" aria-hidden="true">✓</span>
                      )}
                      {d.label}
                    </Button>
                  ))}
                </div>
                <p className="ats__decidenote">
                  {decision && decision !== (strong ? "advance" : "hold")
                    ? "Logged as an override. This is the number the system should have been measuring all along, and never was."
                    : "The agent recommends. A person decides, and can disagree in one tap."}
                </p>
              </div>
            </Verdict>

            {offScript.length > 0 && (
              <div className="ats__offscript">
                <Pill tone="trust" soft>Heard, but not on the form</Pill>
                {offScript.map((o) => (
                  <div key={o.key} className="ats__offrow">
                    <p className="ats__offvalue">{o.value}</p>
                    <p className="ats__offnote">{o.note}</p>
                  </div>
                ))}
                <p className="ats__offwhy">
                  Surfaced at the top of the record rather than filed under notes,
                  because this is exactly what the old call threw away.
                </p>
              </div>
            )}
          </div>

          <div className="ats__col">
            <h2 className="ats__colhead">
              The record
              <span className="ats__count">
                {confirmed.length} of {FIELDS.length} confirmed
              </span>
            </h2>
            {breakdown && <p className="ats__breakdown">{breakdown}</p>}
            <div className="ats__fields">
              {FIELDS.map((f) => {
                const c = byKey[f.key];
                return (
                  <FieldRow
                    key={f.key}
                    label={f.label}
                    value={c?.value}
                    state={c?.state || "empty"}
                    note={c?.note}
                  />
                );
              })}
            </div>
            <p className="ats__honest">
              Every value here carries how it was got: read back and agreed, heard once,
              or never answered. A recruiter forwarding this puts their own name on it,
              so the difference is theirs to see, not ours to smooth over.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
