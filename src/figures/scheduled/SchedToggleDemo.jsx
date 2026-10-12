import { useEffect, useRef, useState } from "react";
import "./schedToggleDemo.css";

// mv59m6yi (12 Oct): the Instant -> Scheduled toggle, shown as Agam's own screen
// recording. Drop the file at DEMO_SRC (public/figures/scheduled/); until it exists
// the plate shows a labelled placeholder. Muted, looping, plays while in view.
// data-exp-ok lets the full-page expand (ui/ExpandableFigure) carry the video.
// No coded replica: the real toggle's motion only exists in the recording.
export const DEMO_SRC = "/figures/scheduled/instant-to-scheduled-toggle.mp4";

export default function SchedToggleDemo() {
  const wrap = useRef(null);
  const vid = useRef(null);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const v = vid.current, w = wrap.current; if (!v || !w) return undefined;
    v.setAttribute("muted", ""); // a cloned video (the expand view) keeps it muted
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => { if (!ok) return; if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.35 });
    io.observe(w);
    return () => io.disconnect();
  }, [ok]);
  return (
    <div className="std" ref={wrap}>
      <div className="std__plate">
        <video ref={vid} className="std__video" src={DEMO_SRC} muted loop playsInline preload="metadata" data-exp-ok="" hidden={!ok}
          aria-label="The delivery mode toggle switching from Instant to Scheduled"
          onLoadedData={() => setOk(true)} onError={() => setOk(false)} />
        {!ok && (
          <div className="std__ph" role="note">
            <svg viewBox="0 0 120 240" width="120" height="240" aria-hidden="true"><rect x="3" y="3" width="114" height="234" rx="22" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.5" /></svg>
            <p style={{ color: "#33095e" }}>Demo recording goes here [CONFIRM]</p>
            <code>public{DEMO_SRC}</code>
          </div>
        )}
      </div>
    </div>
  );
}
