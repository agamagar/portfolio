// ThreeLinesIcon · one glyph of the three-stroke icon system, morph-animated.
// Every icon is exactly three strokes; a stroke is a straight segment or a
// closed ellipse. Both are resampled to the same SAMPLES points, so every
// morph is clean point-for-point interpolation (a menu bar unrolls into a
// head circle with no correspondence solving).
//
// Rules doc: THREE_LINES_SYSTEM.md (this folder). Two that shape this file:
//
// ROTATION GROUPS: when the previous icon and the next icon are the same
// glyph at different orientations (`rot.group` matches), the morph is a
// rigid rotate of the whole <g> about the box center, not an endpoint lerp;
// lerping two orientations of one shape bends strokes that should just
// turn. The rotation only runs from a SETTLED glyph; a retarget mid-flight
// bakes the partial rotation into the points and falls back to the point
// morph, so interrupts stay continuous either way.
//
// IMPERATIVE DRIVE: Motion's SVG components do not animate geometry
// attributes (x1/y1/x2/y2 froze silently in v1), so strokes are driven with
// standalone animate() springs writing setAttribute('d'). The JSX renders
// the paths WITHOUT a d prop so a React re-render can never snap a morph
// back mid-flight; useLayoutEffect parks the mount state before first paint.

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate } from "motion/react";
import { useReducedMotion, spring } from "../ds/hooks";
import {
  VIEWBOX,
  STROKE,
  samplePoints,
  pathD,
  rotatePoints,
  shortestDelta,
} from "./threeLinesData";

export default function ThreeLinesIcon({
  icon,
  size = 24,
  strokeWidth = STROKE,
  stagger = 0.045,
  enterFrom, // optional icon def to mount parked on, then bloom into `icon`
  enterDelay = 0, // extra delay for that entrance morph (per-tile waves)
  className,
}) {
  const reduce = useReducedMotion();
  const gEl = useRef(null);
  const pathEls = useRef([]);
  const points = useRef(null); // currently rendered points, 3 x SAMPLES x [x,y]
  const anims = useRef([]);
  const liveAngle = useRef(0); // rotation currently applied as a transform
  const lastTarget = useRef(null); // icon def we last targeted
  const settled = useRef(true); // true once the last morph fully landed
  const runToken = useRef(0);

  useLayoutEffect(() => {
    const apply = (i, pts) => {
      const el = pathEls.current[i];
      if (el) el.setAttribute("d", pathD(pts));
    };

    const park = (targetIcon) => {
      points.current = targetIcon.lines.map((s) => samplePoints(s));
      points.current.forEach((pts, i) => apply(i, pts));
    };

    const goTo = (targetIcon, baseDelay) => {
      const token = ++runToken.current;
      anims.current.forEach((a) => a?.stop());

      // bake any partial rotation into the points so every start is plain
      if (liveAngle.current !== 0) {
        points.current = points.current.map((pts) =>
          rotatePoints(pts, liveAngle.current),
        );
        points.current.forEach((pts, i) => apply(i, pts));
        liveAngle.current = 0;
        gEl.current?.removeAttribute("transform");
      }

      const from = lastTarget.current;
      const canRotate =
        settled.current &&
        !reduce &&
        from?.rot &&
        targetIcon.rot &&
        from.rot.group === targetIcon.rot.group &&
        from !== targetIcon;

      lastTarget.current = targetIcon;
      settled.current = false;

      if (reduce) {
        park(targetIcon);
        settled.current = true;
        return;
      }

      if (canRotate) {
        const delta = shortestDelta(from.rot.angle, targetIcon.rot.angle);
        anims.current = [
          animate(0, 1, {
            ...spring("throw"),
            delay: baseDelay,
            onUpdate: (v) => {
              liveAngle.current = delta * v;
              gEl.current?.setAttribute(
                "transform",
                `rotate(${delta * v} ${VIEWBOX / 2} ${VIEWBOX / 2})`,
              );
            },
            onComplete: () => {
              if (runToken.current !== token) return;
              liveAngle.current = 0;
              gEl.current?.removeAttribute("transform");
              park(targetIcon); // same glyph, own slot order; invisible swap
              settled.current = true;
            },
          }),
        ];
        return;
      }

      let landed = 0;
      anims.current = targetIcon.lines.map((stroke, i) => {
        const start = points.current[i].map((p) => [...p]);
        const to = samplePoints(stroke);
        return animate(0, 1, {
          ...spring("throw"),
          delay: baseDelay + i * stagger,
          onUpdate: (v) => {
            const pts = start.map((p, k) => [
              p[0] + (to[k][0] - p[0]) * v,
              p[1] + (to[k][1] - p[1]) * v,
            ]);
            points.current[i] = pts;
            apply(i, pts);
          },
          onComplete: () => {
            if (runToken.current !== token) return;
            landed += 1;
            if (landed === 3) settled.current = true;
          },
        });
      });
    };

    // first mount: park on enterFrom (if given) and bloom into the icon;
    // otherwise, or under reduced motion, park directly on the icon
    if (!points.current) {
      const startIcon = enterFrom && !reduce ? enterFrom : icon;
      park(startIcon);
      lastTarget.current = startIcon;
      if (startIcon !== icon) goTo(icon, enterDelay);
      return undefined;
    }

    goTo(icon, 0);
    return undefined;
  }, [icon, reduce, stagger]);

  useEffect(() => () => anims.current.forEach((a) => a?.stop()), []);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={icon.name}
    >
      <g ref={gEl}>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            ref={(el) => {
              pathEls.current[i] = el;
            }}
          />
        ))}
      </g>
    </svg>
  );
}
