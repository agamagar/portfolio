// MorphFace — the avatar on the site's index page.
//
// EXTRACTED from App.jsx so /hello can run the identical sequence instead of a
// copy of it. There is one implementation and both pages import it; if the
// timing changes here it changes in both places, which is the only way "the same
// animation as the index page" stays true a month from now.
//
// The sequence, for reference, because two other files depend on its shape:
//   0 - 250ms      turn out   (state 1 -> state 2, cosine ease)
//   250 - 3100ms   hold       (the CSS `header-wave` hand runs 500 - 3100ms)
//   3100 - 3450ms  turn back  (state 2 -> state 1)
// Exported as MORPH_SEQUENCE below so a caller can choreograph against it
// without re-deriving the numbers.

import { useLayoutEffect, useRef } from "react";
import { FACE_VIEWBOX, FACE_COLOR, FACE_PATHS, FACE_EXTRA, FACE_EYES } from "./faceMorph";

export const MORPH_SEQUENCE = {
  turnOut: 250,
  waveStart: 500,
  waveDuration: 2600,
  holdEnd: 3100, // == waveStart + waveDuration
  turnBack: 350,
  total: 3450, // holdEnd + turnBack
};

// The avatar drawn as live vector paths so it morphs point-for-point from face
// state 1 to state 2 as the wave comes in. The head silhouette (two subpaths: the
// outline + the hole) is resampled to evenly-spaced points and interpolated; the
// feature lines morph by pure coordinate interpolation; the eyes slide. No crossfade.
const FACE_HEAD = FACE_PATHS.find((p) => p.kind === "fill");
const FACE_FEATURES = FACE_PATHS.filter((p) => p.kind === "stroke");
// The state-2-only brow collapsed to its first point (its resting / state-1 look).
const FACE_EXTRA_REST = FACE_EXTRA.map((p) => {
  const n = (p.d.match(/-?\d*\.?\d+/g) || []).map(Number);
  let i = 0;
  return p.d.replace(/-?\d*\.?\d+/g, () => {
    const v = i % 2 === 0 ? n[0] : n[1];
    i += 1;
    return v.toFixed(2);
  });
});

