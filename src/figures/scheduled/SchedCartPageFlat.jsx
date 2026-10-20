import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import "./scheduled.css";

// The whole cart page, top to bottom (mvf9leyc, 19 Oct 2026): the export laid out flat at full height, not scrolling
// inside a phone, with numbered callouts that point at its key parts. Each callout is a dot on the page, a leader line
// and a short label, alternating right and left of the page (stacked as a numbered list under it on a phone).
// Every line comes from the case study's own text on this page or from what the screen itself shows; anything the page
// does not say is marked [CONFIRM] for Agam.
const SRC = "/figures/scheduled/cart-page-full.webp"; // 720 x 7452

// y is the callout's place down the page, in % of its height (measured on the export); x is where its dot sits across it (the page's right edge for callouts on the right
// a / b are the widget's top and bottom edge down the page, in % of its height (measured on the 720 x 7452 export): the
// one being talked about is lit and the rest of the page is dimmed (mvg9wjb1: one widget at a time, stepping through)
const CALLOUTS = [
  { a: 3.9, b: 9.2, y: 6.4, x: 94, t: "Gifts for you", d: "Free gifts live on the cart: offers to unlock, then progress toward the ₹1999 gift, each gift at ₹1." },
  { a: 9.8, b: 13.4, y: 11.6, x: 6, t: "Unserviceable, first", d: "“3 items can’t be delivered” leads the cart. A shipment is unserviceable outright when its store is closed or out of stock for that window." },
  { a: 13.8, b: 31.1, y: 15.5, x: 94, t: "One shipment, its own ETA", d: "“Delivering in 19 mins” is one shipment. A mixed cart fans out by fulfilling site, up to four, and scheduling is per shipment." },
  { a: 34.9, b: 42.2, y: 38.5, x: 6, t: "Pharmacy orders", d: "A prescription step lives in the same cart: one of the things that make it complex before scheduling asks for room." },
  { a: 57.1, b: 60.4, y: 58.7, x: 94, t: "More rows than shipments", d: "Gift-bag and “ordering for someone” rows sit in the same list. [CONFIRM what each is for]" },
  { a: 64.0, b: 77.7, y: 70.8, x: 6, t: "The bill, and what was saved", d: "Fees, coupons and the total (“To Pay”, “Total savings”) close the scroll: the page scheduling had to fit into." },
  { a: 96.6, b: 99.9, y: 98.2, x: 94, t: "Where the pay button goes", d: "Pay Online and Pay on Delivery end the page. Where the pay button went on an unserviceable cart ran as two experiments." },
];

const STEP_MS = 3600;

export default function SchedCartPageFlat() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);   // hovering or focused: the tour waits
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);
  const reduce = useReducedMotion();
  // the tour steps through the widgets while the figure is on screen (reduced motion: no timer, click a number instead)
  useEffect(() => {
    if (!ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting && e.intersectionRatio >= 0.3), { threshold: [0, 0.3, 0.6] });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (reduce || held || !seen) return undefined;
    const t = setInterval(() => setActive((n) => (n + 1) % CALLOUTS.length), STEP_MS);
    return () => clearInterval(t);
  }, [reduce, held, seen]);
  const cur = CALLOUTS[active];
  return (
    <div className="cpf" ref={ref}>
      <div className="cpf__stage" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
        <div className="cpf__pg">
          <img className="cpf__page" src={SRC} alt="The full Zepto cart page, top to bottom: offers, shipments, items, prescription, add-ons, bill and the pay buttons." width="720" height="7452" loading="lazy" decoding="async" />
          <span className="cpf__spot" aria-hidden="true" style={{ "--t": cur.a + "%", "--h": (cur.b - cur.a) + "%" }} />
        </div>
        {CALLOUTS.map((c, i) => (
          <div className="cpf__call" key={c.t} data-side={i % 2 === 0 ? "right" : "left"} data-active={i === active ? "true" : undefined} style={{ "--y": c.y + "%", "--x": c.x + "%" }}>
            <button type="button" className="cpf__dot" aria-label={`Show: ${c.t}`} aria-pressed={i === active} onClick={() => setActive(i)} onMouseEnter={() => setActive(i)}>{i + 1}</button>
            <p className="cpf__label"><b>{c.t}</b><span>{c.d}</span></p>
          </div>
        ))}
      </div>
      <ol className="cpf__list">
        {CALLOUTS.map((c, i) => (
          <li key={c.t} data-active={i === active ? "true" : undefined}><button type="button" className="cpf__dot cpf__dot--static" aria-label={`Show: ${c.t}`} aria-pressed={i === active} onClick={() => setActive(i)}>{i + 1}</button><p className="cpf__label"><b>{c.t}</b><span>{c.d}</span></p></li>
        ))}
      </ol>
    </div>
  );
}
