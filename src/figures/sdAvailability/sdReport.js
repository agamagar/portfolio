// Scheduled Delivery: the verified historical record.
//
// SOURCE: "Scheduled Delivery (SD): Historical Data Report", 23 Sep 2026, pulled
// month by month from the warehouse. Every monthly number here either arrived
// with raw query results or adds up exactly to a verified monthly total;
// answers that failed those checks were rejected and re-asked. An SD order is a
// row in silver.oms.order_attribute_v2_partitioned with key = 'SCHEDULED_DELIVERY',
// whose value carries slot_date_ist, start_time_ist and end_time_ist for a
// one-hour slot. The first record is dated 10 Oct 2025.
//
// INTERNAL NUMBERS: these are Zepto operational counts, transcribed from the
// report and not recomputed here. Where the report gave a range rather than a
// value (the midday and late-afternoon capacity rows) the range is carried
// through as { lo, hi } and drawn as a band, never as a point.

export const SOURCE_NOTE =
  "Warehouse pull, 23 Sep 2026. Every monthly figure is a verified query result or adds up exactly to one.";

// ---- 2. Monthly volume and outcomes ---------------------------------------
// allShipments in millions. sdPct is SD as a share of all shipments.
// sdCancelPct / allCancelPct are silver.oms.shipment.status = 'CANCELLED',
// all reasons, so they run higher than the DS experiment table's figure.
export const MONTHLY = [
  { m: "2025-10", label: "Oct 25", allShipments: 62.9, sd: 383, sdPct: 0.0, stores: 132, sdCancelPct: null, allCancelPct: 15.9, partial: true, note: "pilot" },
  { m: "2025-11", label: "Nov 25", allShipments: 67.1, sd: 76541, sdPct: 0.11, stores: 1161, sdCancelPct: 27.7, allCancelPct: 14.6 },
  { m: "2025-12", label: "Dec 25", allShipments: 77.6, sd: 751678, sdPct: 0.97, stores: 1176, sdCancelPct: 31.3, allCancelPct: 13.8 },
  { m: "2026-01", label: "Jan 26", allShipments: 82.7, sd: 1008185, sdPct: 1.22, stores: 1172, sdCancelPct: 30.7, allCancelPct: 12.6 },
  { m: "2026-02", label: "Feb 26", allShipments: 81.2, sd: 1243284, sdPct: 1.53, stores: 1169, sdCancelPct: 28.7, allCancelPct: 11.3 },
  { m: "2026-03", label: "Mar 26", allShipments: 92.5, sd: 1095152, sdPct: 1.18, stores: 1169, sdCancelPct: 30.2, allCancelPct: 11.0 },
  { m: "2026-04", label: "Apr 26", allShipments: 93.7, sd: 1199840, sdPct: 1.28, stores: 1263, sdCancelPct: 30.0, allCancelPct: 10.7 },
  { m: "2026-05", label: "May 26", allShipments: 105.3, sd: 1809603, sdPct: 1.72, stores: 1263, sdCancelPct: 28.2, allCancelPct: 10.7 },
  { m: "2026-06", label: "Jun 26", allShipments: 104.0, sd: 1641214, sdPct: 1.58, stores: 1261, sdCancelPct: 26.4, allCancelPct: 10.5 },
  { m: "2026-07", label: "Jul 26", allShipments: 104.6, sd: 1572699, sdPct: 1.50, stores: 1254, sdCancelPct: 27.4, allCancelPct: 11.2 },
  { m: "2026-08", label: "Aug 26", allShipments: 107.0, sd: 1536073, sdPct: 1.44, stores: 1252, sdCancelPct: 27.4, allCancelPct: 11.2 },
  { m: "2026-09", label: "Sep 26", allShipments: 67.3, sd: 934483, sdPct: 1.39, stores: 1436, sdCancelPct: 27.0, allCancelPct: 11.0, partial: true, note: "1 to 21 Sep" },
];

// ---- 3. Rollout, Oct to Dec 2025 ------------------------------------------
export const ROLLOUT = [
  { d: "2025-10-10", label: "10 Oct", orders: 16, stores: 2, mark: "pilot starts" },
  { d: "2025-10-30", label: "30 Oct", orders: 142, stores: 62 },
  { d: "2025-11-05", label: "5 Nov", orders: 1992, stores: 443 },
  { d: "2025-11-16", label: "16 Nov", orders: 7902, stores: 811 },
  { d: "2025-12-03", label: "3 Dec", orders: 19943, stores: 865 },
  { d: "2025-12-12", label: "12 Dec", orders: 28221, stores: 1144, mark: "full rollout" },
  { d: "2025-12-23", label: "23 Dec", orders: 38825, stores: 1156, mark: "December peak" },
];

// ---- 4. Slot time-of-day mix (% of SD orders) -----------------------------
// There are no slots between 2 AM and 6 AM. Every month's hourly counts add up
// to that month's verified SD total (Nov 2025 is 8 orders short, where the slot
// time was missing).
export const SLOT_BANDS = [
  { key: "am", label: "6 to 10 AM" },
  { key: "mid", label: "10 AM to 2 PM" },
  { key: "pm", label: "2 to 6 PM" },
  { key: "eve", label: "6 to 10 PM" },
  { key: "night", label: "10 PM to 12 AM" },
];

