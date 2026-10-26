import "./scheduled.css";
import PhoneFrame from "../ds/IphoneFrame"; // the one phone frame; a screen the coded prototype draws runs live in it

// A horizontal strip of full-size screens that scroll and snap one at a time, each with its caption. Nothing animates on
// its own: the reader drives it. First the slot-page states (mukxrqfz, 28 Sep); shared since 26 Oct with the
// broken-promise screens. tiles: [{ src: "/figures/...", cap, alt? }]; label names the region for screen readers.
export default function ScreenStrip({ tiles, label }) {
  return (
    <div className="sdh" role="region" aria-label={label} tabIndex={0}>
      {tiles.map((t) => (
        <figure className="sdh__tile" key={t.src}>
          <PhoneFrame screen={t.src} alt={t.alt || t.cap} size="lg" interactive={false} enter={false} />
          <figcaption className="sdh__cap">{t.cap}</figcaption>
        </figure>
      ))}
    </div>
  );
}
