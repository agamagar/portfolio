import { useState } from "react";
import { HANDS, HAND_INK, HAND_PAPER, HAND_STROKE_W, HAND_VIEWBOX } from "./handsData";
import "./handsSheet.css";

// Lab showcase: the 25-pose doodle hand set as hand-coded SVG. Each tile is an
// ink-on-paper plate (self-contained palette, like the dark figure vitrines);
// clicking a tile copies that hand's standalone SVG markup for Figma or code.
function svgMarkup(hand) {
  const paths = hand.paths
    .map(
      (p) =>
        `  <path d="${p.d}" fill="${p.fill ? HAND_PAPER : "none"}" stroke="${HAND_INK}" stroke-width="${HAND_STROKE_W}" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${HAND_VIEWBOX}" width="240" height="240">\n${paths}\n</svg>`;
}

export default function HandsSheet() {
  const [copied, setCopied] = useState(null);

  const copy = (hand) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(svgMarkup(hand)).then(() => {
      setCopied(hand.cell);
      window.setTimeout(
        () => setCopied((c) => (c === hand.cell ? null : c)),
        1400
      );
    });
  };

  return (
    <section className="hs-wrap">
      <header className="hs-intro">
        <h2 className="hs-title">Doodle hands</h2>
        <p className="hs-sub">
          The 25-pose hand set from the prompt library's Doodle hands group,
          rebuilt as hand-coded SVG, then tuned against the reference sheet in a
          render-compare-fix loop. Click a tile to copy that hand's standalone SVG.
        </p>
        <ul className="hs-rules" aria-label="Construction rules">
          <li>
            <span className="hs-rule-k">Line</span> one #1A1A1A stroke, width 3,
            round caps, flat white fill. No colour or shading.
          </li>
          <li>
            <span className="hs-rule-k">Digits</span> exactly four: three fingers
            plus a thumb. Never five.
          </li>
          <li>
            <span className="hs-rule-k">Build</span> palm blob first, then finger
            sausages on top; their white fill knocks out the palm line to draw the
            overlap seam.
          </li>
          <li>
            <span className="hs-rule-k">Wrist</span> left open, contour lines run
            off the frame. No closed stump or cuff.
          </li>
          <li>
            <span className="hs-rule-k">Feel</span> puffy and springy, bulbous
            fingertips, slightly asymmetric. Never a clean vector icon.
          </li>
        </ul>
      </header>
      <div className="hs-grid">
        {HANDS.map((hand) => (
          <figure className="hs-card" key={hand.cell}>
            <button
              type="button"
              className="hs-plate"
              onClick={() => copy(hand)}
              aria-label={`Copy the ${hand.name} SVG`}
            >
              <svg
                viewBox={HAND_VIEWBOX}
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={hand.name}
              >
                {hand.paths.map((p, i) => (
                  <path key={i} d={p.d} fill={p.fill ? HAND_PAPER : "none"} />
                ))}
              </svg>
              <span
                className={"hs-copied" + (copied === hand.cell ? " is-on" : "")}
                aria-hidden="true"
              >
                Copied
              </span>
            </button>
            <figcaption className="hs-cap">
              <span className="hs-cell">{hand.cell}</span> {hand.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
