// Impact: the graphs (annotation mtmkh1h3).
//
// Two sources sit in this grid and they are kept apart on purpose.
//
// 1. The VERIFIED REPORT (23 Sep 2026): a month-by-month warehouse pull where
//    every figure arrived with its raw query result or adds up exactly to a
//    verified monthly total. It is the source for everything from "Volume and
//    adoption" onward. Data in sdReport.js; ranges the report gave as ranges
//    are drawn as bands, never flattened to a midpoint.
// 2. The EARLIER NOTEBOOK EXPORT (weekly orders, orders by slot hour, cities
//    live), fetched from /data/sd/*.json. It is finer-grained than the report
//    and does not contradict it: its delivered share, 65 to 71%, is the same
//    quantity as the report's 100% minus a roughly 27% cancellation rate.
//
// Built to the dataviz method: form picked from the data's job, colour assigned
// by job and validated with the six checks in both themes, thin marks with a
// 2px surface gap, a hover readout on every plot, a legend on every
// multi-series plot, direct labels rather than a number on every point, and a
// table view behind each chart. Nothing here uses two y-scales.
//
// INTERNAL NUMBERS: these are Zepto operational counts. The entry's
// no-internal-numbers rule is unresolved for this section; see CONTEXT.md.
import { useEffect, useMemo, useState } from "react";
import {
  CAT, SEQ5, SEQ7, OK3,
  fmtK, fmtInt, fmtPct1, fmtPct0, fmtInr,
  StackedColumns, MultiLine, RangeColumns, CompareRows, SlopeChart, HBars,
  SmallMultiples, Card, SectionHead, Kpis, Legend,
} from "./SdChartKit";
import {
  MONTHLY, ROLLOUT, SLOT_BANDS, SLOT_MIX, LEAD_BUCKETS, LEAD_TIME,
  ONTIME, ONTIME_BAND_KEYS, ONTIME_BANDS, ARRIVAL_RATING, CITY_MONTHS, CITY_ONTIME,
  VS_INSTANT, CANCEL_TOTAL_AUG, CANCEL_REASONS, REPEAT_JUNE,
  CAPACITY_AUG, WATCHED_HOURS, SELLOUT_MONTHLY, SIX_AM_RELEASE, SELLOUT_TIMING,
  WORST_STORES, NETWORK_LATE_AUG, EXPERIMENT,
  CANCELLED_MONTHLY, CANCELLED_TOTAL, CANCELLED_AUG_CRORE, CANCELLED_ANNUALISED_CRORE,
  PER_STORE, EARLY_SHIFT_SHARE, RATING_CHECKS, CANCEL_REBASED, CANCEL_BOT_OF_REASONED,
  BASKET_SHAPE, MEDIAN_GAP_INR, OVER_WEIGHT, CAPACITY_SHAPE, WORST_STORE_SHARE, EXPERIMENT_SIG,
  GMV_AOV, GMV_TOTAL_CR, BASKET_DECOMP, ELECTRONICS, APPLIANCE_AUG, APPLIANCE_VS_OTHER,
  APPLIANCE_MONTHLY, APPLIANCE_JULY_WEEK, APPLIANCE_CANCEL_VALUE, AOV_SCOPES,
} from "./sdReport";
import SdMaster from "./SdMaster";

