import "./scheduled.css";

// The whole cart page, top to bottom (mvf9leyc, 19 Oct 2026): the export laid out flat at full height, not scrolling
// inside a phone, with numbered callouts that point at its key parts. Each callout is a dot on the page, a leader line
// and a short label, alternating right and left of the page (stacked as a numbered list under it on a phone).
// Every line comes from the case study's own text on this page or from what the screen itself shows; anything the page
// does not say is marked [CONFIRM] for Agam.
const SRC = "/figures/scheduled/cart-page-full.webp"; // 720 x 7452

// y is the callout's place down the page, in % of its height (measured on the export); x is where its dot sits across it (the page's right edge for callouts on the right, its left edge for those on the left, so a dot never covers the page's text).
const CALLOUTS = [
  { y: 10.3, x: 94, t: "Unserviceable, first", d: "“3 items can’t be delivered” leads the cart. A shipment is unserviceable outright when its store is closed or out of stock for that window." },
  { y: 13.7, x: 6, t: "One shipment, its own ETA", d: "“Delivering in 19 mins” is one shipment. A mixed cart fans out by fulfilling site, up to four, and scheduling is per shipment." },
  { y: 35.8, x: 94, t: "Pharmacy orders", d: "A prescription step lives in the same cart: one of the things that make it complex before scheduling asks for room." },
  { y: 57.5, x: 6, t: "More rows than shipments", d: "Gift-bag and “ordering for someone” rows sit in the same list. [CONFIRM what each is for]" },
  { y: 71.7, x: 94, t: "The bill, and what was saved", d: "Fees, coupons and the total (“To Pay”, “Total savings”) close the scroll: the page scheduling had to fit into." },
  { y: 97.6, x: 6, t: "Where the pay button goes", d: "Pay Online and Pay on Delivery end the page. Where the pay button went on an unserviceable cart ran as two experiments." },
];

export default function SchedCartPageFlat() {
  return (
    <div className="cpf">
      <div className="cpf__stage">
        <img className="cpf__page" src={SRC} alt="The full Zepto cart page, top to bottom: offers, shipments, items, prescription, add-ons, bill and the pay buttons." width="720" height="7452" loading="lazy" decoding="async" />
        {CALLOUTS.map((c, i) => (
          <div className="cpf__call" key={c.t} data-side={i % 2 === 0 ? "right" : "left"} style={{ "--y": c.y + "%", "--x": c.x + "%" }}>
            <span className="cpf__dot" aria-hidden="true">{i + 1}</span>
            <p className="cpf__label"><b>{c.t}</b><span>{c.d}</span></p>
          </div>
        ))}
      </div>
      <ol className="cpf__list">
        {CALLOUTS.map((c, i) => (
          <li key={c.t}><span className="cpf__dot cpf__dot--static" aria-hidden="true">{i + 1}</span><p className="cpf__label"><b>{c.t}</b><span>{c.d}</span></p></li>
        ))}
      </ol>
    </div>
  );
}
