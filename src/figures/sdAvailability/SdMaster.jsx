// The master figure: one year of Scheduled Delivery, every series on a shared
// monthly timeline.
//
// FORM. Ten measures on ten different scales cannot share a y axis, and the
// dataviz method forbids a second one, so this is a stack of small multiples
// that share a single x axis. What makes it read as ONE picture rather than ten
// charts is the vertical event lines: full rollout, the May capacity release
// and the July electronics inflection run through every row at once, so the
// reader can see a cause in one row and its consequence three rows down.
//
// INTERACTION. Two layers, on purpose.
//   1. A crosshair anywhere in the plot reads every row for that month at once;
//      the right-hand gutter becomes a readout.
//   2. Annotation dots sit on specific points. Hovering or focusing one explains
//      why that particular moment matters. They are the reading order: if you
//      only follow the dots, you get the whole argument.
//
// Colour encodes the BAND a row belongs to (demand, money, the promise,
// supply), which is four categories on the validated categorical theme. Within
// a band, rows are told apart by their labels, never by colour.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MONTHLY, GMV_AOV, ELECTRONICS, ONTIME, SELLOUT_MONTHLY,
} from "./sdReport";
import { fmtK, fmtInr } from "./SdChartKit";

const MONTHS = [
  "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03",
  "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09",
];
const LABELS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const idx = (m) => MONTHS.indexOf(m);

// A label like "Aug 26" back to its month key.
const fromLabel = (label) => {
  const [mon, yr] = label.split(" ");
  const n = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(mon) + 1;
  return `20${yr}-${String(n).padStart(2, "0")}`;
};

// ---- the series -----------------------------------------------------------
function buildSeries() {
  const blank = () => MONTHS.map(() => null);
  const put = (arr, label, v) => { const i = idx(fromLabel(label)); if (i >= 0) arr[i] = v; };

  const sd = blank(), sdPct = blank(), cancel = blank();
  MONTHLY.forEach((m) => { const i = idx(m.m); sd[i] = m.sd; sdPct[i] = m.sdPct; cancel[i] = m.sdCancelPct; });

  const gmv = blank(), aov = blank();
  GMV_AOV.forEach((g) => { put(gmv, g.label, g.gmvCr); put(aov, g.label, g.aov); });

  const elec = blank();
  ELECTRONICS.forEach((e) => put(elec, e.label, e.shareOfSdGmv));

  const within = blank(), early = blank(), late = blank();
  ONTIME.forEach((o) => { const i = idx(o.m); within[i] = o.within; early[i] = o.early; late[i] = o.late; });

  const sellout = blank();
  SELLOUT_MONTHLY.forEach((r) => { if (r.h6) put(sellout, r.label, r.h6.so); });

  return { sd, sdPct, cancel, gmv, aov, elec, within, early, late, sellout };
}

const BANDS = [
  {
    name: "Demand",
    color: "var(--sdc-c1)",
    rows: [
      { key: "sd", label: "Scheduled orders", sub: "per month", fmt: fmtK },
      { key: "sdPct", label: "Share of all orders", sub: "of every shipment", fmt: (v) => v.toFixed(2) + "%" },
    ],
  },
  {
    name: "Money",
    color: "var(--sdc-c2)",
    rows: [
      { key: "gmv", label: "GMV", sub: "crore rupees, matched orders", fmt: (v) => "₹" + v.toFixed(0) + " Cr" },
      { key: "aov", label: "Average order value", sub: "rupees", fmt: fmtInr },
      { key: "elec", label: "Electronics share of GMV", sub: "six checkpoint months", fmt: (v) => v.toFixed(0) + "%", sparse: true },
    ],
  },
  {
    name: "The promise",
    color: "var(--sdc-ok-within)",
    rows: [
      { key: "within", label: "Within the booked hour", sub: "of delivered orders", fmt: (v) => v.toFixed(1) + "%" },
      { key: "early", label: "Arrived early", sub: "before the slot opened", fmt: (v) => v.toFixed(1) + "%", color: "var(--sdc-ok-early)" },
      { key: "late", label: "Arrived late", sub: "after the slot closed", fmt: (v) => v.toFixed(1) + "%", color: "var(--sdc-ok-late)" },
      { key: "cancel", label: "Cancelled", sub: "share of scheduled orders", fmt: (v) => v.toFixed(1) + "%", color: "var(--sdc-ok-late)" },
    ],
  },
  {
    name: "Supply",
    color: "var(--sdc-c3)",
    rows: [
      { key: "sellout", label: "6 AM slots sold out", sub: "share of open store-slot-days", fmt: (v) => v.toFixed(1) + "%" },
    ],
  },
];

