// RuleBeats: the labelled beats of a rule section, in the case data as steps and after.
//   beats  [{ k, t?, ul?, fig?, lead?, pair? }]
//            k     the small label ("The problem")
//            t     the text; ul puts bullets under it, and t can be left out when the bullets carry it
//            fig   an annotated figure after it (DasshSpec)
//            lead  the rule itself: its first sentence becomes the section's second-level line, the rest stays body text
//            pair  neighbouring beats marked pair sit side by side on a desktop, as what agents built against what I called
// DeepDive: the closed row at the end of a section.
//   deep   { summary, items: [string], figs?: [spec] }
// Both draw into the section's own grid, as its direct children, so the section frame sets the column.
import { confirmNotes } from "../../../lib/confirmNotes";
import { DasshSpec } from "../DasshSpecs";
import "./ruleBeats.css";

// the first sentence, then the rest
function splitLead(t) {
  const m = t.match(/^(.+?[.!?])\s+([\s\S]+)$/);
  return m ? [m[1], m[2]] : [t, null];
}

function Beat({ st }) {
  const [lead, rest] = st.lead ? splitLead(st.t) : [null, st.t];
  const beat = (
    <p className={"article__step" + (st.lead ? " article__step--rule" : "")}>
      <span className="article__step-k">{st.k}</span>
      {lead && <span className="article__step-lead">{confirmNotes(lead)}</span>}
      {rest ? confirmNotes(rest) : null}
    </p>
  );
  return (
    <>
      {/* a beat with bullets is one block, so its label sits as close to the list as other labels sit to their text */}
      {st.ul ? (
        <div className="article__beat">
          {beat}
          <ul className="article__step-ul">{st.ul.map((it, k) => <li key={k}>{confirmNotes(it)}</li>)}</ul>
        </div>
      ) : beat}
      {st.fig && <DasshSpec spec={st.fig} />}
    </>
  );
}

export function RuleBeats({ beats }) {
  const out = [];
  for (let i = 0; i < beats.length; i++) {
    if (beats[i].pair && beats[i + 1]?.pair) {
      out.push(<div className="article__pair" key={i}><Beat st={beats[i]} /><Beat st={beats[i + 1]} /></div>);
      i++;
    } else out.push(<Beat st={beats[i]} key={i} />);
  }
  return out;
}

// 5 Nov 2026 (Dassh depth pass): a deep-dive item that opens with a short lead ("Radii: 32 for sheets...") sets the lead
// in bold, so a long list scans by its leads. Six words at most, and never across a full stop.
function deepItem(it) {
  const m = typeof it === "string" && it.match(/^([^:.[\]]{2,48}): ([\s\S]+)$/);
  if (!m || m[1].trim().split(/\s+/).length > 6) return confirmNotes(it);
  return <><strong className="article__deep-lead">{m[1]}:</strong> {confirmNotes(m[2])}</>;
}

export function DeepDive({ deep }) {
  return (
    <details className="article__deep">
      <summary><span className="article__deep-k">Deep dive</span><span className="article__deep-t">{deep.summary}</span></summary>
      <ul>{deep.items.map((it, k) => <li key={k}>{deepItem(it)}</li>)}</ul>
      {deep.figs && deep.figs.map((sp, k) => <DasshSpec spec={sp} key={k} />)}
    </details>
  );
}