export const SLOT_MIX = [
  { m: "2025-11", label: "Nov 25", am: 10.8, mid: 19.8, pm: 24.5, eve: 36.5, night: 8.4, busiest: 21 },
  { m: "2025-12", label: "Dec 25", am: 22.1, mid: 23.6, pm: 18.5, eve: 24.1, night: 11.8, busiest: 8 },
  { m: "2026-01", label: "Jan 26", am: 26.6, mid: 23.3, pm: 18.8, eve: 21.1, night: 10.2, busiest: 8 },
  { m: "2026-02", label: "Feb 26", am: 22.2, mid: 20.2, pm: 23.4, eve: 23.2, night: 11.0, busiest: 8 },
  { m: "2026-03", label: "Mar 26", am: 16.6, mid: 25.9, pm: 29.5, eve: 20.5, night: 7.4, busiest: 15 },
  { m: "2026-04", label: "Apr 26", am: 22.7, mid: 21.5, pm: 25.9, eve: 17.9, night: 12.0, busiest: 15 },
  { m: "2026-05", label: "May 26", am: 25.9, mid: 21.1, pm: 20.5, eve: 19.4, night: 13.1, busiest: 6 },
  { m: "2026-06", label: "Jun 26", am: 32.3, mid: 20.9, pm: 16.3, eve: 18.9, night: 11.6, busiest: 6 },
  { m: "2026-07", label: "Jul 26", am: 33.2, mid: 21.1, pm: 15.2, eve: 19.6, night: 10.9, busiest: 6 },
  { m: "2026-08", label: "Aug 26", am: 34.3, mid: 21.4, pm: 15.1, eve: 19.2, night: 10.1, busiest: 6 },
  { m: "2026-09", label: "Sep 26", am: 33.7, mid: 21.6, pm: 15.9, eve: 19.1, night: 9.4, busiest: 6 },
];

// ---- 5. Booking lead time (slot start minus order time) -------------------
export const LEAD_BUCKETS = [
  { key: "u1", label: "under 1h" },
  { key: "h12", label: "1 to 2h" },
  { key: "h24", label: "2 to 4h" },
  { key: "h48", label: "4 to 8h" },
  { key: "h812", label: "8 to 12h" },
  { key: "h1224", label: "12 to 24h" },
  { key: "o24", label: "over 24h" },
];

export const LEAD_TIME = [
  { m: "2025-11", label: "Nov 25", u1: 56.4, h12: 21.6, h24: 6.8, h48: 6.6, h812: 6.8, h1224: 1.7, o24: 0.1, median: 0.9, rough: true },
  { m: "2025-12", label: "Dec 25", u1: 25.7, h12: 21.1, h24: 12.5, h48: 11.2, h812: 17.7, h1224: 11.0, o24: 1.5, median: 2.4, rough: true },
  { m: "2026-01", label: "Jan 26", u1: 19.0, h12: 23.0, h24: 13.2, h48: 12.3, h812: 18.6, h1224: 12.5, o24: 1.3, median: 2.9 },
  { m: "2026-02", label: "Feb 26", u1: 23.0, h12: 23.7, h24: 13.6, h48: 11.8, h812: 15.2, h1224: 11.2, o24: 1.5, median: 2.3 },
  { m: "2026-03", label: "Mar 26", u1: 18.0, h12: 23.1, h24: 15.4, h48: 11.5, h812: 13.0, h1224: 15.9, o24: 2.9, median: 2.8 },
  { m: "2026-04", label: "Apr 26", u1: 23.5, h12: 18.8, h24: 12.4, h48: 12.3, h812: 14.6, h1224: 14.3, o24: 4.1, median: 3.0 },
  { m: "2026-05", label: "May 26", u1: 24.2, h12: 18.9, h24: 11.2, h48: 12.4, h812: 16.6, h1224: 13.7, o24: 3.0, median: 3.0 },
  { m: "2026-06", label: "Jun 26", u1: 24.8, h12: 19.4, h24: 10.4, h48: 13.4, h812: 17.8, h1224: 12.0, o24: 2.2, median: 2.8 },
  { m: "2026-07", label: "Jul 26", u1: 22.9, h12: 18.6, h24: 10.3, h48: 14.6, h812: 17.7, h1224: 12.9, o24: 2.9, median: 3.5 },
  { m: "2026-08", label: "Aug 26", u1: 23.6, h12: 20.3, h24: 10.2, h48: 14.8, h812: 18.8, h1224: 10.9, o24: 1.3, median: 2.9 },
  { m: "2026-09", label: "Sep 26", u1: 27.0, h12: 20.6, h24: 10.4, h48: 15.1, h812: 16.6, h1224: 9.3, o24: 1.0, median: 2.3 },
];

