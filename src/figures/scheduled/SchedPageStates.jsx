import "./scheduled.css";

// Design Mode: the scheduled SLOT-PICKER state set as a contact sheet of real
// Zepto schedule-page screens (Schedule Order Handoff). From schedule-selected
// through the slot grid states to the no-slots and the scheduled OTP page.
// Frames verified + pulled via the Figma REST API.

const TILES = [
  { src: "sched-pg-noslot.png", cap: "Schedule selected, no slot yet" },
  { src: "sched-pg-default.png", cap: "Slot picker, default" },
  { src: "sched-pg-picked.png", cap: "Slot picked" },
  { src: "sched-pg-overview.png", cap: "Instant + scheduled mix" },
  { src: "sched-pg-partial.png", cap: "Partial day, some slots full" },
  { src: "sched-pg-crossday.png", cap: "Cross-day late night" },
  { src: "sched-pg-full.png", cap: "Tomorrow full, no slots" },
  { src: "sched-pg-otp.png", cap: "Scheduled, pickup OTP" },
];

// mukxrqfz (28 Sep): "make this into a horizontal scroll, the bigger images".
// The fitted contact sheet (every screen shrunk to fit one frame) became a
// horizontal strip of full-size screens that scroll and snap one at a time.
// Nothing animates on its own any more: the reader drives it.
export default function SchedPageStates() {
  return (
    <div className="sdh" role="region" aria-label="Slot-page states, scroll sideways" tabIndex={0}>
      {TILES.map((t) => (
        <figure className="sdh__tile" key={t.src}>
          <img src={`/figures/scheduled/${t.src}`} alt={t.cap} draggable={false} loading="lazy" />
          <figcaption className="sdh__cap">{t.cap}</figcaption>
        </figure>
      ))}
    </div>
  );
}
