import { useEffect, useRef, useState } from "react";
import PhoneControls from "../../ui/PhoneControls";
import ScreenStrip from "./ScreenStrip";
import "./schedToggleDemo.css";

// mv59m6yi (12 Oct): the Instant -> Scheduled toggle, shown as Agam's own screen
// recording. Drop the file at DEMO_SRC (public/figures/scheduled/); until it exists
// the plate shows the three user-test toggle frames from Figma (a still stand-in). Muted, looping, plays while in view.
// data-exp-ok lets the full-page expand (ui/ExpandableFigure) carry the video.
// No coded replica: the real toggle's motion only exists in the recording.
export const DEMO_SRC = "/figures/scheduled/instant-to-scheduled-toggle.mp4";

// mvq1flyx-2ng7w5 (Agam, 27 Oct, "remove this section"): the six-scenario toggle plate that sat under the demo is removed.

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
        {!ok && (
          // mvq1e8mp-rvi0jp: the three user-test toggles are a phone carousel, the one ScreenStrip every section uses
          <ScreenStrip label="The three user-test toggles, scroll sideways" tiles={[
            { src: "/figures/scheduled/explored/ut01.webp", cap: "UT 01: Instant and Schedule as two cards", alt: "UT 01 dual toggle" },
            { src: "/figures/scheduled/explored/ut02.webp", cap: "UT 02: three options in one list", alt: "UT 02 three options" },
            { src: "/figures/scheduled/explored/ut03.webp", cap: "UT 03: one mini toggle with the slot in the pill", alt: "UT 03 mini toggle with per-shipment pills" },
          ]} />
        )}
      </div>
    </div>
  );
}
