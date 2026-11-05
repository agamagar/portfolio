// Annotated figures for the Dassh case study (depth pass, 5 Nov 2026). The copy lives in the case data in App.jsx;
// these only draw it. One accent, one job: orange marks a measurement, a count or a callout, and nothing else.
// Every value drawn here is from the Stella repo (tokens, the card shell, speakerHue.ts) or the 4 Nov audits.
//
//   <DasshSpec spec={{ type, caption?, ...data }} />
//     stats     { items: [{ v, k, pre? }] }                    a number strip on a hairline spine
//     flow      { steps: [{ k, t, ex? }] }                     how a rule travels, as numbered nodes
//     boxes     { line, date, kind, status, note, before, after }
//                 before / after: { k, count, keys: [..] }     one reply drawn twice at true size, each box pinned
//     table     { k?, cols: [..], rows: [[..]], mono?: [i] }   a spec table; first cell of a row is its header
//     speakers  { thread: [{ who, t, hue?, role? }], keys: [{ k, t }], hues: [{ name, hex, cr }] }
//     faces     { cols: [..], rows: [{ k, cells: [string | { t, off }] }] }
//     corners   { nest: { k, t }, wrong: { k, t }, right: { k, t } }   the nesting maths, true size and at 3x
//     scale     { k?, rows: [{ v, token, use }] }              spacing and sizes drawn at true size
//     open      { items: [{ home, t }] }                       what is still open, each with the one place it gets fixed
import "./dasshSpecs.css";

function Cap({ text }) {
  return text ? <figcaption className="dspec__cap">{text}</figcaption> : null;
}

