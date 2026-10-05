// The remaining question set, and what the running call does to it.
//
// This is the closed loop made visible. An open-loop script has no plan state worth
// showing: it is a fixed list and it runs to the end. A closed loop EDITS its own
// remaining work as it hears things, so the plan is the one surface where "the agent
// listened" becomes a fact you can watch rather than a claim in a rail.
//
// Four statuses, and the last two are the argument:
//   todo    not asked yet
//   done    asked and answered
//   struck  removed, because the call learned it does not apply. The notice-period
//           question struck for a man with no current employer is the whole thesis in
//           one row: a question that was on the list, and should not have been.
//   added   promoted into the plan by a listener, not by the script author

export const PLAN_STEPS = [
  { key: "identity", label: "Confirm who is on the line" },
  { key: "consent", label: "Disclose, and ask if now suits" },
  { key: "experience", label: "Years of experience, last employer" },
  { key: "duties", label: "What the daily work was" },
  { key: "location", label: "Area they travel from" },
  { key: "shift", label: "Shift fit" },
  { key: "notice", label: "Notice period" },
  { key: "pay", label: "Current pay" },
  { key: "close", label: "Say what happens next" },
];

// nodeId -> what reaching it does to the plan.
const EFFECTS = {
  "open-greet": [{ key: "identity", status: "done" }],
  "open-disclose": [{ key: "consent", status: "done" }],
  "open-permission": [{ key: "consent", status: "done" }],

  "screen-q-experience": [{ key: "experience", status: "done" }],
  "screen-readback-experience": [{ key: "experience", status: "done" }],
  "screen-q-work": [{ key: "duties", status: "done" }],
  "screen-q-location": [{ key: "location", status: "done" }],
  "screen-q-shift": [{ key: "shift", status: "done" }],
  "screen-q-notice": [{ key: "notice", status: "done" }],
  "screen-q-pay": [{ key: "pay", status: "done" }],

  // The old path asks it anyway. Left as done, not struck, because that is precisely
  // what the open loop did: it completed the step and learned nothing.
  "listen-old-carryon": [{ key: "notice", status: "done" }],

  // The fix. The intent listener rewrites the remaining plan: a question that no
  // longer applies is struck, and the one that now matters is promoted in.
  "listen-fix-adapt": [
    {
      key: "notice",
      status: "struck",
      why: "he has no current employer, so there is nothing to give notice to",
    },
    {
      key: "availability",
      label: "When could you start",
      status: "added",
      why: "promoted by the intent listener, it was not in the script",
    },
  ],

  "close-advance": [{ key: "close", status: "done" }],
  "close-advance-reschedule": [{ key: "close", status: "done" }],
  "close-nofit": [{ key: "close", status: "done" }],
  "close-nofit-why": [{ key: "close", status: "done" }],
  "close-final-promise": [{ key: "close", status: "done" }],
  "close-callback": [{ key: "close", status: "done" }],
};

export function planEffects(nodeId) {
  return EFFECTS[nodeId] || [];
}