// ---- 5b. On-time rate for delivered SD orders -----------------------------
// Arrival (arrived_timestamp from gold.product.shipment_fact) against the booked
// one-hour slot. Delivered counts match the verified monthly totals within 0.5%,
// except September at minus 2%.
export const ONTIME = [
  { m: "2025-12", label: "Dec 25", delivered: 506694, within: 86.1, early: 4.7, late: 9.2 },
  { m: "2026-01", label: "Jan 26", delivered: 681567, within: 92.0, early: 4.2, late: 3.8 },
  { m: "2026-02", label: "Feb 26", delivered: 868622, within: 92.6, early: 2.6, late: 4.5 },
  { m: "2026-03", label: "Mar 26", delivered: 748706, within: 87.2, early: 8.1, late: 4.7 },
  { m: "2026-04", label: "Apr 26", delivered: 818259, within: 85.6, early: 7.9, late: 6.5 },
  { m: "2026-05", label: "May 26", delivered: 1254643, within: 82.8, early: 7.1, late: 10.2 },
  { m: "2026-06", label: "Jun 26", delivered: 1166325, within: 83.9, early: 8.7, late: 7.3 },
  { m: "2026-07", label: "Jul 26", delivered: 1094473, within: 82.7, early: 10.3, late: 7.0 },
  { m: "2026-08", label: "Aug 26", delivered: 1067928, within: 82.5, early: 11.7, late: 5.8 },
  { m: "2026-09", label: "Sep 26", delivered: 643170, within: 76.8, early: 17.0, late: 6.2, partial: true },
];

// On-time by slot time band: within / early / late.
export const ONTIME_BAND_KEYS = [
  { key: "morning", label: "6 to 9 AM slots" },
  { key: "day", label: "9 AM to 6 PM slots" },
  { key: "evening", label: "6 PM to 12 AM slots" },
];

export const ONTIME_BANDS = [
  { m: "2025-12", label: "Dec 25", morning: [91.1, 7.0, 1.9], day: [90.2, 5.7, 4.2], evening: [91.9, 2.5, 5.6] },
  { m: "2026-01", label: "Jan 26", morning: [92.7, 5.8, 1.5], day: [91.5, 4.9, 3.6], evening: [92.3, 2.1, 5.6] },
  { m: "2026-02", label: "Feb 26", morning: [93.8, 4.6, 1.6], day: [92.6, 2.9, 4.2], evening: [92.1, 1.3, 6.3] },
  { m: "2026-03", label: "Mar 26", morning: [85.6, 12.3, 2.1], day: [87.1, 8.6, 4.3], evening: [88.1, 5.4, 6.5] },
  { m: "2026-04", label: "Apr 26", morning: [85.4, 11.0, 3.6], day: [85.3, 8.4, 6.2], evening: [86.1, 5.2, 8.6] },
  { m: "2026-05", label: "May 26", morning: [83.6, 10.5, 5.8], day: [82.0, 7.6, 10.4], evening: [83.4, 4.0, 12.7] },
  { m: "2026-06", label: "Jun 26", morning: [86.3, 9.7, 4.0], day: [81.2, 10.6, 7.8], evening: [85.7, 5.0, 9.3] },
  { m: "2026-07", label: "Jul 26", morning: [85.4, 10.6, 4.0], day: [79.5, 12.8, 7.7], evening: [84.7, 6.6, 8.8] },
  { m: "2026-08", label: "Aug 26", morning: [84.5, 12.4, 3.1], day: [79.4, 14.4, 6.2], evening: [85.0, 7.2, 7.8] },
  { m: "2026-09", label: "Sep 26", morning: [78.9, 17.8, 3.3], day: [74.2, 19.3, 6.6], evening: [79.2, 12.4, 8.4] },
];

// Does arriving early upset customers? Scheduled orders delivered 1 to 7 Aug 2026.
export const ARRIVAL_RATING = [
  { key: "early", label: "Early", sub: "before slot start", orders: 43243, rated: 1532, rating: 4.14, lowStar: 17.8 },
  { key: "within", label: "Within slot", sub: "inside the booked hour", orders: 188139, rated: 8666, rating: 4.07, lowStar: 19.7 },
  { key: "late", label: "Late", sub: "after slot end", orders: 35352, rated: 1849, rating: 3.81, lowStar: 26.2 },
];

// On-time by city: within / early / late, four checkpoint months.
export const CITY_MONTHS = ["Feb 26", "May 26", "Aug 26", "Sep 26"];
export const CITY_ONTIME = [
  { city: "Mumbai", v: [[92, 2, 6], [86, 5, 9], [82, 13, 5], [76, 18, 6]] },
  { city: "Delhi", v: [[91, 2, 6], [79, 7, 14], [81, 9, 9], [75, 17, 9]] },
  { city: "Bengaluru", v: [[94, 3, 2], [82, 8, 10], [79, 16, 5], [75, 20, 5]] },
  { city: "Hyderabad", v: [[91, 3, 6], [82, 9, 10], [83, 12, 5], [77, 18, 5]] },
  { city: "Chennai", v: [[94, 2, 4], [82, 8, 10], [85, 10, 6], [78, 14, 7]] },
  { city: "Pune", v: [[95, 2, 3], [83, 6, 11], [79, 13, 8], [73, 22, 5]] },
  { city: "Gurugram", v: [[92, 4, 4], [81, 5, 14], [79, 12, 8], [72, 18, 9]] },
  { city: "Noida", v: [[91, 5, 3], [86, 6, 8], [85, 12, 3], [77, 20, 3]] },
];

