import StateGallery from "./StateGallery";

// Every scheduled-page case: the slot-picker's full state set, from the default
// arrival through the empty and confirmation states. This is the dense, stateful
// page the craft went into.

const PAGE = [
  { label: "Arrive collapsed", kind: "cart", rows: [null, null], tone: "neutral", note: "You land on the shipment you came from; the rest stay collapsed but visible." },
  { label: "Instant", kind: "picker", sched: false, tone: "neutral", note: "Instant stays the default for every shipment." },
  { label: "Scheduled", kind: "picker", sched: true, sel: -1, tone: "purple", note: "The toggle reveals the slot picker inline, never a bottom sheet." },
  { label: "Slot picked", kind: "picker", sched: true, sel: 1, tone: "purple", note: "Your chosen one-hour window, held in view." },
  { label: "Today full, tomorrow open", kind: "picker", sched: true, sel: 4, dimUntil: 3, tone: "amber", note: "Today is booked out, so tomorrow's slots lead instead." },
  { label: "No slots at all", kind: "picker", sched: true, none: true, tone: "red", note: "A shipment with no slot to give, said plainly." },
  { label: "Cross-day scroll", kind: "picker", sched: true, sel: 3, tone: "purple", note: "Tonight's last slot meets tomorrow's first, one continuous scroll." },
  { label: "Partial schedule", kind: "cart", rows: ["purple", null], tone: "amber", note: "Some shipments set, some still instant, the running summary in view." },
  { label: "Scheduled OTP", kind: "otp", chip: "OTP", tone: "purple", note: "A confirmation screen tuned for an order that arrives later." },
];

export default function SchedPageStates() {
  return <StateGallery title="Scheduled page · every case" states={PAGE} />;
}