// Vertical lines that run through every row.
const EVENTS = [
  { m: "2025-12", label: "Full rollout" },
  { m: "2026-05", label: "Capacity release" },
  { m: "2026-07", label: "Electronics inflection" },
];

// The reading order. Follow the dots and you get the whole argument.
const NOTES = [
  {
    row: "sd", m: "2025-10", title: "Sixteen orders, two stores",
    body: "The first scheduled record is 10 October 2025. The pilot stayed that small for three weeks before the store count started doing the work.",
  },
  {
    row: "sd", m: "2025-12", title: "Full rollout, 12 December",
    body: "1,144 stores in one step, and volume follows the store count almost exactly. Ten weeks from a two-store pilot to a national feature.",
  },
  {
    row: "within", m: "2026-02", title: "The high-water mark: 92.6%",
    body: "Every on-time number in this case is measured against this month. What happens after it looks like a collapse and is not.",
  },
  {
    row: "early", m: "2026-03", title: "Early arrivals begin here",
    body: "Two months before anyone noticed, and first in the morning slots. Whatever causes this starts well before the May capacity release, which is why the release cannot be the cause.",
  },
  {
    row: "sd", m: "2026-05", title: "The step change: 1.81M orders",
    body: "Volume jumps by half in a single month. It looks like demand arriving. It is not.",
  },
  {
    row: "sellout", m: "2026-05", title: "This is why May happened",
    body: "On a flat store count, capacity per 6 AM slot rose 64% and open early-morning slots rose 37%. Sell-outs FELL from 35.2% to 25.0% while orders doubled. The demand had been sitting behind a supply wall.",
  },
  {
    row: "late", m: "2026-05", title: "And this is what it cost",
    body: "Lateness peaked at 10.2% the same month volume jumped, worst in Delhi and Gurugram at 14%. It has recovered to about 6% since.",
  },
  {
    row: "aov", m: "2026-07", title: "Seven flat months, then a break",
    body: "Average order value sat between 930 and 982 rupees from December to June, then went 1,240, 1,401, 1,748. Nothing in the feature changed in July.",
  },
  {
    row: "elec", m: "2026-07", title: "The catalogue changed",
    body: "Electronics GMV doubled in one month, 20 crore to 42 crore, and its share of scheduled GMV went 21% to 37%. Pricier units, not more units: items sold have fallen since.",
  },
  {
    row: "gmv", m: "2026-08", title: "GMV grows while orders fall",
    body: "94 crore in May to 118 crore in August, on fewer orders each month. All of the growth is order value and none of it is adoption.",
  },
  {
    row: "cancel", m: "2026-08", title: "The largest problem in the feature",
    body: "421,145 cancelled orders in one month, about 76 crore rupees of booked basket. 58% of that value is appliances, and rebased, 95.9% of the cancellations are customers changing their minds rather than operations failing.",
  },
  {
    row: "within", m: "2026-09", title: "76.8%, and it is not a collapse",
    body: "The fall is early arrivals, not lateness. Early arrivals rate no worse than on-time ones, so 'not late' is the honest metric, and by that measure the promise has held at 93 to 96% all year.",
  },
  {
    row: "elec", m: "2026-09", title: "54% of every scheduled rupee",
    body: "More than half of scheduled GMV is now a large appliance, at 10,810 rupees an item, in only about 5% of orders. A fridge needs a time slot; a snack does not. This is a different product than the one we designed.",
  },
  {
    row: "sdPct", m: "2026-09", title: "1.39%, and nothing is holding it back",
    body: "Sell-outs are down to 7.8% at 6 AM and orders per store are down a third from the May peak. Supply stopped being the constraint and nothing replaced it. The one measurement that would say whether demand is being lost at the slot picker was never built.",
  },
];

