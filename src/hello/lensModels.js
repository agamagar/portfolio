// Lens models for the three graduated lenses (Lens Lab, 2026-08-04): Registers,
// Ledger, Cadence. Pure data — the drawing lives in Timeline.jsx and the styles
// in timeline.css.
//
// SURVIVED THE 2026-08-07 REBUILD, and only this file did. The renderers it was
// written for (TimelineLenses.jsx, timelineViews.js) are deleted; the models
// stayed because they are pure, correct and the only place that works in whole
// months. Timeline.jsx uses lensDomain / shipMonth / shipsOldestFirst / ym /
// ymLabel. The rest (ledgerModel, loadModel, registersModel, shareModel,
// cadenceModel, occupancy, packLanes) is currently UNCALLED — kept as the
// worked-out record logic, not as live code.
//
// EVERYTHING HERE WORKS IN WHOLE MONTHS, never the decimal-year `at` values.
// The stored decimals round months unevenly — 2025.6 to 2026.05 and 2026.05 to
// 2026.46 are both five calendar months but different decimal widths — so three
// equal gaps rendered at three widths on the concept board until its audit
// caught it. A month index (year * 12 + month) cannot drift that way.

import { TIMELINE, TENURES } from "./helloData";

// "YYYY-MM" -> whole-month index. The only date parser the lenses own.
export function ym(str) {
  const [y, m] = str.split("-").map((n) => parseInt(n, 10));
  return y * 12 + (m - 1);
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function ymLabel(idx) {
  return `${MONTHS[idx % 12]} ${Math.floor(idx / 12)}`;
}

// A ship's month, from the "DD/MM" + year TIMELINE already carries.
export function shipMonth(p) {
  const mm = parseInt((p.date || "").split("/")[1], 10);
  return p.year * 12 + (Number.isFinite(mm) ? mm - 1 : 0);
}

// The month running right now — computed when a lens MOUNTS (each model sits
// behind a useMemo with empty deps), the same reason the role cards compute
// tenure at render: a hardcoded "now" is guaranteed to go stale. The residual
// staleness window is a session that keeps one lens open across a month
// boundary; switching lenses remounts and re-reads. Accepted, documented.
export function nowMonth() {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
}

// THE BASE-AND-RIDERS RULE (2026-08-06 interview). Before it, a month had one
// occupant and ventures striped across it. That model died the moment the
// degree landed: college is a four-year base with three internships and a
// research year riding ON it, so "one occupant" would have had to throw away
// either the degree or the internships.
//
// So every month resolves into ONE base (what was principally being done) and
// any number of riders (what ran alongside). Priority decides the base:
// a salaried role outranks the degree, the degree outranks an internship taken
// during it, and research rides on whatever it was done inside. Jul and Aug
// 2022 are the case the priority exists for: college has ended, CaratLane has
// not started, and the Cyware internship is genuinely the whole of those
// months, so it is promoted to base rather than left riding on nothing.
const BASE_RANK = { employment: 0, study: 1, internship: 2, research: 3 };

// Split the claims covering one month into { base, riders }. Ties inside a kind
// go to the JOINER (latest start) — the January handover rule the lenses have
// always used, kept here so every lens resolves a month identically.
export function occupancy(covering) {
  if (!covering.length) return { base: null, riders: [] };
  const sorted = [...covering].sort(
    (a, b) =>
      (BASE_RANK[a.t.kind] ?? 9) - (BASE_RANK[b.t.kind] ?? 9) ||
      ym(b.t.start) - ym(a.t.start),
  );
  return { base: sorted[0], riders: sorted.slice(1) };
}

// Riders packed into as few lanes as possible, so two that never overlap share
// a lane instead of each reserving one. Greedy over spans sorted by start,
// which is optimal for interval-graph colouring on a line.
export function packLanes(spans) {
  const lanes = [];
  return [...spans]
    .sort((a, b) => a.s - b.s)
    .map((v) => {
      let lane = lanes.findIndex((end) => end < v.s);
      if (lane === -1) lane = lanes.length;
      lanes[lane] = v.e;
      return { ...v, lane };
    });
}

// Oldest ship first — the order every lens reads in.
export function shipsOldestFirst() {
  return [...TIMELINE].reverse();
}

// The lens domain: first attested month to the current month, inclusive.
export function lensDomain() {
  const ships = shipsOldestFirst();
  const starts = TENURES.map((t) => ym(t.start));
  const m0 = Math.min(...starts, ...ships.map(shipMonth));
  return { m0, m1: nowMonth() };
}

// Month index -> % across the axis, with the same kind of end insets the axis
// views use so the first and last marks are not cropped by the frame.
export function monthPct(m, domain, inset = 4) {
  const span = domain.m1 - domain.m0 || 1;
  return inset + ((m - domain.m0) / span) * (100 - inset * 2);
}

// A tenure's inclusive month range on this domain. `end: null` runs to now.
// The old composed-fade branch is gone: every span's end is now attested, so
// there is nothing left to draw as doubt (2026-08-06 interview).
function tenureRange(t, domain) {
  const s = ym(t.start);
  return t.end ? { s, e: ym(t.end) } : { s, e: domain.m1 };
}

// The two populations every lens splits on: what can hold the field, and what
// rides alongside it. A venture never holds the field — that is the whole
// reason the alongside lane exists.
const isRiderOnly = (t) => t.kind === "venture";

// ---- Registers -------------------------------------------------------------
// The field spans below the axis (the degree and the salaried roles), what ran
// alongside above it (internships, the research year, the two ventures), and
// the six ships on the axis itself.
export function registersModel() {
  const domain = lensDomain();
  // The ribbon holds what can hold the field, and only where it HELD it: an
  // internship taken during the degree rides above instead, so the ribbon reads
  // as one continuous career rather than a stack of overlapping claims.
  const fieldKinds = TENURES.filter((t) => !isRiderOnly(t) && t.kind !== "research");
  const spans = fieldKinds
    .filter((t) => t.kind !== "internship")
    .map((t) => {
      const r = tenureRange(t, domain);
      return { ...t, ...r, x0: monthPct(r.s, domain), x1: monthPct(r.e + 1, domain) };
    });
  // A handover month, where one span ends as the next begins, would be painted
  // twice. The GEOMETRY gives it to the joiner while the tooltip keeps the
  // record's own dates for both.
  //
  // NOTE (2026-08-07): the case this was written for is GONE. CaratLane was
  // recorded as ending 2024-01 with Deutsche Bank starting 2024-01, and that
  // shared January is where the rule came from. CaratLane actually ended
  // 2023-12, so the two are merely adjacent and no month is contested. The
  // guard stays because it is cheap and the next hire-to-hire overlap will
  // need it, but it currently fires on nothing.
  spans.sort((a, b) => a.s - b.s);
  spans.forEach((t, i) => {
    const next = spans[i + 1];
    if (next && next.s <= t.e) t.x1 = monthPct(next.s, domain);
  });
  // Everything that ran alongside, packed into lanes. Internships and the
  // research year join the ventures here: they are all "and also", which is
  // exactly what this lane has always meant.
  const alongside = packLanes(
    TENURES.filter((t) => isRiderOnly(t) || t.kind === "internship" || t.kind === "research").map(
      (t) => ({ ...t, ...tenureRange(t, domain) }),
    ),
  ).map((v) => ({ ...v, x0: monthPct(v.s, domain), x1: monthPct(v.e + 1, domain) }));
  const ships = shipsOldestFirst().map((p, i) => ({
    ...p,
    m: shipMonth(p),
    x: monthPct(shipMonth(p), domain),
    side: i % 2 === 0 ? "above" : "below",
  }));
  // The one stretch the ribbon cannot cover: after the degree, before the first
  // salaried month. Derived rather than written, so the caption cannot go stale.
  const seam = [];
  for (let m = domain.m0; m <= domain.m1; m++) {
    if (!spans.some((t) => m >= t.s && m <= t.e)) seam.push(m);
  }
  return {
    domain,
    spans,
    alongside,
    ships,
    lanes: Math.max(1, ...alongside.map((v) => v.lane + 1)),
    seam: seam.length ? { s: seam[0], e: seam[seam.length - 1], months: seam.length } : null,
  };
}

// ---- Ledger ----------------------------------------------------------------
// One cell per lived month, columns by year, rows Jan..Dec. A cell knows its
// occupant (employment or study — the salaried span owns the field), any
// venture stripes riding it, any ship landing on it, and whether it is the
// current month. Months no record covers stay "unaccounted" — drawn, empty.
export function ledgerModel() {
  const domain = lensDomain();
  const ships = shipsOldestFirst();
  const claims = TENURES.map((t) => ({ t, ...tenureRange(t, domain) }));
  const riderLanes = new Map(
    packLanes(claims.filter((c) => isRiderOnly(c.t) || c.t.kind !== "employment"))
      .map((v) => [v.t.id, v.lane]),
  );

  const y0 = Math.floor(domain.m0 / 12);
  const y1 = Math.floor(domain.m1 / 12);
  const years = [];
  let lived = 0;
  for (let y = y0; y <= y1; y++) {
    const cells = [];
    for (let mo = 0; mo < 12; mo++) {
      const m = y * 12 + mo;
      if (m < domain.m0 || m > domain.m1) {
        cells.push({ m, mo, state: "unlived" });
        continue;
      }
      lived += 1;
      const covering = claims.filter((c) => m >= c.s && m <= c.e);
      const { base, riders } = occupancy(covering.filter((c) => !isRiderOnly(c.t)));
      // a handover is two claims of the SAME kind meeting in one month, one
      // ending as the other begins — not a rider that merely overlaps
      const ends = riders.find((r) => r.t.kind === base?.t.kind && r.e === m) || null;
      const cell = {
        m,
        mo,
        state: base ? "field" : "unaccounted",
        tenure: base?.t || null,
        // run start: the first cell a tenure paints carries its name in ink
        runStart: base ? m === base.s : false,
        handover: ends ? { joins: base.t, ends: ends.t } : null,
        stripes: [...riders.filter((r) => r !== ends), ...covering.filter((c) => isRiderOnly(c.t))]
          .map((v) => ({ t: v.t, lane: riderLanes.get(v.t.id) ?? 0 })),
        ship: ships.find((p) => shipMonth(p) === m) || null,
        now: m === domain.m1,
      };
      cells.push(cell);
    }
    years.push({ year: y, cells });
  }
  // Derived for the caption, so reader copy can never disagree with the cells:
  // which months carry two claims, how many stayed unaccounted, and how many
  // carried something alongside the field.
  const flat = years.flatMap((c) => c.cells).filter((c) => c.state !== "unlived");
  const handovers = flat.filter((c) => c.handover).map((c) => ymLabel(c.m));
  let unaccountedRuns = 0;
  flat.forEach((c, i) => {
    if (c.state === "unaccounted" && (i === 0 || flat[i - 1].state !== "unaccounted")) unaccountedRuns += 1;
  });
  const doubled = flat.filter((c) => c.stripes.length).length;
  return { domain, years, lived, handovers, unaccountedRuns, doubled };
}

// ---- Load ------------------------------------------------------------------
// One entry per lived month: the salaried or study field at the base, venture
// riders stacked above it. A handover month counts ONE commitment — the joiner
// takes it, the same geometry rule Registers and the Ledger share — because a
// job ending and a job starting in one month is a handover, not moonlighting.
// Both claims still ride the tooltip, exactly as the Ledger keeps them.
export function loadModel() {
  const domain = lensDomain();
  const claims = TENURES.map((t) => ({ t, ...tenureRange(t, domain) }));
  const months = [];
  for (let m = domain.m0; m <= domain.m1; m++) {
    const covering = claims.filter((c) => m >= c.s && m <= c.e);
    const { base, riders } = occupancy(covering.filter((c) => !isRiderOnly(c.t)));
    const ends = riders.find((r) => r.t.kind === base?.t.kind && r.e === m) || null;
    const alongside = [
      ...riders.filter((r) => r !== ends),
      ...covering.filter((c) => isRiderOnly(c.t)),
    ].map((r) => r.t);
    months.push({
      m,
      mo: m % 12,
      field: base ? { t: base.t } : null,
      handover: ends ? { joins: base.t, ends: ends.t } : null,
      riders: alongside,
      count: (base ? 1 : 0) + alongside.length,
      now: m === domain.m1,
    });
  }
  const max = Math.max(...months.map((c) => c.count));
  // the caption's claim: where the trailing run at the peak began, if the
  // present month IS the peak — otherwise the first month that reached it
  const current = months[months.length - 1].count;
  let peakFrom = null;
  if (current === max) {
    for (let i = months.length - 1; i >= 0 && months[i].count === max; i--) peakFrom = months[i].m;
  } else {
    peakFrom = months.find((c) => c.count === max)?.m ?? null;
  }
  return { domain, months, max, current, peakFrom };
}

// ---- Share -----------------------------------------------------------------
// The lived months pooled by who claimed them, largest pool first. Field months
// follow the Ledger's handover rule (the joiner takes the month), so the pools
// sum to exactly the lived count. Ventures pool in their own band, on the same
// scale, because they ran alongside the field months, never instead of them.
// Unaccounted months pool too — as a hole, with each stretch's dates kept.
export function shareModel() {
  const domain = lensDomain();
  const lived = domain.m1 - domain.m0 + 1;
  const claims = TENURES.map((t) => ({ t, ...tenureRange(t, domain) }));
  const byId = new Map();
  const unaccounted = { months: 0, runs: [] };
  let run = null;
  for (let m = domain.m0; m <= domain.m1; m++) {
    const covering = claims.filter((c) => m >= c.s && m <= c.e && !isRiderOnly(c.t));
    const { base } = occupancy(covering);
    if (!base) {
      unaccounted.months += 1;
      if (run && run.e === m - 1) run.e = m;
      else unaccounted.runs.push((run = { s: m, e: m }));
      continue;
    }
    const entry = byId.get(base.t.id) || { t: base.t, months: 0 };
    entry.months += 1;
    byId.set(base.t.id, entry);
  }
  const segs = [
    ...byId.values(),
    // the hole only takes a segment when it exists: with the record complete
    // (2026-08-06) it is empty, and an empty pool must not draw a sliver
    ...(unaccounted.months
      ? [{ unaccounted: true, months: unaccounted.months, runs: unaccounted.runs }]
      : []),
  ].sort((a, b) =>
    // at equal size the hole yields to the named pool — a record beats a gap
    b.months - a.months || (a.unaccounted ? 1 : 0) - (b.unaccounted ? 1 : 0),
  );
  // The alongside band: everything that rode on the field rather than holding
  // it. An internship that WAS the field for some months still shows its whole
  // span here, because the span is what ran alongside the degree.
  const alongside = TENURES.filter((t) => isRiderOnly(t) || t.kind === "internship" || t.kind === "research")
    .map((t) => {
      const r = tenureRange(t, domain);
      return { t, s: r.s, months: r.e - r.s + 1 };
    })
    .sort((a, b) => b.months - a.months);
  return { domain, lived, segs, alongside };
}

// ---- Cadence ---------------------------------------------------------------
// The months between consecutive ships, and which intervals form the current
// run (the trailing streak of equal, minimal gaps — today 5 · 5 · 5).
export function cadenceModel() {
  const domain = lensDomain();
  const ships = shipsOldestFirst().map((p) => ({ ...p, m: shipMonth(p) }));
  const intervals = ships.slice(1).map((p, i) => ({
    from: ships[i],
    to: p,
    months: p.m - ships[i].m,
  }));
  const last = intervals[intervals.length - 1]?.months;
  let runFrom = intervals.length;
  while (runFrom > 0 && intervals[runFrom - 1].months === last) runFrom -= 1;
  intervals.forEach((iv, i) => { iv.current = i >= runFrom; });
  const max = Math.max(...intervals.map((iv) => iv.months));
  const strip = ships.map((p, i) => ({ ...p, x: monthPct(p.m, domain), side: i % 2 === 0 ? "below" : "above" }));
  return {
    domain,
    intervals,
    max,
    hero: { first: intervals[0]?.months, last },
    strip,
  };
}
