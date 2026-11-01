import ScreenStrip from "./ScreenStrip";
import PlaygroundEmbed from "../sdStory/PlaygroundEmbed";
import { bundleBase } from "../sdStory/playgroundBase";

// The nine Schedule flows wired in code (design-playground claude/schedule-code-build-fec319, 8633986):
// each flow's screens in tap order, captured from the build (#gate/<id> and #embed/schedule?state=<key>, 2x),
// then the build itself, copied to public/sd-flows/, as a click-through. The step order is the build's
// screenFlows.ts (`screens`); the Schedule flow follows its designed states a1 to c1.
const DIR = "/figures/scheduled/flows";
const FLOWS = [
  {
    k: "schedule", title: "Schedule your order", line: "Open the picker, choose Instant or a slot, switch days, confirm.",
    steps: [
      ["sched-a1", "Scheduling for today"], ["sched-a2", "Instant delivery picked"], ["sched-a3", "Instant is busy, the callout explains"],
      ["sched-a4", "Scheduling unavailable"], ["sched-b1", "Morning, earlier slots passed"], ["sched-b2", "Every evening slot shown"],
      ["sched-b3", "A slot after midnight picked"], ["sched-c1", "Tomorrow's slots"],
    ],
  },
  {
    k: "home", title: "Home", line: "The store is offline, so Home offers Schedule Now; the bottom bar opens the cart.",
    steps: [["home-m1", "Home, store offline"], ["cart-s072", "Cart: items that cannot come"]],
  },
  {
    k: "cart-m1", title: "Cart states", line: "Remove what cannot come, schedule the rest, review, pay.",
    steps: [
      ["cart-s074", "Reschedule, store unserviceable"], ["cart-s075", "Reschedule, items unavailable"], ["cart-s076", "Remove unavailable items"],
      ["cart-m1-dev-ready", "Items unavailable, Click to Pay"], ["cart-s083", "Schedule needs review"], ["cart-s079", "Schedule your order, Save"],
      ["cart-s078", "Scheduled, booked banner"], ["cart-s073", "Reschedule: Schedule Order"], ["cart-s077", "Unavailable items removed"],
      ["home-m1", "Back home"], ["cart-s072", "Auto-remove on Pay"],
    ],
  },
  {
    k: "m3", title: "Cart and shipment headers", line: "The cart splits into an instant and a later shipment; each header says why.",
    steps: [["cart-m3", "Cart: instant plus later"], ["cart-m3-long", "The full scrolled cart", "tall"]],
    boards: [["hdr-board", "Every header reason"], ["hdr-board-blocked", "Blocked reasons keep a disabled Schedule"]],
    bars: [
      ["hdr-scheduleable", "Scheduleable"], ["hdr-store-closed", "Store closed"], ["hdr-stand-still", "Stand still"],
      ["hdr-store-not-taking-orders", "Store not taking orders"], ["hdr-order-limit", "Order limit"], ["hdr-orders-per-day-limit", "Orders per day limit"],
      ["hdr-weight-limit", "Weight limit"], ["hdr-default", "Default"], ["hdr-scheduled-today", "Scheduled today"],
      ["hdr-scheduled-tomorrow", "Scheduled tomorrow"], ["hdr-unserviceable", "Unserviceable"],
    ],
  },
  {
    k: "m2-order", title: "Schedule order", line: "Pick later, pick a slot, confirm each shipment, land back in the cart.",
    steps: [
      ["m2-collapsed", "Both shipments collapsed"], ["m2-chips", "Option chips"], ["m2-no-slot", "Second shipment has no slot"],
      ["m2-schedule-page", "Slots listed"], ["m2-current", "Slot picked, delivery note"], ["m2-status", "Status rows"],
      ["cart-m3-long", "Back in the cart", "tall"],
    ],
  },
  {
    k: "m2-intro", title: "Intro banner", line: "Three taps teach Schedule, then the page opens under it.",
    steps: [
      ["m2-intro-introducing", "Introducing"], ["m2-intro-named", "Schedule for Later"], ["m2-intro-benefits", "Now or later"],
      ["m2-schedule-page", "The schedule page"],
    ],
  },
  {
    k: "offers", title: "Offers", line: "Open a deal, fill it, land back in the cart with the offer applied.",
    steps: [
      ["o1-default", "Offers page"], ["o2-progress", "Offer details, in progress"], ["o2-unlocked", "Offer unlocked"],
      ["o3-applied", "Back in cart, offer applied"], ["o3-removed", "Instant-only offer removed"],
    ],
  },
  {
    k: "returns", title: "Returns", line: "Select, give a reason and a photo, review, then follow the return.",
    steps: [
      ["r1-default", "Select items"], ["r2-default", "Reason and photo"], ["r3-default", "Review and pickup slot"],
      ["r4-scheduled", "Pickup scheduled"], ["r4-refunded", "Refund credited"],
    ],
  },
  {
    k: "tracking", title: "Order tracking", line: "A scheduled order's status; reschedule it or cancel it.",
    steps: [
      ["t1-scheduled", "Order scheduled"], ["t2-reschedule", "Reschedule: pick a slot"], ["t3-confirm", "Cancel: confirm"],
      ["t1-cancelled", "Order cancelled"],
    ],
  },
  {
    k: "edge", title: "Edge states", plain: true,
    line: "The other states of Offers, Returns and Tracking: loading, empty, errors, closed windows and a live order.",
    steps: [
      ["o1-loading", "Offers: loading"], ["o1-empty", "Offers: no offers yet"], ["o1-error", "Offers: couldn't load"],
      ["r1-loading", "Returns: loading"], ["r1-closed", "Returns: window closed"], ["r2-failed", "Returns: photo upload failed"],
      ["r3-noslots", "Returns: no pickup slots"],
      ["t1-ontheway", "Tracking: on the way"], ["t1-late", "Tracking: running late"], ["t1-delivered", "Tracking: delivered"],
      ["t1-loading", "Tracking: loading"], ["t1-error", "Tracking: couldn't load"], ["t3-closed", "Cancel: too late to cancel"],
    ],
  },
];
const tiles = (rows) => rows.map(([id, cap, tall], i) => ({ id, tall: !!tall, cap: `${i + 1}. ${cap}`, src: `${DIR}/${id}.webp` }));
const plain = (rows) => rows.map(([id, cap]) => ({ id, cap, src: `${DIR}/${id}.webp` }));

