import "./schedCopyProcess.css";

// The copy, from first principles (mv59i870, 12 Oct 2026). Real pairs only: the
// struck line and the line that replaced it, each with where the change came from.
// Sources: the Agentation history on /work/scheduled-delivery (~/.agentation
// store.db, which records the text the annotation sat on), the 21 Jun 2026
// checkpoint of App.jsx (git 88c8ae4) against the live copy, and the design-file
// (22 Oct: the paraphrased design-file review lines and the first-draft pair were removed, Agam.)
// Nothing here is invented; the "why" lines name the move, not a motive.
const GROUPS = [
  {
    move: "Say what the person can do, not what is wrong",
    pairs: [
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
