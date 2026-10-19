import "./scheduled.css";

// Impact at a glance (mvf9un9o, 19 Oct 2026): a one-claim summary of the Impact section after the layout Agam pinned
// (a big headline with one word in a purple block, three full-width bars with a huge number and a short description,
// a source line). Every number is the case's own: the Impact section's own bullets (August 2026 and the June to
// September appliance share) and the report's source note. The bars are drawn on a normalised scale so the smallest
// still holds its number and caption: width = 38% + value x 0.62, so the order of the lengths is the order of the
// values (82.5, 54, 27.4) but not their ratio.
export default function SchedImpactGlance({ g }) {
  const w = (v) => `${(38 + v * 0.62).toFixed(1)}%`;
  return (
    <section className="ig" aria-label={g.label}>
      <h3 className="ig__head">
        {g.head[0]}<mark className="ig__mark">{g.head[1]}</mark>{g.head[2]}
      </h3>
      <ul className="ig__bars">
        {g.bars.map((b) => (
          <li className="ig__bar" key={b.v} style={{ "--w": w(b.v) }}>
            <span className="ig__num">{b.v}%</span>
            <span className="ig__desc">{b.d}</span>
          </li>
        ))}
      </ul>
      <p className="ig__source"><u>{g.source}</u></p>
    </section>
  );
}