// ---------------------------------------------------------------------------

export default function SdMaster() {
  const S = useMemo(buildSeries, []);
  const [hi, setHi] = useState(null);      // hovered month index
  const [note, setNote] = useState(null);  // hovered annotation
  const svgRef = useRef(null);

  // A hover tooltip is not an interface on a touch screen, and the scroller the
  // chart needs on a phone would clip it anyway. Where there is no hover, the
  // moments are a list instead, and the list is the same fourteen notes.
  const [listOpen, setListOpen] = useState(false);
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px), (hover: none)");
    const sync = () => { setCoarse(mq.matches); setListOpen(mq.matches); };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const W = 1000, PL = 176, PR = 74, PT = 30, ROW = 50, BAND_H = 22, AXIS = 26;
  const rowCount = BANDS.reduce((n, b) => n + b.rows.length, 0);
  const H = PT + BANDS.length * BAND_H + rowCount * ROW + AXIS;

  // lay the rows out, remembering each one's y offset and its own scale
  const laid = useMemo(() => {
    let y = PT;
    const out = [];
    BANDS.forEach((band) => {
      const bandY = y;
      y += BAND_H;
      band.rows.forEach((r) => {
        const vals = S[r.key].filter((v) => v != null);
        const lo = Math.min(...vals), hiV = Math.max(...vals);
        out.push({ ...r, band, bandY: band.rows[0] === r ? bandY : null, y, lo, hi: hiV, color: r.color || band.color });
        y += ROW;
      });
    });
    return out;
  }, [S]);

  const x = (i) => PL + (i / (MONTHS.length - 1)) * (W - PL - PR);
  const yOf = (row, v) => {
    const pad = 9;
    const span = Math.max(1e-9, row.hi - row.lo);
    return row.y + ROW - pad - ((v - row.lo) / span) * (ROW - pad * 2);
  };

  const pathFor = (row) => {
    const pts = S[row.key].map((v, i) => ({ v, i })).filter((p) => p.v != null);
    if (!pts.length) return { d: "", pts };
    // a gap in the data breaks the line rather than interpolating across it
    let d = "", prev = null;
    pts.forEach((p) => {
      const cmd = prev == null || p.i !== prev + 1 ? "M" : "L";
      d += `${cmd}${x(p.i).toFixed(1)},${yOf(row, p.v).toFixed(1)} `;
      prev = p.i;
    });
    return { d, pts };
  };

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PL) / (W - PL - PR)) * (MONTHS.length - 1));
    setHi(Math.max(0, Math.min(MONTHS.length - 1, i)));
  };

  return (
    <div className="sdm">
      <div className="sdm__plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="sdm__svg"
          onPointerMove={onMove}
          onPointerLeave={() => setHi(null)}
          role="img"
          aria-label="Every Scheduled Delivery series on one monthly timeline, October 2025 to September 2026"
        >
          {/* event lines, drawn behind everything so they read as structure */}
          {EVENTS.map((ev) => (
            <g key={ev.m} className="sdm__event">
              <line x1={x(idx(ev.m))} x2={x(idx(ev.m))} y1={PT - 6} y2={H - AXIS} />
              <text x={x(idx(ev.m))} y={PT - 12} textAnchor="middle">{ev.label}</text>
            </g>
          ))}

          {/* crosshair */}
          {hi != null && (
            <line className="sdm__cross" x1={x(hi)} x2={x(hi)} y1={PT - 6} y2={H - AXIS} />
          )}

          {laid.map((row) => {
            const { d, pts } = pathFor(row);
            const last = pts[pts.length - 1];
            const at = hi != null ? S[row.key][hi] : null;
            const shown = at != null ? at : last ? last.v : null;
            return (
              <g key={row.key}>
                {row.bandY != null && (
                  <text x={16} y={row.bandY + 14} className="sdm__band">{row.band.name}</text>
                )}
                <line className="sdm__rule" x1={PL} x2={W - PR} y1={row.y + ROW - 2} y2={row.y + ROW - 2} />
                <text x={PL - 14} y={row.y + ROW / 2 - 2} className="sdm__rowlabel" textAnchor="end">{row.label}</text>
                <text x={PL - 14} y={row.y + ROW / 2 + 10} className="sdm__rowsub" textAnchor="end">{row.sub}</text>

                <path d={d} className="sdm__line" style={{ stroke: row.color }} />
                {row.sparse && pts.map((p) => (
                  <circle key={p.i} cx={x(p.i)} cy={yOf(row, p.v)} r={2} style={{ fill: row.color }} className="sdm__pt" />
                ))}
                {hi != null && at != null && (
                  <circle cx={x(hi)} cy={yOf(row, at)} r={4} className="sdm__dot" style={{ fill: row.color }} />
                )}
                {shown != null && (
                  <text
                    x={W - PR + 10}
                    y={row.y + ROW / 2 + 3}
                    className={"sdm__value" + (hi != null && at == null ? " is-empty" : "")}
                    style={{ fill: row.color }}
                  >
                    {hi != null && at == null ? "no data" : row.fmt(shown)}
                  </text>
                )}
              </g>
            );
          })}

          {/* the annotations: follow these and you get the whole argument */}
          {NOTES.map((n, k) => {
            const row = laid.find((r) => r.key === n.row);
            const i = idx(n.m);
            const v = S[n.row][i];
            if (!row || v == null) return null;
            const cx = x(i), cy = yOf(row, v);
            const on = note?.k === k;
            return (
              <g
                key={k}
                className={"sdm__note" + (on ? " is-on" : "")}
                tabIndex={0}
                role="button"
                aria-label={`${n.title}. ${n.body}`}
                onPointerEnter={() => setNote({ k, cx, cy, ...n })}
                onPointerLeave={() => setNote(null)}
                onFocus={() => setNote({ k, cx, cy, ...n })}
                onBlur={() => setNote(null)}
              >
                <circle cx={cx} cy={cy} r={11} className="sdm__note-hit" />
                <circle cx={cx} cy={cy} r={5.5} className="sdm__note-ring" />
                <circle cx={cx} cy={cy} r={2.5} className="sdm__note-core" />
              </g>
            );
          })}

          {/* shared month axis */}
          {LABELS.map((l, i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              className={"sdm__tick" + (hi === i ? " is-on" : "")}
              textAnchor="middle"
            >
              {l}
            </text>
          ))}
          <text x={x(0)} y={H - 8} className="sdm__tick sdm__tick--year" textAnchor="middle" dy={-12}>2025</text>
          <text x={x(3)} y={H - 8} className="sdm__tick sdm__tick--year" textAnchor="middle" dy={-12}>2026</text>
        </svg>

        {note && (
          <div
            className={"sdm__tip" + (note.cx > W * 0.62 ? " is-left" : "")}
            style={{ left: `${(note.cx / W) * 100}%`, top: `${(note.cy / H) * 100}%` }}
          >
            <strong>{note.title}</strong>
            <span>{note.body}</span>
          </div>
        )}
      </div>

      <div className="sdm__foot">
        <p className="sdm__hint">
          <span className="sdm__hint-dot" aria-hidden="true" />
          {coarse
            ? "Each dot is a moment worth reading; they are listed below in order. Drag the chart sideways for the rest of the year."
            : "Hover a dot for why that month matters. Hover anywhere else to read every row at once."}
        </p>
        <button
          type="button"
          className="sdm__toggle"
          aria-expanded={listOpen}
          aria-controls="sdm-moments"
          onClick={() => setListOpen((o) => !o)}
        >
          {listOpen ? "Hide the moments" : `Read all ${NOTES.length} moments`}
        </button>
      </div>

      {listOpen && (
        <ol className="sdm__list" id="sdm-moments">
          {NOTES.map((n, k) => (
            <li
              key={k}
              className={note?.k === k ? "is-on" : undefined}
              onPointerEnter={() => {
                const row = laid.find((r) => r.key === n.row);
                const v = S[n.row][idx(n.m)];
                if (row && v != null) setNote({ k, cx: x(idx(n.m)), cy: yOf(row, v), ...n });
              }}
              onPointerLeave={() => setNote(null)}
            >
              <span className="sdm__list-when">{LABELS[idx(n.m)]} {n.m.startsWith("2025") ? "25" : "26"}</span>
              <span className="sdm__list-body">
                <strong>{n.title}</strong>
                {n.body}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
