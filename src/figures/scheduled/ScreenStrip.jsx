import "./scheduled.css";
import PhoneFrame from "../ds/IphoneFrame";
import FigmaEmbed from "../../ui/FigmaEmbed"; // the one phone frame; a screen the coded prototype draws runs live in it

// THE phone row for the whole case study (Agam, 27 Oct, "make this a template and use it across the page"): a row of the
// shared PhoneFrame, one size, scrolling and snapping sideways, each phone with an optional status chip and one line.
// Nothing animates on its own: the reader drives it. Optional heading above and a verdict below, for a comparison.
//   tiles: [{ src, cap, alt?, tag?, tagTone? }]   label: names the region for screen readers
//   title: a heading over the row   verdict: { lead, note }, a bold lead and a line under it
// Used by the slot states, the broken-promise screens, the toggle prototypes and every explored-vs-chosen comparison.
export default function ScreenStrip({ tiles, label, title, verdict, className = "" }) {
  return (
    <figure className={"sdrow " + className}>
      {title && <p className="sdrow__title">{title}</p>}
      <div className="sdh" data-many={tiles.length > 4 ? "" : undefined} style={{ "--n": tiles.length }} role="region" aria-label={label || title} tabIndex={0}>
        {tiles.map((t) => (
          <div className="sdh__tile" key={t.key || t.src}>
            {t.live ? (
              <PhoneFrame alt={t.alt || t.cap} size="lg" tag={t.tag} tagTone={t.tagTone} caption={t.cap} interactive={false} enter={false} shadow="sm">
                <FigmaEmbed mode="proto" playground={t.live.pg} caseId={t.live.case} title={t.alt || t.cap} alt={t.alt || t.cap} badge={false} />
              </PhoneFrame>
            ) : (
              <PhoneFrame screen={t.src} alt={t.alt || t.cap} size="lg" tag={t.tag} tagTone={t.tagTone} caption={t.cap} interactive={false} enter={false} shadow="sm" />
            )}
          </div>
        ))}
      </div>
      {verdict && <figcaption className="sdrow__verdict"><b>{verdict.lead}</b> {verdict.note}</figcaption>}
    </figure>
  );
}