/* ---------- stats: the scale on 4 Nov ---------- */
function Stats({ spec }) {
  return (
    <dl className="dspec-stats">
      {spec.items.map((it) => (
        <div className="dspec-stats__item" key={it.k}>
          <dt className="dspec-stats__k">{it.k}</dt>
          <dd className="dspec-stats__v">
            {it.pre && <span className="dspec-stats__pre">{it.pre}</span>}
            {it.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- flow: said, written, built, checked ---------- */
function Flow({ spec }) {
  return (
    <ol className="dspec-flow">
      {spec.steps.map((s, i) => (
        <li className="dspec-flow__step" key={s.k}>
          <span className="dspec-flow__n" aria-hidden="true">{i + 1}</span>
          <span className="dspec-flow__k">{s.k}</span>
          <span className="dspec-flow__t">{s.t}</span>
          {s.ex && <code className="dspec-flow__ex">{s.ex}</code>}
        </li>
      ))}
    </ol>
  );
}

/* ---------- boxes: one reply, before and after the rule ---------- */
// A pin sits on the top-right corner of each boxed surface; its number matches the key under the panel.
const Pin = ({ n }) => <span className="dspec-pin" aria-hidden="true">{n}</span>;
const Bar = ({ w }) => <span className="dspec-box__bar" style={{ width: w }} aria-hidden="true" />;

function Reply({ spec, after }) {
  const side = after ? spec.after : spec.before;
  return (
    <div className={"dspec-box__panel" + (after ? " is-after" : "")}>
      <p className="dspec-box__head">
        <span>{side.k}</span>
        <span className="dspec-box__count">{side.count}</span>
      </p>
      <div className="dspec-box__reply" aria-hidden="true">
        <p className="dspec-box__line">
          {spec.line}{" "}
          {after ? <b>{spec.date}</b> : <span className="dspec-box__chip">{spec.date}<Pin n={1} /></span>}
        </p>
        <div className={"dspec-box__card" + (after ? " is-after" : "")}>
          <Pin n={after ? 1 : 2} />
          <span className="dspec-box__cardhead">
            <span className="dspec-box__kind">{spec.kind}</span>
            {after
              ? <span className="dspec-box__dot">{spec.status}</span>
              : <span className="dspec-box__chip dspec-box__chip--status">{spec.status}<Pin n={3} /></span>}
          </span>
          <Bar w="64%" />
          <Bar w="42%" />
        </div>
        {after
          ? <p className="dspec-box__note"><span className="dspec-box__spark" />{spec.note}</p>
          : <p className="dspec-box__note"><span className="dspec-box__pill">{spec.note}<Pin n={4} /></span></p>}
      </div>
      <ol className="dspec-box__keys">
        {side.keys.map((k, i) => (
          <li key={k}>
            {after && i > 0 ? <span className="dspec-box__keyn dspec-box__keyn--off" aria-hidden="true" /> : <span className="dspec-box__keyn" aria-hidden="true">{i + 1}</span>}
            {k}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Boxes({ spec }) {
  return (
    <div className="dspec-box">
      <Reply spec={spec} />
      <Reply spec={spec} after />
    </div>
  );
}

/* ---------- table: tokens and values ---------- */
function Table({ spec }) {
  const mono = new Set(spec.mono || []);
  return (
    <div className="dspec-table">
      <table>
        {spec.k && <caption>{spec.k}</caption>}
        <thead>
          <tr>{spec.cols.map((c) => <th scope="col" key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {spec.rows.map((r) => (
            <tr key={r[0]}>
              {r.map((cell, j) => (j === 0
                ? <th scope="row" key={j}>{cell}</th>
                : <td key={j} data-k={spec.cols[j]} className={mono.has(j) ? "is-mono" : undefined}>{cell}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- speakers: who is talking, from the material alone ---------- */
const HUE = { sky: "#AADBFE", coral: "#FE93A4", mint: "#61E8CA", butter: "#F1E98A", lilac: "#C9A2FB", apricot: "#EFB886" };

function Speakers({ spec }) {
  return (
    <div className="dspec-spk">
      <div className="dspec-spk__thread" role="img" aria-label={spec.alt}>
        {spec.thread.map((m, i) => {
          if (m.who === "you") return <p className="dspec-spk__you" key={i}>{m.t}</p>;
          if (m.who === "stella") return <p className="dspec-spk__stella" key={i}><span className="dspec-spk__orb" />{m.t}</p>;
          if (m.who === "joined") return <p className="dspec-spk__joined" key={i}><span className="dspec-spk__av" style={{ "--h": HUE[m.hue] }} />{m.t}</p>;
          return (
            <div className="dspec-spk__person" key={i} style={{ "--h": HUE[m.hue] }}>
              <span className="dspec-spk__av" />
              <span className="dspec-spk__bubble">
                <span className="dspec-spk__role">{m.role}</span>
                {m.t}
              </span>
            </div>
          );
        })}
      </div>
      <div className="dspec-spk__side">
        <ul className="dspec-spk__keys">
          {spec.keys.map((k) => (
            <li key={k.k}><span className="dspec-spk__keyk">{k.k}</span>{k.t}</li>
          ))}
        </ul>
        <ul className="dspec-spk__hues">
          {spec.hues.map((h) => (
            <li key={h.name}>
              <span className="dspec-spk__swatch" style={{ "--h": h.hex }}><span>Aa</span></span>
              <span className="dspec-spk__hname">{h.name}</span>
              <span className="dspec-spk__hval">{h.hex}<br />{h.cr}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- faces: one component, three faces ---------- */
function Faces({ spec }) {
  return (
    <div className="dspec-table dspec-table--faces">
      <table>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Component</span></th>
            {spec.cols.map((c) => <th scope="col" key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {spec.rows.map((r) => (
            <tr key={r.k}>
              <th scope="row">{r.k}</th>
              {r.cells.map((c, j) => {
                const off = typeof c === "object" && c.off;
                return <td key={j} data-k={spec.cols[j]} className={off ? "is-off" : undefined}>{typeof c === "object" ? c.t : c}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- corners: inner = outer - padding ---------- */
// a rounded rectangle as one SVG subpath, so two of them make a band with evenodd (same helper as StellaLive's overlay)
function rr(x, y, w, h, r) {
  const q = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + q},${y}h${w - 2 * q}a${q},${q} 0 0 1 ${q},${q}v${h - 2 * q}a${q},${q} 0 0 1 ${-q},${q}h${-(w - 2 * q)}a${q},${q} 0 0 1 ${-q},${-q}v${-(h - 2 * q)}a${q},${q} 0 0 1 ${q},${-q}z`;
}

// True size: a 32 sheet with 16 of padding holds a 16 card, whose 8 of padding holds 8 blocks. The three corners share
// one centre, at (32, 32): that is the rule, drawn.
function Nest() {
  return (
    <svg className="dspec-corner__nest" viewBox="0 0 240 168" width="240" height="168" aria-hidden="true">
      <path className="dspec-corner__f1" d={rr(0, 0, 240, 168, 32)} />
      <path className="dspec-corner__f2" d={rr(16, 16, 208, 136, 16)} />
      <path className="dspec-corner__f3" d={rr(24, 24, 192, 56, 8)} />
      <path className="dspec-corner__f3" d={rr(24, 88, 192, 56, 8)} />
      {/* the three corner arcs, concentric */}
      <path className="dspec-corner__arc" d="M0,32 A32,32 0 0 1 32,0" />
      <path className="dspec-corner__arc" d="M16,32 A16,16 0 0 1 32,16" />
      <path className="dspec-corner__arc" d="M24,32 A8,8 0 0 1 32,24" />
      <circle className="dspec-corner__ctr" cx="32" cy="32" r="2.5" />
      {/* the values sit in the bands wide enough to hold them; the legend under the drawing names all three */}
      <text className="dspec-corner__t" x="40" y="11.5">r32</text>
      <text className="dspec-corner__t" x="40" y="56">r8</text>
      <text className="dspec-corner__t" x="40" y="120">r8</text>
    </svg>
  );
}

// 3x zoom on one corner: outer r16 (48), padding 8 (24), inner r16 or r8 (48 or 24). The band is the padding.
function Zoom({ inner }) {
  const R = 48, P = 24, O = 10; // outer radius, padding, offset of the outer corner in the panel
  const c1 = O + R, c2 = O + P + inner; // corner centres: outer, inner
  const k = Math.SQRT1_2;
  const a = c1 - R * k, b = c2 - inner * k; // where the 45 degree line meets each arc
  return (
    <svg className="dspec-corner__zoom" viewBox="0 0 150 150" width="150" height="150" aria-hidden="true">
      <path className="dspec-corner__band" fillRule="evenodd" d={rr(O, O, 220, 220, R) + rr(O + P, O + P, 220 - 2 * P, 220 - 2 * P, inner)} />
      <path className="dspec-corner__edge" d={rr(O, O, 220, 220, R)} />
      <path className="dspec-corner__edge" d={rr(O + P, O + P, 220 - 2 * P, 220 - 2 * P, inner)} />
      <line className="dspec-corner__dim" x1={a} y1={a} x2={b} y2={b} />
      <line className="dspec-corner__dim" x1={O} y1={128} x2={O + P} y2={128} />
      <text className="dspec-corner__t dspec-corner__t--acc" x={b + 5} y={b + 4}>{((b - a) * Math.SQRT2 / 3).toFixed(1).replace(/\.0$/, "")}</text>
      <text className="dspec-corner__t dspec-corner__t--acc" x={O + P + 5} y={132}>8</text>
    </svg>
  );
}

function Corners({ spec }) {
  return (
    <div className="dspec-corner">
      <div className="dspec-corner__cell dspec-corner__cell--nest">
        <Nest />
        <p className="dspec-corner__k">{spec.nest.k}</p>
        <p className="dspec-corner__d">{spec.nest.t}</p>
      </div>
      <div className="dspec-corner__pair">
        <div className="dspec-corner__cell">
          <Zoom inner={48} />
          <p className="dspec-corner__k">{spec.wrong.k}</p>
          <p className="dspec-corner__d">{spec.wrong.t}</p>
        </div>
        <div className="dspec-corner__cell">
          <Zoom inner={24} />
          <p className="dspec-corner__k">{spec.right.k}</p>
          <p className="dspec-corner__d">{spec.right.t}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- scale: spacing and sizes at true size ---------- */
function Scale({ spec }) {
  return (
    <div className="dspec-scale">
      {spec.k && <p className="dspec-scale__k">{spec.k}</p>}
      <ul>
        {spec.rows.map((r) => (
          <li key={r.v + r.use}>
            <span className="dspec-scale__bar" style={{ width: r.v }} aria-hidden="true" />
            <span className="dspec-scale__v">{r.v}</span>
            <span className="dspec-scale__use">{r.use}{r.token && <code>{r.token}</code>}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- open: what is still wrong, and where it gets fixed ---------- */
function Open({ spec }) {
  return (
    <ul className="dspec-open">
      {spec.items.map((it) => (
        <li key={it.t}>
          <span className="dspec-open__home">{it.home}</span>
          <span className="dspec-open__t">{it.t}</span>
        </li>
      ))}
    </ul>
  );
}

const DRAW = { stats: Stats, flow: Flow, boxes: Boxes, table: Table, speakers: Speakers, faces: Faces, corners: Corners, scale: Scale, open: Open };

export function DasshSpec({ spec }) {
  const Draw = spec && DRAW[spec.type];
  if (!Draw) return null;
  return (
    <figure className={`dspec dspec--${spec.type}`}>
      <Draw spec={spec} />
      <Cap text={spec.caption} />
    </figure>
  );
}
