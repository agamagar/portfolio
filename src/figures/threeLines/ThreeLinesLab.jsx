// ThreeLinesLab (/three-lines) · the canvas for the three-stroke icon system.
// One big stage glyph cycles through the whole set (every icon is the same
// three lines rearranging themselves); the grid below holds each icon. Hover
// or focus a tile and it falls back to the menu skeleton, proving the shared
// DNA; click a tile to send it to the stage; copy grabs a standalone SVG.
// Unlisted route like /lab, /mockups, /shaders. Chrome on site tokens, ink is
// currentColor so the set reads in both themes.

import { useEffect, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import { ICONS, standaloneSvg } from "./threeLinesData";
import ThreeLinesIcon from "./ThreeLinesIcon";
import "./threeLinesLab.css";

const CYCLE_MS = 1900;

function Tile({ icon, index, active, onSelect }) {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const shown = hover ? ICONS[0] : icon; // fall back to the seed dots
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(standaloneSvg(icon)).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      },
      () => {},
    );
  };
  return (
    <figure className={`tl-tile${active ? " is-active" : ""}`}>
      <button
        type="button"
        className="tl-tile__stage"
        onClick={onSelect}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        title={`Show ${icon.name} on the stage`}
      >
        <ThreeLinesIcon
          icon={shown}
          size={56}
          enterFrom={ICONS[0]}
          enterDelay={0.25 + index * 0.05}
        />
      </button>
      <figcaption className="tl-tile__cap">
        <span className="tl-tile__name">{icon.name}</span>
        <button type="button" className="tl-tile__copy" onClick={copy} title="Copy standalone SVG">
          {copied ? "copied" : "svg"}
        </button>
      </figcaption>
    </figure>
  );
}

export default function ThreeLinesLab({ onBack }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // auto-cycle the stage; parked entirely under reduced motion
  useEffect(() => {
    if (!playing || reduce) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % ICONS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [playing, reduce]);

  const icon = ICONS[index];
  const pick = (i) => {
    setIndex(i);
    setPlaying(false);
  };

  return (
    <div className="tl-lab">
      <header className="tl-lab__head">
        {onBack && (
          <button type="button" className="tl-lab__back" onClick={onBack}>
            Back
          </button>
        )}
        <p className="tl-lab__eyebrow">Icon system</p>
        <h1 className="tl-lab__title">Three lines</h1>
        <p className="tl-lab__sub">
          Every icon in this set is the same three strokes. They wake up as
          three dots, then rearrange into each glyph: nothing is added, nothing
          removed, so any icon can morph into any other, cleanly, every time.
        </p>
      </header>

      <section className="tl-hero" aria-label="Stage">
        <button
          type="button"
          className="tl-hero__stage"
          onClick={() => setIndex((i) => (i + 1) % ICONS.length)}
          title="Next icon"
        >
          <ThreeLinesIcon icon={icon} size={220} stagger={0.055} />
        </button>
        <div className="tl-hero__bench">
          <span className="tl-hero__name">{icon.name}</span>
          <button
            type="button"
            className="tl-hero__playpause"
            onClick={() => setPlaying((p) => !p)}
            disabled={reduce}
            title={reduce ? "Auto-cycle is off with reduced motion" : undefined}
          >
            {playing && !reduce ? "Pause cycle" : "Play cycle"}
          </button>
        </div>
      </section>

      <section className="tl-grid" aria-label="The set">
        {ICONS.map((ic, i) => (
          <Tile key={ic.key} icon={ic} index={i} active={i === index} onSelect={() => pick(i)} />
        ))}
      </section>

      <p className="tl-lab__foot">
        Hover a tile to see it fall back to the seed dots. Click a tile to put
        it on the stage; svg copies a standalone asset.
      </p>
    </div>
  );
}
