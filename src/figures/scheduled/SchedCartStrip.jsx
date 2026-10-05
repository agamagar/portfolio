import "./scheduled.css";

// mukxwvur (28 Sep): "instead of this, a horizontal auto scroll", from Figma
// HBBgHT1u7e5jsz7BEEZ3fT 289:8839 (2x): the cart's shipment header in every
// state it can land in, each card cropped out of the frame and corner-masked.
// A marquee: the list is drawn twice and slides by exactly one copy, so the
// loop is seamless. It pauses under the pointer or keyboard focus, and with
// reduced motion it stops and becomes a plain sideways scroll.
const CARDS = [
  ["schedulable", "Schedule available", "Schedule for later: instant delivery is unavailable"],
  ["arriving-today", "Scheduled for today", "Arriving today, 4 to 5 PM, shipment scheduled, with Edit"],
  ["arriving-tomorrow", "Scheduled for tomorrow", "Arriving tomorrow, 4 to 5 PM, shipment scheduled, with Edit"],
  ["store-closed", "Store closed", "Store re-opens at 6 AM: add to cart now and place order later"],
  ["stand-still", "Paused for weather", "Deliveries paused due to rain: we'll resume as soon as conditions improve"],
  ["not-taking-orders", "Store not taking orders", "High demand right now: back soon in 15 minutes"],
  ["order-limit", "Order limit reached", "You have 2 active orders: place a new order after delivery"],
  ["weight-limit", "Weight limit exceeded", "Weight limit exceeded: reduce weight by 2 kg to check out"],
  ["default", "Default", "High demand right now: please try again in some time"],
];

const Card = ({ k, label, alt, hidden }) => (
  <figure className="cstrip__card" aria-hidden={hidden || undefined}>
    <img src={`/figures/scheduled/cart-states-strip/${k}.webp`} alt={hidden ? "" : alt} draggable={false} />
    <figcaption className="cstrip__cap">{label}</figcaption>
  </figure>
);

export default function SchedCartStrip() {
  return (
    <div className="cstrip" role="region" aria-label="Every state the cart's shipment header can land in" tabIndex={0}>
      <div className="cstrip__track">
        {CARDS.map(([k, label, alt]) => <Card key={k} k={k} label={label} alt={alt} />)}
        {CARDS.map(([k, label, alt]) => <Card key={`${k}-2`} k={k} label={label} alt={alt} hidden />)}
      </div>
    </div>
  );
}
