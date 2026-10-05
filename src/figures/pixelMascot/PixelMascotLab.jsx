// PixelMascotLab (/mascot) · playground for the pixel mascot system: the doodle
// avatar as an 8-bit sprite, adapted from the "Animated Pixel Mascot" E2E guide but
// hand-coded end to end. Stage = big mascot + action picker + speed + background
// swatches (proving the transparency the guide's chroma-key step exists to buy);
// below it, the corner-peek demo (the guide's signature placement) and per-action
// tiles with standalone-SVG copy. Unlisted route like /three-lines.

import { useEffect, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import { ACTIONS, ACTION_KEYS, MASTER, SEQUENCES, SEQUENCE_KEYS, standaloneSvg } from "./pixelMascotData";
import PixelMascot from "./PixelMascot";
import IllustratedMascot from "./IllustratedMascot";
import "./pixelMascotLab.css";

const STYLES = [
  { key: "ill", label: "Illustration" },
  { key: "pixel", label: "Pixel" },
];

const BGS = [
  { key: "paper", label: "Paper" },
  { key: "photo", label: "Photo" },
  { key: "dark", label: "Dark" },
  { key: "grid", label: "Grid" },
];

const SPEEDS = [0.5, 1, 1.5];

function ActionTile({ k, style, active, onSelect }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(standaloneSvg(ACTIONS[k].frames[0])).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      },
      () => {},
    );
  };
  return (
    <figure className={`pm-tile${active ? " is-active" : ""}`}>
      <button type="button" className="pm-tile__stage" onClick={onSelect} title={`Play ${ACTIONS[k].label}`}>
        {style === "ill" ? <IllustratedMascot action={k} size={72} /> : <PixelMascot action={k} size={84} />}
      </button>
      <figcaption className="pm-tile__cap">
        <span className="pm-tile__name">{ACTIONS[k].label}</span>
        <button type="button" className="pm-tile__copy" onClick={copy} title="Copy standalone SVG (first frame)">
          {copied ? "copied" : "svg"}
        </button>
      </figcaption>
    </figure>
  );
}

export default function PixelMascotLab({ onBack }) {
  const reduce = useReducedMotion();
  const [style, setStyle] = useState("ill");
  const [action, setAction] = useState("idle");
  // A running sequence steps `action` through its chain; picking an action
  // by hand cancels it. Parked under reduced motion (no auto-switching).
  const [seq, setSeq] = useState(null);
  useEffect(() => {
    if (!seq || reduce) return undefined;
    const steps = SEQUENCES[seq].steps;
    let i = 0;
    let id;
    const advance = () => {
      setAction(steps[i].action);
      id = setTimeout(() => {
        i = (i + 1) % steps.length;
        advance();
      }, steps[i].ms);
    };
    advance();
    return () => clearTimeout(id);
  }, [seq, reduce]);
  const pickAction = (k) => {
    setSeq(null);
    setAction(k);
  };
  const [bg, setBg] = useState("paper");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  // remount key to replay the peek strip on click
  const [peekRun, setPeekRun] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyMaster = () => {
    navigator.clipboard?.writeText(standaloneSvg(MASTER)).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      },
      () => {},
    );
  };

  return (
    <div className="pm-lab">
      <header className="pm-lab__head">
        {onBack && (
          <button type="button" className="pm-lab__back" onClick={onBack}>
            Back
          </button>
        )}
        <p className="pm-lab__eyebrow">Mascot system</p>
        <h1 className="pm-lab__title">Pixel mascot</h1>
        <p className="pm-lab__sub">
          The landing-page doodle as an animated mascot, in two registers: the
          actual illustration (soft bob, blink, a popping wave) and its 8-bit
          twin (stepped 12fps frames, hard pixel grid). Both transparent by
          construction, ink follows the theme. Swap the backdrop to see them
          float on anything.
        </p>
      </header>

      <section className="pm-hero" aria-label="Stage">
        <div className={`pm-hero__stage pm-bg--${bg}`}>
          {style === "ill" ? (
            <IllustratedMascot action={action} size={200} />
          ) : (
            <PixelMascot action={action} size={240} playing={playing} speed={speed} />
          )}
        </div>
        <div className="pm-hero__bench">
          <div className="pm-hero__row" role="group" aria-label="Style">
            {STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`pm-chip${style === s.key ? " is-on" : ""}`}
                onClick={() => setStyle(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="pm-hero__row" role="group" aria-label="Action">
            {ACTION_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className={`pm-chip${action === k && !seq ? " is-on" : ""}`}
                onClick={() => pickAction(k)}
              >
                {ACTIONS[k].label}
              </button>
            ))}
            <span className="pm-hero__sep" aria-hidden />
            {SEQUENCE_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className={`pm-chip${seq === k ? " is-on" : ""}`}
                onClick={() => setSeq((s) => (s === k ? null : k))}
                disabled={reduce}
                title={reduce ? "Sequences are off with reduced motion" : `Loop: ${SEQUENCES[k].steps.map((s) => s.action).join(" > ")}`}
              >
                {SEQUENCES[k].label}
              </button>
            ))}
          </div>
          <div className="pm-hero__row" role="group" aria-label="Backdrop and speed">
            {BGS.map((b) => (
              <button
                key={b.key}
                type="button"
                className={`pm-chip pm-chip--dim${bg === b.key ? " is-on" : ""}`}
                onClick={() => setBg(b.key)}
              >
                {b.label}
              </button>
            ))}
            <span className="pm-hero__sep" aria-hidden />
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className={`pm-chip pm-chip--dim${speed === s ? " is-on" : ""}`}
                onClick={() => setSpeed(s)}
                disabled={reduce}
              >
                {s}x
              </button>
            ))}
            <span className="pm-hero__sep" aria-hidden />
            <button type="button" className="pm-chip pm-chip--dim" onClick={() => setPlaying((p) => !p)} disabled={reduce}>
              {playing && !reduce ? "Pause" : "Play"}
            </button>
            <button type="button" className="pm-chip pm-chip--dim" onClick={copyMaster}>
              {copied ? "copied" : "Copy master svg"}
            </button>
          </div>
        </div>
      </section>

      <section className="pm-peek" aria-label="Corner peek demo">
        <p className="pm-peek__label">The corner peek</p>
        <button
          type="button"
          className="pm-peek__frame"
          onClick={() => setPeekRun((r) => r + 1)}
          title="Replay the peek"
        >
          <span className="pm-peek__content" aria-hidden>
            <span className="pm-peek__line pm-peek__line--w1" />
            <span className="pm-peek__line pm-peek__line--w2" />
            <span className="pm-peek__line pm-peek__line--w3" />
          </span>
          <span className={`pm-peek__actor${reduce ? " is-parked" : ""}`} key={`${style}-${peekRun}`}>
            {style === "ill" ? <IllustratedMascot action="wave" size={80} /> : <PixelMascot action="wave" size={92} />}
          </span>
        </button>
        <p className="pm-peek__cap">
          The guide's signature move: peek in from the edge, wave, slide out.
          Kept small (about 12% of the frame) so it reads as a visitor, not the
          subject. Click the frame to replay.
        </p>
      </section>

      <section className="pm-grid" aria-label="The actions">
        {ACTION_KEYS.map((k) => (
          <ActionTile key={`${style}-${k}`} k={k} style={style} active={k === action} onSelect={() => pickAction(k)} />
        ))}
      </section>

      <p className="pm-lab__foot">
        Every frame is authored as a character grid in pixelMascotData.js: edit
        the master, and every action inherits it. New actions are a few lines of
        blits and row shifts.
      </p>
    </div>
  );
}
