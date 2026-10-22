import { useEffect, useRef, useState } from "react";
import FigmaShot from "./FigmaShot";
import PhoneControls from "../../ui/PhoneControls";
import PhoneFrame from "../ds/IphoneFrame";
import "./schedToggleDemo.css";

// mv59m6yi (12 Oct): the Instant -> Scheduled toggle, shown as Agam's own screen
// recording. Drop the file at DEMO_SRC (public/figures/scheduled/); until it exists
// the plate shows the three user-test toggle frames from Figma (a still stand-in). Muted, looping, plays while in view.
// data-exp-ok lets the full-page expand (ui/ExpandableFigure) carry the video.
// No coded replica: the real toggle's motion only exists in the recording.
export const DEMO_SRC = "/figures/scheduled/instant-to-scheduled-toggle.mp4";

// 22 Oct (Agam, "the smart toggle: its whole subtext changes based on scenarios"): the same two-option toggle with the
// subtext it shows in each situation. Every string is the playground's own (design-playground schedule-b:
// DeliveryOptionsSheet and CartHeaderStates S-061..S-069, TimeOfDay's high-demand banner). A "slots filling fast"
// scenario was asked for but has no copy in the file, so it is not here.
const SCENARIOS = [
  { k: "open", chip: "Instant available", inst: "9 min", sched: "Order now, get it later", on: "instant" },
  { k: "off", chip: "Instant unavailable", inst: "Instant delivery is unavailable", sched: "Order now, get it later", on: "schedule", off: true },
  { k: "demand", chip: "High demand", inst: "High Demand! Instant delivery is temporarily unavailable. Schedule for later.", sched: "Order now, get it later", on: "schedule", off: true },
  { k: "closed", chip: "Store closed", inst: "Store re-opens at 6AM", sched: "Add to cart now and place order later", on: "schedule", off: true },
  { k: "rain", chip: "Rain", inst: "Deliveries paused due to rain", sched: "Order now, get it later", on: "schedule", off: true },
  { k: "done", chip: "Everything scheduled", inst: "9 min", sched: "Arriving today, 4-5 PM", on: "schedule" },
];

function ToggleScenarios() {
  const [k, setK] = useState("open");
  const sc = SCENARIOS.find((x) => x.k === k);
  const opt = (kind, title, sub, off) => (
    <div className="std-opt" data-kind={kind} data-on={sc.on === kind ? "" : undefined} data-off={off ? "" : undefined}>
      <b>{title}</b>
      <span key={sc.k + kind} className="std-opt__sub" aria-live="polite">{sub}</span>
    </div>
  );
  return (
    <div className="std__plate std__plate--sc">
      <div className="std-chips" role="group" aria-label="Scenario">
        {SCENARIOS.map((x) => (
          <button key={x.k} type="button" aria-pressed={x.k === k} onClick={() => setK(x.k)}>{x.chip}</button>
        ))}
      </div>
      <PhoneFrame size="md" interactive={false} enter={false} alt="The delivery toggle in the selected scenario">
        <div className="std-screen">
          <p className="std-screen__h">Delivery options</p>
          {opt("instant", "Instant Delivery", sc.inst, sc.off)}
          {opt("schedule", "Schedule Delivery", sc.sched, false)}
        </div>
      </PhoneFrame>
    </div>
  );
}

export default function SchedToggleDemo() {
  const wrap = useRef(null);
  const vid = useRef(null);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const v = vid.current, w = wrap.current; if (!v || !w) return undefined;
    v.setAttribute("muted", ""); // a cloned video (the expand view) keeps it muted
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => { if (!ok) return; if (e.isIntersecting && !reduce && !v.dataset.ppUser) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.35 });
    io.observe(w);
    return () => io.disconnect();
  }, [ok]);
  return (
    <div className="std" ref={wrap}>
      <div className="std__plate">
        <video ref={vid} className="std__video" src={DEMO_SRC} muted loop playsInline preload="metadata" data-exp-ok="" hidden={!ok}
          aria-label="The delivery mode toggle switching from Instant to Scheduled"
          onLoadedData={() => setOk(true)} onError={() => setOk(false)} />
        {ok && <PhoneControls label="Delivery toggle demo" />}
        {!ok && <FigmaShot k="toggle-demo" bare alt="Three toggle prototypes side by side: UT 01 dual toggle, UT 02 three options, UT 03 mini toggle with per-shipment pills." />}
      </div>
      <ToggleScenarios />
    </div>
  );
}
