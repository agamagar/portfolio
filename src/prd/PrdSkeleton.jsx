import "./prd.css";

// The doc route's loading state (critique 72.2, 25 Oct): the PRD documents are lazy-loaded, and on a phone-class CPU
// the body stayed empty for about a second after the page shell. This holds the doc's own layout (.prd, its kicker,
// title and lead) with quiet placeholder bars until the real document mounts. Shared by every doc route.
// 80.1: each bar fills one line box of the element it sits in (1lh), so N bars take the height of N real lines. On
// phones the kicker and the title wrap to two lines, as the real ones do, and docs with the Read / Listen switch
// (`modes`) hold its place, so the first paragraph doesn't jump when the doc swaps in.
// Each bar: [width on wider screens, width on phones]; a null first width is a phone-only line.
const KICK = [[62, 94], [null, 34]];
const TITLE = [[78, 92], [null, 30]];
const LEAD = [[96, 95], [88, 91], [54, 96], [null, 88], [null, 93], [null, 52]];
const BODY = [92, 97, 84, 90, 61];

const bars = (rows) =>
  rows.map(([w, wp], i) => (
    <span key={i} className={w == null ? "prd-skel prd-skel--phone" : "prd-skel"} style={{ "--w": `${w ?? wp}%`, "--wp": `${wp}%` }} />
  ));

export default function PrdSkeleton({ modes = false }) {
  return (
    <article className="prd prd--skeleton" aria-busy="true">
      <span className="sr-only">Loading the document</span>
      <header className="prd__head" aria-hidden="true">
        <p className="prd__kick">{bars(KICK)}</p>
        <p className="prd__title">{bars(TITLE)}</p>
        {modes && (
          <div className="prd-modeswitch">
            <span className="prd-skel-tab">Read</span>
            <span className="prd-skel-tab">Listen</span>
          </div>
        )}
        <p className="prd__lead">{bars(LEAD)}</p>
      </header>
      <div aria-hidden="true">{bars(BODY.map((w) => [w, w]))}</div>
    </article>
  );
}
