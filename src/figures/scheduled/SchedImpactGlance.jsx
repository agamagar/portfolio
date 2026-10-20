import { Bars } from "../../ui/charts";
import "./scheduled.css";

// Impact at a glance (mvf9un9o, 19 Oct 2026): a one-claim summary of the Impact section after the layout Agam pinned
// (a big headline with one word in a purple block, three full-width bars with a huge number and a short description,
// a source line). Every number is the case's own: the Impact section's own bullets (August 2026 and the June to
// September appliance share) and the report's source note. The bars are drawn on a normalised scale so the smallest
// still holds its number and caption: width = 38% + value x 0.62, so the order of the lengths is the order of the
// values (82.5, 54, 27.4) but not their ratio.
export default function SchedImpactGlance({ g }) {
  return (
    <section className="ig" aria-label={g.label}>
      <h3 className="ig__head">
        {g.head[0]}<mark className="ig__mark">{g.head[1]}</mark>{g.head[2]}
      </h3>
      <Bars variant="block" data={g.bars.map((b) => ({ label: b.d, v: b.v }))} valueKey="v" ariaLabel={g.label} />
      <p className="ig__source"><u>{g.source}</u></p>
    </section>
  );
}
