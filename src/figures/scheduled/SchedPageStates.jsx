import ScreenStrip from "./ScreenStrip";

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
  { src: "sched-pg-otp.png", cap: "Pickup OTP, for an exchange" }, // 26 Oct: the still is an exchange pickup OTP (OT-001), not a scheduled delivery's
];

// mukxrqfz (28 Sep): "make this into a horizontal scroll, the bigger images". The fitted contact sheet (every screen
// shrunk to fit one frame) became a horizontal strip of full-size screens (ScreenStrip).
export default function SchedPageStates() {
  return <ScreenStrip label="Slot-page states, scroll sideways" tiles={TILES.map((t) => ({ ...t, src: `/figures/scheduled/${t.src}` }))} />;
}
