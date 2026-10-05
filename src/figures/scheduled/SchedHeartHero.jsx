// Scheduled Delivery hero: the "Schedule <calendar> Delivery" lockup inside the
// layered lavender heart from Figma Portfolio 2026, node 319-45000
// (annotation mtmgr6eg, "use this here and animate it").
//
// Layers are the node's own exports (REST, scale 1, layer opacity baked in) and
// all four hearts share the frame centre, so each is placed by width alone.
// Motion (mtpb980b, 2026-09-06): the ENTRANCE is Figma's own timeline, read
// with get_motion_context on 319:45000 (cohort 6.99s, entrance = first 12.4%
// = 0.866s, everything starts together):
//   hearts   opacity 0->1 ease [0.5,0,0.5,1] · scale 0.04->1 ease [0.42,0,0,1.007]
//   Schedule opacity 0->1 · x -40->0 (frame px) ease [0.42,0,0,0.997]
//   icon     opacity 0->1 · y -18->0
//   Delivery opacity 0->1 · x 100->0
// The per-heart opacity targets (1 / 0.3 / 1 / 0.66) are baked into the PNGs.
// Figma loops the whole thing every 7s; here it plays once (mtnwb81v) and the
// replay button remounts the layers. After the entrance the hearts keep the
// three-beat lub-dub from before (CSS). Reduced motion: the still composition.
// Widths are PNG px / 1512 (the frame width); the file is downscaled but the
// proportion is the export's.
const HEARTS = [
  { src: "heart-1.png", w: 212.2, ring: 3 },
  { src: "heart-2.png", w: 152.9, ring: 2 },
  { src: "heart-3.png", w: 82.5, ring: 1 },
  { src: "heart-4.png", w: 40.6, ring: 0 },
];
// Lockup pieces: bbox centres from the node (x of 1512, y of 982).
const LOCKUP = [
  { src: "text-schedule.png", w: 25.0, x: 29.6 },
  { src: "icon.png", w: 13.2, x: 49.9 },
  { src: "text-delivery.png", w: 21.2, x: 68.4 },
];
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Refresh as IconRefresh } from "iconoir-react";
import { useReducedMotion } from "../ds/hooks";

const BASE = "/figures/scheduled/heart/";

// Figma's entrance, verbatim: 6.99s cohort x 0.124 = 0.866s, eases as exported.
const T = 6.99 * 0.124;
const EASE_MOVE = [0.42, 0, 0, 0.997];
const EASE_SCALE = [0.42, 0, 0, 1.007];
const EASE_FADE = [0.5, 0, 0.5, 1];
// frame-px offsets from the timeline, scaled to the rendered width (1512 = 1)
const SHIFT = { "text-schedule.png": { x: -40 }, "icon.png": { y: -18 }, "text-delivery.png": { x: 100 } };

export default function SchedHeartHero() {
  // bump the key to remount the animated layers: entrance + three beats again
  const [run, setRun] = useState(0);
  const reduce = useReducedMotion();
  const root = useRef(null);
  const [k, setK] = useState(816 / 1512);
  useEffect(() => {
    const el = root.current; if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / 1512));
    ro.observe(el); setK(el.clientWidth / 1512);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="shh" aria-label="Schedule Delivery" ref={root}>
      <div className="shh__layers" key={run}>
        {HEARTS.map((h) => (
          <div key={h.src} className="shh__ring" style={{ "--w": h.w + "%", "--ring": h.ring }}>
            <motion.img
              src={BASE + h.src} alt="" draggable="false"
              initial={reduce ? false : { opacity: 0, scale: 0.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ opacity: { duration: T, ease: EASE_FADE }, scale: { duration: T, ease: EASE_SCALE } }}
            />
          </div>
        ))}
        <div className="shh__lockup">
          {LOCKUP.map((p) => {
            const sh = SHIFT[p.src] || {};
            const from = { opacity: 0, x: (sh.x || 0) * k, y: (sh.y || 0) * k };
            return (
              <div key={p.src} className="shh__piece" style={{ "--w": p.w + "%", "--x": p.x + "%" }}>
                <motion.img
                  src={BASE + p.src} alt="" draggable="false"
                  initial={reduce ? false : from}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: T, ease: EASE_MOVE }}
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* mtnwb81v: replay, bottom right, the video hero's button */}
      <button type="button" className="article__hero-replay" aria-label="Replay the header animation"
        onClick={() => setRun((r) => r + 1)}>
        <IconRefresh width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}
