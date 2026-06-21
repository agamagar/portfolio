import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Badge } from "./chrome";
import { ICheck, IX } from "./icons";
import "./awayAgent.css";

// "The concierge wakes." Pre-app: the boot is framed as a ritual (show-the-work
// from second one), the welcome is named before you act, OTP carries every state
// (idle, typing, verified, error, resend), and the gate is freemium — the whole
// agent is free, only booking is invite-only.

const STEPS = [
  { t: "The concierge wakes", s: "The boot, framed as a ritual" },
  { t: "Named from the start", s: "It knows you before you act" },
  { t: "Every OTP state", s: "Idle, error, resend, verified" },
  { t: "Gate the booking", s: "Free agent, invite to book" },
];

// the 4 OTP cells, composed from small divs — shows verified + an error state
const OTP = [
  { v: "4", state: "verified" },
  { v: "7", state: "verified" },
  { v: "2", state: "error" },
  { v: "", state: "idle" },
];

function OtpCell({ v, state }) {
  const border =
    state === "verified" ? "var(--aw-green)"
      : state === "error" ? "var(--aw-red)"
        : "var(--aw-line)";
  const color =
    state === "verified" ? "var(--aw-green)"
      : state === "error" ? "var(--aw-red)"
        : "var(--ds-text)";
  return (
    <span
      style={{
        width: 46, height: 54, borderRadius: 12,
        border: `1.5px solid ${border}`, background: "var(--aw-bubble)",
        display: "grid", placeItems: "center",
        fontSize: 20, fontWeight: 700, color,
      }}
    >
      {v}
    </span>
  );
}

export default function AwOnboard() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1300); if (!alive()) break;
      setBeat(1); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(1700); if (!alive()) break;
      setBeat(3); await wait(2200);
    }
  });

  const active = beat;
  const done = new Set([0, 1, 2].filter((i) => i < active));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow back={false}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {beat === 0 && (
                <div className="aw-pay">
                  <span className="aw-pay__spin" />
                  <span className="aw-pay__t">Activating your concierge</span>
                  <span className="aw-pay__s">hang tight, this only takes a moment.</span>
                </div>
              )}

              {beat === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 32 }}>
                  <span className="aw-eyebrow">Concierge ready</span>
                  <span className="aw-greet">Welcome to Away, Pratik.</span>
                  <span className="aw-sub">
                    your concierge is ready to plan, book, watch, and step in mid-trip.
                  </span>
                </div>
              )}

              {beat === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 28 }}>
                  <span className="aw-greet" style={{ fontSize: 16 }}>Verify it's you</span>
                  <span className="aw-sub" style={{ marginTop: 0 }}>
                    we texted a code to +91 ••••• 47210.
                  </span>
                  <div style={{ display: "flex", gap: 9 }}>
                    {OTP.map((c, i) => <OtpCell key={i} v={c.v} state={c.state} />)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Badge tone="green" icon={<ICheck />}>Verified</Badge>
                    <Badge tone="red" icon={<IX />}>Wrong code</Badge>
                    <span className="aw-sub" style={{ marginTop: 0 }}>resend in 0:14</span>
                  </div>
                  <span className="aw-sub" style={{ marginTop: 2 }}>
                    every state: idle, typing, verified, error, resend.
                  </span>
                </div>
              )}

              {beat === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 30 }}>
                  <span className="aw-eyebrow">Members only</span>
                  <div className="aw-panel" data-tone="indigo">
                    <div className="aw-panel__t">Away is a private club.</div>
                    <div className="aw-panel__s">
                      the whole agent is yours, free. booking is the part that's invite-only.
                    </div>
                    <span style={{ alignSelf: "flex-start" }}>
                      <Badge tone="indigo" icon={<ICheck />}>Invite to book</Badge>
                    </span>
                  </div>
                  <span className="aw-sub" style={{ marginTop: 0 }}>
                    plan and watch fares now. we'll unlock booking when a seat opens.
                  </span>
                </div>
              )}
            </div>
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