const fmtWeek = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtWeekLong = (iso) => "Week of " + new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmtHour = (h) => `${String(h).padStart(2, "0")}:00 to ${String(h + 1).padStart(2, "0")}:00`;
const hourName = (h) => (h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`);

const fmtMeasure = (v, r) => {
  switch (r.fmt) {
    case "inr": return fmtInr(v);
    case "pct": return v.toFixed(1) + "%";
    case "pct2": return v.toFixed(2) + "%";
    case "num0": return fmtInt(v);
    case "num2": return v.toFixed(2);
    case "num1": return v.toFixed(1);
    case "num3": return v.toFixed(3);
    default: return String(v);
  }
};

// ---------------------------------------------------------------------------

export default function SdImpactCharts() {
  const [weekly, setWeekly] = useState(null);
  const [slot, setSlot] = useState(null);
  useEffect(() => {
    Promise.all(["weekly", "slot_hour"].map((n) => fetch(`/data/sd/${n}.json`).then((r) => r.json())))
      .then(([w, s]) => { setWeekly(w.slice(0, -1)); setSlot(s); }) // last week is partial
      .catch(() => {});
  }, []);

  // ---- derived from the report --------------------------------------------
  const live = useMemo(() => MONTHLY.filter((m) => m.sd > 1000), []);
  const cancelRows = useMemo(
    () => live.map((m) => ({ label: m.label, sd: m.sdCancelPct, all: m.allCancelPct })),
    [live]
  );
  const ontimeTrend = useMemo(
    () => ONTIME.map((r) => ({ label: r.label, within: r.within, notLate: +(r.within + r.early).toFixed(1), late: r.late })),
    []
  );
  // Eight cities, one hue. Cycling a four-hue categorical theme over eight
  // series would make colour lie about identity, and here colour has no job to
  // do: the finding IS that every city moved the same way. Identity comes from
  // the direct label at each end, and hover isolates a single line.
  const cityRows = useMemo(
    () => CITY_ONTIME.map((c) => ({ key: c.city, values: c.v.map((t) => t[0]), color: CAT[0] })),
    []
  );
  const sellout = useMemo(
    () => SELLOUT_MONTHLY.map((r) => ({ label: r.label, ...Object.fromEntries(WATCHED_HOURS.map((h) => [h.key, r[h.key]?.so ?? null])) })),
    []
  );
  const capacity = useMemo(
    () => SELLOUT_MONTHLY.map((r) => ({ label: r.label, ...Object.fromEntries(WATCHED_HOURS.map((h) => [h.key, r[h.key]?.cap ?? null])) })),
    []
  );
  const slotBars = useMemo(() => (slot || []).map((s) => ({ x: s.slot_hour, y: s.total_orders })), [slot]);
  const peakSlot = slot ? slot.reduce((a, b) => (b.total_orders > a.total_orders ? b : a)) : null;
  const lowSlot = slot ? slot.reduce((a, b) => (b.delivery_pct < a.delivery_pct ? b : a)) : null;

  const bandLegend = SLOT_BANDS.map((b, i) => ({ label: b.label, color: SEQ5[i] }));
  const leadLegend = LEAD_BUCKETS.map((b, i) => ({ label: b.label, color: SEQ7[i] }));
  const okLegend = [
    { label: "Within the booked hour", color: OK3[0] },
    { label: "Early, before it opens", color: OK3[1] },
    { label: "Late, after it closes", color: OK3[2] },
  ];
  const okSeries = [{ key: "within", label: "Within slot" }, { key: "early", label: "Early" }, { key: "late", label: "Late" }];

  return (
    <div className="sdc">
      {/* ================= 0. The master timeline ========================= */}
      <SectionHead
        n="00"
        title="The whole year in one picture"
        blurb="Ten measures on a shared monthly timeline, October 2025 to September 2026. Three vertical lines run through every row, so a cause in one band and its consequence three bands down line up on the same month. The dots are the reading order: follow them and you get the argument."
      />

      <Card
        wide
        tall
        title="Scheduled Delivery, October 2025 to September 2026"
        kicker="every series, one timeline, fourteen annotated moments"
        shows="Each row keeps its own scale, because ten measures on ten scales cannot share a y axis and a second axis would lie about the relationship between them. What they do share is the x axis and the three event lines: full rollout in December, the capacity release in May, the electronics inflection in July."
        reads="the shape of the year. Demand climbs to May and settles. Money keeps climbing after demand stops. The promise holds on lateness and appears to fail on the within-slot rate. And supply, the thing that was holding everything back in April, stops being a constraint by summer without anything replacing it."
        footnote="Hover any month to read all ten rows at once; the right-hand gutter becomes the readout. The rows draw from the verified monthly pull, so a row starts where its series starts (GMV and on-time from December, capacity from April, the electronics checkpoints at six months only, drawn with a break rather than interpolated)."
      >
        <SdMaster />
      </Card>

      {/* ================= 1. Volume and adoption ========================= */}
      <SectionHead
        n="01"
        title="Volume and adoption"
        blurb="Twelve months of scheduled orders, from the first pilot record on 10 October 2025 to 21 September 2026. May is the month the whole story turns on."
      />

      <Card
        wide
        title="Scheduled orders per month"
        kicker="10 Oct 2025 to 21 Sep 2026"
        shows="Every order booked into a one-hour slot, by month. The pilot ran on 132 stores in October; full rollout landed on 12 December; then May 2026 added half a million orders in a single step."
        reads="a feature that grew steadily to about 1.2M a month, jumped to 1.81M in May, and has eased back since. The last bar covers 21 days, not a full month."
        table={{ head: ["Month", "Scheduled", "All shipments", "Share", "Stores"], rows: MONTHLY.map((m) => [m.label + (m.note ? " (" + m.note + ")" : ""), fmtInt(m.sd), m.allShipments + "M", m.sdPct.toFixed(2) + "%", fmtInt(m.stores)]) }}
        footnote="September covers 1 to 21 only."
      >
        <RangeColumns
          rows={MONTHLY.map((m) => ({ label: m.label, span: m.label + (m.note ? ", " + m.note : ""), v: m.sd }))}
          valueKey="v"
          yFmt={fmtK}
          emphasis={(r) => r.label === "May 26"}
        />
      </Card>

      <Card
        title="Scheduled share of all orders"
        kicker="scheduled orders as a percentage of every shipment"
        shows="The same volume read against the whole business. This is the adoption number, and it peaks in May at 1.72% before settling near 1.4%."
        reads="scheduling is a small, real slice of a very large business. The May peak is the ceiling so far, and the drift down since is not demand dying: it is the share falling while capacity kept rising."
        table={{ head: ["Month", "Share of all orders"], rows: MONTHLY.map((m) => [m.label, m.sdPct.toFixed(2) + "%"]) }}
      >
        <MultiLine
          rows={MONTHLY.map((m) => ({ label: m.label, pct: m.sdPct }))}
          series={[{ key: "pct", label: "Scheduled share", short: "share" }]}
          colors={[CAT[0]]}
          yFmt={(v) => v.toFixed(1) + "%"}
        />
      </Card>

      <Card
        title="Cancellation rate, scheduled against all orders"
        kicker="shipments cancelled, all reasons"
        shows="Scheduled orders are cancelled about two and a half times as often as the average order, and the gap has held all year even as the network's own rate improved."
        reads="the cost of the promise. Every point on the upper line is an order someone booked a slot for and did not get."
        legend={[{ label: "Scheduled orders", color: CAT[0] }, { label: "All orders", color: CAT[1] }]}
        table={{ head: ["Month", "Scheduled cancelled", "All cancelled"], rows: live.map((m) => [m.label, m.sdCancelPct.toFixed(1) + "%", m.allCancelPct.toFixed(1) + "%"]) }}
      >
        <MultiLine
          rows={cancelRows}
          series={[{ key: "sd", label: "Scheduled", short: "sched" }, { key: "all", label: "All orders", short: "all" }]}
          colors={[CAT[0], CAT[1]]}
          yFmt={fmtPct0}
        />
      </Card>

      <Card
        wide
        title="The rollout, October to December 2025"
        kicker="scheduled orders per day at each rollout checkpoint"
        shows="Sixteen orders across two stores on 10 October. Twenty-eight thousand a day across 1,144 stores by 12 December, when the feature went to the whole network. The December peak, on the 23rd, was 38,825."
        reads="ten weeks from a two-store pilot to a national feature, with the store count doing most of the work: order volume tracks it almost exactly."
        table={{ head: ["Date", "Orders that day", "Stores", ""], rows: ROLLOUT.map((r) => [r.label, fmtInt(r.orders), fmtInt(r.stores), r.mark || ""]) }}
      >
        <SmallMultiples
          panels={[
            {
              title: "Orders per day",
              children: (
                <MultiLine
                  rows={ROLLOUT.map((r) => ({ label: r.label, v: r.orders }))}
                  series={[{ key: "v", label: "Orders", short: "orders" }]}
                  colors={[CAT[0]]}
                  yFmt={fmtK}
                  height={190}
                />
              ),
            },
            {
              title: "Stores live",
              children: (
                <MultiLine
                  rows={ROLLOUT.map((r) => ({ label: r.label, v: r.stores }))}
                  series={[{ key: "v", label: "Stores", short: "stores" }]}
                  colors={[CAT[2]]}
                  yFmt={(v) => String(Math.round(v))}
                  height={190}
                />
              ),
            },
          ]}
        />
      </Card>

      {weekly && (
        <Card
          wide
          title="Scheduled orders per week, since launch"
          kicker="the earlier notebook export, weekly rather than monthly"
          shows="The same growth at week resolution: the pilot weeks, the rollout that multiplied volume within a month, and the weekly rhythm underneath the monthly totals."
          reads="a launch that stayed a pilot for weeks, then a rollout that multiplied volume within a month, settling into a band with a visible weekly sawtooth."
          table={{ head: ["Week", "Orders", "Delivered", "Cities"], rows: weekly.map((w) => [fmtWeekLong(w.week_start), fmtInt(w.total_orders), fmtInt(w.delivered_orders), w.cities_live]) }}
          footnote="From the earlier notebook export, not the verified monthly report; the two agree on shape."
        >
          <MultiLine
            rows={weekly.map((w) => ({ label: fmtWeek(w.week_start), v: w.total_orders }))}
            series={[{ key: "v", label: "Orders", short: "orders" }]}
            colors={[CAT[0]]}
            yFmt={fmtK}
          />
        </Card>
      )}

      {weekly && (
        <Card
          title="Cities live per week"
          kicker="distinct cities with at least one scheduled order"
          shows="The footprint of the feature: how many cities were taking scheduled orders each week, from the single pilot city to the full network."
          reads="the rollout curve, and the steps where new cities switched on."
          table={{ head: ["Week", "Cities"], rows: weekly.map((w) => [fmtWeekLong(w.week_start), w.cities_live]) }}
        >
          <MultiLine
            rows={weekly.map((w) => ({ label: fmtWeek(w.week_start), v: w.cities_live }))}
            series={[{ key: "v", label: "Cities", short: "cities" }]}
            colors={[CAT[2]]}
            yFmt={(v) => String(Math.round(v))}
          />
        </Card>
      )}

      <Card
        title="Stores offering a slot"
        kicker="distinct stores with at least one scheduled order that month"
        shows="Store coverage, month by month. It is flat from December onward, which is what makes May interesting: the same stores, far more orders."
        reads="supply did not arrive as new stores. Whatever changed in May happened inside the stores that were already live."
        table={{ head: ["Month", "Stores"], rows: MONTHLY.map((m) => [m.label, fmtInt(m.stores)]) }}
      >
        <MultiLine
          rows={MONTHLY.map((m) => ({ label: m.label, v: m.stores }))}
          series={[{ key: "v", label: "Stores", short: "stores" }]}
          colors={[CAT[2]]}
          yFmt={(v) => String(Math.round(v))}
        />
      </Card>

      <Card
        wide
        title="Per store, demand is down a third from the peak"
        kicker="scheduled orders per store per day"
        shows="Absolute volume is down 16% from the May peak, which sounds like a plateau. Divide by the store count, which rose 14% over the same stretch, and the per-store figure falls from 46.2 orders a day in May to 31.0 in September."
        reads="the softer read on the headline. Supply stopped being the constraint, sell-outs at 6 AM went from 35.2% in April to 7.8% in September, and nothing replaced it as the limiter. The one measurement that would say whether demand is being lost at the slot picker is the one nobody instrumented."
        table={{ head: ["Month", "Orders per store per day"], rows: PER_STORE.map((r) => [r.label, r.v.toFixed(1)]) }}
        footnote="DERIVED: monthly volume divided by stores with scheduled delivery, divided by days in month. September covers 21 days."
      >
        <MultiLine
          rows={PER_STORE}
          series={[{ key: "v", label: "Orders per store per day", short: "per store" }]}
          colors={[CAT[0]]}
          yFmt={(v) => v.toFixed(0)}
        />
      </Card>

      {/* ================= 2. When people book ============================ */}
      <SectionHead
        n="02"
        title="When people book, and how far ahead"
        blurb="Which hour people choose, and how much warning they give us. Both answers moved in May, and neither moved the way a demand story would predict."
      />

      <Card
        wide
        tall
        title="Which slot people choose"
        kicker="share of scheduled orders by time-of-day band, per month"
        shows="The five bands a day is cut into. In November the evening carried it. By summer the early morning does: the 6 to 10 AM band went from 22.7% in April to 34.3% in August, and 6 AM became the single busiest hour of the day."
        reads="the feature quietly changed shape. It started as an evening convenience and became a morning routine. The afternoon, 2 to 6 PM, collapsed from 25.9% to about 15% over the same stretch."
        legend={bandLegend}
        table={{ head: ["Month", ...SLOT_BANDS.map((b) => b.label), "Busiest hour"], rows: SLOT_MIX.map((r) => [r.label, ...SLOT_BANDS.map((b) => r[b.key].toFixed(1) + "%"), hourName(r.busiest)]) }}
        footnote="There are no slots between 2 AM and 6 AM. In Nov 2025 the 6 and 7 AM slots barely existed, at 137 and 119 orders: the early-morning window was built later."
      >
        <StackedColumns rows={SLOT_MIX} series={SLOT_BANDS} colors={SEQ5} labelSeries="am" height={250} />
      </Card>

      <Card
        title="The busiest hour, month by month"
        kicker="the single slot hour with the most orders"
        shows="One number a month: whichever hour took the most bookings. It moves from 9 PM at launch, to 8 AM through the winter, to 3 PM in the spring, and then to 6 AM from May onward, where it has stayed."
        reads="four different products in a year. The 6 AM lock-in from May is the clearest single signal in the dataset."
      >
        <div className="sdc__strip">
          {SLOT_MIX.map((r) => (
            <div className={"sdc__strip-cell" + (r.busiest === 6 ? " is-em" : "")} key={r.m}>
              <span className="sdc__strip-v">{hourName(r.busiest)}</span>
              <span className="sdc__strip-k">{r.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {slot && (
        <Card
          wide
          title="Orders by one-hour slot, since launch"
          kicker="the earlier notebook export, aggregated across the whole period"
          shows="Which hours people book, summed over the whole period rather than split by month. Morning slots lead, evening slots come back up, and the late-night slot is the one to watch."
          reads={`the busiest slot across the whole window is ${peakSlot ? fmtHour(peakSlot.slot_hour) : ""}; the ${lowSlot ? fmtHour(lowSlot.slot_hour) : ""} slot has the lowest delivered share, the midnight window the case study spends a whole section on.`}
          table={{ head: ["Slot", "Orders", "Delivered %"], rows: slot.map((s) => [fmtHour(s.slot_hour), fmtInt(s.total_orders), fmtPct1(s.delivery_pct)]) }}
        >
          <RangeColumns
            rows={slotBars.map((b) => ({ label: String(b.x).padStart(2, "0"), span: fmtHour(b.x), v: b.y, hour: b.x }))}
            valueKey="v"
            yFmt={fmtK}
            emphasis={(r) => r.hour === lowSlot?.slot_hour}
          />
        </Card>
      )}

      <Card
        wide
        tall
        title="How far ahead people book"
        kicker="slot start minus order time, share of orders per bucket"
        shows="Lead time, bucketed. Two populations sit inside every month: roughly 42 to 48% who book less than two hours ahead, and a second group at 8 to 24 hours, which is the night before for a morning slot."
        reads="this is not a planning product for most people who use it. Nearly half of all bookings are for the next couple of hours. The 8 to 24 hour band is the genuine planned shop, and it is about a quarter to a third."
        legend={leadLegend}
        table={{ head: ["Month", ...LEAD_BUCKETS.map((b) => b.label), "Median"], rows: LEAD_TIME.map((r) => [r.label, ...LEAD_BUCKETS.map((b) => r[b.key].toFixed(1) + "%"), r.median.toFixed(1) + "h"]) }}
        footnote="From January onward the buckets add up to the verified monthly totals. November and December are plain-text answers whose totals only roughly match."
      >
        <StackedColumns rows={LEAD_TIME} series={LEAD_BUCKETS} colors={SEQ7} height={250} />
      </Card>

      <Card
        title="Median booking lead time"
        kicker="hours between placing the order and the slot opening"
        shows="The middle of that distribution, month by month. During the November pilot it was 54 minutes. Since December it has sat between 2.3 and 3.5 hours and barely moved."
        reads="the behaviour settled early and stayed settled. Whatever changed in May, it was not how far ahead people plan."
        table={{ head: ["Month", "Median lead time"], rows: LEAD_TIME.map((r) => [r.label, r.median.toFixed(1) + " h"]) }}
      >
        <MultiLine
          rows={LEAD_TIME.map((r) => ({ label: r.label, v: r.median }))}
          series={[{ key: "v", label: "Median lead time", short: "median" }]}
          colors={[CAT[0]]}
          yFmt={(v) => v.toFixed(1) + "h"}
        />
      </Card>

      {/* ================= 3. Keeping the promise ======================== */}
      <SectionHead
        n="03"
        title="Keeping the promise"
        blurb="A slot is a promise about a specific hour. This section is about how often we kept it, about the moment the headline metric stopped describing what customers felt, and about the two places the report's own reading of that does not survive a re-crunch."
      />

      <Card
        wide
        tall
        title="Did it arrive in the booked hour?"
        kicker="delivered scheduled orders split by arrival against the slot"
        shows="Every delivered scheduled order, sorted into three outcomes: inside the booked hour, before it opened, or after it closed. The within-slot share falls from 92.6% in February to 76.8% in September."
        reads="the fall is almost entirely early arrivals, not lateness. Early goes from 2.6% to 17.0% while late peaks in May and recovers. Read the red band alone and the feature is improving; read the green band alone and it is collapsing. The next card shows why the usual explanation for the early band is wrong."
        legend={okLegend}
        table={{ head: ["Month", "Delivered", "Within slot", "Early", "Late"], rows: ONTIME.map((r) => [r.label, fmtInt(r.delivered), fmtPct1(r.within), fmtPct1(r.early), fmtPct1(r.late)]) }}
        footnote="Delivered counts match the verified monthly totals within 0.5%, except September at minus 2%."
      >
        <StackedColumns rows={ONTIME} series={okSeries} colors={OK3} height={250} />
      </Card>

      <Card
        wide
        title="Within slot against not late"
        kicker="the metric argument, in one chart"
        shows="The same data read two ways. The falling line is the within-slot rate, the headline metric. The flat line is within plus early, which is every order that was not late."
        reads="the promise has held at 93 to 96% all year. The headline metric fell 16 points because it counts an early arrival as a failure, and the ratings data says early arrivals rate no worse than on-time ones."
        legend={[{ label: "Within the booked hour", color: OK3[0] }, { label: "Not late (within or early)", color: CAT[0] }]}
        table={{ head: ["Month", "Within slot", "Not late"], rows: ontimeTrend.map((r) => [r.label, fmtPct1(r.within), fmtPct1(r.notLate)]) }}
      >
        <MultiLine
          rows={ontimeTrend}
          series={[{ key: "within", label: "Within slot", short: "within" }, { key: "notLate", label: "Not late", short: "not late" }]}
          colors={[OK3[0], CAT[0]]}
          yFmt={fmtPct0}
          domainMin={70}
          domainMax={100}
        />
      </Card>

      <Card
        wide
        title="Arriving early is no worse. Arriving late is."
        kicker="scheduled orders delivered 1 to 7 Aug 2026, by arrival against the slot"
        shows="The rating each arrival type earns. Early arrivals score 4.14 and on-time ones 4.07, but that gap is t = 1.59, p about 0.11: not significant. The claim this slice actually supports is that early is no WORSE than on time. Late is a different matter: 3.81, t = -6.38, and 6.5 percentage points more one and two star ratings."
        reads="the case for changing the metric survives, but on the weaker claim. If early arrivals are no worse than on-time ones, then counting them as failures makes the within-slot rate punish us for something customers do not mind. 'Not late' is still the honest headline. 'Early is better' is not a sentence this data can carry."
        table={{ head: ["Arrival", "Orders", "Rated", "Response rate", "Avg rating", "1 to 2 star"], rows: ARRIVAL_RATING.map((r, i) => [r.label, fmtInt(r.orders), fmtInt(r.rated), fmtPct1(RATING_CHECKS.responseRate[i].v), r.rating.toFixed(2), fmtPct1(r.lowStar)]) }}
        footnote={`Two caveats on this slice, and both cut against it. Response rate rises with how badly the order went: ${RATING_CHECKS.responseRate[0].v}% of early orders were rated against ${RATING_CHECKS.responseRate[2].v}% of late ones, so every comparison here rests on a sample that self-selects on the thing being measured. And the slice does not reconcile with the August monthly table: it reports ${RATING_CHECKS.slice.late}% late where the month says ${RATING_CHECKS.month.late}%. One of the two is wrong, and this is the slice the metric argument rests on.`}
      >
        <SmallMultiples
          panels={[
            {
              title: "Average rating",
              children: (
                <HBars
                  rows={ARRIVAL_RATING.map((r, i) => ({ k: r.label, sub: r.sub, v: r.rating, color: OK3[[1, 0, 2][i]] }))}
                  fmt={(v) => v.toFixed(2)}
                  max={5}
                />
              ),
            },
            {
              title: "One and two star share",
              children: (
                <HBars
                  rows={ARRIVAL_RATING.map((r, i) => ({ k: r.label, sub: r.sub, v: r.lowStar, color: OK3[[1, 0, 2][i]] }))}
                  fmt={fmtPct1}
                  max={30}
                />
              ),
            },
          ]}
        />
      </Card>

      <Card
        wide
        tall
        title="The same question, by time of day"
        kicker="within / early / late for morning, daytime and evening slots"
        shows="Three panels, one per slot band. Morning slots are almost never late. Evening slots are late 6 to 13% of the time and peaked in May. Daytime slots are now the weakest at 74% within slot, with 19% arriving early."
        reads="two different failures wearing one number. Lateness is an evening problem, caused by the dinner peak. Earliness is a morning problem that spread into the day, and it started in March, well before the May capacity release."
        legend={[{ label: "Early, before the slot opens", color: OK3[1] }, { label: "Late, after it closes", color: OK3[2] }]}
        table={{
          head: ["Month", ...ONTIME_BAND_KEYS.map((b) => b.label)],
          rows: ONTIME_BANDS.map((r) => [r.label, ...ONTIME_BAND_KEYS.map((b) => r[b.key].map((v) => v.toFixed(1)).join(" / "))]),
        }}
        footnote="Each panel plots the two ways a slot can miss; within-slot is the remainder, so nothing is hidden. Table cells read within / early / late."
      >
        <SmallMultiples
          min={200}
          panels={ONTIME_BAND_KEYS.map((b) => ({
            title: b.label,
            children: (
              <MultiLine
                rows={ONTIME_BANDS.map((r) => ({ label: r.label, early: r[b.key][1], late: r[b.key][2] }))}
                series={[{ key: "early", label: "Early", short: "early" }, { key: "late", label: "Late", short: "late" }]}
                colors={[OK3[1], OK3[2]]}
                yFmt={fmtPct0}
                domainMin={0}
                domainMax={21}
                height={200}
              />
            ),
          }))}
        />
      </Card>

      <Card
        wide
        title="Early arrivals are not the 6 AM story"
        kicker="shift-share decomposition of the rise in early arrivals, Feb to Sep 2026"
        shows="The report's explanation for early arrivals is that they follow the move to 6 AM slots, with riders dispatching a morning slot before it opens. Decomposing the 14.4 point rise against the recovered slot-band mix says otherwise: 0.3 of those points come from the shift toward morning slots. 13.2 come from the rate rising inside every band at once."
        reads="a system-wide cause, not a slot-mix one. By September the daytime band is the earliest of the three, at 19.3% against the morning's 17.8%, which the mix story cannot produce. The candidate that does fit is batching: 75% of scheduled orders ride along with an instant one, and a batched order inherits the instant order's dispatch clock, which is almost always before the window. That predicts a rate rise in every band, growing with the batching rate, which is what the data shows."
        legend={[{ label: "Within-band rates", color: OK3[2] }, { label: "Interaction", color: "var(--sdc-neutral)" }, { label: "Slot-mix shift", color: CAT[0] }]}
        table={{
          head: ["Component", "Points of the 14.4"],
          rows: [...EARLY_SHIFT_SHARE.parts.map((x) => [x.label, "+" + x.v.toFixed(1) + "pp"]), ["Aug to Sep alone", `+${EARLY_SHIFT_SHARE.augToSep.total}pp total, +${EARLY_SHIFT_SHARE.augToSep.mix}pp mix, +${EARLY_SHIFT_SHARE.augToSep.rates}pp rates`]],
        }}
        footnote="DERIVED, not pulled. The band weights were recovered by solving the three-by-three system in the on-time-by-band table: each month's totals are a weighted average of the three band rates, and the weights sum to one. December is degenerate, the band rates sit too close together to solve, and was dropped. Recovered morning / day / evening mix: Feb 25/29/46, May 19/52/29, Aug 28/42/30, Sep 27/46/27."
      >
        <HBars
          rows={EARLY_SHIFT_SHARE.parts.map((x, i) => ({ k: x.label, sub: x.note, v: x.v, color: [OK3[2], "var(--sdc-neutral)", CAT[0]][i] }))}
          fmt={(v) => "+" + v.toFixed(1) + "pp"}
          max={EARLY_SHIFT_SHARE.total}
          sub={`Total rise in early arrivals, Feb to Sep: +${EARLY_SHIFT_SHARE.total} percentage points.`}
        />
      </Card>

      <Card
        wide
        tall
        title="Every big city went the same way"
        kicker="within-slot share, eight cities, four checkpoint months"
        shows="Each line is a city's within-slot rate at four points in the year. All eight start in the low nineties in February, dip in May and land in the mid-seventies by September."
        reads="this is a system-wide change, not one city's operation coming apart. Every line has the same shape, which is why they are all one colour: hover isolates a city. Mumbai carries the most volume and sits mid-pack; Pune has the most early arrivals by September, at 22%."
        table={{
          head: ["City", ...CITY_MONTHS],
          rows: CITY_ONTIME.map((c) => [c.city, ...c.v.map((t) => t.join(" / "))]),
        }}
        footnote="Table cells read within / early / late. Hover a line to isolate it."
      >
        <SlopeChart rows={cityRows} months={CITY_MONTHS} height={320} />
      </Card>

      <Card
        title="Where lateness actually lives"
        kicker="late share by city, May 2026 against September 2026"
        shows="The May spike by city, next to where each city is now. Delhi and Gurugram were worst hit in May at 14% late, twice Mumbai's rate, and they are still the latest cities today."
        reads="lateness is geographic and it is sticky. The same two cities top both columns five months apart."
        legend={[{ label: "May 2026", color: CAT[1] }, { label: "September 2026", color: CAT[0] }]}
        table={{ head: ["City", "Late, May", "Late, Sep"], rows: CITY_ONTIME.map((c) => [c.city, c.v[1][2] + "%", c.v[3][2] + "%"]) }}
      >
        <SmallMultiples
          panels={[
            {
              title: "May 2026",
              children: <HBars rows={[...CITY_ONTIME].sort((a, b) => b.v[1][2] - a.v[1][2]).map((c) => ({ k: c.city, v: c.v[1][2] }))} fmt={fmtPct0} max={15} color={CAT[1]} />,
            },
            {
              title: "September 2026",
              children: <HBars rows={[...CITY_ONTIME].sort((a, b) => b.v[3][2] - a.v[3][2]).map((c) => ({ k: c.city, v: c.v[3][2] }))} fmt={fmtPct0} max={15} color={CAT[0]} />,
            },
          ]}
        />
      </Card>

      <Card
        wide
        title="Lateness is concentrated in about twenty stores"
        kicker="worst stores for late scheduled deliveries, August 2026, minimum 500 delivered"
        shows="The ten worst stores in the network, against the national late rate of 5.8%. They run three to five times it. Four of the ten are in Delhi, which is why Delhi is the latest city."
        reads={`a fixable problem, not a systemic one. These ten stores are ${WORST_STORE_SHARE.volume}% of delivered scheduled volume and about ${WORST_STORE_SHARE.lateOrders}% of every late scheduled order in the country, running ${WORST_STORE_SHARE.ownRate}% late between them. This is an operations list, not a design list, and fixing the worst twenty would move the national number on its own.`}
        table={{ head: ["Store", "City", "Delivered", "Late", "Early"], rows: WORST_STORES.map((s) => [s.store, s.city, fmtInt(s.delivered), fmtPct1(s.late), fmtPct1(s.early)]) }}
      >
        <HBars
          rows={WORST_STORES.map((s) => ({ k: s.store, sub: `${s.city}, ${fmtInt(s.delivered)} delivered`, v: s.late }))}
          fmt={fmtPct1}
          max={30}
          color={OK3[2]}
          sub={`Network average in August: ${NETWORK_LATE_AUG}% late.`}
        />
      </Card>

      {/* ================= 4. The basket, and the cost ==================== */}
      <SectionHead
        n="04"
        title="The basket, and what is actually in it"
        blurb="Scheduled orders carry nearly three times the order value and get the worst experience in the business. Then the July data names the thing the mean was hiding: more than half of every scheduled rupee is now a large appliance, and scheduling is quietly becoming the appliance-delivery channel."
      />

      <Card
        wide
        tall
        title="Scheduled against instant, August 2026"
        kicker="eight measures, same month, same network"
        shows="The whole argument on one card. A scheduled order is worth 1,452 rupees against 543 for an instant one, and carries 5.85 items against 4.65. It also earns 0.34 stars less, raises 2.6 times the support tickets and is cancelled 2.5 times as often."
        reads="the most valuable order in the business is the one we serve worst. That is the case for spending on it, and it is also the reason the feature keeps feeling like a liability internally."
        table={{ head: ["Measure", "Scheduled", "Instant"], rows: VS_INSTANT.map((r) => [r.label, fmtMeasure(r.scheduled, r), fmtMeasure(r.instant, r) + (r.approx ? " (approx)" : "")]) }}
        footnote="Only 55% of scheduled orders matched the GMV table, so the basket figures are indicative. The ticket rate's denominator is approximate, but both groups use the same method. * the instant cancellation rate is stated as about 11%."
      >
        <CompareRows
          rows={VS_INSTANT.map((r) => ({ label: r.label, a: r.scheduled, b: r.instant, fmt: r.fmt, approxB: r.approx === "instant" }))}
          aLabel="Scheduled"
          bLabel="Instant"
          colors={[CAT[0], CAT[1]]}
          format={fmtMeasure}
        />
      </Card>

      <Card
        title="It is a tail, not a typical basket"
        kicker="mean against median, August 2026"
        shows="The mean gap is +167%. The median gap is +69%, which is 229 rupees. A scheduled basket has a mean-to-median ratio of 2.59 against instant's 1.64, and that ratio is what a fat tail looks like."
        reads="there are at least two populations inside 'scheduled' and they are not the same product. The median order is an instant order with a chosen hour: 47.6% of September's orders were booked less than two hours ahead. The tail has a name, and the next three cards are about it, because it turned out to be large appliances rather than big grocery shops."
        footnote="DERIVED from the mean and median in the scheduled-against-instant table."
      >
        <SmallMultiples
          min={200}
          panels={[
            {
              title: "Mean against median",
              children: (
                <CompareRows
                  rows={BASKET_SHAPE.map((b) => ({ label: b.label, a: b.mean, b: b.median, fmt: "inr" }))}
                  aLabel="Mean"
                  bLabel="Median"
                  colors={[CAT[0], CAT[1]]}
                  format={fmtMeasure}
                />
              ),
            },
            {
              title: "Mean divided by median",
              children: (
                <HBars
                  rows={BASKET_SHAPE.map((b, i) => ({ k: b.label, sub: i === 0 ? "a long tail of very large baskets" : "one population", v: b.ratio, color: i === 0 ? CAT[0] : CAT[1] }))}
                  fmt={(v) => v.toFixed(2) + "x"}
                  max={3}
                />
              ),
            },
          ]}
        />
      </Card>

      <Card
        wide
        title="GMV keeps growing while orders fall"
        kicker="matched scheduled orders and their GMV, Dec 2025 to 22 Sep 2026"
        shows="Two panels, same months. Orders peaked in May and have declined since. GMV went the other way, from 94 crore in May to 118 crore in August. About 823 crore in total since December."
        reads="all of the growth is order value, none of it is order count. That is the opposite of what a feature growing healthily looks like, and it is the first sign that the mix inside the feature changed rather than its adoption."
        table={{ head: ["Month", "Orders matched", "GMV", "AOV"], rows: GMV_AOV.map((m) => [m.label + (m.partial ? " (to 22nd)" : ""), m.ordersLakh.toFixed(2) + "L", "\u20b9" + m.gmvCr.toFixed(1) + " Cr", fmtInr(m.aov)]) }}
        footnote="The GMV bridge matches about 55% of scheduled orders, so absolute GMV is understated; the AOV and the trend are sound. Every row reproduces: GMV divided by matched orders returns the stated AOV."
      >
        <SmallMultiples
          panels={[
            { title: "GMV, crore rupees", children: <MultiLine rows={GMV_AOV.map((m) => ({ label: m.label, v: m.gmvCr }))} series={[{ key: "v", label: "GMV", short: "GMV" }]} colors={[CAT[2]]} yFmt={(v) => "\u20b9" + Math.round(v)} height={210} /> },
            { title: "Matched orders, lakhs", children: <MultiLine rows={GMV_AOV.map((m) => ({ label: m.label, v: m.ordersLakh }))} series={[{ key: "v", label: "Orders", short: "orders" }]} colors={[CAT[0]]} yFmt={(v) => v.toFixed(0) + "L"} height={210} /> },
          ]}
        />
      </Card>

      <Card
        title="Average order value, and the July break"
        kicker="scheduled AOV by month"
        shows="Flat at 930 to 982 rupees for seven straight months, then a step change from July: 1,240, then 1,401, then 1,748."
        reads="nothing in the feature changed in July. Something in the catalogue did."
        table={{ head: ["Month", "AOV"], rows: GMV_AOV.map((m) => [m.label, fmtInr(m.aov)]) }}
      >
        <MultiLine
          rows={GMV_AOV.map((m) => ({ label: m.label, v: m.aov }))}
          series={[{ key: "v", label: "Average order value", short: "AOV" }]}
          colors={[CAT[0]]}
          yFmt={(v) => "\u20b9" + Math.round(v)}
          domainMin={800}
        />
      </Card>

      <Card
        wide
        title="It is not bigger baskets. It is pricier items."
        kicker="items per order against price per item"
        shows="Items per order sat between 5.4 and 6.3 all year with no break at July. Price per item did all of the work: 147 to 176 rupees from December to June, then 203, 240 and 291."
        reads="the decomposition kills the obvious reading. Nobody started buying more. The same six-item basket got a much more expensive item dropped into it."
        legend={[{ label: "Exact value", color: CAT[0] }, { label: "Reported as a range", color: CAT[0], dash: true }]}
        table={{ head: ["Month", "Items per order", "Price per item"], rows: BASKET_DECOMP.map((m) => [m.label, "5.4 to 6.3", typeof m.pricePerItem === "object" ? `\u20b9${m.pricePerItem.lo} to \u20b9${m.pricePerItem.hi}` : fmtInr(m.pricePerItem)]) }}
        footnote="The report gives items per order and the December-to-June price per item as ranges, so both are drawn as bands rather than flattened to a midpoint."
      >
        <SmallMultiples
          panels={[
            { title: "Items per order", children: <RangeColumns rows={BASKET_DECOMP} valueKey="items" yFmt={(v) => v.toFixed(1)} height={200} color={CAT[2]} /> },
            { title: "Price per item", children: <RangeColumns rows={BASKET_DECOMP} valueKey="pricePerItem" yFmt={(v) => "\u20b9" + Math.round(v)} height={200} color={CAT[1]} /> },
          ]}
        />
      </Card>

      <Card
        wide
        title="One category did all of it"
        kicker="Electronics and Appliances, share of scheduled GMV and price per item"
        shows="July is the inflection: electronics GMV doubled in a month, from 20 crore to 42 crore, and its share of scheduled GMV went from 21% to 37%. By September it is 54%."
        reads="pricier units, not more units. Items sold have FALLEN since July, 66k to 47k, while GMV kept rising, because the average price per electronics item went from 3,792 rupees to 10,810. That is large appliances, not earbuds. More than half of every scheduled-delivery rupee is now one of them."
        legend={[{ label: "Share of scheduled GMV", color: CAT[1] }, { label: "Price per electronics item", color: CAT[3] }]}
        table={{ head: ["Month", "Electronics GMV", "Share of SD GMV", "Items", "Orders with one", "Price per item"], rows: ELECTRONICS.map((e) => [e.label + (e.partial ? " (to 22nd)" : ""), "\u20b9" + e.gmvCr.toFixed(1) + " Cr", fmtPct1(e.shareOfSdGmv), fmtInt(e.items), fmtInt(e.ordersWithOne), fmtInr(e.pricePerItem)]) }}
        footnote="Six checkpoint months, not every month. Price per item reproduces from GMV divided by items in every row; the stated share sits 0.3 to 1.9 points below the share implied by the GMV table, which is rounding in the crore figures."
      >
        <SmallMultiples
          panels={[
            { title: "Share of scheduled GMV", children: <MultiLine rows={ELECTRONICS.map((e) => ({ label: e.label, v: e.shareOfSdGmv }))} series={[{ key: "v", label: "Share of SD GMV", short: "share" }]} colors={[CAT[1]]} yFmt={fmtPct0} height={210} /> },
            { title: "Price per electronics item", children: <MultiLine rows={ELECTRONICS.map((e) => ({ label: e.label, v: e.pricePerItem }))} series={[{ key: "v", label: "Price per item", short: "per item" }]} colors={[CAT[3]]} yFmt={(v) => "\u20b9" + fmtK(v)} height={210} /> },
          ]}
        />
      </Card>

      <Card
        wide
        tall
        title="Appliance orders against everything else"
        kicker="August 2026, orders classified by whether they contain an Electronics and Appliances item"
        shows="Appliance orders are 7.5% of scheduled volume, 109,449 of 1.46 million. They are cancelled 34.4% of the time against 26.6%, returned to origin 4.5% against 2.9%, and late 12.9% against 9.2% when they do arrive. One in three never arrives at all."
        reads="but they are not why scheduled delivery looks bad. Support tickets are IDENTICAL between the two groups, 166 per thousand each, so the 2.6 times ticket rate against instant delivery is a scheduled-delivery problem, not an appliance one. Ratings are only slightly worse. Where appliances do matter is money: 7.5% of orders and more than half the revenue."
        table={{ head: ["Measure", "Appliance", "Other scheduled"], rows: APPLIANCE_VS_OTHER.map((r) => [r.label, fmtMeasure(r.a, r), fmtMeasure(r.b, r)]) }}
        footnote="Classified with order_product_partitioned, which has 100% order coverage and INCLUDES cancelled orders, unlike the GMV table. Counts reconcile exactly: delivered plus cancelled plus RTO equals the total for both groups, and the split covers 94.8% of August's verified scheduled orders."
      >
        <CompareRows
          rows={APPLIANCE_VS_OTHER}
          aLabel="Appliance orders"
          bLabel="Every other scheduled order"
          colors={[CAT[3], CAT[0]]}
          format={fmtMeasure}
        />
      </Card>

      <Card
        title="And the gap is widening"
        kicker="cancellation rate, appliance against other scheduled orders"
        shows="Three months of the same split. Appliance cancellations went 30.6%, 33.1%, 34.4% while every other scheduled order sat flat at about 26%. The gap widened from 4.7 points to 7.8 in three months."
        reads="whatever is breaking appliance orders is getting worse, not settling. July was also the peak of appliance volume at 128k orders, which is exactly when the GMV inflected."
        legend={[{ label: "Appliance orders", color: CAT[3] }, { label: "Every other scheduled order", color: CAT[0] }]}
        table={{ head: ["Month", "Appliance cancelled", "Other cancelled", "Appliance RTO", "Other RTO"], rows: APPLIANCE_MONTHLY.map((m) => [m.label, fmtPct1(m.apCancelled), fmtPct1(m.otCancelled), fmtPct1(m.apRto), fmtPct1(m.otRto)]) }}
        footnote="June's within / early / late split was rejected: a UTC conversion returned 99% late. August's is the sound one."
      >
        <MultiLine
          rows={APPLIANCE_MONTHLY.map((m) => ({ label: m.label, ap: m.apCancelled, ot: m.otCancelled }))}
          series={[{ key: "ap", label: "Appliance", short: "appliance" }, { key: "ot", label: "Other", short: "other" }]}
          colors={[CAT[3], CAT[0]]}
          yFmt={fmtPct0}
          domainMin={20}
          domainMax={40}
        />
      </Card>

      <Card
        wide
        title="Seven percent of the orders, fifty-eight percent of the cancelled money"
        kicker="August 2026, each group's cancelled orders valued at its own average order value"
        shows="Apply each group's order value to its own cancellations and August's cancelled basket is about 76.5 crore rupees, of which 44.2 crore is appliances. Appliances are 7.5% of scheduled orders and 57.7% of the value that gets cancelled."
        reads="this is where the cancellation problem and the appliance problem turn out to be the same problem. A 34% cancellation rate is survivable on a 900 rupee basket. On an 11,742 rupee one it is the largest revenue leak in the feature."
        table={{
          head: ["", "Cancelled orders", "Value"],
          rows: [
            ["Appliance", fmtInt(APPLIANCE_CANCEL_VALUE.applianceOrders), "\u20b9" + APPLIANCE_CANCEL_VALUE.applianceCr + " Cr"],
            ["Other scheduled", fmtInt(APPLIANCE_CANCEL_VALUE.otherOrders), "\u20b9" + APPLIANCE_CANCEL_VALUE.otherCr + " Cr"],
            ["Total", fmtInt(APPLIANCE_CANCEL_VALUE.applianceOrders + APPLIANCE_CANCEL_VALUE.otherOrders), "\u20b9" + APPLIANCE_CANCEL_VALUE.totalCr + " Cr"],
          ],
        }}
        footnote="DERIVED, and it assumes a cancelled basket looks like a delivered one within its own group. The split's cancelled total, 395,860, sits 6% below the verified 421,145, which is the split's 94.8% order coverage."
      >
        <SmallMultiples
          min={200}
          panels={[
            {
              title: "Share of scheduled orders",
              children: <HBars rows={[{ k: "Appliance", v: 7.5, color: CAT[3] }, { k: "Everything else", v: 92.5, color: CAT[0] }]} fmt={fmtPct1} max={100} />,
            },
            {
              title: "Share of the cancelled value",
              children: <HBars rows={[{ k: "Appliance", sub: "\u20b944.2 Cr", v: 57.7, color: CAT[3] }, { k: "Everything else", sub: "\u20b932.3 Cr", v: 42.3, color: CAT[0] }]} fmt={fmtPct1} max={100} />,
            },
          ]}
        />
      </Card>

      <Card
        title="Three different AOVs for the same month"
        kicker="August 2026, scheduled delivery, by scope"
        shows="The GMV bridge says 1,401 rupees. The scheduled-against-instant table says 1,452. The appliance split, which has the widest coverage and includes cancelled orders, implies 1,718."
        reads="none of them is wrong; they answer different questions on different samples. This card exists so the case study never quotes one of them without saying which, because the spread is 23% and a reviewer will find it."
        table={{ head: ["Scope", "August AOV", "What it covers"], rows: AOV_SCOPES.map((r) => [r.label, fmtInr(r.v), r.note]) }}
      >
        <HBars
          rows={AOV_SCOPES.map((r, i) => ({ k: r.label, sub: r.note, v: r.v, color: [CAT[0], CAT[1], CAT[3]][i] }))}
          fmt={fmtInr}
          max={1800}
        />
      </Card>

      <Card
        title="It punches above its order weight"
        kicker="scheduled delivery as a share of three different totals, August 2026"
        shows="1.44% of orders, but 3.76% of gross basket value and 3.62% of every support ticket the business takes. One in 6.8 scheduled orders raises a ticket, against one in 17.5 instant ones."
        reads="the same fact from both ends. It is two and a half times its order weight in value and in cost, which is the whole argument for treating it as a real product rather than a rounding error."
        table={{ head: ["Measure", "Share"], rows: OVER_WEIGHT.map((r) => [r.label, fmtPct1(r.v)]) }}
        footnote="DERIVED from the order counts, the average order values and the per-thousand ticket rates."
      >
        <HBars
          rows={OVER_WEIGHT.map((r, i) => ({ k: r.label, v: r.v, color: i === 0 ? "var(--sdc-neutral)" : i === 1 ? CAT[0] : OK3[2] }))}
          fmt={fmtPct1}
          max={4}
        />
      </Card>

      <Card
        wide
        title="Why scheduled orders get cancelled"
        kicker="August 2026, 421,145 cancelled scheduled orders"
        shows="Five out of six cancelled scheduled orders carry no reason at all. The team confirmed why: the cancellation bot lets a customer drop the order without giving one, so the blank is the product working as built, not a hole in the data. Which means the blanks belong on the customer side of the ledger, not in an unknown bucket."
        reads={`rebase it that way and the picture inverts. ${CANCEL_REBASED[0].v}% of scheduled cancellations are somebody changing their mind; ${CANCEL_REBASED[1].v}% are operations failing to serve the order. For instant orders the mix runs the other way. And the scheduled-delivery bot line, quoted as 11.3%, is ${CANCEL_BOT_OF_REASONED}% of the cancellations that carry a reason at all: the 11.3% is rebased on a total that is mostly blanks.`}
        legend={[{ label: "Customer changed their mind", color: CAT[0] }, { label: "Operations could not serve it", color: OK3[2] }, { label: "Other", color: "var(--sdc-neutral)" }]}
        table={{ head: ["Reason", "Scheduled", "Share of all", "Instant"], rows: CANCEL_REASONS.map((r) => [r.label, fmtInt(r.scheduled), r.scheduledPct.toFixed(1) + "%", r.instant === 0 ? "not present" : r.instant == null ? "" : fmtInt(r.instant)]) }}
        footnote="The rebasing is DERIVED from the reason table, not pulled. It rests on the team's confirmation that a blank reason is a customer cancelling through the bot."
      >
        <SmallMultiples
          panels={[
            {
              title: "As reported, share of all cancellations",
              children: (
                <HBars
                  rows={CANCEL_REASONS.map((r) => ({
                    k: r.label,
                    sub: r.instantNote ? "scheduled only" : r.instantPct != null ? `instant: ${r.instantPct}%` : undefined,
                    v: r.scheduledPct,
                    color: r.blank ? "var(--sdc-neutral)" : r.instantNote ? OK3[2] : CAT[0],
                  }))}
                  fmt={fmtPct1}
                  max={90}
                  sub={`Total cancelled in August: ${fmtInt(CANCEL_TOTAL_AUG)}.`}
                />
              ),
            },
            {
              title: "Rebased: who actually cancelled",
              children: (
                <HBars
                  rows={CANCEL_REBASED.map((r) => ({ k: r.label, sub: r.detail, v: r.v, color: { customer: CAT[0], ops: OK3[2], other: "var(--sdc-neutral)" }[r.key] }))}
                  fmt={fmtPct1}
                  max={100}
                  sub={`The scheduled-delivery bot is ${CANCEL_BOT_OF_REASONED}% of the cancellations that carry a reason.`}
                />
              ),
            },
          ]}
        />
      </Card>

      <Card
        wide
        title="What cancellation costs"
        kicker="cancelled scheduled orders per month, Nov 2025 to 21 Sep 2026"
        shows="The number the on-time debate keeps out of the frame. 3.66 million scheduled orders were cancelled in eleven months. August alone is 421,145 orders, which at the scheduled average order value is about 61 crore rupees of booked basket, or roughly 734 crore annualised."
        reads="cancellation, not lateness, is the largest thing wrong with this feature, and it is mostly customers changing their minds rather than operations failing. Design owns that problem in a way it does not own a late rider."
        table={{ head: ["Month", "Cancelled", "Times the network rate"], rows: CANCELLED_MONTHLY.map((r) => [r.label + (r.partial ? " (21 days)" : ""), fmtInt(r.cancelled), r.ratio.toFixed(2) + "x"]) }}
        footnote="DERIVED: monthly volume multiplied by that month's cancellation rate. The method lands August at 420,884 against the report's exact 421,145, a gap of 0.06%. The rupee figure applies August's average order value and is indicative: only 55% of scheduled orders matched the GMV table."
      >
        <RangeColumns
          rows={CANCELLED_MONTHLY.map((r) => ({ label: r.label, span: r.label + (r.partial ? ", 21 days" : ""), v: r.cancelled }))}
          valueKey="v"
          yFmt={fmtK}
          emphasis={(r) => r.label === "May 26"}
        />
      </Card>

      <Card
        title="The cancellation gap is not closing"
        kicker="scheduled cancellation rate divided by the network's own rate"
        shows="The absolute rate improved, 31.3% in December to 27.0% now. But the network improved faster underneath it. Measured as a multiple, scheduled delivery is cancelled 2.45 times as often as an average order, which is worse than December's 2.27."
        reads="the improvement is the network's, not the feature's. Nothing we did to scheduled delivery moved this line."
        table={{ head: ["Month", "Scheduled", "All orders", "Ratio"], rows: live.map((m) => [m.label, fmtPct1(m.sdCancelPct), fmtPct1(m.allCancelPct), (m.sdCancelPct / m.allCancelPct).toFixed(2) + "x"]) }}
      >
        <MultiLine
          rows={CANCELLED_MONTHLY.map((r) => ({ label: r.label, v: r.ratio }))}
          series={[{ key: "v", label: "Times the network rate", short: "ratio" }]}
          colors={[OK3[2]]}
          yFmt={(v) => v.toFixed(1) + "x"}
          domainMin={1.5}
        />
      </Card>

      <Card
        title="Do people come back?"
        kicker="the June 2026 cohort, followed for 30 days"
        shows="946,088 customers placed a scheduled order in June. Fewer than one in five placed another within thirty days, and 85.7% placed exactly one all month."
        reads="modest, and narrower than it looks. The 1.22 average is built on DELIVERED orders: June delivered 1,166,325 scheduled orders across those customers, which is 1.23 each, while June PLACED 1,641,214, which is 1.73 each. Since 27% of scheduled orders are cancelled, the repeat rate is answering how often a customer got a second scheduled order, not how often they asked for one."
        footnote="The delivered-against-placed split is DERIVED from the monthly volume and on-time tables."
      >
        <Kpis
          cols={3}
          items={[
            { value: "18.3%", label: "placed another within 30 days", note: fmtInt(REPEAT_JUNE.repeatWithin30d) + " of " + fmtInt(REPEAT_JUNE.customers) },
            { value: "85.7%", label: "placed exactly one in June" },
            { value: "1.22", label: "average scheduled orders per customer" },
          ]}
        />
      </Card>

      {/* ================= 5. Supply ===================================== */}
      <SectionHead
        n="05"
        title="Supply: the slots themselves"
        blurb="The slot snapshot holds a capacity and a booked count for every store, date and hour. It is the only place the May step change is explained, and the explanation is not demand."
      />

      <Card
        wide
        title="Capacity is lowest exactly when demand is highest"
        kicker="August 2026, by slot hour"
        shows="Three reads of the same August. Average capacity per slot sags at the two peaks, 6 AM and 10 PM, and is at its most generous through the middle of the day when nobody wants it. Sold-out rates invert that shape exactly."
        reads="the mismatch in one picture. Slots are 9 to 31% full on average, yet 10 PM sells out 15.4% of the time, because that is where the least capacity is. The dead zone is 4 to 6 PM: 4.2% sold out and 9% full."
        legend={[{ label: "Exact value", color: CAT[0] }, { label: "Reported as a range", color: CAT[0], dash: true }]}
        table={{ head: ["Hour", "Open store-slot-days", "Sold out", "Sold out %", "Avg capacity", "Avg fill"], rows: CAPACITY_AUG.map((r) => [r.span || r.label, fmtInt(r.open), typeof r.soldOut === "object" ? `${fmtInt(r.soldOut.lo)} to ${fmtInt(r.soldOut.hi)}` : fmtInt(r.soldOut), typeof r.soldOutPct === "object" ? `${r.soldOutPct.lo} to ${r.soldOutPct.hi}%` : r.soldOutPct + "%", typeof r.capacity === "object" ? `${r.capacity.lo} to ${r.capacity.hi}` : r.capacity, typeof r.fill === "object" ? `${r.fill.lo} to ${r.fill.hi}%` : r.fill + "%"]) }}
        footnote="The 10 AM to 3 PM and 4 to 6 PM blocks were reported as ranges, so they are drawn as open bands rather than flattened to a midpoint."
      >
        <SmallMultiples
          panels={[
            { title: "Average capacity per slot", children: <RangeColumns rows={CAPACITY_AUG} valueKey="capacity" yFmt={(v) => v.toFixed(1)} height={200} color={CAT[0]} /> },
            { title: "Sold out, share of open slots", children: <RangeColumns rows={CAPACITY_AUG} valueKey="soldOutPct" yFmt={fmtPct0} height={200} color={OK3[2]} /> },
            { title: "Average fill", children: <RangeColumns rows={CAPACITY_AUG} valueKey="fill" yFmt={fmtPct0} height={200} color={CAT[2]} /> },
          ]}
        />
      </Card>

      <Card
        wide
        title="The constraint is being lifted, not hit"
        kicker="sold-out rate and average capacity, four watched slot hours"
        shows="Two panels on the same six months. Sold-out rates fall every single month in every watched hour, while average capacity per slot climbs. At 6 AM: 35.2% sold out in April on 4.5 orders of capacity, 7.8% in September on 8.3."
        reads="supply is no longer the limit. Volume peaked in May and has drifted down since while capacity kept rising, so slots are progressively emptier. That is the real explanation for the falling scheduled share."
        legend={WATCHED_HOURS.map((h, i) => ({ label: h.label + " slot", color: CAT[i] }))}
        table={{ head: ["Month", ...WATCHED_HOURS.map((h) => h.label)], rows: SELLOUT_MONTHLY.map((r) => [r.label, ...WATCHED_HOURS.map((h) => (r[h.key] ? `${r[h.key].so}% sold out, cap ${r[h.key].cap}` : "not covered"))]) }}
        footnote="April and May cover hours 6 to 11 only, so the 4 PM and 10 PM series start in June. September covers 21 days."
      >
        <SmallMultiples
          panels={[
            {
              title: "Sold-out rate",
              children: <MultiLine rows={sellout} series={WATCHED_HOURS.map((h) => ({ key: h.key, label: h.label + " slot", short: h.label }))} colors={CAT} yFmt={fmtPct0} height={210} />,
            },
            {
              title: "Average capacity per slot",
              children: <MultiLine rows={capacity} series={WATCHED_HOURS.map((h) => ({ key: h.key, label: h.label + " slot", short: h.label }))} colors={CAT} yFmt={(v) => v.toFixed(1)} height={210} domainMin={4} />,
            },
          ]}
        />
      </Card>

      <Card
        title="What actually happened in May"
        kicker="the 6 AM slot, April against May 2026"
        shows="At 6 AM in April the slot was full 35% of the time on four and a half orders of capacity. In May, open store-slot-days rose 37% and capacity per slot rose 64%, on a flat store count."
        reads="even with orders doubling, sell-outs fell. The May step change was supply being unlocked, not demand appearing. Product raised capacity to scale the feature, and the demand was already waiting behind it."
      >
        <Kpis
          cols={2}
          items={[
            { value: "+37%", label: "open 6 AM store-slot-days", note: `${fmtInt(SIX_AM_RELEASE.openApr)} to ${fmtInt(SIX_AM_RELEASE.openMay)}` },
            { value: "+64%", label: "average capacity per 6 AM slot", note: `${SIX_AM_RELEASE.capacityApr} to ${SIX_AM_RELEASE.capacityMay} orders` },
            { value: "25.0%", label: "6 AM sold-out rate in May", note: "down from 35.2% in April, while orders doubled" },
            { value: "flat", label: "stores offering a 6 AM slot", note: "the supply came from inside them" },
          ]}
        />
      </Card>

      <Card
        wide
        title="Half the capacity is in the hours nobody wants"
        kicker="August 2026, 5.83 million slot-orders of capacity across the network"
        shows="Summed across every open store-slot-day, the network runs at 15.9% fill. 52.7% of all that capacity sits between 10 AM and 6 PM, the block running at about 11% fill, while the peaks it could serve are the hours with the least capacity per slot."
        reads="the fix costs nothing. Lifting each peak hour to the midday capacity of 9.4 orders a slot would add 16% of capacity at 6 AM, 31% at 9 PM, 38% at 10 PM and 59% at 11 PM, at zero net capacity across the day. The supply is already bought; it is pointed at the wrong hours."
        legend={[{ label: "Peak hours, capacity available if lifted to midday levels", color: CAT[2] }]}
        table={{ head: ["Peak hour", "Capacity now", "Lift to 9.4"], rows: CAPACITY_SHAPE.lift.map((r) => [r.label, String(CAPACITY_AUG.find((c) => c.label === r.label)?.capacity ?? ""), "+" + r.v + "%"]) }}
        footnote="DERIVED: capacity per slot multiplied by open store-slot-days, summed by hour, with the two range rows taken at their midpoint. The snapshot's implied bookings, 0.93M, sit below the 1.54M orders placed and 1.07M delivered, so it appears to net out cancellations."
      >
        <SmallMultiples
          min={200}
          panels={[
            {
              title: "Where the capacity sits",
              children: (
                <HBars
                  rows={[
                    { k: "10 AM to 6 PM", sub: `about ${CAPACITY_SHAPE.deadZoneFill}% full`, v: CAPACITY_SHAPE.deadZoneShare, color: "var(--sdc-neutral)" },
                    { k: "Every other hour", sub: "where the demand is", v: +(100 - CAPACITY_SHAPE.deadZoneShare).toFixed(1), color: CAT[0] },
                  ]}
                  fmt={fmtPct1}
                  max={100}
                  sub={`System fill across all hours: ${CAPACITY_SHAPE.systemFill}%.`}
                />
              ),
            },
            {
              title: "What lifting each peak to 9.4 would add",
              children: (
                <HBars
                  rows={CAPACITY_SHAPE.lift.map((r) => ({ k: r.label + " slot", sub: `now ${CAPACITY_AUG.find((c) => c.label === r.label)?.capacity} orders a slot`, v: r.v, color: CAT[2] }))}
                  fmt={(v) => "+" + v + "%"}
                  max={60}
                />
              ),
            },
          ]}
        />
      </Card>

      <Card
        title="When a slot sells out"
        kicker="55,112 sold-out store-slot-days, August 2026"
        shows="How far before the slot each sold-out slot actually filled. Two thirds fill within three hours of the slot opening, which is last-minute demand rather than structural shortage."
        reads="the 24% that sell out more than six hours ahead, 13,390 store-slot-days, are the real constraint cases. Everything else is the evening rush finding the nearest slot."
        table={{ head: ["Filled up", "Store-slot-days", "Share"], rows: SELLOUT_TIMING.map((r) => [r.label, fmtInt(r.days), fmtPct1(r.pct)]) }}
      >
        <HBars rows={SELLOUT_TIMING.map((r, i) => ({ k: r.label, v: r.pct, color: SEQ7[i] }))} fmt={fmtPct1} max={42} />
      </Card>

      {/* ================= 6. The experiment ============================= */}
      <SectionHead
        n="06"
        title="The threshold experiment"
        blurb="Eight days in September, new slot-threshold logic against control. It is here because the honest read is that it did not win."
      />

      <Card
        wide
        title="New threshold logic against control"
        kicker="15 to 22 September 2026"
        shows="Eight metrics over eight days. The new logic produced 2.5% fewer scheduled orders, a slightly lower delivered rate, more cancellations and, most sharply, 10% fewer orders per rider instance."
        reads="the verdict holds, but only two of the four negatives do. The 10% drop in orders per rider instance is real and is the headline. The delivered rate is marginal at z = -2.03. The order count is real but confounded by assignment. The cancellation rise, the one that reads worst, is z = 1.61: noise. Three of the four supporting numbers should be one."
        table={{ head: ["Metric", "Control", "New logic", "Holds up?"], rows: EXPERIMENT.map((r) => [r.label, fmtMeasure(r.control, r), fmtMeasure(r.test, r), EXPERIMENT_SIG[r.label] ? EXPERIMENT_SIG[r.label].verdict + (EXPERIMENT_SIG[r.label].z ? ` (z = ${EXPERIMENT_SIG[r.label].z})` : "") : "not tested"]) }}
        footnote="The significance tests are DERIVED from the counts in the experiment table, not supplied with it."
      >
        <CompareRows
          rows={EXPERIMENT.map((r) => {
            const d = ((r.test - r.control) / r.control) * 100;
            const sig = EXPERIMENT_SIG[r.label];
            return {
              label: r.label,
              a: r.control,
              b: r.test,
              fmt: r.fmt,
              delta: (d >= 0 ? "+" : "") + d.toFixed(1) + "%" + (sig ? ` \u00b7 ${sig.verdict}` : ""),
            };
          })}
          aLabel="Control"
          bLabel="New logic"
          colors={[CAT[0], CAT[3]]}
          format={fmtMeasure}
        />
      </Card>

      {/* ================= 7. Still missing ============================== */}
      <SectionHead
        n="07"
        title="What the data still cannot say"
        blurb="Four questions the case study asks that the warehouse cannot answer. They are left as spec cards rather than estimated, because an estimate here would be the part a reviewer is right to distrust."
      />

      <Card
        title="Demand lost to a full slot board"
        shows="How often somebody opened the slot picker, found nothing bookable, and left. The warehouse was searched and there is no table and no event recording it: no attribute key, no funnel row. The nearest proxy is the experiment table's demand-loss column, 2.2%, which is all orders and not scheduled-specific."
        needs={["an event fired when the slot picker renders with zero bookable slots", "the cart and store context at that moment", "the outcome: abandoned, switched to instant, or left"]}
      />

      <Card
        title="Planned against fallback"
        shows="Of the people who scheduled, how many planned ahead and how many fell back because instant was unavailable. The interviews put it at roughly eight in ten fallback; the behavioural version still needs the flag per order."
        needs={["per order: instant serviceability at cart time (fallback = not serviceable)", "or the prompt surface that led to the schedule, contextual prompt against deliberate toggle"]}
      />

      <Card
        title="Where is my order, by time to slot"
        shows="Support tickets on scheduled orders, plotted against how long before the slot they were raised. The study found 454 tickets from 366 users, every one before the slot started, clustered around midnight. The report gives the monthly ticket rate but not the timing."
        needs={["ticket timestamps joined to order id", "slot start per order", "the ticket category, WISMO against other"]}
      />

      <Card
        title="Split shipments"
        shows="How often a scheduled order fanned out into two, three or four shipments, and how each piece answered the slot question: scheduled, unavailable, or store closed."
        needs={["shipments per order id", "per shipment: fulfilling site type, dark store or superstore", "per shipment: slot outcome"]}
      />

      <p className="sdc__source">
        Source: month-by-month warehouse pull, 23 September 2026. Scheduled orders are rows in
        {" "}<code>order_attribute_v2_partitioned</code> with key <code>SCHEDULED_DELIVERY</code>; capacity comes from
        {" "}<code>schedule_delivery_slots_snapshot</code>. Every monthly figure above is a raw query result or adds up
        exactly to one that is. Where the pull returned a range, the chart draws a range.
      </p>
    </div>
  );
}