// ---- 5c. Scheduled against instant, August 2026 ---------------------------
// Caveat carried from the report: only 55% of scheduled orders matched the GMV
// table, so the basket figures are indicative. The ticket rate's denominator is
// approximate, but both groups use the same method.
export const VS_INSTANT = [
  { label: "Average order value", scheduled: 1452, instant: 543, fmt: "inr", better: "up" },
  { label: "Median order value", scheduled: 561, instant: 332, fmt: "inr", better: "up" },
  { label: "Items per order", scheduled: 5.85, instant: 4.65, fmt: "num2", better: "up" },
  { label: "Average delivery rating", scheduled: 3.98, instant: 4.32, fmt: "num2", better: "down" },
  { label: "1 to 2 star share", scheduled: 21.7, instant: 13.4, fmt: "pct", better: "down" },
  { label: "5 star share", scheduled: 65.5, instant: 74.7, fmt: "pct", better: "down" },
  { label: "Support tickets per 1,000 orders", scheduled: 147, instant: 57, fmt: "num0", better: "down" },
  { label: "Cancelled", scheduled: 27.4, instant: 11, fmt: "pct", better: "down", approx: "instant" },
];

// Why are so many cancelled? August 2026. 421,145 cancelled scheduled orders,
// a figure that matches the verified count exactly. The team confirmed the
// blank reason is expected: the bot lets customers cancel without giving one.
export const CANCEL_TOTAL_AUG = 421145;
export const CANCEL_REASONS = [
  { label: "No reason recorded", scheduled: 356245, scheduledPct: 84.6, instant: null, blank: true },
  { label: "Scheduled shipment cancellation from bot", scheduled: 47551, scheduledPct: 11.3, instant: 0, instantNote: "not present" },
  { label: "Auto cancellation, breach time reached", scheduled: 10701, scheduledPct: 2.5, instant: 38304, instantPct: 0.3 },
  { label: "No inventory found", scheduled: 3451, scheduledPct: 0.8, instant: 78794, instantPct: 0.7 },
  { label: "Shipment cancellation from bot", scheduled: 1515, scheduledPct: 0.4, instant: 57757, instantPct: 0.5 },
  { label: "User cancelled, ETA breach", scheduled: 901, scheduledPct: 0.2, instant: 23752, instantPct: 0.2 },
];

// Repeat use, June 2026 cohort.
export const REPEAT_JUNE = {
  customers: 946088,
  repeatWithin30d: 173288,
  repeatPct: 18.3,
  onceOnlyPct: 85.7,
  avgOrders: 1.22,
};

// ---- 5d. Slot capacity and sell-outs --------------------------------------
// gold.product.schedule_delivery_slots_snapshot, hourly per store, slot date and
// slot hour, with capacity (0 = slot closed) and number_of_orders_booked.
// Figures take the last snapshot per store, date and slot.
// Rows the report gave as a range carry { lo, hi }; they are drawn as bands.
export const CAPACITY_AUG = [
  { hour: 6, label: "6 AM", open: 38045, soldOut: 4500, soldOutPct: 11.8, capacity: 8.1, fill: 31.2 },
  { hour: 7, label: "7 AM", open: 38485, soldOut: 3591, soldOutPct: 9.3, capacity: 9.0, fill: 26.1 },
  { hour: 8, label: "8 AM", open: 38607, soldOut: 3228, soldOutPct: 8.4, capacity: 9.4, fill: 22.3 },
  { hour: 9, label: "9 AM", open: 38607, soldOut: 2538, soldOutPct: 6.6, capacity: 9.4, fill: 18.1 },
  { hour: 10, span: "10 AM to 3 PM", label: "10 to 3", open: 38650, soldOut: { lo: 2100, hi: 2540 }, soldOutPct: { lo: 5.4, hi: 6.6 }, capacity: { lo: 8.4, hi: 9.3 }, fill: { lo: 10, hi: 16 }, range: true },
  { hour: 16, span: "4 to 6 PM", label: "4 to 6", open: 38690, soldOut: { lo: 1613, hi: 1753 }, soldOutPct: { lo: 4.2, hi: 4.5 }, capacity: 8.8, fill: { lo: 9, hi: 10 }, range: true },
  { hour: 19, label: "7 PM", open: 38656, soldOut: 2042, soldOutPct: 5.3, capacity: 8.4, fill: 11.4 },
  { hour: 20, label: "8 PM", open: 38742, soldOut: 2939, soldOutPct: 7.6, capacity: 7.9, fill: 14.2 },
  { hour: 21, label: "9 PM", open: 38621, soldOut: 4941, soldOutPct: 12.8, capacity: 7.2, fill: 20.2 },
  { hour: 22, label: "10 PM", open: 38677, soldOut: 5967, soldOutPct: 15.4, capacity: 6.8, fill: 22.4 },
  { hour: 23, label: "11 PM", open: 34358, soldOut: 3913, soldOutPct: 11.4, capacity: 5.9, fill: 16.9 },
];