export default function MorphFace() {
  const featRefs = useRef([]);
  const eyeRefs = useRef([]);
  const headRef = useRef(null);
  const extraRef = useRef(null);
  const groupRef = useRef(null);

  // Layout effect so the start state (t=0) is painted before the first frame, and
  // the resting DOM ends at state 2 to match the JSX (no revert to state 1 on re-render).
  useLayoutEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const nums = (d) => (d.match(/-?\d*\.?\d+/g) || []).map(Number);

    // Resample the head subpaths to even point counts so they interpolate cleanly.
    const N = 96;
    let head = null;
    // Horizontal-centre shift from state 1 to state 2. The group is translated by
    // dx*(1-t) so states 1 and 3 sit at state 2's horizontal position and the
    // illustration morphs in place instead of sliding right-to-left.
    let dx = 0;
    try {
      const ns = "http://www.w3.org/2000/svg";
      const hsvg = document.createElementNS(ns, "svg");
      hsvg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
      const tmp = document.createElementNS(ns, "path");
      hsvg.appendChild(tmp);
      document.body.appendChild(hsvg);
      const sampleSub = (sub) => {
        tmp.setAttribute("d", sub);
        const len = tmp.getTotalLength() || 1;
        const pts = [];
        for (let i = 0; i <= N; i += 1) {
          const p = tmp.getPointAtLength((len * i) / N);
          pts.push([p.x, p.y]);
        }
        return pts;
      };
      const subs = (d) => d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
      const s1 = subs(FACE_HEAD.d1);
      const s2 = subs(FACE_HEAD.d2);
      head = s1.map((sub, i) => ({ a: sampleSub(sub), b: sampleSub(s2[i] || sub) }));
      // Centre of the head silhouette in each state, to cancel the lateral drift.
      tmp.setAttribute("d", FACE_HEAD.d1);
      const b1 = tmp.getBBox();
      tmp.setAttribute("d", FACE_HEAD.d2);
      const b2 = tmp.getBBox();
      dx = b2.x + b2.width / 2 - (b1.x + b1.width / 2);
      document.body.removeChild(hsvg);
    } catch (e) {
      head = null;
    }
    const headD = (t) =>
      head
        .map(
          (s) =>
            "M" +
            s.a
              .map(([x, y], k) => `${lerp(x, s.b[k][0], t).toFixed(2)} ${lerp(y, s.b[k][1], t).toFixed(2)}`)
              .join("L") +
            "Z"
        )
        .join(" ");

    const feats = FACE_FEATURES.map((p) => ({ tmpl: p.d1, n1: nums(p.d1), n2: nums(p.d2) }));
    // The state-2-only brow line grows in from its first point (no opacity fade).
    const extras = FACE_EXTRA.map((p) => {
      const n2 = nums(p.d);
      return { tmpl: p.d, n1: n2.map((v, i) => (i % 2 === 0 ? n2[0] : n2[1])), n2 };
    });
    const buildD = (f, t) => {
      let i = 0;
      return f.tmpl.replace(/-?\d*\.?\d+/g, () => {
        const v = lerp(f.n1[i], f.n2[i], t);
        i += 1;
        return v.toFixed(2);
      });
    };
    const render = (t) => {
      if (groupRef.current)
        groupRef.current.setAttribute("transform", `translate(${(dx * (1 - t)).toFixed(2)} 0)`);
      if (head && headRef.current) headRef.current.setAttribute("d", headD(t));
      feats.forEach((f, i) => {
        const el = featRefs.current[i];
        if (el) el.setAttribute("d", buildD(f, t));
      });
      FACE_EYES.forEach((e, i) => {
        const el = eyeRefs.current[i];
        if (el) {
          el.setAttribute("cx", lerp(e.cx1, e.cx2, t).toFixed(2));
          el.setAttribute("cy", lerp(e.cy1, e.cy2, t).toFixed(2));
        }
      });
      if (extraRef.current && extras[0]) extraRef.current.setAttribute("d", buildD(extras[0], t));
    };

    render(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // stays at state 1
    }
    // Timeline (starts with the wave at 500ms): turn to state 2, hold there until
    // the wave finishes (wave is 2600ms long), then turn back to state 1.
    const delay = 0;
    const durOut = 250; // turn-out, 2x faster
    const durBack = 350; // turn-back, 2x faster
    const holdEnd = 3100;
    const totalEnd = holdEnd + durBack;
    const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);
    let raf = 0,
      start = 0;
    const timer = setTimeout(() => {
      const step = (now) => {
        if (!start) start = now;
        const e = now - start;
        let p;
        if (e < durOut) p = ease(e / durOut);
        else if (e < holdEnd) p = 1;
        else if (e < totalEnd) p = 1 - ease((e - holdEnd) / durBack);
        else p = 0;
        render(p);
        if (e < totalEnd) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg className="header__avatar" viewBox={FACE_VIEWBOX} preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden>
      <g ref={groupRef}>
        {FACE_HEAD && <path ref={headRef} d={FACE_HEAD.d1} fill={FACE_COLOR} />}
        {FACE_FEATURES.map((p, i) => (
          <path
            key={p.id}
            ref={(el) => (featRefs.current[i] = el)}
            d={p.d1}
            fill="none"
            stroke={FACE_COLOR}
            strokeWidth={p.sw || undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {FACE_EXTRA.map((p, i) => (
          <path
            key={"x" + i}
            ref={extraRef}
            d={FACE_EXTRA_REST[i]}
            fill="none"
            stroke={FACE_COLOR}
            strokeWidth={p.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {FACE_EYES.map((e, i) => (
          <circle key={"e" + i} ref={(el) => (eyeRefs.current[i] = el)} cx={e.cx1} cy={e.cy1} r={e.r} fill={FACE_COLOR} />
        ))}
      </g>
    </svg>
  );
}

// The greeting assets that pop up beside the avatar, cycled on each replay.
