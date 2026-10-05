// A cursor that goes and clicks a spot on a prototype plate (annotation
// mto4v1ka: "on this prototype add a cursor that goes and clicks the tomorrow
// tab"). The plate is a Figma embed, which cannot be driven from outside, so
// the cursor is the cue: it rests off to the side, travels to the target,
// presses (a tap ring blooms under it), holds while the prototype answers the
// viewer's own click, then returns and waits. Loops while in view; reduced
// motion shows nothing (the tab is there to be tapped either way).
// Coordinates are % of the screen cutout, the same frame as `cueBox`.
import { useRef, useState } from "react";
import { animate } from "motion/react";
import { CursorPointer as IconCursor } from "iconoir-react";
import { useInViewLoop, useReducedMotion } from "../ds/hooks";

const REST = { x: 88, y: 58 };

// onPress / onReturn (mto4ygd5): hooks for the host to drive the embed itself
// through Figma's Embed API (postMessage) at the moment the cursor presses and
// when it goes back. Without them the cursor is only the cue.
export default function PlateCursor({ target = { x: 71, y: 34.5 }, onPress, onReturn }) {
  const reduce = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [tap, setTap] = useState(0);
  const cursor = useRef(null);
  const pos = useRef(REST);

  const moveTo = (p, duration) => {
    const el = cursor.current;
    if (!el) return Promise.resolve();
    const from = pos.current;
    pos.current = p;
    return animate(
      el,
      { left: [from.x + "%", p.x + "%"], top: [from.y + "%", p.y + "%"] },
      { duration, ease: [0.38, 1.21, 0.22, 1] }, // the M3 expressive spatial curve
    ).finished;
  };

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      await wait(1100); if (!alive()) break;
      await moveTo(target, 0.85); if (!alive()) break;
      setPressed(true); setTap((t) => t + 1); onPress?.(); await wait(150); setPressed(false);
      await wait(2200); if (!alive()) break;
      await moveTo(REST, 0.9);
      onReturn?.();
      await wait(1600);
    }
  });

  if (reduce) return null;
  return (
    <span className="plate-cursor" ref={loopRef} aria-hidden="true">
      <span ref={cursor} className={"plate-cursor__arrow" + (pressed ? " is-pressed" : "")} style={{ left: REST.x + "%", top: REST.y + "%" }}>
        <IconCursor width={22} height={22} strokeWidth={1.6} />
        {tap > 0 && <i key={tap} className="plate-cursor__tap" />}
      </span>
    </span>
  );
}