// Sell-out rate and average capacity by month, four watched slot hours.
// April and May cover hours 6 to 11 only, so 4 PM and 10 PM are null there.
// September covers 21 days.
export const WATCHED_HOURS = [
  { key: "h6", label: "6 AM" },
  { key: "h9", label: "9 AM" },
  { key: "h16", label: "4 PM" },
  { key: "h22", label: "10 PM" },
];

export const SELLOUT_MONTHLY = [
  { m: "2026-04", label: "Apr 26", h6: { so: 35.2, cap: 4.5 }, h9: { so: 23.8, cap: 8.0 }, h16: null, h22: null },
  { m: "2026-05", label: "May 26", h6: { so: 25.0, cap: 7.4 }, h9: { so: 24.0, cap: 7.9 }, h16: null, h22: null },
  { m: "2026-06", label: "Jun 26", h6: { so: 15.2, cap: 7.8 }, h9: { so: 12.7, cap: 8.5 }, h16: { so: 8.8, cap: 8.4 }, h22: { so: 21.4, cap: 6.5 } },
  { m: "2026-07", label: "Jul 26", h6: { so: 13.3, cap: 7.8 }, h9: { so: 8.4, cap: 9.2 }, h16: { so: 5.9, cap: 8.6 }, h22: { so: 17.9, cap: 6.6 } },
  { m: "2026-08", label: "Aug 26", h6: { so: 11.8, cap: 8.1 }, h9: { so: 6.6, cap: 9.4 }, h16: { so: 4.5, cap: 8.7 }, h22: { so: 15.4, cap: 6.8 } },
  { m: "2026-09", label: "Sep 26", h6: { so: 7.8, cap: 8.3 }, h9: { so: 4.3, cap: 10.0 }, h16: { so: 3.5, cap: 9.4 }, h22: { so: 9.9, cap: 7.6 } },
];

// What changed at 6 AM between April and May: the capacity release.
export const SIX_AM_RELEASE = {
  openApr: 28197,
  openMay: 38609,
  openLift: 37,
  capacityApr: 4.5,
  capacityMay: 7.4,
  capacityLift: 64,
  soldOutApr: 35.2,
  soldOutMay: 25.0,
};

// When do slots sell out? 55,112 sold-out store-slot-days in Aug 2026.
export const SELLOUT_TIMING = [
  { label: "under 1h before", days: 22068, pct: 40.0 },
  { label: "1 to 3h before", days: 14309, pct: 26.0 },
  { label: "3 to 6h before", days: 5345, pct: 9.7 },
  { label: "6 to 12h before", days: 5534, pct: 10.0 },
  { label: "12 to 24h before", days: 4282, pct: 7.8 },
  { label: "over 24h before", days: 3574, pct: 6.5 },
];

// Worst stores for lateness, Aug 2026. Minimum 500 delivered scheduled orders.
export const WORST_STORES = [
  { store: "PUN-Pimple Saudagar Network", city: "Pune", delivered: 1635, late: 28.7, early: 5.8 },
  { store: "DEL-Neb Sarai SS", city: "Delhi", delivered: 3739, late: 26.8, early: 8.0 },
  { store: "MUM-Airoli SS", city: "Mumbai", delivered: 2790, late: 25.0, early: 16.3 },
  { store: "CHN-Vanagram SS", city: "Chennai", delivered: 1974, late: 22.8, early: 6.6 },
  { store: "DEL-Kalkaji Network", city: "Delhi", delivered: 2935, late: 21.3, early: 3.7 },
  { store: "HYD-Manikonda SS", city: "Hyderabad", delivered: 2469, late: 20.7, early: 4.3 },
  { store: "PUN-Ambegaon SS", city: "Pune", delivered: 1729, late: 20.3, early: 6.9 },
  { store: "DEL-Kalkaji SS", city: "Delhi", delivered: 6054, late: 20.1, early: 6.1 },
  { store: "FBD-NIT 2", city: "Faridabad", delivered: 697, late: 19.2, early: 10.3 },
  { store: "DEL-South Ext SS", city: "Delhi", delivered: 4564, late: 19.1, early: 7.5 },
];
export const NETWORK_LATE_AUG = 5.8;

// ---- 5e. DS experiment, 15 to 22 Sep 2026 ---------------------------------
// New threshold logic against control, eight days.
export const EXPERIMENT = [
  { label: "Scheduled orders", control: 23659, test: 23059, fmt: "num0", better: "up" },
  { label: "Scheduled share of orders", control: 0.73, test: 0.71, fmt: "pct2", better: "up" },
  { label: "Delivered", control: 88.77, test: 88.17, fmt: "pct2", better: "up" },
  { label: "Cancelled", control: 8.05, test: 8.46, fmt: "pct2", better: "down" },
  { label: "Batched", control: 75.16, test: 74.83, fmt: "pct2", better: "up" },
  { label: "Orders per rider instance", control: 1.678, test: 1.511, fmt: "num3", better: "up" },
  { label: "Demand loss", control: 2.207, test: 2.158, fmt: "pct2", better: "down" },
  { label: "Utilisation", control: 78.26, test: 78.40, fmt: "pct2", better: "up" },
];

