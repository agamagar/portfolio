import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { Shimmer } from "../ds/Scaffold";
import { IBolt, ICal } from "./icons";
import "./scheduled.css";

// Reusable state-catalogue contact sheet: a grid of mini-screen thumbnails, one
// per design state, with a spotlight that cycles through and names each. Used to
// document "every case we handled" for the cart page and the scheduled page.
// Each state: { label, note, tone, kind: "cart"|"picker"|"note"|"otp", ... }.

function ThumbBody({ s }) {
  if (s.kind === "picker") {
    return (
      <div className="sd-tpick">
        <div className="sd-ttog">
          <span data-on={!s.sched}><IBolt /></span>
          <span data-on={s.sched} data-sched="true"><ICal /></span>
        </div>
        <div className="sd-tgrid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span className="sd-tcell" key={i} data-on={s.none ? false : s.sel === i ? (s.cellTone || "true") : false} data-off={s.none || (s.dimUntil != null && i < s.dimUntil)} />
          ))}
        </div>
      </div>
    );
  }
  if (s.kind === "note") {
    return (
      <div className="sd-tnote">
        <Shimmer w="72%" h={5} r={3} /><Shimmer w="54%" h={5} r={3} />
        <span className="sd-tnote__chip" data-tone={s.tone}>{s.chip}</span>
      </div>
    );
  }
  if (s.kind === "otp") {
    return (
      <div className="sd-tpick">
        <div className="sd-totp">{[0, 1, 2, 3].map((i) => (<span key={i} />))}</div>
        <span className="sd-tnote__chip" data-tone="purple" style={{ alignSelf: "center" }}>{s.chip || "OTP"}</span>
      </div>
    );
  }
  // default: mini cart (shipment rows + state pill)
  return (
    <div className="sd-tcart">
      {s.rows.map((t, i) => (
        <span className="sd-trow" key={i}>
          <span className="sd-tbox" /><Shimmer w="34%" h={5} r={3} /><span className="sd-tpill" data-tone={t || undefined} />
        </span>
      ))}
    </div>
  );
}

export default function StateGallery({ title, states }) {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(reduce ? -1 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      for (let i = 0; i < states.length && alive(); i++) { setLit(i); await wait(950); }
      await wait(400);
    }
  });

  const cur = lit >= 0 ? states[lit] : null;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-board" data-static={reduce}>
          <div className="sd-board__head">
            <span className="sd-board__title">{title}</span>
            <span className="sd-board__count">{states.length} states</span>
          </div>
          <div className="sd-gallery">
            {states.map((s, i) => (
              <div className="sd-thumb" key={s.label} data-lit={i === lit} data-tone={s.tone || "neutral"}>
                <div className="sd-thumb__scr">
                  <Shimmer w="44%" h={5} r={3} />
                  <ThumbBody s={s} />
                </div>
                <span className="sd-thumb__lbl">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="sd-board__cap" data-tone={cur ? (cur.tone || "neutral") : "neutral"}>
            <span className="sd-board__capdot" />
            {cur ? <span><b>{cur.label}.</b> {cur.note}</span> : <span>Every state, mapped and designed.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