const BASE = bundleBase("sd-flows");
// the build's All prototypes page: every built flow in one picker, each a working prototype with its cases
const PROTOS = { id: "prototypes", title: "Every Schedule flow, clickable", hash: "#embed/prototypes", size: { w: 1040, h: 1000 } };

export default function SchedWiredFlows() {
  return (
    <div className="sdwired">
      {FLOWS.map((f, n) => (
        <section className="sdwired__flow" key={f.k} aria-labelledby={`sdwired-${f.k}`}>
          <header className="sdwired__head">
            <h3 id={`sdwired-${f.k}`} className="sdwired__title">
              <span className="sdwired__num" aria-hidden="true">{String(n + 1).padStart(2, "0")}</span> {f.title}
            </h3>
            <p className="sdwired__line">{f.line} {f.steps.length + (f.boards?.length || 0) + (f.bars?.length || 0)} screens.</p>
          </header>
          <ScreenStrip tiles={f.plain ? plain(f.steps) : tiles(f.steps)} label={`${f.title}, ${f.plain ? "state by state" : "step by step"}, scroll sideways`} />
          {f.boards && <ScreenStrip tiles={plain(f.boards)} label={`${f.title}: the header boards`} size="board" />}
          {f.bars && <ScreenStrip tiles={plain(f.bars)} label={`${f.title}: each header alone, tapped from the board`} size="bar" />}
        </section>
      ))}
      <div className="sdwired__live">
        <PlaygroundEmbed entry={PROTOS} base={BASE} caption="Pick any flow on the left and tap through the phone. Pick a case to start the prototype there." />
      </div>
    </div>
  );
}
