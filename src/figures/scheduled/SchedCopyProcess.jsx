import "./schedCopyProcess.css";

// The copy, from first principles (mv59i870, 12 Oct 2026). Real pairs only: the
// struck line and the line that replaced it, each with where the change came from.
// Sources: the Agentation history on /work/scheduled-delivery (~/.agentation
// store.db, which records the text the annotation sat on), the 21 Jun 2026
// checkpoint of App.jsx (git 88c8ae4) against the live copy, and the design-file
// review thread in SchedRoleWireframes (WF05, paraphrased from the file's comments).
// Nothing here is invented; the "why" lines name the move, not a motive.
const GROUPS = [
  {
    move: "Say what the person can do, not what is wrong",
    pairs: [
      { was: "Some items are unserviceable", now: "Schedule your order", src: "Design-file review, 24 to 25 Aug 2025 (PM comment, paraphrased); three reviewers killed the negative phrasing" },
      { was: "Day after tomorrow", now: "The actual date, on every slot tab", src: "Design-file review, 24 to 25 Aug 2025 (PM comment, paraphrased)" },
      { was: "Five reasons instant can't answer", now: "When instant delivery fails", src: "Annotation on the scroll scene, 26 Sep 2026" },
    ],
  },
  {
    move: "Let the heading carry the claim",
    pairs: [
      { was: "One cart, many hubs", now: "The cart is a complex construct", src: "Annotation, 27 Sep 2026" },
      { was: "Two ways to say it", now: "Schedule means different things to different people. Even how they say it.", src: "Annotation, 28 Sep 2026 (the side index keeps the short name)" },
    ],
  },
  {
    move: "Name the thing at stake in plain words",
    pairs: [
      { was: "How do you promise later without spending the trust that now is built on?", now: "How do you promise later without breaking the trust that Zepto is built on?", src: "Annotation on the central question, 27 Sep 2026" },
      { was: "They're fine with the delivery landing later.", now: "Users are fine with deliveries landing later.", src: "Annotation on the key finding, 27 Sep 2026" },
    ],
  },
  {
    move: "Write what the evidence says",
    pairs: [
      { was: "Because the order is for later, people plan and build a bigger cart.", now: "Roughly eight in ten did it as a fallback, because instant was not available at that moment, not because they had planned ahead.", src: "First draft, 21 Jun 2026, against the post-launch study" },
      { was: "Average order value doubled for scheduled orders, roughly ₹600+ versus ₹300 on a regular order.", now: "In August 2026 a scheduled order was worth about 1,450 rupees against 543 for an instant one. The 550-against-300 pair I had been quoting turned out to be the median, not the mean.", src: "First draft, 21 Jun 2026, against the September data pull" },
    ],
  },
];

export default function SchedCopyProcess() {
  return (
    <div className="cpr" data-exp-skip>
      {GROUPS.map((g, gi) => (
        <section className="cpr__group" key={g.move} aria-labelledby={`cpr-g${gi}`}>
          <h4 className="cpr__move" id={`cpr-g${gi}`}><span className="cpr__n" aria-hidden="true">{gi + 1}</span>{g.move}</h4>
          <ul className="cpr__list">
            {g.pairs.map((p) => (
              <li className="cpr__pair" key={p.was}>
                <p className="cpr__was"><span className="cpr__sr">Struck: </span><del>{p.was}</del></p>
                <p className="cpr__now"><span className="cpr__sr">Replaced with: </span><ins>{p.now}</ins></p>
                <p className="cpr__src">{p.src}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
