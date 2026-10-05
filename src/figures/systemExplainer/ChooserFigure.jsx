import { useState } from "react";
import { SE_UNIVERSE } from "../lab/chooserData";
import "./chooserFigure.css";

// The System-Explainer CHOOSER, as an interactive figure in the kit aesthetic
// (dark vitrine, paired panels + connector, like the Extract example). Left: pick
// what KIND of move your thought makes. Right: the family's archetypes reveal, one
// staggered row at a time, the menu you pick from. The §12 universe, made operable.
export default function ChooserFigure() {
  const [sel, setSel] = useState(0);
  const fam = SE_UNIVERSE[sel];
  return (
    <div className="ds-root ds-root--away ss-chooser">
      <div className="ss-chooser__grid">

        <div className="se-panel se-panel--raw ss-chooser__left">
          <p className="se-panel__head">What kind of move is your thought?</p>
          <div className="ss-chooser__moves" role="tablist" aria-label="Kind of move">
            {SE_UNIVERSE.map((f, i) => (
              <button
                key={f.family}
                type="button"
                role="tab"
                aria-selected={i === sel}
                className={`ss-chooser__move${i === sel ? " is-on" : ""}`}
                onClick={() => setSel(i)}
              >
                <span className="ss-chooser__move-count">{f.archetypes.length}</span>
                <span className="ss-chooser__move-name">{f.family}</span>
                <span className="ss-chooser__move-gist">{f.gist}</span>
              </button>
            ))}
          </div>
        </div>

        <span className="se-connector ss-chooser__conn" aria-hidden />

        <div className="se-panel se-panel--built ss-chooser__right">
          <p className="se-panel__head">Reach for one of these</p>
          <div className="ss-chooser__arch" key={sel}>
            {fam.archetypes.map((a, i) => (
              <div key={a.n} className="ss-chooser__row" style={{ animationDelay: `${i * 45}ms` }}>
                <div className="ss-chooser__row-top">
                  <span className="ss-chooser__row-name">{a.n}</span>
                  <span className={`ss-chooser__tag ss-chooser__tag--${a.status}`}>{a.status}</span>
                </div>
                <p className="ss-chooser__shape">When your thought is: {a.shape}</p>
                <p className="ss-chooser__viz">Renders as: {a.viz}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
