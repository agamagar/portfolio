import { DECK_PRESETS } from "./deckPresetsData";
import "./deckPresets.css";

// Lab showcase: every present-mode deck preset + base asset, as a viewable specimen.
// Each specimen reuses the real deck classes (index.css) inside a zoomed mini-stage.
export default function DeckPresets() {
  return (
    <section className="dp-wrap" style={{ "--accent": "#6B21D9" }}>
      <header className="dp-intro">
        <h2 className="dp-title">Deck presets &amp; base assets</h2>
        <p className="dp-sub">
          Every present-mode composition and base asset, rendered in the site's own skin.
          Structure borrowed from Diagram (2022), Smith &amp; Diction (2023), and Andreas Maris
          (2025); pick one per slide with a <code>frame</code> field.
        </p>
      </header>
      <div className="dp-grid">
        {DECK_PRESETS.map((p) => (
          <figure className="dp-card" key={p.name}>
            <figcaption className="dp-head">
              <span className="dp-label">{p.label}</span>
              {p.frame ? <code className="dp-frame">frame: "{p.frame}"</code> : null}
              <span className="dp-blurb">{p.blurb}</span>
            </figcaption>
            <div className="dp-stageWrap">
              <div className="dp-stage" dangerouslySetInnerHTML={{ __html: p.html }} />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
