// THE TIMELINE, REBUILT FROM SCRATCH (2026-08-07).
//
// What it replaces: HelloTimeline.jsx (1155 lines) + timelineViews.js +
// TimelineLenses.jsx (719 lines), which between them carried four axis shapes,
// six lenses, two record strips, three tooltip surfaces and four "Show"
// toggles. Everything drew the same eight years a different way, and no two
// ways were built the same, so a fix in one never landed in the others.
//
// ── THE ONE PRIMITIVE ───────────────────────────────────────────────────────
// There is exactly one thing on this page: a ROW.
//
//   [ name · kind · dates · role ] [ ————— bar ————— •ship ]
//                                  [ outcome, printed      ]
//
// Name in a fixed left gutter, a proportional track to its right, one row per
// entry, oldest first. Nothing floats, nothing is positioned against anything
// else, so two labels can never contend for space — which is what forced the
// old collision solver into existence. A problem you get by choosing to put
// labels on one strip is a problem you can stop choosing.
//
// ── ONE READING, NO LENS SWITCHER ───────────────────────────────────────────
// x is the calendar, May 2018 to now. Bars are tenures, dots are ships.
//
// The rebuild briefly shipped three lenses (Record, Share, Cadence) as three
// x-axis meanings over this same renderer, down from the old build's six
// constructions. They are now cut to one. Share re-sorted the same ten rows by
// duration and Cadence measured the gaps between ships — both were readings a
// visitor can take off the calendar themselves, and a switcher that offers a
// rearrangement of what is already on screen asks for a decision without
// offering a reason to make it.
//
// The shape it left behind is still the right one, so it is written down: a
// reading declares what the track's width MEANS and returns
// { unit, note, ticks[], rows[] }; the renderer below never learns which one it
// is drawing. If a second reading ever earns its place, add a builder and a
// switcher — do not fork the renderer.
//
// ── ALL INFO ALWAYS PRESENT ─────────────────────────────────────────────────
// Nothing is behind a hover and nothing is behind a toggle. Every org, kind,
// role, real month range, hedge and outcome is printed as text, and so is every
// ship's brand, date and title. There are no tooltips in this file, and the
// "Show" control group is gone: a control that hides the subject was never a
// feature. Colour is therefore decoration on top of a record that already reads
// in plain text, which is also what makes it survive a screen reader.
//
// Months, never decimal years. lensModels.js works in whole-month indices, and
// this file borrows its parsers rather than re-deriving them — the stored `at`
// decimals in helloData are hand-written approximations that render three equal
// five-month gaps at three different widths.

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ROLES, TENURES } from "./helloData";
import { feedback, feedbackCoalesced } from "../ui/feedback";
import RailColumn from "./RailColumn";
import RailBand from "./RailBand";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "../figures/ds/hooks";
// SHIPS ARE GONE FROM THIS TIMELINE (Agam, 2026-08-11: "remove all the shipped
// related content"). `shipMonth` and `shipsOldestFirst` are still exported by
// lensModels and still used elsewhere; nothing in this file reads them any more,
// so the import goes rather than sitting here unused.
import { lensDomain, loadModel, ym, ymLabel } from "./lensModels";
import { marketModel } from "./marketModel";
// DITHER KIT, INSTALLED (Agam: "install the other library to build the graph
// exactly"). This reverses the file header's standing note that dither-kit was
// taken as a LOOK and not as a dependency — that call held while the only thing
// wanted was the texture on a Gantt bar, and stopped holding the moment the ask
// was an area chart, which is the thing the kit actually builds.
import { AreaChart } from "@/components/dither-kit/area-chart";
import { Area } from "@/components/dither-kit/area";
import { BlockLegend } from "@/components/dither-kit/block-legend";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import "./timeline.css";

// The word each kind IS. A bar with no noun is a coloured line and nothing more.
const KIND_WORD = {
  employment: "Employment",
  study: "Degree",
  internship: "Internship",
  research: "Research",
  venture: "Venture",
};

// SHIPS REMOVED (Agam, 2026-08-11). What stood here was the SHIP_ROW map from
// project to the tenure that produced it, and a `shipWhen` date formatter. Both
// existed only to place and label the ship dots; with the dots, the chips, the
// legend and the "Shipped:" lines all gone, they had no readers left.
// The projects themselves are untouched - they live in the case studies and in
// the phone marquee, which is where this record points at them.

// A tenure's inclusive month range. `end: null` runs to the current month.
function range(t, domain) {
  return { s: ym(t.start), e: t.end ? ym(t.end) : domain.m1 };
}

// "Jul 2021 to Jun 2022 (12 months)" — the dates and the duration, spelled out,
// because "how long was that" is the question a bar's width only approximates.
//
// An open span always ends "present", and does NOT splice in the row's own
// `endNote`. The two open rows carry different words for the same fact — Zepto
// says "present", Away says "ongoing" — so reading the field verbatim produced
// "Jan 2026 to ongoing", which is not a sentence. `endNote` is a note about the
// span, not the second half of a date range, and this is the only place left in
// the codebase that reads it.
function spanWords(t, s, e) {
  const n = e - s + 1;
  const end = t.end ? ymLabel(e) : "present";
  const note = t.datesNote ? ` (${t.datesNote})` : "";
  return `${ymLabel(s)} to ${end}${note} · ${n} ${n === 1 ? "month" : "months"}`;
}

// ── THE READING ─────────────────────────────────────────────────────────────
// Returns the shape the renderer consumes: a set of ruler ticks and a set of
// rows, where a row is a gutter of printed facts plus a bar and any marks in
// 0..100 across the track.
//
//   { note, unit, ticks: [{x, label}], rows: [{ id, name, sub, dates, role,
//     outs: [], bar: {x0, x1, accent, kind}, marks: [{...}] }] }

// A tick is centred on its mark, EXCEPT at the two ends, where half of it would
// fall outside the track and get clipped by the section's padding. Computed
// here rather than with :first-child/:last-child, because "first" and "at the
// left edge" are not the same thing: Record's first tick is Jan 2019 sitting 8%
// in, and anchoring that one flush left would put it 20px off its own year.
function tick(x, label) {
  return { x, label, align: x < 2 ? "start" : x > 98 ? "end" : "mid" };
}

// ── DRAW STYLES ─────────────────────────────────────────────────────────────
// A style changes HOW the marks are drawn. It never changes what they mean, and
// it never changes the layout — same rows, same positions, same printed text.
// That is the whole difference between this toggle and the lens switcher that
// was cut earlier: a lens asked the reader to pick a READING, which is a
// decision with consequences; a style asks nothing and costs nothing to ignore.
//
// FROM dither-kit (tripwire.sh/dither-kit), the reference Agam gave. Taken as a
// LOOK, not as a dependency: it is a canvas engine shipping area/bar/pie/radar
// components for shadcn, and none of those is a Gantt row — this project has
// Tailwind but no shadcn, and there is no chart here to swap out. So the
// ordered-dot fill is rebuilt in CSS against the marks this timeline already has.
//
// THE ONE THING DELIBERATELY NOT BORROWED IS THE DENSITY RAMP. dither-kit varies
// dot density to encode magnitude, which is exactly right for its area charts.
// Here a bar's magnitude is already its LENGTH, so density that varied would be
// a second and contradictory encoding — a picture of data this record does not
// contain. The dither is UNIFORM, and that is a subtraction from the reference
// made on purpose, not an incomplete copy of it.
const STYLES = {
  solid: { label: "Solid" },
  dither: { label: "Dither" },
  scrub: { label: "Scrub" },
  rail: { label: "Rail" },
  // A COPY OF DITHER, not a replacement for it (annotation msk1dnp4). Dither
  // draws how MANY things ran at once; Market draws the same record as a
  // ticker, where real moments move a line and the wander between them is
  // invented texture. Two readings of one record, both kept.
  market: { label: "Market" },
};
const STYLE_KEYS = Object.keys(STYLES);

// HOW THE SPINE ITSELF IS DRAWN (annotation msmxjgof: "add a control at div
// level to create 2 more modes [for] these timeline vertical line - glass,
// gradient").
//
// A DRAW MODE, not a reading. Same ticks, same heights, same months - only the
// fill changes - which is the test this codebase already applies to Solid vs
// Dither: if a control rebuilds the model it is a reading and belongs in the
// tabs above; if it only changes how the marks are painted it belongs to the
// drawing, which is why this control lives inside the rail rather than beside
// the five style tabs.
const TICKS = {
  ink: { label: "Ink", hint: "solid" },
  glass: { label: "Glass", hint: "frosted, lit from the top" },
  gradient: { label: "Gradient", hint: "dense at the base, gone at the tip" },
};
const TICK_KEYS = Object.keys(TICKS);

