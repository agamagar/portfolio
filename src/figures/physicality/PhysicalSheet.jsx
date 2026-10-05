import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useReducedMotion, useInViewLoop, spring } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import "./physicalSheet.css";

// First instance of the PHYSICALITY & INTERRUPTIBILITY layer (base-layer §14, the
// Devouring Details layer). Unlike the replay-only case figures, this specimen is a
// real object you can grab: it demonstrates the four headline tells live.
//   - Origin:        enters from its own edge (transform-origin bottom, spring "bloom")
//   - 1:1 tracking:  follows the pointer exactly while held (drag, no threshold)
//   - Momentum:      a flick throws it, the release velocity is carried (spring "throw")
//   - Interruptible: catch it mid-dismiss and drag it back (drag cancels the animation)
// Reduced motion parks it open with drag disabled. The specimen self-heals (re-enters
// a beat after dismissal) so it stays reusable without a reload.

const SLOTS = [
  { t: "6:00 – 6:30 AM", note: "Early morning" },
  { t: "7:00 – 7:30 AM", note: "Before work" },
  { t: "9:00 – 9:30 AM", note: "Most picked", hot: true },
  { t: "12:00 – 12:30 PM", note: "Lunch" },
];

export default function PhysicalSheet() {
  const reduce = useReducedMotion();
  const y = useMotionValue(0);
  const sheetRef = useRef(null);
  const reopenTimer = useRef(null);
  const [H, setH] = useState(320);
  const [held, setHeld] = useState(false);

  // Scrim dims with the sheet: fully open -> 0.44, fully gone -> 0.
  const scrim = useTransform(y, [0, H], [0.44, 0]);

  useLayoutEffect(() => {
    if (sheetRef.current) setH(sheetRef.current.offsetHeight);
  }, []);

  const clearReopen = () => {
    if (reopenTimer.current) { clearTimeout(reopenTimer.current); reopenTimer.current = null; }
  };
  useEffect(() => () => clearReopen(), []);

  const reopen = () => {
    clearReopen();
    y.set(H);                      // start below the edge...
    animate(y, 0, spring("bloom")); // ...and rise from it (origin)
  };

  const dismiss = (velocity = 0) => {
    animate(y, H, spring("throw", { velocity })); // momentum carried from the release
    clearReopen();
    reopenTimer.current = setTimeout(reopen, 1500); // self-heal so the specimen is reusable
  };

  // Entrance from the edge when scrolled into view; replays on re-enter. Under
  // reduced motion the observer never runs and the sheet stays parked open.
  const ref = useInViewLoop(!reduce, async ({ wait, alive }) => {
    clearReopen();
    y.set(H);
    animate(y, 0, spring("bloom"));
    await wait(3200);
    if (!alive()) return;
  });

  const onDragEnd = (_e, info) => {
    setHeld(false);
    const flung = info.offset.y > H * 0.4 || info.velocity.y > 600;
    if (flung) dismiss(info.velocity.y);
    else animate(y, 0, spring("throw", { velocity: info.velocity.y })); // springs back
  };

  return (
    <div className="ph-sheet" ref={ref}>
      <div className="ph-sheet__frame">
        <PhoneWindow time="9:41" title="Schedule delivery" className="ph-sheet__phone">
          <div className="ph-sheet__bg" aria-hidden>
            <span className="ph-sheet__bgline" style={{ width: "58%" }} />
            <span className="ph-sheet__bgline" style={{ width: "82%" }} />
            <span className="ph-sheet__bgline" style={{ width: "68%" }} />
            <span className="ph-sheet__bgcta" />
          </div>

          <motion.div
            className="ph-sheet__scrim"
            style={{ opacity: reduce ? 0.44 : scrim }}
            onClick={reduce ? undefined : () => dismiss(0)}
            aria-hidden
          />

          <motion.div
            className={`ph-sheet__sheet${held ? " is-held" : ""}`}
            ref={sheetRef}
            style={{ y }}
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: H }}
            dragElastic={{ top: 0.16, bottom: 0.9 }}
            dragMomentum={false}
            onDragStart={() => { setHeld(true); clearReopen(); }}
            onDragEnd={onDragEnd}
            role="dialog"
            aria-label="Pick a delivery slot. Draggable: flick down to dismiss."
          >
            <span className="ph-sheet__grab" aria-hidden />
            <div className="ph-sheet__head">
              <span className="ph-sheet__title">Pick a slot</span>
              <span className="ph-sheet__hint">drag down to dismiss</span>
            </div>
            <div className="ph-sheet__slots">
              {SLOTS.map((s, i) => (
                <button key={i} type="button" className={`ph-sheet__slot${s.hot ? " is-hot" : ""}`}>
                  <span className="ph-sheet__slott">{s.t}</span>
                  <span className="ph-sheet__slotn">{s.note}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </PhoneWindow>
      </div>

      <div className="ph-sheet__legend">
        <span className="ph-sheet__tell"><b>Origin.</b> enters from its own edge</span>
        <span className="ph-sheet__tell"><b>1:1.</b> tracks the finger while held</span>
        <span className="ph-sheet__tell"><b>Momentum.</b> a flick throws it, velocity carried</span>
        <span className="ph-sheet__tell"><b>Interruptible.</b> catch it mid-dismiss, drag it back</span>
      </div>
    </div>
  );
}
