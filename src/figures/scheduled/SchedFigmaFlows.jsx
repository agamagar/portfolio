import PhoneFrame from "../ds/IphoneFrame";
import FigmaEmbed from "../../ui/FigmaEmbed";
import usePhone from "../../hello3/usePhone";
import "./schedFigmaFlows.css";

// The four prototype paths, each running live in a phone. Three are the design playground's built flows (Agam, 26 Oct:
// "use all the developed flows instead of figma prototype"): `pg` is the embedCatalog id, `case` the first screen. The
// main path stays on the Figma file (Claude: Schedule, Flow page 141:2): no single built flow walks cart to slot to order
// to tracking; the playground splits it across five flows (flagged to CoS, 26 Oct). Starting points:
// ~/design-playground/docs/figma-prototype/MAIN-PATH.md and RETURNS-PATHS.md. The stills are each path's first frame
// (tools/capture-figma-stills.mjs), the floor under the live screen and the phone view.
// `only` picks a subset by key, so a section can show one journey: <SchedFigmaFlows only={["exchange", "return"]} />
export const FIGMA_FLOWS = [
  { k: "main", start: "9:154", label: "Cart to slot to order", alt: "Schedule Delivery main path, live from Figma: cart, slot picker, confirm, order placed." },
  { k: "slots-full", start: "11:3", pg: "flow-schedule-slots-unavailable-feedback", case: "S-017", label: "When slots fill up", alt: "The slots-full flow, running: full chips, a free slot beside them, a whole day booked." },
  { k: "exchange", start: "7:3", pg: "flow-returns-cs-chat-exchange", case: "EX-001", label: "Exchange, in support chat", alt: "The support chat exchange flow, running." },
  { k: "return", start: "10:3", pg: "flow-returns-cs-chat-return", case: "RT-001", label: "Return, in support chat", alt: "The support chat return flow, running." },
];

export default function SchedFigmaFlows({ only }) {
  const phone = usePhone();
  const flows = only ? FIGMA_FLOWS.filter((f) => only.includes(f.k)) : FIGMA_FLOWS;
  return (
    <div className="sdflows">
      {flows.map((f) => (
        <PhoneFrame key={f.k} width={phone ? 156 : 208} interactive={false} caption={f.label}>
          <FigmaEmbed mode="proto" node={f.start} start={f.start} playground={f.pg} caseId={f.case} title={f.alt}
            fallback={`/figures/scheduled/figma/flow-${f.k}.png`} alt={f.alt} />
        </PhoneFrame>
      ))}
    </div>
  );
}
