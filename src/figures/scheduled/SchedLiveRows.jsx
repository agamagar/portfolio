import ScreenStrip from "./ScreenStrip";

// Live coded screens from the playground, each in the shared PhoneFrame, in the one phone row (ScreenStrip): the eight designed
// states of the slot picker as eight phones, and the exchange-and-return flow as one phone. (Agam, 27 Oct: "separate and put in
// a phone frame the standardised way".)
const SP = "flow-schedule-slot-picker-m4";
const STATES = [
  ["S-001", "Scheduling for today"], ["S-002", "Getting it now with Instant delivery"], ["S-003", "Instant delivery is busy right now"],
  ["S-004", "Scheduling is not available right now"], ["S-005", "Morning: the earlier slots have passed"], ["S-006", "All evening and night slots shown"],
  ["S-007", "A slot after midnight is picked"], ["S-008", "Looking at tomorrow's slots"],
];
export function SchedStatesRow() {
  return <ScreenStrip label="The eight designed states of the slot picker, scroll sideways" tiles={STATES.map(([c, cap]) => ({ key: c, live: { pg: SP, case: c }, cap, alt: cap }))} />;
}
export function SchedReturnsFlow() {
  return <ScreenStrip label="Exchange and return in one request, running" tiles={[{ key: "se", live: { pg: "flow-returns-scheduled-exchange-return", case: "SE-007" }, cap: "Exchange and return in one request. Tap through the cases to follow the flow.", alt: "Exchange and return in one request, running" }]} />;
}
