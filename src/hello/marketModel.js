// THE MARKET READING (annotation msk1dnp4) — the record drawn as a ticker.
//
// "don't make these graphs a without a flat score ... we can define some events
// in all experiences to show the slope going up and down, the micro up and down
// like stocks between 2 events can be fabricated."
//
// So there are two layers, and they are not the same kind of thing:
//
//   EVENTS are real. Every one of them is a date already in helloData — a
//   tenure starting, a tenure ending, a ship going out. They sit at their true
//   months and carry their true names, and they are what moves the line.
//
//   THE LINE BETWEEN THEM IS INVENTED. Agam's call, made explicitly: the
//   micro-movement is stock-chart texture and means nothing. It is not a
//   measurement of anything and there is no hidden series behind it.
//
// SEEDED, NEVER Math.random(). Two reasons and both matter: a chart that
// redrew differently on every render would flicker on any state change in the
// section, and the same walk has to come out of the same record every time or
// the drawing stops being a property of the data at all. mulberry32 off a fixed
// seed gives one deterministic sequence.

import { TENURES } from "./helloData";
import { lensDomain, shipMonth, shipsOldestFirst, ym, ymLabel } from "./lensModels";

// Small, fast, well-distributed. The constants are the published ones.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// How much each kind of moment moves the line. Sizes are relative to each other
// and to nothing else — a ship is the biggest single move because shipping is
// the thing this record is actually about, and an ending is a real dip rather
// than a fall off a cliff because none of these ended badly.
const KICK = { ship: 15, start: 9, end: -6 };

const SAMPLES_PER_MONTH = 4; // enough to read as a ticker, cheap enough to redraw

// The kit ships seven hues; these are six of them, ordered so neighbouring
// projects in time do not land on neighbouring hues — adjacent bands in a stack
// are the ones that most need telling apart.
const PALETTE = ["purple", "green", "orange", "blue", "pink", "red"];

// Which ships are the same place. Only Zepto has two today; the map is the
// place to say so if that changes.
const GROUP = { "scheduled-delivery": "zepto", zepiris: "zepto" };

// Keyed by the SERIES key (post-grouping), not the ship id.
const SHORT = {
  toppr: "Toppr",
  aiims: "AIIMS",
  dassh: "Dassh",
  zepto: "Zepto",
  awayagent: "Away",
};

