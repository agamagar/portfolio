import { useRef, useState } from "react";
import "./xsMotion.css";

// The Figma Motion composition, as the composed video (posts/cross-sell
// animation/figma motion (no audio).mp4, 7 s, 1:1). It loops on its own; the
// cursor is the playhead while it is over the stage: pointer x maps to time,
// the loop holds, and leaving lets it run on from there. Reduced motion shows
// the poster and only moves under the cursor.
export default function XsMotion() {
  const ref = useRef(null);
  const [hold, setHold] = useState(false);
  const [t, setT] = useState(0);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const seek = (p) => {
    const v = ref.current;
    if (!v || !v.duration) return;
    const at = Math.min(v.duration - 0.05, Math.max(0, p * v.duration));
    v.currentTime = at;
    setT(at);
  };
  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const v = ref.current;
    if (v && !v.paused) v.pause();
    setHold(true);
    seek((e.clientX - r.left) / r.width);
  };
  const onLeave = () => {
    setHold(false);
    const v = ref.current;
    if (v && !reduced) v.play().catch(() => {});
  };
  const onKey = (e) => {
    const v = ref.current;
    if (!v || !v.duration) return;
    const step = e.shiftKey ? 0.5 : 0.1;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      v.pause();
      setHold(true);
      seek(((v.currentTime + (e.key === "ArrowRight" ? step : -step) + v.duration) % v.duration) / v.duration);
    } else if (e.key === " ") {
      e.preventDefault();
      if (v.paused) {
        setHold(false);
        v.play().catch(() => {});
      } else {
        setHold(true);
        v.pause();
      }
    }
  };

  return (
    <div className="xsm">
      <div
        className="xsm__stage"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onKeyDown={onKey}
        tabIndex={0}
        data-hover={hold ? "1" : "0"}
        aria-label="The cross-sell carousel stagger: designed in Figma Motion, then running on a phone from the same keyframes. Move the cursor across to scrub the sequence."
      >
        <video
          ref={ref}
          className="xsm__video"
          src="/xs/figma-motion.mp4"
          poster="/xs/figma-motion.webp"
          autoPlay={!reduced}
          loop
          muted
          playsInline
          preload="auto"
          onTimeUpdate={(e) => !hold && setT(e.currentTarget.currentTime)}
        />
        <div className="xsm__scrub" aria-hidden="true">
          <span className="xsm__scrub-fill" style={{ width: `${(t / 7) * 100}%` }} />
          <span className="xsm__scrub-t">
            {t.toFixed(2)}s{hold ? " · held" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
