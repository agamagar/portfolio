import PhoneFrame from "../ds/IphoneFrame";
import FigmaEmbed from "../../ui/FigmaEmbed";
import usePhone from "../../hello3/usePhone";
import "./schedFigmaFlows.css";

// Journeys, each running live in a phone: the design playground's built flows (Agam, 26 Oct: "use all the developed
// flows instead of figma prototype"). `pg` is the embedCatalog id, `case` the first screen, `still` the floor under the
// live screen and the phone view (default: the Figma path's first frame, tools/capture-figma-stills.mjs, which matches the
// flow's first screen). The main path became the schedule page (flow-schedule-slot-picker-m4): no single built flow walks
// cart to slot to order, and the page is where most of it happens; `start` keeps the Figma path ids for the record.
// `only` picks a subset by key, so a section can show one journey: <SchedFigmaFlows only={["exchange", "return"]} />
// `extra` flows (26 Oct, "add all things in the schedule case study") belong to other sections and stay out of the default
// four: after booking (tracking, My Orders, the home strip), the in-app return, and the cart's limits and errors.
export const FIGMA_FLOWS = [
  { k: "main", start: "9:154", pg: "flow-schedule-slot-picker-m4", case: "S-002", still: "/figures/scheduled/flows/slot-picker-S-002.png", label: "Instant or Schedule, then a slot", alt: "The schedule page, running: Instant or Schedule for each shipment, then a slot." },
  { k: "slots-full", start: "11:3", pg: "flow-schedule-slots-unavailable-feedback", case: "S-017", label: "When slots fill up", alt: "The slots-full flow, running: full chips, a free slot beside them, a whole day booked." },
  { k: "exchange", start: "7:3", pg: "flow-returns-cs-chat-exchange", case: "EX-001", label: "Exchange, in support chat", alt: "The support chat exchange flow, running." },
  { k: "return", start: "10:3", pg: "flow-returns-cs-chat-return", case: "RT-001", label: "Return, in support chat", alt: "The support chat return flow, running." },
  { k: "tracking", extra: true, pg: "flow-cart-order-placing-and-tracking", case: "C-033", still: "/figures/scheduled/flows/tracking-C-033.png", label: "Tracking, scheduled for today", alt: "Order tracking for a scheduled order, running: Scheduled for Today, 7-8 PM." },
  { k: "orders", extra: true, pg: "flow-cart-touchpoints-orders-home-pdp", case: "C-039", still: "/figures/scheduled/flows/orders-C-039.png", label: "My Orders", alt: "My Orders with a scheduled order on top, running: Order Scheduled, with Cancel Order." },
  { k: "home", extra: true, pg: "flow-cart-touchpoints-orders-home-pdp", case: "C-044", still: "/figures/scheduled/flows/home-strip-C-044.png", label: "The home strip", alt: "The home page with an Order Scheduled for Today, 7-8 AM strip at its foot, running." },
  { k: "in-app", extra: true, pg: "flow-returns-in-app-exchange-return", case: "IA-001", still: "/figures/scheduled/flows/in-app-return-IA-001.png", label: "Exchange or return, from Order Details", alt: "Order Details with each item's exchange and return state, running." },
  { k: "limits", extra: true, pg: "flow-cart-oos-limit-and-edge-cases", case: "C-111", still: "/figures/scheduled/flows/limits-C-111.png", label: "Rain, with Schedule still open", alt: "The cart in heavy rain, running: deliveries paused, Schedule still offered." },
];

export default function SchedFigmaFlows({ only }) {
  const phone = usePhone();
  const flows = only ? FIGMA_FLOWS.filter((f) => only.includes(f.k)) : FIGMA_FLOWS.filter((f) => !f.extra);
  return (
    <div className={"sdflows sdflows--n" + flows.length}>
      {flows.map((f) => (
        <PhoneFrame key={f.k} width={phone ? 156 : 208} interactive={false} caption={f.label}>
          <FigmaEmbed mode="proto" node={f.start} start={f.start} playground={f.pg} caseId={f.case} title={f.alt}
            fallback={f.still || `/figures/scheduled/figma/flow-${f.k}.png`} alt={f.alt} />
        </PhoneFrame>
      ))}
    </div>
  );
}

// One section's flows, for the figure registry in App.jsx
export const SchedAfterFlows = () => <SchedFigmaFlows only={["tracking", "orders", "home"]} />;
export const SchedInAppFlow = () => <SchedFigmaFlows only={["in-app"]} />;
export const SchedLimitsFlow = () => <SchedFigmaFlows only={["limits"]} />;
