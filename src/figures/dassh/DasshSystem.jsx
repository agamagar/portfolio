// Two blocks for the Dassh case study (v2, 5 Nov 2026). The copy lives in the case data in App.jsx; these only draw it.
//
// RuleMap: the four rules drawn where they live. Three nested scopes (the app, a message, a card) each hold the rule that
// lives at that level, and the tokens sit underneath all three. The corners follow the fourth rule, inner radius = outer
// radius minus padding: a 32 with 16 of padding holds a 16, and a 16 with 8 holds an 8 (dasshSystem.css).
//   map  { layers: [{ k, to, t }], base: { k, to, t }, caption }
//          k   the scope's name ("The app")
//          to  the heading of the rule's section: the link's text, and the section it scrolls to
//          t   one line on how the rule lives there
//   ids  { [heading]: "sec-<n>" }, resolved by the case renderer from the section list
//
// AuditLedger: before and after numbers from the audits, one row each, with the honest caveat under them.
//   ledger  { k, rows: [{ k, before, after }], note }
import { ArrowDown } from "iconoir-react";
import { scrollToId } from "../../ui/SectionIndex";
import "./dasshSystem.css";

const TAGS = ["r32 p16", "r16 p8", "r8"]; // each scope's corner and padding, as drawn

function Jump({ to, id }) {
  if (!id) return <span className="rmap__rule">{to}</span>;
  return (
    <a className="rmap__rule" href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToId(id); }}>
      {to}
      <ArrowDown width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
    </a>
  );
}

function Head({ item, ids, tag }) {
  return (
    <div className="rmap__head">
      <p className="rmap__k">
        <span>{item.k}</span>
        {tag && <span className="rmap__tag" aria-hidden="true">{tag}</span>}
      </p>
      <Jump to={item.to} id={ids[item.to]} />
      <p className="rmap__t">{item.t}</p>
    </div>
  );
}

function Scope({ layers, depth, ids }) {
  const [item, ...inner] = layers;
  return (
    <div className={`rmap__scope rmap__scope--${depth}`}>
      <Head item={item} ids={ids} tag={TAGS[depth]} />
      {inner.length > 0 && <Scope layers={inner} depth={depth + 1} ids={ids} />}
    </div>
  );
}

export function RuleMap({ map, ids = {} }) {
  if (!map?.layers?.length) return null;
  return (
    <figure className="rmap">
      <Scope layers={map.layers.slice(0, TAGS.length)} depth={0} ids={ids} />
      {map.base && (
        <div className="rmap__base">
          <Head item={map.base} ids={ids} />
        </div>
      )}
      {map.caption && <figcaption className="rmap__cap">{map.caption}</figcaption>}
    </figure>
  );
}

export function AuditLedger({ ledger }) {
  if (!ledger?.rows?.length) return null;
  return (
    <div className="ledger">
      <table className="ledger__t">
        <caption className="ledger__k">{ledger.k}</caption>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Check</span></th>
            <th scope="col">Before</th>
            <th scope="col">After</th>
          </tr>
        </thead>
        <tbody>
          {ledger.rows.map((r) => (
            <tr key={r.k}>
              <th scope="row">{r.k}</th>
              <td className="ledger__was">{r.before}</td>
              <td className="ledger__now"><span className="ledger__arrow" aria-hidden="true">→</span>{r.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ledger.note && <p className="ledger__note">{ledger.note}</p>}
    </div>
  );
}
