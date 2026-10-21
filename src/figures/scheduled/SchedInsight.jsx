import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRise } from "../../ui/useSectionPlay";
import "./scheduled.css";
import { uniqueSvgIds } from "../../lib/svgIds"; // mv4h4hhf: per-instance ids for the Figma exports
import { feedback, feedbackCoalesced } from "../../ui/feedback"; // muku5gig: the site sound engine (silent unless the sound toggle is on)

// muienfze (26 Sep 2026): Portfolio 2026 node 942:64899, "The key finding" beside
// "The central question", built as live text (not exports). Two equal columns,
// each an icon, a light label and the statement, sized from the 1512 frame to
// the page column (x 0.54): label 36 -> ~19px light, statement 48 -> ~26px,
// icon 64 -> ~35px, the frame's 180px top padding and 60px gaps scaled with it.
// The icons are the frame's own SVGs, painted as masks in the theme ink so they
// follow dark mode. The blocks rise in with the Context and Objective reveal.
const COLS = [
  // mujp8ifl (27 Sep): swapped, the central question now leads on the left
  { icon: "icon-question.svg", label: "The central question", lines: [["Zepto means now ", { e: "⚡" }, ". How do you promise later ", { e: "🗓️" }, " without breaking the trust ", { e: "🤝" }, " that Zepto is built on?"]] },
  { icon: "icon-finding.svg", label: "The key finding", // mujp86fb (27 Sep): one paragraph, was two lines
  lines: [["Users are fine with deliveries landing later ", { e: "🗓️" }, ". They want to finish the order ", { e: "🛒" }, " now ", { e: "⚡" }, "."]] },
];

// mujp9wpx + mujpa4jr (27 Sep): both icons DRAW ON, the lab's line-draw
// technique (the system catalog's edges): every stroke gets pathLength="1" and
// its dash offset runs 1 -> 0, one stroke after another, when the frame comes
// into view. Inlined (they were CSS masks, which cannot animate per stroke);
// the stroke is currentColor so the theme ink still applies.
export function DrawIcon({ src }) { // exported (mv5iv45e): the "Who I worked with" header uses the same draw-on icon
  const ref = useRef(null);
  const [svg, setSvg] = useState("");
  const uid = useId();
  useEffect(() => {
    let live = true;
    fetch(src).then((r) => r.text()).then((t) => {
      if (!live) return;
      let i = 0;
      setSvg(uniqueSvgIds(t, "sin" + uid).replace(/stroke="#33095E"/gi, 'stroke="currentColor"')
        .replace(/<path /g, () => `<path pathLength="1" style="--i:${i++}" `)
        .replace(/style="display: block;"/, 'style="display:block;width:100%;height:100%"'));
    });
    return () => { live = false; };
  }, [src, uid]);
  // the draw is plain CSS off the figure's section state (scheduled.css, .sin[data-sp]): it plays on the clock when
  // the figure's top reaches the viewport centre, and undraws off screen (it was scroll-linked before)
  return <span ref={ref} className="sin__icon sin__icon--draw" aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function SchedInsight() {
  const ref = useRef(null);
  useRise(ref, { lead: 100, step: 100, onPlay: (instant) => { if (!instant) feedbackCoalesced("reveal", 600); } }); // the question and the finding arrive
  return (
    <div className="sin" ref={ref}>
      {COLS.map((c) => (
        <div className="sin__col" key={c.label}>
          <DrawIcon src={`/figures/scheduled/insight/${c.icon}`} />
          <p className="sin__label" data-rise>{c.label}</p>
          <div className="sin__lines">
            {/* mujtz56p (27 Sep): static emoji as reading aids beside the key words
                (now, later, trust, the order); aria-hidden so a screen reader
                reads the sentence, not the pictographs */}
            {c.lines.map((l, i) => (
              <p className="sin__line" key={i} data-rise>
                {(Array.isArray(l) ? l : [l]).map((t, j) => (typeof t === "string" ? t : <span key={j} className="sin__aid" aria-hidden="true">{t.e}</span>))}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