// ===========================================================================
// DERIVED, AND WHERE THE REPORT'S OWN READING DOES NOT SURVIVE
// ===========================================================================
// Everything below is computed from the tables above, not pulled from the
// warehouse, and is flagged as derived wherever it is drawn. It comes from the
// 23 Sep 2026 re-crunch (Claude/2026-09-23_sd-data-reanalysis.md), whose
// arithmetic was reproduced from the report's tables before any of it was
// used here. Three of the report's own conclusions do not survive it, and the
// charts that carry them say so on the card rather than in a footnote.

// Cancelled scheduled orders per month = volume x that month's cancel rate.
// The August figure lands at 420,884 against the report's exact 421,145, a
// 0.06% gap, which is the check that the method is right.
export const CANCELLED_MONTHLY = MONTHLY
  .filter((m) => m.sdCancelPct != null)
  .map((m) => ({
    label: m.label,
    cancelled: Math.round(m.sd * (m.sdCancelPct / 100)),
    // how many times the network's own rate SD is cancelled at
    ratio: +(m.sdCancelPct / m.allCancelPct).toFixed(2),
    partial: m.partial,
  }));
export const CANCELLED_TOTAL = 3.66e6;      // Nov 2025 to 21 Sep 2026
export const CANCELLED_AUG_CRORE = 61.2;    // 421,145 x Rs 1,452
export const CANCELLED_ANNUALISED_CRORE = 734;

// Scheduled orders per store per day. Absolute volume is down 16% from the May
// peak; per store it is down a third, because the store count kept rising.
const DAYS = { "2025-11": 30, "2025-12": 31, "2026-01": 31, "2026-02": 28, "2026-03": 31, "2026-04": 30, "2026-05": 31, "2026-06": 30, "2026-07": 31, "2026-08": 31, "2026-09": 21 };
export const PER_STORE = MONTHLY
  .filter((m) => DAYS[m.m] && m.sd > 1000)
  .map((m) => ({ label: m.label, v: +(m.sd / m.stores / DAYS[m.m]).toFixed(1) }));

// Shift-share decomposition of the rise in early arrivals, Feb to Sep.
// Band weights were recovered by solving the 3x3 system in section 5b (the
// monthly within / early / late totals are a weighted average of the band
// rates, and the weights sum to one). December is degenerate and was dropped.
// The report says early arrivals "fit the move to 6 AM slots". They do not:
// the slot-mix shift accounts for 0.3 of the 14.4 points.
export const EARLY_SHIFT_SHARE = {
  total: 14.4,
  parts: [
    { label: "Within-band rates rising", v: 13.2, note: "in every band, morning, day and evening" },
    { label: "Interaction", v: 0.9 },
    { label: "Shift toward morning slots", v: 0.3, note: "the report's stated cause" },
  ],
  augToSep: { total: 5.3, mix: 0.2, rates: 5.1 },
  // Recovered morning / day / evening mix, as a share of delivered orders
  weights: [
    { label: "Feb 26", morning: 25, day: 29, evening: 46 },
    { label: "May 26", morning: 19, day: 52, evening: 29 },
    { label: "Aug 26", morning: 28, day: 42, evening: 30 },
    { label: "Sep 26", morning: 27, day: 46, evening: 27 },
  ],
};

// The rating slice that carries the metric change, checked two ways.
export const RATING_CHECKS = {
  // 4.14 (n=1,532) against 4.07 (n=8,666). Rating SD estimated from the
  // 1-2 star and 5 star shares; SE of the difference 0.044.
  earlyVsWithin: { t: 1.59, p: 0.11, verdict: "not significant" },
  lateVsWithin: { t: -6.38, p: 0.000, verdict: "significant, and large" },
  // Response rate is biased by the thing being measured.
  responseRate: [
    { label: "Early", v: 3.54 },
    { label: "Within slot", v: 4.61 },
    { label: "Late", v: 5.23 },
  ],
  // The slice does not reconcile with the August monthly table.
  slice: { within: 70.5, early: 16.2, late: 13.3 },
  month: { within: 82.5, early: 11.7, late: 5.8 },
};

// Cancellation reasons rebased off the 84.6% blanks. The team confirmed the
// blank is a customer cancelling through the bot without giving a reason, so
// the blanks belong on the customer side, not in an unknown bucket.
export const CANCEL_REBASED = [
  { label: "Customer changed their mind", v: 95.9, detail: "no reason recorded plus the scheduled-delivery bot line", key: "customer" },
  { label: "Operations could not serve it", v: 3.6, detail: "breach time, no inventory, ETA breach", key: "ops" },
  { label: "Other", v: 0.4, detail: "the generic shipment bot line", key: "other" },
];
export const CANCEL_BOT_OF_REASONED = 73.3; // 47,551 of the 64,856 that carry a reason

// Two populations inside "scheduled". A mean-to-median ratio of 2.59 against
// instant's 1.64 says the mean is carried by a fat tail: the typical scheduled
// basket is only Rs 229 bigger than an instant one.
export const BASKET_SHAPE = [
  { label: "Scheduled", mean: 1452, median: 561, ratio: 2.59 },
  { label: "Instant", mean: 543, median: 332, ratio: 1.64 },
];
export const MEDIAN_GAP_INR = 229;

