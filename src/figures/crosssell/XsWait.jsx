import { useState } from "react";
import PhoneMock from "../mockup/PhoneMock";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure 6: the merge window as a countdown you scrub. Four states on a
// timeline, the phone shows whichever one the reader has picked. Reader-driven
// on purpose: an auto-cycling figure reads as a video, and the reader wants to
// compare the states, not wait for them. The last state is the point: shut has
// to read as a fact, not a punishment.

const STEPS = [
  { t: "Open", c: "8:00", at: 0, s: "The order is placed and the trip isn't packed yet. Everything on this screen still rides the same vehicle." },
  { t: "Warning", c: "4:00", at: 50, s: "The window narrows. Same content, same tone: the only thing that changes is the number." },
  { t: "Last call", c: "0:30", at: 84, s: "The one moment urgency is earned, because the deadline is physical rather than manufactured." },
  { t: "Shut, honestly", c: "closed", at: 100, shut: true, s: "Adds now become a second order at full delivery cost. Say that plainly instead of hiding the state." },
];

function Wait({ i, setI, full, onFull }) {
  const st = STEPS[i];
  return (
    <div className="fc xw">
      <div className="fc__bar">
        <span className="fc__bar-t">The merge window, scrubbed by hand</span>
        <FullButton full={full} onFull={onFull} />
      </div>

      <div className="xw__grid">
        <div>
          <div className="xw__timeline" data-shut={st.shut ? "1" : "0"}>
            <div className="xw__track"><div className="xw__fill" style={{ width: `${st.at}%` }} /></div>
            {STEPS.map((s, k) => (
              <button
                type="button"
                className="xw__pt"
                key={s.t}
                style={{ left: `${s.at}%` }}
                aria-pressed={k === i}
                aria-label={`${s.t}, ${s.c}`}
                onClick={() => setI(k)}
                data-shut={s.shut ? "1" : "0"}
              >
                <span className="xw__pt-c">{s.c}</span>
                <span className="xw__pt-t">{s.t}</span>
              </button>
            ))}
          </div>
          <input
            className="xw__range"
            type="range"
            min="0"
            max={STEPS.length - 1}
            step="1"
            value={i}
            onChange={(e) => setI(Number(e.target.value))}
            aria-label="Scrub the merge window"
            aria-valuetext={`${st.t}, ${st.c}`}
          />
          <div className="xw__panel" data-shut={st.shut ? "1" : "0"}>
            <div className="xw__panel-t">{st.t}</div>
            <p>{st.s}</p>
          </div>
          <div className="xf__cap">A miss here costs nothing, because the shopper has already bought what they came for. Everywhere else a speculative suggestion competes with a conversion in progress. Here it competes with waiting.</div>
        </div>

        <PhoneMock angle="front" width={232}>
          <div className="xswt__scr">
            <div className="xswt__ct" data-shut={st.shut ? "1" : "0"}>
              <div className="xswt__ct-l">{st.shut ? "Window closed" : "Add to this trip for"}</div>
              <div className="xswt__ct-v">{st.shut ? "Packed and on the way" : st.c}</div>
              <div className="xswt__ct-s">
                {st.shut
                  ? "Anything you add now arrives as a second order, at full delivery cost."
                  : "Anything you add before the timer runs out rides the same rider, at no extra delivery cost."}
              </div>
            </div>
            <div className="xswt__card">
              <span className="xswt__thumb" />
              <span>
                <span className="xswt__card-t">Milk, 1L</span>
                <span className="xswt__card-s">You buy this about every four days</span>
              </span>
            </div>
            <div className="xswt__card" data-kind="disc">
              <span className="xswt__thumb" />
              <span>
                <span className="xswt__card-t">Cold-pressed peanut butter <span className="xswt__pill">New to you</span></span>
                <span className="xswt__card-s">Judged on whether you buy the category again, not on this tap</span>
              </span>
            </div>
            <div className="xswt__rest" aria-hidden="true">
              <span className="xswt__rest-l">Rest of the tracking screen</span>
              <span className="xswt__ph" style={{ width: "72%" }} />
              <span className="xswt__ph" style={{ width: "54%" }} />
              <span className="xswt__ph" style={{ width: "63%" }} />
            </div>
          </div>
        </PhoneMock>
      </div>
    </div>
  );
}

export default function XsWait() {
  const [i, setI] = useState(0);
  return (
    <XsFull
      label="The merge window, full screen"
      render={({ full, onFull }) => <Wait i={i} setI={setI} full={full} onFull={onFull} />}
    />
  );
}
