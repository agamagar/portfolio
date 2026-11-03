import { useRef } from "react";
import "./scheduled.css";
import PhoneFrame, { LiveScreen, usePhoneRise } from "../ds/IphoneFrame"; // the one phone frame, its live screen and its entrance

// THE phone row for the whole case study (Agam, 27 Oct, "make this a template and use it across the page"): a row of the
// shared PhoneFrame, one size, scrolling and snapping sideways, each phone with an optional status chip and one line.
// Nothing plays on its own: the reader drives it. The row's phones rise together once (usePhoneRise), and a running screen
// loads the one way every phone on the page does (LiveScreen). Optional heading above and a verdict below, for a comparison.
//   tiles: [{ src, cap, alt?, tag?, tagTone?, id?, tall?, live? }]   live: { pg, case, still? }, a built flow running in the phone   label: names the region for screen readers
//   title: a heading over the row   verdict: { lead, note }, a bold lead and a line under it
//   id: the gate id (data-gate-id, for schedule-verify)   tall: a scrolled page, it scrolls inside the phone's screen
//   size: "board" (the wide cart-header boards) or "bar" (one header, 336 by 56): bare images, not phones
// Used by the slot states, the broken-promise screens, the toggle prototypes, every explored-vs-chosen comparison,
// the finals and the wired flows.
export default function ScreenStrip({ tiles, label, title, verdict, size, className = "" }) {
  const bare = size === "board" || size === "bar";
  const root = useRef(null);
  usePhoneRise(root, [tiles.length]);
  return (
    <figure ref={root} className={"sdrow " + className}>
      {title && <p className="sdrow__title">{title}</p>}
      <div className="sdh" data-size={size} data-many={bare || tiles.length > 4 ? "" : undefined} style={{ "--n": tiles.length }} role="region" aria-label={label || title} tabIndex={0}>
        {tiles.map((t) => (
          <div className="sdh__tile" key={t.key || t.src} data-gate-id={t.id} data-tall={t.tall || undefined}>
            {bare ? (
              <>
                <img src={t.src} alt={t.alt || t.cap} draggable={false} loading="lazy" />
                <p className="sdh__cap">{t.cap}</p>
              </>
            ) : t.live ? (
              <PhoneFrame alt={t.alt || t.cap} size="lg" tag={t.tag} tagTone={t.tagTone} caption={t.cap} interactive={false} enter={false} shadow="sm">
                <LiveScreen pg={t.live.pg} caseId={t.live.case} still={t.live.still} alt={t.alt || t.cap} />
              </PhoneFrame>
            ) : t.tall ? (
              <PhoneFrame alt={t.alt || t.cap} size="lg" tag={t.tag} tagTone={t.tagTone} caption={t.cap} interactive={false} enter={false} shadow="sm">
                <div className="sdh__scroll" tabIndex={0} aria-label={`${t.cap}, scroll down`}>
                  <img src={t.src} alt={t.alt || t.cap} draggable={false} loading="lazy" />
                </div>
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