// Scheduled delivery against its own order weight, August 2026.
export const OVER_WEIGHT = [
  { label: "Share of orders", v: 1.44 },
  { label: "Share of gross basket value", v: 3.76 },
  { label: "Share of all support tickets", v: 3.62 },
];

// Where the slot capacity actually sits, August 2026.
export const CAPACITY_SHAPE = {
  totalSlotOrders: 5.83e6,
  systemFill: 15.9,
  deadZoneShare: 52.7,   // 10 AM to 6 PM
  deadZoneFill: 11,
  // What lifting each peak hour to the midday capacity of 9.4 would add,
  // at zero net capacity cost.
  lift: [
    { label: "6 AM", v: 16 },
    { label: "9 PM", v: 31 },
    { label: "10 PM", v: 38 },
    { label: "11 PM", v: 59 },
  ],
};

// The worst ten stores against their share of the problem.
export const WORST_STORE_SHARE = { volume: 2.7, lateOrders: 10.2, ownRate: 22.1 };

// Which of the experiment's four negatives survive a significance test.
export const EXPERIMENT_SIG = {
  "Scheduled orders": { z: 2.78, verdict: "real", note: "confounded by assignment" },
  "Delivered": { z: -2.03, verdict: "marginal" },
  "Cancelled": { z: 1.61, verdict: "noise" },
  "Orders per rider instance": { z: null, verdict: "real", note: "the headline" },
};

// ===========================================================================
// 5bb. GMV, AOV, AND WHAT IS ACTUALLY IN THE BASKET
// ===========================================================================
// Added to the report on 23 Sep 2026. This section answers the question the
// mean-against-median gap raised and could not close: the fat tail has a name,
// and it is large-ticket electronics. Uniform net scope (NZS, parent lineage,
// Cafe / Unlisted / Sample Box excluded, F&V at GSV), bridged
// order attribute -> shipment_domain_event_flink -> master_marketing_user_gppo.

// ordersMatched in lakhs, gmv in crore, aov in rupees. The bridge matches about
// 55% of scheduled orders, so absolute GMV is understated; AOV and the trend
// are sound. Every row reproduces: gmv / ordersMatched returns the stated AOV.
export const GMV_AOV = [
  { label: "Dec 25", ordersLakh: 4.85, gmvCr: 46.6, aov: 962 },
  { label: "Jan 26", ordersLakh: 6.49, gmvCr: 60.3, aov: 930 },
  { label: "Feb 26", ordersLakh: 8.07, gmvCr: 77.6, aov: 962 },
  { label: "Mar 26", ordersLakh: 6.86, gmvCr: 67.3, aov: 980 },
  { label: "Apr 26", ordersLakh: 7.22, gmvCr: 70.9, aov: 982 },
  { label: "May 26", ordersLakh: 10.11, gmvCr: 94.0, aov: 930 },
  { label: "Jun 26", ordersLakh: 9.18, gmvCr: 86.1, aov: 938 },
  { label: "Jul 26", ordersLakh: 8.68, gmvCr: 107.6, aov: 1240 },
  { label: "Aug 26", ordersLakh: 8.43, gmvCr: 118.2, aov: 1401 },
  { label: "Sep 26", ordersLakh: 5.40, gmvCr: 94.5, aov: 1748, partial: true },
];
export const GMV_TOTAL_CR = 823;

// The AOV jump is NOT bigger baskets. Items per order stayed at 5.4 to 6.3 all
// year with no break at July. Price per item is the whole story. The report
// gives Dec to Jun as a band and the last three months exactly, so that is how
// it is stored and how it is drawn.
export const BASKET_DECOMP = GMV_AOV.map((m) => {
  const late = { "Jul 26": 203, "Aug 26": 240, "Sep 26": 291 }[m.label];
  return {
    label: m.label,
    items: { lo: 5.4, hi: 6.3 },          // flat all year, no break at July
    pricePerItem: late ?? { lo: 147, hi: 176 },
    partial: m.partial,
  };
});

// Electronics & Appliances, the one category that did it. The report gives six
// checkpoint months. Price per item reproduces from gmv / items in every row.
export const ELECTRONICS = [
  { label: "Dec 25", gmvCr: 7.1, shareOfSdGmv: 14.7, items: 35616, ordersWithOne: 29475, pricePerItem: 1988 },
  { label: "Mar 26", gmvCr: 12.7, shareOfSdGmv: 18.4, items: 43978, ordersWithOne: 37185, pricePerItem: 2879 },
  { label: "Jun 26", gmvCr: 20.0, shareOfSdGmv: 21.3, items: 52851, ordersWithOne: 44469, pricePerItem: 3792 },
  { label: "Jul 26", gmvCr: 42.0, shareOfSdGmv: 37.3, items: 66490, ordersWithOne: 53619, pricePerItem: 6317, mark: "the inflection" },
  { label: "Aug 26", gmvCr: 48.5, shareOfSdGmv: 41.0, items: 56413, ordersWithOne: 42744, pricePerItem: 8589 },
  { label: "Sep 26", gmvCr: 51.3, shareOfSdGmv: 54.0, items: 47413, ordersWithOne: 32938, pricePerItem: 10810, partial: true },
];

