import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import "./scheduled.css";

// mukw52nu (28 Sep): "a grid of two x three to show multiple things that happen
// on our cart ... only show that specific part of the screen, mocked inside a
// phone ... the flat background that we use, and a text just below to explain
// what it is." Each tile is a window onto a front-on PhoneMock: the phone is
// drawn large and shifted so only the part of the screen that matters shows.
//
// TO FILL A TILE: drop the screenshot in public/figures/scheduled/cart-grid/,
// then set `src`, `focus` (0 = top of the screen, 1 = bottom: the point to
// centre in the window) and the `caption`. Until then a tile shows a labelled
// placeholder, so the layout can be reviewed before the screens arrive.

// mukwj1ra (28 Sep): tile 1 cycles the coupon widget's three states (Figma
// HBBgHT1u7e5jsz7BEEZ3fT 285:6872, exported at 2x): ready to apply, applied,
// and blocked under the order minimum. A crossfade with a small lift, one
// state every 2.4s, only while the tile is on screen; reduced motion holds on
// the first state.
const COUPONS = [
  { src: "/figures/scheduled/cart-grid/coupon-1.webp", alt: "Coupon ready: Get extra ₹50 off, with Apply" },
  { src: "/figures/scheduled/cart-grid/coupon-2.webp", alt: "Coupon applied: You got extra ₹50 off on your cart, with Remove" },
  { src: "/figures/scheduled/cart-grid/coupon-3.webp", alt: "Coupon blocked: applicable only on orders with items worth ₹199 and more" },
];
// mukwljvh (28 Sep): tile 2, the free-gift construct (Figma 285:6891, 2x): the
// offers carousel, then the single campaign with its progress to Rs 1999
const GIFTS = [
  { src: "/figures/scheduled/cart-grid/gift-1.webp", alt: "Gifts for you, 3 offers available: a free gift and free cash, each unlocked by shopping for ₹1999" },
  { src: "/figures/scheduled/cart-grid/gift-2.webp", alt: "Free gift: shop for ₹1999, a progress bar filling toward it, gifts at ₹1" },
];
// mukwtz75 (28 Sep): tile 3, the shipment header with Schedule as the way in
// (Figma 285:8151, 2x): one delivery on its ETA, then the split order warned
// "Expect multiple deliveries". NB the second card's title is still the Figma
// placeholder "Heading Goes Here"
const ETA = [
  { src: "/figures/scheduled/cart-grid/eta-1.webp", alt: "Delivering in 19 mins, 5 items, with a Schedule button" },
  { src: "/figures/scheduled/cart-grid/eta-2.webp", alt: "Expect multiple deliveries for this order, a shipment of 5 items with a Schedule button" },
];
// mukww8fo (28 Sep): tile 4, the split-order header (Figma 289:8473, 2x): the
// plain "why", then the same header carrying Schedule
const SPLIT = [
  { src: "/figures/scheduled/cart-grid/split-1.webp", alt: "Order split into multiple deliveries: this helps us deliver your items faster" },
  { src: "/figures/scheduled/cart-grid/split-2.webp", alt: "Order split into 2 deliveries, 5 items, with a Schedule button" },
];
// mukwy1kn (28 Sep): tile 5, gift packing (Figma 289:8725, 2x): the prompt,
// then the bag filled with four items
const GIFTBAG = [
  { src: "/figures/scheduled/cart-grid/giftbag-1.webp", alt: "Ordering a gift? Select items to pack in a gift bag" },
  { src: "/figures/scheduled/cart-grid/giftbag-2.webp", alt: "Gift bag, ₹35: 4 items will come in a gift bag, with an edit button" },
];
// one cycler for any tile: its frames crossfade with a small lift while on screen
function Cycle({ frames, every = 2400 }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return undefined;
    let t = null;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(t);
      if (e.isIntersecting) t = setInterval(() => setI((n) => (n + 1) % frames.length), every);
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { clearInterval(t); io.disconnect(); };
  }, [reduce, frames.length, every]);
  return (
    <div className="cgrid__screen" ref={ref}>
      <div className="cgrid__coupons" aria-live="off">
        {frames.map((c, k) => (
          <img key={c.src} src={c.src} alt={k === i ? c.alt : ""} aria-hidden={k !== i} className="cgrid__coupon" data-on={k === i ? "true" : undefined} />
        ))}
      </div>
    </div>
  );
}

const TILES = [
  { screen: <Cycle frames={COUPONS} />, focus: 0.3, caption: "Coupons, three ways: ready to apply, applied, and blocked under the ₹199 minimum." },
  { screen: <Cycle frames={GIFTS} every={2800} />, focus: 0.2, caption: "Free gifts on the cart: offers to unlock, then progress toward the ₹1999 gift, each gift at ₹1." },
  { screen: <Cycle frames={ETA} every={2800} />, focus: 0.3, caption: "Schedule sits right on the shipment, beside the ETA, even when the order splits into several deliveries." },
  { screen: <Cycle frames={SPLIT} every={2800} />, focus: 0.3, caption: "When the order splits, the cart says why first, then lets each delivery be scheduled." },
  { screen: <Cycle frames={GIFTBAG} every={2800} />, focus: 0.3, caption: "Gift packing: pick the items for a gift bag, and the cart shows what goes in it." },
  // mukxenvq (28 Sep): tile 6 moved out to its own section (the full cart page in a phone)
];

// mukwod9g (28 Sep): "remove these phone". The phone frame is gone: each
// widget now sits straight on the tile's flat lavender, centred, at a width
// close to its size on a real screen so it reads as a crop, not a thumbnail.
function Tile({ t, n }) {
  return (
    <figure className="cgrid__tile">
      <div className="cgrid__window">
        <div className="cgrid__flat">
          {t.screen || (t.src ? <img src={t.src} alt="" /> : <div className="cgrid__ph">Screenshot {n}</div>)}
        </div>
      </div>
      <figcaption className="cgrid__cap">{t.caption}</figcaption>
    </figure>
  );
}

export default function SchedCartGrid() {
  return (
    <div className="cgrid" role="group" aria-label="Six things that happen on the cart">
      {TILES.map((t, i) => <Tile key={i} t={t} n={i + 1} />)}
    </div>
  );
}
