// SpeakerThread: who's talking, read from the material alone. A sample thread on the dark ground the second rule names:
// your bubble in neutral glass, Stella as plain text beside its orb, and each person in glass of their own hue, the same hue as
// their avatar. A bubble is one flat tint, the fill and the blur being the whole surface; only the tiles beside it are gradients.
//   thread  [{ who: "you" | "stella" | "joined" | "person", t, hue?, role? }]
//   alt     the picture in words, for a screen reader
import { CaseFigure } from "./CaseFigure";
import { SpeakerTiles } from "./SpeakerTiles";
import "./speakerThread.css";

const hueVar = (h) => ({ "--h": `var(--gradient-speaker-${h})` });

export function SpeakerThread({ thread, alt }) {
  return (
    <div className="dspec-spk__thread" role="img" aria-label={alt} data-gradient-mode="dark">
      {thread.map((m, i) => {
        if (m.who === "you") return <p className="dspec-spk__you" key={i}>{m.t}</p>;
        if (m.who === "stella") return <p className="dspec-spk__stella" key={i}><span className="dspec-spk__orb" />{m.t}</p>;
        if (m.who === "joined") return <p className="dspec-spk__joined" key={i} style={hueVar(m.hue)}><span className="dspec-spk__av" />{m.t}</p>;
        return (
          <div className="dspec-spk__person" key={i} style={hueVar(m.hue)}>
            <span className="dspec-spk__av" />
            <span className="dspec-spk__bubble">
              <span className="dspec-spk__role">{m.role}</span>
              {m.t}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// The second rule's figure: the thread, what each material means, and the hues in both modes.
//   spec { alt, thread, keys: [{ k, t }], hues, plates: [{ mode, label }], caption? }
export function SpeakerFigure({ spec }) {
  return (
    <CaseFigure type="speakers" caption={spec.caption}>
      <div className="dspec-spk">
        <SpeakerThread thread={spec.thread} alt={spec.alt} />
        <ul className="dspec-spk__keys">
          {spec.keys.map((k) => (
            <li key={k.k}><span className="dspec-spk__keyk">{k.k}</span>{k.t}</li>
          ))}
        </ul>
        <div className="dspec-spk__plates">
          {spec.plates.map((p) => <SpeakerTiles key={p.mode} mode={p.mode} label={p.label} hues={spec.hues} />)}
        </div>
      </div>
    </CaseFigure>
  );
}
