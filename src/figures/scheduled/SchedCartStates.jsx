import StateGallery from "./StateGallery";

// Every cart-page case: the serviceability matrix across split shipments, from
// the clean all-instant cart to the worst-case four-way mix. The cart page is
// where each shipment's state resolves before scheduling.

const CART = [
  { label: "Single shipment, instant", kind: "cart", rows: [null], tone: "neutral", note: "One delivery, served now in ten minutes, no scheduling needed." },
  { label: "All instant", kind: "cart", rows: [null, null], tone: "neutral", note: "Every shipment serves now, so scheduling stays out of the way." },
  { label: "Schedule one shipment", kind: "cart", rows: ["purple", null], tone: "purple", note: "One shipment booked for a later slot, the other still instant." },
  { label: "All scheduled", kind: "cart", rows: ["purple", "purple", "purple"], tone: "purple", note: "Every shipment booked for a future window, each its own." },
  { label: "One can't be served", kind: "cart", rows: ["purple", "red"], tone: "red", note: "Part of the cart served, the rest flagged and removed on save." },
  { label: "Store closed", kind: "cart", rows: ["amber", null], tone: "amber", note: "A closed store, offered a slot for when it reopens." },
  { label: "Four-way split", kind: "cart", rows: ["purple", "purple", "red", "amber"], tone: "amber", note: "The worst case: scheduled, unavailable and closed, all at once." },
  { label: "Nothing serviceable now", kind: "note", tone: "purple", chip: "Schedule instead", note: "The prompt surfaces only when the cart can't be served now." },
  { label: "Nothing, even later", kind: "cart", rows: ["red", "red"], tone: "red", note: "Unserviceable even with a schedule, stated honestly rather than hidden." },
];

export default function SchedCartStates() {
  return <StateGallery title="Cart page · every case" states={CART} />;
}