// Appliance against grocery, August 2026. Classified with
// silver.oms.order_product_partitioned: 100% order coverage INCLUDING cancelled
// orders, unlike the GMV table which only holds delivered ones. Appliance = the
// order contains an Electronics & Appliances item. Counts reconcile exactly
// (delivered + cancelled + RTO = total for both groups) and the split covers
// 94.8% of August's verified scheduled orders.
export const APPLIANCE_AUG = {
  appliance: { orders: 109449, sharePct: 7.5, delivered: 61.1, cancelled: 34.4, rto: 4.5, within: 76.5, early: 9.9, late: 12.9, rating: 3.84, lowStar: 25.2, tickets: 165.9, aov: 11742, items: 3.57 },
  other: { orders: 1346652, delivered: 70.6, cancelled: 26.6, rto: 2.9, within: 80.8, early: 9.5, late: 9.2, rating: 4.00, lowStar: 20.5, tickets: 165.2, aov: 903, items: 5.97 },
};

export const APPLIANCE_VS_OTHER = [
  { label: "Cancelled", a: 34.4, b: 26.6, fmt: "pct" },
  { label: "Returned to origin", a: 4.5, b: 2.9, fmt: "pct" },
  { label: "Delivered", a: 61.1, b: 70.6, fmt: "pct" },
  { label: "Late, of delivered", a: 12.9, b: 9.2, fmt: "pct" },
  { label: "Average rating", a: 3.84, b: 4.00, fmt: "num2" },
  { label: "1 to 2 star share", a: 25.2, b: 20.5, fmt: "pct" },
  { label: "Support tickets per 1,000", a: 165.9, b: 165.2, fmt: "num1" },
  { label: "Average order value", a: 11742, b: 903, fmt: "inr" },
  { label: "Items per order", a: 3.57, b: 5.97, fmt: "num2" },
];

// Three months, same split. Each month covers about 95% of that month's
// verified scheduled orders, with cancellation rates within 0.3pp of verified.
export const APPLIANCE_MONTHLY = [
  { label: "Jun 26", apOrders: 102875, otOrders: 1462987, apDelivered: 65.8, otDelivered: 71.8, apCancelled: 30.6, otCancelled: 25.9, apRto: 3.6, otRto: 2.4 },
  { label: "Jul 26", apOrders: 128117, otOrders: 1372252, apDelivered: 62.7, otDelivered: 70.6, apCancelled: 33.1, otCancelled: 26.6, apRto: 4.2, otRto: 2.8 },
  { label: "Aug 26", apOrders: 109449, otOrders: 1346652, apDelivered: 61.1, otDelivered: 70.6, apCancelled: 34.4, otCancelled: 26.6, apRto: 4.5, otRto: 2.9 },
];

// July slot adherence, 1 to 7 July ONLY. The full month errored in Qri five
// times, and this week uses the DELIVERED status timestamp rather than
// arrived_timestamp, so the LEVELS are not comparable with the August table.
// The gap between the two groups is the only thing this supports.
export const APPLIANCE_JULY_WEEK = {
  caveat: "1 to 7 July only, on a different timestamp. Levels are not comparable with August; only the gap between the two groups is.",
  appliance: { delivered: 22560, within: 70.0, early: 6.2, late: 23.8 },
  other: { delivered: 304274, within: 78.1, early: 5.1, late: 16.8 },
};

// DERIVED: what the appliance channel costs when it fails. Applies each group's
// August order value to its own cancelled orders, which assumes a cancelled
// basket looks like a delivered one in that group.
export const APPLIANCE_CANCEL_VALUE = {
  applianceOrders: 37650,
  otherOrders: 358209,
  applianceCr: 44.2,
  otherCr: 32.3,
  totalCr: 76.5,
  applianceShareOfValue: 57.7,
  applianceShareOfOrders: 7.5,
  neverArrives: 38.9,            // cancelled plus returned to origin
  applianceShareOfBasketValue: 51.4,
};

// Three different August AOVs for scheduled delivery, from three scopes. None
// is wrong; they answer different questions, and the case study should never
// quote one without saying which.
export const AOV_SCOPES = [
  { label: "GMV bridge", v: 1401, note: "uniform net scope, matches about 55% of orders, delivered only" },
  { label: "Scheduled-against-instant table", v: 1452, note: "the figure quoted in section 5c" },
  { label: "Implied by the appliance split", v: 1718, note: "94.8% order coverage, includes cancelled orders" },
];

// A trap that applies to any future query on gold.product.shipment_fact.
export const SHIPMENT_FACT_TRAP =
  "gold.product.shipment_fact holds MULTIPLE ROWS PER ORDER (16,584 of 85,709 electronics orders in July). A query that counts shipment rows without deduplicating overstates delivered orders, and arrived_timestamp IS NOT NULL is the wrong delivered test: use delivered_timestamp IS NOT NULL AND cancelled_timestamp IS NULL.";
