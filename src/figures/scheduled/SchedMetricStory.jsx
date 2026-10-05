import "./scheduled.css";
import {
  StackedColumns, MultiLine, RangeColumns, CompareRows, HBars, Legend,
  CAT, SEQ5, SEQ7, OK3, fmtK, fmtPct0, fmtPct1, fmtInr,
} from "../sdAvailability/SdChartKit";
import {
  MONTHLY, ROLLOUT, SLOT_BANDS, SLOT_MIX, LEAD_BUCKETS, LEAD_TIME, ONTIME,
  ARRIVAL_RATING, VS_INSTANT, REPEAT_JUNE, SELLOUT_MONTHLY, WATCHED_HOURS,
  SIX_AM_RELEASE, CANCEL_REBASED, CANCELLED_TOTAL, ELECTRONICS, MEDIAN_GAP_INR,
  APPLIANCE_AUG, APPLIANCE_CANCEL_VALUE, EARLY_SHIFT_SHARE, RATING_CHECKS,
  GMV_TOTAL_CR, SOURCE_NOTE,
} from "../sdAvailability/sdReport";

// "Stitch a story with all of the metrics" (Agam, 27 Sep 2026).
//
// The Impact dashboard showed every chart at once, with nothing to say which
// one comes first. This is the same verified data told as a plot, in six
// acts: it launched, people changed how they shop, it was worth more, then
// the trouble, then supply caught up, then what is still open. Each beat is ONE
// claim and the ONE chart that proves it, in the My role slide layout.
//
// HONESTY RULES, from the 23 Sep re-crunch (Claude/2026-09-23_sd-data-reanalysis.md),
// because a story is exactly where a number gets bent to fit the plot:
//   - the basket gap is a TAIL: always say the median gap next to the mean
//   - the rise in early arrivals is NOT the move to morning slots (0.3 of 14.4 pts)
//   - early arrivals do not hurt ratings (not significant); late ones do
//   - GMV comes from a bridge that matches about 55% of orders, so it is a floor
//   - cancellations are mostly customers changing their minds, not operations
// Every figure below is read from sdReport, never retyped.

const live = MONTHLY.filter((m) => m.sd > 1000);
const pk = live.reduce((a, b) => (b.sd > a.sd ? b : a));
const firstM = live.find((m) => m.sd >= 1e6);
const full = ROLLOUT.find((r) => r.mark === "full rollout");
const days = Math.round((new Date(full.d) - new Date(ROLLOUT[0].d)) / 864e5);
const aov = VS_INSTANT.find((r) => r.label === "Average order value");
const ot = (k) => ONTIME.find((r) => r.label === k);
const cxl = (k) => live.find((m) => m.label === k);
const cust = CANCEL_REBASED.find((r) => r.key === "customer");
const ops = CANCEL_REBASED.find((r) => r.key === "ops");
const early = ARRIVAL_RATING.find((r) => r.key === "early");
const within = ARRIVAL_RATING.find((r) => r.key === "within");
const late = ARRIVAL_RATING.find((r) => r.key === "late");
const elFirst = ELECTRONICS[0], elLast = ELECTRONICS[ELECTRONICS.length - 1];
const am0 = SLOT_MIX[0], amN = SLOT_MIX.find((r) => r.m === "2026-08");
const lead0 = LEAD_TIME[0], leadN = LEAD_TIME.find((r) => r.m === "2026-08");
const soN = SELLOUT_MONTHLY[SELLOUT_MONTHLY.length - 1];