export function marketModel() {
  const domain = lensDomain();
  const n = domain.m1 - domain.m0 + 1;
  const rand = mulberry32(0x5eed);

  // ── the real layer ────────────────────────────────────────────────────────
  const events = [];
  for (const t of TENURES) {
    const s = ym(t.start);
    if (s >= domain.m0 && s <= domain.m1) {
      events.push({ m: s, kind: "start", org: t.org, label: `Joined ${t.org}`, id: `${t.id}-in` });
    }
    if (t.end) {
      const e = ym(t.end);
      if (e >= domain.m0 && e <= domain.m1) {
        events.push({ m: e, kind: "end", org: t.org, label: `Left ${t.org}`, id: `${t.id}-out` });
      }
    }
  }
  for (const p of shipsOldestFirst()) {
    const m = shipMonth(p);
    if (m >= domain.m0 && m <= domain.m1) {
      events.push({ m, kind: "ship", org: p.brand, label: `${p.brand}: ${p.title}`, id: p.id });
    }
  }
  events.sort((a, b) => a.m - b.m);

  // ── the invented layer ────────────────────────────────────────────────────
  // A random walk that is pulled back toward a trend line, so it wanders without
  // drifting off: the kicks set where the trend IS, and the walk only ever
  // decorates the way it gets there. Without the pull it is a drunk line; with
  // too much it is a smooth curve with a fuzzy edge.
  const kickAt = new Map();
  for (const e of events) kickAt.set(e.m, (kickAt.get(e.m) || 0) + KICK[e.kind]);

  const pts = [];
  let trend = 22;
  let value = trend;
  const total = n * SAMPLES_PER_MONTH;
  for (let s = 0; s < total; s++) {
    const m = domain.m0 + Math.floor(s / SAMPLES_PER_MONTH);
    if (s % SAMPLES_PER_MONTH === 0 && kickAt.has(m)) trend += kickAt.get(m);
    // a slow bleed downward, so a long quiet stretch drifts rather than plateaus
    trend -= 0.06;
    const noise = (rand() - 0.5) * 5.2;
    value += (trend - value) * 0.18 + noise;
    pts.push({ s, m, v: value });
  }

  const lo = Math.min(...pts.map((p) => p.v));
  const hi = Math.max(...pts.map((p) => p.v));
  const span = hi - lo || 1;
  const X = (s) => (s / (total - 1)) * 100;
  const Y = (v) => 100 - ((v - lo) / span) * 100;

  const xy = pts.map((p) => ({ x: X(p.s), y: Y(p.v) }));
  const line = xy.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(3)},${p.y.toFixed(3)}`).join("");
  const area = `${line}L100,100L0,100Z`;

  // THE SAME SHAPE IN 0..1, for a clip-path in objectBoundingBox units.
  //
  // The area is filled with the project's own CSS dither texture rather than an
  // SVG fill, and that forces this second copy. An SVG <pattern> would be
  // dragged through the same non-uniform scale the geometry is (the viewBox is
  // 0..100 on both axes inside a box far wider than it is tall), and round dots
  // stretched into ellipses is the ONE thing this style cannot survive — it is
  // the reason the dither graph is CSS boxes and not an SVG in the first place.
  //
  // Clipping an ordinary element instead keeps the dots square: the clip scales,
  // the background does not.
  const areaUnit =
    xy.map((p, i) => `${i ? "L" : "M"}${(p.x / 100).toFixed(5)},${(p.y / 100).toFixed(5)}`).join("") +
    "L1,1L0,1Z";

  // Each event's mark sits on the line at its own month, so the label and the
  // curve cannot disagree about where the moment was.
  const marks = events.map((e) => {
    const s = Math.min(total - 1, (e.m - domain.m0) * SAMPLES_PER_MONTH);
    return { ...e, x: X(s), y: Y(pts[s].v) };
  });

  const years = [];
  for (let m = domain.m0; m <= domain.m1; m++) {
    if (m % 12 === 0) years.push({ x: X((m - domain.m0) * SAMPLES_PER_MONTH), label: String(m / 12) });
  }

  // ── ONE SERIES PER PROJECT (annotation msk7svdt) ──────────────────────────
  // "use different color for different projects ... you can see the layered
  // colour graphs and the hover interactions."
  //
  // THIS REVERSES the single grey series this chart shipped with, and the
  // reversal is sound rather than a climbdown. The rule it was defending — that
  // colour must not carry meaning on this record — is about colour claiming a
  // VALUE is good. Colour naming WHICH PROJECT is categorical, which is the one
  // job it does honestly, and the bars on the other tabs already use brand
  // accents exactly that way.
  //
  // PROJECTS, NOT TENURES. There are ten tenures and the kit ships seven hues,
  // so tenures could not each have one without either doubling up or inventing
  // an eighth. The six SHIPS are the natural set: they are what "project" means
  // on this record, they are what the whole timeline points at, and six fits.
  //
  // A project's band rises around its ship and decays after — it is present
  // before as work in progress, loudest at release, and fades as attention
  // moves on. The SHAPE is invented, exactly as the single line was; what is
  // real is which project, and when it shipped.
  // GROUPED BY WHO SHIPPED IT (annotation msk85iq2, "schedule delivery and
  // zepiris can just be presented as zepto"). Two of the six ships came out of
  // the same job, and on a chart whose colours mean "whose work is this" they
  // were reading as two separate places to have worked. One Zepto band with two
  // peaks is the truer picture: the same tenure, shipping twice.
  //
  // A grouped series takes the MAX of its ships' lumps rather than their sum —
  // summing would make two releases nine months apart look like one enormous
  // year, which is a claim about size that nothing here measures.
  const ships = shipsOldestFirst()
    .map((p) => ({ ...p, m: shipMonth(p) }))
    .filter((p) => p.m >= domain.m0 && p.m <= domain.m1);

  // ── ONE SERIES PER COMPANY, the WHOLE record (annotation msl5xhek,
  // "populate all the data in the solid mode, all companies"). This widens the
  // six ship-groups to every tenure: a company's band is PRESENCE - it rises
  // when the tenure starts, holds while it runs, and decays after it ends -
  // and its ships ride that band as peaks. The old objection (ten tenures,
  // seven hues) is answered by ordering series chronologically and cycling
  // the palette: consecutive starts get consecutive hues, so neighbouring
  // bands always differ even where the cycle repeats.
  const companies = TENURES.filter((t) => ym(t.start) <= domain.m1)
    .slice()
    .sort((a, b) => ym(a.start) - ym(b.start))
    .map((t, i) => ({
      key: t.id.replace(/[^a-z0-9]/gi, ""),
      org: t.org,
      s: Math.max(domain.m0, ym(t.start)),
      e: t.end ? Math.min(domain.m1, ym(t.end)) : domain.m1,
      open: !t.end,
      ships: [],
      color: PALETTE[i % PALETTE.length],
    }));
  // a ship belongs to the company whose org matches its brand and whose span
  // holds its month (AIIMS Rishikesh vs the ship brand AIIMS - contains, not
  // equals); Zepto's two ships land on the one Zepto band as two peaks
  for (const p of ships) {
    const byOrg = (c) => c.org.includes(p.brand) || p.brand.includes(c.org);
    const host =
      companies.find((c) => byOrg(c) && p.m >= c.s - 2 && p.m <= c.e + 6) ||
      // org-only fallback: the AIIMS paper shipped YEARS after the tenure
      // ended (a 2025 publication of final-year research), so a span-window
      // match alone drops one of the six moments the record points at. On
      // the band it reads as a late peak rising from a settled tenure -
      // which is the true story of a paper.
      companies.find(byOrg);
    if (host) host.ships.push(p);
  }
  const projects = companies;

  // Rows carry one column per project. Each is a lump centred on the ship with
  // a slow build and a longer tail, plus the same seeded jitter the single line
  // used so the stack reads as a ticker rather than as smooth hills.
  const RISE = 6; // months a ship's peak builds on its company's band
  const FALL = 12; // months it decays back to the band
  const RAMP_IN = 3; // months a company's presence takes to reach its plateau
  const RAMP_OUT = 5; // months it takes to leave after the tenure ends
  const rows = pts.map((pt, i) => {
    const row = { i, m: pt.m, label: ymLabel(pt.m) };
    for (const pr of projects) {
      // presence: 0 outside the span (with soft ramps), 1 on the plateau.
      // An open tenure holds its plateau to the edge of the chart.
      let presence = 0;
      if (pt.m >= pr.s - RAMP_IN && (pr.open || pt.m <= pr.e + RAMP_OUT)) {
        const tin = Math.min(1, (pt.m - (pr.s - RAMP_IN)) / RAMP_IN);
        const tout = pr.open || pt.m <= pr.e ? 1 : Math.max(0, 1 - (pt.m - pr.e) / RAMP_OUT);
        presence = Math.max(0, Math.min(tin, tout));
      }
      // ships ride the band as peaks - strongest ship wins, as before
      let lump = 0;
      for (const sh of pr.ships) {
        const d = pt.m - sh.m;
        if (d < -RISE || d > FALL) continue;
        const b = d < 0 ? 1 - Math.abs(d) / RISE : Math.max(0, 1 - d / FALL);
        if (b > lump) lump = b;
      }
      const ease = (v) => v * v * (3 - 2 * v);
      // 0.10, down from 0.22 (Agam: "still looks weird"): ten bands each
      // jittering independently STACK, so the compound wobble at the top of
      // the pile was twice any single band's - spiky where the reference is
      // calm. Half the amplitude keeps the ticker texture without the noise.
      const jitter = 1 + (rand() - 0.5) * 0.10;
      row[pr.key] = +((ease(presence) * 10 + ease(lump) * 18) * jitter).toFixed(2);
    }
    return row;
  });

  // The kit's config: one entry per series, keyed exactly as the rows are.
  // SHORT LABELS. The full case-study titles are sentences — "Joyful learning
  // experiences for students" — and six of them wrapped the kit's legend onto
  // three rows, which then sat under the tooltip. A legend is an index, not a
  // description; the sentence is one tab away under Solid.
  //
  // The brand alone will not do either: two of the six are Zepto, so brand-only
  // would print the same word twice and index nothing. These are the names the
  // projects actually go by.
  const config = Object.fromEntries(
    projects.map((p) => [p.key, { label: p.org, color: p.color }]),
  );

  // ROWS FOR DITHER KIT. The library owns the drawing now — it takes data and
  // a config and paints its own ordered-dither fill, scrub and entrance — so the
  // hand-rolled `line` / `area` / `areaUnit` paths above are no longer rendered.
  // They are kept because the MODEL is still ours: the events, the kicks and the
  // seeded walk are what make this the record rather than a demo dataset, and
  // those paths are the cheapest proof that the numbers below are the same
  // numbers that used to draw the chart.
  //
  // One row per sample, carrying the month it belongs to so the axis can label
  // itself and the event marks can find their index.
  // The single-series rows the first version drew. Kept because the events, the
  // kicks and the seeded walk that produce `v` are still the honest summary of
  // the record, and a future reading may want the one line back.
  const flatRows = pts.map((p, i) => ({
    i,
    m: p.m,
    v: +p.v.toFixed(3),
    label: ymLabel(p.m),
  }));

  // The event marks, as INDICES into rows, so anything reading the chart can
  // line a real moment up with the sample under it.
  const marksByIndex = events.map((e) => ({
    ...e,
    i: Math.min(total - 1, (e.m - domain.m0) * SAMPLES_PER_MONTH),
  }));

  return { line, area, areaUnit, marks, marksByIndex, rows, flatRows, projects, config, years, months: n };
}
