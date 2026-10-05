import { useEffect, useMemo, useState } from "react";
import { ACTIONS, GRID_W, GRID_H } from "./pixelMascotData";

// One animated pixel mascot. Stepped animation: a timer flips a frame index at the
// action's fps and each frame renders as crisp-edge rects. No tweening anywhere, so
// it can never look "smooth 3D" (the guide's cardinal sin for sprites).
// Reduced motion parks on the first frame.
export default function PixelMascot({
  action = "idle",
  size = 160,
  playing = true,
  // ink defaults to currentColor so the mascot is theme-aware like every site figure
  ink = "currentColor",
  accent = "var(--mascot-accent, #d96b3f)",
  speed = 1,
}) {
  const def = ACTIONS[action] || ACTIONS.idle;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (!playing) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ms = 1000 / (def.fps * speed);
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % def.frames.length);
    }, ms);
    return () => clearInterval(id);
  }, [def, playing, speed]);

  const grid = def.frames[frame % def.frames.length];

  // Memo the rect list per grid string (frames repeat, so identity is stable-ish).
  const cells = useMemo(() => {
    const out = [];
    grid.forEach((row, y) => {
      for (let x = 0; x < row.length; x += 1) {
        const ch = row[x];
        if (ch === ".") continue;
        out.push({ x, y, accent: ch === "o" });
      }
    });
    return out;
  }, [grid]);

  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      width={size}
      height={(size * GRID_H) / GRID_W}
      shapeRendering="crispEdges"
      aria-hidden
      style={{ display: "block" }}
    >
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width="1" height="1" fill={c.accent ? accent : ink} />
      ))}
    </svg>
  );
}
