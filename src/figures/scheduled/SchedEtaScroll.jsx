import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "../ds/hooks";
import "./scheduled.css";

// mukvt7cp (28 Sep): "add a box that adds a horizontal scroll ... create a
// scroll from left to right by introducing all these elements into that box."
// The eight ETA callout variants explored for an unserviceable store (Figma
// tvJ5g4PaZ0HQNHVRG4dNLo 727:93925, exported at 2x as one strip). As the box
// travels up the screen, the row glides right to left, so each callout is
// introduced in turn. Reduced motion: the row sits still and scrolls by hand.

const STRIP = "/figures/scheduled/eta-callouts.webp?v=7"; // v=7: the seven-callout strip (cache-bust)
const STRIP_W = 2468; // CSS px at 1x (the 2x export). 28 Sep: the dark third callout removed (2828 - 360)
const STRIP_H = 100;

export default function SchedEtaScroll() {
  const box = useRef(null);
  const reduce = useReducedMotion();
  const [boxW, setBoxW] = useState(686);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    setBoxW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const { scrollYProgress } = useScroll({ target: box, offset: ["start end", "end start"] });
  // enters from the right edge, ends with the last callout at the right edge
  const pad = 24;
  const x = useTransform(scrollYProgress, [0.15, 0.85], [boxW * 0.55, -(STRIP_W - boxW + pad)], { clamp: true });
  return (
    <div className={"eta-scroll" + (reduce ? " eta-scroll--still" : "")} ref={box}
      role="img" aria-label="Eight versions of the unserviceable-store callout explored, from a plain notice to 'It's raining out, schedule your order'">
      <motion.img src={STRIP} alt="" width={STRIP_W} height={STRIP_H} className="eta-scroll__row"
        style={reduce ? undefined : { x }} draggable={false} />
    </div>
  );
}