// Small numbers read better as words in a sentence, and this one is always
// small — it is the number of shipped projects on one person's record.
const COUNT = { 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight" };

// The series config is BUILT WITH THE DATA now (see marketModel), because the
// set of projects and their colours are one decision and splitting them across
// two files is how a chart ends up with a legend that disagrees with its bands.

function recordLens() {
  const domain = lensDomain();
  const span = domain.m1 - domain.m0 || 1;
  const pct = (m) => ((m - domain.m0) / span) * 100;

  const rows = TENURES.map((t) => {
    const { s, e } = range(t, domain);
    return {
      t,
      s,
      id: t.id,
      name: t.org,
      sub: KIND_WORD[t.kind] || t.kind,
      dates: spanWords(t, s, e),
      role: t.role || null,
      outs: t.outcomes || [],
      kind: t.kind,
      // +1 so the end month is INSIDE the bar: a role that ran to Jun 2022
      // occupied June, and a bar stopping at the start of June says it did not.
      bar: { x0: pct(s), x1: pct(e + 1), accent: t.accent, kind: t.kind },
    };
  }).sort((a, b) => a.s - b.s || a.bar.x1 - b.bar.x1);

  const ticks = [];
  for (let y = Math.ceil(domain.m0 / 12); y <= Math.floor(domain.m1 / 12); y++) {
    ticks.push(tick(pct(y * 12), String(y)));
  }
  return {
    unit: "The calendar, oldest at the top.",
    // The second half of this line described the ship dots and the AIIMS paper's
    // position among them. Both are gone, so the sentence stops where the bars do.
    note: "Every year of the record, one row each. A bar is how long the thing ran.",
    ticks,
    rows,
  };
}

// ── ONE DETAIL RECORD, SHARED BY EVERY VISUALISATION ────────────────────────
// Solid prints the record. The other three tabs do NOT (Agam, 2026-08-07:
// "incorporate all the details with the visualisations themselves ... don't
// write it in text ... add them through interactions, hovers, clicks, legends"),
// so each has to be able to surface the same facts on demand.
//
// This is the one place those facts are assembled. If a visualisation invents
// its own subset, the tabs start disagreeing about what the record says, which
// is the exact failure the rebuild deleted six constructions to end.
// ROLES is keyed by display name ("CaratLane") while a tenure's `org` is the
// legal one ("CaratLane - A Tanishq Partnership"), so match on either.
function roleHeadline(org) {
  if (!org) return null;
  const direct = ROLES[org];
  if (direct?.headline) return direct.headline;
  const byCompany = Object.values(ROLES).find((r) => r.company === org);
  return byCompany?.headline || null;
}

// Exported so the frozen /lab snapshot can build the same record the live
// section does without reimplementing it (the vertical timeline v1 specimen).
export function detailsById() {
  const domain = lensDomain();
  const map = new Map();
  TENURES.forEach((t) => {
    const { s, e } = range(t, domain);
    map.set(t.id, {
      id: t.id,
      org: t.org,
      kind: KIND_WORD[t.kind] || t.kind,
      rawKind: t.kind,
      role: t.role ? t.role.replace(" → ", ", then ") : null,
      dates: spanWords(t, s, e),
      // The SHORT span, for the opened rail card (Agam, 2026-08-11: a card leads
      // with "company name, role and timeline"). `dates` above spells the whole
      // thing out - note, month count and all - which is right in the printed
      // rows and too long for a label above three bullets.
      span: `${ymLabel(s)} to ${t.end ? ymLabel(e) : "present"}`,
      outs: t.outcomes || [],
      // ONE SUMMARY PER ORGANISATION, not a list (the user's note: "single
      // summary for each title should be just one, not multiple per
      // organisation name - eg zepto has multiple").
      //
      // Nothing is invented for this. Three of the tenures already carry a
      // one-line headline in ROLES - written to be exactly this - and it is what
      // the case-study pages use. The rest have a single outcome, which already
      // reads as a summary. Zepto was the visible offender because its
      // `outcomes` is ROLES.Zepto.bullets: four PROJECTS, which is a list of
      // what was shipped rather than an answer to "what is this".
      //
      // The full list is not lost - it is still `outs`, still on the case
      // studies, and still what the printed rows under Solid show.
      summary: t.summary || roleHeadline(t.org) || t.outcomes?.[0] || null,
      accent: t.accent,
    });
  });
  return map;
}

// The panel every visualisation hands its hovered thing to. One component, so a
// tenure reads identically whichever drawing surfaced it.
function Detail({ d, fallback }) {
  // The `ship` branch that led this component is gone (2026-08-11): a pointed-at
  // ship had its own four-line record here. Nothing surfaces a ship any more, so
  // every caller now hands over a tenure or nothing.
  if (!d) {
    return (
      <div className="tlx__detail" data-empty="true" aria-live="polite">
        <p className="tlx__detail-hint">{fallback}</p>
      </div>
    );
  }
  return (
    <div className="tlx__detail" aria-live="polite">
      <p className="tlx__detail-kind">{d.kind}</p>
      <p className="tlx__detail-org">{d.org}</p>
      {d.role && <p className="tlx__detail-role">{d.role}</p>}
      <p className="tlx__detail-dates">{d.dates}</p>
      {d.outs.map((o, i) => (
        <p className="tlx__detail-out" key={i}>
          {o}
        </p>
      ))}
    </div>
  );
}

// ── THE GRAPH (dither style only) ───────────────────────────────────────────
// The rows answer "when was each thing". This answers a question they can only
// show by stacking: HOW MANY THINGS AT ONCE. It is a real series — one value per
// lived month — not a decoration, which is the bar this had to clear before it
// was worth drawing at all.
//
// The data was already written. `loadModel()` has been sitting in lensModels.js
// UNCALLED since the rebuild deleted the Load lens; it resolves every month into
// a base (whatever held the field) plus riders (what ran alongside), which is
// exactly a two-series stacked area. Nothing new was derived for this.
//
// STEPPED, NOT SMOOTHED. The reference chart curves because its data is
// continuous; a count of concurrent commitments changes on a month boundary and
// holds. Interpolating between 1 and 2 would draw months at 1.4 commitments,
// which never happened.
function chartModel() {
  const lm = loadModel();
  const n = lm.months.length;
  const max = lm.max;
  const x = (i) => (i / n) * 100;
  const y = (v) => 100 - (v / max) * 100;

  // The top edge of a series as a step: hold each month's value across its own
  // width, then jump. Emitted as clip-path percentages.
  const edge = (values) => {
    const pts = [];
    values.forEach((v, i) => {
      pts.push([x(i), y(v)]);
      pts.push([x(i + 1), y(v)]);
    });
    return pts;
  };

  const field = lm.months.map((c) => (c.field ? 1 : 0));
  const total = lm.months.map((c) => c.count);
  const fieldEdge = edge(field);
  const fmt = (pts) => pts.map(([px, py]) => `${px.toFixed(2)}% ${py.toFixed(2)}%`).join(", ");

  // THE FLOOR, SEGMENTED BY WHO HELD IT. It used to be one clipped band, which
  // was honest and completely inert: the field sits at exactly 1 for all 100
  // months because something always held it, so the biggest area on the chart
  // said only "occupied". Cutting it into runs makes the same area carry the
  // handover sequence instead — UPES, then the two months Cyware held alone
  // after graduation, then CaratLane, Deutsche Bank, Zepto.
  //
  // These are RECTANGLES, not clipped paths: the field is always exactly 1 or
  // absent, so a run is a plain box and clip-path would be machinery for a
  // shape that has no shape.
  const runs = [];
  lm.months.forEach((c, i) => {
    const id = c.field ? c.field.t.id : null;
    if (!id) return;
    const last = runs[runs.length - 1];
    if (last && last.id === id && last.i1 === i - 1) last.i1 = i;
    else runs.push({ id, org: c.field.t.org, i0: i, i1: i });
  });
  const floor = runs.map((r) => ({
    key: `${r.id}-${r.i0}`,
    // The tenure id, and it is load-bearing: the detail panel looks the record
    // up by it. Left out of this mapping at first, so hovering a run set the
    // hot state and highlighted correctly while the panel showed its empty
    // fallback — a bug that looks like the panel is broken when the miss is
    // three functions upstream.
    id: r.id,
    org: r.org,
    x: x(r.i0),
    w: x(r.i1 + 1) - x(r.i0),
    months: r.i1 - r.i0 + 1,
  }));
  // WHAT RAN ALONGSIDE, AS NAMED RUNS RATHER THAN ONE ANONYMOUS BAND. It used
  // to be a single clipped polygon between the field edge and the total edge:
  // the right SHAPE, but it could not tell you which venture or internship any
  // given bulge was. Cut the same way the floor is — contiguous months carrying
  // the same rider at the same stacked level become one box — so every part of
  // the chart is a thing with a name and something to say when pointed at.
  const riderRuns = [];
  lm.months.forEach((c, i) => {
    const base = c.field ? 1 : 0;
    c.riders.forEach((t, k) => {
      const level = base + k;
      const open = riderRuns.find(
        (r) => r.id === t.id && r.level === level && r.i1 === i - 1,
      );
      if (open) open.i1 = i;
      else riderRuns.push({ id: t.id, org: t.org, level, i0: i, i1: i });
    });
  });
  const riders = riderRuns.map((r) => ({
    key: `${r.id}-${r.level}-${r.i0}`,
    id: r.id,
    org: r.org,
    x: x(r.i0),
    w: x(r.i1 + 1) - x(r.i0),
    top: y(r.level + 1),
    h: y(r.level) - y(r.level + 1),
  }));

  const years = [];
  for (let m = lm.domain.m0; m <= lm.domain.m1; m++) {
    if (m % 12 === 0) years.push({ x: x(m - lm.domain.m0), label: String(m / 12) });
  }
  const ticks = [];
  for (let v = 0; v <= max; v++) ticks.push({ v, y: y(v) });

  // The floor band's own box, so the CSS does not have to re-derive where "1"
  // is on an axis whose top is `max`.
  const floorTop = y(1);
  return { floor, floorTop, floorH: 100 - floorTop, riders, years, ticks, max, months: n };
}

// ── THE SCRUB (scrub style only) ────────────────────────────────────────────
// One dash per lived month, scrubbed a month at a time, with that month's
// record above it. The form is taken from Great UI's RevisionTimeline (the
// reference Agam pasted): a dash strip that slides to keep the active mark
// centred, dash heights falling off on a gaussian around it.
//
// REBUILT, NOT ADOPTED. That component is TypeScript + Tailwind class strings +
// framer-motion + shadcn's `cn` and `@/lib/utils`; this file is plain CSS with
// design tokens and no motion library. More to the point its DATA MODEL is a
// changelog — revisions keyed by day, padded with 31 empty days before and 30
// after — and the record here is 100 continuous months with no padding needed
// and no empty days to invent. Only the interaction survived the port.
//
// WHAT WAS KEPT: the gaussian falloff (sigma 4.5, straight from the reference,
// because it is the thing that makes the strip read as a dial rather than a
// bar chart), the centre-the-active-mark translation, and the edge mask.
// WHAT WAS DROPPED: the major/minor dash kinds (both presets in the reference
// are byte-identical, so the distinction does not exist), the empty past and
// future padding (this record has a real first month and a real last one), and
// framer-motion (a height and a translate are two CSS transitions).
// WHICH RAIL A PHONE GETS. "band" is the horizontal rail (RailBand.jsx, the
// current default); "column" is the vertical rail (RailColumn.jsx, frozen as v1
// in /lab); "scrub" is the older horizontal scrubber, kept whole and still wired
// so putting any of them back is this word rather than a revert. All touch-only
// - the desktop magnifier is untouched by any of them.
const RAIL_LAYOUT = "band";

const SIGMA = 4.5;
const DASH_MIN = 10;
const DASH_MAX = 46;

// Exported for the frozen /lab vertical-timeline v1 specimen (see detailsById).
export function scrubModel() {
  const lm = loadModel();
  const months = lm.months.map((c) => ({
    m: c.m,
    label: ymLabel(c.m),
    field: c.field ? { org: c.field.t.org, role: c.field.t.role || null, kind: c.field.t.kind } : null,
    fieldId: c.field ? c.field.t.id : null,
    // THE ID TRAVELS WITH THE RIDER. Without it a rider is just a name, and the
    // rail had no way to look up the record for a tenure that was not the
    // month's field - which is why Toppr, Siemens, AIIMS and Cyware all showed
    // the DEGREE's summary, and Dassh and Away showed Zepto's.
    riders: c.riders.map((t) => ({ id: t.id, org: t.org, kind: t.kind, role: t.role || null })),
    count: c.count,
  }));
  // The year layer for the rail (annotation msk1hbse). Derived here rather than
  // in the component because it is a property of the RECORD's span, not of the
  // drawing — the same reason the ticks live in the reading and not the renderer.
  // x is a share of the strip, so it lands on the same grid as the month rows.
  //
  // `i` travels with the label because on touch the year layer is not decoration
  // any more - it is the JUMP CONTROL, and a jump needs the month index to scrub
  // to. Deriving it in the component would mean re-deriving "which row is this
  // January" from a percentage, which is the same number twice.
  const years = [];
  months.forEach((c, i) => {
    if (c.m % 12 === 0) years.push({ label: String(c.m / 12), x: (i / months.length) * 100, i });
  });

  // EVERY TENURE AS ITS OWN RESTING CARD (annotation msk2bq5f, "just like zepto
  // card, can all cards be visible"). Cut the same way Dither cuts its floor:
  // contiguous months carrying the same holder become one run, so the labels
  // describe SPANS rather than repeating themselves once per month.
  //
  // LANE-PACKED, because ten cards across 500px will not sit on one line. Each
  // run takes the first lane whose last card has already ended, which is the
  // cheap interval-packing every Gantt does — and the reason the runs are sorted
  // by start first. The width is estimated from the org's own text rather than
  // measured: a measurement would need a layout pass per card and this only has
  // to be right enough to stop two labels touching.
  // EVERY tenure, not just the base layer. A first pass read `c.field` alone and
  // produced five cards for ten tenures — the five it dropped are exactly the
  // ones that ran ALONGSIDE something else (Toppr, Siemens, AIIMS, Dassh, Away),
  // which on a record whose whole point is that things overlapped is the worst
  // possible half to lose.
  //
  // So a month contributes its field AND its riders, and a run is contiguous
  // months carrying the same org at either level. Keyed by org rather than by
  // slot, so a project that starts as a rider and becomes the field — or the
  // reverse — stays one card instead of splitting in two.
  const open = new Map();
  const runs = [];
  months.forEach((c, i) => {
    const here = [
      ...(c.field ? [{ id: c.fieldId, org: c.field.org, role: c.field.role || null }] : []),
      ...c.riders.map((r) => ({ id: r.id, org: r.org, role: r.role || null })),
    ];
    for (const e of here) {
      const cur = open.get(e.org);
      if (cur && cur.i1 === i - 1) {
        cur.i1 = i;
        // the later role wins: a run that spans a promotion should name where it
        // got to, which is what the printed rows do too
        if (e.role) cur.role = e.role;
      } else {
        const run = { id: e.id, org: e.org, role: e.role, i0: i, i1: i };
        open.set(e.org, run);
        runs.push(run);
      }
    }
  });
  runs.sort((p, q) => p.i0 - q.i0);
  // NO LANES HERE. A first pass packed them in the model off an ESTIMATED width
  // (characters x 6.2px) and it was wrong by a factor of three, because a card
  // is the org tag AND the role tag — "UPES, Dehradun" plus "B.Des, Interaction
  // Design" measures 295px against the ~110 the estimate predicted. Two pairs
  // overlapped and the set ran 132px off the right edge.
  //
  // Text width is not something a model can know: it depends on the face, the
  // tracking, the tag's padding and the reader's own font settings. So the model
  // says only WHERE each card belongs and the component measures the rest.
  const cards = runs.map((r) => ({
    key: `${r.org}-${r.i0}`,
    // the tenure this run came from, so the card can fetch its OWN record
    tid: r.id,
    org: r.org,
    role: r.role,
    x: (r.i0 / months.length) * 100,
    // THE RUN'S OWN SPAN, carried through so the component can ask "is the month
    // under the pointer inside this card's tenure" (annotations msmnyhki /
    // msmpa2ka, "the card that appears on hover should be merged with these
    // elements"). Without it there is no way to match the moving readout to one
    // of the ten resting cards, which is the whole basis of the merge.
    i0: r.i0,
    i1: r.i1,
  }));

  return { months, n: months.length, years, cards };
}

// The strip itself. Kept as its own component so the 100 dashes re-render on
// scrub without dragging the whole section with them.
function Scrub({ model, details, reduce }) {
  // The month that renders the most lines — the one the container has to be able
  // to hold. Counted from the same fields the card prints, so it cannot drift
  // from what is actually drawn.
  const tallest = useMemo(() => {
    let best = model.months[0];
    let bestN = -1;
    for (const c of model.months) {
      const outs = c.field ? details.get(c.fieldId)?.outs.length || 0 : 0;
      const n = 1 + (c.riders.length ? 1 : 0) + outs;
      if (n > bestN) {
        bestN = n;
        best = c;
      }
    }
    return best;
  }, [model.months, details]);
  const tallestDetail = tallest.field ? details.get(tallest.fieldId) : null;

  // Opens on the LAST month, which is now. A record scrubber that opened in
  // 2018 would ask you to travel to the present to see the present.
  const [active, setActive] = useState(model.n - 1);

  // NO TRANSLATION, AND THAT IS A REAL SUBTRACTION FROM THE REFERENCE. Its
  // strip slides to keep the active mark centred because its strip OVERFLOWS —
  // 161 dashes once the 31 past and 30 future padding days are added. This one
  // holds 100 months and they fit the container, so a hundred marks can simply
  // be laid across it.
  //
  // Sliding here would also have been a lie in the interface: the range input
  // below shows the value as a PROPORTIONAL position, and a strip that always
  // re-centres shows it in the middle no matter what. Built that way first, and
  // the thumb and the hump visibly disagreed — one value drawn in two places.
  // Static strip, moving hump, and the two now line up.

  // `kind` names what MOVED the value, because the same setter serves three
  // different gestures and they are not the same event (annotation msmqar1v):
  //   "select"   an arrow - a discrete choice, one press (the ship chips that
  //              were the other source of these are gone)
  //   "navigate" the range drag - continuous, and therefore coalesced
  // Dragging the range crosses up to a hundred months in about a second, and
  // the uncoalesced `select` this used to fire on every one of them was exactly
  // the "forty feedbacks for one gesture" §6 prohibits.
  const go = useCallback(
    (next, kind = "select") => {
      const i = Math.max(0, Math.min(model.n - 1, next));
      setActive((prev) => {
        if (i === prev) return prev;
        // THE ENDS ARE A BOUNDARY, NOT A REJECT. Running the arrows into the
        // first or last month is not an error - the spec is explicit that
        // confusing the two teaches people the interface is scolding them for
        // reading to the end.
        if (kind === "navigate") feedbackCoalesced("navigate");
        else if (i === 0 || i === model.n - 1) feedback("boundary");
        else feedback("select");
        return i;
      });
    },
    [model.n],
  );

  const cur = model.months[active];
  const fieldDetail = cur.field ? details.get(cur.fieldId) : null;

  return (
    <div className="tlx__scrub">
      {/* The month's record, above the dial. Everything this panel shows is
          also printed in the rows below — the scrub is a way THROUGH the
          record, never the only copy of it. */}
      {/* ONE HEIGHT ACROSS THE WHOLE SCRUB (annotation msk2epqe). Measured
          before: the container swung from 269px to 409px as you dragged,
          because a month in 2018 has a line and a month in 2026 has four
          outcomes. A panel that grows under the dial pushes the dial itself
          down, so the thing you are dragging moves away from your finger.

          RESERVED BY RENDERING THE WORST CASE, not by a typed min-height. The
          two cards are stacked in one grid cell, so the box is always as tall as
          the FATTEST month — computed at any width, in any font, without a
          number that goes stale the first time an outcome line is edited. The
          ghost is inert: aria-hidden, no pointer events, invisible.

          `visibility: hidden` rather than `display: none`, because a hidden box
          still takes its space and a removed one does not — which is the entire
          mechanism. */}
      <div className="tlx__scrub-stack">
        <div className="tlx__scrub-card" aria-live="polite">
        <p className="tlx__scrub-month">{cur.label}</p>
        {cur.field ? (
          <p className="tlx__scrub-field">
            <b>{cur.field.org}</b>
            {cur.field.role ? ` · ${cur.field.role.replace(" → ", ", then ")}` : ""}
          </p>
        ) : (
          <p className="tlx__scrub-field">Nothing held the field this month.</p>
        )}
        {cur.riders.length > 0 && (
          <p className="tlx__scrub-riders">
            Alongside: {cur.riders.map((r) => r.org).join(", ")}
          </p>
        )}
        {/* THE OUTCOMES OF WHATEVER HELD THE MONTH. Without these the card said
            who and when but never what came of it, which is the half of the
            record that is actually worth reading. */}
        {fieldDetail &&
          fieldDetail.outs.map((o, i) => (
            <p className="tlx__scrub-out" key={i}>
              {o}
            </p>
          ))}
        </div>
        <div className="tlx__scrub-card tlx__scrub-card--ghost" aria-hidden>
        <p className="tlx__scrub-month">{tallest.label}</p>
        {tallest.field ? (
          <p className="tlx__scrub-field">
            <b>{tallest.field.org}</b>
            {tallest.field.role ? ` · ${tallest.field.role.replace(" → ", ", then ")}` : ""}
          </p>
        ) : (
          <p className="tlx__scrub-field">Nothing held the field this month.</p>
        )}
        {tallest.riders.length > 0 && (
          <p className="tlx__scrub-riders">
            Alongside: {tallest.riders.map((r) => r.org).join(", ")}
          </p>
        )}
        {/* THE OUTCOMES OF WHATEVER HELD THE MONTH. Without these the card said
            who and when but never what came of it, which is the half of the
            record that is actually worth reading. */}
        {tallestDetail &&
          tallestDetail.outs.map((o, i) => (
            <p className="tlx__scrub-out" key={i}>
              {o}
            </p>
          ))}
        </div>
      </div>

      <div className="tlx__scrub-nav">
        <button
          type="button"
          className="tlx__scrub-btn"
          onClick={() => go(active - 1)}
          disabled={active === 0}
          aria-label="Previous month"
        >
          &#8592;
        </button>
        <button
          type="button"
          className="tlx__scrub-btn"
          onClick={() => go(active + 1)}
          disabled={active === model.n - 1}
          aria-label="Next month"
        >
          &#8594;
        </button>
      </div>

      {/* THE RANGE NOW LIES INVISIBLY OVER THE DASHES (annotation msl5zwgy,
          "scrub should be inherent, don't need this slider"): the strip itself
          is the scrub surface - drag the dashes and the value follows - and
          the visible thumb row above it is gone. The native range STAYS as
          the real control underneath the pointer: it holds the value, so
          keyboard and screen-reader users keep arrows, Home and End, and
          focus draws its ring around the strip. It sits INSIDE the strip but
          aria-hidden moved down to the dash row, or the one real control here
          would be inside a hidden subtree. */}
      <div className="tlx__scrub-strip">
        <div className="tlx__scrub-track">
          <input
            className="tlx__scrub-range"
            type="range"
            min={0}
            max={model.n - 1}
            value={active}
            onChange={(e) => go(Number(e.target.value), "navigate")}
            aria-label={`Month: ${cur.label}`}
            aria-valuetext={cur.label}
          />
        </div>
        <div className="tlx__scrub-row" aria-hidden data-reduce={reduce ? "true" : undefined}>
          {model.months.map((mo, i) => {
            // The gaussian is the whole character of the reference: neighbours
            // are carried part of the way up with the active mark, so the strip
            // reads as one surface being lifted rather than one mark changing.
            const d = i - active;
            const f = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
            const h = DASH_MIN + (DASH_MAX - DASH_MIN) * f;
            return (
              <span
                key={mo.m}
                className="tlx__dash"
                data-active={i === active ? "true" : undefined}
                style={{ "--h": `${h.toFixed(1)}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* The row of ship chips that sat here - a jump-to-that-month control for
          each of the six shipped projects - is gone with the rest of the ship
          content (2026-08-11). The arrows and the range are still the way
          through the record; what is lost is only the shortcut to six specific
          months. */}
    </div>
  );
}

// ── THE RAIL (rail style only) ──────────────────────────────────────────────
// A vertical spine of the same 100 months, magnified under the pointer like a
// dock, with the month's record following in a card. Form taken from Ruixen's
// ChapterScrubber (the reference Agam pasted).
//
// TWO THINGS FROM THE REFERENCE ARE BETTER THAN WHAT SCRUB ALREADY DOES, and
// they are the reason this is worth building rather than rotating Scrub:
//
//   1. A RAISED-COSINE BUMP instead of a gaussian. 0.5*(1+cos(pi*d/r)) is
//      exactly 1 at the crest, exactly 0 at the radius, and has ZERO SLOPE at
//      both ends. A gaussian never actually reaches zero, so its wave has a
//      faint seam where it is truncated. Scrub's dial uses the gaussian and is
//      fine at its size; at this one's amplitude the seam would show.
//   2. ONE POINTER VALUE drives every tick. No per-tick state and no re-render
//      on pointer move — each tick reads its own rise from the distance to a
//      single motion value, which is why a hundred of them track a cursor.
//
// `motion/react` is used here and NOT considered a new dependency: it is
// already in package.json and already used exactly this way in
// figures/physicality/PhysicalSheet.jsx.
// THE CARDS THAT SIT UNDER THE RAIL rather than above it, by name.
//
// Not a rule and not derived from anything - Agam moved these individually
// (msmpfmk9 Deutsche Bank, msmq5h81 CaratLane, msmq5p1k Zepto), and an earlier
// pass that read one such annotation as a rule and moved all ten was wrong. A
// list keeps each one a decision. Adding another is one string.
//
// They are lane-packed SEPARATELY from the group above, which is the part that
// cannot be skipped: CaratLane spans 661-1028 and Deutsche Bank 835-1061, so
// dropping both onto one row underneath would overlap them by 193px.
const RAIL_BELOW = [
  "Deutsche Bank", // msmpfmk9
  "CaratLane",     // msmq5h81
  "Zepto",         // msmq5p1k
  "Toppr",         // msmq62go
  "Siemens",       // msmq69nf
  "Cyware",        // msmq6dnq
];

// RESTING PILLS THAT WRAP TO TWO LINES (Agam, 2026-08-13: "Deutsche Bank can be
// on 2 lines"). Named, like RAIL_BELOW, because it is one card's decision, not a
// rule. Why it exists: when the lane stagger came out of the rail (flat 48
// consistency pass), the one genuine x-overlap left was Deutsche Bank's wide
// pill shingling Zepto's at rest. Wrapping the org halves the pill's width and
// the overlap dissolves - no stagger, no drift, no detached leader. The card and
// its leader both carry `data-twoline`; the CSS gives the resting pill one extra
// line of height and shortens the leader by the same half-line.
const RAIL_TWO_LINE = ["Deutsche Bank"];

const RAIL_ROW = 5;
const RAIL_REST = 12;
// THE CREST, CUT ROUGHLY IN HALF (annotation msl6z7vf, "the hover state should
// not move the horizontal lines so much"). It was 64, a rise of 52 over the
// 12px rest - more than 5x, which on a strip of hairlines reads as the row
// heaving rather than as a magnifier passing over it. 38 halves the TRAVEL to
// 26 and keeps the falloff, the radius and the sideways spread untouched: the
// gesture is the same shape, just quieter.
//
// It is PUBLISHED TO CSS as --tlx-peak rather than mirrored as a literal,
// because four rules measure from the top of this strip and a fifth sets its
// height; the old 64 was written into all five by hand and changing the
// constant alone would have left the date, the years and the hover card
// floating 26px off the strip they belong to.
const RAIL_PEAK = 38;
const RAIL_RADIUS = 6;
// Peak sideways push, as a MULTIPLE OF THE STEP rather than a count of pixels.
//
// A spread that opens a gap at the crest necessarily CLOSES one at the rim —
// the displacement has to come back to zero by the radius, and the whole point
// of it doing so is that the strip keeps its width. So the binding constraint
// is not how wide the crest opens, it is whether the tightest gap is still
// wider than a tick. Worked out over the profile:
//
//   tightest gap = step * (1 - K/2)      (between the last two rows in radius)
//
// A first pass typed 7px flat, which at the 5px step left a 1.5px gap under a
// 2px tick — the rim OVERLAPPED, so a magnifier that opened in the middle
// collided at its own edges. And a px constant cannot be right in any case now
// that the step shrinks with the section: at the 3.5px step a narrow window
// gives, the same 7px closed the rim to 1.05.
//
// K = 0.8 holds the rim at 0.6 of a step either way — 3.0px at the wide step,
// 2.1px at the narrow one, both clear of the 2px mark. The crest still opens to
// 1.4 steps, which is the gesture the annotation asked for.
const RAIL_SPREAD = 0.8;

// The golden ratio, used for exactly one thing: how much wider a tick gets at
// the crest of the magnifier (annotation msnx3ibe).
const PHI = 1.618;

function bump(distance, radius) {
  if (distance >= radius) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * (distance / radius)));
}

// HORIZONTAL (annotation msivdpd0). The rail runs left to right now and the
// ticks rise from a baseline, so the magnified value is a HEIGHT rather than a
// width. Nothing else about the wave changes — the bump, the single pointer
// value and the springs are all axis-agnostic, and rotating it is exactly the
// swap of which dimension the rise is written to.
//
// It also puts the rail on the same axis as everything above it: the ruler,
// the ticks and every bar in this section read left-to-right as the calendar,
// and a vertical spine beneath them was the one element asking to be read the
// other way.
function RailTick({ index, pointer, strength, isNow, hasWork, isAnchor }) {
  const rise = useTransform(() => strength.get() * bump(Math.abs(index - pointer.get()), RAIL_RADIUS));
  const height = useTransform(rise, (r) => RAIL_REST + r * (RAIL_PEAK - RAIL_REST));
  // A month that shipped used to rest at 0.5 rather than 0.2, so the spine
  // carried a faint index of the six. That reading is gone with the ships; now
  // only NOW is brighter than its neighbours, which is a fact about the record
  // rather than a pointer at particular work.
  const opacity = useTransform(rise, (r) => {
    // A MONTH WITH SOMETHING IN IT READS BRIGHTER AT REST (annotation mso565d2:
    // "at any point where there is an experience attached to the timeline use an
    // active state of the vertical line").
    //
    // The spine was one flat weight, so a hundred months looked like a hundred
    // identical months - the ruler said WHERE things are without ever saying
    // WHEN anything happened. Now the record shows in the rail itself: the
    // stretches that were occupied stand out from the gaps between them, before
    // anyone hovers anything.
    //
    // FULL INK ONLY WHERE A LABEL LANDS (annotation msq0…, "revert and instead
    // change the one connected to a vertical line and box with text").
    //
    // The pass before this one lit every OCCUPIED month at 1. On a record with
    // no gaps in it - every month from May 2018 to Aug 2026 carries a field -
    // "occupied" selects all hundred, so the rail went uniformly bright and the
    // brightness stopped distinguishing anything. Full ink has to mark
    // something rarer to mark anything at all.
    //
    // So it marks the ANCHOR months: the ~10 ticks that a leader line drops
    // onto and a card sits above. Those are already the rail's landmarks in the
    // drawing; this makes the tick agree with the line pointing at it, instead
    // of a hairline arriving at a stroke no heavier than its neighbours.
    // Everything else goes back to where it was.
    const base = isAnchor ? 1 : isNow ? 0.7 : hasWork ? 0.42 : 0.16;
    return base + r * (1 - base);
  });
  // THE TICK THICKENS AS IT RISES (annotation msnx3ibe: "just like how the rows
  // expand vertically, can we add a functionality that the width also increases
  // in golden ratio").
  //
  // scaleX, NOT width, and that is the same rule the horizontal spread below
  // states for itself: a tick is the content of a flex row that carries no width
  // of its own, so growing it by `width` would relayout all hundred every frame
  // and move the pixel-to-month mapping under the sweep. A transform costs the
  // layout nothing and scales about the centre, so the tick thickens on its own
  // mark rather than drifting off it.
  //
  // PHI is the whole ask: at the crest the tick is its resting 2px times 1.618.
  // Subtle by design - the height already carries the magnification, and this is
  // the second cue that makes the crest feel like one object growing rather than
  // a line being stretched.
  const scaleX = useTransform(rise, (r) => 1 + r * (PHI - 1));
  return (
    <motion.span
      className="tlx__rail-tick"
      data-work={hasWork ? "true" : undefined}
      style={{ height, opacity, scaleX }}
    />
  );
}

// THE HORIZONTAL HALF OF THE FISHEYE (annotation msjw5v8l, "the expansion
// should happen on both side horizontally equally"). The rise was doing all the
// work on its own axis and the spacing never changed, so the rail magnified
// without ever opening.
//
// sin(pi * u / r) is the whole trick, and the two ZEROES are why it is that
// function and not the bump itself:
//
//   at u = 0   the tick UNDER THE CURSOR DOES NOT MOVE. The crest therefore
//              stays exactly where it is pointed at, which is what keeps the
//              drawing honest — the sweep maps a cursor to a month by
//              arithmetic on the undisplaced grid, and a crest that slid out
//              from under the pointer would make those two disagree. Same
//              one-value-drawn-in-two-places failure Scrub hit.
//   at u = r   the displacement is back to nothing, so the strip's ENDS ARE
//              PINNED and its total width never changes. The dock this borrows
//              from grows wider as it magnifies; this one cannot, because it is
//              a centred 500px box inside a section and any growth would shove
//              its own centre off the page's axis.
//
// Antisymmetric about the cursor by the sign, which is the "equally" in the ask:
// whatever the left side gives up, the right side takes.
//
// A TRANSFORM, never a width or a margin: the row is a flex item, and widening
// it would relayout all hundred every frame AND change the pixel-to-month
// mapping underneath the sweep. A translate moves the mark and its hit area
// together and costs the layout nothing.
// THE DISPLACEMENT, LIFTED OUT so more than the ticks can use it (annotation
// msnd5n7l, "during the hover state the entire timeline can shift as if zooming
// into one particular section, just like the lines move away").
//
// It was inline in RailRow and therefore only ever moved the marks. The labels,
// their leaders and their runs stayed where they were, so the ticks opened up
// around the cursor while everything drawn against them held still - the two
// halves of one drawing disagreeing about where a month is. Same function for
// all of them and the whole thing zooms together.
function railShift(index, pointerVal, strengthVal, step) {
  const d = index - pointerVal;
  const u = Math.abs(d);
  if (u >= RAIL_RADIUS || u === 0) return 0;
  return strengthVal * Math.sign(d) * step * RAIL_SPREAD * Math.sin((Math.PI * u) / RAIL_RADIUS);
}

// ── THE FISHEYE (Agam, 2026-08-15: "the hover state should expand and shrink
// the timeline, giving space for the UPES card to expand and move AIIMS
// Rishikesh to the right while maintaining the right structure ... fisheye is
// best"). One horizontal remap of the month axis while a card is open: the
// months between the open card and its nearest neighbour on the same side are
// MAGNIFIED by exactly what the 300px panel needs, and every other month is
// compressed evenly so the rail's two ends stay put. Because it is a remap of
// month position and not of any one element, everything anchored to a month -
// ticks, leaders, cards, the year labels, the now-mark, the readout - rides
// the same displacement and cannot come apart. `fishShift(u)` is that
// displacement for a continuous month position u (0..n), scaled by `amt`
// (0..1, sprung) so it opens and relaxes rather than snapping.
//   f = { c, m, g, k, step, n }  c: open card's month, m: neighbour's month,
//   g: extra pitch inside (c,m], k: compression outside, all pre-solved.
function fishShift(u, f, amt) {
  if (!f || !amt) return 0;
  const { c, m, g, k, step } = f;
  const x = u * step;
  let x2;
  if (u <= c) x2 = x * k;
  else if (u <= m) x2 = c * step * k + (u - c) * step * (1 + g);
  else x2 = c * step * k + (m - c) * step * (1 + g) + (u - m) * step * k;
  return (x2 - x) * amt;
}

function RailRow({ mo, index, last, active, pointer, strength, engage, step, touch, isAnchor, fish, fishAmt }) {
  const x = useTransform(
    () =>
      railShift(index, pointer.get(), strength.get(), step) +
      fishShift(index + 0.5, fish.current, fishAmt.get()),
  );
  return (
    <motion.button
      type="button"
      role="option"
      aria-selected={index === active}
      aria-label={`${mo.label}${mo.field ? `, ${mo.field.org}` : ""}`}
      /* ROVING TABINDEX: one stop for the whole rail, not a hundred. A reader
         tabbing the page should not have to press Tab 100 times to get past a
         decoration of their own career. */
      tabIndex={index === active ? 0 : -1}
      className="tlx__rail-row"
      /* A REAL WIDTH, plus permission to shrink. Two earlier shapes both
         resolved the rail to 200px (100 ticks x their own 2px) rather than 500:
         `flex: 1 1 0` contributes nothing to max-content, and `flex: 0 1 5px`
         had its basis ignored in favour of the tick's content size. A used
         `width` is the one thing max-content sizing reads without argument.
         `min-width: 0` is what still lets the strip compress below it on a
         section narrower than the record is long — without it the automatic
         minimum would pin each row and the rail would overflow instead. */
      /* SHARE THE FULL WIDTH (annotation msk7u1er), rather than each row taking
         a fixed 5px. RAIL_ROW stops being a width and becomes only what it
         always really was — the unit the wave's radius is counted in. The step
         is MEASURED (see the ResizeObserver in Rail), so widening the rail
         widens the months and nothing else has to be told about it.

         The max-content note below is now history rather than live advice: it
         mattered while the rail shrink-wrapped, and it does not any more. Kept
         because the failure is a good one to recognise. */
      /* ON TOUCH THE ROW IS A FIXED 14px, so the strip overflows and can be
         scrubbed; on a pointer it stays `flex: 1 1 0` and shares the rail's
         width between a hundred months. Decided HERE rather than in the
         stylesheet because this inline style would beat any rule there - the
         first attempt set it in CSS and the rows stayed 0px wide. */
      style={
        touch
          ? { flex: "0 0 14px", width: 14, minWidth: 14, x }
          : { flex: "1 1 0", minWidth: 0, x }
      }
      onFocus={() => engage(index)}
    >
      <RailTick
        index={index}
        pointer={pointer}
        strength={strength}
        isNow={index === last}
        /* occupied = a field or a rider ran in this month. Read off the model
           rather than recomputed: it is the same `months` the readout uses. */
        hasWork={!!(mo.field || (mo.riders && mo.riders.length))}
        /* the month a leader line lands on - see the opacity note in RailTick */
        isAnchor={isAnchor}
      />
    </motion.button>
  );
}

// TOUCH IS A DIFFERENT INSTRUMENT, not a narrow desktop. `hover: none` asks
// about the DEVICE, which is the thing that actually decides whether a sweep is
// possible - a narrow window still has a cursor.
function useTouch() {
  const [touch, setTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(hover: none)").matches
      : false,
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return touch;
}

// THE OPENED CARD'S BODY, extracted so the live card and the hidden measurer
// draw exactly the same thing (per-card centering, 2026-08-13). If these ever
// diverged, the resting card would centre on a height its expanded self never
// actually reaches.
// SUMMARY ONLY (pin mtr6jclq, 07 Sep 2026, on the Away card: "remove all this
// complex content and write a summary in the voice harness tone"). The card
// used to print the record's extra outcomes as bullets under the summary, so a
// row with three outcomes read as a list inside a 270px card. A rail card is
// the one-breath version; the outcomes still print in full on the Solid rows
// and on the case studies, so nothing is lost, only moved. The summaries
// themselves are in helloData.js; Away's was rewritten in the Sauer register
// for this pin.
function RailDetailBody({ detail, fallbackSpan }) {
  return (
    <span className="tlx__rail-detail">
      {detail?.role ? <span className="tlx__rail-detail-role">{detail.role}</span> : null}
      <span className="tlx__rail-detail-month">{detail?.span || fallbackSpan}</span>
      {detail?.summary ? <span className="tlx__rail-detail-out">{detail.summary}</span> : null}
      {/* optional (28 Sep, mukpq377): another page's record can pass bullets
          instead of one summary; the hello record has none, so it is unchanged */}
      {detail?.bullets?.length ? (
        <ul className="tlx__rail-detail-bullets">
          {detail.bullets.map((b) => typeof b === "string" ? <li key={b}>{b}</li> : (
            <li key={b.text} data-icon={b.icon ? "true" : undefined}>
              {b.icon ? <span className="material-symbols-rounded tlx__rail-detail-icon" aria-hidden="true">{b.icon}</span> : null}
              {b.text}
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  );
}

// exported (27 Sep, muk1fomw) so the Scheduled Delivery case can reuse the
// whole glass rail with its own record; nothing else about it changed
export function Rail({ model, details, reduce, below: belowExtra }) {
  // `below` (28 Sep, mukp1kbl): extra card names that sit under the line, for
  // another page's record; the hello rail passes nothing, so it is unchanged
  const belowList = belowExtra ? [...RAIL_BELOW, ...belowExtra] : RAIL_BELOW;
  const touch = useTouch();
  const last = model.n - 1;
  const rawPointer = useMotionValue(last);
  const rawStrength = useMotionValue(0);
  // Tight, near-critically-damped on the pointer so the wave feels attached to
  // the cursor; softer on the strength so it swells and relaxes. Both straight
  // from the reference, which had already tuned them.
  const springPointer = useSpring(rawPointer, { stiffness: 700, damping: 52, mass: 0.5 });
  const springStrength = useSpring(rawStrength, { stiffness: 260, damping: 30, mass: 0.6 });
  // REDUCED MOTION KEEPS THE SPATIAL WAVE AND DROPS THE TEMPORAL EASING — the
  // rise is instant rather than sprung. The reference's own call, and the right
  // one: the magnification is what tells you where you are, so removing it
  // would remove the information, not the motion.
  const pointer = reduce ? rawPointer : springPointer;
  const strength = reduce ? rawStrength : springStrength;

  const listRef = useRef(null);
  const [active, setActive] = useState(last);

  // THE STEP IS MEASURED, NOT THE CONSTANT (annotation msj1ccal, which asked for
  // the rail to be centred — and centring is what exposed this).
  //
  // Vertical, RAIL_ROW was a real 5px per month and 100 of them made a 500px
  // column inside a section far taller than that, so the constant was always
  // the truth. Horizontal, 500px is WIDER than the section on a phone, and a
  // centred strip that overflows its own container is worse than an
  // uncentred one. So RAIL_ROW becomes a MAXIMUM: the list is
  // `min(100%, n * RAIL_ROW)`, the rows share it evenly, and every place that
  // converts between pixels and months reads the measured width instead.
  //
  // Both directions have to use it or they disagree with each other: the sweep
  // maps a cursor to a month, the card maps a month back to a position, and one
  // of them still holding 5px would put the card off the tick it is naming —
  // the same one-value-drawn-in-two-places failure Scrub hit.
  // `engaged` IS BACK, for a different job than the one it was deleted with.
  // It used to gate the hint line, which annotation msjwaxga removed; this is
  // annotation msk1hbse, which wants the resting card cut down to two tags and
  // the full record only once someone is actually reading it. Same boolean,
  // unrelated reason — worth saying so the next reader does not take its return
  // as the hint line creeping back.
  const [engaged, setEngaged] = useState(false);
  const [step, setStep] = useState(RAIL_ROW);
  const [railW, setRailW] = useState(0);
  // how many rows the under-rail group needed, so the year layer can clear them
  const [belowLanes, setBelowLanes] = useState(1);
  // ORPHANED BY THE MERGE, REMOVED (annotation msmsb1s2, "qa this layout,
  // spacing and divs"). `half`, `setHalf` and the second ResizeObserver target
  // existed to clamp the floating hover panel; that panel is gone - the tenure
  // card IS the panel now - and `cardRef` had been attached to nothing since,
  // so `half` sat frozen at its default 150 and the observer registered a null.
  // The opened card is clamped against `railW` instead, in the render.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    const read = () => {
      const w = el.getBoundingClientRect().width;
      setStep((w || model.n * RAIL_ROW) / model.n);
      // the rail's own width, so an opened card can be clamped inside it
      if (w) setRailW(w);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [model.n]);

  // whether the pointer is currently on the rail; a ref so `engage` can read
  // it without re-creating on every engaged flip
  const engagedRef = useRef(false);
  const engage = useCallback(
    (row) => {
      const clamped = Math.max(0, Math.min(last, Math.round(row)));
      const target = Math.max(-0.5, Math.min(last + 0.5, row));
      // THE WAVE RISES WHERE THE POINTER IS (annotation msu93mxq, hovering the
      // 2018 end: "the hover starts from the right and the animation carries
      // to the left"). At rest the pointer value sits on the LAST month, so the
      // first engage sprang from the right-hand end all the way to the cursor
      // - a 100-month sweep across the strip before the lens arrived. On the
      // FIRST engage of a hover the spring is jumped to the target instead, so
      // the crest simply rises under the cursor; every move after that still
      // springs, which is the attached feel the springs were tuned for.
      if (!engagedRef.current) {
        springPointer.jump(target);
        engagedRef.current = true;
      }
      rawPointer.set(target);
      rawStrength.set(1);
      setActive((prev) => {
        // one coalesced `navigate` per 120ms across a sweep that crosses a
        // hundred months, for the same reason the scrub drag is coalesced
        if (prev !== clamped) feedbackCoalesced("navigate");
        return clamped;
      });
      setEngaged(true);
    },
    [last, rawPointer, rawStrength, springPointer],
  );

  const onMove = (e) => {
    const el = listRef.current;
    if (!el) return;
    // back on the rail: the sweep decides again
    setPinned(null);
    engage((e.clientX - el.getBoundingClientRect().left) / step - 0.5);
  };
  const onLeave = () => {
    setPinned(null);
    engagedRef.current = false;
    rawStrength.set(0);
    // HOME IS THE PRESENT MONTH (annotation msjyzlhu). The card has a resting
    // state now rather than fading out, so leaving has to say WHERE it rests —
    // without this it would keep whatever month the cursor happened to abandon,
    // and the default would be a different fact every time you looked away.
    //
    // The last month, for the reason Scrub already opens there: a record of a
    // career that rests in 2018 asks you to travel to the present to see the
    // present.
    rawPointer.set(last);
    setActive(last);
    setEngaged(false);
  };

  const cur = model.months[active];
  // WHICH RESTING CARD THE READOUT BELONGS TO (annotations msmnyhki / msmpa2ka).
  // A month can sit inside several runs at once - a field plus its riders - so
  // the field's own org wins where there is one: that is the tenure the panel
  // is describing. Falling back to the first run that covers the month keeps a
  // rider-only month (there are two, after graduation) from having no card.
  // A CARD POINTED AT DIRECTLY WINS over anything derived from the month.
  // Without this, hovering Toppr engaged Toppr's start month and `activeCard`
  // then looked that month up again and answered "UPES" - the field rule
  // talking over the reader. Measured: pointing at 5 of the 10 cards opened a
  // different card.
  //
  // Cleared the moment the pointer goes back to the rail itself (see onMove), so
  // the sweep is never left showing a card the sweep did not choose.
  const [pinned, setPinned] = useState(null);
  // ON TOUCH THE RAIL IS A SCRUBBER, and one card is open at all times.
  //
  // There is no hover to open anything and no cursor to resolve a month: at 375
  // wide the ticks are 3.34px apart, so a fingertip covers thirteen of them.
  // Scrolling the strip is the input instead - the finger moves the timeline,
  // the month under the CENTRE LINE is the reading, and the card sits above the
  // strip where the hand is not. Nothing has to be aimed at.
  const scrubStep = 14; // px per month when the strip overflows; a real target
  // THE STRIP'S LEADING PADDING IS PART OF THE ARITHMETIC, and leaving it out
  // was a bug worth a year.
  //
  // `.tlx__rail-list` carries `padding-inline: 50%` so the first and last months
  // can reach the centre line. That padding is 167.5px at 375 wide, which on a
  // 14px pitch is TWELVE MONTHS - so a reading that converts scrollLeft to a
  // month without subtracting it names a month a year ahead of the one actually
  // under the line. Measured, not deduced: paddingLeft 167.5, clientWidth 335,
  // first row at offsetLeft 168.
  //
  // Read rather than assumed to be clientWidth/2. It happens to equal that today
  // because the padding is 50%, and writing the coincidence into the maths is
  // how the next person changes the padding and cannot find what broke.
  const railPad = (el) => parseFloat(getComputedStyle(el).paddingInlineStart) || 0;
  const onScrub = useCallback(() => {
    const el = listRef.current;
    if (!el || !touch) return;
    const m = Math.round((el.scrollLeft + el.clientWidth / 2 - railPad(el)) / scrubStep - 0.5);
    const i = Math.max(0, Math.min(last, m));
    rawPointer.set(i);
    rawStrength.set(1);
    setActive((prev) => {
      if (prev === i) return prev;
      // one per month crossed, coalesced - a scrub crosses dozens in a flick and
      // §6 is explicit that a drag over many snap points gets ONE feedback, not
      // forty
      feedbackCoalesced("navigate");
      return i;
    });
    setEngaged(true);
  }, [touch, last, rawPointer, rawStrength]);

  // THE YEAR ROW IS THE JUMP CONTROL, not a second axis.
  //
  // Before this the phone drew time TWICE: the scrub strip with its own reading
  // line, and a fixed `2019 … 2026` row underneath that could not be pointed at
  // and did not line up with it. Two axes for one quantity is one too many - so
  // the year row keeps its job of framing the strip and takes on the job the
  // strip could not do, which is crossing seven years without a long drag.
  //
  // It is the inverse of the scrub arithmetic in onScrub, and deliberately reads
  // that way: onScrub turns scrollLeft into a month, this turns a month back
  // into scrollLeft, so if the pitch ever changes there is one number to change.
  //
  // `smooth`, not instant: a jump that teleports gives the reader no sense of
  // HOW FAR they went, and distance travelled is most of what a timeline is
  // for. The scroll fires onScrub the whole way, so the months tick past and the
  // feedback layer runs - the jump is a fast scrub, not a different mechanism.
  const jumpToYear = useCallback(
    (i) => {
      const el = listRef.current;
      if (!el) return;
      el.scrollTo({
        left: railPad(el) + (i + 0.5) * scrubStep - el.clientWidth / 2,
        behavior: "smooth",
      });
      // `select`, matching a new tenure rather than a new month: choosing a year
      // is a decision, and the months the smooth scroll crosses on the way are
      // already saying `navigate` through onScrub.
      feedback("select");
    },
    [],
  );
  // GLASS SHIPS (annotation msngd94z, "we have 3 materials here, currently it's
  // ink, make glass the default"). The control that would let a reader change it
  // is hidden (msng8b49), so this constant IS the spine's material now - the
  // other two stay in the stylesheet, one word away.
  const [ticks, setTicks] = useState("glass");
  const derivedCard = (() => {
    const covering = model.cards.filter((c) => active >= c.i0 && active <= c.i1);
    if (!covering.length) return -1;
    // THE MOST RECENTLY STARTED RUN WINS (annotation msnfock4: "when the cursor
    // reaches this point (vertical line) the UPES hover should stop and the next
    // hover should be triggered").
    //
    // This replaces "the month's FIELD wins", which was why sweeping past
    // Toppr's line changed nothing: the degree held the field for four years, so
    // UPES stayed selected across every tenure that started inside it. A start
    // line you have just crossed is the newest thing true about this month, and
    // it is also the mark the reader is pointing at - so crossing it hands over,
    // and the sweep reads as moving THROUGH the record rather than sitting on
    // whichever run happens to be longest.
    //
    // Ties (two runs starting the same month) go to the field, which is the old
    // rule kept as the tie-break rather than thrown away.
    const latest = Math.max(...covering.map((c) => c.i0));
    const newest = covering.filter((c) => c.i0 === latest);
    const byField = cur.field ? newest.find((c) => c.org === cur.field.org) : null;
    return model.cards.indexOf(byField || newest[0]);
  })();
  const activeCard = pinned != null ? pinned : derivedCard;

  // ONE CARD IS OPEN AT REST (annotation msuhbw6v, "keep away AI open by
  // default"). The rail used to rest with ten pills and nothing said; now the
  // Away run - the AI travel agent, the newest thing on the record - rests
  // open, and the moment a pointer engages the rail the hover decides again.
  // `shownCard` is therefore what every open-state reads (the panel, its
  // leader, the fisheye that makes room for it, and the now-mark it covers);
  // `activeCard` still means "what the pointer is on" and keeps driving the
  // dimming, which only exists while someone is pointing.
  const defaultCard = useMemo(
    () => model.cards.findIndex((c) => c.org === "Away"),
    [model.cards],
  );
  const shownCard = engaged ? activeCard : defaultCard;

  // WHICH YEAR THE READING LINE IS INSIDE. The last January at or before the
  // current month, not the nearest one: nearest would show 2023 from July 2022
  // onward, and in July 2022 you are in 2022. Read off the same `active` index
  // everything else reads, so the highlighted year can never disagree with the
  // date readout above it.
  const curYear = (() => {
    let label = null;
    for (const y of model.years) {
      if (y.i <= active) label = y.label;
      else break;
    }
    return label;
  })();

  // OPEN FROM THE FIRST FRAME ON TOUCH. "One card expanded at all times" means
  // there is no resting state to arrive at - the reading is the view. Without
  // this the section would open blank and only come alive once you happened to
  // scrub it, which is the opposite of always-on.
  useEffect(() => {
    if (!touch) return;
    setEngaged(true);
    rawStrength.set(1);
  }, [touch, rawStrength]);

  // A NEW TENURE UNDER THE LINE IS A `select`, where a new month is a
  // `navigate`. Two different sizes of event, which is the whole point of the
  // seven-event vocabulary: crossing into Zepto should not feel like crossing
  // from March to April. Touch only - on desktop the hover already says this.
  const lastCardRef = useRef(activeCard);
  useEffect(() => {
    if (!touch) return;
    if (lastCardRef.current === activeCard) return;
    lastCardRef.current = activeCard;
    if (activeCard >= 0) feedback("select");
  }, [touch, activeCard]);

  // THE LABEL LAYER NO LONGER RIDES THE TICK WAVE (Agam, 2026-08-13: "the
  // vertical line reacts when I scrub the timeline, remove that"). msnd5n7l put
  // the whole drawing on the magnifier wave and msq1y66s glued the cards to the
  // lines; scrubbing therefore wobbled every leader and box sideways as the
  // crest passed. That effect - one subscription writing `--shift` onto twenty
  // nodes at pointer rate - is deleted rather than zeroed: with nothing writing
  // the variable, every `var(--shift, 0px)` in the stylesheet resolves to 0 and
  // the lines, cards and now-mark hold still. Only the TICKS keep the wave,
  // which is where the zoom actually reads. Cards and lines still cannot
  // disagree with each other: both now sit at their unshifted x, always.

  // (The open card used to be RE-measured here with its transition suppressed,
  // to feed --och/--open-h. That was the smooth-expand bug: forcing
  // `transition: none` to read the height snapped the box to full size before
  // the ease could run. It is gone - the hidden measurer now supplies --och for
  // every card up front, and the CSS reads --och directly, so nothing has to
  // measure a live card mid-open. --open-h is retired; the CSS uses --och.)

  // THE CARD'S OWN RECORD, and it has to be declared AFTER `activeCard` - it
  // reads it, and a const referenced above its own declaration throws rather
  // than reading undefined.
  //
  // This used to be `details.get(cur.fieldId)`, the month's FIELD, so every
  // rider tenure showed somebody else's summary: Toppr, Siemens, AIIMS and
  // Cyware all printed the degree's, Dassh and Away printed Zepto's. The card
  // carries its own tenure id now, so it asks for that record.
  const railDetail = (() => {
    const c = activeCard >= 0 ? model.cards[activeCard] : null;
    if (c?.tid && details.get(c.tid)) return details.get(c.tid);
    return cur.field ? details.get(cur.fieldId) : null;
  })();
  // The card is clamped to the rail so it cannot ride off either end, which is
  // the bug the reference's own changelog says it was written to fix.
  // Now clamped along X, since the rail runs horizontally (annotation
  // msivdpd0). `half` is half the CARD'S OWN measure, which changed with the
  // axis: it used to be half a card height, it is now half the 300px width the
  // stylesheet gives it. The clamp itself is unchanged and still does the job
  // the reference wrote it for — the card cannot ride off either end.
  // ── PACKING THE RESTING CARDS, BY MEASUREMENT ─────────────────────────────
  // Lay them out, read their real widths, then decide which lane each one takes.
  // Two passes, because the first pass is the only way to learn how wide a piece
  // of text is — see the note in the model about the estimate that was wrong by
  // a factor of three.
  //
  // Held invisible until the lanes are known: with one frame of everything at
  // lane 0 they would visibly pile up and then spring apart, and this is the
  // RESTING state, which should not have an entrance.
  const cardsRef = useRef(null);
  const [lanes, setLanes] = useState(null);
  // the now-mark's own hover (see the nowcard render)
  const [nowOpen, setNowOpen] = useState(false);
  // ITS RESTING WIDTH, MEASURED (annotation msuds1o9, "the expanding of the
  // card is not smooth"). The card rested at `width: max-content` and opened
  // to 300px - and a transition cannot interpolate FROM an intrinsic keyword,
  // so the box snapped to full width on the first frame while the padding and
  // the row still eased: the jump that reads as "not smooth". The glyph line
  // is measured instead (it is independent of the card's own width) and the
  // resting width published as a real number, so both ends of the transition
  // are lengths. Re-measured on resize, since the emoji is a font glyph.
  // THE GLYPH, NOT THE HEAD: the head holds the title too, which is 0 wide at
  // rest and ~260 when open, so observing it would re-measure the OPEN width
  // and leave the card resting at 300px once it had been hovered. The glyph is
  // the same box in both states.
  // A CALLBACK REF, NOT useRef: the now-mark renders only once `lanes` exists,
  // so a mount-time effect ran while the ref was still null and, with empty
  // deps, never ran again - the variable stayed unset and the width fell back
  // to max-content, which is the very thing that cannot animate. State makes
  // the attach itself the trigger.
  const [nowGlyph, setNowGlyph] = useState(null);
  const [nowRestW, setNowRestW] = useState(0);
  useLayoutEffect(() => {
    const el = nowGlyph;
    if (!el) return undefined;
    const read = () => {
      const w = el.getBoundingClientRect().width;
      if (w) setNowRestW(Math.ceil(w) + 24); // + the resting 12px padding each side
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nowGlyph]);
  // THE NOW-MARK STANDS DOWN UNDER A RIGHT-END PANEL (QA msuap2dy, "fisheye
  // breaking on the rocket icon"). The rocket sits on the LAST month, which
  // the fisheye keeps fixed by construction (the rail's ends do not move), so
  // an above-rail card whose 300px panel reaches the right edge - Away,
  // Dassh, anything clamped there - draws straight over it. Nothing can push
  // the rocket further right, so while such a panel is open the mark fades
  // out and comes back when it closes. Below-rail panels open downward and
  // never reach it.
  const nowCovered =
    shownCard >= 0 &&
    !!lanes &&
    !belowList.includes(model.cards[shownCard]?.org) &&
    Math.min(lanes[shownCard].left, railW - 300) + 300 > railW - 40;

  // ── FISHEYE STATE (see fishShift above) ─────────────────────────────────
  // `fish` holds the solved mapping (or null), `fishAmt` springs 0 -> 1 as it
  // opens. Solved from the OPEN card and its nearest same-side neighbour to
  // the right, using the packer's real card lefts, so the magnification is
  // exactly the shortfall - no fixed gain, nothing moves when nothing collides.
  const fish = useRef(null);
  const fishRaw = useMotionValue(0);
  const fishAmt = useSpring(fishRaw, { stiffness: 220, damping: 30, mass: 0.8 });
  useLayoutEffect(() => {
    const W = 300; // the open panel's width (timeline.css)
    const G = 24; // clear air between the panel and the pushed neighbour
    let next = null;
    // THE ROCKET GETS ONE TOO (annotation msuds1o9, "fisheye not working with
    // the last box with the rocket ship emoji"). It is not a card in the pack,
    // so the solver never saw it - but its open panel is 300px wide against
    // the rail's right edge, exactly the clamped case below, with the last
    // month as its anchor. Solved here so an open rocket pushes Away/Dassh
    // left the same way an open Away pushes Dassh.
    if (nowOpen && !nowCovered && lanes && railW) {
      const total = model.n * step;
      const meI0 = model.n - 1;
      const bound = railW - W - G; // the panel's left edge, less clear air
      let nb = -1;
      let nbRight = -Infinity;
      model.cards.forEach((c, j) => {
        if (belowList.includes(c.org) || c.i0 >= meI0) return;
        const right = lanes[j].left + (lanes[j].w || 110);
        if (right > bound && c.i0 > nb) {
          nb = c.i0;
          nbRight = right;
        }
      });
      if (nb >= 0) {
        const extra = nbRight - bound;
        const span = (meI0 - nb) * step;
        const k = Math.max(0.35, (nb * step - extra) / (nb * step));
        const g = Math.max(0, (total - k * (total - span)) / span - 1);
        next = { c: nb, m: meI0, g, k, step, n: model.n };
      }
    } else if (shownCard >= 0 && lanes && railW) {
      // ── A PANEL IS A BOX, AND THE BOX DECIDES (rewritten 2026-08-16, Agam:
      // "when Away is open by default the fisheye should also be active").
      // The old shape asked WHERE THE CARD SITS - at its month, push the next
      // card right; clamped to the edge, pull the previous card left - and the
      // resting Away card fell between them: its lane sits inside the rail, so
      // it took the first branch, which then looked for a same-side card to
      // its RIGHT and found none, because Away is the last one. Nothing moved.
      //
      // What actually matters is the PANEL'S BOX, which the render draws at
      // `min(lane, railW - W)` whatever the month says. So: measure that box,
      // find the nearest same-side neighbour intruding on each side, and take
      // whichever needs the bigger correction. One rule, both directions, no
      // card in the record can fall outside it.
      const me = model.cards[shownCard];
      const mySide = belowList.includes(me.org);
      const total = model.n * step;
      const panelL = Math.max(0, Math.min(lanes[shownCard].left, railW - W));
      const panelR = panelL + W;
      const same = (j) => j !== shownCard && belowList.includes(model.cards[j].org) === mySide;

      // the nearest neighbour to the LEFT whose box reaches into the panel
      let nb = -1;
      let need = 0;
      model.cards.forEach((c, j) => {
        if (!same(j) || c.i0 >= me.i0) return;
        const right = lanes[j].left + (lanes[j].w || 110);
        if (right > panelL - G && c.i0 > nb) {
          nb = c.i0;
          need = right - (panelL - G);
        }
      });
      // ...and the nearest to the RIGHT that the panel runs into
      let fw = -1;
      let fwNeed = 0;
      model.cards.forEach((c, j) => {
        if (!same(j) || c.i0 <= me.i0) return;
        const l = lanes[j].left;
        if (l < panelR + G && (fw < 0 || c.i0 < fw)) {
          fw = c.i0;
          fwNeed = panelR + G - l;
        }
      });

      if (fw >= 0 && fwNeed >= need) {
        // MAGNIFY the months between this card and the one ahead, compress the
        // rest; the rail's two ends stay put.
        const c = me.i0;
        const span = (fw - c) * step;
        const g = fwNeed / span;
        const k = Math.max(0.35, (total - span * (1 + g)) / (total - span));
        next = { c, m: fw, g, k, step, n: model.n };
      } else if (nb >= 0 && need > 0) {
        // MIRRORED: compress everything left of the neighbour so its right
        // edge lands exactly on the panel's clear line - solved for k directly
        // (x'(nb) = nb*step*k), so the landing is exact rather than iterated.
        const span = (me.i0 - nb) * step;
        const k = Math.max(0.35, (nb * step - need) / (nb * step));
        const g = Math.max(0, (total - k * (total - span)) / span - 1);
        next = { c: nb, m: me.i0, g, k, step, n: model.n };
      }
    }
    const was = fish.current;
    if (next) {
      const sameShape =
        was && was.c === next.c && was.m === next.m && Math.abs(was.g - next.g) < 1e-3;
      // a HANDOVER between two open cards relaxes then re-opens rather than
      // snapping between two solved shapes: jump the spring home first.
      // (Reopening the SAME shape mid-relax just springs back up from where
      // it is - no jump.)
      if (was && !sameShape && fishRaw.get() === 1) fishAmt.jump(0);
      fish.current = next;
      if (fishRaw.get() !== 1) fishRaw.set(1);
    } else if (fishRaw.get() !== 0) {
      // ON CLOSE THE SHAPE STAYS WHILE THE AMOUNT RELAXES (Agam: "the expand
      // is fine but zooming out is abrupt"). Nulling the mapping here made
      // every fishShift() return 0 on the very next frame - the spring was
      // still easing 1 -> 0 but multiplied a shape that no longer existed.
      // The last solved shape is kept and only cleared once the spring has
      // landed (see the change subscription below).
      fishRaw.set(0);
    }
  }, [shownCard, nowOpen, nowCovered, lanes, railW, step, model.cards, model.n, fishAmt, fishRaw]);

  // WRITE THE DISPLACEMENT onto every month-anchored node as --shift (the
  // variable the stylesheet already reads on cards, leaders and the now-mark;
  // the years get it too). One subscription, ~30 nodes, only while the spring
  // is moving - the pointer never drives this, so it cannot wobble on a sweep.
  useEffect(() => {
    const wrap = cardsRef.current;
    const write = (amt) => {
      const f = fish.current;
      if (!wrap) return;
      const cards = wrap.querySelectorAll(".tlx__rail-tagcard:not(.tlx__rail-measure-card)");
      const leads = wrap.querySelectorAll(".tlx__rail-leader");
      model.cards.forEach((c, i) => {
        const v = `${fishShift(c.i0 + 0.5, f, amt)}px`;
        // A CLAMPED OPEN PANEL STAYS ON THE EDGE (QA msuap2dy): its left is
        // pinned to railW-300 by the render, so adding its month's shift only
        // pushed it past the rail (measured 467-767 on a 744 rail). The panel
        // takes no shift; its leader still rides to the true month.
        // `engaged &&` (QA msuds1o9): activeCard is DERIVED from the month
        // under the pointer and is a real index even at rest, so without this
        // the right-hand card the rail happens to be resting on had its shift
        // pinned to 0 - measured with the rocket open: every other card slid
        // left and Away, the one the panel actually overlaps, did not move.
        // The exception belongs to a card whose panel is really open.
        const clamped = i === shownCard && lanes && lanes[i].left > railW - 300;
        cards[i]?.style.setProperty("--shift", clamped ? "0px" : v);
        leads[i]?.style.setProperty("--shift", v);
      });
      const nowV = `${fishShift(model.n - 0.5, f, amt)}px`;
      wrap.querySelector(".tlx__rail-nowlead")?.style.setProperty("--shift", nowV);
      wrap.querySelector(".tlx__rail-nowcard")?.style.setProperty("--shift", nowV);
      const root = wrap.closest(".tlx__rail");
      root?.querySelectorAll(".tlx__rail-year").forEach((y) => {
        const pct = parseFloat(y.style.getPropertyValue("--x")) || 0;
        y.style.setProperty("--shift", `${fishShift((pct / 100) * model.n, f, amt)}px`);
      });
    };
    write(fishAmt.get());
    return fishAmt.on("change", (amt) => {
      write(amt);
      // relaxed all the way home with nothing new asked for: drop the shape
      if (amt < 0.002 && fishRaw.get() === 0) fish.current = null;
    });
  }, [fishAmt, fishRaw, model.cards, model.n, lanes, activeCard, railW]);
  // PER-CARD EXPANDED HEIGHT (Agam, 2026-08-13: "per card centering"). The
  // resting card centres on the midline of its OWN expanded panel, not the one
  // shared reserve - but a resting card only draws its pill, so that height is
  // not in the live DOM to read. This hidden layer draws every card's full panel
  // off-screen; the effect below measures each and hands its height back as
  // --och, which both the resting `top` and the leader read.
  const measureRef = useRef(null);
  const detailOf = useCallback((c) => (c?.tid && details.get(c.tid)) || null, [details]);
  // THE MONTHS A LEADER LANDS ON. Read off `model.cards` rather than recomputed
  // from the record, so the set is by construction the same one the lines are
  // drawn at (`(c.i0 + 0.5) / n` below) - if a card moves or a run splits, the
  // bright tick moves with it and cannot drift out of agreement with the line.
  // The last month is in the set too: it carries the rocket mark, which is a
  // line and a box like any other, so the rule "full ink where a label lands"
  // has to hold for it or the one tick with a rocket over it would be the
  // faintest labelled tick on the rail.
  const anchors = useMemo(
    () => new Set([...model.cards.map((c) => c.i0), model.n - 1]),
    [model.cards, model.n],
  );

  // MEASURE EVERY CARD'S EXPANDED HEIGHT off the hidden layer, and hand each real
  // card (and its leader) its own --och (Agam, "per card centering"). Placed
  // after `lanes`/`detailOf` are declared - listing them in the deps before
  // their declaration is a temporal dead zone that throws on render. The
  // measurer is laid out at the open card's width, so its height is the height
  // the card will actually reach; `data-below` cards grow away from the ticks and
  // do not key off it.
  useLayoutEffect(() => {
    const m = measureRef.current;
    const wrap = cardsRef.current;
    if (!m || !wrap) return;
    const nodes = m.querySelectorAll(".tlx__rail-measure-card");
    const cards = wrap.querySelectorAll(".tlx__rail-tagcard");
    const leaders = wrap.querySelectorAll(".tlx__rail-leader");
    nodes.forEach((node, i) => {
      const card = cards[i];
      if (!card) return;
      const h = Math.round(node.getBoundingClientRect().height);
      if (h <= 0) return;
      // --och feeds two things: the TOP-card resting centre AND every card's
      // open HEIGHT (the smooth expand). Below cards do not use it for position -
      // they converge to a fixed line - but they DO need it for the height
      // animation, so they are measured too now.
      card.style.setProperty("--och", `${h}px`);
      leaders[i]?.style.setProperty("--och", `${h}px`);
    });
  }, [model.cards, lanes, detailOf]);

  useEffect(() => {
    const wrap = cardsRef.current;
    const list = listRef.current;
    if (!wrap || !list) return undefined;
    const pack = () => {
      const total = list.getBoundingClientRect().width;
      if (!total) return;
      // THE CARDS ONLY, not every child. The leader lines (msmsv40x) live in
      // this same wrapper, so `wrap.children` is twice the length of
      // model.cards and the pack read straight off the end of it - which threw
      // and took the whole Rail down. Select what is being packed rather than
      // trusting the container to hold nothing else.
      const els = [...wrap.querySelectorAll(".tlx__rail-tagcard")];
      // EACH ITEM IS AN L, NOT A BOX (QA after msmwo73k et al). Once the runs
      // were drawn, what occupies a row stopped being the label: it is the
      // label PLUS the horizontal run out to the tenure's end, joined by a
      // vertical at its start. Packing the boxes alone put UPES and AIIMS on one
      // row with their runs lying across each other for a year, and dropped
      // Deutsche Bank's leader straight through the CaratLane card.
      //
      // So each item reserves the UNION of its label and its run, and the
      // greedy first-fit works on that.
      const boxes = els.map((el, i) => {
        const c = model.cards[i];
        const runL = ((c.i0 + 0.5) / model.n) * total;
        const runR = runL + ((c.i1 - c.i0 + 1) / model.n) * total;
        // `want` IS THE LEADER'S OWN EXPRESSION (Agam, 2026-08-13: "left align
        // Deutsche Bank box"). It was `c.x` - the month slot's START - while the
        // leader draws at the slot's CENTRE (i0 + 0.5), and the two also read
        // separately measured widths; on Deutsche the drift reached 66px and the
        // line landed near the box's RIGHT edge, reading as a right-aligned
        // card. Same formula, same `total`, so the line sits exactly on every
        // box's left edge by construction and cannot drift again.
        // THE PACKER PACKS RESTING BOXES (found while making Away open by
        // default, annotation msuhbw6v): it measures live widths, so the one
        // OPEN card measured 300px and the packer shoved it 438px away from
        // its own month to fit - a resting card floating over the wrong year
        // with its leader stranded at the right tick. An open card's resting
        // width is its tag plus the pill's own chrome (9/12 padding + 1px
        // border each side), which is what this reads instead. Hover-opening
        // was never affected because the pack runs before the hover.
        const tag = el.dataset.open ? el.querySelector(".tlx__rail-tag") : null;
        const w = tag ? tag.getBoundingClientRect().width + 26 : el.getBoundingClientRect().width;
        return { i, w, want: runL, runL, runR };
      });
      // Clamp first, so a card that would hang off the right edge is already at
      // its final position before anything is packed against it.
      boxes.forEach((b) => {
        b.left = Math.max(0, Math.min(b.want, total - b.w));
      });
      // MINIMUM 8px BREATHING ROOM between same-side resting pills (Agam,
      // 2026-08-13: "not just no collisions - at least an 8px gap between two
      // items"). Swept right-to-left, and the EARLIER card is nudged LEFT rather
      // than the later one right, because direction decides attachment: a
      // rightward push slides a box off its own month line entirely (the line
      // would float in the gap, pointing at nothing), while a leftward nudge
      // keeps the line landing ON the box's edge, just inside the corner. The
      // sweep cascades so a nudge cannot create a new near-collision upstream.
      const MIN_GAP = 8;
      for (const side of [false, true]) {
        const arr = boxes
          .filter((b) => belowList.includes(model.cards[b.i].org) === side)
          .sort((p, q) => p.left - q.left);
        for (let k = arr.length - 2; k >= 0; k--) {
          const over = arr[k].left + arr[k].w + MIN_GAP - arr[k + 1].left;
          if (over > 0) arr[k].left = Math.max(0, arr[k].left - over);
        }
      }
      boxes.forEach((b) => {
        // the row this item actually needs: whichever of the label and the run
        // reaches furthest each way
        b.l = Math.min(b.left, b.runL);
        b.r = Math.max(b.left + b.w, b.runR);
      });
      const GAP = 10;
      const ends = [];
      const out = new Array(boxes.length);
      // DASSH AND AWAY CLAIM THE TOP LANE FIRST (annotation msl5z4ln, "move
      // the dassh and away at the top of the timeline"). The packer is greedy
      // first-fit, so whoever is packed first gets lane 0 wherever it fits -
      // priority cards are simply packed before the rest. Within each tier
      // the left-to-right order stays, so the greedy invariant (ends only
      // ever grow rightward per lane) still holds.
      const PRIORITY = ["Dassh", "Away"];
      const tier = (b) => (PRIORITY.includes(model.cards[b.i].org) ? 0 : 1);
      // TWO INDEPENDENT PACKS, one per side of the rail. `ends` is what makes
      // the greedy first-fit work, and a single shared `ends` would have the
      // group below reserving lanes in the group above and vice versa - every
      // card would be laid out around neighbours that are not on its side.
      const endsBelow = [];
      const below = (b) => belowList.includes(model.cards[b.i].org);
      [...boxes]
        // sorted by where the item STARTS on the rail, which is now its run's
        // start rather than its clamped label - the greedy invariant is that
        // `ends` only ever grows rightward, and it is the reserved extent that
        // has to be monotonic, not the label
        .sort((p, q) => tier(p) - tier(q) || p.l - q.l)
        .forEach((b) => {
          const es = below(b) ? endsBelow : ends;
          let lane = es.findIndex((e) => e + GAP <= b.l);
          if (lane < 0) lane = es.length;
          es[lane] = b.r;
          // WIDTH TOO, so the resting card can carry an explicit px width
          // (annotation msmpgo7a, "this element should be the one morphing into
          // the card"). A morph needs both ends of every property to be real
          // numbers: `auto` -> 300px does not interpolate, so the pill would
          // snap to panel width however smooth everything else was. The packer
          // has already measured this box to decide the lane, so the number is
          // free.
          out[b.i] = { lane, left: b.left, w: b.w, below: below(b) };
        });
      setLanes(out);
      setBelowLanes(endsBelow.length);
    };
    pack();
    const ro = new ResizeObserver(pack);
    ro.observe(list);
    return () => ro.disconnect();
  }, [model.cards, step]);

  // `cardLeft` was here and is gone with the same removal: it recomputed the
  // floating panel's clamped x on every pointer frame for an element that no
  // longer exists. `dateLeft` below is the one that is still read.

  // The date readout rides the pointer directly rather than the card's clamped
  // position — it is naming the month UNDER the cursor, so it has to sit over
  // that month and not over wherever a 300px card was able to fit. Clamped only
  // to the rail's own ends, by half its own width, so the text never hangs off.
  const dateLeft = useTransform(() => {
    const pp = pointer.get();
    const total = model.n * step;
    const w = 34; // half a "Mmm YYYY" at 10px mono, enough to keep it on the rail
    // + the fisheye's displacement of the month under the pointer
    return (
      Math.max(w, Math.min(Math.max(w, total - w), (pp + 0.5) * step)) -
      w +
      fishShift(pp + 0.5, fish.current, fishAmt.get())
    );
  });

  // ── WHICH RAIL TOUCH GETS ────────────────────────────────────────────────
  // "column" is the vertical rail; "scrub" is the horizontal scrubber this
  // replaced. The scrubber is KEPT, not deleted - Agam's call, and the right one:
  // its reasoning was sound and only its axis was wrong, so it is worth being
  // able to put back beside the new one rather than reconstructing from a diff.
  // Everything it needs is still here and still wired; this constant is the only
  // thing standing between it and being the default again.
  //
  // Desktop is not part of this decision at all. It keeps the magnifier either
  // way - a displacement wave needs a pointer to centre on, and there is none on
  // a phone, which is the fact the whole touch layout is downstream of.
  if (touch && RAIL_LAYOUT === "band") {
    return (
      <div className="tlx__rail" data-touch="true" data-layout="band">
        <RailBand model={model} details={details} />
      </div>
    );
  }
  if (touch && RAIL_LAYOUT === "column") {
    return (
      <div className="tlx__rail" data-touch="true" data-layout="column">
        <RailColumn model={model} details={details} />
      </div>
    );
  }

  return (
    <div
      className="tlx__rail"
      data-ticks={ticks}
      data-touch={touch ? "true" : undefined}
      /* ── THE HOVER MODEL: ONE SURFACE, THREE ZONES ──────────────────────
         The rail has two things you can point at - the ticks and the cards -
         and they were fighting because each owned a different part of the
         story while the RESET sat on only one of them.
      
           .tlx__rail        (here)  owns LEAVE. The single reset, and the only
                                     one. Nothing inside the rail resets state,
                                     so crossing the empty band between a card
                                     and the ticks is continuous rather than a
                                     trip through nothing.
           .tlx__rail-list           owns SWEEP. Pointer moves set the month and
                                     release any pinned card - back on the
                                     timeline, the timeline decides again.
           .tlx__rail-tagcard        owns PIN. Entering a card selects that
                                     tenure and holds it against the sweep.
      
         What this fixes, measured: with the reset on the STRIP, pointing at a
         card and then leaving the page entirely left that card open forever -
         the strip's leave had fired long before, and nothing was watching the
         card. Hovering a card was a state you could not get out of. */
      onPointerLeave={onLeave}
      /* the card lanes hang below the strip; publishing the lane count lets
         the CSS reserve real height for them (annotation msl5z4ln, "increase
         the height") instead of the cards overflowing into the next section */
      style={{
        // ABOVE-RAIL LANES ONLY. This reserves the band on top, and counting the
        // under-rail rows into it would reserve height for cards that are not
        // there - the gap the whole section sits in.
        "--tlx-lanes": lanes
          ? Math.max(1, ...lanes.filter((l) => !l.below).map((l) => l.lane + 1))
          : 1,
        /* the crest height, so the CSS never has to repeat it (msl6z7vf) */
        "--tlx-peak": `${RAIL_PEAK}px`,
        /* rows used under the rail, so the years sit clear of them */
        "--tlx-below-lanes": belowLanes,
      }}
    >
      {/* AT DIV LEVEL, as asked: it belongs to the rail, so it lives in the rail
          and disappears with it rather than sitting in the section chrome where
          it would imply it governs the other four styles too. */}
      {/* HIDDEN (annotation msng8b49, "ink, glass and gradient should be
          hidden"). The three modes still exist and `ticks` still drives
          `data-ticks` on the rail, so switching the default below is a one-word
          change and the control is one uncomment away. Ink stays the mode that
          ships. */}
      {false && (
      <div className="tlx__rail-ticks" role="group" aria-label="Spine">
        {TICK_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className="tlx__rail-tickbtn"
            data-active={ticks === k ? "true" : undefined}
            aria-pressed={ticks === k}
            title={TICKS[k].hint}
            onClick={() => {
              if (k !== ticks) feedback("select");
              setTicks(k);
            }}
          >
            {TICKS[k].label}
          </button>
        ))}
      </div>
      )}

      {/* A TALLER HIT AREA THAN THE STRIP (annotation mso0viqx: "the hover on
          timeline only happens when I'm hovering over it - can we make the hover
          area work from 80px above and below this element").

          The strip is 38px tall, which is a thin thing to have to find, and the
          sweep is this section's main interaction. This wrapper is 80px taller
          each way and carries the pointer handler; the month is still computed
          from the LIST's own rect, so only the x matters and a taller box
          changes nothing about the reading.

          The cards inside that band keep their own `pointer-events: auto`, so
          pointing AT a card still pins it rather than being swallowed. */}
      <div className="tlx__rail-hit" onPointerMove={touch ? undefined : onMove}>
      <div
        className="tlx__rail-list"
        onScroll={touch ? onScrub : undefined}
        ref={listRef}
        role="listbox"
        aria-label="Months"
        aria-orientation="horizontal"
        /* NO WIDTH AT ALL, and `width: 100%` here was actively wrong: the rail
           above is `width: max-content`, and a percentage inside a container
           that is sizing itself FROM its content is circular — the percentage
           resolves against nothing, the list falls back to its min-content, and
           the rail shrink-wrapped to 100 ticks x 2px = 200px instead of 500.
           Left auto, the list contributes its rows' 5px bases and the rail
           resolves to the 500 it should. */
        onKeyDown={(e) => {
          const map = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
          let next = active;
          if (map[e.key]) next = active + map[e.key];
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = last;
          else return;
          e.preventDefault();
          const to = Math.max(0, Math.min(last, next));
          engage(to);
          // MOVE FOCUS WITH THE SELECTION. Found by QA (annotation msk7u1er):
          // Home and the arrows appeared to work and then snapped straight back
          // to the present month. The roving tabindex is the cause — changing
          // `active` takes tabIndex OFF the element that currently has focus,
          // the browser drops focus to the body, the list's onBlur fires, and
          // onLeave sends the rail home. So the keyboard could move exactly one
          // step before undoing itself.
          //
          // Focusing the new row is also just what a roving tabindex IS: the
          // tab stop and the focus are supposed to travel together, and only
          // one of the two was moving.
          e.currentTarget.children[to]?.focus();
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) onLeave();
        }}
      >
        {model.months.map((mo, i) => (
          <RailRow
            key={mo.m}
            mo={mo}
            index={i}
            last={last}
            active={active}
            pointer={pointer}
            strength={strength}
            engage={engage}
            step={step}
            touch={touch}
            isAnchor={anchors.has(i)}
            fish={fish}
            fishAmt={fishAmt}
          />
        ))}
      </div>
      </div>

      {/* NO `opacity: strength` (annotation msjyzlhu, "the cards that show on
          hover should have a default non-hover state as well"). The card used to
          be painted by the same value that drives the wave, so at rest it was
          simply not there and the rail read as an unexplained row of marks until
          you happened to sweep it.

          FULLY OPAQUE rather than a dimmed resting state: a faded card would
          have put --fg text under an opacity multiplier and quietly taken the
          contrast below the 4.5:1 the tokens were measured to clear. The card is
          either the page's own ink or it is not on the page.

          It is aria-hidden either way — every month it names is already printed
          in the rows under Solid, so this is a second view of the record and not
          the only copy. */}
      {/* TWO TAGS AT REST, THE WHOLE RECORD ONCE READ (annotation msk1hbse:
          "in the default state only the zepto and product designer 2 tag should
          be visible"). The resting card was the full panel — month, org, role,
          riders, ship, every outcome — sitting there before anyone had asked it
          anything, which made the default state as loud as the engaged one and
          left the sweep with nothing to reveal.

          The two that stay are the two that answer "who is he now": the org and
          the role. As TAGS rather than a sentence, because at rest they are a
          label on the present moment, not a reading of a month.

          The MONTH moved out of this card entirely — it is on the rail now, with
          the years, where a date belongs on a timeline. */}
      {/* THE PANEL IS GONE - IT IS THE CARD NOW (annotations msmnyhki /
          msmpa2ka, "the card that appears on hover should be merged with these
          elements"; the same ask reached the other session three more times as
          "merge into one"). There used to be TWO objects saying one thing: ten
          resting tag cards that vanished on engage, and a separate floating
          panel that appeared somewhere else to describe whichever month you had
          landed on. Nothing tied the panel to the card whose tenure it was
          describing, so the sweep read as one thing being replaced by another
          rather than as one thing opening.

          Now the tenure's OWN card opens in place: same element, same position,
          same key, so it is the card you were already looking at that grows the
          month, the riders, the ship and the outcomes. See .tlx__rail-tagcard
          [data-open] in timeline.css for the box it becomes. */}

      {/* ALL OF THEM AT REST (annotation msk2bq5f, "just like zepto card, can
          all cards be visible"). The resting state used to be ONE card naming
          the present month; now every tenure carries the same two-tag card at
          its own start, so the default state is the whole record labelled
          rather than a single moment plucked out of it.

          They vanish on engage. Ten cards plus the full panel would be the
          panel landing on top of them, and the point of the sweep is to read
          one thing closely — the resting state answers "what is all this", the
          engaged one answers "what was happening in this month". */}
      {/* ALWAYS MOUNTED NOW, where this used to unmount on engage. The cards
          have to survive the transition for the merge to mean anything: an
          element that is torn down and replaced is not the same card opening,
          it is a different card appearing in its place.

          ALL TEN STAY FULLY VISIBLE ON HOVER (annotation msq…, "on hover of the
          timeline all elements should be visible, not only the hovered one").
          `data-dim` is still SET on the nine that are not open, but on the
          pointer layout it has NO effect - there is no desktop rule that fades
          it, by design: the whole record should stay readable while one card is
          expanded. The attribute earns its keep only on the touch layout, where
          the strip scrolls under a fixed reading line and there is physically no
          room for ten cards, so `[data-touch] [data-dim] { display: none }`
          shows the open one alone. Do not add a desktop dim back onto it. */}
      {/* THE HIDDEN MEASURER (per-card centering). One node per card, drawn at
          the open card's own width with its full panel, off-screen and inert, so
          the effect above can read each card's true expanded height. Never seen,
          never announced, never a tab stop. */}
      <span className="tlx__rail-measure" ref={measureRef} aria-hidden>
        {model.cards.map((c, i) => (
          /* data-open gives it the EXACT open-card box (width, padding, radius,
             column flow) so the height it reports is the height the real card
             reaches - matching by hand left it ~14px short. Kept in its own
             `.tlx__rail-measure` wrapper, so the cardsRef queries that drive the
             live rail never see this data-open node. */
          <span
            className="tlx__rail-tagcard tlx__rail-measure-card"
            data-open="true"
            key={`m-${c.key}`}
          >
            <span className="tlx__rail-tag">{c.org}</span>
            <RailDetailBody detail={detailOf(c)} fallbackSpan={detailOf(c)?.span || ""} />
          </span>
        ))}
      </span>

      <span className="tlx__rail-cards" ref={cardsRef} aria-hidden data-packed={lanes ? "true" : undefined}>
          {model.cards.map((c, i) => (
            <span
              key={c.key}
              className="tlx__rail-tagcard"
              data-open={i === shownCard ? "true" : undefined}
              data-dim={engaged && i !== activeCard ? "true" : undefined}
              /* ONE CARD, BY NAME (annotation msmpfmk9). Named here rather than
                 derived from anything, because it is not a rule - it is one
                 card Agam wanted on the other side of the rail. Reading it as a
                 rule is exactly the mistake the first pass made, and a
                 general-looking mechanism would invite the same misreading
                 again. The row it moves to is in timeline.css. */
              data-below={belowList.includes(c.org) ? "true" : undefined}
              data-twoline={RAIL_TWO_LINE.includes(c.org) ? "true" : undefined}
              /* THE CARD IS ITS OWN WAY IN (QA: "info there but not showing
                 up"). Sweeping the rail can only open ONE card per month, and
                 the rule it uses - the month's FIELD wins - left every tenure
                 that ran as a rider unreachable: Toppr, Siemens and AIIMS
                 alongside the degree, Dassh and Away alongside Zepto. Five of
                 ten cards had a full record nothing could open. Measured by
                 sweeping all 100 months and collecting which ever appeared.

                 Pointing at the card itself is the missing door, and the
                 obvious one: the thing you want to read is under the cursor
                 already. It engages at that tenure's own start month, so the
                 rail's readout and the card agree about what is being shown. */
              onPointerEnter={() => {
                setPinned(i);
                engage(c.i0);
              }}
              /* THE CARD'S OWN EDGE CLOSES IT (annotation msu558a6, "what's
                 the hover area here, the card should collapse instantly as
                 soon as the mouse moves out of the immediate area of the
                 card"). The rail's leave was the single reset, so a card
                 pinned by pointing at it stayed open across the whole band -
                 the hover area was the rail, not the card. Now leaving a
                 PINNED card resets at once; a card the SWEEP opened is not
                 pinned and is left to the strip, which decides per month. If
                 the pointer leaves the card onto the strip, onMove re-engages
                 in the same frame, so the sweep is unaffected. */
              onPointerLeave={() => {
                if (pinned === i) onLeave();
              }}
              style={{
                // CLAMPED WHEN OPEN so a card late in the run cannot open off
                // the right edge - the same measure-and-correct the caption in
                // AlongPath uses. At rest the packer's own left is untouched.
                // ON TOUCH THE OPEN CARD IS CENTRED, not placed at its month:
                // the strip scrolls under a fixed reading line, so the card
                // belongs to the LINE rather than to a position in the run.
                // Left as `undefined` so the stylesheet can own it.
                left:
                  touch && i === shownCard
                    ? undefined
                    : lanes
                      ? `${i === shownCard ? Math.max(0, Math.min(lanes[i].left, railW - 300)) : lanes[i].left}px`
                      : `${c.x}%`,
                // NO EXPLICIT RESTING WIDTH (annotation msnxe7h9: "in default
                // state this card has extra width compared to others").
                //
                // It was pinned to `lanes[i].w`, the width the PACKER measured -
                // and the packer measures whatever the card was at that moment.
                // Re-pack while a card is open (a resize, a lane change, any
                // ResizeObserver fire) and its 300px panel width is recorded as
                // its RESTING width, which is why CaratLane sat wide while the
                // other nine hugged their labels.
                //
                // The pixel width only ever existed so the pill->panel morph
                // could interpolate `width`, and msneg1bs took width out of that
                // transition because animating the box around already-wrapped
                // text read as a glitch. So the reason is gone and the bug it
                // left behind goes with it: the card sizes to its own label,
                // which is right by construction and cannot be captured wrong.
                "--lane": lanes ? lanes[i].lane : 0,
              }}
            >
              {/* ONE pill, not an org pill beside a role pill (annotations
                  msl47dom / msl47nd1 / msl47whg, "merge in one box" dropped on
                  three separate cards): two boxes read as two labels, and the
                  role is not a second thing - it is the same tenure. The
                  middot is the same joiner the scrub panel already uses. */}
              {/* TWO LINES, ONE BOX (annotation msmsv40x, from the Figma
                  reference at node 123-28708). The org sits over the role
                  rather than being joined to it by a middot.
                  This does NOT reopen msl47dom/msl47nd1/msl47whg, which asked
                  for one BOX instead of two pills - it still is one box. What
                  changed is that inside it the name is a heading and the role
                  is a subtitle, which is what the drawing shows and what lets
                  the name stay findable when ten of these are on screen. */}
              {/* THE ROLE LINE IS GONE FROM EVERY TILE (annotation msmtewu7,
                  "remove this subtext from all tiles" - all, explicitly, so
                  this one IS the rule). The card is the org and nothing else.
                  The role is not lost: it is still in the model, it is still in
                  the printed rows under Solid, and the OPENED card still carries
                  the full record. What the resting row says now is who, and
                  where on the timeline - which is all ten of them can say at
                  once without becoming a paragraph. */}
              <span className="tlx__rail-tag">{c.org}</span>
              {/* what the floating panel used to carry, now inside the card it
                  was always describing. Only the open one renders it, so the
                  other nine stay two-tag labels. */}
              {/* Only the open one renders it, so the other nine stay two-tag
                  labels. The body is the shared component now (per-card
                  centering), so the live panel and the hidden measurer are
                  guaranteed identical. */}
              {i === shownCard && (
                <RailDetailBody detail={railDetail} fallbackSpan={cur.label} />
              )}
            </span>
          ))}
          {/* THE LEADER LINES (annotation msmsv40x). In the reference every
              label is joined to its own tick by a hairline with a dot at the
              card end, and that is the structure the rail was missing: a card
              sits at the month it names, but the lane packing CLAMPS it so it
              cannot run off the edge, which means the box and the month it
              belongs to drift apart by up to a couple of hundred pixels. The
              row read as a cloud of labels near a ruler.

              So the line is drawn at the MONTH, not at the card - `c.x` is the
              unclamped position, the same number the packer starts from before
              it moves the box out of trouble. The card can sit wherever it
              fits; the line always lands on the right tick. */}
          {lanes &&
            model.cards.map((c, i) => (
              <span
                key={`lead-${c.key}`}
                className="tlx__rail-leader"
                data-below={belowList.includes(c.org) ? "true" : undefined}
                data-twoline={RAIL_TWO_LINE.includes(c.org) ? "true" : undefined}
                /* so the stylesheet can drop this one's RUN line while the card
                   is open (msneezst) - the leaders and the cards are siblings,
                   so CSS has no way to ask "is my card open" on its own */
                data-open={i === shownCard ? "true" : undefined}
                /* CENTRED ON THE TICK, not on the start of its cell. `c.x` is
                   the month's fraction of the run, which puts it at the LEFT
                   edge of that month's slot; the tick is drawn in the middle of
                   the slot. Measured 5px off across the board before this - half
                   a step, exactly - which on a 10px pitch is the difference
                   between pointing at a month and pointing between two. */
                style={{
                  left: `${((c.i0 + 0.5) / model.n) * railW}px`,
                  "--lane": lanes[i].lane,
                }}
                aria-hidden
              />
            ))}
          {/* THE PRESENT MONTH GETS A MARK OF ITS OWN (annotation msq0…, "on the
              last dash add a line and box with a rocket emoji instead of text").
              The rail's last tick is the only landmark with nothing pointing at
              it: the ten cards name tenures that have a START, and NOW is not a
              start. So it gets the same two-part mark - hairline plus box - and
              a rocket where the others carry an org, which says "still going"
              without asking a word to say it.

              ITS OWN CLASSES, deliberately not `tlx__rail-tagcard` /
              `tlx__rail-leader`. Both of those are queried by index in the pack
              effect above (`querySelectorAll` -> `model.cards[i]`), so an
              eleventh element carrying either class would shift every card off
              its own lane by one. The geometry is duplicated in timeline.css
              instead - a few lines, against silently breaking the packer. */}
          {lanes && (
            <>
              <span
                className="tlx__rail-nowlead"
                data-covered={nowCovered ? "true" : undefined}
                style={{ left: `${((model.n - 0.5) / model.n) * railW}px` }}
                aria-hidden
              />
              {/* EXPANDS ON HOVER (Agam, 2026-08-15: "create an expand state
                  for the rocket emoji box and animate on hover"). The rocket
                  line stays as the box's header; a second grid row unrolls
                  beneath it (0fr -> 1fr, so nothing has to be measured) with
                  what NOW is: the last month, and every tenure still running
                  in it, read off model.months[n-1] - the same record the
                  ten cards read - so it cannot disagree with the rail. Its own
                  hover state, not the rail's engaged/pinned pair: the now-mark
                  is not a card in the pack. */}
              <span
                className="tlx__rail-nowcard"
                data-open={nowOpen && !nowCovered ? "true" : undefined}
                data-covered={nowCovered ? "true" : undefined}
                onPointerEnter={() => setNowOpen(true)}
                onPointerLeave={() => setNowOpen(false)}
                style={{
                  left: `${((model.n - 0.5) / model.n) * railW}px`,
                  ...(nowRestW ? { "--now-rest-w": `${nowRestW}px` } : null),
                }}
              >
                <span className="tlx__rail-nowcard-head">
                  <span className="tlx__rail-nowcard-glyph" ref={setNowGlyph}>🚀</span>
                  <span className="tlx__rail-nowcard-title">
                    <span className="tlx__rail-tag">Now</span>
                    <span className="tlx__rail-detail-month">{model.months[model.n - 1].label}, still going</span>
                  </span>
                </span>
                <span className="tlx__rail-nowcard-more">
                  <span className="tlx__rail-nowcard-inner">
                    <ul className="tlx__rail-detail-bullets">
                      {[
                        ...(model.months[model.n - 1].field ? [model.months[model.n - 1].field] : []),
                        ...model.months[model.n - 1].riders,
                      ].map((t) => (
                        <li key={t.org}>
                          <strong>{t.org}</strong>
                          {t.role ? ` · ${t.role}` : ""}
                        </li>
                      ))}
                    </ul>
                  </span>
                </span>
              </span>
            </>
          )}
      </span>

      {/* THE DATE, ON THE TIMELINE (annotation msk1hbse, "dates should be
          visible in the timeline with another layer for years"). Two scales, and
          they are deliberately different KINDS of thing:

            the date  follows the pointer and names the exact month under it. It
                      is one label because a hundred months cannot each carry
                      text across 500px — the readout goes where you are looking
                      instead of being printed everywhere at once.
            the years are a fixed layer underneath, one label per January, so the
                      rail has a permanent frame to read the moving date against.

          Both live on the rail rather than in the card, which is what let the
          card drop to two tags: a date on a timeline belongs on the timeline. */}
      {/* SHOWN ONLY WHILE ENGAGED (Agam: "it should disappear when the mouse
          has moved out"): the readout names the month under the pointer, and
          with no pointer there is no month to name - the year row is the
          resting frame. Fades on the effects curve via data-on. */}
      <motion.span className="tlx__rail-date" data-on={engaged ? "true" : undefined} style={{ left: dateLeft }} aria-hidden>
        {cur.label}
      </motion.span>

      {/* ON A POINTER this stays exactly what it was: a decorative frame, spans,
          aria-hidden, because the sweep already crosses years faster than a tap
          could and a screen reader gets the record in full under Solid.

          ON TOUCH it becomes real navigation - buttons in a <nav>, no longer
          aria-hidden, because it is now the only way to cross seven years
          without a drag the length of four screens. Same layer, same positions,
          same labels; what changes is whether it can be pointed at. */}
      {touch ? (
        <nav className="tlx__rail-years" aria-label="Jump to a year">
          {model.years.map((y) => (
            <button
              type="button"
              key={y.label}
              className="tlx__rail-yearbtn"
              style={{ "--x": `${y.x}%` }}
              // The year the reading line is inside, which is the LAST January
              // at or before the current month - not the nearest one. Nearest
              // would flip to 2023 in July 2022, and you are not in 2023.
              aria-current={y.label === curYear ? "true" : undefined}
              data-on={y.label === curYear ? "true" : undefined}
              onClick={() => jumpToYear(y.i)}
            >
              {/* `'19`, NOT `2019`, and only on touch. Measured: the four-digit
                  label is 40.9px wide and the years sit 40.2px apart at 375, so
                  they already touch edge to edge - there is no horizontal room
                  for a hit area, and any padding makes neighbouring targets
                  OVERLAP, which is worse than a small target because the tap
                  becomes ambiguous rather than merely fiddly.

                  Two digits halves the label to ~20px and leaves 20px of gap to
                  spend on the target. The alternative was showing every other
                  year, which fits comfortably and is wrong: 2020, 2022 and 2024
                  are all years with a tenure starting in them, and a jump
                  control that cannot reach half the record is not one.

                  The full year is still spoken - aria-label carries it - and
                  the readout above says "May 2019" in full while you travel. */}
              <span aria-hidden>{`’${y.label.slice(2)}`}</span>
              <span className="tlx__sr">{y.label}</span>
            </button>
          ))}
        </nav>
      ) : (
        <span className="tlx__rail-years" aria-hidden>
          {model.years.map((y) => (
            <span key={y.label} className="tlx__rail-year" style={{ "--x": `${y.x}%` }}>
              {y.label}
            </span>
          ))}
        </span>
      )}

      {/* NO HINT LINE (annotation msjwaxga). "One mark per month, May 2018 to
          now. Sweep the spine." sat under the strip and was removed with the
          container resized to match. It existed on the argument that a hover
          surface should say what it is rather than wait for a cursor that may
          never arrive — worth recording, because that argument is still true
          and this is a deliberate trade against it. What answers it now is
          that Rail is one of four tabs and the only one you reach by choosing
          it, and the record is printed in full under Solid either way. */}
    </div>
  );
}

// ── THE MARKET (market style only) ──────────────────────────────────────────
// A copy of Dither's job — the whole record in one drawing — read as a ticker.
// The model is in marketModel.js; this only draws it.
//
// SVG, where Dither is divs and clip-paths. Dither's shapes are rectangles and
// stepped edges, which CSS boxes do natively; this is one 400-point polyline and
// a filled area under it, which they do not. Same reasoning that kept the dither
// fill in CSS: use the thing that draws the shape you actually have.
//
// `vectorEffect="non-scaling-stroke"` because the viewBox is 0..100 in both axes
// and the box is far wider than it is tall — without it the stroke would be
// stretched into a smear on x and a hairline on y.
//
// Real moments are BUTTONS, invented wander is not interactive. That split is
// the honest one: you can point at anything that means something, and there is
// nothing to point at where there is nothing to know.
function Market({ model }) {
  return (
    <div className="tlx__mkt">
      {/* MATCHED TO THE DITHER-KIT REFERENCE (Agam: "match the dither
          reference exactly", after msl5xhek). Read off tripwire.sh's own demo:
          the bottom band is the GRADIENT variant (solid fading up through a
          dither dissolve), the band above it HATCHED (diagonal dither), tiny
          mono axis labels, NO gridlines, and the square-swatch legend sitting
          top-right ABOVE the plot. So: variants alternate gradient/hatched up
          the stack (texture separates neighbours beyond hue, which ten bands
          on six hues need), the Grid is gone, and the Legend renders first.
          ONE deliberate divergence: the reference prints y-axis values because
          its numbers are real; ours are an invented walk, and printing ticks
          against them would claim a measurement the standing line below
          explicitly disowns. No YAxis, on purpose. */}
      {/* BlockLegend, NOT the overlay Legend (Agam: "graph still looks
          weird"). Two reasons, both found at 1:1: the overlay Legend renders
          BUTTONS, and this project's Tailwind config lacks the kit's utility
          classes, so ten entries fell back to UA button chrome - two rows of
          giant grey chips sitting ON the plot. The kit's own docs say the
          overlay is for <=3 entries and multi-series charts should use the
          in-flow BlockLegend; it is a plain ul/li, styled by
          .tlx__mkt-legend so the reference look does not depend on Tailwind
          having the right utilities. */}
      <BlockLegend config={model.config} align="end" className="tlx__mkt-legend" />
      <AreaChart
        data={model.rows}
        config={model.config}
        stackType="stacked"
        className="tlx__mkt-chart"
        margins={{ top: 12, right: 8, bottom: 26, left: 8 }}
        animationDuration={900}
      >
        <XAxis
          dataKey="m"
          maxTicks={8}
          tickFormatter={(m) => String(Math.floor(Number(m) / 12))}
        />
        {model.projects.map((p, i) => (
          <Area key={p.key} dataKey={p.key} variant={i % 2 ? "hatched" : "gradient"} isClickable />
        ))}
        <Tooltip labelKey="label" valueFormatter={() => ""} />
      </AreaChart>

      {/* A STANDING LINE, not a hover readout. The kit's own Tooltip does the
          scrub now, so the hand-rolled one that named the nearest event went
          with the event marks — and its copy had already stopped being true:
          it said "every mark is a real month" on a chart that no longer has
          marks. What stays is the sentence a reader needs to not misread the
          picture, which is the same thing it always was.

          `valueFormatter` on the Tooltip returns an empty string on purpose:
          the kit would otherwise print a height, and the height here is
          invented. The project name and the month are the real parts. */}
      {/* COUNTED FROM THE DATA, not typed. This line has now gone stale twice —
          it said "every mark is a real month" after the marks were removed, and
          "six projects" after two of them merged into one Zepto band. A number
          in prose that describes a list is a number that will be wrong. */}
      {/* "at the months they really shipped" is gone from this line with the
          rest of the ship content (2026-08-11). The bands are spans of attention
          across real months either way, which is what the sentence now says; no
          band moved. */}
      <p className="tlx__mkt-read">
        {COUNT[model.projects.length] || model.projects.length} projects, across the months they
        ran. The heights are drawn, not measured.
      </p>
    </div>
  );
}

// The dither chart. Every part of it is a THING WITH A NAME: the floor is runs
// of whoever held it, and the bulges above are named rider runs rather than one
// anonymous polygon. Pointing at any of them fills the panel underneath.
// (The six ship dots that used to ride the top of the plot are gone, 2026-08-11.)
//
// Hover AND focus, on real buttons: a chart whose only way in is a cursor is a
// chart half the readers cannot open.
function Chart({ chart, details }) {
  const [hot, setHot] = useState(null); // { id }
  const d = hot && hot.id ? details.get(hot.id) : null;

  const bind = (next) => ({
    onPointerEnter: () => setHot(next),
    onFocus: () => setHot(next),
    onPointerLeave: () => setHot(null),
    onBlur: () => setHot(null),
  });

  return (
    <figure className="tlx__chart">
      <div className="tlx__chart-plot">
        <div className="tlx__chart-grid" aria-hidden>
          {chart.ticks.map((t) => (
            <span key={t.v} className="tlx__chart-gridline" style={{ "--y": `${t.y}%` }}>
              <i>{t.v}</i>
            </span>
          ))}
        </div>

        {chart.floor.map((f) => (
          <button
            type="button"
            key={f.key}
            className="tlx__floor"
            data-wide={f.w > 8 ? "true" : undefined}
            data-hot={hot && hot.id === f.id ? "true" : undefined}
            style={{
              "--x": `${f.x}%`,
              "--w": `${f.w}%`,
              "--top": `${chart.floorTop}%`,
              "--h": `${chart.floorH}%`,
            }}
            aria-label={`${f.org}, held the field`}
            {...bind({ id: f.id })}
          >
            <b>{f.org}</b>
          </button>
        ))}

        {chart.riders.map((r) => (
          <button
            type="button"
            key={r.key}
            className="tlx__rider"
            data-hot={hot && hot.id === r.id ? "true" : undefined}
            style={{ "--x": `${r.x}%`, "--w": `${r.w}%`, "--top": `${r.top}%`, "--h": `${r.h}%` }}
            aria-label={`${r.org}, ran alongside`}
            {...bind({ id: r.id })}
          />
        ))}

      </div>

      <div className="tlx__chart-x" aria-hidden>
        {chart.years.map((y) => (
          <span key={y.label} style={{ "--x": `${y.x}%` }}>
            {y.label}
          </span>
        ))}
      </div>

      <figcaption className="tlx__chart-cap">
        <span className="tlx__key" data-band="field">Held the field</span>
        <span className="tlx__key" data-band="alongside">Ran alongside</span>
      </figcaption>

      <Detail
        d={d}
        fallback={`Commitments at once, one step per month across ${chart.months} lived months. Peak ${chart.max}. Point at any band.`}
      />
    </figure>
  );
}

// ── THE ROW ─────────────────────────────────────────────────────────────────
// The only drawing code in this file, and it knows nothing about where its
// numbers came from. Type, spacing, focus order and the shape of a bar are
// decided once, here.
function Row({ row, onHot }) {
  return (
    <li
      className="tlx__row"
      data-kind={row.kind}
      /* HOVER ONLY, and no focus handler, which is a deliberate asymmetry with
         the other three tabs. There the card is the ONLY way to reach the
         record, so it has to be focusable. Here every fact is already printed
         in the row underneath the pointer — the card brings it forward, it does
         not reveal it. A tab stop per row would add ten stops to the page for
         information a keyboard user already has. */
      /* The ENTRY POSITION travels with the id. The card only mounts once a row
         is hot, so the pointermove that would have positioned it has already
         happened — without this it renders at 0,0 and flashes in the top-left
         corner until the pointer moves again. */
      onPointerEnter={(e) => onHot(row.id, e.clientX, e.clientY)}
      onPointerLeave={() => onHot(null)}
    >
      <div className="tlx__gutter">
        <span className="tlx__name">{row.name}</span>
        <span className="tlx__sub">{row.sub}</span>
        {row.role && <span className="tlx__role">{row.role.replace(" → ", ", then ")}</span>}
        <span className="tlx__dates">{row.dates}</span>
      </div>
      <div className="tlx__track">
        {/* The bar sits in a positioned box; everything after it is ordinary
            flow. That split is what stopped the labels from needing collision
            maths - it mattered most for the ship dots that used to share this
            box, and it costs nothing now that the bar is alone in it. */}
        <div className="tlx__plot">
          {/* The hairline runs the full width whatever the bar does, so an empty
              stretch reads as time passing rather than as nothing drawn. */}
          <span className="tlx__rule" aria-hidden />
          <span
            className="tlx__bar"
            data-kind={row.kind}
            style={{
              "--x0": `${row.bar.x0}%`,
              "--x1": `${row.bar.x1}%`,
              "--accent": row.bar.accent || "transparent",
            }}
            aria-hidden
          />
        </div>
        {row.outs.map((o, i) => (
          <p className="tlx__out" key={i}>
            {o}
          </p>
        ))}
        {/* The ship cards - brand, month, title, role and outcome, one block per
            shipped project - stood here and are gone (Agam, 2026-08-11: "remove
            all the shipped related content"). A row is now its printed facts and
            its outcomes; what shipped out of a tenure is the case studies' job.
            The projects themselves are untouched in the data. */}
      </div>
    </li>
  );
}

export default function Timeline() {
  // Built on MOUNT, not at module load. `lensDomain()` runs to the current
  // month, and a model computed when the bundle evaluated would report a stale
  // "now" in a tab left open across a month boundary.
  const model = useMemo(() => recordLens(), []);
  // Presentation only, so it does NOT rebuild the model: the rows are identical
  // either way and only the CSS differs. That is the test for whether something
  // belongs in a style rather than in a reading.
  // RAIL IS THE DEFAULT (annotation msng7zqw, "make rail the default view and
  // hide this").
  //
  // ⚠ THIS BREAKS A STANDING RULE, and it should be a decision rather than a
  // side effect. The printed rows - the ONLY place the record appears in full
  // text - are gated on `style === "solid"` further down. Solid was the default
  // precisely so that nothing was reachable only by pointing at it; the note on
  // that gate still says "SOLID IS STILL THE WHOLE RECORD IN TEXT and it is the
  // default tab".
  //
  // With Rail as the default AND the style switcher hidden (msng8b49 hid the
  // spine control too), Solid is now unreachable, so the written record is off
  // the page entirely and every fact lives behind a hover.
  //
  // Left as asked, flagged here rather than quietly worked around. The two ways
  // out, whenever it is wanted: render the rows under every style, or restore
  // the switcher.
  const [style, setStyle] = useState("rail");
  // Only built when it is actually drawn. Cheap either way, but there is no
  // reason for Solid to pay for a series it never shows.
  const chart = useMemo(() => (style === "dither" ? chartModel() : null), [style]);
  const market = useMemo(() => (style === "market" ? marketModel() : null), [style]);
  // Rail reads the SAME model as Scrub — same 100 months, same per-month
  // record. Two readings of one series, which is the point of the contract.
  const scrub = useMemo(
    () => (style === "scrub" || style === "rail" ? scrubModel() : null),
    [style],
  );
  const reduce = useReducedMotion();
  // Built for EVERY style now: Solid uses it for the cursor-follow card too.
  const details = useMemo(() => detailsById(), []);

  // SOLID'S HOVER CARD. The position is written straight to the element on
  // pointermove rather than held in state — this fires at pointer rate, and a
  // setState per move would re-render ten rows for a value only one floating
  // box cares about. transform keeps it on the compositor.
  const [peek, setPeek] = useState(null); // { id, x, y } | null
  const peekRef = useRef(null);
  const hotPeek = useCallback((id, x, y) => setPeek(id ? { id, x, y } : null), []);
  const movePeek = useCallback((e) => {
    const el = peekRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
  }, []);

  return (
    <section className="tlx" data-style={style} aria-label="Project timeline">
      <header className="tlx__head">
        <h2 className="tlx__title">
          A journey through
          <br />
          {/* the footer's dotted mark, on the one word that is a figure of
              speech (annotation msu9a8k4, "do this dotted treatment for
              space-time text in the above section") */}
          <span className="tlx__title-mark">space-time</span> and projects
        </h2>
        {/* NO HARD BREAKS (Agam, 2026-08-11: the subtext "does not look right in
            mobile"). There were three <br>s here, each cutting the sentence where
            it looked right at a desktop measure. At 375px every one of those
            lines wrapped AGAIN, so the paragraph rendered as six lines with two
            orphans on the end - measured, one of them 36px wide and one 4px.
            A break tuned to one width is a break that is wrong at every other
            one. The copy is one flow now, and where it breaks is decided by a
            measure and `text-wrap: balance` in the stylesheet, at whatever width
            it is actually being read at. */}
        <p className="tlx__sub-copy">
          I started in <mark>ed-tech in 2019</mark> and have not stayed in one category
          since. A research project at AIIMS Rishikesh, a B2B SaaS from zero, a
          10-min grocery platform, and now <mark>an AI travel agent</mark>.
        </p>
      </header>

      {/* REMOVED (annotation msibmo40): the "<unit> — <note>" line that used to
          sit here explaining that the track's width is months. The ruler ticks
          above already carry years and the bars are read against them, so the
          sentence was restating what the chart shows. `model.unit` and
          `model.note` are still built in the model — nothing else consumed them,
          but they are cheap and are the copy to bring back if this ever needs
          words again. */}

      {/* THE STYLE SWITCHER IS HIDDEN (annotation msng7zqw). Commented rather
          than deleted, and the state above is untouched, so every style still
          builds and `setStyle` is one uncomment away - Dither, Scrub, Market and
          Solid are all still there, just not offered.
          
          Worth knowing what goes with it: those four are four different readings
          of the same record, and this control was the only way to reach them. If
          they are meant to stay reachable, this is the line to restore. */}
      {false && (
      <div className="tlx__styles" role="group" aria-label="Draw style">
        {STYLE_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className="tlx__chip"
            data-active={style === k ? "true" : undefined}
            aria-pressed={style === k}
            onClick={() => {
              if (k !== style) feedback("select");
              setStyle(k);
            }}
          >
            {STYLES[k].label}
          </button>
        ))}
      </div>
      )}

      {/* THE GRAPH, dither style only. It sits ABOVE the rows rather than
          replacing them: the rows are the only place the record is printed in
          full, and trading that away for a picture would undo the thing this
          section was rebuilt for. The graph adds a reading the rows can only
          imply — how many things ran at once — and the rows stay underneath as
          the source it is drawn from. */}
      {chart && <Chart chart={chart} details={details} />}

      {market && <Market model={market} />}

      {style === "scrub" && scrub && <Scrub model={scrub} details={details} reduce={reduce} />}
      {style === "rail" && scrub && <Rail model={scrub} details={details} reduce={reduce} />}
      {/* THE SECOND RAIL IS GONE (annotation msqrlgll, "remove this"). It was
          added by msoov1lo as a live A/B surface - same component, same model,
          no fork - on the promise that it was "one line to remove, and nothing
          above it knows this exists". Taking that promise at its word.

          The v2 it was parked for never diverged from v1, so what shipped was
          the rail drawn twice: two hundred ticks, two sets of cards, and every
          measurement of "the rail" ambiguous about which one it meant. That
          ambiguity cost real time this session. */}

      {/* THE PRINTED ROWS ARE SOLID-ONLY NOW. Every other tab carries the same
          record inside its own drawing, reached by hover, focus or click.
          This reverses the rule the rebuild ran on ("all info always present"),
          and it is Agam's call, made explicitly. What keeps it honest is that
          SOLID IS STILL THE WHOLE RECORD IN TEXT and it is the default tab, so
          nothing is only reachable by pointing at it. */}
      {style === "solid" && (
      <div className="tlx__grid">
        <div className="tlx__ruler" aria-hidden>
          <span className="tlx__gutter" />
          <div className="tlx__track">
            {model.ticks.map((t) => (
              <span className="tlx__tick" key={t.label} data-align={t.align} style={{ "--x": `${t.x}%` }}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
        <ol className="tlx__rows" onPointerMove={movePeek}>
          {model.rows.map((r) => (
            <Row key={r.id} row={r} onHot={hotPeek} />
          ))}
        </ol>
      </div>
      )}

      {/* Rendered only while a row is under the pointer, so nothing sits in the
          DOM at rest. aria-hidden: it is a second copy of the row it is
          hovering, and a screen reader has already read the original. */}
      {style === "solid" && peek && (
        <div
          className="tlx__peek"
          ref={peekRef}
          aria-hidden="true"
          style={{ transform: `translate3d(${peek.x + 18}px, ${peek.y + 18}px, 0)` }}
        >
          <Detail d={details.get(peek.id)} />
        </div>
      )}
    </section>
  );
}
