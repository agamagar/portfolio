import { PhoneWindow } from "../ds/Scaffold";
import { Bubble, Pill, Button } from "../ds/Primitives";
import { FIELDS, computeRecord } from "./stellaFields";

// What the CANDIDATE gets, on their own phone, after the call.
//
// This view exists because the case study claims the candidate is the primary user of
// this surface, and a demo that only ever showed the recruiter's outcome would be
// arguing one thing and demonstrating another.
//
// It is also where "density follows the audience" stops being a principle and becomes
// visible. This is the SAME call as the recruiter record next door. The recruiter gets
// eight provenance-tracked fields, a recommendation, its reasoning, what could not be
// established, and an override. The candidate gets four short messages. Not because
// they deserve less, but because they need a different thing: a person waiting on an
// answer needs to know what happens, when, and how to reach a human. Everything else is
// the operator's problem, and putting it on their screen would be showing our work at
// their expense.
//
// Every message here is a promise Stella actually made in the call (the close-* nodes
// in stellaGraph.js). Nothing is invented for the mock.

const MESSAGES = [
  {
    id: "next",
    guj: "તમારી અરજી આગળ વધી છે. મંગળવારે સવારે ૧૧ વાગ્યે Zydus ના Sanand plant માં interview છે.",
    translit: "Tamaari arji aagal vadhi chhe. Mangalvaare savaare 11 vagye Zydus na Sanand plant ma interview chhe.",
    gloss: "Your application has moved ahead. Interview Tuesday 11am at the Zydus Sanand plant.",
    tag: "What happens next",
  },
  {
    id: "where",
    guj: "સરનામું: Zydus, Sanand plant, gate 2. સમય: મંગળવાર, સવારે ૧૧.",
    translit: "Sarnamu: Zydus, Sanand plant, gate 2. Samay: Mangalvaar, savaare 11.",
    gloss: "Address: Zydus, Sanand plant, gate 2. Time: Tuesday, 11am.",
    tag: "The detail they need to actually turn up",
  },
  {
    id: "human",
    guj: "કોઈ સવાલ હોય તો HR ને ફોન કરો: 079-XXXX XXXX. માણસ જ વાત કરશે.",
    translit: "Koi savaal hoy to HR ne phone karo: 079-XXXX XXXX. Maanas j vaat karshe.",
    gloss: "Any questions, call HR: 079-XXXX XXXX. A person will answer.",
    tag: "A human, reachable, named up front",
  },
  {
    id: "promise",
    guj: "હા હોય કે ના, જવાબ તો તમને મળશે જ.",
    translit: "Ha hoy ke na, jawab to tamne malshe j.",
    gloss: "Yes or no, you will get an answer either way.",
    tag: "The promise the whole design is built to keep",
  },
];

export default function CandidateView({ turns, onBackToCall }) {
  const { byKey, offScript } = computeRecord(turns);
  const called = turns.length > 1;
  // Only meaningful once a call exists. Computed before that it printed
  // "carries 1 tracked facts" at time zero: wrong number and wrong grammar.
  const recruiterFacts = called
    ? FIELDS.filter((f) => byKey[f.key]).length + offScript.length
    : 0;

  return (
    <div className="cand">
      <div className="cand__head">
        <div>
          {/* Titled by the app header, not twice. See StellaSim HEAD. */}
          <p className="cand__meta">
            The same call as the recruiter record, on the other side of it.
          </p>
        </div>
        <Button onClick={onBackToCall}>
          Back to the call
        </Button>
      </div>

      <div className="cand__body">
        <div className="cand__phonecol">
          <PhoneWindow title="Zydus hiring" time="6:12">
            <div className="cand__thread">
              {called ? (
                MESSAGES.map((m) => (
                  <Bubble key={m.id} side="start" className="cand__msg">
                    <span className="cand__guj" lang="gu">{m.guj}</span>
                    <span className="cand__translit" aria-hidden="true">{m.translit}</span>
                    <span className="cand__gloss">{m.gloss}</span>
                  </Bubble>
                ))
              ) : (
                <p className="cand__waiting">
                  Nothing sent yet. Take the call and this is what arrives.
                </p>
              )}
            </div>
          </PhoneWindow>
        </div>

        <div className="cand__notes">
          <div className="cand__contrast">
            <Pill tone="trust" soft>Density follows the audience</Pill>
            <p className="cand__contrasttext">
              This is the same call the recruiter is looking at next door. That view
              carries {recruiterFacts === 1 ? "one tracked fact" : `${recruiterFacts} tracked facts`}, a recommendation, its
              reasoning, what could not be established, and an override. This one carries
              four messages.
            </p>
            <p className="cand__contrasttext">
              Not because the candidate deserves less. Because they need a different
              thing. Someone waiting on an answer needs to know what happens, when, and
              how to reach a person. The provenance, the confidence, the scoring: that is
              the operator's problem, and putting it on this screen would be showing our
              work at their expense.
            </p>
          </div>

          <div className="cand__annots">
            {MESSAGES.map((m) => (
              <div key={m.id} className="cand__annot">
                <span className="cand__annotdot" aria-hidden="true" />
                <div>
                  <p className="cand__annottag">{m.tag}</p>
                  <p className="cand__annotgloss">{m.gloss}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="cand__honest">
            Honest scope: this is the designed-for candidate surface. The messaging
            existed in the product, but a dedicated candidate portal sat in the
            north-star tier of the roadmap, not in what shipped. It is drawn here
            because the argument needs the candidate's side to be visible, and marked
            because it would be easy to imply more than was built.
          </p>
        </div>
      </div>
    </div>
  );
}
