import PhoneFrame from "../ds/IphoneFrame";
import FigmaEmbed from "../../ui/FigmaEmbed";
import usePhone from "../../hello3/usePhone";
import "./schedFigmaFlows.css";

// The four wired prototype paths in Figma (Claude: Schedule, Flow page 141:2), each running live in a phone.
// Starting points from ~/design-playground/docs/figma-prototype/MAIN-PATH.md and RETURNS-PATHS.md; the stills
// are each path's first frame, rendered from the same embed (tools/capture-figma-stills.mjs).
// `only` picks a subset by key, so a section can show one journey: <SchedFigmaFlows only={["exchange", "return"]} />
export const FIGMA_FLOWS = [
  { k: "main", start: "9:154", label: "Cart to slot to order", alt: "Schedule Delivery main path, live from Figma: cart, slot picker, confirm, order placed." },
  { k: "slots-full", start: "11:3", label: "When slots fill up", alt: "The slots-full path, live from Figma: full chips, a free slot beside them, a whole day booked." },
  { k: "exchange", start: "7:3", label: "Exchange, in support chat", alt: "Support chat exchange path, live from Figma." },
  { k: "return", start: "10:3", label: "Return, in support chat", alt: "Support chat return path, live from Figma." },
];

export default function SchedFigmaFlows({ only }) {
  const phone = usePhone();
  const flows = only ? FIGMA_FLOWS.filter((f) => only.includes(f.k)) : FIGMA_FLOWS;
  return (
    <div className="sdflows">
      {flows.map((f) => (
        <PhoneFrame key={f.k} width={phone ? 156 : 208} interactive={false} caption={f.label}>
          <FigmaEmbed mode="proto" node={f.start} start={f.start} title={f.alt}
            fallback={`/figures/scheduled/figma/flow-${f.k}.png`} alt={f.alt} />
        </PhoneFrame>
      ))}
    </div>
  );
}