const ACTS = [
  {
    act: "Act 1 · It shipped",
    beats: [
      {
        claim: `From ${ROLLOUT[0].stores} stores to ${full.stores.toLocaleString("en-IN")} in ${days} days.`,
        body: `The first scheduled order landed on 10 Oct 2025, ${ROLLOUT[0].orders} of them that day. By 12 Dec every store could take one.`,
        chart: (
          <MultiLine rows={ROLLOUT} series={[{ key: "stores", label: "Stores live" }]} colors={[CAT[0]]} yFmt={(v) => Math.round(v).toLocaleString("en-IN")} domainMin={0} height={200} />
        ),
      },
      {
        claim: `A million orders a month by ${firstM.label.replace(" 26", " 2026")}.`,
        body: `${live[0].sd.toLocaleString("en-IN")} in the first full month, ${fmtK(firstM.sd)} three months later, and a peak of ${fmtK(pk.sd)} in ${pk.label.replace(" 26", " 2026")}, ${pk.sdPct}% of every Zepto shipment.`,
        chart: <RangeColumns rows={live.filter((m) => !m.partial)} valueKey="sd" yFmt={fmtK} height={200} />,
      },
    ],
  },
  {
    act: "Act 2 · People changed how they shop",
    beats: [
      {
        claim: "They started planning ahead.",
        body: `In the first month ${lead0.u1}% of slots were booked under an hour out. By August it was ${leadN.u1}%, and the median booking sat about ${leadN.median} hours ahead.`,
        chart: (
          <>
            <StackedColumns rows={LEAD_TIME} series={LEAD_BUCKETS} colors={SEQ7} height={200} />
            <Legend items={LEAD_BUCKETS.map((b, i) => ({ label: b.label, color: SEQ7[i] }))} />
          </>
        ),
      },
      {
        claim: "And mornings took over.",
        body: `Evenings led at launch with ${am0.eve}% of orders. By August the 6 to 10 AM slots led with ${amN.am}%: groceries for the day, booked the night before.`,
        chart: (
          <>
            <StackedColumns rows={SLOT_MIX} series={SLOT_BANDS} colors={SEQ5} height={200} />
            <Legend items={SLOT_BANDS.map((b, i) => ({ label: b.label, color: SEQ5[i] }))} />
          </>
        ),
      },
    ],
  },
  {
    act: "Act 3 · It was worth more",
    beats: [
      {
        claim: `A scheduled basket is worth ${(aov.scheduled / aov.instant).toFixed(1)}x an instant one.`,
        body: `But that average is carried by a tail. The typical scheduled basket is only ${fmtInr(MEDIAN_GAP_INR)} bigger, so the honest headline is the median, not the mean.`,
        chart: (
          <CompareRows
            rows={VS_INSTANT.slice(0, 3).map((r) => ({ label: r.label, a: r.scheduled, b: r.instant, fmt: r.fmt }))}
            aLabel="Scheduled" bLabel="Instant"
            format={(v, r) => (r.fmt === "inr" ? fmtInr(v) : v.toFixed(2))}
          />
        ),
      },
      {
        claim: "The tail has a name: appliances.",
        body: `Electronics and appliances went from ${elFirst.shareOfSdGmv}% of scheduled GMV in December to ${elLast.shareOfSdGmv}% in September. Around ₹${GMV_TOTAL_CR} Cr of scheduled GMV since December, and that is a floor: the bridge matches only about 55% of orders.`,
        chart: <MultiLine rows={ELECTRONICS} series={[{ key: "shareOfSdGmv", label: "Appliances, % of GMV" }]} colors={[CAT[1]]} yFmt={fmtPct0} domainMin={0} domainMax={60} height={200} />,
      },
    ],
  },
  {
    act: "Act 4 · The trouble",
    beats: [
      {
        claim: "Scheduled orders cancel at twice the rate.",
        body: `Between ${cxl("Nov 25").sdCancelPct}% and ${Math.max(...live.map((m) => m.sdCancelPct || 0))}% a month, against ${cxl("Aug 26").allCancelPct}% for all orders. About ${(CANCELLED_TOTAL / 1e6).toFixed(2)}M scheduled orders never made it.`,
        chart: (
          <>
            <MultiLine rows={live.map((m) => ({ label: m.label, sd: m.sdCancelPct, all: m.allCancelPct }))} series={[{ key: "sd", label: "Scheduled" }, { key: "all", label: "All orders" }]} colors={[CAT[0], CAT[1]]} yFmt={fmtPct0} domainMin={0} domainMax={35} height={200} />
            <Legend items={[{ label: "Scheduled", color: CAT[0] }, { label: "All orders", color: CAT[1] }]} swatch="line" />
          </>
        ),
      },
      {
        claim: "But it was people changing their minds.",
        body: `${cust.v}% of cancellations came from the customer. Operations failing to serve the order was ${ops.v}%. Booking a day ahead gives a day to change your mind.`,
        chart: <HBars rows={CANCEL_REBASED.map((r) => ({ k: r.label, v: r.v, sub: r.detail }))} fmt={fmtPct1} max={100} />,
      },
      {
        claim: "The promise slipped as volume grew.",
        body: `Deliveries inside the booked hour went from ${ot("Dec 25").within}% to ${ot("Feb 26").within}% by February, then eased to ${ot("Aug 26").within}% in August as volume doubled. The growth was in early arrivals, and it was not the move to mornings: that explains ${EARLY_SHIFT_SHARE.parts[2].v} of the ${EARLY_SHIFT_SHARE.total} points.`,
        chart: (
          <>
            <StackedColumns rows={ONTIME} series={[{ key: "within", label: "Within slot" }, { key: "early", label: "Early" }, { key: "late", label: "Late" }]} colors={OK3} height={200} />
            <Legend items={[{ label: "Within the booked hour", color: OK3[0] }, { label: "Early", color: OK3[1] }, { label: "Late", color: OK3[2] }]} />
          </>
        ),
      },
      {
        claim: "Early is forgiven. Late is not.",
        body: `Early orders rated ${early.rating}, inside-the-hour ${within.rating}: no real difference (${RATING_CHECKS.earlyVsWithin.verdict}). Late ones rated ${late.rating}, and that gap is ${RATING_CHECKS.lateVsWithin.verdict}.`,
        chart: <HBars rows={ARRIVAL_RATING.map((r) => ({ k: r.label, v: r.rating, sub: `${r.lowStar}% one or two stars` }))} fmt={(v) => v.toFixed(2)} max={5} />,
      },
    ],
  },
  {
    act: "Act 5 · Supply caught up",
    beats: [
      {
        claim: "Opening more morning slots fixed the sell-outs.",
        body: `In May the 6 AM slot got ${SIX_AM_RELEASE.openLift}% more store-slots and ${SIX_AM_RELEASE.capacityLift}% more capacity. Its sell-out rate went from ${SIX_AM_RELEASE.soldOutApr}% in April to ${soN.h6.so}% by September, and every watched hour followed.`,
        chart: (
          <>
            <MultiLine rows={SELLOUT_MONTHLY.map((r) => ({ label: r.label, ...Object.fromEntries(WATCHED_HOURS.map((h) => [h.key, r[h.key]?.so ?? null])) }))} series={WATCHED_HOURS} colors={CAT} yFmt={fmtPct0} domainMin={0} height={200} />
            <Legend items={WATCHED_HOURS.map((h, i) => ({ label: `${h.label} slot`, color: CAT[i] }))} swatch="line" />
          </>
        ),
      },
      {
        claim: `${REPEAT_JUNE.repeatPct}% came back within a month.`,
        body: `Of the ${(REPEAT_JUNE.customers / 1e5).toFixed(1)} lakh people who scheduled in June, ${(REPEAT_JUNE.repeatWithin30d / 1e5).toFixed(2)} lakh scheduled again within 30 days. Most used it once: a tool for the days that need it, not a habit.`,
        chart: <HBars rows={[{ k: "Scheduled again within 30 days", v: REPEAT_JUNE.repeatPct }, { k: "Used it once", v: REPEAT_JUNE.onceOnlyPct }]} fmt={fmtPct1} max={100} />,
      },
    ],
  },
  {
    act: "Act 6 · What is still open",
    beats: [
      {
        claim: "Appliances are the next problem to design for.",
        body: `They are ${APPLIANCE_AUG.appliance.sharePct}% of scheduled orders but ${APPLIANCE_CANCEL_VALUE.applianceShareOfValue}% of the value that is cancelled. ${APPLIANCE_CANCEL_VALUE.neverArrives}% of appliance orders never arrive. A slot picker built for groceries was carrying a fridge.`,
        chart: (
          <CompareRows
            rows={[
              { label: "Cancelled", a: APPLIANCE_AUG.appliance.cancelled, b: APPLIANCE_AUG.other.cancelled },
              { label: "Returned to origin", a: APPLIANCE_AUG.appliance.rto, b: APPLIANCE_AUG.other.rto },
              { label: "Late, of delivered", a: APPLIANCE_AUG.appliance.late, b: APPLIANCE_AUG.other.late },
            ]}
            aLabel="Appliance orders" bLabel="Everything else" format={(v) => fmtPct1(v)}
          />
        ),
      },
    ],
  },
];

// `acts` (28 Sep, the presenting cut): a count (the first N acts) or a list of act indices
export default function SchedMetricStory({ acts }) {
  let n = 0;
  return (
    <div className="rwf-run msty">
      {(Array.isArray(acts) ? acts.map((i) => ACTS[i]) : acts ? ACTS.slice(0, acts) : ACTS).map((a) => a.beats.map((b, k) => {
        n += 1;
        return (
          <section className="rwf msty__beat" key={b.claim} aria-label={`${a.act}: ${b.claim}`}>
            <p className="rwf__tag">{k === 0 ? a.act : ""}</p>
            <div className="rwf__main">
              <span className="rwf__n msty__n" aria-hidden>{String(n).padStart(2, "0")}</span>
              <h3 className="rwf__title">{b.claim}</h3>
              <p className="rwf__lead msty__body">{b.body}</p>
              <div className="msty__chart">{b.chart}</div>
            </div>
          </section>
        );
      }))}
      <p className="msty__src">{SOURCE_NOTE} Order values match about 55% of scheduled orders to the GMV table, so money figures are indicative.</p>
    </div>
  );
}
