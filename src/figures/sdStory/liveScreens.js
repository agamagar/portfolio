// One source for every screen on the Scheduled Delivery case study: the coded prototype (the playground bundle).
// A still's file name maps to the flow and case that draws the same screen (or the nearest coded state), and the
// shared PhoneFrame mounts that live screen in place of the still. Add a row here, not a second still.
const SP = "flow-schedule-slot-picker-m4";
const SAME = (pg, c) => ({ pg, case: c });
export const LIVE_SCREENS = {
  // the slot page (S-001..S-016)
  "sched-pg-noslot": SAME(SP, "S-001"), "sched-pg-default": SAME(SP, "S-001"), "sched-pg-picked": SAME(SP, "S-007"),
  "sched-pg-overview": SAME(SP, "S-002"), "sched-pg-partial": SAME(SP, "S-005"), "sched-pg-crossday": SAME(SP, "S-010"),
  "sched-pg-full": SAME(SP, "S-008"), "in-motion-screen": SAME(SP, "S-001"),
  "sched-today-all": SAME(SP, "S-015"), "sched-tomorrow-more": SAME(SP, "S-013"), "sched-tomorrow-all": SAME(SP, "S-014"),
  "sched-pg-otp": SAME("flow-returns-otp-pickup-handover", "OT-001"),
  // the cart and the touchpoints
  "sched-home-strip": SAME("flow-cart-touchpoints-orders-home-pdp", "C-044"),
  pdp: SAME("flow-cart-touchpoints-orders-home-pdp", "C-038"),
  "cart-hubs": SAME("flow-cart-cart-composition-ds-ss", "C-048"),
  "sched-stuck-cart": SAME("flow-schedule-cart-cases-m1-dev-ready", "S-072"),
  "dir-sheet": SAME("flow-schedule-delivery-options-bottomsheet", "S-095"), "sched-dir-tabbed": SAME("flow-schedule-delivery-options-bottomsheet", "S-091"),
  // explored directions
  "slot-a": SAME("flow-schedule-collapsed-card-slot-summary", "S-044"), "slot-b": SAME("flow-schedule-collapsed-card-slot-summary", "S-045"),
  "slot-c": SAME("flow-schedule-collapsed-card-slot-summary", "S-046"), "slot-d": SAME("flow-schedule-collapsed-card-slot-summary", "S-047"),
  "slot-e": SAME("flow-schedule-collapsed-card-slot-summary", "S-048"),
  ut01: SAME("flow-schedule-ut-prototypes", "S-098"), ut02: SAME("flow-schedule-ut-prototypes", "S-102"), ut03: SAME("flow-schedule-ut-prototypes", "S-104"),
  "off-m4": SAME(SP, "S-003"), "off-backsoon": SAME("flow-schedule-instant-unavailable-treatments", "S-033"),
  "off-tag": SAME("flow-schedule-instant-unavailable-treatments", "S-034"), "off-gotyou": SAME("flow-schedule-instant-unavailable-treatments", "S-035"),
  "off-updown": SAME("flow-schedule-instant-unavailable-treatments", "S-037"), "off-nowlater": SAME("flow-schedule-instant-unavailable-treatments", "S-039"),
  "gtm-coach62": SAME("flow-schedule-cart-entry-coachmark", "S-058"), "gtm-coach66": SAME("flow-schedule-cart-entry-coachmark", "S-059"),
  "gtm-coach61": SAME("flow-schedule-cart-entry-coachmark", "S-057"), "gtm-trust": SAME("flow-schedule-intro-banner-and-assets", "S-055"),
};
const base = (src) => String(src || "").split("?")[0].split("/").pop().replace(/\.(png|webp|jpg)$/, "");
export const liveFor = (src) => LIVE_SCREENS[base(src)] || null;
